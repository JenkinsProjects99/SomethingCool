# Tenant config (schema only)

Packs live in `data/tenants/{slug}.v0.json`. Loaders look up by slug. There are no city `if` branches in adapters or UI chrome.

## Required fields

| Field | Notes |
| --- | --- |
| `slug` | Lowercase kebab-case. Matches `GET /v1/{slug}/events`. |
| `name` | Public tenant name. |
| `timezone` | IANA zone. Ashland-ky is `America/New_York`. |
| `lookbackDays` | Tourist window lookback. Default `7`. |
| `brand` | Design tokens (primary, type, client-only `logoSrc`). |
| `sourceAllowlist` | Allowed `source` keys on rows. |
| `geoFence` | `bbox` plus `namedVenueExceptions`. Exceptions are named venues, not invented events. |
| `featuredRules` | `pinEventIds`, `maxCards`, `placement: "above-time-views"`. Pins sit in FEATURED; time lists stay `startsAt` order. |
| `embedApiKeyRef` | Env var *name* for the Bearer token. Never the secret. |
| `reviewerDesignate` | `{ displayName, email?, userId? }`. |
| `reviewerRole` | `pilot-coordinator` \| `tenant-admin`. |
| `publishQueue` | Always `{ scope: "tenant", workflow: ["draft","pin","published"], autoPublish: false }`. |
| `ingestAdapters` | Empty array. No Eventbrite / ICS / ImGoing adapters yet. |

## Reviewer handoff

The publish queue stays per-tenant. Swapping `reviewerDesignate` / `reviewerRole` (Sean, Data Coordinator, `pilot-coordinator` → a later Visit AKY `tenant-admin`) does not change the queue shape.

## Pack #1

`data/tenants/ashland-ky.v0.json`

- Designate: Sean (Data Coordinator)
- Role: `pilot-coordinator`
- Featured pins: Deana Carter, First Friday September, Maker's Market (two-up FEATURED strip)
- `from` / `to` on `GET /v1/{slug}/events` stay required for the frozen partner window

Public rows still use the frozen nine plus additive `image` and `category`. Draft and pin never appear on the public feed.
