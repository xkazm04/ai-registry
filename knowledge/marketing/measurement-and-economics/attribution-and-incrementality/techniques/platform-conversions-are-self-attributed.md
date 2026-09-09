---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: platform-conversions-are-self-attributed
status: forged
laws: [platform-reported-is-not-causal, not-measured-is-not-zero, provenance-is-binary-and-labelled]
shared_with: []
use_when: [a platform's conversion column is about to be shown as revenue or as proof, two platforms' conversion values are being summed, a prompt is being grounded with per-platform conversion numbers]
---

# Platform conversions are self-attributed

An ad platform's conversion count is the platform's own attribution of itself: the
conversions it could tie to a touch it served, under a lookback window, an attribution
model and a set of countable interaction types it chose. Read it as the platform's
claim, label it as one, never add it to another platform's claim, and reconcile it
against the business's own bookings whenever those exist.

## What the platform decided for you

Four choices sit inside the column, and each moves the number:

- **The model.** The dominant search-ad platform now offers two - last click and a
  data-driven model - with the data-driven model the default for new conversion
  actions and older models migrated to it automatically, per the platform's own
  documentation. A data-driven model redistributes credit among the platform's own
  touches; it never gives credit to a touch the platform did not serve.
- **The window.** A click may be credited for weeks; a view for a day. The platform's
  defaults were reset in the same period the models were reduced, so a column read
  across the boundary compares two different rules.
- **The interaction types.** View-through and engaged-view conversions count on some
  campaign types and not others. A campaign whose column includes views is not
  comparable to one whose column does not.
- **The counting rule.** "Every" versus "one" conversion per click, and which actions
  are primary. Two actions both marked primary for the same outcome count one order
  twice inside a single platform.

None of these is a defect. All of them mean the column is an upper bound on what the
platform caused, produced by the party paid for it.

## Procedure

1. Carry the platform name with every conversion number as its provenance, at the
   number, not in a footer. "Conversions (platform-reported)" is the honest column
   header; "conversions" alone is the dishonest one.
2. Never sum conversion counts or conversion values across platforms. Sum cost, which
   is not attributed, and show each platform's claimed value beside it. When a blended
   series is unavoidable, the blend states that it double-counts shared orders and is
   not the business's revenue.
3. Where the business has its own order or lead count for the period, show it beside
   the sum of platform claims. The excess of claims over bookings is the overlap, and
   it is the cheapest attribution diagnostic a small business can run.
4. When a platform did not report a metric for a row - a network that has no
   impressions column, a day it could not measure - the blended value is absent, not
   zero. A partial sum presented as the day's total understates every rate built on
   it.
5. Ground a model or a prompt with the platform label on each number and with an
   instruction that the number is the platform's own attribution; a narrated "the
   search platform drove 40 orders" must read "the search platform reports 40
   orders".

## Decision rules

- When two platforms' conversion values are about to be summed, do not; show them side
  by side with cost summed, because each platform claims every order it touched and
  the sum counts a shared order once per platform.
- When a surface shows a conversion count without its platform, add the platform,
  because a count without its attributor cannot be reconciled and reads as the
  business's own.
- When the sum of platform claims exceeds the business's booked orders, report the
  excess as overlap rather than suppressing either figure, because the overlap is the
  measurement and hiding it restores the lie.
- When a column's model or window changed inside the comparison period, flag the
  boundary and do not narrate the delta as a performance change, because the rule
  moved and the customers may not have.

## What is convention here

The advice to treat the platform's count as an upper bound is a consequence of
documented behaviour: a platform counts only its own touches and counts all of them.
The instruction to reconcile against bookings is practitioner convention; no
platform documents a reconciliation method.

## When NOT to use

Do not apply this to the platform's own bidding. The bidding runs on the platform's
attribution and needs it; the self-attributed column is the right input there, and
the offline-conversion upload exists to enrich it. Do not apply it to a single-platform
account with no other channel and no bookings source: the column is still labelled,
but there is nothing to reconcile it against, and inventing a discount factor for it
would be a fabricated number of exactly the kind this technique forbids.
