# Design system

Everything visual comes from `src/index.css` (tokens) and `src/components/ui.tsx` (primitives). Screens compose those; they do not pick raw colours.

## Tokens (`src/index.css`)

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `page`, `surface`, `sunken`, `line`, `line-strong` | page background, cards, inset panels, borders |
| Ink | `ink`, `ink-2`, `ink-3` | text: primary, secondary, muted |
| Accent | `accent`, `accent-hover`, `accent-soft` | the one interactive colour: primary buttons, active nav, progress |
| Series | `stock`, `tuned`, `frontier` | the three writers everywhere they appear: base model grey, trained style blue, GPT-5.5 violet |
| Status | `good`, `good-soft`, `bad`, `bad-soft` | results and errors |
| Shape | `--radius-card` (12px), `--radius-control` (8px) | cards and panels; buttons, inputs, chips |
| Layout | `--rail-width` (232px) | the side menu |

Every token has a light and a dark value; the `dark` class on `<html>` switches them. Colours are neutral greys plus full-strength hues, never tinted greys.

## Type

System font stack. Sizes used: 12px (`text-xs`) for labels and metadata, 14px (`text-sm`) for controls and body in dense views, 15px for model output, 20px (`text-xl`) for page titles, 48px (`text-5xl`) for the one number a panel is about. Numbers use `tabular-nums`.

## Primitives (`src/components/ui.tsx`)

`Button` (primary, secondary, ghost), `Card`, `Panel` (inset block inside a card), `PageHeader`, `Tabs`, `Stat` (label, value, sub), `Dot` (series marker), `StageBadge`, `ProgressBar`, `Progress`, `Paragraphs` (model text as paragraphs), `Markdown` (model text as a document: headings, lists, quotes, code, bold, italic; no HTML), `EmptyState`, `ErrorNote`, `Toggle`, `Select`, `inputClass`, `textareaClass`.

## Shell

A side rail: the logo (the way back to Start), one primary button (New style), then three groups of places: Use (Write), Train (Styles, Benchmark), System (Activity, Machine). Actions are buttons; places are rows; nothing else goes in the rail. While anything runs, a live line at the foot names it and links to Activity. Start asks what you want to do; it is the only screen with no nav group. Use screens show one output and no numbers. Train screens show comparisons, numbers and the machine. Nothing from one group appears in the other.

## Iconography

One family (lucide), one stroke weight. Sizes: 16 px (`size-4`) in the rail, buttons and labels; 20 px (`size-5`) on Start cards; 12 px (`size-3`) inside badges. One concept has one icon wherever it appears, and no two concepts share a silhouette class.

| Concept | Icon | Where |
|---|---|---|
| Brand | `Feather` | the logo only |
| Write (use a style) | `SquarePen` | rail, Start, "Write with it", the Write button |
| A style (a person's hand), and making one | `Signature` | rail, the New style button, Start, lists |
| Activity, something running | `Activity` | rail, the live line at the foot of the rail |
| Benchmark, judging | `Scale` | rail, Compare button |
| Machine, GPU | `Cpu` | rail, Start, GPU panel |
| Collect, download | `Download` | pipeline step, model downloads |
| Build pairs | `Layers` | pipeline step |
| Train | `Dumbbell` | pipeline step; Retrain and Continue add `RefreshCw` / `Play` |
| Evaluate | `Gauge` | pipeline step |
| The author's words | `Quote` | real passages |
| Blind test | `EyeOff` | Evaluation |
| Writing as material | `FileText`, `FilePlus2`, `Upload`, `ClipboardPaste`, `Globe` | sources, Add writing |
| Edit text | `TextCursor` | the draft toolbar (never a pen: pens mean Write) |
| Copy, Again, Stop, Done | `Copy`, `RotateCcw`, `Square`, `Check` | the draft toolbar |
| Disk, base models | `HardDrive`, `Package` | Machine |
| Delete | `Trash2` | a style, a run |
| State | `Check`, `CircleAlert`, `LoaderCircle` | badges and steps |

## Rules

- One accent. Series colours mark writers only, never decoration.
- The trained style is always the blue series, the base model always grey, the frontier model always violet, in every chart, column and legend.
- Labels name the thing in 2 to 4 words. No explainer prose in tooltips. No em dashes.
- A panel leads with one big number and one line saying how to read it.
- Dark theme is the same layout with the dark token values; nothing is restyled by hand.
