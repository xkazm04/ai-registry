---
layer: application
type: application
subject: data-access
technique: batching-and-n-plus-one
stack: node
verified_on: 2026-08-29
---

# Batching and N+1 in two Next.js data layers (kp, ascent)

Two trees, both Next.js 16 app-router products with hand-partitioned data
layers, both exhibiting the technique's central claim in its 2026 form: the
set-shaped operation *exists* and the loop survives beside it. Tree A is
`kp` at `eab721a6` (2026-08-29), `better-sqlite3@12`, synchronous SQLite
behind `app/_lib/db/*.ts`. Tree B is `ascent` at `10cbd8fa` (2026-08-29),
`@prisma/client@6` over Postgres-wire stores, data layer under `src/lib/db/`.

## Tree A — the batch endpoint, built correctly and then not used

`getJobsByIds` (`app/_lib/db/jobs.ts:526-541`) is the technique's
membership read almost line for line. The doc comment (`:521-525`) names
the defect it replaces — "one IN-query … instead of one point SELECT per
id" — and the three properties the technique asks for are all present:

- **Empty is answered, not sent** — `if (ids.length === 0) return [];`
  (`:527`), the early-return spelling, correct because the membership test
  is the whole query.
- **Placeholders generated, values bound** —
  `part.map(() => "?").join(",")` then `.all(...part)` (`:531-534`); the
  list's shape enters the text, its contents never do.
- **Chunked under the engine ceiling** — `chunk(ids, SQL_IN_CHUNK)`
  (`:530`) with `SQL_IN_CHUNK = 400` (`app/_lib/entries-param.ts:26`),
  a floor chosen against the engine's *pre-2020* default of 999 rather
  than the 32,766 the bundled engine actually allows; the comment at
  `entries-param.ts:10-13` calls this "defence-in-depth: even an internal
  caller that skips the route guard can never trip the variable limit".
  The same `chunk`/`SQL_IN_CHUNK` pair is reused at
  `app/_lib/db/interviews.ts:395`, `app/_lib/db/pipeline.ts:718` and
  `app/_lib/decision-record-store.ts:359` — one helper, not per-site
  arithmetic.

The return shape is the technique's "map, not list" in a variant worth
noting: results are collected into a `Map` by id (`:529`, `:537`) and then
*re-emitted in requested order* (`:540`), with unknown ids dropped rather
than reported. That is a list with the store's ordering accident removed,
which serves a caller that wants positional results; it is not a keyed map
that makes "missing" explicit per key, and the one production caller
(`app/api/matrix/route.ts:59`) has to tolerate a shorter array than it
asked for.

Then the deviation. `app/api/decisions/peer-context/route.ts:92-93` —
`for (const jobId of jobIds) { const job = getJob(jobId); … }` — loops the
singular over a list the route itself caps at fifty (`:75`), in a route
whose comment at `:80` is about *not* re-reading. `getJobsByIds` sits in the
same module tree, documented as the replacement for exactly this. The
"bulk" invite route does the same with `getPipelineEntry` per id
(`app/api/schedule/invite/bulk/route.ts:83-84`, capped at
`BULK_INVITE_CAP = 100`, `app/_lib/bulk-invite.ts:9`). No test in either
tree counts statements, so the loop has nothing to fail: the batch endpoint
is an offer, and the technique's point that the query counter is what turns
the offer into a requirement is demonstrated by its absence.

## Tree B — the same shape, with the read batched and the write looped

`src/app/api/org/followups/handoff/route.ts` is one operation in three
phases. Phase one is an N+1 by choice, and the reason is written down:
`for (const id of ids) { const owner = await getRecommendationOrgSlug(id); … }`
(`:48-53`), commented "resolved one by one through the same helper the
per-item route uses, so the ownership rule has one implementation"
(`:46-47`). That is a real trade — one-door for the tenancy predicate
against one round trip per id, bounded by `MAX_BATCH = 50` (`:28`) — and it
is the shape the technique's "membership reads" rule resolves differently:
the ownership helper should have a set-shaped twin that applies the same
predicate once, not a singular that callers loop to keep it single.

Phase two is batched correctly:
`findMany({ where: { id: { in: ids } }, select: { id, status } })` (`:56`)
into a `Map` (`:57`). Phase three loops again —
`await updateRecommendation(id, …)` per id (`:60-64`) — which is the
technique's note that batching a *write* is a transaction question, not a
loader question: the per-id write has no boundary around the batch, and
each `updateRecommendation` does its own read-then-write
(`src/lib/db/scans-recommendations.ts:59-62`) with no compare-and-set on
the status the route read at `:56`. The N+1 and the missing boundary are
the same omission seen from two techniques.

The contrast in the same tree: `src/lib/db/org-nav-counts.ts:39-60` is a
count that runs in the org shell on every view, and its header (`:1-4`)
states the discipline — "three indexed aggregates in one round-trip, no
per-page fan-out" — then delivers it with one nested select over
repositories → latest scan → unresolved recommendations (`:46-55`) and one
count (`:56`), memoised per request with `cache()` (`:39`) so the shell's
call and the page's call coalesce into one. It also carries the predicate
its number was computed under, in prose (`:12-15`: scoped to each repo's
latest scan, because a flat count "would count every historical scan and
disagree with what /backlog lists") — the count-carries-predicate law
applied to a badge.

## Reconciliation summary

Confirmed on both trees: generated placeholders with bound values; empty
list answered before the store is touched; chunking through one shared
helper under a floor chosen for the lowest engine; an aggregate read
designed as one round trip with its predicate stated. Deviations: the
batch endpoint exists and the loop survives beside it in routes that cap
their own input (A); a singular ownership helper looped to preserve
one-door instead of given a set-shaped twin (B); a batched read followed by
a per-id write with no boundary (B); no statement counter in either suite,
so none of the loops can fail a build. Upward lesson folded into the
technique: shipping the set-shaped operation is not administering it — the
detection counter is what converts the offer into a requirement.
