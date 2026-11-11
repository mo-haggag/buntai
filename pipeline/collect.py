"""Collect an author's writing from a blog, a feed, or a list of article URLs.

Usage:
  python pipeline/collect.py --voice garry --source https://blog.garrytan.com
  python pipeline/collect.py --voice someone --urls urls.txt
  python pipeline/collect.py --voice me --files data/corpus/me/uploads

Writes data/corpus/<voice>/posts.jsonl: one {"url", "title", "date", "text"} per post.
The corpus is the author's copyrighted text, so data/corpus/ is git-ignored.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin, urlparse

UA = "Mozilla/5.0 (ownvoice corpus collector)"
ROOT = Path(__file__).resolve().parent.parent


def fetch(url: str, timeout: int = 30) -> str:
    """The page as text, decoded with the charset the server or the page declares (old sites are Windows-1252)."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        charset = r.headers.get_content_charset()
    if not charset:
        m = re.search(rb'(?i)<meta[^>]+charset=["\']?\s*([a-z0-9_-]+)', raw[:4096])
        charset = m.group(1).decode() if m else None
    for enc in ([charset] if charset else []) + ["utf-8", "cp1252"]:
        try:
            return raw.decode(enc)
        except (UnicodeDecodeError, LookupError):
            continue
    return raw.decode("utf-8", errors="replace")


def strip_tags(fragment: str) -> str:
    """HTML fragment to plain text with paragraph breaks kept."""
    s = re.sub(r"(?s)<!--.*?-->", "", fragment)
    s = re.sub(r"(?is)<(script|style|figure|iframe|noscript).*?</\1>", "", s)
    s = re.sub(r"(?i)<br\s*/?>", "\n", s)
    s = re.sub(r"(?i)</(p|div|h[1-6]|li|blockquote|tr)>", "\n\n", s)
    s = re.sub(r"(?i)<li[^>]*>", "- ", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n\s*(\n\s*)+", "\n\n", s)
    # Hard-wrapped lines inside a paragraph (old HTML, text files) become one line; list items keep theirs.
    return "\n\n".join(re.sub(r"[ \t]*\n[ \t]*(?![-*\d])", " ", p.strip()) for p in s.split("\n\n") if p.strip())


def div_by_class(page: str, cls: str) -> str | None:
    """Inner HTML of the first <div> whose class list contains cls, balancing nested divs."""
    m = re.search(r'<div[^>]*class="[^"]*\b%s\b[^"]*"[^>]*>' % re.escape(cls), page)
    if not m:
        return None
    depth, i = 1, m.end()
    for t in re.finditer(r"(?i)<(/?)div\b", page[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return page[i : i + t.start()]
    return page[i:]


def extract_post(page: str) -> dict:
    title = re.search(r"(?is)<title[^>]*>(.*?)</title>", page)
    title = html.unescape(title.group(1)).strip() if title else ""
    body = div_by_class(page, "posthaven-post-body")
    if body is None:
        art = re.search(r"(?is)<article[^>]*>(.*?)</article>", page)
        body = art.group(1) if art else ""
    if not body:
        # Fallback: the densest run of <p> paragraphs on the page.
        paras = re.findall(r"(?is)<p[^>]*>(.*?)</p>", page)
        body = "".join("<p>%s</p>" % p for p in paras if len(strip_tags(p)) > 60)
    date = re.search(r'(?is)<time[^>]*datetime="([^"]+)"', page) or re.search(
        r'(?is)class="posthaven-formatted-date"[^>]*data-unix-time="(\d+)"', page
    )
    text = strip_tags(body)
    if len(text.split()) < 80:  # old-style pages with <br> breaks and no <p>: take the whole body
        m = re.search(r"(?is)<body[^>]*>(.*?)</body>", page)
        text = strip_tags(m.group(1) if m else page)
    paras = text.split("\n\n")
    while paras and len(paras[0].split()) < 12:  # subtitles, bylines, dates, share counts above the first sentence
        paras.pop(0)
    while paras and len(paras[-1].split()) < 8:  # translation links, "Related:", share buttons below the last sentence
        paras.pop()
    return {"title": title, "date": date.group(1) if date else "", "text": "\n\n".join(paras)}


def post_links(page: str, base: str) -> list[str]:
    """Same-host, single-segment links, on the base URL's scheme (so http and https links are one post)."""
    b = urlparse(base)
    out = []
    for href in re.findall(r'href="([^"#?]+)"', page):
        p = urlparse(urljoin(base, href))
        path = p.path.strip("/")
        if p.netloc == b.netloc and path and "/" not in path and not re.search(r"\.(atom|rss|xml|css|js|png|jpg)$", path):
            out.append(p._replace(scheme=b.scheme).geturl().rstrip("/"))
    return out


def crawl_paginated(base: str, max_pages: int = 300) -> list[str]:
    """Blog index pages ?page=1..N until a page adds no new post links."""
    seen: dict[str, None] = {}
    nav = set(post_links(fetch(base + "/?page=99999"), base))  # links present on an empty page = navigation
    for n in range(1, max_pages + 1):
        links = [u for u in post_links(fetch("%s/?page=%d" % (base, n)), base) if u not in nav]
        new = [u for u in links if u not in seen]
        if not new:
            break
        for u in new:
            seen[u] = None
        print("page %d: %d posts so far" % (n, len(seen)), file=sys.stderr)
    return list(seen)


NOT_POSTS = re.compile(r"(?i)/(tag|tags|category|categories|author|authors|page|feed|search|archive|about|"
                       r"privacy|terms|subscribe|comments|podcast|recommendations|leaderboard|people|wp-content)(/|$)")


def crawl_sitemap(base: str, limit: int = 2000) -> list[str]:
    """Post URLs from the site's sitemap (Substack, WordPress, Ghost and most static generators)."""
    host = urlparse(base).netloc
    queue = [base + p for p in ("/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml")]
    seen_maps: set[str] = set()
    urls: dict[str, None] = {}
    while queue and len(urls) < limit:
        sm = queue.pop(0)
        if sm in seen_maps:
            continue
        seen_maps.add(sm)
        try:
            xml = fetch(sm)
        except Exception:
            continue
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
            loc = html.unescape(loc)
            if re.search(r"(?i)sitemap[^/]*\.xml", loc):
                if not any(k in loc.lower() for k in ("tag", "categor", "author", "page")):
                    queue.append(loc)
                continue
            p = urlparse(loc)
            if p.netloc.replace("www.", "") == host.replace("www.", "") and p.path.strip("/") and not NOT_POSTS.search(p.path):
                urls[loc.rstrip("/")] = None
        print("sitemap %s: %d posts so far" % (sm, len(urls)), file=sys.stderr)
    return list(urls)[:limit]


def crawl_feed(base: str) -> list[str]:
    """Item links from an RSS or Atom feed: usually only the newest 10 to 50 posts."""
    for path in ("/feed", "/rss", "/posts.atom", "/atom.xml", "/rss.xml", "/feed.xml", "/index.xml"):
        try:
            xml = fetch(base + path)
        except Exception:
            continue
        links = re.findall(r"<item>.*?<link>\s*([^<\s]+)\s*</link>", xml, re.S)
        links += re.findall(r'<entry>.*?<link[^>]*href="([^"]+)"', xml, re.S)
        if links:
            return list(dict.fromkeys(html.unescape(l).rstrip("/") for l in links))
    return []


def discover(base: str) -> list[str]:
    """Index pages first; a sitemap when the blog has no ?page=N index; a feed as the last resort."""
    try:
        found = crawl_paginated(base)
    except Exception as e:
        print("no ?page=N index: %s" % e, file=sys.stderr)
        found = []
    if len(found) >= 20:
        return found
    for fn in (crawl_sitemap, crawl_feed):
        more = fn(base)
        if len(more) > len(found):
            found = more
        if len(found) >= 20:
            break
    return found


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--source", help="blog base URL with ?page=N index pages")
    ap.add_argument("--urls", help="file with one article URL per line")
    ap.add_argument("--files", help="folder of the author's own files: .txt, .md, .docx (one post per file)")
    ap.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()

    if a.files:
        posts = read_files(Path(a.files))
        write_corpus(a.voice, posts)
        return
    if a.urls:
        urls = [l.strip() for l in open(a.urls) if l.strip()]
    else:
        urls = discover(a.source.rstrip("/"))
    print("found %d candidate posts" % len(urls), file=sys.stderr)

    def one(u: str) -> dict | None:
        try:
            post = extract_post(fetch(u))
            post["url"] = u
            return post if len(post["text"].split()) >= 80 else None
        except Exception as e:  # one bad page must not stop the crawl
            print("skip %s: %s" % (u, e), file=sys.stderr)
            return None

    with ThreadPoolExecutor(a.workers) as ex:
        posts = [p for p in ex.map(one, urls) if p]
    write_corpus(a.voice, posts)


def docx_text(path: Path) -> str:
    """Paragraph text of a .docx without a library: it is a zip holding word/document.xml."""
    import zipfile
    xml = zipfile.ZipFile(path).read("word/document.xml").decode("utf-8", errors="replace")
    paras = re.findall(r"(?s)<w:p[ >].*?</w:p>", xml)
    out = []
    for para in paras:
        t = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", para))
        if t.strip():
            out.append(html.unescape(t.strip()))
    return "\n\n".join(out)


def read_files(folder: Path) -> list[dict]:
    """One post per .txt, .md or .docx file; a file with # headings becomes one post per heading."""
    posts = []
    for f in sorted(folder.rglob("*")):
        if not f.is_file():
            continue
        ext = f.suffix.lower()
        if ext == ".docx":
            text = docx_text(f)
        elif ext in (".txt", ".md", ".markdown"):
            text = f.read_text(encoding="utf-8", errors="replace")
        else:
            print("skip %s: unsupported type" % f.name, file=sys.stderr)
            continue
        text = text.replace("\r\n", "\n")
        # Pieces split at # headings (markdown) or at a line of --- (pasted text, any type).
        sections = re.split(r"(?m)^#{1,2} +", text) if ext in (".md", ".markdown") else [text]
        sections = [part for sec in sections for part in re.split(r"(?m)^\s*-{3,}\s*$", sec)]
        for i, sec in enumerate(sections):
            body = re.sub(r"\n{3,}", "\n\n", sec.strip())
            if len(body.split()) < 80:
                continue
            title = body.split("\n", 1)[0][:120] if i or len(sections) > 1 else f.stem
            posts.append({"title": title, "date": "", "text": body, "url": "file:%s#%d" % (f.name, i)})
    return posts


def write_corpus(voice: str, posts: list[dict]) -> None:
    out = ROOT / "data" / "corpus" / voice
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "posts.jsonl", "w") as f:
        for p in posts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    words = sum(len(p["text"].split()) for p in posts)
    print(json.dumps({"voice": voice, "posts": len(posts), "words": words, "path": str(out / "posts.jsonl")}))


if __name__ == "__main__":
    main()
