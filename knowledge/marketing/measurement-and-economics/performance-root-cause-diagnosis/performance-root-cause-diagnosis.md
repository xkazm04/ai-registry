---
layer: golden-path
type: golden-path
subject: performance-root-cause-diagnosis
status: forged
use_when: [explaining why a paid portfolio, a customer cohort or a lead source misses its target, designing a diagnosis that a model may phrase but not invent, deciding when a diagnosed problem counts as fixed, reviewing whether past recommendations actually worked]
techniques:
  - cause-ladder-tracking-gap-first
  - wasted-spend-ranking
  - thresholds-mirror-the-prompt
  - one-lever-from-supplied-entities
  - outcome-closed-by-own-metric-with-dead-band
  - advice-ledger-scores-past-advice
---

# Performance root-cause diagnosis

A dashboard says the paid portfolio is at 24% cost share of revenue against an 18%
target. That sentence is a symptom. The owner's next question - *why*, and *what do I
do first* - is a diagnosis, and a diagnosis is a different artefact from a metric: it
classifies the miss into a cause, names one lever, and stays open until the number it
was about has moved. Most marketing tooling produces the symptom well and the diagnosis
badly, because a model asked "why is this underperforming" will always answer; the
craft is arranging things so that its answer can only be one the data already supports.

This subject owns the **shape** of a diagnosis: the closed cause set, the ladder that
walks it in the order a practitioner would rule causes out, the ranking of what is
worth diagnosing, the mirror between a prompt's words and a deterministic threshold,
the lever drawn only from entities the request carried, the closure rule, and the
ledger that scores the advice afterwards. It owns those regardless of what is being
diagnosed - a paid portfolio, an acquisition cohort, a lead source, a local coverage
gap - and it cites the lead case as one instance of the shape. It does not own the
lead-source cause taxonomy itself (spam versus mis-targeting versus pricing, the
qualification-rate and win-rate floors): that depth belongs to
`lead-quality-and-source-diagnosis`. It does not own severity - how critical a
finding is, what order findings compete for attention in, when a badge turns red -
which belongs to `campaign-anomaly-triage`. The budget move a diagnosis may end in is
`budget-reallocation-prescription`'s; whether a period-over-period delta is
significant at all is `period-comparison-significance`'s; the margin that turns an
efficiency reading into a profit reading is `profit-on-ad-spend-economics`'; the
causal standing of any of it is `attribution-and-incrementality`'s. A diagnosis draws
on each and restates none.

## A diagnosis is a classification, not an essay

The load-bearing decision is that the cause set is **closed and small**. Five or six
causes, each defined by a sentence a marketer would say and each implying a different
first action: money flowing to campaigns that never convert; money sitting in weak
campaigns while strong ones could absorb it; efficiency decaying period over period;
spend and clicks with no conversions recorded at all; one network carrying a large
share of the cost at a much worse return than its sibling; nothing wrong. An open-ended
"explain the underperformance" invites a paragraph that mentions four of these and
commits to none, which is the marketing equivalent of a differential diagnosis with no
diagnosis. A closed set forces the commitment, makes the output storable and
comparable across weeks, and - crucially - lets a deterministic rule produce the same
verdict the model is asked for, so the two can be checked against each other.

The second decision is that the causes are **ordered**. Each rung of the ladder is
checked before the next in the sequence a practitioner rules things out, and the first
rung that fires is the verdict. The order encodes a judgement about which
misclassification is most expensive: a measurement gap read as waste sends the owner to
pause campaigns that may be working, so the gap is checked first; waste read as
misallocation shifts budget instead of stopping the bleed, so waste comes before
misallocation. A ladder yields exactly one cause by construction - a feature, since the
diagnosis says what to do *first*, and a limitation the owner is told: a portfolio with
both waste and drift hears about the drift once the waste is gone.

Every cause carries a **deterministic predicate** as well as a prose definition. "A
substantial share of spend flows to campaigns without conversions" and "at least a
quarter of spend sits on zero-conversion campaigns" are the same rule stated twice,
once for a model and once for a program, and they must move together. When they drift
apart the demo verdict, the fallback verdict and the model's verdict disagree about the
same numbers, and the owner sees three diagnoses of one portfolio. The share, the drift
tolerance, the imbalance ratio - all of these are practitioner conventions, and a
technique that carries them says so
([label convention as convention](../../_laws.md#label-convention-as-convention)).

## What is worth diagnosing: recoverable money, not bad ratios

A diagnosis has to pick its subject before it picks its cause, and the naive pick is
"the campaign with the worst return". That is wrong in a way that costs money: a tiny
campaign at a terrible ratio is not where the budget is going, and a large campaign
slightly over target may be leaking more than every small disaster combined. The right
ranking is **wasted spend** - the money an action could actually recover. For a
campaign with no conversions that is all of its spend; for a converting campaign above
target it is the part of its spend the target does not justify, which is spend minus
conversion value times the target cost share. A campaign at or under target wastes
nothing, whatever its neighbours look like. Rank by that, and the campaign the
diagnosis names is the one whose fix moves the portfolio number.

Two corollaries. When nothing wastes - every campaign is at or under target - the
diagnosis still needs a subject, so it takes the single least efficient spender rather
than returning nothing; an empty diagnosis of a healthy portfolio teaches the owner
that the tool is broken, while a "healthy, and here is your weakest performer" teaches
them what to watch. And when a portfolio spans currencies, the waste ranking and the
totals cover the primary currency alone and the diagnosis says so, because a ranking
that adds two currencies has ranked a fiction
([not measured is not zero](../../_laws.md#not-measured-is-not-zero) forbids the sum;
the same law forbids fabricating a prior window from a series that does not reach back
a full second period - a partial prior reads as a collapse).

## The lever comes from what was supplied

A diagnosis ends in one action. Not three, not a prioritised list - one, the most
effective, stated concretely enough that a specialist could do it this afternoon: pause
this campaign and move its budget to that one; fix conversion measurement before
touching anything; rebalance the two networks. Two properties make the lever
trustworthy and both are structural rather than instructed.

First, the entities it names exist. The request carries the ids of the campaigns it
hands the model; the response's affected ids are filtered back to that set, unknown ids
are dropped rather than corrected to something plausible, and an empty list is legal
because a diagnosis can be about the portfolio rather than a row. This is
[never invent proof](../../_laws.md#never-invent-proof) at the output boundary, and it
is also the last rung of an injection defence: a campaign name is free text from an
advertiser's console, and a model that obeyed an instruction hidden in one still cannot
name a campaign the request never supplied. Second, the thresholds it reasons with are
the ones in the data. A diagnosis prompt carries no external benchmarks - no "industry
standard" ratio, no typical conversion rate - and every threshold in the
recommendation is derived from supplied numbers with the derivation stated, or omitted.
A target the business agreed is data; a target the model remembers from somewhere is
proof nobody gave. Where a lever needs a destination, the request supplies a few best
performers so "move it to a better campaign" can be "move it to *this* one at *this*
return" - the recommendation that names its destination is the one that gets acted on.

## Closure is a measurement, never a status flip

A diagnosed problem is not fixed because someone marked it resolved. It is fixed when
**the metric the diagnosis was about** has moved the right way by more than noise. Each
diagnosis kind declares its own key metric at creation - the portfolio's cost share of
revenue, the worst cohort's lifetime-value-to-acquisition-cost ratio, the source's
qualification rate, the coverage percentage - and snapshots it from the server-rebuilt
numbers, never from the client. At every later render the current value of the same
metric is re-derived and compared. The comparison has a dead-band: a relative move must
clear a stated band (a twentieth of the baseline is the convention this subject was
reconciled against) before it reads as improved or worse, and everything inside the
band is *unchanged* rather than rounded into a story. For a lower-is-better metric the
verdict inverts and the reported delta does not, so a cost share that fell 20% reads
"improved, minus 20%" and never "improved, plus 20%"
([one target, one threshold](../../_laws.md#one-target-one-threshold): invert the
verdict, never the number).

Two guards follow. A snapshot that cannot be taken - no usable total, a non-finite
value - yields no outcome chip, never a fabricated baseline. And a new diagnosis whose
subject matches an already-resolved one of the same kind, with the metric unchanged
since, is flagged "already handled, not moved" rather than presented as news - a
display-only flag, because a re-run may still be what the owner wants. None of this is
a causal claim: a before/after read says the number moved while the advice stood, not
that the advice moved it
([platform-reported is not causal](../../_laws.md#platform-reported-is-not-causal)),
and the surface says "moved", never "achieved".

## The ledger: advice that grades itself with its own pen

A business gets dozens of recommendations a month across modules, and the honest
question is whether they work. The ledger records what was actually shown: first
sight, last sight, how many times, and the producing signal's own metric at each
sighting. When a subject stops appearing for long enough - three days, because the
ledger only updates on render and one missed visit must not mint an outcome - it
resolves, and the outcome is the signal's own first value against its own last value,
under the same dead-band and the same inversion rule as the diagnosis chip. It reads
nothing else: no second engine, no re-derivation, no external store. Anything richer
would be the tool grading its own homework with a different pen.

What the ledger refuses is more important than what it scores. A record with no
snapshot resolves with no outcome. A record ever seen on illustrative data is flagged,
and the flag is sticky: a project that later goes live cannot retroactively make a
fixture baseline real, and a scored "improved" over a fabricated baseline is the
worst thing the surface could show
([provenance is binary and labelled](../../_laws.md#provenance-is-binary-and-labelled)).
A subject that returns after resolving reopens with its original baseline and its stale
outcome dropped - the resolve did not hold, and a fresh baseline would award it a free
improvement. A subject the operator dismissed stays dismissed while it is still seen;
the operator owns that state, not the clock. And the moves the control plane actually
applied join the same list only when their realisation was *measured*: an
"insufficient" realisation, where the stored series did not cover both windows, is
never laundered into "no change".

## When a diagnosis may run at all

A passive diagnosis - one a weekly digest fires without anyone asking - runs only on
live data that carries a signal. The illustrative sample is never diagnosed as if it
were the client's; a connected-but-idle account with no spend in the window is skipped
with a recorded reason rather than diagnosed about nothing; and a minimum gap between
runs (six days, so a weekly schedule fires and a mid-week re-run does not double-file)
keeps the ledger free of duplicates. A diagnosis nobody asked for, on data that is not
theirs, charged to their account, loses the trust the ledger is trying to earn.

## Failure modes of the naive reading

- **The open-ended why.** A paragraph mentioning every cause; nothing to store,
  compare or act on.
- **A gap read as waste.** Zero conversions diagnosed as burned budget when the tag is
  absent; the owner pauses working campaigns.
- **Worst-by-ratio.** The smallest, ugliest campaign named while the large one over
  target leaks ten times as much.
- **Prompt and predicate drift.** The rule tightened in code and not in the prompt;
  demo and live disagree about one portfolio.
- **The plausible id.** A campaign that does not exist, or an unknown id corrected to
  the nearest real one. Both are fabrication.
- **The remembered benchmark.** An "industry-standard" rate nobody supplied.
- **Resolved by status.** Closed by a click; the metric never moved.
- **The unsticky sample.** A demo-data baseline scored after go-live.
- **Insufficient laundered as unchanged.** An unmeasurable window reported as zero.

## Seams with neighbouring disciplines

The lead-source cause taxonomy and its floors are `lead-quality-and-source-diagnosis`;
this subject shows it as one instance of the ladder. Severity is
`campaign-anomaly-triage`'s; a diagnosis that must show one derives it from the cause
it actually displays when the model omits it, so a waste verdict never sits beside a
green pill. The budget move a lever proposes, with its simulation, guardrails and
reversible ledger, is `budget-reallocation-prescription`'s. Whether the drift the
ladder's third rung reads is significant, and how the prior window is
weekday-balanced, is `period-comparison-significance`'s - the ladder consumes a delta
it did not compute. Without a margin from `profit-on-ad-spend-economics` the diagnosis
says "efficiency" and refuses "profitability"
([efficiency is not profitability](../../_laws.md#efficiency-is-not-profitability)).
What a scored outcome may claim about causation is `attribution-and-incrementality`'s;
the monthly narrative that tells the owner which advice worked, and is forbidden to
claim outcomes the ledger did not score, is `client-reporting-and-data-provenance`'s.
