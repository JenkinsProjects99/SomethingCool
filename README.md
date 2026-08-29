# Ashland Calendar (Visit AKY) — v0

Public calendar and iframe widget for [visitaky.com](https://visitaky.com), Design 96.

Centered Visit AKY logo, Open Sans 800 titles, Glacial Indifference body, source as a subheading (not a chip), `.st-primary` `#326DCD`, `.st-secondary` 2px.

## What ships in v0

- PostgreSQL schema with tenant-scoped events
- Reloadable **27-row** seed (`data/seed/ashland-ky-events.v0.json`)
- Public calendar at `/`
- Iframe calendar at `/embed`
- Single-event embed at `/embed/{slug}`
- `GET /v1/ashland-ky/events` with Bearer auth
- Frozen nine fields
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

Open [http://localhost:3000](http://localhost:3000). Narrow widget: [http://localhost:3000/embed](http://localhost:3000/embed).

## Partner API

```bash
curl -s -H "Authorization: Bearer dev-ashland-ky-local-token" \
  "http://localhost:3000/v1/ashland-ky/events?range=upcoming"
```

The example token is a local placeholder. Rotate it before any shared host. A token for another tenant receives `403` even if the URL says `ashland-ky`.

Query `range`: `month` | `week` | `upcoming` | `all`. Drafts never appear.

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
| `npm run seed` | First import of 27 rows |
| `npm run seed:reload` | Upsert content, preserve status |

## Product rules

- Source is a subheading, not a pill. Purple and mint are hover / themed outlines only.
- Playlist script stays in the logo file, not as a widget type.
- Events do not auto-publish.
- **This month** rolls forward when the current month has no remaining upcoming events, so a late-August visit still shows September.
