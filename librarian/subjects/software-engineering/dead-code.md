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

## 2026-08-31 - intake(pgrust): a third rot axis, named in the file's own prose

`suppression-hygiene` enumerates **two** rot axes and says so in a sentence that
reads as complete: stale-match reaps entries whose *target* died, the reaper clause
reaps entries whose *justification* died. Both are properties of the entry as
written, and the technique is thorough about both.

The third is a property of the world the entry sits in: **an entry whose target is
alive and whose reason still holds, but whose reach grew.** The file already names
the hazard - a pattern that outlives its author "will eventually re-match something
new, silently exempting code its author never saw" - and has no instrument aimed at
it, because the only check pointed that way fires on entries matching *nothing*.

Corroborated by within-source convergence across three subsystems written by
different workstreams in one tree: a differential oracle's known-wart list ("a wart
hit is counted - suppressed, never invisible"), a lint's exemptions file ("prints
each exemption it applies… never skips one silently"), and a training-corpus
quarantine ("prints a loud line for every exclusion, so it cannot rot into
silence"). Three surfaces, one rule.

**Measured on a managed project, and the tree had already paid for it.** A lint debt
ratchet whose committed baseline states its own predicate - population = repository
minus the ignores block - carries one entry removing **305 of 677 files (45%) and 19
live warnings**, with neither number in any output. The entry is correct and its
comment records the incident that produced it: a second checkout doubled every
bucket, the ratchet went red, and *the gate could not say the rise was reach rather
than debt*, so it read as "you added fourteen hook violations" and pointed at a
refactor nobody needed. Reach was never a number. Structural fact nobody designed:
that entry's reach is set by how many agent worktrees exist that day, so it moves
with no commit touching config, baseline or source.

The corrective is a count taken where the entry fires, and the strongest form is the
one this project already has for findings and not for reach - a committed count the
run compares against, which turns the axis into an ordinary ratchet. Adjacent from
the other side: `quality-gates/severity-by-construction` owns the enforcement-vs-display
two-channel model for **flags**; neither subject owned an entry's firing volume.

## 2026-09-04 - lead from the `/deepen` batch ([[2026-09-04-1]])

- Landed (Director, one paragraph): suppression-hygiene's "prefer the suppression
  that fails when the defect is repaired" now carries the reverse link to
  quality-gates/false-positive-economics, which today gained the forward one. The
  lifecycle stays here; the severity decision stays there.
