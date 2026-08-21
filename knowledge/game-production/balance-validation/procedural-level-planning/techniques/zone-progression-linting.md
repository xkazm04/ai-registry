---
layer: technique
type: technique
subject: procedural-level-planning
technique: zone-progression-linting
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [authoring a new region into an existing world, checking that a world's zones are reachable and sensibly ordered, a player reports a difficulty wall between areas]
---

# Zone progression linting

One scale above the room graph sits the zone graph: regions with level bands, connections
between them, and an intended order of visitation. The same failures recur here and cost
far more, because zone boundaries are where content, art and narrative have already been
committed by the time anyone notices.

Three checks carry most of the value. They are cheap, they run on the world data rather
than on a build, and each maps to a complaint a player actually makes.

## Reachability — no orphaned zone

**Every zone is entered from at least one zone the player can already be in, and the start
is reachable from nothing.** A zone with no inbound connection is content nobody will ever
see: production spent, no player value. This is a hard failure, not a warning, and it is
the single most common defect introduced by authoring a region without touching the
connection graph — the region exists, validates, and is unreachable.

Check the converse too: a zone reachable only through a zone the player cannot yet enter is
orphaned in practice even though the graph says otherwise. Reachability is computed over
the graph *with* its gating conditions applied, not over the raw adjacency. **A self-loop
does not make a zone reachable** — a region listing itself among its connections is the
most common way an orphan hides from a naive inbound-edge count.

Two neighbouring defects live on the same edges and must be reported separately.
A **dangling connection** — an edge naming a zone that does not exist — is an error about
the edge, not about the target, and collapsing it into "unreachable" sends the fix to the
wrong place. A **dead end** — a zone with no outgoing connection — is a warning rather than
an error, because a terminal region is a legitimate design; exempt the kinds that are
supposed to terminate, and exempt hubs from the inbound check for the same reason. That is
how intent is expressed in this linter: by the kind, declared on the zone, not by a
suppression list.

## Ordering — no band jump that reads as a wall

**The level band a zone is tuned for is consistent with the bands of the zones that lead
into it.** A jump of three levels between adjacent zones reads to a player as a wall rather
than as a step: they arrive under-levelled, attribute the failure to the world rather than
to their build, and go elsewhere — or stop.

**Measure the jump between band edges, and say which edges.** A zone tuned for a band is not
a point, and the gap that matters is *the next zone's floor minus this zone's ceiling* — the
state of a player who has just finished here against the requirement of arriving there.
Comparing midpoints or comparing floors both understate the gap for wide bands, and the
understatement is invisible. State the basis in the rule, not only the number.

This is the room-scale difficulty-cliff signature at a different scale, and the shared
threshold is not a coincidence: three increments is roughly where a step stops feeling like
a challenge and starts feeling like a gate, in both cases. Lint the downward direction as
well; a zone tuned three bands below its predecessor is where a player stops earning
anything and the world stops mattering. Lint the band itself while you are there: a zone
whose declared floor sits above its own ceiling is an error, and it is the single cheapest
finding in this set.

Where the jump is intended — a deliberately punishing optional region — it is recorded as an
intentional gate with a reason, and the linter reports it as gated rather than as clean.

## Single-sourcing — one authority per band

**The zone's partitioning and its band tables come from the one place that already owns
them.** A world typically already has a canonical partitioning of its space and canonical
tables mapping a region to its level band, its spawn set and its rewards. A new region
authored beside those tables, with its own copy of the numbers, is the
[one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity) failure in its
purest form: the map, the spawn tables and the authoring tool now hold three answers to one
question, they agree today, and the disagreement surfaces months later as a tuning bug
nobody can locate.

The rule for generative authoring is therefore explicit and restrictive: **a generated zone
reuses the existing partitioning and the existing data tables; it does not invent parallel
ones.** Where it needs a value that does not exist yet, the value is added to the canonical
table and referenced — not embedded in the zone.

## Procedure

1. **Load the zone graph with its gating conditions**, from the canonical source, and
   **narrow every field before reading it**. This data is persisted and frequently
   machine-authored; a connection entry that is not a zone reference must be rejected as
   malformed, because casting it through will surface later as a fabricated dangling-link or
   reachability finding that costs a real afternoon.
2. **Run reachability from the start.** Report unreachable zones as failures, naming them.
3. **Walk every edge and compare bands.** Report jumps at or beyond the threshold in either
   direction, naming both zones and both bands, and marking the ones declared intentional.
4. **Diff every band, spawn set and reward reference against the canonical tables.** A value
   present in a zone that is not a reference into the table is a finding regardless of
   whether it currently matches.
5. **Emit an explicit positive verdict when nothing fires.** "Connectivity and level flow
   checked, no findings" is a different statement from an empty result, and only one of them
   distinguishes a clean zone from a zone the linter never reached.
6. **Report unevaluated zones as unevaluated.** A zone with no band assigned has no ordering
   verdict; counting it as clean is the collapse
   [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) forbids, and it is
   how a half-authored region passes a world check.

## Decision rules

- **When a zone has several inbound edges with different bands, lint against the lowest.**
  The player will arrive by the cheapest route available to them, not by the intended one.
- **When a band jump is intended, require a stated reason stored with the edge.** An
  unexplained suppression is itself a finding; a reason is what lets the next person decide
  whether the gate still serves the design.
- **When a generated region proposes a new band value, treat that as a request against the
  canonical table**, reviewed by whoever owns progression — not as an edit the generator
  makes.
- **When reachability and ordering disagree about an optional region**, reachability wins:
  an over-tuned region the player can reach is a design problem, while an unreachable one is
  a defect.

## When not to use this

- **Worlds with no level bands at all** — a horizontally progressing world where regions
  differ in kind rather than in power. Reachability and single-sourcing still apply;
  ordering does not, and inventing a band scale so the linter has something to compare is
  worse than dropping the check.
- **Open worlds with deliberate free traversal**, where every region is reachable early by
  design. There the ordering check moves from adjacency to *expected* progression order, and
  a naive adjacency lint will report every edge.
- **As a substitute for tuning.** The linter says the ordering is coherent. Whether any
  individual zone is correctly tuned for its band is a balance question answered by playing
  it or simulating it.
