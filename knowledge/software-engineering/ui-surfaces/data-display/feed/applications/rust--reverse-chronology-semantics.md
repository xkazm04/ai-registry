---
layer: application
type: application
subject: feed
technique: reverse-chronology-semantics
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Reverse-chronology semantics — the team channel union (Rust + SQLite)

The technique's four decisions, as they land in
`src-tauri/src/commands/teams/team_channel.rs` (`read_channel`, `:180-477`), the
server half of the Fleet Stream / Conversation feed, and in the client that
consumes it.

## Decision 1 — which time: event time, normalized for comparability

Four tables with four timestamp conventions feed one ranking. `read_channel`
projects each to a common second-resolution key:

```sql
strftime('%Y-%m-%dT%H:%M:%SZ', datetime(e.created_at)) AS at   -- :200, :272, :344, :416
```

The `TeamChannelItem.at` doc comment (`:41`) states the contract: *"Normalized
RFC3339 UTC (second resolution) — sortable everywhere."* This is the technique's
"whoever normalizes owes the tiebreaker" corollary in its measured form: replayed
against the 2026-08-17 purge backup, `persona_events.created_at` ties at **0.0%
raw** and **72.1%** after this projection; `team_memories` goes 0.0% → 44.1%
(`docs/concepts/golden-paths/chronological-feed.md` §0). The projection is
correct and necessary; it also manufactures the ties the rest of this file
exists to handle.

## Decision 2 — the total order: (at, id) with namespaced ids

Every source query orders on the composite and pages on it:

```sql
AND (strftime(…) < ?2
     OR (strftime(…) = ?2 AND ('tae-' || e.id) < ?4))       -- :210-212
ORDER BY at DESC, e.id DESC LIMIT ?3                         -- :213
```

The `'tae-'` / `'pe-'` prefixes (`:212`, `:286`) put four tables' ids into one
comparable key space so the union's tiebreaker is total. The in-process merge
then re-ranks with the identical comparator and says why:

```rust
// Must mirror the per-query ORDER BY exactly — the composite cursor above
// pages on (at, id), so the merge has to rank on (at, id) too.
items.sort_by(|a, b| b.at.cmp(&a.at).then(b.id.cmp(&a.id)));   // :472-474
```

The header comment at `:122-127` records the defect this replaced — rows
*"dropped (or duplicated) by the old timestamp-only `at < ?` cursor"* — and the
test `omitting_before_id_keeps_legacy_strict_at_paging` (`:1430`) pins the
backward-compatible fallback.

**Per-source window budgets** live in the same function: each of the four
queries takes its own `LIMIT ?3` and the union is truncated *after* the re-rank
(`:475`). The test `kind_filter_is_pushed_down_so_a_lens_cannot_be_starved`
(`:1459`) guards the starvation case the Golden Path names — previously all four
ran with `LIMIT n` and a chatty `step` layer crowded every `memory` out of the
page.

## The client copies the comparator — and one client does not

`src/features/overview/sub_timeline/libs/lensModel.ts:198-200` (`mergeTaggedRows`, which `useLensFeed.ts` calls):

```ts
// Same comparator the server ranks by — (at, id) desc. The merge must sort
// identically or paging would interleave wrongly.
flat.sort((a, b) => b.item.at.localeCompare(a.item.at) || b.item.id.localeCompare(a.item.id));
```

`src/features/fleet/monitor/channels/mergedFeed.tsx:50`, same `TaggedItem[]`, same 45%-tied key:

```ts
flat.sort((a, b) => b.item.at.localeCompare(a.item.at));
```

Stable sort resolves the tied second to *input iteration order* — the order the
user's teams happen to be listed in — and `LIVE_FEED_WINDOW = 600` (`types.ts:39`, applied at `mergedFeed.tsx:54`) cuts
there. Registered at the consumer's deviation register §88; the one-line fix is
deferred because it changes what a live overlay shows.

## Merge horizon

`src/stores/slices/pipeline/channelSlice.ts:227-237` (`mergeHorizon`): the
newest of the per-team oldest rows across teams that still have history; rows
below it are held back so a shallowly-paged team cannot surface rows *above* the
reader's position on its next page. `refreshChannel` (`:310-315`) marks a short
first page `exhausted` so a three-row team does not pin the horizon forever.

## Bucketing — where the group key diverges from the sort key

Two live divergences from the technique's bucketing rules, both registered at
deferred-fixes §88:

- `conversationModel.ts:80-82` — `dayKeyOf = at.slice(0, 10)` is the **UTC**
  calendar day; `dayLabel` (`:86-94`) computes **local** midnight. At UTC+2 the
  divider lands at 02:00 local. The repo's own `timeGroupKey`
  (`src/features/shared/components/display/grouping.ts:31-39`) computes local
  boundaries and is used by three other feeds.
- `GlobalExecutionList.tsx:161` returns unsorted by default (deferring to the
  SQL `ORDER BY e.created_at DESC`) while `groupOf` (`:264`) buckets on
  `started_at || created_at`. Rows whose two timestamps straddle a day boundary
  land under the wrong sticky header.

## Renderer-minted keys

The census rule `feed-item-ordered-by-the-renderers-clock`
(`chronological-feed.md` §9; 12 matches / 10 files, hand-verified 9/12) is this
technique's "minted by the authority" section as a gate. Its two most
consequential hits: `hooks/realtime/useRealtimeEvents.ts:244-245` and
`emitDeploymentEvent.ts:52-53` synthesize a full `PersonaEvent` with
`created_at` from `new Date()` and push it into the store the Event Log ranks on
`created_at`, beside rows whose key came from SQLite.

## Where the technique lands in the store, one line each

| Technique clause | Site |
|---|---|
| Event time as the ordering key | `team_channel.rs:200` (`created_at` projected, not an ingestion time) |
| Composite total order | `team_channel.rs:213,287,351,424`; `:474` |
| Namespaced tiebreaker across sources | `team_channel.rs:212,286` |
| Per-source window budget | `team_channel.rs` four independent `LIMIT ?3`; test `:1459` |
| Comparator copied to the client | `lensModel.ts:200` (compliant) · `mergedFeed.tsx:50` (drops it) |
| Merge horizon | `channelSlice.ts:227-237` |
| Group key = sort key | violated at `GlobalExecutionList.tsx:161/264` |
| Boundary and label in one zone | violated at `conversationModel.ts:80-94`; correct helper at `grouping.ts:31-39` |
| Authority mints the key | census rule `feed-item-ordered-by-the-renderers-clock` |

Re-checked 2026-10-31 at personas@22260d77:

- The compliant comparator moved out of `fleet/monitor/channels/` into
  `overview/sub_timeline/libs/lensModel.ts` (`mergeTaggedRows`), so the two
  clients are no longer in one directory; `mergedFeed.tsx` still sorts on
  `at` alone. The server half — projection, composite cursor, namespaced
  ids, re-rank, per-source limits — holds as described.
- `GlobalExecutionList.tsx` was split: grouping is now a `groupBy` callback on
  `timeGroupKey(exec.startedAt || exec.createdAt)` (`:63-66`), and the rows
  arrive in the SQL order `e.created_at DESC, e.id DESC`
  (`src-tauri/db/src/repos/execution/executions.rs:578`) with no client sort
  passed to `UnifiedTable`. The `:161`/`:264` anchors no longer resolve, but
  the group key still differs from the sort key, so the divergence stands.
  The UTC day key in `conversationModel.ts` also stands.
- Renderer-minted keys: `hooks/realtime/useRealtimeEvents.ts` no longer
  exists, and `emitDeploymentEvent.ts` now leaves `created_at` empty
  (`:84`) and carries the renderer's time only as `payload.observed_at`
  (`:15-28`, `:64`). **Both hits this section names are resolved at HEAD.**
  The census rule itself is still in `scripts/census/rules.json`.
