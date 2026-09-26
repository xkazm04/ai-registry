---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: time-to-hire-basis-and-median-not-mean
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# One time-to-hire sample, three statistics, and a creation-cohort cap

An analytics surface in a Next.js hiring app computes time to hire once and hands
it to four readers. Read on 2026-09-26 at one pinned commit (Node 24). The sample
is honest; the basis it is drawn on, and the statistic each reader takes from it,
are where the technique bites.

## The sample: the right anchors

`app/_lib/analytics-cohort.ts:138-144` builds the sample: for every entry that
counts as hired, `stage_changed_at − created_at` in days, dropped if negative or
unstamped. The start anchor is the entry's creation *for this role*, not the
person's profile, so a re-engaged candidate's clock starts on the new application.
The end anchor is the move into the terminal column, and the accept route is the
one writer of that move (`app/_lib/analytics-momentum.ts:15-17`), so the clock ends
at acceptance, not the start date. Calendar days throughout. `timeToHireSamples`
carries the sample size separately from the hire count (`:94-96`). A hire missing
either stamp is a real hire that the duration cannot see, 4 of 9 on the shipped
corpus by the tree's own count (`AnalyticsStatCluster.tsx:59-63`).

## The basis: a creation cohort, age-matched for deltas, not for the headline

In a windowed view the sample is drawn from the window's **creation cohort**:
entries created in the last N days (`app/_lib/db/analytics.ts:352-365`). That
cohort can only contain hires that took less than N days. The tree knows this.
Its org benchmark refuses a window for exactly this reason: "a short created-at
cohort can only contain the hires that already finished"
(`app/_lib/db/org-benchmarks.ts:15-21`). It also fixed the delta. Each cohort is
judged as of its own window's end, so the current and prior windows "have had the
same 0..N days to mature" (`analytics-cohort.ts:20-26`). The comment records the
bias this removed: "the time-to-hire delta [read] as an improvement, every time,
with no change in behaviour."

The headline did not get the same fix. "It takes {days} days on average to get from
applied to hired" (`PerformanceBriefing.tsx:207`) prints the live cohort's figure. In a
30-day view it is capped at 30 days, and nothing in the sentence says so. A terminal
basis already exists on the same read: hires *closed* in the window, resolved by role
(`hiresClosedInWindow`, `app/_lib/db/analytics.ts:787`), and cost per hire already divides by it (`:824-840`). The duration is not drawn from it.

## The statistic: three readers, two choices

- **Metric pack** (`app/_lib/metric-pack.ts:242-244`): median, falling back to the
  mean, with the technique's reason in the comment: "one stalled req drags a mean
  for months".
- **Stat tile** (`AnalyticsStatCluster.tsx:57-70`): the mean, but its label names
  both the statistic and the sample, "days avg over {n} hires".
- **Briefing sentence and the forecast's lag**: the mean, with neither the
  statistic nor the n named in the sentence. The forecast tile labels the same mean
  "Expected lag" (`PerformanceBriefing.tsx:117`, `analytics-forecast.ts:181`).
- **Period delta** (`app/_lib/analytics-deltas.ts:130`): a difference of two
  means, gated on both sides' n. That is the one use the technique rules out.

**Simulation, 2026-09-26.** Three real readers walked under rule A (the technique
as first written: median always) and rule B (the conditioned technique: the
statistic follows the reader's question, and a windowed duration is drawn on the
terminal basis):

1. **The forecast's "Expected lag".** A typical-case question. A and B both want
   the median; the tree passes the mean. Same verdict, and A's is enough.
2. **The briefing sentence in a 30-day view.** A would switch the mean to a median
   and still print a figure capped at 30 days. B moves it to hires closed in the
   window, which has no cap, and names the statistic. Only B finds the defect
   the sentence actually has.
3. **The capacity figure** (`capacityRatio`, `metric-pack.ts:246-247`). Today it is a
   count ratio with no duration in it. If it gained a lag (requisitions × time to
   fill ÷ recruiters), A would feed it the median and understate the load by the
   tail; B would feed it the mean. A is wrong there; B is right.

B is right in three of three and finds one defect A misses. Verdict: **better**.
What would falsify it: a view whose windows are always longer than the slowest
hire, where the creation-cohort cap never binds. The default 30-day window is not
that.
