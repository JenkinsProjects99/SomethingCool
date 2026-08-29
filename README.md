# Run this locally

```bash
git clone https://github.com/JenkinsProjects99/SomethingCool.git
cd SomethingCool
git checkout cursor/ashland-calendar-v0-989b
npm install
npm run dev
```

Open the URL Next prints — usually [http://localhost:3000](http://localhost:3000). That is the Visit AKY phone PWA.

`npm run dev` copies `.env.example` to `.env` if you do not already have one. Dummy local values (including the embed/API token) are already in `.env.example`. The phone UI reads the seed file, so cards render even when Postgres is not running. A null `image` uses the official Visit AKY logo; the row is not dropped.

Optional, if you want the partner API and iframe against Postgres:

```bash
docker compose up -d postgres
npx prisma migrate deploy
npm run seed
```

---

# Ashland Calendar (Visit AKY) — v0

Installable Visit AKY phone PWA (Next.js, not React Native) plus a secondary iframe widget for [visitaky.com](https://visitaky.com). Design 96.

Centered Visit AKY logo, Open Sans 800 titles, Glacial Indifference body, source as a subheading (not a chip), `.st-primary` `#326DCD`, `.st-secondary` 2px.

## What ships in v0

- Installable PWA at `/` (full-bleed photo cards, This weekend / Music / Sports / Family)
- Secondary iframe at `/embed` and `/embed/{slug}`
- `GET /v1/ashland-ky/events` with Bearer auth, frozen `from`/`to` (225 published seed rows; `category` and `image` on the payload)
- Public nine fields plus additive `image` and `category`. `category` is required on every seed row.
- Never auto-publish
- Structured JSON logs and `x-request-id`

## Partner API

`GET /v1/ashland-ky/events` reads Sean’s 225-row seed file when Postgres is empty, down, or still on the old ~32-row stub. A stale local DB cannot replace the official file until it has at least as many published rows. Payload includes additive `image` and `category`.

```bash
curl -s -H "Authorization: Bearer dev-ashland-ky-local-token" \
  "http://localhost:3000/v1/ashland-ky/events?range=all"

curl -s -H "Authorization: Bearer dev-ashland-ky-local-token" \
  "http://localhost:3000/v1/ashland-ky/events?from=2026-08-29&to=2026-08-31"
```

The weekend window is exactly the seven verified Aug 29–31 rows (three volleyball, Sandy’s Exacta 11:30pm ET, Novel Tea Monday, Boyd soccer 6pm and 8pm). Those rows have `image: null`; the PWA shows the Visit AKY logo in the client and does not write that URL into JSON.

The example token is a local dummy. Rotate it before any shared host.

## Docs

- [Architecture](docs/architecture.md)
- [Seed import how-to](docs/seed-import.md)
- [Visit AKY tokens](docs/visit-aky-tokens.md)

## Product rules

- Source is a subheading, not a pill.
- Events do not auto-publish.
- Do not invent Boyd Library rows or pub nights.
