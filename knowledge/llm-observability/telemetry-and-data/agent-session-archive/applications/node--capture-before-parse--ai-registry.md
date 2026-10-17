---
layer: application
type: application
subject: agent-session-archive
technique: capture-before-parse
stack: node
verified_on: 2026-10-15
applied: experiment
ab_verdict: unmeasurable
---

# A registry that kept only what it parsed

This registry reads the agent harness's transcripts for three purposes: structure-only
process instances (`scripts/process-sessions.mjs`), a commit-inventory replay, and a
verdict re-verifier kept on a branch. All three parse in place. The first keeps a cache of
what it extracted, and that cache outlives the harness's 30-day deletion. Nothing keeps
the bytes. That is the failure the technique names, measured on 2026-10-15: of 3,705
sessions the cache remembers, **1,773 (48%) have no transcript left**. Their step counts
survive, but every question the extraction did not anticipate is unanswerable, including
the one series round R1 needed when a seeded replay case fell outside retention.

## What this run changed

`scripts/transcript-mirror.mjs` (merged `e3ad2550`) captures by inventory, not by parse.
It copies every `*.jsonl` under the store, subagent folders included, without reading a
single record, and keeps each capture byte-exact and restorable. On the 7-day test window
it captured 4,992 then 5,007 files, and an independent file walker agreed on both counts.
A transcript the registry's parser cannot read is captured exactly like one it can.
Storage was measured separately (`prefix-proof-retirement`, applied to this registry,
`better`).

## Verdict: unmeasurable, with the instrument named

The technique's target is sessions that can be re-derived after the harness has deleted
them. That number cannot move until the mirror runs on a schedule, and wiring it (a
session-end hook plus a daily backstop) changes the operator's harness configuration, so
this run did not do it. The instrument that will decide it: 30 days after wiring, count
the sessions the process cache marks as rolled off and restore each one from the mirror.
The target is all of them; today's figure is 0 of 1,773. The floor is the mirror's
`verify`, which must stay at 100%.

## The cadence the technique asks for

The harness's documented minimum retention is one day and no value disables cleanup, so a
capture that only runs at the end of a session misses sessions that crash or never end. A
daily run against `--since 2d` covers that window twice. A recapture of an unchanged store
took 1.8 seconds, because files whose size and modification time have not changed are
skipped without reading.
