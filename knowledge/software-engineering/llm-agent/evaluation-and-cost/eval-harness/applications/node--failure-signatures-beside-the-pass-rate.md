---
layer: application
type: application
subject: eval-harness
technique: failure-signatures-beside-the-pass-rate
stack: node
verified_on: 2026-09-25
verified_against: node@24
applied: code
ab_verdict: better
proof: before-after
---

# A model-matrix bench whose equal pass rates hid four different problems

A desktop app's model/effort matrix bench scores each headless turn against
declared checks (expected actions, forbidden side effects, a clean op grammar)
and reports pass % per cell and pass/runs per scenario class. The change adds a
section beside those tables: failing runs per failure family (format, omission,
over-action, stall, voice), as case counts, with the number of runs that
declared a check of each family, and raw validator signatures (rejected op,
grammar leak) counted on passing runs as well as failing ones. Replayed over
the bench's stored 1,026 scored runs, nine cells, six classes.

- **Separation.** Of 9 tie groups (same class, same pass/runs, two or more
  cells), 4 split by family: 29/30 on tool selection was an omitted approval in
  one cell and a rejected op in the other; 14/15 on delegation was a turn held
  open past the budget in two cells and an omitted job in three. The class
  table printed these as identical.
- **Agreement.** Two tie groups whose members failed on different scenarios by
  the same mechanism read as the same profile (omission 2 against omission 2),
  so the scheme is not a scenario list.
- **Class is not mechanism.** The format-contract class carried the largest
  gap between model families (80% against 100%); all of it was an omitted second
  op in runs whose output parsed cleanly.
- **Not borne out here.** No passing run carried a raw signature (0 of 1,026),
  so the "every trial" column cost nothing and found nothing on this data.
- **Coverage.** The stall family was declared by 2 of 1,026 runs, voice by 27;
  their zeros elsewhere are not measurements, and the report says so.

Floor: every pre-existing report section was byte-identical after the change
(normalised for the generation timestamp); a deliberately broken pass tally in a
scratch copy made the same diff go red.
