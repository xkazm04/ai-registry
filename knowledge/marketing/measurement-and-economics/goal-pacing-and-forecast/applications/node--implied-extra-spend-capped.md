---
layer: application
type: application
subject: goal-pacing-and-forecast
technique: implied-extra-spend-capped
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Implied extra spend, capped - the solver was right and the card said something else

Verified against `systedo-case` at commit `7bbd1cab` (2026-10-22), `package.json` engines
`node: 24.x`. The prescription lives in the pacing module of the metrics layer and is read
by one dashboard card.

## What the tree already did

The arithmetic follows the technique. The shortfall is max(0, required minus recent). With
a fitted response curve and positive spend, a bisection solves the curve at today's daily
spend, bounded at three times that spend. Without a curve, the shortfall is divided by the
trailing 28-day return. A zero-spend window prices to zero. The card had already fixed the
incident the technique names: hover and footnote both read the same basis field. The
existing tests pinned the cap value and the zero-spend fallback. The tree was implemented,
so the seam was chosen to find where the *wording* broke the rule.

## The seam chosen to falsify "the surface states the promise the number makes"

Two states read as something they are not:

1. **The capped answer was quoted as an estimate.** The solver returned the ceiling when
   even three times today's spend could not close the gap. The module comment said "the UI
   shows 'at least this much'", but nothing in the result said the cap had been hit. The
   card printed "≈ +X/day", which is step 3's forbidden case.
2. **An unpriceable shortfall read as "the pace is enough".** With no spend in the window,
   or spend and no attributed revenue, the implied spend was 0 and the basis still said
   "average". The card hid the spend line, as step 4 asks. But its fallback hover was the
   on-pace sentence, printed beside a required-pace tile coloured as behind. Hiding the
   number was not enough when the copy that replaced it gave the opposite verdict.

## A and B

Five fixtures went through the real `monthlyPacing` and the card's wording choice: curve
under the cap, curve at the cap, zero spend, spend with no revenue in the window, and on
pace. Target: fixtures whose wording contradicts the number's state. A: 3 of 5. B: 0 of 5.
The capped answer reads "at least" and carries a lower-bound footnote. Both no-return
cases read "cannot be priced", with the basis marked unknown. B adds a cap flag and an
`unknown` basis to the result, plus one pure helper that the hover, the footnote and the
assistive text all read from. Floor: the under-cap and on-pace wording is unchanged. The
34 pacing tests pass (7 new). One pin moved: the zero-spend basis now reads unknown
instead of average. Typecheck and lint are clean. The full unit suite ran 4387 tests with
2 failures, in the embeddings and social-plan wall-time tests, which touch no metrics.

## What this realization cannot do

It does not apply the >2x divergence rule. The card shows one basis, and the average
answer is not computed beside a curve answer, so a saturated account is not called out in
the narrative. It does not price the shortfall in profit terms, and it has no sample-data
guard on the line. Each is a further change at the same seam.
