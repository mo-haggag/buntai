import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ClipboardPaste, FileText, Globe, Upload, X } from "lucide-react";
import { api } from "../api";
import type { Voice } from "../api";
import { Button, Card, PageHeader, cx, fmtInt, inputClass, textareaClass } from "./ui";

type Source = "url" | "files" | "text";

const SOURCES: { key: Source; label: string; icon: typeof Globe }[] = [
  { key: "url", label: "Blog URL", icon: Globe },
  { key: "files", label: "Upload files", icon: Upload },
  { key: "text", label: "Paste text", icon: ClipboardPaste },
];

const ACCEPT = ".txt,.md,.markdown,.docx";

function addTarget(): string {
  const q = window.location.hash.split("?")[1];
  return new URLSearchParams(q ?? "").get("add") ?? "";
}

export function NewStyle({ onCreated, voices }: { onCreated: (id: string) => void; voices: Voice[] }) {
  const addId = addTarget();
  const adding = voices.find((v) => v.id === addId);
  const [name, setName] = useState("");
  const [source, setSource] = useState<Source>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const words = source === "text" ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const ready =
    (adding || name.trim()) && (source === "url" ? url.trim() : source === "files" ? files.length > 0 : words >= 300);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      let u = url.trim();
      if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
      const input = {
        source: source === "url" ? u : undefined,
        text: source === "text" ? text : undefined,
        files: source === "files" ? files : undefined,
      };
      const { id } = adding ? await api.addWriting(adding.id, input) : await api.createVoice({ name: name.trim(), ...input });
      onCreated(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (/\.(txt|md|markdown|docx)$/i.test(f.name) && !next.some((x) => x.name === f.name)) next.push(f);
    }
    setFiles(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={adding ? `Add writing to ${adding.name}` : "New style"}
        sub={adding ? "The new writing joins what is already collected, then the style trains again." : "Collect, build pairs, train and evaluate run on their own once you start."}
      />

      <form onSubmit={submit} className="space-y-6">
        <Card className="space-y-5 p-5">
          {!adding && (
            <label className="block max-w-sm space-y-1.5">
              <span className="text-sm font-medium text-ink-2">Whose style</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Garry Tan" autoFocus />
            </label>
          )}

          <div className="space-y-3">
            <span className="text-sm font-medium text-ink-2">Their writing</span>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSource(s.key)}
                  className={cx(
                    "inline-flex h-9 items-center gap-2 rounded-(--radius-control) border px-3 text-sm font-medium transition-colors",
                    source === s.key
                      ? "border-accent bg-accent-soft text-accent dark:text-accent-hover"
                      : "border-line-strong text-ink-2 hover:bg-sunken hover:text-ink",
                  )}
                >
                  <s.icon className="size-4" aria-hidden />
                  {s.label}
                </button>
              ))}
            </div>

            {source === "url" && (
              <div className="space-y-1.5">
                <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://blog.garrytan.com" inputMode="url" />
                <div className="text-xs text-ink-3">Posthaven, Substack, WordPress and Ghost blogs, or any site with a sitemap or feed.</div>
              </div>
            )}

            {source === "files" && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInput.current?.click()}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-(--radius-control) border border-dashed border-line-strong px-6 py-10 text-center hover:bg-sunken"
                >
                  <Upload className="size-5 text-ink-3" aria-hidden />
                  <div className="text-sm font-medium">Drop files or click to choose</div>
                  <div className="text-xs text-ink-3">.txt, .md, .docx. Essays, posts, newsletters, long emails.</div>
                  <input ref={fileInput} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />
                </div>
                {files.length > 0 && (
                  <ul className="divide-y divide-line rounded-(--radius-control) border border-line">
                    {files.map((f) => (
                      <li key={f.name} className="flex items-center gap-2 px-3 py-2 text-sm">
                        <FileText className="size-4 shrink-0 text-ink-3" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{f.name}</span>
                        <span className="text-xs text-ink-3 tabular-nums">{Math.round(f.size / 1024)} KB</span>
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((x) => x !== f))}
                          className="rounded-md p-1 text-ink-3 hover:bg-sunken hover:text-ink"
                          title="Remove"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {source === "text" && (
              <div className="space-y-1.5">
                <textarea className={textareaClass} rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste essays, posts or newsletters. Separate pieces with a line of ---" />
                <div className="flex justify-between text-xs text-ink-3 tabular-nums">
                  <span>{fmtInt(words)} words</span>
                  <span>{words < 300 ? "At least 300 words to start" : ""}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5 text-sm text-ink-2">
          <div className="font-medium text-ink">How much writing it needs</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>20,000 words or more gives a clear result. 5,000 works, with a weaker shift.</li>
            <li>Interviews and transcripts are dropped automatically. You can exclude any post on the Data tab and rebuild.</li>
            <li>Held-out perplexity on the Evaluation tab shows whether the data was enough: a large drop means the model picked up the style.</li>
          </ul>
        </Card>

        {error && <div className="text-sm text-bad">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => (window.location.hash = "#/styles")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!ready || busy}>
            {busy ? "Starting" : adding ? "Add and train" : "Start"}
          </Button>
        </div>
      </form>
    </div>
  );
}
