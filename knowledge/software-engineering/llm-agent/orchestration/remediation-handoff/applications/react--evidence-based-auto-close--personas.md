---
layer: application
type: application
subject: remediation-handoff
technique: evidence-based-auto-close
stack: react
status: forged
verified_on: 2026-10-01
verified_against: react@19
---

# The findings sweep: re-measure per sensor, and keep delivered apart from effective

Personas' dev-tools triage turns sensor signals (Sentry spikes, standards
rules, KPI misses, dormant skills, doc rot, disputed memories) into findings,
dispatches them, and then re-runs the same sensors to judge whether the
dispatched work did anything. The loop lives in
`src/features/plugins/dev-tools/sub_triage/findings/`. Read at `db091018c`.

## What the code knows that the technique learned late

- **The run-completed precondition, per sensor.** `runFindingSweep`
  (`sweep.ts`) adds each sensor's origin to `probedOrigins` only after its
  emitter returns, and `verdictFor` (`verify.ts`) starts with *"HONESTY RULE
  0: absence is only a win when the sensor actually looked"*. A finding
  from a sensor that did not run comes back `pending` with reason
  `sensor_not_probed`. One failed integration freezes only its own findings.
  The technique stated this precondition per run until this pass.
- **Delivered and effective are separate fields.** `status` holds the
  executor's account (`delivered`). `verify_state` holds the re-measured
  effect: `cleared`, `moved`, `unchanged` or `regressed`. Every sweep re-asks
  the second. The file header names the purpose: *"destroying the
  assumption that merged == fixed"*.
- **Identity is the signal's own key**, for example `sentry:${shortId}`,
  `standards:${rule_key}` or `kpi:${kpiId}`, never the title. The cost-sensor
  titles carry the dollar figure while the key stays fixed, so title matching
  would have broken on every reading. The tier problem in
  [claim-carry-forward-rules](../techniques/claim-carry-forward-rules.md)
  cannot occur here.
- **Movement has a floor.** `MATERIAL_IMPROVEMENT = 0.1`: below a 10%
  relative change the verdict is `unchanged`, because *"claiming a win on
  noise is how a loop starts lying"*. The floor is fixed rather than
  measured from a re-run, which is weaker than the technique's noise band.

## The scope hole: a capped emitter reads as a cleared signal

The verify pass in `runFindingSweep` rests on one sentence: *"an emitter only
fires when a signal is over threshold, so a finding whose dedup_key is missing
from this fresh set has had its signal go away."* The converse does not hold.
`emitSentryFindings` (`emitters.ts`) filters to `count >
SENTRY_COUNT_THRESHOLD` (25), sorts, and then applies `.slice(0,
SENTRY_TOP_N)`, which is 3. The skill-dormant, doc-rot and disputed-memory
emitters cap the same way, each at 3 (`findingConfig.ts`). A shipped finding
that three louder issues push below the cap is missing from the fresh set
while still over threshold, and `verdictFor` returns `cleared`.

Experiment, product code unchanged. Personas `HEAD` was exported, and the
real `emitSentryFindings` and `verdictFor` were run under the project's own
vitest config. Arm A verifies against the capped drafts the sweep builds. Arm
B makes one change: it verifies against the uncapped enumeration, produced
by the same emitter applied to each issue alone. The shipped finding was
dispatched at count 120. n = 4 constructed cases with known answers:

| Case | Truth | A | B |
| --- | --- | --- | --- |
| still 110, three louder issues arrive | unchanged | cleared | unchanged |
| falls to 10, under threshold | cleared | cleared | cleared |
| 118, still inside the cap | unchanged | unchanged | unchanged |
| improves to 60, three louder arrive | moved | cleared | moved |

A is right 2 of 4, B 4 of 4, and the two controls agree. Both of A's errors
read as success, and they feed the per-sensor verify rate in
`sensorStats.ts`, which then credits the producer for fixes that did not
happen.

## A reported commit is booked as an effect

`mark_idea_delivered` (`src-tauri/db/src/repos/dev/ideas.rs`) closes an App
Master idea. When the worker reports a commit, it writes `verify_state =
DELIVERED_VERIFY_STATE`, which is `cleared`, and the doc comment defines
`cleared` as the member that "says the signal is gone". A branch-only report
stays `pending`, on the reasoning that a branch is only a pointer. The commit
is stored as evidence but not checked against the repository. A commit shows
that the work exists, not that the signal moved, so this is the executor's
own claim recorded as an effect. The next sweep re-judges the item, which
limits the damage to the gap between the report and that sweep.
