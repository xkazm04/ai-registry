---
layer: technique
type: technique
subject: remediation-roadmaps
technique: cheapest-path-projection
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [a reader asks what it takes to reach the next level, presenting a banded score with a plan attached, choosing a minimal set of moves rather than the single best one]
---

# Cheapest path projection

The concern: readers hold scores as **bands**, not numbers. Nobody
remembers 63.4; everyone remembers being one band below where they wanted to
be. The question that follows a banded verdict is therefore not "what is the
best single improvement" but "**what is the least I can do to cross the
line**" — and that is a covering computation over a set of moves, not a sort.

## The computation

Inputs: the current composite, the threshold of the next band, the candidate
moves with their projected gains and their effort estimates. Output: a small
subset whose combined projected gain reaches or exceeds the threshold, chosen
to minimize total effort, plus that total effort stated plainly.

The honest form of the combination is the part most implementations get
wrong. Do **not** sum the moves' individual gains. Instead, apply the chosen
moves to a copy of the underlying dimension values and **re-run the scoring
function**, because gains interact: two moves on one dimension overlap, a
dimension's own ceiling caps the pair, and normalization is rarely linear. A
summed path routinely claims to cross a threshold it does not reach, and the
error is discovered only after the work is done. The path is a derived value
and it names its recomputation: the same scoring function that produced the
current score, run over hypothetical inputs
([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)).

## Decision rules

- **Greedy by gain-per-effort is the right default.** This is a knapsack, and
  the exact solution is not worth its complexity at the sizes involved
  (typically fewer than thirty candidates). Take moves in descending
  gain-per-effort, re-scoring after each, and stop at the first set that
  crosses. Where the candidate set is small enough, a bounded exhaustive
  search over subsets up to size three or four finds strictly better paths
  cheaply — and finding a two-item path where greedy proposed four is exactly
  the reader-visible win this technique exists for.
- **State the total, not just the members.** "These four moves, about two
  weeks of work, take you across" is the answer. A list without its total
  cost has not answered the question asked.
- **Test reachability before searching, not after.** Run the ceiling case
  first: set *every* dimension to its maximum and re-score. If even that
  falls short of the threshold, the band is genuinely unreachable from the
  moves currently modelled — return "not reachable", with the distance
  remaining, and no step list at all. Skipping this check and letting the
  greedy loop run produces the subject's most damaging output: a plausible
  path that stops a point or two short and *implies* a crossing that will
  never happen. It also localizes the diagnosis, because unreachability
  usually means the remaining headroom sits in dimensions the current weight
  lens values at zero — a fact worth telling the reader plainly. When the
  ceiling case does clear the floor, the greedy steps are guaranteed to.
- **Recompute the path whenever the score is recomputed.** A stale path is
  worse than none: it names moves already done and omits gaps newly opened.
- **Never present the path as a promise.** Its arithmetic is projections all
  the way down; the same conservatism and labelling rules apply as to any
  single item's claimed gain.

## Which band, and what about the one after

Project to the **next** band only. Multi-band paths look ambitious and behave
badly: the projection error compounds, the effort estimate becomes a fantasy,
and the reader's realistic planning horizon is one step. Where the reader
explicitly asks for a longer view, present it as a sequence of next-band
crossings, each recomputed from the previous one's end state, and let the
widening uncertainty be visible rather than smoothed.

If the reader is already in the top band, this output has no meaning and must
not be manufactured. Replace it with the maintenance question — which
dimensions are closest to falling back — rather than inventing a band above
the ceiling. Derive "the next band" from the canonical band ordering, never
by incrementing a parsed identifier: a hand-edited or drifted band name turns
string arithmetic into a nonsense target, and a top-band subject turns it
into a self-referential one.

Guard the mirror case just as carefully. **"Already at the top" and "I could
not find this band in the ordering" must not return the same result.** A
lookup miss that falls through to the top-band branch renders a drifted or
legacy assessment as maxed out with no path to climb — the most flattering
possible answer produced by the least trustworthy possible input. Treat an
unrecognized band as the lowest one, or as an explicit error; never as the
highest.

## Relationship to the ranked list

The two outputs answer different questions and will disagree, which is
correct and should be visible rather than reconciled away. The ranked list's
top item is the steepest single slope; the cheapest path is often three
modest moves the ranking placed at rows two, five, and nine. Present both,
labelled by the question each answers. Suppressing one because it
"contradicts" the other reintroduces exactly the mental arithmetic the
roadmap exists to do for the reader.

## When not to use it

- **When the score is not banded.** Without thresholds there is no line to
  cross, and the covering computation has no objective; rank by upside and
  stop.
- **When effort estimates are absent or fabricated.** The path minimizes
  effort; with no effort signal it degenerates into "the highest-gain items
  until the threshold", which the ranked list already provides.
- **When the bands are near-arbitrary.** A path optimized to cross a
  threshold nobody defends teaches readers to optimize the threshold. Fix the
  band design first; a cheapest path to a meaningless line is a well-computed
  invitation to game the instrument.
