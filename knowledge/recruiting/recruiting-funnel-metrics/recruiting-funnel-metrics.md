---
layer: golden-path
type: golden-path
subject: recruiting-funnel-metrics
status: forged
use_when: [defining a hiring metric, reconciling two figures that disagree, building a pipeline dashboard, forecasting hires from a funnel]
techniques:
  - time-to-hire-basis-and-median-not-mean
  - creation-cohort-versus-terminal-transition-basis
  - stage-pass-through-and-dwell-time
  - offer-acceptance-rate-denominator
  - non-overlapping-event-to-series-mapping
  - forecast-signal-floor
---

# Recruiting funnel metrics

Almost every argument about a hiring number is an argument about a population,
not about arithmetic. Two people quote "our conversion rate" and get 9% and
23%; both computed correctly; they were counting different candidates over
different windows against different denominators. The naive reading of this
subject is that a funnel metric is a division problem and the work is
plumbing. The principal reading is that a funnel metric is a **definition
problem**, and the plumbing is the easy half.

This subject owns what each canonical recruiting metric actually counts, on
which cohort basis, and the conditions under which two figures may not be
divided into one another. It does not own how small a sample must be before a
figure is withheld, nor how a figure is coloured or narrated once computed —
those are separate disciplines, named at the end.

## A metric is a triple, not a number

Every funnel figure carries three commitments, and changing any one of them
moves the value by more than the noise you are trying to read through:

1. **The counted event.** Not "candidates who interviewed" but "the recorded
   transition into an interview-role stage". A metric anchored on a *state*
   ("is currently in interview") counts a different population every hour; a
   metric anchored on a *transition* is stable once written.
2. **The cohort basis.** Which candidates are in scope, and by what date they
   entered scope — the date they were created, or the date they finished. This
   is the single most consequential choice in the subject and it has its own
   technique.
3. **The observation window and its maturity.** When you looked, how far back,
   and how much of the cohort has had time to reach the outcome you are
   counting. A window can be arithmetically correct and still guarantee a wrong
   answer, because the cohort has not finished happening yet.

State all three or the figure is not a measurement. This is the local reading
of [a claim carries its sample and its basis](../_laws.md#a-claim-carries-its-sample-and-its-basis):
the basis is not metadata attached to the number, it is part of the number.

## Four families, four native failure modes

| Family | Examples | Native failure |
| --- | --- | --- |
| **Volume** | applications received, candidates in stage, offers extended | double counting — one candidate's one transition landing in two buckets |
| **Velocity** | time to hire, stage dwell, age in stage | averaging a heavy tail; measuring only the survivors |
| **Conversion** | stage pass-through, application-to-hire | dividing across mismatched bases and immature windows |
| **Outcome** | offer acceptance, early attrition, source yield | attributing an outcome to a cause the record does not hold |

Naming the family before defining the metric is worth the ten seconds: it
tells you which of these four errors you are about to make.

## The three clocks are three different metrics

The word "speed" hides three quantities that differ by weeks:

- **Time to fill** — requisition opened to offer accepted. Measures the
  *organization*: how long a need goes unmet. Includes sourcing lead time,
  approval delay, and every week nobody worked the role.
- **Time to hire** — an individual candidate's entry into the process to their
  accepted offer. Measures the *process*: how fast you move someone once you
  have them. Excludes the sourcing lead time entirely.
- **Time in stage / dwell** — entry into one stage to exit from it. Measures
  a *step*, and is the only one of the three that localizes a bottleneck.

The routine disaster is comparing a locally computed time-to-hire against an
external benchmark computed as time-to-fill, and celebrating a gap that is
purely definitional — sourcing lead time is often the largest single term in
the difference. State which clock, both ends of it, and what the end anchor
is: offer accepted and start date are separated by a notice period you do not
control and should not be scored on.

Durations are reported as medians. The distribution of any hiring duration is
right-skewed with a long tail of revived candidates, holiday freezes and
re-opened requisitions; a single 200-day resurrection moves a mean on a small
cohort by days while the typical experience did not change at all. The median
answers the question a recruiter actually asked — *how long does this usually
take* — and it is stable against exactly the observations that are least
representative.

## Two bases, and the seam between them

The deepest distinction in the subject is between a **creation cohort** and a
**terminal-transition basis**:

- *Creation cohort*: "of the candidates who entered in a given period, what
  became of them". The denominator is honest and closed. The cohort is
  **censored** — some members are still in flight, so every outcome rate
  computed on it is a lower bound that keeps rising after you publish it.
- *Terminal-transition basis*: "of the candidates who reached an outcome in a
  given period, what was true of them". Complete by construction, and
  therefore **survivorship-biased**: it can only see the ones who finished. A
  process that just got slower looks unchanged for weeks, because the slow
  candidates have not finished yet and cannot be counted.

The rule: velocity metrics are computed on the terminal-transition basis and
labelled as such; conversion metrics need a creation cohort with an explicit
maturity horizon. A figure that silently blends them — this period's hires
over this period's applications — is the most common wrong number in
recruiting analytics, and it is wrong in a specific direction (too low) that
corrects itself for weeks afterwards with no change in anyone's behaviour.

The reason this survives review is that **the two bases are equal over an
unbounded window**. Counted all-time, "candidates who were hired" and "hires
that closed" are the same set, so a codebase can carry one number for both for
years. They diverge the instant somebody adds a date filter — and that is
usually a small feature nobody reviewed as a metric change.

## The divisibility rule

Two figures may be divided into one another only when all three hold:

1. **Containment** — every member of the numerator is a member of the
   denominator. If a hire can exist without an application row (a referral
   entered directly at interview, a re-hire), it is not in the denominator and
   the ratio is not a rate.
2. **Same basis, same window** — both sides drawn on the same cohort basis
   over the same interval, by the same clock.
3. **Opportunity** — every member of the denominator has had the time and the
   path to enter the numerator. A denominator containing candidates who
   entered yesterday cannot produce an honest hire rate today.

When containment cannot be established, the honest denominator is the larger
of the two counts, not the one that produces the flattering number.

That leaves two opposite disciplines for rates above 100%, and confusing them
is common:

- Where the denominator is **observed** and merely under-recorded, take the
  larger observed count and the rate is bounded by construction — no clamp
  needed, and the bound is earned rather than imposed.
- Where the denominator is an **assumed constant** — a standard baseline, an
  industry figure, a configured expectation — a result above 100% is the only
  signal that the assumption is wrong, and it must be shown uncapped. Capping
  it renders exactly the reading that needed challenging as a believable
  number.

A rate clamped to 100% is indistinguishable from a genuinely perfect period,
which is the worst confusion this layer can produce.

## Stages are roles, not labels

Every team renames its stages. A dashboard that keys off display strings
measures a different funnel after every board edit and silently rewrites its
own history. Metrics key off a stable stage *role* — entry, screening,
interview, offer, terminal — mapped once, so a renamed column changes what a
recruiter reads and nothing about what is counted. This is
[meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label)
applied to measurement, and it is also what makes cross-team and cross-market
comparison possible at all.

The corollary: stages are **ordered**, and the order is part of the role
vocabulary, not of the display sequence. Pass-through, dwell and forecasting
all need to know that offer is downstream of interview; none of them may
learn it from a column position a recruiter can drag.

## In-flight is a state, not a hole

A candidate still in process is neither a pass nor a fail. Coercing them into
either — counting them as a rejection because they have no hire row, or
excluding them from a denominator they legitimately belong to — is the
measurement form of
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence).
Three disciplines follow:

- Every rate publishes its **censoring**: how many of the cohort are still
  open. A 12% conversion with 40% of the cohort still in flight is a different
  claim from a 12% conversion on a closed cohort.
- **Simulated, demo and seeded rows never enter a leadership figure.** They
  are indistinguishable from real ones once aggregated, and a single seeded
  pipeline inflates every rate on the page. The exclusion belongs in the query,
  not in a caveat under the chart.
- **Withdrawals are their own terminal outcome.** The company passing and the
  candidate turning you down are two different terminal closes. Folding them
  together makes a market problem look like a selection decision and hides the
  one signal that predicts offer declines.

## A composite is only as current as its stalest input

Any figure blended from several stored inputs — a cost per hire summed across
channels, a rate combining several manually maintained numbers — must be dated
by the **oldest** contributing input, not the newest and not the moment of
computation. Blends fail by looking current: one channel updated this morning
makes a figure whose other half has not been touched in eight months read as
fresh. The same rule applies to any figure whose denominator is a constant a
human configured once: the constant's own age is part of the metric's basis.

## Reach from snapshots versus reach from transitions

Where a transition ledger is sparse or was added late, teams derive stage
reach from the current snapshot instead: a candidate at interview is credited
with having reached every earlier stage. This is a defensible fallback — it is
robust to a missing event history — but it buys robustness with two
assumptions that must be stated wherever the funnel is shown:

- it assumes **monotone progression**, so skips and backward moves are erased;
- it cannot distinguish a candidate who was **filed** at a stage from one who
  was **moved** there, which means a workspace whose candidates all arrive
  pre-screened and never move reads as a working funnel.

The consequence is that any claim requiring *movement* — a conversion rate, a
bottleneck, a forecast — needs a separate transition-derived guard before it
may render at all. Movement licenses a conversion number; conversion does not
prove movement.

## Forecasting is where definitions get their bill

A hire forecast is the funnel's definitions compounded, so every basis error
above is multiplied rather than averaged. The discipline that survives contact:
build the forecast from **two independent estimators** — new-candidate inflow
times observed end-to-end conversion, and the current in-flight population
credited forward from each candidate's *own* stage — and treat their
disagreement as the confidence interval rather than picking the friendlier
one. Where an observed rate exists for a leg (offer acceptance is almost
always observed), it replaces the funnel-implied rate for that leg; a
funnel-implied offer leg is a conversion estimate standing in for a fact you
already have.

And a forecast refuses. Below a floor of observed transitions there is no
signal, only the shape of the model, and rendering it as a number is
[inference dressed as measurement](../_laws.md#inference-must-look-like-inference).

## Failure modes of the naive reading

- **The vanity denominator.** Rate computed over the subset that reached the
  measured stage rather than all who were eligible — always higher, never
  wrong on its own terms, never comparable to anything.
- **The calendar-week boundary.** Weekly series bucketed by calendar week make
  every partial current week look like a collapse, and every holiday week look
  like a process change. Rolling fixed-length windows anchored on the
  observation moment say what people think weekly series say.
- **The improvement with no baseline.** "38% faster" requires a measured
  before. Where no pre-existing measurement exists, there is no percentage,
  and manufacturing one from an industry average is the single fastest way to
  make every other honest number on the page untrustworthy.
- **The resurrected candidate.** One person re-entering the pipeline months
  later, counted as a new cohort member in the denominator and as an old
  transition in the numerator.
- **The bottleneck of one.** A stage flagged as slow on a single candidate's
  dwell time misdirects recruiter effort at the cost of the stage that is
  actually slow.

## Seams with neighbouring disciplines

How small a sample may be before a figure is withheld, and what the
*not-measurable* state renders as, belong to the small-sample discipline; this
subject states minimums where a definition depends on one and otherwise cites
[the law](../_laws.md#a-claim-carries-its-sample-and-its-basis). Whether a
number earns a colour, a verdict word or a direction arrow — and the rule that
none of those exist without a target someone actually set — belongs to the
honest-presentation discipline. Instrumentation cost, event transport and
telemetry retention belong to the observability domain, not here. Who may see
which cohort, and how tenancy scopes a query, is an access question and is
governed there; what this subject contributes to it is only that a cohort
filtered by permission is a different cohort and must say so.
