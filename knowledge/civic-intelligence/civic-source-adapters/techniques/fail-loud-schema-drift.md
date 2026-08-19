---
layer: technique
type: technique
subject: civic-source-adapters
technique: fail-loud-schema-drift
status: forged
laws: [disclose-never-repair, incident-anchored-doctrine, every-cap-ships-its-population]
shared_with: []
use_when: [parsing scraped tables or positional columns, ingesting versionless full-snapshot dumps, backfilling history into a change feed]
---

# Fail-loud schema drift

Public-sector sources change shape without versioning, changelogs, or announcements:
a column added to a search-results table, a field renamed in an export, a header
relabeled by a portal redesign. A positional parser pointed at a drifted shape does
not crash — it reads the wrong cell, and the wrong cell usually still contains a
number or a date. Those values flow to published pages wearing full authority. The
technique inverts the failure: **assert the expected shape on every fetch and refuse
to parse on mismatch.** A crashed ingest run is an hour of ops; a silent mis-parse is
a fabricated published figure, which is the one outcome the whole domain forbids.

## Shape assertions on every fetch

- **Pin the expected shape as data**: the ordered header labels, the column count,
  the field names — one constant next to the parser, dated with when it was
  verified against the live source.
- **Check before parsing, throw on mismatch**, with an error that prints expected
  versus actual so the drift is diagnosable from the log alone. Do not log-and-
  continue: a warning under a successful run is a mismatch nobody reads until the
  wrong numbers are found some other way.
- **Assert what the source actually renders, not what would be tidy.** If the live
  table carries an unlabelled trailing action column, assert the labelled prefix by
  label and the total width by count — requiring a label the site never renders
  makes the guard fail on day one and get deleted, which is worse than no guard.
  Calibrate the assertion against the real source, then keep it strict.
- **Defense in depth per row**: independently reject any data row whose cell count
  disagrees with the asserted width. Header checks catch table-level drift; row
  checks catch malformed individual rows inside a healthy table.
- **Distinguish "no table" from "wrong table".** An empty result set legitimately
  renders no header; that is a valid empty answer, not drift. Only a *present but
  different* shape is a refusal.

When drift fires, the fix is a deliberate re-verification: open the live source,
update the pinned shape, re-check the column semantics (a new column may have
shifted meanings, not just positions), and record the date. Per
[incident-anchored doctrine](../../_laws.md#incident-anchored-doctrine), keep the
incident note with the assertion — the comment explaining which real mis-parse or
false alarm shaped the guard is what stops a future maintainer from "simplifying"
it back into the failure.

## Versionless snapshots: diff explicitly, respect the epoch

Many civic dumps are full replace-in-place snapshots with no diff feed. "What
changed since last run" is then a derived fact the adapter must construct honestly:

- **Diff over natural keys.** Give every row a deterministic id built from
  publisher, table, and source identifier, and compute added/removed/changed as an
  exact set difference, with a canonical serialized-content compare for "changed".
- **Deterministic event identity.** A change event's id derives from its content,
  so re-running the diff over the same inputs upserts idempotently instead of
  duplicating the stream. Crash-and-retry must not manufacture history.
- **Record time is not world time.** When you observed a change and when it took
  effect in the world are different columns. Conflating them corrupts every
  timeline the graph will ever render.
- **The first backfill is an epoch, not a flood.** When history is first loaded,
  every pre-existing row shares one recording instant. That instant is the epoch:
  versions recorded *at* it are the silent event zero, and only versions strictly
  after it become change events. Skip this and the feed's first day announces
  thousands of fake "new" facts — and a consumer that learned to ignore the flood
  will ignore the real events after it.
- **Non-append-only feeds dedup by their stablest key.** Some sources delete
  postings once a relevance window passes; polling them is not appending. Choose
  the most stable identifier the feed offers (often a URL, verified stable, rather
  than a nominal id field pointing at a dead host) and dedup on it forward.

## Read caps are shape too

A silent truncation is drift you did yourself. Ad-hoc per-caller read limits become
correctness bugs the moment the corpus outgrows the smallest of them — and because
reads are ordered, the loss is systematic: everything sorting late vanishes
entirely, while the page still claims totality. The rule: one shared cap constant
imported by every whole-relation read, set far above the current corpus rather than
snugly, with one guard that warns when a read comes back at the cap. Then growth
trips a single alarm in one place instead of degrading several surfaces
differently, and [every cap ships its population](../../_laws.md#every-cap-ships-its-population).

## When not to use this

Fail-loud is for *shape*, not for *content volume*. A source returning fewer rows
than yesterday is a monitoring signal, not a parse refusal — sources legitimately
shrink. And for schemaless exploratory pulls (a one-off investigation, not a
standing pipeline), a pinned-shape guard is premature; the guard earns its place
when the parse feeds anything durable.
