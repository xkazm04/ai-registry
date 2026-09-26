---
layer: application
type: application
subject: candidate-archetype-routing
technique: signal-scored-routing-not-rule-matching
stack: process
status: forged
verified_on: 2026-09-26
---

# The detection engine as data, in a spawned Python pipeline

The hiring pipeline in this repo is a Python analysis process (`pipeline/jobfit/`)
spawned by a TypeScript app. Archetype detection lives in `pipeline/jobfit/registry.py`,
but almost none of the *policy* does: the signals, their weights, the thresholds and the
contradiction rules are all rows in `pipeline/jobfit/archetypes.json`, and `registry.py`
is a small evaluator over them. A TypeScript port of the same evaluator
(`app/features/tools/profile/profileReadiness.ts`) reads the same rows for the profile
editor's live preview.

Re-verified 2026-09-26 against main at `cf9a4b81c`. Line numbers moved and the rows grew
a translatable reason code, and the one latent defect recorded on 2026-08-20 is still
there.

## The signal table is eight rows of data

`archetypes.json:69-76` is the whole detector, for example:

```json
{ "id": "enrolled", "when": { "signal": "is_enrolled", "truthy": true }, "scores": { "student": 2.0 }, "reasonKind": "signal_enrolled", "reason": "currently enrolled" },
{ "id": "switch_strong", "when": { "all": [ { "signal": "wants_domain_change", "truthy": true }, { "signal": "has_substantial_experience", "truthy": true } ] }, "scores": { "career_switcher": 3.0 }, "reasonKind": "signal_switch_strong", "reason": "wants a domain change and has substantial experience" }
```

The signals are observable facts. The weights are round: `enrolled` 2.0,
`expected_graduation` 1.0, `yre_low` 1.5, `yre_high` 1.5, `education_dominant` 1.0,
`switch_strong` 3.0, `switch_weak` 1.0, and `substantial` scoring two archetypes at once
(`bau` 1.0, `career_switcher` 0.5). The heaviest is a compound. None is a birth-cohort
proxy: `expected_graduation` is a future date, evidence of current enrolment, and no row
reads a past graduation year. `docs/features/candidates/README.md:1142-1152` publishes
the table to the team under "Signal-scored, not rule-matched".

## Accumulate, rank, derive confidence from the share

`registry.py:314-330` is the scoring loop: every rule that fires adds its scores and
appends a reason and a code, with no early exit. When nothing fires it returns the
default at 0.4 (323-327). Otherwise it returns
`best, round(scores[best] / total, 2), reasons, codes` (330), the winner's **share of the
total mass**. Ties break by declaration order (`archetype_ids()`, 100-102) and score a
share of 0.5 or less, under the 0.55 threshold. `_eval` (188-202) supports exactly
`all`, `any`, `truthy`, `not`, `lt` and `gte`, and `pipeline/jobfit/tests/test_registry.py`
walks every condition tree to assert each signal name is one the evaluator builds.

## Contradictions run in both directions

`archetypes.json:78-88` carries a contradiction per archetype, including for the
unprotected default: `student` with 3+ years and not enrolled caps at 0.65; `bau` with
enrolment or under a year caps at 0.65; `career_switcher` without substantial experience
caps at 0.7, phrased as a note ("'switcher' usually implies prior professional
experience").

## Where this falls short of the standard

- **One weak signal routes at full confidence.** Share-of-mass reads 1.0 whenever every
  signal that fired points one way. Driving kp's own detector on 2026-09-26 (see the
  sibling application on confidence) showed `wants_domain_change` alone inferring
  `career_switcher` at **1.0**, while a candidate who *declares* the switch on the same
  one fact is capped at **0.7** by the contradiction above. The machine is believed over
  the person on identical evidence.
- **The cap is an assignment, not a `min`.** `registry.py:307-311` sets
  `confidence = contradiction["confidence"]` in a loop, unchanged since 2026-06-02, and
  the TypeScript port copies it (`profileReadiness.ts:116`, `confidence = c.confidence;`).
  With two contradictions for one archetype, the last would win. It is latent: each
  archetype has exactly one.
- **The signal table has no review cadence.** Nothing samples routings: no labelled
  audit, not even of the reviewer-corrected ones, and no calibration.
- **The published table is a hand transcription, and it has drifted.** The README's row
  for `has_substantial_experience` reads "bau +1.0". The data also gives
  `career_switcher` +0.5 on the same row, the one entry a rule chain could not express.
  "It can be shown" holds only for a table generated from the file.
