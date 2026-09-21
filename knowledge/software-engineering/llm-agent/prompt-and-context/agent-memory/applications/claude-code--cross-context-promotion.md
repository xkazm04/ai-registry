---
layer: application
type: application
subject: agent-memory
technique: cross-context-promotion
stack: claude-code
status: forged
verified_on: 2026-09-17
verified_against: claude-code@2.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The return condition arrived: 32 first-sight stores, 830 items, and what the pool was worth

[claude-code--procedure-promotion](./claude-code--procedure-promotion.md)
closed on 2026-09-02 with an open question and a trigger: the harness memory
directory held 24 files, the index was loaded whole into every session, and
*"the return condition is the index passing roughly fifty entries, when the
store would need the scoping rule as well as the door."*

On 2026-09-17 the same machine held **32 durable per-project memory
directories, 830 items, 428,759 words of body and 23,508 words of
always-loaded index** — the largest single directory at 147 items, the
registry's own at 61. The condition was met sixteen times over, and this is
the measurement it asked for.

## The seam, chosen because it could refute

This store is the strongest personalization case available: single author,
per-project, written first-sight by the harness, and demonstrably relied on —
the worker brief for the wave that produced this measurement is assembled out
of it. If a personalized store pays anywhere, it pays here, and the verdict
would have been `not-better`.

## Instrument

A companion-agent runtime in the same fleet carries a recall lane — a keyword
ranker over an inverted index — and it was used **unmodified** as the
retriever, so no scorer written for this measurement is in the loop. Each arm
is a store built from the real items and queried through that lane at three
slots. Arms differ only in which items the store holds.

Queries are mechanical, never hand-written: the later item's own filename is
split into content tokens with its project's own tokens removed, and **every**
two-term pair is run (57 pairs over 12 tasks). A task counts as covered if any
pair returns a confirmed earlier sibling in the top three — which is the write
door's real question, since a trigger search is what the door performs.

Task set: 12 events in which one project's store demonstrably re-derived a
lesson another project's store already held, each hand-confirmed by reading
every member, each with the earlier siblings' dates so that "the lane could
have had it" is a fact and not an inference. The worst case spans five
projects and two and a half months: a `node_modules` junction inside a
worktree that a recursive delete follows into the main checkout, learned
separately in five contexts. Eight further probes are singletons with no
cross-context sibling at all, one from each of the eight largest stores,
selected by rule rather than picked.

## Arms

| store | items | covered (of 12) | local answer present (of 12) | pair recall (of 57) |
| --- | --- | --- | --- | --- |
| A — its own project's store | 12–112 | 1 | 11 | 6 |
| B — the densest other project's store | 147 | 5 | 0 | 14 |
| B2 — a size-matched other project's store | 12–147 | 2 | 0 | 4 |
| C — all 32 pooled | 830 | 6 | 8 | 23 |
| D — pooled, gated on cross-context recurrence | 123 | 9 | 3 | 33 |
| E — A plus D, two tiers | 128–227 | 9 | 9 | 31 |

`B` was declared as "the largest store that is not this project's", which made
it larger than every `A` and confounded the comparison the candidate is
actually about. `B2` was added afterwards as a post-hoc control and is labelled
as one: the other store whose item count is nearest this project's, and again
truncated to exactly this project's count (identical result, 2 of 12, 4 of 57).
With size held fixed, a personal store and a borrowed one are
indistinguishable — and the 5 of 12 that `B` scored is a **size** effect, not a
provenance one.

Singleton probes, retained in the store: A 8 of 8, C 8 of 8, D **0 of 8**,
E 8 of 8.

Coverage by breadth of recurrence, pair recall: five-context families C 14/16,
D 16/16; three-context C 1/10, D 4/10; two-context C 8/31, D 13/31.

## Controls

- **The listener can hear.** With the item present, its own trigger probes
  retrieve it: 12 of 12 tasks and 8 of 8 singletons, 20 of 20.
- **The listener can miss.** A nonsense probe returns zero rows on the 830-item
  store.
- **The floor can go red.** Stripping the five labelled earlier siblings of the
  worst case from the pooled store took that task from 5 hit pairs to 0, so the
  hits were coming from the labelled items and not from something unlabelled.
- **The similarity pass was read, not counted.** Its largest component — 30
  items across 11 contexts — was rejected on reading as a topic rather than a
  lesson and contributed no task.

## Verdict: `better` on coverage, `not-better` on the unqualified claim

The candidate under test held that a personal artifact performs about as well
as one borrowed from a stranger, that a generic one aggregated from many
developers beats both, and that personalization looks promising only where a
preference recurs. All three hold here, once size is controlled: 1 of 12
against 2 of 12 against 6 of 12, and the recurrence gate on top of that.

What does **not** hold is the headline the candidate is filed under —
"personalization does not pay". It pays, on the axis the candidate never
scores. The personalized store carried a local answer on 11 of 12 tasks where
the pool carried one on 8 and the gated shared tier on 3, and it held the only
copy of every one of the eight singleton probes that the gated tier lost
entirely. A store can lose the coverage comparison by a factor of six and still
be the only place 85% of the corpus exists.

The third clause is the one worth more than the other two: gating the pool on
cross-context recurrence, at 15% of its size, beat the full pool on coverage
outright. Recurrence is not a tiebreaker inside a store; it is the boundary
between a tier that travels and a tier that does not.

## What this cannot show

Whether the two-tier store improves a *session's outcome*, rather than a
retrieval probe's. The tasks here are witnessed re-learning events, so the
counterfactual ("the earlier item was reachable, therefore the incident was
avoidable") is a retrieval fact, not an outcome fact — a session can be handed
the right item and still not act on it. The instrument for that is the
subject's own paired baseline ladder run per tier, and it needs a store that
actually has a shared tier to run against. Return when one exists.
