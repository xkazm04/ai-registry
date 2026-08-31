---
layer: application
type: application
subject: dependency-declaration
technique: declaration-invariants
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Ten units, no self-declaration, three disagreeing registries

A connected desktop application has a plugin system: ten feature units, each in
its own directory under a shared root, each self-contained in its code. The
question this technique asks is not whether the units are well built — they are —
but **where each unit's existence is declared, and who owns that file.**

## Arm A: the mechanism as it stands

Three central surfaces name plugins: a browse registry that renders the catalogue,
an icon map, and a route-section list. Arm B is the same ten units under a local
declaration — each ships its own manifest and the host discovers them.

| | Arm A | Arm B |
| --- | --- | --- |
| Central surfaces a new unit must be added to | **3** | 0 |
| Of those, files the unit's author owns | **0** | — |
| Units declaring anything about themselves | **0 / 10** | 10 / 10 |
| Surfaces that can disagree about the population | 3 | 0 |

**Locality fails, definitionally and completely.** Every one of the three
declaration surfaces is a file no unit owns. A plugin author cannot state that
their plugin exists; somebody with commit access to three unrelated central files
must do it on their behalf. That is the technique's locality diagnostic answered
in its worst form — *ask who has to edit a file when a unit is added*, and the
answer is never the unit's author.

**Composability fails as a consequence.** Adding a unit is not a local act, so two
units added independently touch the same three files. The instrument for this is
not a metric but a fact about the workflow: concurrent authors collide on the
registries rather than on the plugins.

**Scalability holds.** Only direct units are listed and there is no transitive
closure to enumerate — the invariant that does not fail here, and worth stating,
because the three fail independently and a report that found all three broken
would be less credible, not more.

## The structural fact, and the caveat it needs

The census found **no unit present in all three surfaces**, and three units in
none of them.

That number needs an honest qualification before it is used as a defect count: the
three surfaces have *legitimately different populations*. A route list should
contain only units that are routes; an icon map should contain only units with a
custom icon. Absence from one of them is not automatically a bug, and a reader who
took "0 of 10" as ten defects would be overstating it.

What survives the qualification is the finding, and it is sharper than the raw
number: **the three surfaces produce three different answers to "which plugins
exist", and nothing anywhere states which of them is authoritative.** There is no
file that enumerates the units. The nearest thing to a definitive list is the
directory listing — a filesystem fact that no code consults. So the population is
knowable only by reading three lists that were each written for a different
purpose, and reconciling them by hand against a directory.

Nobody designed that. It is what a central declaration surface produces when there
are three of them and no unit can speak for itself: each list is maintained by
whoever needed it, each drifts independently, and the drift is invisible because
every list is individually plausible. Had locality held — one declaration per
unit, owned by the unit — the three surfaces would be *derived views* over one
authority and could not disagree.

## What this realization cannot do

The census scores a static property: which central files mention which directory
ids. It cannot tell whether a given absence is a real omission or a correct
exclusion, which is precisely why the finding is framed as *the surfaces disagree
and no authority resolves them* rather than as a count of missing registrations.
Establishing which absences are bugs requires per-unit product knowledge the
instrument does not have and deliberately does not guess at.

It also measures a mechanism whose scale is small. Ten units and three surfaces
is a tractable amount of drift that a person could reconcile in an afternoon; the
technique's claim is about what happens as those numbers grow, and this tree is
evidence for the shape of the failure rather than for its cost. The cost claim
stays untested here.
