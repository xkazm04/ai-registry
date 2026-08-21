---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: stage-pass-through-and-dwell-time
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [locating a pipeline bottleneck, defining stage conversion, building a per-stage aging view]
---

# Stage pass-through and dwell time

The funnel's two per-stage measurements answer different questions and fail in
different ways. **Pass-through** asks how many get out the far side.
**Dwell** asks how long they wait inside. A stage can have excellent
pass-through and be the worst thing in the pipeline, because everyone
eventually passes — after eleven days.

## Stage identity comes from a role, never a label

Pass-through between "Phone Screen" and "Tech Screen" is meaningless the day
someone renames a column. Both measurements key off a stable stage **role** —
entry, screening, interview, offer, terminal — with an explicit order, so a
board edit changes what a recruiter reads and nothing about what is counted
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
Where a team has three interview-role stages, the role mapping is
many-to-one and the ordering within a role is part of the mapping, decided
once.

Two consequences that are not obvious:

- **Skips are legal.** A referral entering directly at interview never
  occupied the screening stage. Pass-through denominators must be built from
  candidates who actually *entered* the upstream stage, not from everyone
  upstream of it in the ordering.
- **Backward moves happen.** A candidate returned from interview to screening
  has two entries into screening. Decide once whether that is one dwell
  observation or two; summing them into one long dwell invents a wait nobody
  experienced.

## Pass-through: the denominator is entries, not residents

Stage pass-through is *candidates who left this stage forward* over
*candidates who entered this stage*, both on a creation-cohort basis over a
matured window.

The three ways it goes wrong:

- **Residents as denominator.** Dividing by who is in the stage *now* mixes a
  stock with a flow and produces a number that moves when nothing happens.
- **Immature cohorts.** Candidates who entered the stage yesterday are in the
  denominator and cannot be in the numerator; the rate is depressed by exactly
  the freshness of the inflow.
- **Rejections and withdrawals collapsed.** A stage that loses candidates to
  withdrawal is telling you something different from one that rejects them.
  Forward-exit, rejected, withdrawn and still-here are four states, and
  pass-through is forward-exit over entries with the other three named.

Publish pass-through as a chain only when the stages are contiguous in the
role ordering. A "chain" containing a stage most candidates skip multiplies
rates that never applied to the same people, and the product understates the
end-to-end conversion badly.

## Dwell: the median of entered-to-exited, plus the age of those still there

Dwell for a completed passage is exit timestamp minus entry timestamp,
medianed over the stage's completed passages. But the completed passages are
the survivors, and the pathology is precisely the candidate who has been
sitting there for three weeks and has not exited. So dwell is always reported
as a pair:

- **Median completed dwell** — how long the step takes when it works.
- **Age of the current occupants**, at least as a maximum and a count over a
  threshold — where the problem actually is.

A stage whose median dwell is 4 days and whose oldest occupant is at 31 days
has a queue-discipline problem, not a speed problem, and only the pair shows
it. This is also the metric that touches
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints):
aging is not merely an efficiency signal, it is the measurable form of a
person waiting on you.

## Calling a bottleneck

A bottleneck claim directs recruiter effort, so it must clear a bar:

1. **A minimum sample of observations at the stage.** An amber "candidates
   wait N days here" backed by one candidate misdirects work away from the
   stage that is genuinely slow. The threshold belongs to the small-sample
   discipline; the requirement is
   [the law](../../_laws.md#a-claim-carries-its-sample-and-its-basis).
2. **A comparison that exists.** "Slowest stage" requires at least two stages
   with sufficient samples. One qualifying stage is not a ranking.
3. **Volume weighting.** The stage with the longest dwell is not the
   bottleneck if two candidates a quarter pass through it. Rank by dwell times
   throughput, and say which you ranked by.
4. **Structural dwell excluded or labelled.** A stage that is genuinely a
   wait — a scheduled panel a week out, a background check with a fixed
   turnaround — has an irreducible floor. Flagging it every week trains people
   to ignore the flag.

## Aging thresholds are per stage, and they are defaults

One global "stale after N days" cut flags the wrong cards in both directions:
a fortnight freshly applied is normal, three days sitting on an unsent offer
is a stall worth chasing. Aging thresholds are therefore **per stage role**,
ordered roughly by how much of the wait the employer controls — long at the
inbound end, short at the offer end — with terminal stages exempt entirely
(a hire does not age). Two properties keep them honest:

- They are **defaults a team can override**, because the right threshold is a
  property of that team's process, not of the metric. A threshold presented as
  a fixed truth gets ignored the first time it is wrong for a role family.
- The threshold is a **surfacing rule, not a verdict**. It decides which cards
  a recruiter is shown; whether the stage is *bad* requires a goal someone
  set, which is the honest-presentation discipline's call and not this one's.

## Decision rules

- When a stage has high pass-through and high dwell, it is a queue, not a
  filter: fix scheduling and reviewer load, not the bar.
- When a stage has low pass-through and low dwell, it is a filter working
  fast; check whether it is filtering the right thing, which is a selection
  question and not this metric's business.
- When pass-through exceeds 100%, candidates are entering the downstream stage
  without an upstream entry record. Fix the entry record; do not clamp.
- When a stage's occupants are mostly older than the median completed dwell,
  the median is describing a population that no longer exists — lead with the
  aging table.

## When not to use this

Do not use pass-through as a per-interviewer or per-recruiter scorecard. Stage
outcomes depend on inbound quality, role difficulty and the mix of sources; a
low pass-through can be the most valuable filtering in the pipeline. Attaching
it to a person converts a diagnostic into an incentive to advance weak
candidates.

Do not compute dwell across a stage boundary that the role mapping merged. If
three interview stages collapse to one role, dwell over the merged role
answers "how long is the interview phase", not "how slow is the panel" — and
the two are frequently answered as though they were one.
