---
layer: application
type: application
subject: campaign-anomaly-triage
technique: one-target-reciprocal-thresholds
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# One target, reciprocal thresholds - a paid-portfolio target threaded through pure triage

Verified against the systedo-case workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24.x per
`package.json` engines. The whole triage layer is a pure module with no framework,
no styling and no database import (`src/lib/campaigns/triage.ts:1-6`), which is the
property that lets one predicate serve the table cell, the row badge, the banner
and the historic timeline.

## The structural fact: the band existed, and construction closed it

`src/lib/campaigns/triage.ts:23-32` is the technique's evidence. The critical bar is
one typed constant, `ROAS_CRITICAL_RATIO = 0.6`, and its cost-share sibling is
derived, `PNO_CRITICAL_RATIO = 1 / ROAS_CRITICAL_RATIO`. The comment records the
incident the technique is built on: the sibling *was a hand-typed 1.6, which is not
the reciprocal and left a [1.6x, 1.667x) band where the PNO cell went red but
ROAS/triage stayed neutral*. Two cells disagreed about one campaign inside that
band, and the fix was not to type more decimals but to remove the second constant.
That is the technique's claim confirmed by the tree, with the failure mode on
record rather than hypothesised.

The two tone predicates that colour the cells read those constants and nothing
else: `roasMetricTone` at `triage.ts:52-56` (good at or above target, bad below
`target x 0.6`, neutral between) and `pnoMetricTone` at `triage.ts:58-63` (muted at
zero, good at or below target, bad at or above `target x 1/0.6`). The lower-is-
better metric inverts the comparison, not the number.

## The target is declared once, in one form

`src/lib/targets.ts:10-14` declares `PAID_PORTFOLIO_TARGET_PNO = 0.18` and derives
`PAID_PORTFOLIO_TARGET_ROAS = 1 / PAID_PORTFOLIO_TARGET_PNO` (about 5.6x). The
header comment (`targets.ts:1-8`) states the scope rule the technique requires: the
blended whole-business goal lives elsewhere, this module defines only the paid
portfolio target, and *every surface MUST label its scope so the two targets never
read as a contradiction*. The campaign domain re-exports them as `TARGET_PNO` and
`TARGET_ROAS` (`src/lib/campaigns/types.ts:154-156`) rather than re-declaring them.

The anomaly alert path had once carried its own `0.15` goal; `src/lib/campaigns/
anomaly-alerts.ts:22-26` now aliases `DEFAULT_PNO_GOAL` to the same paid-portfolio
constant, with the comment naming the *rogue 0.15 that split-brained against*
triage and reporting. Two surfaces, one target - after an incident, again.

## Per-client goals go through one resolver

`triage.ts:151-157` (`triageGoals`) builds both targets from a single `pnoGoal`:
`targetPno = pno`, `targetRoas = 1 / pno`. `resolveGoals` at `triage.ts:136-149`
falls back to the module constants for any missing, non-numeric, non-positive or
non-finite field, so a blank or corrupt profile cannot flip a rule. The test
`test-unit/campaigns-triage-goals.test.mjs:47-58` asserts that no goals, undefined
goals and goals built from the default `pnoGoal` produce identical results;
`:69-78` asserts the reciprocal derivation and the degenerate fallback; `:94-107`
asserts the cell tones follow the threaded target rather than the constants.

## The optional break-even is a second reference, not a second target

`TriageGoals.breakEvenRoas` (`triage.ts:116-125`) is threaded only when a persisted
cost model supplies a margin, and the only rule that reads it (`below_breakeven`,
`triage.ts:210-231`) is inert without it, so margin-blind clients stay byte-
identical (`campaigns-triage-goals.test.mjs:125-141`). The agreed target is never
replaced by break-even, which matches the technique's "when not to use" clause.

## Thresholds as this tree's constants

| Constant | Value | Footing |
| --- | --- | --- |
| `PAID_PORTFOLIO_TARGET_PNO` | 0.18 | the client's agreed number |
| `ROAS_CRITICAL_RATIO` | 0.6 | practitioner convention |
| `PNO_CRITICAL_RATIO` | 1/0.6 | derived, not convention |

## Deviation

The scope label is a rule stated in the comment, not enforced: nothing in the tree
prevents a new surface from rendering the paid target without naming its scope.
The standard stays - every surface labels scope - and the tree relies on review
rather than on a type to hold it.
