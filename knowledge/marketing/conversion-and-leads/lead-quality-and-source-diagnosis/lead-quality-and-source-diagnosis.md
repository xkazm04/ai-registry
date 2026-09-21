---
layer: golden-path
type: golden-path
subject: lead-quality-and-source-diagnosis
status: forged
use_when: [scoring the leads a source produces, deciding whether a paid lead source is junk, explaining why a lead source underperforms, designing a lead score for a work queue, setting the minimum sample before a source verdict]
techniques:
  - quality-score-qualification-and-win
  - junk-source-rule
  - cause-taxonomy-spam-mistargeting-pricing-volume
  - cheap-cpl-splits-spam-from-mistargeting
  - minimum-sample-before-verdict
  - two-axis-fit-engagement
---

# Lead quality and source diagnosis

This subject owns two questions and the rules that keep them honest: **how good are
the leads a source produces** (a quality score per source, a junk rule for paid
sources, a two-axis score per individual lead) and **why does a source underperform**
(a closed cause taxonomy, the cheap-cost-per-lead discriminator, and a minimum sample
before any verdict is spoken). It stops where its neighbours begin.
`performance-root-cause-diagnosis` owns the shape of a diagnosis in general - one gap
first, one action from a closed set, an outcome ledger that scores the advice later -
and this subject fills that shape with lead-specific causes without restating it.
`speed-to-lead-and-assisted-reply` owns everything that happens after a lead arrives:
the reply clock, the qualifying questions, the draft that goes out. And
`attribution-and-incrementality` owns the loop that carries a qualified or won stage
back to the ad platform as an offline conversion, along with what a click-identifier
coverage share does and does not mean. A reader who wants those goes there.

## Why lead quality is its own subject

A lead-generation business is an e-commerce business with the checkout replaced by a
conversation. Every paid-media instrument reports a count of form submissions and a
cost per submission, and both numbers are the easiest ones in the whole domain to
improve while the business gets poorer. A bidding algorithm asked for more
submissions finds the cheapest humans and non-humans who will submit a form; a
form that asks for less converts more visitors into worse leads; a campaign that
promises a free thing collects people who wanted a free thing. Cost per lead falls,
lead count rises, and the sales team stops answering the phone because nine in ten
calls are a waste of an afternoon.

The principal practitioner therefore refuses to judge a source at the form. A source
is judged **at the stages the business actually cares about** - qualified, and won -
and every number the source is scored on is a stage rate or a cost per stage. Cost per
qualified lead is the first honest efficiency figure a source has; cost per lead is
a diagnostic input, never a verdict. The whole subject follows from that choice.

## The four load-bearing distinctions

**Qualification versus winning are two different failures.** A lead that never
qualifies was never a prospect: a bot, a job seeker, a competitor, a person in the
wrong country, a person who wanted the free thing. A lead that qualifies and then
does not close was a prospect the business could not convince, or the wrong kind of
prospect - too small, too far, too price-sensitive. The first failure is upstream of
the sales team and belongs to targeting and form design; the second is the fit of the
offer to the segment. A composite that adds the two rates hides which one happened,
so the composite is reported beside its two inputs, never instead of them
(`quality-score-qualification-and-win`).

**Cheap plus unqualified is a different disease from expensive plus unqualified.**
When a source produces leads that barely qualify, the cost per lead tells you which
population you bought. A spam flood is cheap because bots, incentivised fillers and
the curious are abundant and an optimiser rewarded for submissions finds them; a
mis-targeted audience costs what real humans cost, because real humans clicked and
filled the form in good faith and were simply the wrong humans
(`cheap-cpl-splits-spam-from-mistargeting`). The discriminator is relative - cheap
against the source's own history and its peers - and it is corroborated by form
telemetry when the business has any: completion time, disposable domains, duplicate
phones, bursts within a minute, off-hours clusters.

**A cause is chosen from a closed set, and one is chosen.** Spam, mis-targeting,
pricing, volume, or nothing wrong. A diagnosis that names two causes has named none,
and a diagnosis that invents a sixth cannot be scored later. The taxonomy is ordered:
the sample gate runs first, so a source with too few leads is diagnosed as "too little
data" and nothing else, however alarming its rates look
(`cause-taxonomy-spam-mistargeting-pricing-volume`, `minimum-sample-before-verdict`).

**A lead is scored on two axes, never one number.** Fit is what the lead is - a
reachable person, from a company, in a served region, asking for a thing the
business sells, from a channel that implies intent. Engagement is what the lead has
done - answered the qualifying questions, written more than once, taken a meeting -
and it decays with silence. A seventy built from great fit and no engagement wants
the opposite action from a seventy built from poor fit and three eager messages;
collapsing them destroys exactly the information the work queue needs
(`two-axis-fit-engagement`).

## The naive readings and how they fail

*"The source with the lowest cost per lead is the best source."* It is the most
efficient at producing form submissions, which nobody wanted. Rank sources by cost
per qualified lead and by win rate, and read cost per lead only to split spam from
mis-targeting.

*"Thirty-five percent qualification is bad."* Below what, for whom? A qualification
rate is judged against the business's own blended rate and against the source's
peers; a number that is poor for a referral channel is excellent for a social lead
form. Every threshold in this subject is a convention until the business calibrates
it against its own stages, and every technique below says so where a threshold
appears.

*"A source with three qualified leads and no wins has a win-rate problem."* It has
three qualified leads. The minimum sample is enforced per stage, on that stage's own
denominator: a win-rate verdict needs enough qualified leads, not enough leads. A
thirty-lead floor at a thirty-five percent qualification rate leaves ten qualified
leads, and ten is a coin flip.

*"The alert fired, so the source got worse."* A twenty-five percent rise in cost per
qualified lead between two periods is arithmetic on two ratios of small counts. With
eight qualified leads last month and six this month it is noise wearing a badge. A
drift alert carries the same sample gate as a verdict, and where the counts are thin
it says "thin" rather than "worse".

*"One score is simpler for the sales team."* One score is simpler to display and
useless to act on. The 2x2 grade - both axes high, fit only, engagement only, neither
- is the simplest artefact that still tells a rep what to do, and "fit only" outranks
"engagement only" because fit is the half nobody can change.

## What a diagnosis says and what it owes the future

A source diagnosis speaks the source's own numbers - leads, qualified, won, the two
rates, cost per lead, cost per qualified lead - and never a number the business did
not supply. It names one cause from the closed set, one action, and a severity that
is derived from the cause actually shown, never from a separate floor computed before
the model or the rule spoke; a diagnosis that says "spam" under a green "low" badge
has contradicted itself. When it recommends moving budget, it names the concrete
better source by that source's figures, because "shift to higher-quality sources" is
an instruction nobody can execute. When the numbers carry a period-over-period trend
or a velocity - days from lead to close - it reads them: a source getting worse is more
urgent than a source that was always mediocre, and a slow source is a different
problem from a poor one.

The severity and the cause are what the outcome ledger in
`performance-root-cause-diagnosis` will score in a month, so they are stored with the
counts they were read from. A verdict that cannot be re-derived from its inputs
cannot be checked against what happened next, and a lead-quality module that only
ever tells the business what it did well has nothing to be checked against at all.

## Constants, currency and calibration

Every rule here has constants: the weight on qualification against win, the rate
below which a paid source is junk, the cost per lead that reads as cheap, the cost
per qualified lead that reads as a pricing problem, the sample floor, the half-life
of engagement, the grade cut. The standard is that **each constant is expressed
relative to something the business measured** - its average order or deal value, its
blended rates, its peer sources - and carries a source and a confidence band: this one
is documented behaviour, this one a published figure, this one a convention the team
adopted on such a date. A constant typed in one currency for one market and one
business size is a convention that has forgotten to say so; it transplants to another
vertical as a wrong answer with the same confident badge. Where a stack ships such
constants, an application records the deviation and the golden path keeps the
standard.

## Denominators the score depends on

Stage counts are cumulative: a won lead was also qualified and was also a lead, so a
record that is imported already at "won" increments every earlier stage. Without this
the qualification rate of a well-run source drops as it closes deals, which is
absurd. Stage rates are ratios of the adjacent stages - qualified over leads, won over
qualified - so that each failure has its own number.

The denominator is only as clean as the identity behind it. Two submissions from the
same person are one lead; a lead auto-merged on an exact normalised email or an exact
international-format phone is one lead; a fuzzy name match is a suggestion for a
person to confirm, never a merge. A business that cannot dedupe cannot score, because
a spam source that submits the same phone forty times has forty leads or one
depending on a rule nobody wrote down.

When a person exercises their right to erasure, the row's identity fields go and the
timeline goes, but a tombstone keeps the anonymous funnel skeleton - stage, source,
dates - because deleting the row silently rewrites every historic rate the source was
ever scored on. Anonymous statistics are not personal data; a quality score that
changes when a person is forgotten is a quality score that was never about the
source.

## Where the score feeds and where it must not

A per-source quality figure is the natural signal to hand back to bidding: optimise
toward qualified, not toward submissions. That loop belongs to
`attribution-and-incrementality`, and a share of leads that carry a click identifier
measures how many outcomes can be uploaded, not how many happened - a coverage share
is easy to over-read as a success rate and the prompt that carries it says so.

The score also feeds the work queue, with one rule of precedence: lateness outranks
grade. A late A-grade lead and a late D-grade lead are both late, and the reply clock
in `speed-to-lead-and-assisted-reply` sits on top of the grade, never under it.

And it feeds a report. A report on a lead-generation business that narrates
e-commerce revenue the business does not have has missed the point; it speaks to
which sources are junk, what a qualified lead costs, how fast leads move, and which
source is best by score. Where the report is built over illustrative data because
the business has not connected its pipeline yet, the illustrative spine may be scaled
to match the period's real lead count so that two tiles agree - and the scaling
touches counts only, never ratios, and is never applied to imported live rows, which
are ground truth and are not rescaled to agree with anything.
