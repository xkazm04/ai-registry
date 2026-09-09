---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: holdout-test-on-the-biggest-channel
status: forged
laws: [platform-reported-is-not-causal, statistical-honesty-before-a-verdict, label-convention-as-convention]
shared_with: []
use_when: [a business wants to know whether its largest channel actually causes sales, prospecting or retargeting spend is being defended or cut on attributed numbers, a small budget cannot afford a platform-run lift study]
---

# Holdout test on the biggest channel

The only instrument that answers "what did this channel cause" is withholding it from
a comparable group and reading the difference in the business's own outcomes. For a
channel the comparable group is geographic: split the market into treated and held-out
regions matched on a pre-period, run the channel in one set and not the other, and
read the lift in bookings between them. A small business cannot test everything and
should not; it tests the channel that carries the most spend first, because that is
where a causal answer moves the most money.

## Why geography, and why the biggest channel

A user-level holdout - the platform's own conversion-lift study - randomises people
and needs a conversion volume most small accounts never reach; the platform's
documentation is explicit that a readable result needs meaningful volume. Regions are
few, but they are the unit a small budget can actually assign, and a directional geo
test with a modelled counterfactual gives a planning signal at a spend where a
user-level study returns nothing. Practitioner guidance in the current literature puts
the geo test or a small-cell design below a monthly spend in the low tens of thousands
and the user-level lift study only well above it; convention, and the thresholds are
theirs.

The biggest channel first, because a holdout is a budget line: a finding that half of
a channel's attributed conversions were not incremental changes the allocation by
that half, and the same finding on a channel that is 5 % of spend changes nothing
worth the test. Retargeting and branded search are the usual second tests, because
they are the channels whose attributed read is most likely to be flattered.

## Procedure

1. Choose regions that can be assigned cleanly - the platform's targeting must be able
   to exclude the held-out set - and that tracked each other in a pre-period at least
   as long as the test. Matching is on the business's own outcome series, not on the
   platform's column.
2. Hold out roughly a tenth to a fifth of the market by outcome volume; run the test
   for two to three weeks, longer for low volume. Both are practitioner convention
   and are labelled so wherever the design is written down.
3. Read the outcome from the business's own bookings, leads or orders by region. The
   platform's conversion column is not the outcome; it is one of the things under test.
4. Compute lift as treated outcome minus the held-out counterfactual, over the
   counterfactual. The counterfactual is the held-out regions' actual outcome in the
   simplest design and a synthetic control - the held-out series predicted from the
   treated regions' pre-period relationship - where regions are few or uneven.
5. Report an interval, not a point. The statistics of the read - a sample before a
   winner, no peeking, a correction when several arms exist - are the on-site
   experiment subject's and are borrowed unchanged; what changes is the unit (a
   region) and the small count of units, which widens the interval and is disclosed.
6. Translate lift into an incrementality factor for the channel - incremental
   conversions over attributed conversions - and carry that factor, with its interval
   and its date, into every later reading of the channel's attributed column.

## Decision rules

- When a business has never run a holdout, run it on the channel with the largest
  spend, because that is where the answer is worth the cost of the test.
- When the monthly spend is too small for a user-level lift study, run a geo test with
  a modelled counterfactual rather than nothing, because a directional causal read
  outranks a precise attributed one.
- When the pre-period shows the regions did not track each other, do not start; pick
  regions again, because a lift read over unmatched regions is the pre-existing
  difference wearing a badge.
- When the lift interval includes zero, report "no detectable lift at this volume"
  and the volume that would detect it, because an insignificant test is not a finding
  of no effect.

## What is convention here

The hold-out share, the test length, the spend thresholds that separate a geo test
from a lift study, and the choice to test the biggest channel first are practitioner
conventions. That an untreated comparable group is required for a causal claim is not.

## When NOT to use

Do not run a geo holdout on a channel that cannot be geographically excluded, or in a
market too small to split into regions that still carry outcome volume - a single-city
business tests by time-based on/off with the caveat that time is a worse control than
place. Do not run it during a seasonal peak or a promotion, because the treatment
confounds with the calendar in every region. Do not hold out a channel whose absence
harms the business beyond the test - a branded-search holdout can hand the brand's own
customers to a competitor's ad for three weeks, and the loss is real even when the
finding is useful. And do not use it to decide between two campaigns on the same
platform; the attributed read is adequate for that and the holdout's cost is not.
