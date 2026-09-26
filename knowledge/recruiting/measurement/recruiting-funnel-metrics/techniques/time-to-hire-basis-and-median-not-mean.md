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

They differ by everything that happens before the eventual hire entered the
pipeline: approval, posting and sourcing lead time. Published benchmarks do not
measure that last term, so how large it is locally is unknown until you measure
it. A locally computed time to hire compared against a published
time-to-fill benchmark produces a gap of weeks that reflects nothing but the
definitional difference. Whenever a duration is shown next to any external
number, the clock is stated in the same breath or the comparison is withdrawn.

The anchors vary even under one name. The main benchmarking definition starts
time to fill when the requisition is *opened* and measures approval as a
separate segment. Other practitioner definitions start at approval, and
common tracking-system defaults end at the date a candidate was marked hired or
an offer was created. The clock's name is not enough. Put both anchors in the
label.

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

**Never compute it over a short creation cohort.** "Hires among candidates who
entered in the last 30 days" can only contain hires that took under 30 days, so
the figure is capped by the window and reads fast by construction. Anchor a
windowed duration on the *hire* date (terminal basis). If a creation cohort is
the question, use one old enough to have finished.

**Two ways to handle the unfinished, and both are legitimate.** Report completed
durations and in-flight ages side by side, as above. Or estimate the
distribution with a survival method that counts in-flight candidates as
censored, so the slow ones still pull the curve out. In that case treat rejection
and withdrawal as competing outcomes, not as censoring, or the chance of a hire
is overstated. A survival median still does not exist until the curve crosses one
half. Below that it is the same "not yet" state, now with a reason.

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

The median is right for *the typical case*, which is most of what gets asked.
It is the wrong statistic when the duration will be multiplied by a volume.
Recruiter capacity, open-requisition load and total vacancy cost all scale with
the mean: occupancy is arrival rate times *mean* time in system, and a median
there understates the load by exactly the tail it discards. Some reporting
standards also prescribe the average. When comparing against one of those,
compare mean with mean and say so. Name the statistic in the label either way.

The difference matters most when someone subtracts. A mean-based "we cut six
days" on a small cohort is frequently one outlier leaving the window; the same
comparison on medians moves only when the middle of the distribution moved.

## Step 5 — no improvement claim without a measured before

A percentage improvement requires two measurements of the same metric, on the
same basis, at two times. Where no pre-existing measurement exists — the
common case when a process or a tool is new — there is no percentage. Deriving
one from an industry average, a vendor's benchmark or a recalled estimate is
a claim the record does not hold
([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)),
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
  [the law](../../../_laws.md#a-claim-carries-its-sample-and-its-basis) governs
  the refusal.
- When a duration is displayed, display the count of completed hires behind
  it, unprompted.
- When a duration feeds another figure, pass the statistic that figure's
  question needs. A "typical lag" wants the median. A capacity or cost total
  wants the mean. Never pass whichever one the payload happens to carry.
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
