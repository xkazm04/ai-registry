---
layer: application
type: application
subject: client-fetch-cache
technique: swr-design
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Stale-while-revalidate in this repo — the primitive family

Described at personas@`22260d77`. The repo's canonical SWR primitive is
`createSWRFetcher` in `src/lib/utils/staleWhileRevalidate.ts`, and it
demonstrates most of the technique in 166 lines:

- **Fresh zone** — `now - cached.fetchedAt < ttlMs` returns the entry with
  no fetch (`{ data, fromCache: true }`, `:89-93`). Default TTL 30s
  (`DEFAULT_TTL_MS`, `:35`), overridable per fetcher, so TTL is declared per
  cache, not inherited globally.
- **Stale zone** — a stale hit returns the cached value while the
  revalidation runs behind
  (`promise.catch(silentCatch(...)); return { data: cached.data, fromCache: true }`,
  `:133-137`).
- **Fused dedup** — the `_inflight` map (`:16`) is checked before a fetch is
  launched (`:96-100`), so concurrent readers of one key share one flight.
  This is [in-flight-dedup](../techniques/in-flight-dedup.md) built into the
  SWR read path, as the technique requires.
- **Per-request identity** — every launched request mints a fresh token in
  `_requestToken` (`:32`, `:105-106`). The cache write (`:112`) and the
  in-flight cleanup (`:124`) both run only while that token is still the
  key's owner, so a disowned request can neither repopulate the cache nor
  delete a newer request's in-flight entry. The sibling `deduplicateFetch`
  mints the same token (`src/lib/utils/deduplicateFetch.ts:32`), and
  `src/lib/utils/__tests__/inflightCoalescing.parity.test.ts` drives both
  through one lifecycle script so they cannot drift apart.
- **Eviction** — `MAX_CACHE_ENTRIES = 500` (`:46`), evicted from the front
  of the `Map` (`evictOldestIfOverCap`, `:48-54`). Both a fresh hit
  (`:90-91`) and a write (`:115-116`) delete and re-`set` the key, so the
  order is by recency of use, an approximate LRU. The header comment states
  the reason: "TTL only gates freshness, not retention" (`:38`). Expiry is
  not eviction.
- **Failure keeps stale truth** — the cache write lives in `.then()`
  (`:109-120`), so a failed background refresh never touches `_cache` and
  never stamps freshness: the stale entry keeps serving and the retry window
  stays open.
- **Invalidation retires the flight** — `invalidateSWRCache(key)` drops the
  entry, the in-flight promise and the token together (`:155-159`). Its doc
  comment records the bug this closed: dropping only the cache let the next
  call await the pre-invalidation request, which then wrote its stale
  result back. `clearSWRCache()` (`:162-166`) is the test-reset hatch.

The primitive has one production consumer: `useDesignReviews.ts` builds
one fetcher for the design-review count
(`src/hooks/design/template/useDesignReviews.ts:11`) and calls
`invalidateSWRCache` on a forced reload (`:44`).

## The seam family around it

The technique's "one primitive per seam" rule shows here as a *documented*
division of labor, and also as its failure mode:

- `invokeWithTimeout` (`src/lib/tauriInvoke.ts`) folds identical read-only
  IPC calls into one round-trip and keeps each entry for
  `AUTO_DEDUP_TTL_MS = 250` after it settles (`:177`), evicting rejections
  at once (`:172`). That is same-tick burst collapse at the IPC seam, below
  any cache.
- `src/lib/async/createCachedFetch.ts` is the slice-seam controller:
  in-flight collapse plus a freshness timestamp for data whose *storage* is
  a Zustand slice. Its doc comment positions it against the transport
  auto-dedup (`:7-9`) and stamps freshness only on success ("a failed fetch
  is never cached — the next caller retries", `:13-15`).
- `src/lib/async/createTtlValueCache.ts` is the value-holding variant for
  `useState`-resident data, with per-key `delete()` as its invalidation door
  (`:45-47`). See [react--warm-remount-caches](./react--warm-remount-caches.md).
- `deduplicateFetch` / `deduplicateKeyedFetch`
  (`src/lib/utils/deduplicateFetch.ts`) is keyed dedup with no freshness.
  Its key builder `deduplicatedFetchKey` (`:103`) encodes arguments
  canonically: object keys sorted, typed tags for `undefined`, `null` and `bigint`,
  cycles marked, and a thrown error for function and symbol arguments, which
  cannot be expressed in a key.

Four-plus primitives with adjacent remits is the proliferation the golden
path warns about. The corpus sweep of this area
(`docs/concepts/golden-paths/shared-fetch-cache.md`) counts **71 in 48
files** hand-rolled module cache containers (`:102`), and records that two
of the five shared primitives were found late, after its counts were locked
(`:25`). Even a deliberate audit missed members of the family. Each seam is
well documented on its own; the *set* has no single index, which is the
residual gap.

## Deviations observed (standard kept; not fixed here)

- `createSWRFetcher` has **no stale ceiling**: an entry of any age within
  the 500-entry cap serves as the instant answer (`:133-137`). The technique
  requires a hard miss threshold so week-old data cannot paint as truth.
- **Refresh failure is not a fact a surface can read.** A failed background
  refresh reaches only `silentCatch` (`:135`). The caller's `fromCache` flag
  says "showing cache", but nothing exposes "last refresh failed". The
  exported `SWRResult` type declares an `isRevalidating` field (`:56-61`),
  yet `createSWRFetcher` never returns it and no file imports the type. The
  two facts the technique says must stay separately available are one fact
  and a log line here.
- **Only the first stale reader gets the instant answer.** The in-flight
  check (`:96-100`) runs before the stale return (`:133`), so a second
  reader that arrives while the revalidation is in the air awaits the fresh
  result (`fromCache: false`) instead of being served the stale entry. The
  flight is shared, as in-flight-dedup requires, but the stale zone's
  "serve the entry and refresh behind" holds for one caller per flight.

## History

- **Forged** (date not recorded): the body described the primitive at
  "~110 lines", with eviction in insertion order refreshed only on write,
  and listed three deviations: no stale ceiling, refresh failure routed to
  the silent door only, and `deduplicateKeyedFetch` keying by
  `JSON.stringify(args)`, which fragments object arguments by field order.
- **Re-checked 2026-10-31 at personas@`22260d77`.** Every cited path still
  existed. The primitive had grown to 166 lines, gained the per-request
  token, and re-sets a key on a fresh hit, which made eviction
  recency-ordered on reads as well as writes. The first two deviations still
  hold. **The third is resolved**: `deduplicatedFetchKey` replaced
  `JSON.stringify(args)` with a canonical encoding, so field order no longer
  fragments the key. The "first stale reader only" deviation and the unused
  `SWRResult.isRevalidating` field were first recorded in this rewrite.
