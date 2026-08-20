---
layer: technique
type: technique
subject: plan-entitlements
technique: price-book-authority
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [rendering a price in the product, changing a price, a pricing page that disagrees with the invoice]
---

# The price book has one owner, and it is not you

The price a customer pays is whatever the system that charges them applies.
That system is the **price book**. Every figure elsewhere in the product — the
number on the pricing card, the number in the upgrade modal, the number in the
email — is a **display duplicate** of an authority held somewhere else.

This is uncomfortable, and the discomfort produces the two standard mistakes.
The first is pretending the duplicate is authoritative: computing invoices,
proration or entitlement thresholds from the in-product figure, so a price
change in the payment system silently makes the product's arithmetic wrong.
The second is pretending the duplicate is safe: a comment next to the constant
saying "keep in sync with billing". That comment is a claim of safety with
nothing behind it, and it is written by the one person who will remember.

## The posture

1. **Name the duplication where the duplicate is defined.** The constant says,
   in its own comment, that it is a display copy, that the payment system is
   authoritative, and what happens if they diverge. Readers who might inline
   it into a calculation see the warning at the exact moment they would do it.
2. **Never compute money from the duplicate.** Charges, proration, refunds and
   totals come from the payment system. The duplicate renders, and does
   nothing else.
3. **Build a drift detector.** Something reads both figures — the in-product
   constant and the payment system's price for the same product — and fails
   when they differ. Give it a name and a place people know to look. A check
   that reads only the local constant is
   [gating a proxy](../../../../_laws.md#gate-sees-target) and passes precisely when
   the two have diverged, which is the only moment it existed for.
4. **Prefer fetching to duplicating where latency allows.** The best duplicate
   is no duplicate: render the price from the price book, cached with a stated
   staleness bound. Duplicate only when a first-paint or offline requirement
   makes fetching impossible — and then the detector is mandatory, not
   optional.

## The drift detector's shape

- **It runs where a failure is seen** — in the test suite, in a scheduled
  check, or in the deploy pipeline. A detector that only runs on request is a
  script, not a gate.
- **It compares by product identifier**, matching the product in the price
  book to the tier in the model, so an added tier without a price mapping is
  itself a failure rather than a silent skip.
- **It reports which direction it drifted.** A local price that is *lower*
  than the book means customers are quoted less than they will be charged —
  a customer-facing problem and often a legal one. Higher means lost
  conversion. The report distinguishes them.
- **Fetch failures are reported separately from mismatches.** A network blip
  is not evidence of a price change, and folding the two into one list trains
  the operator to ignore the list. Two fields: what was compared and found
  different, and what could not be compared at all.
- **A product with no comparable price is itself a finding.** If the book
  prices that product in a shape the comparison cannot read — metered, free,
  per-seat, another currency — that is drift between the product's pricing
  model and the tier model, not a row to skip.
- **A zero-comparison run fails.** If the detector found no products to
  compare, it did not pass; it did not run.

**A detector is not a fixer, and should say so.** If the mirrored figure is
still edited by hand, the honest artifact is a detector plus a note stating
that the mirror edit is manual — not a claim that the two stay in sync. The
value is in the interval between drift and discovery being bounded and short,
which is a real improvement over an unbounded one, and pretending otherwise is
how the previous safety claim got written.

## Granted amounts follow the same authority

The rule extends past prices to everything a purchase confers. When a payment
completes, **what the customer receives is derived server-side from the
product they purchased** — a mapping from product identifier to granted
quantity, held with the tier model. It is never taken from a quantity field in
the client's request, and never from a free-form field in the event payload
that a caller could influence. The payment event's trustworthy content is
*which product was bought*; everything downstream of that is a lookup you
control, and the lookup is
[the single authority for that vocabulary](../../../../_laws.md#one-authority-per-vocabulary).

## Money copy is gated on what the system can actually do

The same authority discipline governs the *sentences* the product writes about
money. An interface that says "we will top this up for you" when no stored
payment method and no off-session charge path exist is a promise the system
cannot keep, and it fails silently — the customer simply runs out while
believing they will not.

Two rules follow, and the second is the one that lasts:

- **Do not ship a charging path that can never fire.** A feature that models
  automation but performs none is strictly worse than its absence on a money
  surface, because absence prompts the customer to act. Ship the part that is
  real — a threshold preference, a pre-emptive warning, a one-click prompt —
  and name the automatic part accurately: only the warning is automatic.
- **Export a named constant that states the capability, and gate every claim
  on it.** One exported flag saying whether money can move by itself, read by
  every string that implies it, means the copy and the reality are
  single-sourced and cannot drift apart when the capability later lands. The
  flag flips in one place, and every sentence that depends on it follows.

## Prices change; history must not silently follow

A price change reprices the future, not the past. Anything the product stored
that was computed from a price — a recorded charge, a quoted total, a
historical revenue figure — records the price it used, or names how it is
recomputed, per
[derivation naming recomputation](../../../../_laws.md#derivation-names-recomputation).
A stored total that reads the current price at render time will restate last
quarter's revenue the day pricing changes, and nobody will connect the two
events.

## Decision rules

- **When someone asks to "just hardcode the price for the landing page",** the
  answer is yes *and* the detector — the constant alone is the defect, the
  constant plus the check is a legitimate cache.
- **When the payment system supports multiple currencies or regional
  pricing,** stop duplicating entirely. A local constant cannot represent a
  matrix that the price book resolves per customer, and an approximation shown
  next to a different charged amount is worse than a spinner.
- **When a price is changed, the change lands in the price book first,** then
  the duplicate. The detector will catch the window; the reverse order means
  the product advertises a price it cannot yet charge.
- **When the detector fails, fix the duplicate, never the detector.** The
  removal of a failing check is the shape this defect takes when it goes
  invisible.

## When not to use this

- **Where the product itself is the payment system** — a merchant platform
  whose own tables are what gets charged — there is exactly one authority
  already, and the technique reduces to not caching your own database.
- **For usage prices consumed by metering** — per-unit rates for a metered
  dependency are the cost side, not the sell side, and their versioning
  discipline belongs to the metering subject.
