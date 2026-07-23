# Souf360 — Audit & Refactor Notes

This branch contains 3 commits on top of the project as uploaded:

1. `chore: baseline snapshot (as uploaded, before enterprise refactor audit)`
2. `refactor: reorganize lib/ into enterprise-style lib/, services/, constants/`
3. `fix: two production-breaking bugs + remove admin form/API duplication`

Run `git log -p` for the full diff of each commit.

## Critical bugs found and fixed

### 1. Middleware was never executing
`proxy.ts` at the project root exported a function named `proxy`. Next.js
only recognizes a root file named `middleware.ts` (or `.js`) exporting a
function named `middleware`. In its previous state, the file was invisible
to Next.js — meaning the `/admin` auth guard and the maintenance-mode
redirect have not actually been enforced in production.
**Fix:** renamed the file to `middleware.ts` and the function to `middleware`.

### 2. Edit-place API route was a static path, not dynamic
`app/api/admin/places/id/route.js` lived in a folder literally named `id`
(no square brackets). In the Next.js App Router that makes it a **static**
segment — it only ever matched the literal URL `/api/admin/places/id`.
Any real place ID (e.g. `/api/admin/places/42`) 404'd. This is why the
edit-place page could never fetch or save a place.
**Fix:** moved the route to `app/api/admin/places/[id]/route.js`.

### 3. Edit-place page referenced components that don't exist
`app/admin/(app)/edit-place/[id]/page.jsx` rendered `<Alert>`, `<Button>`,
`<Field>`, `<Input>`, `<Select>`, `<Textarea>` — none of which are defined
or imported anywhere in the codebase. This page would throw on render.
**Fix:** rebuilt the page using the shared `PlaceForm` component (below).

## Deduplication

- **`components/admin/PlaceForm.jsx`** — add-place and edit-place were
  ~330 lines of near-identical form markup and logic. Extracted into one
  component parameterized by a `mode` prop (`"create" | "edit"`); both
  pages are now thin data-fetching/submission wrappers.
- **`lib/validation/place.js`** — `POST /api/admin/places` and
  `PUT /api/admin/places/[id]` duplicated the same field allowlist and
  lat/lng validation verbatim. Extracted to `parsePlacePayload()`.
- **`data/places.ts`** — had its own slightly different image-URL parser;
  now reuses `services/places.js`'s `decodeImageUrls()`.

## Architecture reorganization

`app/lib/*` moved into a top-level enterprise-style layout:

| Before | After |
|---|---|
| `app/lib/supabaseClient.js` | `lib/supabase/client.js` |
| `app/lib/supabaseServer.js` | `lib/supabase/server.js` |
| `app/lib/supabaseAdmin.js` | `lib/supabase/admin.js` |
| `app/lib/adminAuth.js` | `lib/auth/admin-auth.js` |
| `app/lib/categories.js` | `constants/categories.js` |
| `app/lib/siteSettings.js` | `services/site-settings.js` |
| `app/lib/extractCoords.js` | `services/coordinates.js` |
| `app/lib/placeImages.js` | `services/places.js` |
| *(new)* | `lib/validation/place.js` |

`tsconfig.json` path aliases updated accordingly (`@/lib/*`, `@/services/*`,
`@/constants/*`); every import site across the app was updated to match —
no behavior changes from the moves themselves.

## Scope note

This pass was scoped to **audit + architecture refactor of existing code**,
not new features or a visual redesign (per your choice). The map, OSRM
routing fallback chain, admin CRUD permission checks, and RLS-facing
Supabase access patterns were reviewed and are sound — no changes made
there beyond the moves above.

## Before you deploy

I don't have network access in the sandbox this was built in, so I could
not run `npm install && npm run build`. Every `.js` file was syntax-checked
and every import was traced by hand against the new file layout, but please
run a real build once locally or in CI before merging:

```bash
npm install
npm run build
npm run lint
```
