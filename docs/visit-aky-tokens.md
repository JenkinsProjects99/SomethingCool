# Visit AKY tokens (Design 96)

Mapped from the Ashland look board and the live Showit site (visitaky.com). Playlist script stays in the logo file; it is not a widget type.

## Logo

Centered Visit AKY wordmark.

- Production asset: `https://static.showit.co/1200/IFmCSzFnLr0jvxt4w-SqjQ/327307/visit.png`
- Vendored copy: `public/brand/visit-aky-logo.png`
- Client-only photo-card fallback when `image` is null: `public/brand/visit-aky-logo.png` (never written into the seed)

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

- Phone PWA (`/`): centered logo, TODAY / WEEKEND / WEEK / CAL tabs, ALL / MUSIC / SPORTS / COMMUNITY underlines (full COMMUNITY at 390px). FEATURED is a 2-up photo grid above date-first 2-up time lists. Cards are photo, then time, title, venue, and a full-width Event Details button (official image, or the Visit AKY logo when `image` is null). Source stays a `.st-d-subheading` in the markup, not a visible fill. Calendar days use a blue dot; the selected-day agenda repeats Event Details.
- Embed (360px, secondary): centered logo, Upcoming / All, stacked cards (first solid, second outline), compact rows with Go.
- Embed event: `/embed/{slug}` repeats the card for a partner iframe.
