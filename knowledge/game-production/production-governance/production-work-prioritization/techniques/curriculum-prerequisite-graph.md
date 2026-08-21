---
layer: technique
type: technique
subject: production-work-prioritization
technique: curriculum-prerequisite-graph
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [deciding which areas of a project are even eligible to be worked next, auditing an ordering constraint someone asserted in a meeting]
---

# Curriculum prerequisite graph

A declared, acyclic graph of *areas* — modules, systems, content classes — where an edge
from A to B means **B cannot be meaningfully built or judged until A exists and can be
exercised**. It answers eligibility, not priority: it says what may be started, and says
nothing about which of the eligible things is best.

## The edge test

There is exactly one admissible reason for an edge, and stating it is the whole
discipline: *work on B, done before A exists, cannot be evaluated and will be redone.*

Run every proposed edge against three counter-questions:

1. **Could B be authored today and compile?** Almost always yes. A compile-time
   dependency is a build order and belongs to the build system, not here. If your only
   argument for an edge is a compile error, delete the edge.
2. **Could B be *judged* today?** If the acceptance check for B requires exercising A —
   feeling the combat, watching the animation blend, seeing the drop land — the edge is
   real.
3. **What specifically gets redone?** Name the artifact that would be thrown away. "Tuning
   passes" is a real answer. "It would feel wrong" is not; press until it becomes an
   artifact.

An edge that survives all three carries its justification in the declaration. An edge
without a written reason is a preference someone smuggled in as a constraint, and it will
block real work for a quarter before anyone re-examines it.

## Procedure

1. **List areas at one granularity.** Mixed granularity — a whole subsystem beside a
   single feature — produces a graph nobody trusts. Ten to forty areas is the workable
   band.
2. **Draw only backwards edges.** For each area, ask what must already be exercisable.
   Never ask "what does this enable" — forward authoring reliably invents edges.
3. **Assert acyclicity mechanically**, at load, on every change. A cycle makes every area
   in it permanently ineligible, which presents to an operator as an empty
   recommendation list with no explanation — the worst failure this instrument has.
4. **Record empty prerequisite sets explicitly.** An area with no prerequisites is a
   declared root and a valid, meaningful entry; an area *missing from the graph* is
   undeclared and must not be silently treated as a root. The two states are different
   and the difference is exactly what tells you the graph is incomplete.
5. **Derive dependents from the edges, never author them.** The reverse index — who is
   waiting on this — is the input to fan-out and must have one authority. Two hand-kept
   lists of the same relation disagree within a month, silently.
6. **Version the graph and date each edge.** An edge added before an area was
   restructured is stale evidence about a project that no longer exists.

## Decision rules

- **When an area's prerequisites are all complete, it is eligible — not recommended.**
  Eligibility feeds ranking; it never substitutes for it.
- **When an area is a root and untouched, it stays eligible indefinitely.** Roots
  accumulate. That is not a bug: it is the graph correctly declining to invent an
  ordering it has no basis for. Let the ranking break the tie.
- **When two areas each want the other as a prerequisite, one of them is mis-scoped.**
  The fix is almost always to split one area into the part that is genuinely prior and
  the part that is genuinely posterior — not to drop an edge.
- **When an edge is disputed, resolve it with the redo question, not seniority.** If
  nobody can name what gets thrown away, remove the edge and let ranking decide.
- **When the graph has more than a handful of areas with a dozen-plus prerequisites**, it
  has stopped being a curriculum and become a schedule. Curriculum edges are sparse;
  a dense graph means someone encoded a plan, and plans belong in the ranking layer where
  they can be argued with.

## Granularity: areas, not items

Keep the curriculum at area level and handle within-area ordering separately, with a
plain list of item-level prerequisites local to that area. Two reasons. A curriculum with
thousands of item nodes is unmaintainable and will be quietly abandoned. And item-level
prerequisites are naturally *one-directional adjustments* — an unmet sibling prerequisite
can only ever make an item less ready, never more — which is a much weaker claim than a
curriculum edge and should not be dressed in the same clothes.

## When not to use this

- **Genuinely parallel content production.** Fifty independent props with no ordering
  relation need a queue and a budget, not a graph. Forcing edges to make the tool look
  used produces a fake ordering that constrains real people.
- **Research and exploration work**, where the point is to discover what the
  prerequisites are. A curriculum over unknowns encodes a guess as a constraint.
- **As a schedule.** The graph says what is eligible, not when anything happens. The
  moment someone reads dates off it, it will be maintained to protect the dates rather
  than to describe the dependencies, and it stops being true.
