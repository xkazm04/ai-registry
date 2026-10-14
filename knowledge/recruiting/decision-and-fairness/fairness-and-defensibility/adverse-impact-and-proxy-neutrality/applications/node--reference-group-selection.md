---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: reference-group-selection
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Reference choice and input repair in a demographic-blind hiring platform (TypeScript)

The four-fifths primitive in this tree already implements most of the technique:
the reference is the highest-rate group among those that clear the minimum
cohort (so a four-person group at 100% cannot be the yardstick), it is tracked
by row index so a duplicate group name cannot exempt a row, a malformed pasted
row is listed by line number, and an empty numeric field is malformed rather
than a zero. Two clauses were not met, and the seam hunt was aimed at the one
that could have shown the primitive broken.

## What A was

- **The clamp was silent.** Impossible counts (selected above considered,
  negative) were clamped into range, which the technique requires, but nothing
  recorded that it had happened. A row of 200 selected of 100 became a 100%
  group, became the reference, and every other group was measured against an
  invented rate with no trace on the result or in the UI. Under a data-chosen
  reference this is the quiet verdict flip the technique names.
- **The reference rate was only implied.** The reference row showed its own rate
  in the table, but the result carried no statement of the rule or the rate the
  others were measured against.

## What B was

The result gained a per-row `clamped` flag, a `clampedRows` count and the
`referenceRate`. The check now prints one line naming the reference group, its
rate and the minimum cohort it had to clear, and a status line when any row was
repaired, telling the reader the reference rate may come from repaired input.
Both strings exist in all four locales.

## What was read

The new unit test pins both states, the dirty case, the clean case and the
no-reference case. Arm A (the new test against the old primitive) failed that
one test and passed the other 29; arm B passed 30 of 30, type-check, lint and
the i18n parity gate clean. The existing behaviour (reference selection, ties,
duplicate names) is untouched; the floor, the 29 prior tests, did not move.

## What it did not do

The rule is stated per result but not recorded as a policy field, because the
primitive offers one rule only: there is no second reference rule to report
beside it, and no consumer-selectable reference, which is the correct absence.
