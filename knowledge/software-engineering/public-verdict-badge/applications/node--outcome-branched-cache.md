---
layer: application
type: application
subject: public-verdict-badge
technique: outcome-branched-cache
stack: node
status: forged
---

# Outcome-branched cache in a badge route

Ascent serves two public badge endpoints — `src/app/api/badge/[owner]/[repo]/route.ts`
(per-repo maturity) and `src/app/api/scorecard/[owner]/badge/route.ts`
(org-level) — from one renderer, `src/lib/badge-svg.ts`. The cache vocabulary
lives with the renderer rather than with either route, which is what keeps the
two from drifting.

## The four policies are four named constants

`src/lib/badge-svg.ts:156-163` states the branch and the incident it prevents
in the same place:

```ts
// Cache policy is branched by OUTCOME. A transient/throttled/neutral badge must not share the long
// public TTL of a real resolved level — otherwise a 10-min CDN entry pins "rate limited"/"unknown"
// for every README viewer past the blip.
export const CACHE_RESOLVED  = "public, max-age=600, s-maxage=600";
export const CACHE_CUSTOM    = "private, max-age=600";
export const CACHE_NEUTRAL   = "public, max-age=30, s-maxage=30";
export const CACHE_TRANSIENT = "no-store";
```

Three things are worth reading off it directly:

- **Neutral gets 30 seconds, resolved gets 600.** A twentyfold difference,
  because "unknown" becomes wrong the moment someone scans the repo — and the
  person it becomes wrong for is the one who just scanned it.
- **`CACHE_CUSTOM` is `private`, not a longer public age.** The body varies by
  caller query params while the CDN in front keys on path, so a shared entry
  would serve one embedder's `?label=` to everyone. `customized` is computed
  once, at `route.ts:148`, as simply "any query param present", and every
  response site selects with `customized ? CACHE_CUSTOM : …`
  (`:159`, `:215`, `:270`, `:288`, `:302`).
- **Transient is `no-store`, not a short age.** Applied to the throttle
  response at `:196-200` alongside a `retry-after`, and to the catch-all at
  `:314`.

`badgeResponse` (`badge-svg.ts:166-177`) is the single construction site, so
no route hand-writes a `cache-control` header.

## Only a genuine miss is negative-cached

The negative cache is the crawler defence, and `route.ts:308-314` is where its
teeth are:

```ts
const genuineMiss =
  err instanceof GitHubError &&
  (err.code === "NOT_FOUND" || err.code === "EMPTY" || err.code === "INVALID_URL");
if (genuineMiss) negSet(key);
```

A typed error carrying a discriminated `code` is what makes the branch
expressible at all. Everything else — an upstream rate limit, a 5xx, a network
blip — still renders the neutral badge (the image never breaks) but leaves the
negative cache clean, so the next request re-resolves. The comment names the
incident precisely: a transient failure must not pin a perfectly valid public
repo to "unknown" for the full negative TTL.

## The negative cache names its reaper twice

`route.ts:66-97` bounds the structure in both dimensions. `NEG_TTL_MS` is five
minutes; `NEG_MAX` defaults to 5000 entries, env-overridable. The reason the
size bound is not redundant is the sharpest detail in the file:

> it's a lazy delete-on-read TTL map on a PUBLIC, crawler-hammered endpoint: a
> crawler hitting endless unique non-existent owner/repo paths (all passing
> `validName`) each add a key that's never re-queried, so delete-on-read never
> fires and the map grows without bound.

Expiry-on-read only reaps keys someone reads again. Crawler misses are
write-once by construction. `negSet` (`:85-97`) evicts oldest-first when the
map is at capacity, so the reaper exists regardless of read traffic.

## What sits in front of the branch

Two guards run before any cache decision, and both shorten the expensive path:

- **Name-grammar validation before any store touch** (`:47-53`, single-sourced
  with the client generator through `validRepoNamePart` in `src/lib/badge.ts`)
  — a malformed path returns the neutral badge at `:159` without reaching the
  scan or cache layers.
- **Per-IP rate limiting gating the expensive scan** (`:196`), returning a
  cheap static badge with `CACHE_TRANSIENT` rather than a bare 429, so an
  embedded image never renders broken.

## Deviation worth noting

`resolvedCache` at `:186` downgrades a resolved verdict to `CACHE_NEUTRAL`
when no commit sha was resolvable — a fifth, implicit branch meaning "resolved
but unpinned". It is the right instinct (an unpinned result is less durable
than a pinned one) but it is expressed as an inline ternary rather than a
fifth named constant with a rationale, which is where the other four earn
their clarity.
