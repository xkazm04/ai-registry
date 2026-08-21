---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: goal-seek-on-a-seeded-monotonic-lever
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [solving for the multiplier that hits a target survival rate, replacing manual slider hunting, deciding whether a solver may be trusted]
---

# Goal seek on a seeded, monotonic lever

Designers do not want to sweep a lever and read a chart. They want to type a target —
"survival should be seventy percent" — and be told what to set. A goal-seek solver does
that: given a target metric value, a lever with a range, and a function that evaluates
the metric at a lever value, it bisects for the lever value whose metric hits the target
within tolerance. Perhaps a dozen evaluations, an answer a designer can type in.

The technique is trivially easy to implement and easy to ship broken. Everything that
matters is in the precondition.

## The contract, stated before the code

Two conditions must hold or the solver is not solving anything:

**The metric must be monotonic in the lever over the range.** Bisection assumes a single
crossing. Against a metric that rises then falls, it converges on whichever crossing its
bracketing happened to trap, silently, with a confident-looking result.

**The evaluation must be seeded.** This is the one teams discover the hard way. A Monte
Carlo metric evaluated twice at the same lever value returns two slightly different
numbers. That noise makes the metric non-monotonic at small scales, so bisection near
convergence stops following the signal and starts chasing the noise — and the solver
returns a different answer every run. Nobody debugs this quickly, because every part of
it looks correct: the simulation is right, the bisection is right, and the result is
garbage. The fix is that the caller passes a fixed seed, so `metric(v)` is a
deterministic function of `v`. Averaging over many iterations reduces the noise but does
not remove it; determinism does.

Write both conditions in the solver's own documentation, at the top, as a contract on
the caller. A precondition that lives only in someone's head is a precondition that will
be violated by the second caller.

## The procedure

1. Normalise the range, evaluate the metric at both ends, and note the direction of
   travel from the two endpoint values rather than assuming increasing.
2. **Bracket check.** If the target lies outside the achievable interval spanned by the
   endpoints, do not iterate. Return the nearest reachable endpoint together with
   `converged: false`, the achievable range, and a sentence saying the target is
   unreachable over this lever. This is the most common real outcome and it must be a
   *result*, not an exception: "you cannot get there by moving this knob, and the closest
   you can get is here" is exactly what the designer needs to know.
3. **Degenerate check.** If the metric is identical at both ends, the lever does not
   influence the metric over this range. Say that, and report whether the flat value
   happens to meet the target.
4. **Bisect.** Halve, evaluate, and move whichever bound keeps the target bracketed given
   the direction. Stop when the metric is within tolerance of the target.
5. **Bound the work.** Cap the iterations — a few dozen is far past the point where
   floating-point halving stops moving the lever meaningfully. On exhaustion return the
   best value found with `converged: false` and the tolerance it failed to reach.
6. **Always return the evaluation count.** It is the honest price tag, and a spike in it
   is the first sign the metric has stopped behaving.

A default tolerance proportional to the target — a fraction of a percent of it, with a
small absolute floor so a target of zero still terminates — is the right shape, because
an absolute tolerance that suits a survival rate is meaningless for a damage number.

## The result is a record, not a number

Every field of the returned record earns its place: the target, the solved lever value,
the metric actually achieved at it, the evaluations spent, whether it converged, and a
human-readable reason. Callers that unwrap only the lever value and ignore the
convergence flag will present a clamped endpoint as a solution — which is the failure
mode this shape exists to prevent. A non-converged solve is not a quiet approximation;
it is an unmeasured answer wearing the same type as a measured one, and the flag is what
keeps them different.

## Verify monotonicity before you trust the answer

The solver cannot check its own precondition cheaply, so the discipline sits in the
workflow: **sweep before you solve.** Evaluate the lever at a modest number of points
across the range, confirm the curve rises or falls without reversal, then solve inside
the region where it does. This costs perhaps twenty evaluations once and prevents a class
of confidently wrong answers.

Where a closed form exists — an expected-value weighting, a simple analytic rate — use
it and skip the numeric solver entirely. A general bisection engine earns its keep only
on levers with no closed form: a tuning multiplier feeding a whole simulated fight, a
faucet amount feeding a net-flow measurement. Keep the analytic solvers, and make sure
they are actually reachable from a surface; a correct solver wired to nothing is a
correct solver nobody uses.

## Decision rules

- If the metric is a Monte Carlo output, pass a fixed seed. If you cannot, do not solve —
  sweep and let a human read the chart.
- If the target is outside the achievable range, report the range. Never report the
  clamped endpoint as though it were a solution.
- If two levers must move together, this is not goal seek; it is optimisation over a
  surface, and bisection does not apply.
- If the solve converges but the achieved metric sits at a cliff — a small lever change
  producing a large metric change — flag the fragility. A converged answer on a cliff
  edge is technically correct and practically useless.

## When not to use it

- **On a non-monotonic metric.** Sweep instead; a chart that shows a peak is honest, and
  a solver that hides one is not.
- **On a metric the lever barely influences.** A near-flat curve converges anywhere
  within tolerance and produces a precise-looking number with no authority behind it.
- **When the lever is discrete.** Bisection over a continuous range will return a value
  between two legal settings. Enumerate instead — a handful of legal options is cheaper
  to evaluate exhaustively than to solve over.
