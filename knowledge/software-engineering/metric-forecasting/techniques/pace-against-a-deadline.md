---
layer: technique
type: technique
subject: metric-forecasting
technique: pace-against-a-deadline
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [judging whether a goal will land by its deadline, reporting required rate to catch up, designing goal progress]
---

# Pace against a deadline

A threshold estimate asks "when will this happen". A goal asks "will this
happen **by then**", and the difference is not cosmetic: the comparison is no
longer against a fixed level but against a **moving line** — the trajectory
that starts at the goal's baseline and lands exactly on the target at the
deadline. Pace is the signed gap between the projection and that line.

## The three quantities

Everything a pace surface needs comes from three computations, in this order:

1. **Where the target line says we should be today** — baseline plus the
   fraction of the goal's duration already elapsed, times the total distance.
   This is a pure calendar computation, with no dependence on the metric's
   history at all.
2. **Where we actually are** — the last real observation, the same anchor the
   projection uses.
3. **Where the projection lands at the deadline** — the anchored ray evaluated
   at the deadline date, per
   [trend-fitting-and-anchoring](trend-fitting-and-anchoring.md).

The first two give the *current* verdict: ahead, on track, or behind by a
stated amount. The third gives the *forecast* verdict: projected to land at X
against a target of Y. Both are worth reporting and they routinely disagree —
a goal can be behind today and projected to make it, which is the single most
useful thing a pace surface can say, and it is invisible if only one of the
two is computed.

## The required rate is the output that matters

A verdict alone prompts an argument. The remedy prompts a decision:
**the gain still required per remaining period** — distance remaining divided
by periods remaining, stated in the same unit and cadence the team already
uses to talk about the metric. "Behind — needs 3.1 points per week for the
remaining five weeks, against a current pace of 1.4" is actionable in a way
that "behind" never is, and the ratio between the two numbers (2.2× the
current pace) is the honest measure of how much trouble the goal is in.

Two edges: when the remaining time is zero or negative the goal is over, and
the output is met or missed, never a required rate divided by nothing. When
the required rate exceeds any rate the metric has ever historically sustained,
say so — that is the difference between "behind" and "not going to happen",
and it is computable from the same history the fit came from.

## The verdict vocabulary is defined once

Ahead / on-track / behind / at-risk is a closed vocabulary with numeric
tolerances behind it, and the tolerances are the whole content of the words.
It needs one more member that implementations routinely forget: a **neutral
verdict** for the two states where no judgement is possible — the goal has no
deadline, or the history is not yet fittable. Collapsing those into "on track"
is the most flattering possible lie, and collapsing them into "behind" is a
false alarm on every newly created goal. A distinct neutral term ("tracking")
says the goal is being watched and not yet judged, and it lets a surface show
the estimated date alongside it when one exists.
If the goal detail view calls a 4% shortfall "on track" and the weekly digest
calls it "at risk", one goal has two truths and every conversation about it
starts with reconciling them. One authoritative definition, every consumer
deriving from it —
[two hand-maintained copies of a vocabulary are a race with a delay
fuse](../../_laws.md#one-authority-per-vocabulary). That includes the badge
colours, the sort order, and the filter chips, all of which encode the same
enum.

Tolerance is worth having rather than treating any shortfall as "behind":
metrics are noisy, and a verdict that flips between refreshes trains readers
to ignore it.

## The baseline is the whole computation's foundation

The failure that invalidates everything above is a data-model error, not an
arithmetic one: **progress computed as current-over-target is not distance
travelled.** A goal that starts at 60 and targets 80 is 75% "complete" the
instant it is created. Every pace verdict built on that ratio congratulates a
team for standing still, and the goal shows steady "progress" while the metric
is flat.

Distance travelled requires a **baseline captured at goal creation** and
stored with the goal — the metric's value at the moment the commitment was
made. Progress is then current minus baseline over target minus baseline, and
that number is zero on day one, which is correct and occasionally
unwelcome. The baseline is minted once, at creation, and travels with the goal
thereafter; recomputing it later from the earliest available observation
[breaks the identity the goal was created with](../../_laws.md#identity-survives-reuse)
— the earliest available observation moves as history is pruned or backfilled,
so a goal's progress would silently change without anyone touching the goal.

Where no baseline was stored, be honest about the degradation: report the
current value against the target and refuse the percentage. A fabricated
baseline (the first observation in the retained window, the target minus a
guess) is worse than none, because it renders as a real number.

Two consequences at the goal's edges. **A goal already met at creation is
rejected at creation** — with a baseline equal to the target there is no
distance to travel, and every downstream pace verdict divides by zero. And a
goal whose target is *moved* mid-flight either keeps its original baseline and
discloses the change, or becomes a new goal; silently re-basing rewrites
history a team already reported on.

## Decision rules

- **When the goal has a deadline, compute both verdicts.** Where we are now,
  and where the projection lands.
- **When reporting a verdict, report the required rate beside it.** The
  verdict is the headline; the rate is the content.
- **When the required rate has never been sustained historically, say
  "unreachable at any observed pace".**
- **When no creation-time baseline exists, refuse the progress percentage.**
- **When the projection is not presentable, the current verdict still is.**
  "Behind by 6 points today" needs no fit; only the forecast verdict does.

## When not to use this

- **Goals without a metric history** — a commitment to a qualitative outcome
  has no series to pace; pace it by milestones instead.
- **Metrics that move in steps.** A goal that completes in one release makes
  linear pacing read as failure until the day it reads as success.
- **Very short goals.** Over two or three periods the projection is noise and
  the current-position verdict is the only honest one.
- **As a performance judgement of individuals.** A pace verdict is a property
  of a plan, and attaching it to a person converts a forecasting tool into an
  incentive to game the metric.
