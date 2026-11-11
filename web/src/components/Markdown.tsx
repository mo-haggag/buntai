import type { ReactNode } from "react";
import { cx } from "./ui";

/** Model output as a document: headings, paragraphs, lists, quotes, code, bold, italic. No HTML is interpreted. */
export function Markdown({ text, caret, className }: { text: string; caret?: boolean; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={cx("space-y-3 text-[15px] leading-relaxed", className)}>
      {blocks.map((b, i) => {
        const last = caret && i === blocks.length - 1;
        switch (b.kind) {
          case "h":
            return b.level === 1 ? (
              <h1 key={i} className="pt-1 text-2xl font-semibold tracking-tight">{inline(b.text)}</h1>
            ) : b.level === 2 ? (
              <h2 key={i} className="pt-1 text-xl font-semibold tracking-tight">{inline(b.text)}</h2>
            ) : (
              <h3 key={i} className="pt-1 font-semibold">{inline(b.text)}</h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1 pl-6">
                {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ol>
            );
          case "quote":
            return <blockquote key={i} className="border-l-2 border-line-strong pl-4 text-ink-2">{inline(b.text)}</blockquote>;
          case "code":
            return <pre key={i} className="overflow-auto rounded-(--radius-control) bg-sunken px-3 py-2 font-mono text-[13px]">{b.text}</pre>;
          case "hr":
            return <hr key={i} className="border-line" />;
          default:
            return <p key={i} className={cx("whitespace-pre-line", last && "caret")}>{inline(b.text)}</p>;
        }
      })}
    </div>
  );
}

type Block =
  | { kind: "p" | "quote" | "code"; text: string }
  | { kind: "h"; level: number; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "hr" };

function parse(text: string): Block[] {
  const out: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push({ kind: "code", text: buf.join("\n") });
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      out.push({ kind: "h", level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push({ kind: "hr" });
      i++;
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""));
      out.push({ kind: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      out.push({ kind: "ol", items });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push({ kind: "quote", text: buf.join("\n") });
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>\s?|\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(lines[i])) buf.push(lines[i++]);
    out.push({ kind: "p", text: buf.join("\n") });
  }
  return out;
}

/** Bold, italic and inline code. Everything else is literal text. */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const s = m[0];
    if (s.startsWith("**") || s.startsWith("__")) parts.push(<strong key={k++}>{s.slice(2, -2)}</strong>);
    else if (s.startsWith("`")) parts.push(<code key={k++} className="rounded bg-sunken px-1 font-mono text-[13px]">{s.slice(1, -1)}</code>);
    else parts.push(<em key={k++}>{s.slice(1, -1)}</em>);
    last = m.index + s.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
