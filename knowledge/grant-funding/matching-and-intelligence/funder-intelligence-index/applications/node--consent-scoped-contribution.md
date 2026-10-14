---
layer: application
type: application
subject: funder-intelligence-index
technique: consent-scoped-contribution
stack: node
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Node - consent-scoped contribution, and the second reader of the outcome store

How the Wellspring grant-writing product (repo `grant-writing-nonprofits`)
realizes the standing read-time consent filter, and what a hunt for a
second reader of the raw outcome rows found.

## What was already right

The Index bridge reads the cross-org outcome rows and the set of consenting
organizations together and keeps only rows whose organization is in the
set. An organization with no profile row is excluded, the filter runs at
read so an opt-out drops history on the next read, suppression is a
separate function, and the provenance notice is composed in one place from
the same floor constant the suppression code tests.

## Seam chosen to falsify "the filter has one implementation"

The technique says every read path feeding a public aggregate goes through
the same consent function. The way to break that claim is to enumerate the
callers of the raw store read, not to read the filter. Two callers existed.
The Index bridge filtered. The fit-score calibration table, which pools
every organization's decided outcomes into per-band award rates and is
shown publicly as the calibration badge, read the same rows unfiltered. An
opted-out or profile-less organization still fed its bands. The table is
derived, so it never looked like "an index read" and nobody had listed it
as a reader.

## A and B

- A: calibration table built from the raw read. Paired test with three
  organizations, one non-consenting: 3 decided outcomes pooled.
- B: the filter exported from the bridge and the table built through it:
  2 pooled. The new test fails on the old source and passes on the new.
- Floor: 301 tests across the wellspring-index and match-engine features,
  tsc and eslint clean. The memoization and transient-error behaviour of
  the calibration table is unchanged (its existing tests, re-pointed at the
  filtered read, pass).

## Not measured

How many live outcome rows belong to non-consenting organizations (no
production store snapshot was at hand), so the size of the leak the fix
closed is unknown. Band-level suppression of the calibration table is a
separate question this run did not open.
