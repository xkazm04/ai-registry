---
layer: technique
type: technique
subject: prompt-assembly
technique: compaction-horizon-breakeven
status: forged
laws: [limits-are-derived, count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [deciding at runtime whether a completed step is worth compacting away now, a compaction fires at the window threshold and nowhere else, choosing the denominator for a compaction's break-even, a second compaction is proposed before the first one has repaid its rewrite, a compaction policy needs a cache write/read ratio it cannot look up, the provider reprices the whole request above a prompt-length threshold below the window]
---
# Compaction horizon break-even

[context-budgeting](./context-budgeting.md) authorizes shrinking a standing
layer with arithmetic: a one-time cost against a per-inclusion saving,
producing a break-even in inclusions. It leaves the number of *future*
inclusions to the operator's judgment — "material included a handful of times
a week" — which is fine for a layer edited offline and useless for a decision a
harness has to make in the middle of a run. [amortized-compaction-cadence](./amortized-compaction-cadence.md)
supplies the reclaim-size gate that makes each rewrite pay for itself, and then
says the trade against the cache discount is "decided by the deployment rather
than by the design". This technique owns the runtime form of that decision:
**a transcript compaction is authorized when its rewrite repays before the
run's remaining horizon, and the horizon is estimated from the run itself.**

## The arithmetic, with the premium made explicit

Three numbers describe a candidate compaction: the tokens the fold would
remove from every later request (`archive`), the tokens the memo replacing
them costs (`memo`), and the tokens the rewrite pushes back through the cache
as a fresh write (`write` — the summary plus whatever recent tail is kept). A
prefix cache prices a write above a read, and the ratio of the two prices is
the only price input the decision needs:

> saving per request = `archive − memo`
> rewrite cost = `write × (ratio − 1)`
> break-even = rewrite cost ÷ saving per request, in requests
> **compact when break-even ≤ expected remaining requests**

`ratio − 1` because the prefix would have been re-read anyway; only the
premium over a read is new cost. A ratio of `1` says the cache charges nothing
extra to write, and the break-even collapses to zero — compact whenever the
saving is positive. A saving of zero or less ends the question before any
horizon is consulted; a memo that is not smaller than what it replaces is not
a compaction.

## The horizon is derived from the trajectory, not from the benchmark

The denominator is what the operator's judgment was standing in for, and a run
can estimate it about itself. The run declares its own boundaries — a step of
its working plan marked completed — and each boundary records how many
provider requests it took. The estimate is then:

- **requests per boundary**, the mean over completed boundaries, taken as a
  lower bound under small samples (halve the mean below three samples, or
  `mean − k·σ` once there are enough), because an optimistic horizon licenses a
  rewrite that never repays;
- **times the boundaries still pending**, plus one for the request that
  follows;
- **capped by the window**: `(window − context now) ÷ average positive context
  growth per request` is the most requests the run can make before the wall
  forces a compaction anyway. Take the minimum of the two. On a model whose
  price book bands by prompt length, "the wall" in that cap is the step
  below, not the window.

No boundaries yet means no horizon, and no horizon is a declined compaction
with the reason `horizon unavailable` — not a default horizon. The same holds
for a missing ratio. Every declined boundary records which of a closed set of
reasons declined it (economic, window protection, deferred on margin, deferred
on carried debt, horizon unavailable, ratio unavailable, non-positive saving),
because a compaction policy whose refusals cannot be counted cannot be tuned
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Three asymmetries the plain test misses

- **The first compaction is cheaper than it looks.** It establishes the memo
  every later compaction reuses, and it runs on the most uncertain horizon
  estimate a run will ever have. Widen its horizon (one shipped system doubles
  it), still capped by the window.
- **Every later compaction is dearer than it looks.** A rewrite committed
  before the previous one repaid leaves debt: the unrecovered premium is carried
  forward and added to the next rewrite's cost, so the combined break-even must
  clear the horizon, and the plain break-even must clear it with margin (the
  same system asks for one and a half times). The debt is repaid per request
  out of the saving, and a run that keeps compacting faster than it repays is
  churning its own cache.
- **The wall overrides all of it.** Within a reserve of the window, compact
  regardless of the arithmetic: the alternative is the provider's refusal, and
  a refusal costs the whole request.

## When the price book moves the wall

Everything above treats the window as the one place a request suddenly gets
dearer. It is not always the only place. Some providers band their pricing by
prompt length: above a declared input threshold the request moves to a higher
band, and the *whole* request reprices, not just the tokens past the line. On a
model priced that way the step is a second wall, and it usually sits far below
the window.

The arithmetic says why it is a wall and not one more input to the test. Below
the step, the saving per request is `archive − memo`. At the step, staying under
it also saves `(band multiplier − 1)` times the whole prompt, on every later
request. That saving is the size of the transcript, which is exactly the regime
in which the test declines nothing. So **within the same reserve of the step,
compact regardless**, as at the window, and let the break-even govern only
what happens below it.

- **Read the step from the price book, per model, when the session starts.
  Never write it into the harness.** Steps are dated vendor facts and they
  move: in September 2026 one provider's current generation billed a
  million-token window at one flat per-token rate after its earlier models had
  banded above two hundred thousand, while another provider was reported to
  double above roughly two hundred and seventy thousand. A step hardcoded from
  one model is a missing wall on the next model that has one, and a forced
  compaction on the next model that does not. Fix it for the session beside
  the cache ratio, with the date it was checked, for the same reason the ratio
  is fixed ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
- **No band, no step wall.** On a flat-priced model, a context size where some
  other model's step would sit is not a wall. Whether compacting there pays is
  this test's ordinary question, not a forced answer.

A replay over 190 real coding-agent sessions (26,299 requests, the harness
compacting near a million tokens) puts a size on it. 60% of requests ran above
two hundred thousand tokens and 37% above two hundred and seventy thousand.
Priced under a band that doubles the whole request at the higher of those two
thresholds, with no step wall, the same traffic costs 58% more input. With the
wall at the step the band premium is zero, and 186 of the 187 compactions the
wall adds repay by the test above. What the replay cannot see is the other side
of the ledger: compactions rise from 9 to 187, each one lossy, and nothing in a
price replay measures what that does to the task. The same replay on the flat
book is a warning in the other direction: a wall at the same point still cut
priced input by a third, through prefix reads alone. The window is not where
the economics put the threshold on either book. It is where the harness puts
it, and the fidelity cost of moving it is still unmeasured.

## What the test governs, and what it cannot

A replay of the rule over real coding-agent sessions draws the boundary
sharply. Across 166 sessions on a harness with a window near a million tokens,
threshold compaction fired 8 times; each one removed roughly nine hundred
thousand tokens per later request and broke even within 0.8–2.2 requests,
against 34–791 requests remaining. At the wall the break-even gate declines
nothing, at any ratio tried, because the saving is the whole transcript. **The
test decides whether to compact early — at a boundary where the saving is one
completed step's worth and the rewrite could plausibly outweigh it. It never
argues against compacting at the wall, and a system that only compacts at the
threshold has nothing to gain from it.** Its value is the trigger it licenses:
a semantic boundary, considered on every completion, acted on only when the
arithmetic says the run will live long enough to collect.

The ratio is a stated policy, fixed for the session, not a live price lookup:
a decision rule that re-priced itself on a model switch would flip mid-run
without any boundary having moved. State the ratio beside the rule, with the
date the price it mirrors was checked ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
The plan and the per-boundary progress that the estimate depends on are
control state that must survive the compaction they trigger; the session
subject's compaction-checkpoint technique owns that crossing, and the
post-compaction reminder to rebuild the plan is what re-arms the next boundary.

## Decision rules

- Compute `break-even = write × (ratio − 1) ÷ (archive − memo)` and compact
  only when it is at or below the expected remaining requests.
- Estimate remaining requests from the run's own completed boundaries, as a
  lower bound, capped by what the window admits; with no boundaries, decline
  with the reason recorded.
- Widen the first compaction's horizon; require margin and carry unrepaid
  premium into every later one.
- Compact regardless inside the window reserve, and inside the same reserve
  of a prompt-length price step when the model's price book carries one; read
  the step per model at session start, never from a constant.
- Treat the ratio as a dated, session-fixed policy value, and treat a
  non-positive saving as no candidate at all.

## When not to use this

- **Threshold-only compaction.** The replay above: at the wall the test is
  vacuous. Adopt the boundary trigger first, or adopt nothing.
- **Projection regimes.** [tiered-history-projection](./tiered-history-projection.md)
  rewrites nothing; there is no premium to repay.
- **A provider without a prefix cache, or one that prices writes at reads.**
  The break-even is zero and the reclaim-size gate in
  [amortized-compaction-cadence](./amortized-compaction-cadence.md) is the
  whole decision.
