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

A side rail with two groups, Use (Write) and Train (Styles, New style, Benchmark, Machine). Use screens show one output and no numbers. Train screens show comparisons, numbers and the machine. Nothing from one group appears in the other.

## Rules

- One accent. Series colours mark writers only, never decoration.
- The trained style is always the blue series, the base model always grey, the frontier model always violet, in every chart, column and legend.
- Labels name the thing in 2 to 4 words. No explainer prose in tooltips. No em dashes.
- A panel leads with one big number and one line saying how to read it.
- Dark theme is the same layout with the dark token values; nothing is restyled by hand.
