---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: reachability-and-orphan-detection
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient, an-instrument-proves-it-had-input]
shared_with: []
use_when: [proving every node of a conversation can be reached, checking that every declared ending is attainable, auditing a graph after a restructuring pass]
---

# Reachability and orphan detection

The named concern: prove, by walking the graph rather than by reading it, that no node is
stranded, that no reachable node leads nowhere, and that every ending the author declared
can actually be arrived at. It is the cheapest check in the subject and the one that finds
the most defects per unit of effort, which is why it belongs in the save path rather than
in a report.

## The three walks

A graph needs three traversals, not one, and they answer different questions. Run all
three; the temptation is to run the first and stop, and the first is the least
interesting.

**Forward, from every declared entry.** Mark every node touched. What is unmarked is an
**orphan**: content that exists, parses, and cannot be reached. The entries must be a
declaration — the list of nodes an external trigger may start this conversation at — and
not inferred from "nodes with no inbound edge", because that inference makes every orphan
into an entry and produces a graph that is fully reachable by construction. A validator
that cannot report a single orphan on a knowingly broken graph is not passing; it is
blind.

**Backward, from every declared ending.** Reverse the edges and walk from each terminal
the author declared as an ending. An ending that does not reach any entry is
**unattainable**: promised in the summary, listed in the achievement table, and impossible
to see. This is the walk teams skip, and it finds the defect with the worst
player-facing consequence, because the player who hunts for it has been told it exists.

**Backward, over all nodes, for co-reachability.** From the union of the declared endings,
reversed, mark everything. An unmarked node that the forward walk *did* mark is the worst
category in the family: a node a player can reach from which no ending is reachable. It is
a hole the player falls into. Forward-only validation calls it fine, because it is
connected — inbound.

The three findings are different defects with different fixes and must be reported under
different names. Collapsing them into "unreachable node" produces a list a writer cannot
triage.

## Reachability of edges, not only of nodes

A node is reachable if some edge into it is traversable, and an edge is traversable only if
its guard can be true. So the walk carries a state predicate, not just a mark, and the
useful cheap version is a **conservative** one: an edge is provisionally traversable unless
its guard is unsatisfiable given the declared domain of the variables it names. That is
decidable without enumerating anything for the guard forms that dominate real graphs —
equality against a value outside the declared set, a conjunction with a contradiction in
it, a comparison against a bound the domain excludes.

The conservative walk is deliberately optimistic: it never reports an edge as dead unless it
can prove it. Reachability findings must be false-negative-biased, because a false orphan
report costs an author twenty minutes of proving a node is fine, and three of those teach
the team to ignore the tool. Where the analysis cannot decide, it says so rather than
guessing, and the undecided edges are the input to the more expensive state search.

That is also the boundary of what the walk proves. A node marked reachable by a
conservative walk is *not proven reachable in play* — it is proven not-orphaned. The
stronger claim needs a state-level search, and any status derived from the structural walk
must name which of the two it is.

## Entries, and the mistake of one

The declared entry set is usually longer than one, and treating it as one is a recurring
source of false orphans. A conversation is commonly entered at different nodes depending on
what happened before: a first meeting, a return visit, a version keyed to a completed
quest. Every one of those is an entry, and each needs its own forward walk, because the
union answers "is any node stranded" while the per-entry results answer the more useful
question — which nodes are reachable *only* on the first-meeting path, and is that what the
author intended.

The same applies in reverse for re-entry after an interruption. If the runtime can resume a
conversation at an arbitrary node — a save reloaded mid-scene, a barked interruption that
returns — then that node is an entry for the purposes of the state contract even if no
author ever listed it.

## Decision rules

- **When a node is unmarked by the forward walk, report it as an orphan and never as a
  warning-level nicety**, because unreachable content is not done work under
  [compiling is not wiring](../../../_laws.md#compiling-is-not-wiring). It exists, it
  parses, and no player will see it.
- **When a declared ending fails the backward walk, fail the artifact.** A promised ending
  that cannot be reached is a broken commitment to the player, and unlike an orphan it is
  visible in the game's own summary of itself.
- **When a node is forward-reachable and not co-reachable, escalate above both.** The
  player can be put somewhere the story cannot end.
- **When entries are inferred rather than declared, stop and get the declaration.** An
  inferred entry set makes the check tautological and the tautology is invisible from the
  outside — the report is green because the question was rewritten.
- **When an author disputes an orphan, add the missing edge or delete the node; do not
  suppress the finding.** A suppression list on a reachability check accumulates until it
  covers the defect the check exists to find.
- **When the graph is generated, run the walk before any quality grading and refuse to
  grade a graph that fails it.** Grading unreachable prose spends a review budget on
  content nobody will read.

## Assert the instrument before the result

A walk over an empty graph touches nothing, finds nothing unreached, and returns a clean
result. A walk over a graph whose edge list failed to load finds every node orphaned, which
is at least loud; the empty case is the dangerous one, because vacuous success is
indistinguishable from real success in every report that shows only a status.

So the walk states its own preconditions before it states a verdict. No nodes is **not
measured**, not a pass. No declared entries is not measured. No declared endings makes the
backward walks not measured rather than trivially satisfied. And the passing result carries
its counts — nodes walked, edges traversed, entries used — so that a reader can see the
instrument had something to work on. A checker that can return a pass without having
touched anything will eventually be the reason a broken artifact ships, and the fix costs
one guard clause written before the loop.

## Reporting

Attach each finding to the node, with the shortest path that demonstrates the problem.
"Node 47 is an orphan" is a fact; "node 47 is an orphan — its only inbound edge is from node
12, which is itself unreachable from any entry" is a fix. Where the walk is conservative,
say so in the finding, and count the undecided edges as their own number: a graph with four
hundred edges and sixty undecided has a much weaker reachability claim than one with four
undecided, and a report that shows only the defect count hides that difference.

## When not to use this

- **As the sole evidence that a conversation is playable.** The walk is structural, and
  [structural proof is necessary and never sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
  is not a formality here: the canonical shipped softlock is in a graph whose every node
  was reachable.
- **On a graph whose entries are genuinely unknown**, for example one still being drafted
  with its trigger undecided. Run it as an author aid with findings marked provisional, not
  as a gate — a gate on an incomplete declaration teaches authors to fill the declaration
  with placeholders.
- **On a graph that permits arbitrary jumps at runtime** — a debug console, a chapter
  select, a scripted teleport into a scene. Every jump target is an entry, and until those
  are declared the walk is measuring a graph the runtime does not have.
- **As a substitute for the ending audit.** Reaching a terminal is not the same as reaching
  an *authored* terminal, and a walk that only proves connectivity will happily certify a
  graph whose exits are all accidental.
