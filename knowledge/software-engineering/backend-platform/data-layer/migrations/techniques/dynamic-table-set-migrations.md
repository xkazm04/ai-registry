---
layer: technique
type: technique
subject: migrations
technique: dynamic-table-set-migrations
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a migration must alter every table in a set the operator defined, a shape change landed on existing tables but not on tables created afterwards, a crash left half the tables in a loop migrated, deciding whether to enumerate targets from definitions or from a name pattern]
---

# Migrating a table set that is itself data

When the set of tables is an operator's runtime decision, a migration cannot
name its targets. It has to discover them when it runs, on an installation
whose table set nobody has ever seen, and apply the same change to each. Every
rule in this technique follows from that: the step's work is a **loop**, and a
loop has properties a single statement does not.

## Enumerate from the authority, and know which authority you mean

There are two enumerations available, they disagree, and the disagreement is
the interesting part.

**From the definitions**: read the rows that define which record types exist.
This is the model's authority — if a type is not defined, the product does not
believe it exists.

**From the store**: ask the engine for its tables matching the content-plane
name pattern. This is what physically has the old shape.

The sets differ, and every element of the difference is a real situation: a
table whose defining row was deleted, a definition whose table creation
failed, a table an importer created and never registered, and — the one that
bites — debris from a previous interrupted run of a rebuild-style migration
whose temporary tables happen to match the pattern.

The decision rule:

- **Enumerate from the store when the migration's job is to fix a shape.** A
  table the definitions do not know about still has the old shape, and it will
  still be found by the *next* release that touches the content plane. Missing
  it converts a fixable divergence into a landmine.
- **Enumerate from the definitions when the migration's job is defined by the
  definitions** — adding a column derived from a field row, backfilling from
  the model rather than from the data.
- **Where the two disagree and it matters, read both and report the
  difference.** The migration is often the only thing that has ever looked at
  both ([gate-sees-target](../../../../_laws.md#gate-sees-target)): the
  definitions are a proxy for the store, and a proxy that is right on every
  healthy installation is exactly the instrument that fails on the sick one.

One hazard belongs to the pattern route specifically: **your pattern must not
match your own scratch tables.** A rebuild that creates a temporary table
beside each real one, and then re-enumerates, will find its own workspace and
try to migrate it. Give scratch tables a suffix the pattern excludes, or drop
every leftover from a previous partial run *before* enumerating — which is
required anyway, because a second attempt otherwise collides with the first
attempt's debris.

## Zero targets is not success

A loop over an empty enumeration completes without error, the ledger advances,
and nothing has happened. On a genuinely fresh installation that is the
correct outcome. On an installation with fifty operator-defined types it means
the enumeration itself broke — the name pattern changed, the definitions table
moved, a permission was lost, the listing helper returned an empty set from a
dialect it does not actually support — and the step has just reported success
for work it did not do
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

So the step asserts its instrument before trusting its result. The fresh case
is distinguishable — there is no content plane at all, no definitions, no
tables — and every *other* zero is loud: the definitions say twelve types
exist and the store listing returned none, so halt while the snapshot is fresh
rather than advance the ledger over a silent no-op.

## The two-place update is the load-bearing rule

This is the rule that makes the difference between a migration that works and
one that appears to work for a year.

A shape change to an operator-defined table set has **two places** that must
change in the same release:

1. **The migration**, which fixes the tables that already exist.
2. **The creation path** — the code that builds a table when the operator
   defines a new type — so that tables created *after* the migration ran get
   the same shape.

Change only the migration and the divergence is silent, delayed and
selective: it appears only on installations that create a type after the
migration ran, and it will not reproduce on **any** tree that migrated through
history — which is every developer's machine and every upgrade test. The
symmetric mistake, changing only the creation path, leaves every veteran
installation behind and is usually caught faster only because veterans are
noisier.

The two are hand-maintained copies of one shape
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the instinctive repair — have both call one function that emits the
canonical shape — **is not available**, for a reason worth stating plainly: a
shipped migration is frozen history and must behave identically forever, while
the creation path is live code that changes every release. Sharing an
implementation makes yesterday's migration adopt tomorrow's shape, which is
the worse defect. The two places are genuinely two places; the discipline is
to treat them as a pair, in the review checklist and in the release notes, not
to abolish them.

What compensates is measurement, and it is the sibling convergence test with
one extension that is usually missing: **create an operator-defined type on
both roads and diff that table.** A convergence test that builds a fresh store
and an upgraded store and diffs only the system tables passes happily while
every operator table diverges — because the system tables are the half that
was never dynamic. The test that finds this defect defines a type on each
store *after* migration and compares the resulting table's columns and
indexes.

## The loop must be restartable inside itself

The ledger records that a step ran. That granularity is fine for a step that
issues one statement and far too coarse for a step that issues fifty. A crash
at table thirty leaves thirty tables migrated and twenty not, and on restart
the runner re-executes the whole loop, because the ledger's only two states are
"this step ran" and "it did not".

So each iteration carries its own guard, following the assert-don't-skip rule
from [idempotent-steps](./idempotent-steps.md): probe the per-table
post-condition, continue past a table that already has **exactly** the intended
shape, and halt on any other state with the table named.

The consequence of skipping this is worse than redundant work, and it is worth
being precise about the failure. An unguarded additive change inside the loop
does not merely repeat itself: on restart it raises a duplicate error at the
*first* already-migrated table, before reaching any of the twenty that were
never touched. Every subsequent boot fails at the same table. The chain can
never advance again on that installation, and only on that installation — a
permanent stall that is invisible everywhere it was tested. The same holds for
index creation phrased without a conditional or without a preceding
unconditional drop.

Two smaller rules from the same reasoning:

- **The unit of atomicity is the table, not the step.** A per-table rebuild
  over N tables is N rewrites in one ledger entry; you cannot half-record it.
  Make each table's transition atomic and each iteration idempotent, and the
  step becomes resumable without the ledger knowing.
- **Clean up before, not after.** Leftover scratch from an interrupted run is
  dropped at the top of the step, unconditionally. Cleanup at the end runs
  only on the path that did not crash, which is the path that did not need it.

## When not to write the loop

If the change can be expressed in the **definition plane** — a new field on
every type is a definitions-row insert, not a column on fifty tables — express
it there and let the creation and alteration paths do the schema work they
already know how to do.

What this does not license is calling the live schema-management code *from*
the migration. That code is versioned with today's release and will change
under a migration that must behave the same way in five years; a migration
that calls it has made its behaviour a function of when it runs. Write the
data-definition statements in the migration, with validated identifiers, and
accept the two-place rule rather than collapsing it into a dependency on live
code.
