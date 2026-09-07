# HubSpot as the `crm` connector

What was learned mapping this recipe onto HubSpot specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**This connector is optional by design, and the recipe has to work without it.** What it
supplies is account age and segment, which is what the low-confidence rule for young accounts
keys on. Without it, that rule falls back to the payment record's own first-seen date, which
is later than the real relationship start and therefore more conservative. That fallback is
correct behaviour rather than degraded behaviour, and the mapping should say which of the two
dates a given score was computed from.

**Joining a CRM company to a payments customer is the hard part and it is never clean.** The
identifier in the payments system is not the identifier here, and the join is usually made on
an email address or a domain. Both fail in ordinary ways: a personal address on a company
account, a company with two domains, a customer who pays under a parent entity. An unjoined
account is not a low-risk account, and treating a failed join as an absence of context is how
a whole segment quietly stops being scored. Report the join rate; a falling one is a finding.

**CRM fields are edited by people and are stale by default.** Segment, tier and owner are
whatever somebody last typed, and they are not maintained on a schedule. A score that weights
a stale segment heavily inherits that staleness without any signal that it did. Weight this
context as softer evidence than anything read from the payment record, which at least is a
record of something that actually happened.

**Lifecycle stage looks like a churn signal and is not one.** It records where a company sits
in a sales process, moved by hand, and a company that renewed happily for two years may still
sit at whatever stage it reached at close. Reading a movement in it as an intent signal is the
mistake this connector most invites.

## What transfers to any CRM connector

- Establish the join key at adoption and report the join rate, because an account that could
  not be matched is invisible rather than healthy.
- Treat human-maintained fields as softer evidence than machine-recorded events, and say which
  a score leaned on.
- When the enrichment is optional, name the fallback and record which path a given score took.
