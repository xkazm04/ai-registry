---
name: general-ledger-close-and-reconciliation
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/spend-and-budget
---

# General ledger close and account reconciliation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A close that finishes on time with every account signed off is the normal way
a misstatement survives a period. The reconciliation that hid it agreed to the penny,
because the schedule it agreed to was exported from the same ledger it was proving, or
because a residual nobody could name was carried forward under the word timing for the
eleventh month running. Nothing is missing, nothing is late, and the foundation every
downstream report inherits was never independently supported.

**Input.** The trial balance at cutoff, the subledgers and statements that stand behind
each account and the dates those sources actually landed, the differences carried
forward from prior periods with their age and owner, the adjusting entries proposed this
period, and the materiality that decides what a difference has to be before it matters.

**Core action.** Decide, account by account, whether the balance is supported by
evidence the ledger did not produce, and split every difference into timing that will
clear on a stated date, an error that needs an entry now, and a residual whose cause is
genuinely unknown. The third bucket is the one that quietly gets filed into the first,
and keeping it separate until the period locks is the judgment at the centre of the
work.

**Output.** A locked period whose adjusting entries are posted and explained, a file a
reviewer can walk from any balance back to a source outside the ledger, and an explicit
list of what was accepted unreconciled, how old each item is and who owns it. An account
where nothing was wrong still records what was compared against what, so a clean account
is distinguishable from an account nobody opened.

## Activities

1. Assemble each account balance beside support the ledger did not produce *(observe)*
2. Separate the difference into items either side can name and a residual neither can
*(decide)*
3. Judge each difference as timing with a clearing date, error, or cause unknown
*(decide)*
4. Post the corrections the classification earns and leave genuine timing to clear
*(act)*
5. Raise the unexplained residual and the aging items before the period locks *(act)*
6. Leave a file that walks from balance to source, including the accounts that were
clean *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every material balance rests on evidence that did not come from the ledger being
proved.**

- The support cited for an account is identified by its origin, so a bank statement and
  a report exported from the ledger are never both accepted as proof of the same
  balance.
- A residual is reported at its own size rather than netted against unrelated
  differences that happen to run the other way.
- An account with a zero or dormant balance is reconciled and recorded as such, since a
  zero can mean nothing happened or that two errors met.
- A first close with no prior reconciliation file states that opening balances were
  accepted rather than proved, instead of presenting an inherited balance as verified.
- A difference a preparer dismisses is not absorbed on the assertion alone: an
  explanation is recorded with the evidence that corroborates it, and an uncorroborated
  explanation leaves the item open rather than closing it.

**Calling a difference timing is a claim with a date, and the claim is checked when that
date passes.**

- Each timing item carries the period it is expected to clear in, and an item that did
  not clear when predicted is reclassified rather than re-aged.
- Aged items are reported by age with an owner, so a difference that has survived
  several closes is visible as a pattern and not as six separate small notes.
- A residual that cannot be explained but sits below materiality is written off
  deliberately with the write off recorded, never plugged into a suspense account that
  carries it forward unnamed.

**Someone who was not present can reconstruct what was checked, what was found and what
was accepted.**

- The record distinguishes an account judged clean from an account not reached before
  the period locked, and a close that ran out of time says which accounts that was.
- Every adjusting entry is traceable to the difference that justified it, so an entry
  with no reconciliation behind it is visible.
- A source that had not arrived at cutoff is recorded as not yet available rather than
  as agreeing, since an account reconciled against a statement that does not exist reads
  identically to a real tie.

## Guidance

A reconciliation proves nothing when both sides came from the same system. Insist on
support the ledger did not produce, and treat the residual as the real output: an
account that ties to the penny against its own export is less reconciled than one
carrying a named, aged, owned difference. Timing is a claim with a date attached, and a
difference called timing for six months has been reclassified by silence into an error
nobody has looked at.

## Where this is worth adopting

- A team closing on the fifth working day where three of the reconciliations are owned
  by a person travelling that week, so the accounts most likely to be signed off on last
  period's logic are known in advance.
- A company that has grown past the point where one person remembers why each balance is
  what it is, and the reconciliations are now performed by people who did not post the
  original entries.
- The first close after a system migration, where balances came across as opening
  figures and nobody has yet proved any of them against an outside source.
- An entity heading into its first audit, where the question is not whether the numbers
  foot but whether the file behind them survives a reviewer asking where each figure
  came from.
- A month where a suspense or clearing account has been quietly absorbing differences
  for several periods and the balance has grown large enough that somebody has to name
  what is inside it.

## Connector types

`finance`, `spreadsheet`, `database`, `documentation`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. An account becomes reconcilable when the statement that supports it lands, and
those arrive over days in an order the calendar does not know. Starting on a fixed date
guarantees the first pass runs against subledgers still posting, which produces
differences that are artifacts of the moment they were read, and those false differences
then compete for attention with the real ones. Let cutoff and each source arriving drive
the work, and let the lock date be the deadline rather than the trigger.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What counts as independent support for each account here, because the answer differs
  by account and by entity and an adopter who accepts a ledger export as evidence has
  automated a tie that proves nothing.
- The materiality this close is run against and who set it, since materiality is what
  separates a difference worth an entry from one worth a note and every threshold in the
  work descends from it.
- The order the adopter's sources actually arrive in and how late the slowest one is,
  because the sequence of the close is determined by that and not by the chart of
  accounts.
- Who owns each account and who has authority to accept an unreconciled difference, so
  escalation reaches a person who can decide rather than circulating as a note.
- Which differences this entity has historically been wrong about, since a recurring
  cause here is worth more than a general list of what usually goes wrong.

## Dependencies

None.
