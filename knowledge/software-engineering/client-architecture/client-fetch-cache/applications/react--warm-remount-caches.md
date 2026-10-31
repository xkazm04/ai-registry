---
layer: application
type: application
subject: client-fetch-cache
technique: warm-remount-caches
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Warm remount caches in this repo — `createTtlValueCache` and its callers

Described at personas@`22260d77`. The app's sections are lazy routes that
unmount fully on navigation, so warm remount is written into the loading
doctrine. `docs/concepts/golden-paths/page-loading.md` states it as the
last sentence of "The one way" (`:25`): *for a view that fully unmounts on
nav-away and holds its data in `useState` rather than a store, stash the
last fetch in a module-scoped cache keyed by entity so a return visit paints
warm instead of re-ghosting.* Step 10 of its recipe (`:52`) adds the
mechanics: seed `useState` from the cache and start `isFetching` **false**
on a warm hit.

## The primitive

`src/lib/async/createTtlValueCache.ts` is the rule as a shared primitive.
It holds `{ value, at }` per key at module scope (`:35`), answers `get` only
while the entry is younger than the TTL (`:37-41`), and exposes per-key
`delete` as the invalidation door (`:45-47`) and `clear()` as the reset
hatch (`:48-50`). Its doc comment (`:1-21`) names the division of labor:
`createCachedFetch` keeps only a freshness *timestamp*, which is enough
when the data lives in a Zustand store. For `useState`-resident data that
dies with the view, a timestamp-only gate would skip the refetch *and* have
nothing to show, which is the failure the technique's "ageless latch"
warning describes.

Six modules construct a cache from it, and two more import only its type.
Three callers show the range.

## `factoryData.tsx` — the warm paint and the fresh window, kept apart

`src/features/teams/sub_factory/factoryData.tsx` is the fullest
realization. Its comment (`:230-238`) records the cost it removed: each
mount of the KPI provider used to refetch the whole tree, about 130 IPC
calls for 20 projects, on every visit. It holds **two** caches over one key
(`:240-241`):

- `factoryPaint`, 30 minutes: what a mount may paint immediately. The
  provider seeds `useState` from it with `loading: false` (`:317-320`).
- `factoryFresh`, 60 seconds: whether that value is young enough to skip
  the refetch (`:325`).

A painted-but-stale tree revalidates in the background and swaps in as one
commit (`:339-350`). A failed revalidation keeps the cached rows on screen;
only a cold load with nothing to show reports an empty tree (`:351-355`).
That is the technique's "the warm paint is a stale paint", with a stale
ceiling (the 30-minute paint window) that the single-window primitive
cannot express on its own. A prefetch in flight is adopted instead of
started twice (`factoryInflight`, `:304`; adoption at `:329-338`).

## `useProjectPulse.ts` — a keyed map, one entry per project

`src/features/plugins/dev-tools/sub_projects/useProjectPulse.ts` keys one
cache by project id (`pulseCache`, `:53`, TTL two minutes at `:36`). Only
ids that are missing and not in flight are fetched (`:106`), the write
happens only on success (`:117`), and a failure leaves no entry, so the
next mount retries. `__resetProjectPulse` (`:128-131`) is the test hatch.
This is the technique's map form: the working set holds several scopes at
once, so a single slot would not do.

## `useDataPortability.ts` — a single slot with an invalidation door

`src/features/settings/sub_portability/libs/useDataPortability.ts` caches
export stats under one constant key for 60 seconds (`:26`). A remount
inside the window seeds from the cache and skips the IPC (`:92-96`). After
an import changes the counts, `refreshStats` refetches and re-`set`s the
cache (`:128-133`), so a later remount does not seed the pre-import value.

## Deviations observed (standard kept; not fixed here)

- **One cache cannot be both the warm paint and the fresh window.** `get`
  returns `undefined` once the TTL passes (`createTtlValueCache.ts:39`), so
  a single-cache caller paints warm only inside its freshness window and
  goes cold after it. `useDataPortability` shows the result: a return after
  60 seconds starts at `setStatsStatus('loading')` (`:98`) although the last
  value is still in memory. `factoryData` gets both behaviours only by
  composing two caches by hand. The technique wants warm paint plus
  revalidation, with freshness deciding only whether to refetch.
- **The primitive has no size cap.** The `Map` (`:35`) grows by one entry per
  distinct key and expired entries are never removed, only overwritten or
  deleted. Keyed callers such as `pulseCache` are bounded in practice by the
  number of projects, but nothing in the primitive names a cap or an
  eviction order. The technique requires both at the declaration site.
- `reviewParseCache.ts` (the derive-cache precedent,
  `src/features/templates/sub_generated/gallery/cards/reviewParseCache.ts`)
  keys by review object in a `WeakMap` (`:18`). That is the technique's
  GC-as-reaper form working as designed. But `getCachedReadinessScore`
  memoizes the score computed from `installedConnectorNames` and
  `credentialServiceTypes`, which are **not part of the key** (`:64-79`).
  That is a hidden-axis case per
  [parse-and-derive-caches](../techniques/parse-and-derive-caches.md): the
  score goes stale if those sets change while the review object lives.

## History

- **Forged** (date not recorded): the document was titled "the loading-v2
  law 4 precedents" and cited the rule as law 4 of
  `docs/design/overview-loading.md`. It described two hand-rolled
  precedents. `CompetitionList.tsx` held a keyed single slot
  (`cachedProjectId` / `cachedCompetitions`). `LifecyclePage.tsx` held an
  unkeyed slot (`cachedDevClone` / `cachedTriggers`), which was correct
  there because the dev-clone persona was found by an app-global search.
  `createTtlValueCache` appeared as the pattern promoted later. Three
  deviations were listed: the hand-rolled slots had no invalidation door or
  test hatch; `useCertificationData.ts` guarded its deferred load with an
  ageless latch (`certLastRefreshedAt || certStatus.length > 0`); and
  `reviewParseCache.ts` left ambient inputs out of its key.
- **Re-checked 2026-10-31 at personas@`22260d77`.** Both precedents are
  gone. `CompetitionList.tsx` no longer exists. `LifecyclePage.tsx` is now a
  52-line shell over the Lifecycle Lens, with no cached slots.
  `useCertificationData.ts` and its latch are gone too. The rule moved out
  of `overview-loading.md`, whose law 4 is now the item-level cascade, into
  `page-loading.md`. So the **no-invalidation-door** and **ageless-latch**
  deviations are resolved by removal: no site is left to cite.
  The **hidden-axis** deviation in `reviewParseCache.ts` still holds. The
  "paint versus fresh window" and "no size cap" deviations were first
  recorded in this rewrite.
