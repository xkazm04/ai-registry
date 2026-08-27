---
subject: data-retention
domain: software-engineering
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# data-retention

First touch: [[2026-08-27-picomq-durable-streams]] - intake against an
open-source durable-stream engine. Class: AMENDMENT.

## What changed

`time-budgeted-batch-purge` carried its deletion-ordering rule
unconditionally: dependent rows before the rows they reference, or lean on
declared cascades. That is correct **inside one store under one
transaction**, and it **inverts** the moment the purged thing spans two
stores that no transaction can cover together - bytes in an object store and
the row indexing them, a file and its catalogue entry.

Across that boundary the purge is two steps with a crash window between them,
and the order decides what the window leaks. **Payload first, reference
second.** A crash then leaves a reference to bytes already gone, which the
next pass finds, re-deletes harmlessly and removes - self-healing, one wasted
call. The reverse order leaves bytes nothing references: no index names them,
no pass visits them, and recovering them needs a full enumeration of the
store diffed against the catalogue, which is the operation the catalogue
existed to make unnecessary. One direction leaks a retryable pointer, the
other leaks storage nobody can name, and only the first leaves a reaper
(`creation-names-reaper`, now cited).

Two obligations follow and are stated in the amendment: the reference becomes
evidence the payload *may* exist rather than proof that it does, so readers
treat a missing payload as ordinary; and because the window is entered on
every crash rather than exceptionally, the payload delete must be idempotent.

## Note on the boundary

This is a **rule inversion across a discriminator**, not a contradiction -
the discriminator is whether one transaction covers both deletes. Written in
prose on the side being amended, per the method, rather than linked.

## Open leads

- None banked from this run.
