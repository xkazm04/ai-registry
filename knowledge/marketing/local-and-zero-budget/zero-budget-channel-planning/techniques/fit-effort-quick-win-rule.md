---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: fit-effort-quick-win-rule
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [ranking free channels for a business, choosing which channel to surface as the first thing to do, reviewing a channel-research prompt's output schema]
---

# Fit, effort and the quick-win rule

Every channel in a free-visibility plan carries two values of different kinds. A
**fit score** on a 0-100 scale says how well the channel suits this business - its
type, offering, audience, locality - and it is a prediction. An **effort level**,
low, medium or high, says how much work it takes to become visible there, and it
is a categorical statement about labour: an afternoon of form-filling, a weekly
presence, or a publishing habit. The plan is *ordered* by fit, because the reader
wants the best-matching channels first; the plan's *first recommendation* is read
off both, because the best-matching channel is frequently the most expensive one.

## The quick-win rule

The quick win is the first channel in fit order that is low effort, has a fit at
or above seventy, and the business has not yet touched. Stated as a rule: when a
plan is rendered for a business with untouched channels, surface the first
untracked low-effort channel with fit >= 70 as "start here", because it is the
cheapest visible progress the business can make and visible progress is what keeps
a zero-budget business working the plan at all.

The threshold is a convention. Seventy was chosen because seeded fits for a
well-matched listing sit in the eighties and nineties and a weakly matched one in
the fifties and sixties, so seventy separates "worth an afternoon" from "worth
considering"; nothing was measured to place it there, and a team adopting the rule
should say so wherever it renders. The low-effort constraint is the substantive
half: a high-fit high-effort channel is a strategy, not a quick win.

## What a fit score is and is not

A fit is produced by one of two things: a curated seed per business type - a
business-profile listing near the top for a local business, a price-comparison
marketplace near the top for a shop, a launch-community listing near the top for a
software product - or a model reading the business's grounding and returning six
to nine channels with a fit, an effort, a one-line rationale, a payoff and two to
four first actions each. Both are predictions, and the weights behind them are
asserted, not calibrated: no seed's ninety-four has been checked against a
conversion. A plan says so. Where a seed varies its fits slightly per business so
two businesses of one type do not read byte-identically, the variation is bounded
and clamped and is disclosed as sample data; it is decoration for a demo, not
information.

Three consequences:

- **A fit is never blended with an observation.** Measured clicks live beside the
  score (see the measured-clicks technique). A fit that has absorbed a click count
  is neither a prediction nor a measurement.
- **A fit is rounded and clamped, and a missing one defaults to the middle.** A
  channel arriving with no parseable fit gets sixty rather than zero or one
  hundred, because a default at either end would rank it first or last on the
  strength of nothing. An out-of-range value is clamped, not rejected: the
  channel's advice does not depend on the number.
- **The rationale must name this business.** "Why it fits" is one sentence
  grounded in the offering, the audience or the locality, with no invented figures
  about competitors or reach. A rationale that would fit any business of the type
  is a sign the grounding was empty and the plan should say it is generic.

## Counts and caps

Six to nine channels per plan, two to four first actions per channel, ranked by
fit descending with no duplicates. All three are conventions: six to nine is
wide enough that a business sees more than the obvious three and narrow enough to
act on; surveys of small businesses that describe themselves as succeeding tend to
report five to eight channels in use, which is consistent and proves nothing. On
the wire, a plan is capped at twenty-four channels and six first actions per
channel, so a client posting an arbitrary blob cannot turn the plan into a
catalog.

## Effort as a first-class column

Effort is not a tiebreaker for fit; it is its own column, and the plan reads it in
three places. The quick win reads it as a filter. The kind taxonomy correlates
with it - listings are usually low, communities and content usually medium or high
- but does not determine it: an industry portal that requires a vetted application
is a high-effort listing. And the honest framing of owned content is that it is the
highest-effort channel on any free plan, which is why it can carry fit ninety and
still not be the quick win.

## Decision rules

- When two channels tie on fit, keep the seed's or the model's order, because
  the order was chosen with the business type in mind and a re-sort on a
  secondary key would look like a decision nobody made.
- When the business has tracked every low-effort channel, show no quick win rather
  than promote a medium-effort one to the slot, because the label would be false.
- When a regenerated plan arrives, keep the tracked stages by channel id and
  surface the orphans - tracked channels the new plan no longer names - rather
  than silently dropping the business's own decisions.

## When not to use

Do not use the quick-win rule to choose what to *measure* first; measurement
follows the business's actual activity, not the plan's suggestion. Do not use fit
to rank channels the business has already gone live on - those are ranked by their
derived next step. And do not apply a single fit threshold across business types
as if it were calibrated: it is one convention, honestly labelled, that a team may
move once it has outcomes to move it with.
