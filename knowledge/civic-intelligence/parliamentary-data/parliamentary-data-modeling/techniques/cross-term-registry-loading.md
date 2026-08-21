---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: cross-term-registry-loading
status: forged
laws: [every-cap-ships-its-population, disclose-never-repair]
shared_with: []
use_when: [ingesting per-term bulk dumps, deciding what to filter at ingest, re-ingesting full-snapshot exports]
---

# Cross-term registry loading

Bulk parliamentary exports are usually packaged per term — one bundle for
the current legislature, one per historical one — but the data inside does
not respect the packaging. The technique is a loading policy with three
rules: **registries load in full, facts load scoped, and every file is
audited for which of the two it actually is.** The third rule exists because
the packaging lies.

## Registries load in full

Person and body registries are small (thousands of rows) and referenced
from everywhere across time. A current member's electoral region and the
list they ran on are body rows created in an earlier term; a returning
member's person row predates the current bundle. Loading "just this term's
people and bodies" breaks cross-term joins in ways that surface far from the
cause — as null regions, unresolvable list references, split person
identities. Load the full registries on every ingest, unconditionally, and
let the term columns on *facts* do the scoping. The term code is a query
scope, not an ingest filter.

## Facts load scoped — and check the file, not the label

Event tables (roll calls, ballots, excuses, speeches) are large and
term-bound, and here the trap lives: **a file shipped inside a term-labeled
bundle may not be term-scoped.** Publishers sometimes drop the
institution's entire historical table into every term's bundle — an excuses
file carrying a million rows spanning decades inside each term's dump is a
real, measured case. Ingest it naively per term and the store writes the
same million rows once per term ingested; the duplication is invisible
until a count is 2× wrong.

The defense is mechanical: the fact tables in a dump declare (directly or
via their parent events) which term ids they belong to; keep only rows
whose term id is present *in this dump's own events*, and count what was
excluded. Never assume the bundle label scopes the contents; derive the
scope from the contents.

## Full snapshots force idempotent re-upsert

Most publishers rewrite the entire dump daily and publish no diff feed, so
ingest is a full re-upsert on natural keys, and idempotence is a hard
requirement — the same bundle ingested twice must be a no-op. That puts all
the pressure on natural-key choice:

- **The key includes everything that distinguishes real facts.** The same
  person rejoining the same body needs the window start in the key; several
  excuse windows on one sitting day need the full
  (term, mandate, day, from, to) tuple — a measured registry showed a
  day-plus-start key colliding seventy-plus times in one term, each
  collision a real second excuse silently eaten.
- **Publisher duplicates are counted, not hidden.** Exports without unique
  constraints repeat whole rows. The de-duplicating upsert eats them, and
  the eaten count per table is surfaced as a validity metric on the ingest
  run, per [disclose-never-repair](../../../_laws.md#disclose-never-repair):
  the store stays clean, the source keeps the blame, and a *change* in the
  duplicate count is the earliest signal the publisher's export changed
  shape.
- **A collision count of zero is an assertion worth making.** Compute
  (rows in − distinct keys) for every batch even where you expect zero;
  the day it goes nonzero is the day the key design was wrong.

## Report coverage, not just success

An ingest run's summary states, per table: rows read, rows kept, rows
excluded by scope, duplicates eaten, and which terms the run covered. Per
[every-cap-ships-its-population](../../../_laws.md#every-cap-ships-its-population),
any downstream consumer of a partially loaded store must be able to learn
that it is partial — "terms 8–10 loaded, 1–7 not" is the population line
for every cross-term query, and a career total computed over a
partially loaded store is a floor, not a total, and must render as one.

## When not to load in full

Truly per-term derived tables (a term's committee assignment history has no
cross-term consumers) may load lazily per analysis need — but keep the
loaded-terms manifest authoritative so laziness never masquerades as
completeness. And never lazily load the registries themselves; the whole
point is that identity and body references must resolve regardless of which
facts happen to be present.
