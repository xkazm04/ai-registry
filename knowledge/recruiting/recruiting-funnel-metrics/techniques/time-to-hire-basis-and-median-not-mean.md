---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: time-to-hire-basis-and-median-not-mean
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [defining a speed metric, comparing hiring speed to a benchmark, reporting a duration to leadership]
---

# Time to hire: fixing the basis, then taking the median

A duration metric is defined by four choices, taken in this order: which
clock, which two anchors, which cohort, which central statistic. Teams argue
about the fourth and get the first three wrong.

## Step 1 — name the clock

Three distinct quantities compete for the word "speed":

| Clock | Starts | Ends | Answers |
| --- | --- | --- | --- |
| Time to fill | the role is opened | the offer is accepted | how long a business need goes unmet |
| Time to hire | this candidate enters the process | this candidate accepts | how fast the process moves a person |
| Time in stage | entry into one stage | exit from it | which step is slow |

They differ by the sourcing lead time, which in most functions is the largest
single term. A locally computed time to hire compared against a published
time-to-fill benchmark produces a gap of weeks that reflects nothing but the
definitional difference. Whenever a duration is shown next to any external
number, the clock is stated in the same breath or the comparison is withdrawn.

## Step 2 — fix both anchors, including the messy one

**Start anchor.** For time to hire the honest start is the candidate's first
recorded entry into the pipeline for *this* role — not their profile creation
date, which for a sourced or re-engaged candidate can predate the requisition
by a year. Where a candidate re-enters after a terminal outcome, the clock
restarts; carrying the original start forward manufactures a 300-day hire out
of a two-week one.

**End anchor.** Offer accepted, not start date. The interval between them is a
notice period the employer does not control, varies by market and seniority by
weeks, and folding it in scores a recruiting team on a candidate's contract.
Where a start-date-based figure is genuinely wanted — capacity planning does
want it — it is a separate, separately named metric, never a redefinition of
the same one.

**Non-working time.** Decide once whether the clock is calendar days or
business days and never mix. Calendar days is the defensible default: it is
what the candidate experiences, and it is comparable across markets with
different holiday calendars. A business-day clock quietly improves every
figure in a month containing a shutdown.

## Step 3 — the cohort is terminal, and it is survivorship-biased

Time to hire can only be computed for candidates who were hired, which makes
it a terminal-transition metric by construction. Two consequences must be
carried with the number:

- It **cannot fall below** the age of the fastest completed hire, so a process
  that just got slower shows no movement until the slow candidates finish. A
  duration metric is a lagging indicator; the leading indicator is the age of
  the in-flight population.
- It **excludes everyone who never finished**. If the slow candidates are also
  the ones who withdraw, the metric improves precisely as the process gets
  worse. Pair it with the in-flight age distribution, which sees exactly the
  population the duration metric cannot.

## Step 4 — median, with the tail carried explicitly

Report the median. Hiring durations are right-skewed with a heavy tail:
re-opened requisitions, candidates parked and revived, roles frozen and
resumed. On a cohort of twenty hires, one 200-day revival moves the mean by
roughly eight days while the typical experience moved by nothing.

- **Median** is the headline. It is what "usually" means and it is stable
  against the observations least representative of the process.
- **p75 or p90** carries the tail when the tail is the point — a fairness or
  candidate-experience question is often *about* the slow quartile.
- **The mean** is reported only alongside the distribution, never as a lone
  "average time to hire", and never as the input to a difference.

The difference matters most when someone subtracts. A mean-based "we cut six
days" on a small cohort is frequently one outlier leaving the window; the same
comparison on medians moves only when the middle of the distribution moved.

## Step 5 — no improvement claim without a measured before

A percentage improvement requires two measurements of the same metric, on the
same basis, at two times. Where no pre-existing measurement exists — the
common case when a process or a tool is new — there is no percentage. Deriving
one from an industry average, a vendor's benchmark or a recalled estimate is
a claim the record does not hold
([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)),
and it is the specific move that makes every other honest number on the same
page suspect. State the current value and the cohort it was measured on; let
the second measurement create the trend.

## Decision rules

- When the audience is leadership asking about unmet demand, report time to
  fill; when it is a process owner asking where to intervene, report dwell.
  Never answer either question with the other number.
- When the cohort of completed hires in the window is too small to support a
  median, withhold the figure rather than reporting a mean of three — the
  small-sample discipline governs the threshold, and
  [the law](../../_laws.md#a-claim-carries-its-sample-and-its-basis) governs
  the refusal.
- When a duration is displayed, display the count of completed hires behind
  it, unprompted.
- When any candidate row is simulated, seeded or demo data, it is excluded at
  the query, not caveated at the chart.

## When not to use this

Do not use time to hire as a quality or efficiency proxy. It is trivially
optimized by lowering the bar, by skipping a stage, or by hiring only the
candidates who were already convinced — all of which shorten the clock and
none of which are improvements. Where the question is really "is the process
good", the duration is one input among several and never the scoreboard.

Do not use it to compare unlike roles. Executive, regulated and
security-cleared hiring have structurally different clocks; a single
organization-wide median is a number about the role mix, and it moves when the
mix moves. Segment by role family or say that you did not.
