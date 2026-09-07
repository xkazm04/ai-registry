# AWS as the `cloud` connector

What was learned mapping this recipe onto AWS specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Which cost figure the report is built on, once, and then never quietly again.** This
provider serves several, and they answer different questions. One reports what appeared on
the invoice, which is what a purchase of a commitment looks like on the day it was bought.
One spreads that commitment across the hours it covers, which is what the operation
actually costs to run. A report that reads the first will show a single enormous day and
then months of understatement; a report that reads the second will not reconcile against
the invoice. Both are defensible and the recipe only asks that the choice is stated and
held. The trap is that the default is usually the invoice-shaped one, so the switch tends
to happen by accident when somebody improves the query.

**Per-service grouping is free here, which is what makes the per-service table cheap.** The
cost query returns cost grouped by service directly, so the recipe's core comparison does
not require assembling anything. This is the main reason the mapping is easy on this
provider and the reason it is worth checking that the equivalent exists before assuming the
recipe is cheap elsewhere.

**The unattributable share has a specific shape here.** Labels have to be activated for
cost purposes before they appear in cost data at all, and they only apply from the moment
of activation forward, never retroactively. So a freshly activated label produces a report
where the current period is well attributed and every earlier period is not, which looks
like attribution improving when it is really the baseline being inconsistent. Report the
unattributable share per period rather than as a single figure, and expect a step in it.

**The last two days move.** Recent figures are estimates that keep settling, so a period
read too soon after its boundary reports low and then rises. Leave the provider time to
publish before the report runs, and treat a period read early as partial.

## What transfers to any cloud connector

- Pick the cost basis at adoption and record it in the report itself; the damage is in
  moving between bases, not in which one was picked.
- Check whether the source groups by service natively before assuming the per-service
  comparison is cheap.
- Ask whether labels apply retroactively. Where they do not, the attributable share has a
  step in it that is not an improvement in the operation.
