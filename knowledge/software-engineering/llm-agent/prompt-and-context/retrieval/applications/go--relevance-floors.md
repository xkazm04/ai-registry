---
layer: application
type: application
subject: retrieval
technique: relevance-floors
stack: go
verified_on: 2026-08-22
---

# Relevance floors in the Weaviate query path (Go)

How a production vector database realizes the floor — the threshold that turns
"nearest" back into "relevant". Citations are against `weaviate/weaviate`
commit `adcffc5` (2026-08-20), API version `1.40.0-dev`
(`openapi-specs/schema.json`, `info.version`). This is a reconciliation
against an external, world-class tree, not the consumer repo the sibling
applications cite, so the pin lives here in prose rather than in
`verified_against`, whose contract is a stack runtime version.

## 1. The floor is a fetch strategy, not a post-filter

A `distance` threshold here does not mean "fetch k, then drop the bad ones" —
it changes *how much is fetched*. Under a floor the HNSW index runs
`searchByVectorDistance` (`adapters/repos/db/vector/hnsw/search.go:1416-1487`):
search at limit 100, admit every hit at or under the target (`:1450-1460`),
and while the *last* admitted hit is still inside the floor
(`shouldContinue = lastFound <= targetDistance`, `:1447-1448`) go around again
with the window multiplied by ten (`iterate`, `:1402-1406`; constants
`:1359-1371`). The loop stops when the neighbourhood stops qualifying, not
when a caller's k fills — inverting the floor's usual relationship to the
[budget](../techniques/ranking-budgets.md), which survives only as
`maximumSearchLimit`, a safety rail. That is what a floor *means* —
"everything relevant", not "the best k, some of it relevant" — affordable only
because the index answers "is anything else close?" cheaply.

The admit loop `break`s at the first out-of-floor hit (`:1455-1459`) — sound
only because the lane emits distance-sorted, a precondition never asserted.

## 2. Certainty is a spelling of distance, converted at one door

The API offers two floor knobs, `distance` and `certainty`, and
`extractDistanceFromParams` resolves the second into the first before anything
downstream sees it (`adapters/repos/db/search.go:221-229`), through the single
affine pair in `entities/additional/distance.go:22-25` / `:27-30`
(`dist = (1-certainty)*2`); `certainty` survives only as a presentation-time
annotation (`usecases/traverser/explorer.go:660`). One score space reaches the
lane, and exactly one place knows the exchange rate — the per-lane-units rule
kept honest at the API boundary.

## 3. Honest empty is reachable, and failure is never spelled empty

The hybrid path applies the vector floor with a sentinel that can legally
admit nothing: `maxFound` starts at `-1` ("use one less so we do not get any
results in case nothing is above the limit") and the lane truncates to
`res[:maxFound+1]` (`usecases/traverser/hybrid/searcher.go:104-118`) — a
floored query over an irrelevant corpus returns zero rows, not the least-bad
k. Failure is spelled apart at the transport boundary: an embedder that
cannot vectorize the query becomes the typed `ErrQueryVectorization`
(`entities/errors/errors_search.go:36-51`; raised `explorer.go:417`, `:271`)
and surfaces as **HTTP 502** (`handler.go:385-387`), never a 200 with an
empty set — the switch deliberately ordered, with the constraint documented,
because four more specific causes arrive wrapped inside it (`handler.go:340-344`,
`:365-379`). The `failure-not-empty-success` law as a stated invariant.

## 4. Autocut is a knee detector, not a floor — the hint refuted

`autocut` reads like the floor and is not one.
`entities/autocut/autocut.go:14-51` normalizes the score sequence to run 0→1
between its own first and last element (`:24`), subtracts the straight line,
and cuts at the *n*-th local maximum of the residual — the biggest gaps in the
curve. It is **scale-free** (the same function serves ascending-distance
`explorer.go:441-447` and descending-score `hybrid/searcher.go:326-333`
unchanged — a floor cannot be, which is what makes a floor calibration state);
it **cannot return empty** (the scan skips index 0, `:29-31`, and the fallback
is `len(yValues)`, `:50` — it can only say "the good ones end here", never
"nothing qualified"); and it is **relative to what was returned**, so on an
irrelevant corpus it faithfully finds a knee inside the noise. It is
nonetheless applied with the floor's own discipline — once, at one door:
sub-searches run with `Autocut: -1` (`usecases/traverser/explorer_hybrid.go:249,256`),
the cut lands on the fused list (`hybrid/searcher.go:151-152`, `:203-204`),
ahead of diversity selection with the reason written down (`:186-191`), and
off by default (`0` disables, `entities/filters/pagination.go:44-47`).

## 5. Deviations

**The lexical lane has no floor of its own; it inherits the vector lane's.**
Hybrid search retains the ids that passed the vector cutoff (`belowCutoffSet`,
`hybrid/searcher.go:105-115`) and uses them to *prune the keyword results*
(`:125-134`) — a lexically perfect match the embedder placed far away is
dropped, as is any keyword hit outside the vector lane's fetch depth. BM25
itself has no relevance threshold at all: its only bound is `worstDist`, the
k-th best in the heap, seeded at `-10000`
(`adapters/repos/db/lsmkv/search_segment.go:404`, `:410`, `:417-418`) — a
budget-derived pruning bound. The per-lane rule is half-kept: the lexical
lane borrows units that are not its own.

**The floor predicate is written three times, three ways.** The lane enforces
it (`hnsw/search.go:1451-1452`), then the result assembler re-checks it per
object (`explorer.go:634-651`), and the Explore path spells it a third time
with the comparison inverted (`appendResultsIfSimilarityThresholdMet`,
`explorer.go:829-845`). Each carries its own `InDelta(…, 1e-6)` epsilon
handling. This is exactly the defensive re-flooring the technique names as
the sign that a system has lost track of where the contract lives — and the
paging policy behind the floor is likewise duplicated between
`hnsw/search.go:1347-1414` and `adapters/repos/db/vector/common/search_by_dist_params.go:14-83`.

**Zero is the "unset" sentinel in the floor's own units.** The multi-target
combiner filters only `if targetDist > 0`, with the comment "targetDist == 0
means no target distance is set" (`adapters/repos/db/shard_combine_multi_target.go:240`).
Since `certainty: 1.0` converts to distance `0`, the strictest expressible
floor collides with no floor on that path.

**The truncated search does not report itself.** When the growing window hits
`maximumSearchLimit` the loop breaks with a `Warnf` to the server log
(`hnsw/search.go:1470-1478`) and returns a silently short result set; nothing
in the response says the floor's promise of "everything within distance" was
abandoned. `count-carries-predicate`, owed to the caller, is paid to the
operator instead.

## Not present by scope

The **degraded slice** does not exist: a vectorizer failure fails the whole
query (§3) — arguably correct for a database, which has no consumer to hand a
provenance label to; the obligation moves up to the client. Floor
**calibration** likewise: the engine takes the number and never proposes one.

## Reconciliation summary

Confirmed: floor enforced at the lane's emit door and driving fetch depth
rather than post-filtering; one conversion door between the two score
spellings; empty genuinely reachable; engine failure typed and mapped to 502,
never to an empty success; adaptive cut applied once, on the fused order,
off by default. Deviations: the lexical lane inherits the vector lane's floor
and has none of its own; the floor predicate re-checked at three sites in
three formulations; zero doubling as the unset sentinel; window-limit
truncation reported to the log, not the caller. Not present by scope:
degraded-mode labeling and floor calibration, both landing on the client.
