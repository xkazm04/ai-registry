---
domain: software-engineering
subject: dead-code
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# dead-code

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner codebase

`instrument-per-orphan-class` gained a fifth elimination-facing class from
[[../../sources/2026-08-22-onecli-repo]]: **unexercised verifiers** - checks
whose only trigger is a lapsed human habit; they read as coverage while
rotting. Observed base rate in the source tree: four of six hand-run proof
scripts rotted unnoticed; all six deleted. Repair rule: wire into a lane or
delete.

## Declines

None.

[[2026-08-31-remeda]]: intake of a utility library repository's agent-facing
instructions. `suppression-hygiene` amended in two places, plus a `rust`
application carrying the run's cleanest measurement.

**Our own enumeration was ranked backwards.** The technique's reaper clause
offered "an expiry date, a re-review cadence, or the checkable condition under
which it lapses" as interchangeable. The source rejects the first outright, with
a mechanism the corpus had not considered: a date expires on a schedule nobody
chose, so it fires at whoever runs the instrument that day - no context, mid-task
on something unrelated, holding a red build they did not cause. It works exactly
as designed and still arrives at the wrong person, so the cheapest available
repair is to push the date out. **A reaper whose most probable outcome is its own
postponement has bought a recurring interruption and no reaping.** The amendment
ranks the forms and names the version threshold as the practical realization of
the checkable condition, because it fires when someone takes the action that makes
the deferred work relevant.

Third sighting of the rank-our-enumerations shape, and the sharper form of it: a
flat list read left-to-right teaches its first item as the default, so the check
is not only "is this ranked" but **"is the order we implied backwards."**

**The second half is the stronger one and it was not in the source's own framing.**
The suppression's *form* can carry its own reaper: a directive asserting a finding
is expected stops being satisfied when the finding stops occurring, while an
override that forces the value through succeeds identically forever. Where both
exist the first is mandatory - the one case `creation-names-reaper` is satisfied
with **no reaper clause at all**, and strictly better than any clause, because it
fires on the real condition rather than a proxy for it.

Measured on a managed project's Rust workspace and it is not close: the surface is
**0.7% self-retiring** (6 against 829), and a paired check on one crate - same
sources, one minute apart, only the suppression form changed - went from **0
warnings to 63**, so **63 of 71 (89%)** guarded code that is no longer unused. A
cheap grep-shaped proxy estimated 79% tree-wide, within ten points of the compiler
and conservative by construction, which removes the usual reason the cleanup never
starts. Nobody chose the 829:6 ratio; it is the sum of 835 local decisions none of
which was about retirement.
