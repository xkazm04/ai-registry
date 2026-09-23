---
domain: software-engineering
subject: templates-scaffolding
last_touched: 2026-09-23
touched_by: deepen
dry_streak: 0
---

# templates-scaffolding

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-23 - `/deepen` batch ([[2026-09-23-2]])

First sweep. Chosen on 7 deviations in one project, all judged before the subject last
changed; 4 of the 7 turned out fixed in the project on 2026-09-17, and none needed a
subject edit to explain it - the fixes' details did the teaching.

**New technique `instance-upgrade`** (the subject's seventh): accepting an "improved
since you adopted" offer without erasing the adopter's edits. The provenance stamp (stable
id, frozen version, answers) is the merge base; regenerate, diff, re-apply. Four lanes
converged: blind, current-practice (project-scaffolding update tools that do exactly this
loop), counter-evidence (templates that reference rather than copy), and a corpus grep
with no prior art. **Ten corrections**, the load-bearing ones: the divorce rule holds for
what a template *copies*, not what it *references*; the readiness gate reaches only what is
absent at adoption, with later failure owned by run-time health; the dominant schema
language never validates a default, so the membership check must be written; a "verified"
badge names what was checked and against what; timing absence is a fourth, bounded
*pending* state.

**Apply (four rows, [[applied]]):** 3 `better`, 1 `not-better`. The new technique was
caught at the offer: the project's seeder rewrote shipped recipe content 783 times across
32 commits without moving the version off its first value, so the out-of-date offer fires
for none of 132 recipes even though the stamp is written and the fire test passes (on a
hand-set fixture). Condition written: the fire test moves the version through the
publisher's own content-change path, and a version derived from content cannot be skipped.
The readiness row added a refinement: a gate's reach is set by the predicate it reads - a
presence-only gate also passes a credential already failed at adoption.

### Impact (registry map, regenerated 2026-09-23 after this landing)

personas: 8 verdicts stale (7 `deviation`, 1 `conformant`); personas-web: 1
(`not-applicable`). The project's `/conform --stale` queue; 4 of the 7 deviations are
already fixed in the tree.

## Open leads

- Recipe instances carrying a non-default version, and whether adopters edit adopted use
  cases in practice. Return: the first seeder change that bumps a version.
- A tamper test at the catalog door. Return: `/conform` on the project's integrity context.
- Trigger rows keyed to a use-case id survive re-adopt un-rekeyed (a project defect found by
  the apply, not a subject gap). Return: `/conform`.

## Proposals

- The run-time half of readiness (pause, name the requirement, link the reconnect) could be
  cited from credential-vault's health-probing. Not placed.

## Declines

- A blog statistic on shared-workflow credential failures (no method). Validator option
  names from recall (unverified; written nowhere).
