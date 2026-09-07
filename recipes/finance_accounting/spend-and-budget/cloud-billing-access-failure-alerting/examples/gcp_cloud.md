# Google Cloud as the `cloud` connector

What was learned mapping this recipe onto Google Cloud specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## The failure modes this provider actually produces

**There is no cost endpoint to fail.** Detailed cost is not served by a query API in the
way it is elsewhere; it arrives through a billing export into a data warehouse dataset that
somebody configured once. Everything downstream reads that dataset. So the failure this
recipe classifies is almost never a broken credential and almost always a property of the
export: it was never enabled, it was enabled for one project and not the billing account,
it was pointed at a dataset that has since been deleted, or it is simply behind.

**A stale export fails silently and looks like a quiet month.** The dataset is still there
and still queryable, so the read succeeds and returns rows that stop at some date. Nothing
raises an error. This is the exact shape the recipe's partial-data criterion exists for,
and on this connector it is the default failure rather than an edge case. The check that
catches it is the age of the newest row, not the success of the query, so the mapping has
to establish what a normal maximum row age looks like at adoption and alert on that number
rather than on an exception.

**The export lands late by design, and the recipe must know how late.** There is a normal
lag between usage and its appearance in the dataset. Without that number the recipe cannot
tell yesterday's absent rows from a broken pipeline, and it will alert every morning.

**Two credentials, two failures.** Reading the export needs warehouse access; confirming
the export configuration needs billing account access, which is usually held by someone
else entirely. An alert that says the export is stale is only actionable by the second
person, so naming which of the two is missing is most of the alert's value.

## What transfers to any cloud connector

- Where cost arrives through an export rather than a query, the health signal is the age of
  the newest row, and a successful query proves nothing.
- Establish the provider's normal publishing lag at adoption, or the recipe alerts daily on
  ordinary behaviour.
- Say which access is missing when reading the data and fixing the pipeline need different
  people.
