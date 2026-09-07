# Airtable as the `spreadsheet` connector

What was learned mapping this recipe onto Airtable specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Whether the base can hold the arithmetic at all.** Almost every contract register starts as
one date column called something like Renewal Date, and that single column cannot express the
thing this recipe watches. It needs the end date, the notice period, and ideally whether the
contract renews unless stopped or stops unless renewed. If those columns do not exist, the
honest adoption step is to add them and backfill from the contracts, not to point the recipe
at the column that is there. Watching the wrong date on a well maintained base is the failure
this recipe was written against.

**A formula field is the right place for the computed deadline, and the wrong place to hide
it.** Deriving the notice deadline in the base means people see it while they work, which is
most of the value. It also means the formula silently returns nothing for every row with a
blank notice period, and a blank reads as a row with no deadline rather than as a row that
cannot be assessed. Whatever computes it, count the rows it could not compute and report that
number as part of the account.

**Owner is a link, not a text field, or the watch cannot escalate.** A name typed into a cell
cannot be resolved to somebody to notify, and the workaround of falling back to whoever filed
the contract produces a reminder that reaches a real person with no authority. Make the owner
a link to a people table, and treat an empty owner as a finding to report rather than a
routing problem to solve quietly.

**Views are filters, not scopes.** Reading a view rather than the table means a filter change
somebody made for their own convenience silently removes contracts from the watch. Read the
table and filter in the work, or read the view and check its record count against the table's
so a sudden drop is visible.

**Date fields carry time zones and this arithmetic is in days.** A deadline computed from a
timestamp interpreted in the wrong zone moves by a day, which is invisible for a ninety day
window and decisive on the last one.

## What transfers to any spreadsheet or table connector

- Check the schema can express the computation before adopting. A missing notice period column
  is not a data quality problem, it is the recipe being inapplicable.
- Count and report the rows the computation could not be performed on. A blank is not a zero.
- An owner that cannot be resolved to a person is a finding, never a fallback.
- Read the table, not somebody's filtered view of it.
