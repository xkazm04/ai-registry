# Airtable as the record store, and why `crm` does not resolve to it

What was learned mapping this recipe onto Airtable specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change. This entry is kept because it documents a mismatch, not because it is a
recommendation.

## What the mapping has to decide

**The declared type will not offer this connector.** Airtable is catalogued as
spreadsheet, database and project management, and carries no CRM category. An adoption
resolving this recipe's `crm` type therefore never sees it, and an adopter whose CRM is
in practice a base has to bind `database` instead and accept that the recipe's declared
type is the wrong description of their setup. Check the catalog categories of the store
you actually intend to use before adopting, because a type that resolves to nothing
produces an adoption that looks configured and has no record store behind it.

**A base does not defend uniqueness, so identity resolution is entirely this recipe's
job.** A CRM will usually match on email or merge on write. A base accepts the duplicate
without comment, keeps both, and reports success. Every guarantee in this recipe's first
outcome has to be implemented by the recipe here rather than delegated, and a read before
write is not enough on its own once more than one submission can arrive at the same time.

**There is no owner, so routing has no source.** A CRM has an ownership field this recipe
can read; a base has whatever column somebody made. If the downstream alerting recipe is
adopted alongside this one, the owner column has to be agreed here first, or the two will
maintain separate ideas of who owns a lead.

**Capacity is a foreseeable end state, not an anomaly.** A base has a records per base
cap and per second request limits, and reaching either is exactly the refused write this
recipe's outcome names. It is worth deciding before adoption where a held lead goes and
who is told, because the cap arrives on a predictable date rather than as a surprise.

**A returning enquirer needs a linked record, not a text field.** Attaching a second touch
to the person who already exists depends on the schema having been built for it. A text
column holding a name cannot carry the relationship, and the re-engagement half of this
recipe silently degrades into a second row.

## What transfers to any record store

- Confirm the connector's catalog categories actually include the type the recipe
  declares. A type that resolves to nothing is the quietest possible adoption failure.
- Ask whether the store enforces uniqueness or whether the recipe must. If it must, a
  read before write is not sufficient under concurrency.
- Ask what happens at capacity before it happens, because the refused write is a
  scheduled event rather than an incident.
