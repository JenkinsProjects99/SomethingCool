# Ashland Calendar (Visit AKY) — v0

Installable Visit AKY phone PWA (Next.js, not React Native) plus a secondary iframe widget for [visitaky.com](https://visitaky.com). Design 96.

Centered Visit AKY logo, Open Sans 800 titles, Glacial Indifference body, source as a subheading (not a chip), `.st-primary` `#326DCD`, `.st-secondary` 2px.

## What ships in v0

- PostgreSQL schema with tenant-scoped events
- Installable PWA at `/` (full-bleed photo cards, This weekend / Music / Sports / Family)
- Secondary iframe at `/embed`
- Reloadable seed: official rows now (including Poage Landing Days and specified Sandy’s nights); target 225. `image` is null until Sean has photos. Library rows and remaining kickoffs are not invented.
- Installable phone PWA at `/`
- Secondary iframe calendar at `/embed`
- Single-event embed at `/embed/{slug}`
- `GET /v1/ashland-ky/events` with Bearer auth
- Public nine fields plus additive `image`
- Never auto-publish
- Structured JSON logs and `x-request-id`
- WCAG 2.2 AA token pairing
- CI: lint, typecheck, tests (including tenant isolation)

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Open the phone app at [http://localhost:3000](http://localhost:3000). Secondary widget: [http://localhost:3000/embed](http://localhost:3000/embed).

## Partner API

```bash
curl -s -H "Authorization: Bearer dev-ashland-ky-local-token" \
  "http://localhost:3000/v1/ashland-ky/events?from=2026-09-01&to=2026-10-01"
```

`from` and `to` are the frozen window (`from` inclusive, `to` exclusive; `YYYY-MM-DD` or an offset datetime). Additive `range` (`month` | `week` | `upcoming` | `all`) may be used when `from`/`to` are omitted. Drafts never appear.

The example token is a local placeholder. Rotate it before any shared host. A token for another tenant receives `403` even if the URL says `ashland-ky`.

## Iframe

```html
<iframe
  src="https://YOUR_HOST/embed"
  title="Visit AKY What's Happening"
  width="360"
  height="840"
  style="border:0"
></iframe>
```

Single listing:

```html
<iframe
  src="https://YOUR_HOST/embed/deana-carter"
  title="Deana Carter — Visit AKY"
  width="360"
  height="520"
  style="border:0"
></iframe>
```

## Docs

- [Architecture](docs/architecture.md)
- [Seed import how-to](docs/seed-import.md)
- [Visit AKY tokens](docs/visit-aky-tokens.md)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, including tenant isolation and never-auto-publish |
| `npm run seed` | First import (upsert on `id`) |
| `npm run seed:reload` | Upsert content, preserve status |

## Product rules

- Source is a subheading, not a pill. Purple and mint are hover / themed outlines only.
- Playlist script stays in the logo file, not as a widget type.
- Events do not auto-publish.
- **This month** rolls forward when the current month has no remaining upcoming events, so a late-August visit still shows September.
