# Google Cloud as the `cloud` connector

What was learned mapping this recipe onto Google Cloud specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The report is only as fresh as an export somebody configured.** Detailed cost is not
served by a query the recipe calls; it is written by a billing export into a warehouse
dataset, and everything the report says is a query over that dataset. Adoption has to
verify the export exists and is current, and the report's freshness claim is the age of the
newest row rather than the moment the report ran. Say that date in the report, because the
two drift apart silently.

**A row is a line item, not a service, and the grouping is the recipe's own work.** Where
another provider hands back cost grouped by service, here the grouping is a query the
mapping writes, which means the per-service table is a definition the adopter owns. Two
people writing that query will disagree about what counts as one service, and the baseline
is only comparable to itself while that definition holds. Write it down at adoption and
treat a change to it the way the recipe treats a change of cost basis.

**Credits are separate rows and they decide what the number means.** Discounts and credits
arrive as their own entries rather than folded into the line they reduce, so a report that
sums the obvious column reports gross cost and a report that nets the credits reports
something closer to what was paid. That is this provider's version of the cost-basis
decision, and it has the same failure: the two differ by enough that a switch between them
looks like a real move.

**Labels are per resource and not everything is a resource that takes one.** Shared and
platform-level charges have no label to carry, so an unattributable share never reaches
zero here no matter how disciplined the labelling is. Establish what that floor is at
adoption, so the recipe's growing-unattributable-share finding fires on a real change
rather than on the permanent baseline.

## What transfers to any cloud connector

- Where cost arrives through an export, the report's freshness is the newest row's age, not
  the run time.
- If the per-service grouping is the recipe's own query, it is a definition that has to be
  written down and versioned like the cost basis.
- Find the unattributable floor before adopting the growing-share finding, or it fires
  forever on charges that can never carry a label.
