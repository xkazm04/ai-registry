# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A Notion database is a good escalation log and a bad denominator.** It holds what somebody
chose to escalate, not what arrived, so every share computed from it alone is a share of
escalations rather than a share of contacts. That is a different and much smaller claim.
Either bring the total from the ticketing source, or say in the account that the figure is a
share of escalations, because the two get read as the same number.

**Select properties look like a taxonomy and behave like a suggestion.** Notion offers to
create a new option whenever somebody types one, so a category list grows by accident and
old rows keep the option names they were tagged with. Read the option list before reading
the rows: a category that appeared three months ago and a category that has existed since
the beginning cannot be compared on trend, and clustering the near-duplicate options is
usually the first real finding a pass produces.

**Filed work and the record of filing it are two different systems, and only one of them
knows the work shipped.** A Notion row saying a cause was filed stays true forever. This
recipe's requirement to re-raise a cause whose fix did not hold cannot be met from the log
alone: the row has to carry the identifier of the filed work so its state can be read where
it actually lives, and a row without one should be treated as unverified rather than as done.

**Querying the log is paged and the window is usually wider than one page.** A partial read
that looks complete is how a pattern claim goes wrong quietly, since the missing pages are
the older ones and their absence flattens every trend toward "new". When a read is partial,
say what window was actually covered rather than reporting the trend.

## What transfers to any knowledge base used as a record

- A log of escalations is not a denominator. Name which population a share is a share of.
- Where the tool lets a category be invented while tagging, the category list is data and
  has to be read before the rows are.
- A record that something was filed is not a record that it was fixed; carry the identifier
  so the other system can be asked.
