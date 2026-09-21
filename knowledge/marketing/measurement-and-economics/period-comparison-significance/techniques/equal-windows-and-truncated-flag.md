---
layer: technique
type: technique
subject: period-comparison-significance
technique: equal-windows-and-truncated-flag
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [a period selector offers windows longer than the account's history, a comparison window is derived from whatever data is left, a narrative layer wants to say "rising" or "falling"]
---

# Equal windows and a truncated flag

The comparison window is the equal-length span immediately before the current one.
When the daily series is too short to supply both - a 45-day-old account asked for
"last 30 days" - the current window is **capped to half the series**, so the two
spans stay equal, and the result carries a **truncated flag** with the span actually
used. Nothing about the shortening is silent.

## The failure this prevents

Without the cap, a window longer than half the series is compared against a shorter
remainder: 30 days against 15. Every additive delta is then inflated by roughly the
length ratio - revenue "doubled" because the baseline is half as long - and every
tier is computed over unequal samples. The account's age reads as growth. The
inverse also occurs when a full window is compared against a padded baseline of
phantom zero days: the account's age reads as a collapse. Both are the same error:
the baseline was whatever was left, rather than a window of the same shape.

## Procedure

1. Let n be the series length in days and N the requested window.
2. The usable span is the smaller of N and floor(n / 2).
3. The current window is the last span days; the comparison window is the span days
   before it. The two are equal by construction.
4. The result carries: the requested window, the actual span, and a truncated flag
   equal to (span < requested). The flag is a first-class field, not inferred by a
   consumer from the lengths.
5. The period header renders the cut: "12 months · shortened to 22 days", with a
   hover explaining that the series is shorter than the chosen period and both
   windows were capped to the equal-length span available.
6. Downstream consumers read the flag. A narrative layer that would say "rising" or
   "falling" against the prior window withholds the trend word when the flag is set,
   because a halved short series has a fabricated "previous"; a twelve-month
   sentence is withheld outright, because "12 months" over 22 days is a false label.

## Decision rules

- When the series is shorter than twice the requested window, cap to half and flag,
  because equal windows are the precondition of every delta and tier on the surface.
- When the flag is set, suppress trend words and long-horizon claims in prose but
  keep the numbers, because the numbers are real over the span they cover and only
  the label was wrong.
- When a year-over-year baseline is in force, the cap is different - the span is
  limited by the year-ago twin fitting inside the series - but the same flag and the
  same header rule apply.
- When a consumer needs "at least K days" for its own reason (a de-seasonalisation
  profile, a response curve), it declares its own floor and refuses on it; the
  truncated flag says the windows were cut, not that they are sufficient for every
  purpose.

## What the flag is not

It is not an error state. A truncated comparison is a valid, honest comparison over
a shorter span, and a young account deserves a 20-versus-20-day read rather than a
blank dashboard. The flag exists so that the label matches the arithmetic, and so
that the layers that make claims - narrative, report, model grounding - can refuse
the claims a short span cannot support while the layers that show numbers keep
showing them.

## When NOT to use

Do not apply the half-series cap to a fixed-window bucket series (weekly windows
counted back from an anchor); those buckets carry their own completeness flag and
the leading partial bucket is handled by the partial-bucket rule, not by truncation.

Do not pad the baseline with zero days to reach the requested length. A zero day is
a measured nothing, and a baseline padded with them fabricates a collapse; absence is
rendered as a shorter window, never as zeros.

Do not hide the selector options that cannot be honoured. Offer "12 months", cap it,
and label the cap; a menu that shrinks as history shrinks teaches the reader
nothing about why.
