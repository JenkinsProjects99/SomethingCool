# Architecture

v0 is a single Next.js App Router service with PostgreSQL. One tenant ships in the seed (`ashland-ky` / Visit AKY). The public calendar, iframe embed, and partner API all read the same published rows.

## Surfaces

| Route | Role |
| --- | --- |
| `/` | Public calendar (wide / Design 96 desktop board) |
| `/embed` | 360px iframe widget |
| `/embed/{slug}` | Single published event embed |
| `GET /v1/ashland-ky/events` | Partner feed, Bearer token |
| `GET /api/health` | Liveness + request id |

There is no playlist widget type. Showit playlist script stays with the logo file on visitaky.com.

## Frozen nine fields

The public event contract is frozen. Adding or renaming a field requires a new API version.

1. `title`
2. `slug`
3. `startsAt`
4. `endsAt`
5. `venue`
6. `source`
7. `url`
8. `summary`
9. `status`

`status` is `draft` or `published`. Internal columns (`id`, `tenantId`, timestamps) never appear on the partner payload.

`source` is a `.st-d-subheading` string. It is not a chip, pill, or colored badge. Purple `#7B5BBB` and mint `#7AD68D` are hover / outline tokens only.

## Tenancy

- Every event and API token belongs to one tenant.
- The Bearer token resolves a tenant. The URL slug must match that tenant or the request is `403`.
- Queries always include `tenantId` from the authenticated token, never a client-supplied id.
- Public pages only load `ashland-ky`. Featured cards prefer the next upcoming rows even when the selected range includes past events. If **This month** has no remaining upcoming events, the calendar rolls forward to the next month so late-month visits still show what is happening.

## Never auto-publish

Imports, creates, and reloads default to `draft`. A row becomes `published` only when an editor sets `status` explicitly (seed file on first import, `--update-status` on reload, or a future publish action). Completeness, a future `startsAt`, or a trusted source never flips the flag.

Reloads update the eight content fields and leave `status` unchanged unless `--update-status` is passed.

## Logs and request ids

Middleware assigns `x-request-id` when the client does not send one. API responses echo it. Logs are one JSON object per line (`ts`, `level`, `msg`, `requestId`, plus event fields).

## Stack

TypeScript, Next.js 15, React 19, Prisma, PostgreSQL 16. Design tokens live in `docs/visit-aky-tokens.md` and `src/app/globals.css`.
