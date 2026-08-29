---
layer: application
type: application
subject: content-research-grounding
technique: scale-conversion-of-numbers
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the absent link, and the gate that could not see it

*Verified against the consuming tree at commit `78fe0aa`, 2026-08-29.*

The technique's bookkeeping clause asks that every conversion record
**which fact it converts**, so a downstream gate can check the felt form
against the graded claim it restates. The research asset here had the
field, the rule, and a graph checker that reads it — and all six shipped
conversions were unlinked under a green check.

## The seam

`app/_phases/_shared/notebook/types.ts` declares `ScaleConversion.for` as
the fact id, optional in the type only so the control fixture still
compiles, and states the consequence in the doc comment: "A conversion
with no `for` is uncheckable by construction."

`app/_phases/_shared/notebook/cards.ts:225` already walks the field:

```
nb.scaleConversions.forEach((s, i) => edge(`scaleConversions[${i}]`, "for", [s.for], factIds, "fact"));
```

The blindness is one line up, inside `edge()`: `if (r == null) continue;`.
That skip is correct for an optional array of references — and it means an
**absent** link is indistinguishable from a healthy one, which is exactly
the failure the same file describes for `woundsOf()` two fields over: "a
stale reference and a healthy one look identical — and the one that looks
healthy is the dangerous one, because the board reports no wound and the
reviewer believes it."

## A and B

**A** — the shipped policy. `npx playwright test
tests/golden-path/notebook-graph.probe.spec.ts` passes, including its
strongest case, "the SHIPPED fixture has no broken edges". Six felt forms
sit beside the notebook rather than inside it.

**B** — `notebookIssues()` gains an `unlinked-conversion` kind that reports
a conversion naming no fact, and the six conversions name theirs.

## What was read

The gate the repository already runs, on the same command, three times:

- A: 5 tests green, 0 issues.
- B with the rule and no links: the pre-existing fixture case fails with
  six `unlinked-conversion` findings — `$126,198 → ~$62,000`, `3.67
  million BTC distributed`, `mNAV 3.89x → below 1.0`, `32 BTC sold`,
  `0.70–0.80 correlation with Nasdaq`, `10-year yield ~4.5%`.
- B with the links: green again, and `npm run check:notebook` reports the
  graph resolves.

The A/B is worth more than the fix. Under A the gate was not silent about
these conversions because they were fine; it was silent because the
question was unaskable. Adding the rule turned a green surface red with
no data change at all, which is the only evidence that distinguishes
"checked and clean" from "never checked".

## What the link found on its first day

Conversion index 4 points at `f-correlation`, whose claim is recorded as
"Bitcoin's correlation with the Nasdaq 100 and S&P 500 sits in the
0.70–0.80 range **in risk-on conditions**". Its felt form reads "on most
days, bitcoin is a tech stock with extra steps". The qualifier is gone,
and "in risk-on conditions" became "on most days" — the technique's named
anti-shape, a felt line more vivid than the fact permits.

Nothing in the change catches that. The link is what makes it a finding
rather than a sentence nobody can trace.

## What this realization cannot do or prove

- **It checks that a link exists, not that the conversion is true.** The
  qualifier drop above was found by a person reading two strings side by
  side. The technique's real gate — recomputing the felt form against
  unit, period and denominator — is not built, and the fields it would
  need (`unit`, `period`, `denominator`) are populated on one fact.
- **It cannot cap the conversion at the fact's confidence.** The clause
  "a conversion of a low-confidence figure is itself low-confidence"
  remains unenforced here; the link makes the grade *reachable*, and
  nothing yet reads it.
- **It proves nothing about the other five conversions' arithmetic.** They
  now resolve to facts. Whether "half the value" is the right reading of
  `f-drawdown` is a judgment no check in this tree performs.
- **The rule is one-directional.** It reports an absent `for`; it cannot
  report a `for` pointing at the wrong fact, because both look identical
  to a graph walker. A mis-aimed link is a worse defect than a missing one
  and is still invisible.
