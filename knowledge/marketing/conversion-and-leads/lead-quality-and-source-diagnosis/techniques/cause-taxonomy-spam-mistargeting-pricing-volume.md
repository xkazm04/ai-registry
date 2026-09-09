---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: cause-taxonomy-spam-mistargeting-pricing-volume
status: forged
laws: [never-invent-proof, label-convention-as-convention, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [diagnosing why one lead source underperforms, constraining a model's root-cause output, designing the deterministic floor under a diagnosis prompt]
---

# The cause taxonomy: spam, mis-targeting, pricing, volume

## The concern

"This source is bad" is not a diagnosis, and neither is a paragraph that lists four
things that might be wrong with it. A diagnosis of a lead source names one cause from
a closed set, so that the action follows from the cause and the outcome can be scored
against it later. The closed set is small on purpose: four failure causes and one
"nothing wrong", each defined by the shape of the numbers rather than by a story.

## The taxonomy

| Cause | The numbers | The population | The action |
|---|---|---|---|
| **volume** | too few leads for any rate to mean anything | unknown | collect more, set up stage tracking, re-run later |
| **spam** | low qualification rate AND cheap cost per lead | bots, incentivised fillers, the curious, competitors | tighten the form, exclude bots, optimise toward qualified |
| **mis-targeting** | low qualification at a normal cost per lead, OR acceptable qualification with a low win rate | real people who are the wrong people | narrow targeting to the profiles that close; align the message to the segment |
| **pricing** | acceptable qualification and win, but cost per qualified lead too high for the deal | the right people, bought too dear | cut the dearest terms and audiences, cap bids, move budget to a cheaper-per-qualified peer |
| **ok** | none of the above | the right people at a fair price | hold, scale cautiously while the rates stay stable |

The order is the procedure. Volume is tested first, because below the sample floor
every other rate is noise. Qualification is tested next, split by cost per lead into
spam and mis-targeting. Win rate is tested on the sources that qualify. Pricing is
tested last and only on paid sources, because an unpaid source has no cost per
qualified lead. What is left is ok.

## Decision rules

- **When the model returns a cause outside the set, coerce it to the least
  accusatory failure cause rather than failing the diagnosis, because** a coerced
  mis-targeting reads as "the wrong people were reached", which is a statement about
  the campaign, while a coerced spam reads as an accusation about the leads and a
  coerced pricing as one about the budget. The coercion is logged; a model that
  wanders off the set often is a prompt problem.
- **When the model returns a cause and no severity, derive the severity from the
  cause the diagnosis actually shows, because** a severity computed earlier from an
  independent rule can disagree with the cause the reader sees - "spam" under a
  low-severity badge - and the disagreement is the reader's first impression.
- **When the diagnosis recommends moving budget, it names the destination source by
  that source's own figures, because** the prompt was given the peer sources for
  exactly this and "shift to higher-quality sources" cannot be executed. Peers are
  the other sources in the same period with their qualification rate, win rate and
  cost per qualified lead; the destination is the peer that beats the diagnosed
  source on the rate the cause named.
- **When a trend or a velocity is supplied, the cause may stay and the severity may
  rise, because** a worsening source is more urgent than a static one, and a slow
  source (long days from lead to close) is a different problem from a poor one and is
  said so rather than folded into mis-targeting.
- **When the diagnosis runs over illustrative data, it does not run, because** a
  diagnosis of a source the business does not have is proof that was invented.

## The deterministic floor and the prompt

A diagnosis is produced two ways - by a model reading the numbers, and by a rule
reading the same numbers - and the rule is the floor under the model: it fills a
missing cause, it is the demo when no model is connected, and it is the check that
the model's cause is plausible. The floor and the prompt must describe the same
taxonomy in the same words; the practitioner's discipline is to keep the qualitative
definition in the prompt and the threshold in the rule next to each other and edit
them together, because a prompt that says "cheap" while the rule says a number the
prompt never saw drifts within a quarter. What the rule cannot do is calibrate
itself: its thresholds are constants and every one is a convention until the
business's own deal value and blended rates replace them
(`cheap-cpl-splits-spam-from-mistargeting`, `minimum-sample-before-verdict`).

## What the taxonomy does not cover

A source can be fine and the sales process broken: slow first reply, no follow-up,
a rep who qualifies nobody on Fridays. Those show up here as a low win rate and are
mis-diagnosed as mis-targeting unless the reply clock and the qualification
completeness are read first, which is `speed-to-lead-and-assisted-reply`'s territory.
And a source can look poor because its stage data is missing rather than bad -
imported rows with no stage past "lead" - which is a data-provenance finding, not a
quality one.

## When NOT to use

- Not on a source below the sample floor beyond returning "volume".
- Not on an unpaid source for spam or pricing; both need a cost.
- Not on illustrative data.
- Not as a multi-cause output. One cause; if two fit, the earlier in the order wins
  and the second is mentioned in the summary as a follow-up question.
