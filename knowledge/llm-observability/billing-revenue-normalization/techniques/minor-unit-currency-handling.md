---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: minor-unit-currency-handling
status: forged
laws: []
shared_with: []
use_when: [converting provider amount fields into major currency units, ingesting payments in currencies beyond the reporting base, reviewing any code that divides an amount by one hundred]
---

# Minor-unit currency handling

Billing providers transmit amounts as integers in the currency's **minor
unit** — the smallest denomination in circulation — because integers survive
serialization and arithmetic without the representation errors decimals
invite. The number that arrives is therefore not an amount of money yet; it
is minor units *of a particular currency*, and the divisor that turns it into
major units is a property of that currency: ten raised to its decimal-places
exponent, as standardized per currency code (ISO 4217).

The defect this technique exists to kill is the **blanket divide-by-100**,
which encodes "every currency works like the dollar". Most do — two decimal
places — which is exactly why the bug ships: it passes every test written in
the home currency. Then the first customer pays in a zero-decimal currency
and the books quietly understate that revenue a hundredfold. The incident
shape is always the same: yen revenue reported at one percent of reality,
caught not by any alert but by a human noticing a large market contributing a
rounding error. The inverse bug — treating a three-decimal currency as
two-decimal — *overstates* by a factor of ten instead, so neither direction
is safe to assume.

## The currency classes

- **Two-decimal (the default):** divisor 100. The vast majority of currency
  codes.
- **Zero-decimal:** the minor unit *is* the major unit; divisor 1. The
  well-known member is the yen; the class also includes the won, several
  African and Pacific francs, and others — roughly fifteen codes.
- **Three-decimal:** divisor 1000; the Gulf and Maghreb dinars and rials.

Encode this as a per-currency lookup with the two exception lists explicit
and the two-decimal default for everything else — a shape that is auditable
in one screenful and testable with one case per class. Take the lists from
the standard's published table, not from memory. Note one sharp edge:
some providers *flatten* certain zero-decimal currencies to a two-decimal
convention in their own API even though the standard says zero — the
authoritative table for ingest is *the provider's* amount semantics, verified
against their documentation, with the standard as the fallback for currencies
the provider does not special-case. When in doubt, reconcile one real payment
end to end.

## Decision rules

- **Convert minor → major exactly once, at ingest**, at the boundary where
  the provider's representation becomes your record. Amounts inside your
  ledger are major units of a named currency (or of the reporting base after
  conversion); a codebase where some layers hold minor units and some hold
  major is a factor-of-100 bug lying in wait at every interface.
- **The currency label rides with the amount everywhere.** A bare number is
  not money. Every function that accepts an amount accepts the currency code
  beside it; the pair is the value.
- **Preserve the original currency on the record** even after converting the
  amount to the reporting base. The conversion is derived data; the original
  currency and its magnitude are the source of truth, and support,
  reconciliation, and re-rating all need them intact.
- **Uppercase and validate the code at the boundary.** Providers vary casing;
  your lookup should not care, and an unrecognized code should be visible in
  telemetry rather than silently falling into the two-decimal default for
  what might be a typo rather than a currency.
- **Write the class tests in foreign currencies.** A test suite whose every
  amount is in the home currency structurally cannot catch this family of
  bug. One zero-decimal case and one three-decimal case pin the lookup
  forever.

## When not to use it

If the provider delivers amounts already in decimal major units (some
invoicing APIs do), converting again is a fresh bug — the technique's first
step is establishing, from the provider's documentation and one reconciled
real payment, *which* representation arrives. And internal ledgers that
choose to store minor-unit integers end to end for exactness are fine — the
technique then governs the display/reporting boundary instead. What is never
fine is the same amount meaning different things in different layers with
nothing but convention keeping them straight.
