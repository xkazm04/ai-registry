---
subject: usage-event-ingestion
domain: software-engineering
last_touched: 2026-09-15
dry_streak: 0
---

# usage-event-ingestion

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - thin-ingest-deferred-validation, dedupe-key-survives-soft-delete, late-event-subscription-resolution, ingestion-contract-parity.

Admission for a metered billing engine: what is validated when, how a duplicate is refused, which subscription an event belongs to. The sharpest verified fact is a schema one - `index_unique_transaction_id` is the ONLY index on the events table without `WHERE (deleted_at IS NULL)`, while the near-identical non-unique lookup one line above it carries the predicate. A soft-deleted event still blocks its own re-submission, deliberately. Worker took six upward lessons, incl. first-write-wins vs last-write-wins inverting between two stores behind one public endpoint, and a resolution cache horizon that must be derived from the late-event window (the two runtimes diverge on this today).

## 2026-09-15 - running-total-or-increment (intake, [[2026-09-15-ai-engineering-coach]])

Fifth technique, and the first one this subject took from a fleet seam hunt rather
than from a billing engine. An interval report carries increments or running
totals per counter series; the two need opposite storage rules and look identical
one value at a time. The golden path's enumeration ("five things that matter to
admission") describes a per-occurrence event and stays true; the new section
scopes itself to interval reports and says the aggregation sibling's "each appears
once" assumption is what a running total breaks, which is why the decode lives at
the door and not in the fold.

Applied in ascent (code, ab-paired, better, `7dc3a545` on its active branch, not
pushed): one metrics report read into a day table that added and a session table
that replaced, neither reading the declaration. The vendor default is delta, so
sessions kept one interval (500 of 1500); a cumulative exporter would have made
the day table 2500 of 1500. Both test files used single-report fixtures, which
cannot see the encoding. Note for the lead below: the seam arrived through an
**analytics** ingest of a vendor's own usage, not through a project metering its
customers - the technique's scope is any store fed by interval reports, and the
old return condition was narrower than the mechanism.

Source-tree application against the intake source: it documents each token
counter's accumulation scope and then fills one field from either scope with
nothing recording which.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
