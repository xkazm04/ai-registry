---
domain: llm-observability
subject: agent-session-archive
last_touched: 2026-10-15
touched_by: intake
dry_streak: 0
---

# agent-session-archive

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-15 - forged from intake coding_agent_session_search (run dle-004-1015, series DLE-004)

New subject in `telemetry-and-data`, by the mechanical XL trigger: five ingest decisions of
one source shared a home no subject owned, and the director re-checked the NONE claims
against `tracing/trace-capture`, `versioning-snapshots/retention-and-pruning` and the
sibling `multi-provider-event-normalization` before writing the spec
([[2026-10-15-agent-session-archive]], source note [[2026-10-15-coding-agent-session-search]]).
The defining force is the bundle's own: a third party writes the records, owns their
format and deletes them on its clock. Picking rule stated in the golden path: ask who
deletes the source.

Six techniques: `capture-before-parse`, `prefix-proof-retirement`,
`root-relative-session-identity`, `declared-message-coordinates`,
`queryable-surface-redaction`, `ingest-disposition-accounting`. The forge worker merged a
seventh (`additive-cross-machine-pull`) into capture and identity.

Applied the same day: ingest-disposition-accounting and prefix-proof-retirement `better`
against this registry's own tooling; queryable-surface-redaction `not-better` at a personas
seam chosen to falsify it, which gave the technique its scope condition (extraction scope
and a stored copy decide, not consent); capture-before-parse and declared-message-coordinates
`unmeasurable` with instruments named; root-relative-session-identity unapplied (one machine).

Boundary to remember: redaction stayed here rather than in the outbound
`telemetry-pii-redaction` neighbour, because the failure direction inverts once the store
becomes the record. A later run meeting an archive-redaction finding should land it here.

Open: the mirror (`scripts/transcript-mirror.mjs`) is built and measured but not wired;
capture-before-parse's target moves only once it runs.
