---
subject: usage-event-ingestion
domain: software-engineering
last_touched: 2026-09-07
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

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
