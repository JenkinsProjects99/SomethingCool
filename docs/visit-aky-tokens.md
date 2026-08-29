# Visit AKY tokens (Design 96)

Mapped from the Ashland look board and the live Showit site (visitaky.com). Playlist script stays in the logo file; it is not a widget type.

## Logo

Centered Visit AKY wordmark.

- Production asset: `https://static.showit.co/1200/lFmCSzFnLr0jvxt4w-SqjQ/327307/visit.png`
- Vendored copy: `public/brand/visit-aky-logo.png`

## Typography

| Token | Face | Weight | Size | Transform | Tracking | Color |
| --- | --- | --- | --- | --- | --- | --- |
| `.st-d-title` | Open Sans | 800 | 54px | uppercase | 0.025em | `#000000` |
| `.st-d-paragraph` | Glacial Indifference | Regular | 16px | none | 0.05em | `#000000` |
| `.st-d-subheading` | Glacial Indifference | Bold | 14px | uppercase | 0.1em | `#000000` |
| `.sie-header-text` | Open Sans | 600 | 13px | uppercase | 0.1em | `#000000`, hover `#7B5BBB` |

Open Sans is loaded from `next/font/google`. Glacial Indifference Regular and Bold are self-hosted (`public/fonts`, SIL OFL).

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `.st-primary` | `#326DCD` | Solid buttons, active filters, text links |
| `.st-secondary` | `2px solid #326DCD` | Outline buttons, inactive filters |
| Primary label | `#F5F5F5` | Text on solid primary |
| Nav hover | `#7B5BBB` | Hover on nav / buttons / links |
| Themed outline | `#7AD68D` | Site mint. Outline only — never source chips, never body text |
| Paper | `#FFFFFF` | Page background |

Source is a `.st-d-subheading`. It is not a pill and does not use purple or mint fills.

## Buttons

Solid primary: `#326DCD` fill, `#F5F5F5` label, `10px 14px` padding, 14px uppercase, 0.1em tracking. Secondary uses a 2px `#326DCD` border and transparent fill.

## WCAG 2.2 AA

Documented pairings used in the widget:

| Foreground | Background | Role | AA normal text (4.5:1) |
| --- | --- | --- | --- |
| `#326DCD` | `#FFFFFF` | Links, outline button label | Pass |
| `#F5F5F5` | `#326DCD` | Primary button label | Pass |
| `#000000` | `#FFFFFF` | Titles and body | Pass |
| `#7B5BBB` | `#FFFFFF` | Hover text | Pass |
| `#7AD68D` | `#FFFFFF` | Mint | Fail — outline only |

Focus uses a 3px `#326DCD` ring. Controls are at least 24×24 CSS pixels (2.5.8) and most actions are 44px tall. Skip link, landmarks, `lang`, and `time datetime` are in the markup.

## Layouts

- Phone PWA (`/`): centered logo, “What's happening”, thumb filters This weekend / Music / Sports / Family, full-bleed photo cards with title/time overlay (Visit AKY placeholder while `image` is null). Source is a subheading, not a chip.
- Embed (360px, secondary): centered logo, Upcoming / All, stacked cards (first solid, second outline), compact rows with Go.
- Embed event: `/embed/{slug}` repeats the card for a partner iframe.
