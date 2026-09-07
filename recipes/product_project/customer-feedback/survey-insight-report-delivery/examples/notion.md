# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Archiving is optional and filing is not.** A knowledge base here is a destination for the
report and the natural home for the filed themes, and the recipe has to work without one. The
part that genuinely benefits is the criterion that a theme already filed grows in weight
instead of duplicating: a page is a stable place for a theme to accumulate periods of evidence
under, which is much cheaper than reconstructing the history from a run of messages.

**Matching a theme to its existing page is the whole difficulty.** Themes are named by
whoever coded them, so the same complaint arrives as slightly different wording each period
and title matching produces a new page every time. Give each theme a stable identifier of its
own and store it as a property, then look the page up by that rather than by its title. Let the
title change freely, because the wording will improve and the identity should not.

**Append the period; do not rewrite the page.** The value of a theme page is that a reader can
see it getting worse or better, and that is destroyed by a run that replaces the body with the
current picture. Each period is a block appended under the page with its own count and date,
and the summary at the top is derived from those rather than being the only copy.

**A report and a theme are different objects and should not share a database.** The report is
an artefact of one period and is never edited again; a theme is a long lived record that grows.
Putting both in one table means every view has to filter by type and every property is blank
for half the rows.

**Filing is a write, so check write access at adoption.** A binding that can read the base and
not write it succeeds through the entire compose step and fails only at the end, after the
report has already been delivered somewhere else, which makes the failure look like a filing
bug rather than a permission one.

## What transfers to any knowledge base connector

- Identity is a stored key, never the title. Theme wording changes every period.
- A theme record accumulates; a report record does not. Keep them apart.
- Appending a period preserves the trend that makes the record worth keeping; overwriting
  turns a history into a snapshot.
