---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: dead-end-versus-authored-ending
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding whether a terminal node is an ending or a bug, hunting a softlock in a conversation, declaring the ending set of a branching scene]
---

# Dead end versus authored ending

The named concern: separate the terminals a writer meant from the terminals an edit
created, and then find the terminals that are not terminals in the graph at all — the nodes
whose every exit is closed for a player in a particular state. The first half is a set
difference. The second half is where the shipped softlocks live.

## Declare the endings; do not infer them

A terminal cannot be classified by looking at it. The node that ends the story and the node
whose successor was deleted last Tuesday are the same shape, carry equally finished text,
and sit equally happily in the editor. Any heuristic — "terminals with more than N words are
endings", "terminals tagged in the text are endings" — encodes a convention that one author
will violate on the day it matters.

So the ending set is **declared**: an explicit list of node identities, each with the name
the game will show for it and the state it asserts on the way out. Validation is then a set
difference in both directions, and both directions find real defects:

- a terminal not in the ending list is an **accidental dead end** — a defect, always,
  reported at failure level;
- an entry in the ending list that is not a terminal is a **leaky ending** — the story
  continues past the point the game will record as an ending, which produces the
  characteristic bug where the credits state one outcome and the next scene plays another.

Where no declaration exists, the honest report is that the graph's endings are unknown, and
unknown must render as unknown. Substituting a heuristic's guess produces a green result
about a question nobody answered, which is
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass) with a convention
standing in for the measurement.

## The three kinds of dead end

Ranked by how hard they are to find and how much they cost.

**Structural.** No outgoing edges, not declared. Found by the cheapest possible scan, fixed
in seconds, and still the most common finding on a graph that has been restructured — a
branch re-parented, its old tail left behind.

**Guarded.** The node has edges, and every edge's guard is false in some reachable state.
This is the true softlock: the graph is connected, the validator is happy, and one player in
one state stands in a conversation with no way out. It is found by asking, for each node,
whether the disjunction of its outgoing guards is a tautology over the declared variable
domains — and where it is not, by searching for a reachable state that falsifies all of
them. A default or fallback edge with no guard makes the disjunction trivially true, which
is why an unconditional exit on every choice node is the standard defence.

**Cyclic.** Edges exist, guards pass, and the traversal returns to a node it has already
visited in the same state, forever. A conversation loop is not itself a defect — returning
to a hub is normal, and a player leaves it by choosing differently. It becomes a defect when
no exit from the cycle is reachable *from within* it: every path out is guarded on state
that only nodes outside the cycle set. Detect it as a strongly connected component with no
outbound traversable edge, and treat a component of size greater than one with no exit
exactly as you treat a dead end, because to the player it is one.

## Softlock is a property of the state, so report the state

A softlock finding is worthless without the state that produced it. "Node 61 may have no
exits" sends an author to stare at node 61, where every guard looks reasonable, because each
one is reasonable — the defect is the combination. "Node 61 has no traversable exit when the
lantern flag is false and the trust value is below two; reached from node 12 by declining
both offers" is a bug report a writer fixes in one edit.

That discipline also protects against the characteristic failure of exhaustive walkers:
they over-report. A search over a state space will call a situation unwinnable when it is
merely gated on a resource the search did not know how to obtain. A finding that carries its
state is a finding somebody can reproduce and dismiss in a minute; a finding that carries
only a node identity is a finding the team eventually stops reading. The rule is that a
softlock report is a lead, and the evidence rung it is proven at is the rung the search
reached — never the rung of an observation nobody made, which is
[structural proof is necessary and never sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
applied to the search itself.

## Decision rules

- **When a terminal is not declared, fail it.** Not warn. The set difference is exact, and a
  warning-level finding on an exact check trains everyone to ignore exact checks.
- **When a choice node has no unconditional exit, require one** — a fallback line, a leave
  option, a return to a hub. This one rule eliminates most guarded dead ends at authoring
  time and costs one edge per node.
- **When a guard set cannot be proven exhaustive over the declared domains, report the node
  as at risk and name the uncovered region.** "Uncovered when the mood is neither hostile
  nor friendly" tells the author that a third enumeration value grew without the graph
  noticing.
- **When a cycle has no exit reachable from inside it, treat it as a dead end.** Do not
  soften it because the player is technically still able to press buttons.
- **When a softlock is fixed, add the state that produced it to a regression set.** Softlocks
  recur, because the edit that reintroduces them is a normal-looking edit somewhere else.
- **When the runtime can end a conversation by an external means** — a timer, a combat
  interruption, a universal cancel — do not let that be the answer to a guarded dead end.
  It is an escape hatch, not an ending, and the player leaves the scene with the state the
  scene was supposed to set left unset.

## When not to use this

- **On graphs whose exits are all runtime-injected**, such as a barked exchange where the
  runtime decides when to stop. The terminal set is not a property of the graph, and the
  check will report every node.
- **As a search over the full state space of a large scene.** The guarded pass is bounded by
  the declared domains; if those are unbounded, bound the search deliberately and report the
  bound rather than letting it run and reporting whatever it found.
- **Before the ending declaration exists.** Running the set difference against an empty
  ending list flags every terminal, which is technically correct, useless, and the fastest
  way to have the check disabled.
