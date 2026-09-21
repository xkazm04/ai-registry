---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: junk-source-rule
status: forged
laws: [label-convention-as-convention, one-target-one-threshold, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [flagging a paid source as junk, deciding which sources a diagnosis should offer, writing the alert copy for a lead-quality module]
---

# The junk-source rule

## The concern

The most common failure of a paid lead source is not that it is expensive; it is that
it is cheap. A source whose cost per lead is the lowest on the table and whose
qualification rate is the lowest on the table is buying a population nobody wants,
and a dashboard that sorts by cost per lead puts it at the top with a green badge.
The junk rule is the single predicate that catches this, and it is deliberately one
predicate so that every surface - badge, picker, alert, prompt - agrees on which
sources are junk.

## The rule

A source is **junk** when it is paid and its qualification rate is below the junk
threshold, provided its lead count clears the sample floor.

- *Paid* means spend in the period is positive. An unpaid source cannot be junk in
  this sense: it may be poor, but nobody is buying the population, and the action a
  junk verdict implies - stop paying for it - does not exist.
- *Qualification rate* is qualified over leads, on cumulative stage counts.
- *The threshold* is one exported constant that every surface reads. A copy of the
  literal anywhere else is a second threshold, and two thresholds will disagree about
  one source the first time one is edited.
- *The sample floor* is the same floor the diagnosis uses. A badge that fires on
  five leads while the diagnosis says "too little data" is two verdicts on one row.

## Decision rules

- **When a paid source is junk, the recommended action is form-side first, budget
  second, because** tightening qualification at the form (required fields,
  verification, bot exclusion) and telling the optimiser to reward qualified rather
  than submitted preserves the channel; cutting budget is what you do when quality
  does not rise after the form was fixed.
- **When a source is junk and its cost per lead is not cheap relative to peers, do
  not call it junk in the copy, because** junk copy says "cheap but low quality" and
  a source that is expensive and low quality is mis-targeted, a different cause with
  a different action (`cheap-cpl-splits-spam-from-mistargeting`).
- **When the diagnosis picker offers under-performing sources, offer junk sources
  and weak-win-rate sources as two labelled groups, because** they are the two
  failures this subject keeps apart and the picker is where a user first meets them.
- **When the alert copy names the source, it also names the two numbers, because**
  "junk" is an accusation and the qualification rate and cost per qualified lead are
  its evidence.

## What the threshold is

The junk threshold is a convention. Around a third of leads qualifying is a common
floor for a business whose form asks real questions; it is wrong for a business with
a one-field form (where a fifth might be normal) and wrong for a referral programme
(where two-thirds might be poor). The standard is that the threshold is set relative
to the business's blended qualification rate - a source at half the blend is junk
regardless of the absolute - and that the constant says which of the two it is. A
threshold that ships as a bare fraction is a convention that has not said so.

## What the rule does not do

It does not say why. A junk flag is a symptom - cheap submissions that go nowhere -
and the cause (bots, incentivised fillers, a free-thing promise, a lookalike audience
built from the wrong seed) is the diagnosis's job. It does not fire on drift: a
source that was fine and is worsening is caught by the trend watch, not the junk
predicate. And it does not fire on an unpaid source, however poor, because there is no
budget to stop.

## When NOT to use

- Not on an unpaid source; nothing is being bought.
- Not below the sample floor; a rate on eight leads is not a rate.
- Not on illustrative data. A sample spine may render a junk badge to show what the
  module does, and the badge then carries the illustrative label beside it; a
  diagnosis is never run over an illustrative junk source as if it were the client's.
- Not as the only quality signal on a report. A source that is not junk may still
  be the worst source by win rate; the report speaks to both.
