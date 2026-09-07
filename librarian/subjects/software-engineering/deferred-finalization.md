---
subject: deferred-finalization
domain: software-engineering
last_touched: 2026-09-07
dry_streak: 0
---

# deferred-finalization

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - recomputable-draft, finalization-freezes-the-inputs, void-then-regenerate, correction-window-is-the-grace-period.

The window between 'the system believes it knows what you owe' and 'this is now a financial record'. Written as a general pattern with billing as its worked case. The transferable idea is `void-then-regenerate`: the audit link between a voided document and its replacement is what RELEASES the uniqueness constraint, so the audit trail is load-bearing rather than decorative - a second document cannot exist for a period without a recorded reason the first stopped counting. Carries a verified ABSENCE as its honest limit: late usage for an already-finalized period has no path back in, established by enumerating every refresh trigger.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
