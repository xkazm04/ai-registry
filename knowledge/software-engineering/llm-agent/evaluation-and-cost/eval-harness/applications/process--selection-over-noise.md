---
layer: application
type: application
subject: eval-harness
technique: selection-over-noise
stack: process
status: forged
verified_on: 2026-09-03
applied: code
ab_verdict: better
proof: ab-paired
---

# A judge-retirement rule with three cycles behind it and fifteen pairs inside them

## The seam

An unattended training loop for image-prompt craft runs two machine judges over
every generated pair and treats that as a meta-A/B over the judges themselves.
Its written rule: once **at least 3 gated cycles** show one judge tracking the
human's verdicts better than the other, the winner is pinned in the loop's
overlay config and *the other is dropped from future cycles*.

The rule was drafted against the right failure. Its own prose says so — before
the threshold both judges run and are logged, because "dropping a judge on one
cycle's agreement is exactly the score-over-eye mistake the doctrine lines
forbid." The three-cycle floor is a deliberate noise guard.

**It guards the wrong axis.** Cycles are not the sample; pairs are.

## What the ledger actually holds

The loop's git-tracked verdict ledger carried four gated cycles at the time of
reading, and the geometry is the whole finding:

| Cycle | pairs | challenger picks | between-judge agreement | human |
| --- | --- | --- | --- | --- |
| 1 | 3 | 1/3 | 2/3 | approve |
| 2 | 6 | 1/6 | 3/6 | reject |
| 3 | 3 | 2/3 | 2/3 | approve |
| 4 | 3 | 2/3 | 2/3 | approve |

Fifteen pairs across the four cycles. The judges agreed on nine of them, which
means the entire meta-A/B — a permanent decision to retire an instrument —
rests on the **six pairs where the two judges disagreed**, and the human's
verdict is recorded once per cycle rather than once per pair, so the tracking
comparison it feeds has four data points.

## A and B

The arms are the retirement rule, run over that same recorded geometry (3, 6, 3, 3
pairs) under the null hypothesis that the two judges are **equally good** — so
every pin either arm fires is a false pin by construction.

Judge accuracy was calibrated from the ledger rather than assumed: for two
independent judges each correct with probability *p*, between-judge agreement is
*p² + (1−p)²*, and the observed mean agreement of 0.625 fixes *p* = 0.75
exactly.

- **A — the rule as written.** Pin when one judge leads in ≥ 3 of the 4 cycles.
- **B — the rule plus a resolution precondition.** The same cycle condition, and
  the winner's aggregate tracking margin over all pairs must also fall outside a
  95% two-proportion band.

200,000 trials, deterministic seed, both arms scored on the same simulated
programmes. The harness asserts itself before reporting: a perfect judge against
a coin-flip must trip the rule, and does, 95.1% of the time — the residual is
three-pair cycles the lucky arm ties.

| Arm | false-pin rate under the null |
| --- | --- |
| A — rule as written | **22.8%** |
| B — rule + resolution precondition | **5.8%** |

Close to one programme in four retires a judge that is exactly as good as the one
it keeps. The precondition takes that to roughly the 5% a 95% band should give,
and it costs one comparison at decision time.

## What shipped

Both conditions, in the loop's judge protocol: the cycle count is kept, the
resolution check is added beside it, and the overlay now records the margin and
the pair count a pin cleared on rather than only the cycles it was earned from
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
Where the margin does not clear, the written outcome is *"these two judges are
not distinguishable yet"* — a result that is logged, not a decision deferred.

## The structural fact

The stronger half was not in the arithmetic. **Retiring the loser destroys the
instrument that would reveal a bad pin.** The loop's between-judge agreement
number is definitionally two-judge; once one judge is dropped it cannot be
computed at all, so the only remaining path back is the slower one the protocol
already names — noticing that the pinned judge diverges from the human across
multiple cycles. The rule's own escape hatch is real but strictly weaker than
the signal it just switched off, and nobody designed that: it fell out of
retiring a component that was half of a ratio.

Hence the second change, which the A/B did not measure and which is argued
rather than counted: where a pin is close, keep the loser on a sampled fraction
of pairs instead of dropping it. A thinner instrument still reads; a retired one
does not.

## What this realization cannot do

The false-pin rates are a property of the *rule* against a null, not a
measurement of these two judges — nothing here says the loop's current judges
are equally good, and if one is genuinely better the rule will usually find it
(that is what the 95.1% assertion shows). The number this application moves is
the rate at which the rule fires when there is nothing to find, which is the
number a permanent decision should be priced on.

The model is also the friendly one: it assumes the two judges err
independently. Real judges built on related models err together, which shrinks
the discriminating-pair count below six and makes both rates worse, not better.
