---
layer: application
type: application
subject: claim-verification-and-provenance
technique: derivation-comparison
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: not-better
---

# Node: a live-computed money figure whose stamp is the graph pass only

The politicas repo stamps three families of figures. The composite score and
the forensic-law figures carry the technique's `<formula-ref>@<pass>` shape,
read from a stored provenance row. The **money** figures do not: their
derivation is `kg-pass:<N>`, the graph pass alone, and the value is not stored
at all - it is recomputed from graph rows by one shared function on every
render and on every gate check. The gate compares derivation after value and
already reports `moved (by basis)` for a mismatch.

## What the seam was chosen to falsify

The technique says to version the formula ref on every semantic change, however
small. The money stamp has no formula component, so the obvious reading is
"adopt the ref". The seam was chosen because it could kill that reading: if a
formula change has already happened under an unchanged pass, a pass-only stamp
should have certified a coincidence somewhere. A caught outcome would have
rewritten the decision rule; a miss would narrow it.

## Experiment

Same inputs through the five committed versions of the shared reach function
that bracket the one real post-claim semantic change (a second, company-side
attribution axis that moved 12.75 bn CZK of publicly owned turnover out of the
"reaches the politician" bucket). Product code unchanged; versions replayed
from history through the function's real code path. Three tie cases: a private
owner-operated firm, a steward-class seat, and the municipal-utility case that
the change was written for.

- The per-tie reach figure (the cited value of a tie claim) is **identical
  across the change in all three cases**: the same CZK is reported, only the
  label of the bucket it sits in moved.
- The bucket figures (what the case-file tiles cite) **change value** for the
  affected case (11.82 bn to 0 in the attributable bucket), so the existing
  value comparison already returns `moved (by value)`.
- The pass number did not move between the two function versions: the change
  was a code change, not a graph pass.

Arm B (a formula ref bumped with the change, compared by the gate) would flip
every per-tie citation ever issued to `moved (by basis)` at that commit while
the figure, its meaning and its review state are all unchanged. Arm A (pass
only) missed nothing: the case where the meaning moved moved the value too.

## Verdict: not-better on this seam, with the cost named

Target: a basis mismatch surfaces when the author changes. Floor: no stale
citation certified. A held the floor; B moved the target by raising an alarm
on figures whose value and meaning were untouched, which teaches readers to
ignore the basis label. Scope of the claim: one real change, three cases, a
function with no stored value - not a population measurement.

## What it means for the technique

Two boundary conditions, both written into the technique:

1. A **live-computed** figure has no store to compare against the code, so
   comparison three has nothing to bind to; the value check is run against the
   recomputation at verification time and is the formula comparison.
2. A formula ref is **per metric**, bumped when that metric's definition
   moves. A change to an adjacent predicate that this metric's value and
   meaning do not read is not a bump.

Falsifier: a change that preserves the cited value while changing what the
claim asserts (for example a figure that begins to carry the attribution flag
in its meaning). The tie claim does not carry it today. Return condition: the
first money claim whose body states an attribution class, at which point that
metric needs its own ref.
