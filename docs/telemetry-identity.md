# Telemetry identity and freshness

The source lanes retain contributor reports exactly as submitted. Do not rewrite a
reported date to make evidence look current, or infer a rename from similar names.

`identity-aliases.json` is the explicit migration map. Each entry names a retired
identity, a current `to` identity, and an evidence-backed `reason`. Skill identities
are slugs; subjects are `bundle/subject`; applications are
`bundle/subject/stack--technique`. Targets must exist, current identities cannot be
redirected, and chains are rejected. An empty map means no migration is established.

The catalog retains unresolved usage counts in `usageEvidence.unresolved` and records
each source report's window and date. `reportedInvokes` covers reported windows;
`invokes30d` includes only reports whose `windowDays` is 30. Neither means a live rolling
30-day count: reports can end on different dates. Existing fields remain available to
consumers; the evidence envelope supplies their missing interpretation.

```sh
node scripts/telemetry-report.mjs --as-of 2026-09-09
node scripts/librarian-scan.mjs --json
```

The telemetry report retains unresolved signals with their counts, and separates
unknown timestamps, future timestamps, reports older than 30 days, and reports within
that reporting window. A recent report says nothing by itself about content correctness.
Use an explicit `--as-of` for reproducible comparisons. The generated catalog stores
source dates rather than a wall-clock age, so time alone cannot make CI stale.

Demand priority uses the maximum deviation/gone state across contributors, while
reporting their sum as an upper bound. Consult events sum. Alias and current-name
state in one contributor use the maximum, preventing a migration from duplicating
the same observation. Identical bundle blocks are a **possible** duplicate diagnostic,
not proof of shared provenance. They never raise state priority by being repeated.

On 2026-09-09, the report retained seven unresolved usage names and 24 unresolved
signal observations; it identified one possible duplicate bundle block. The state
floor remained 370 and the ceiling 550 after the aggregation refactor. These unresolved
identities need evidence from their producers before mapping; similarity is insufficient.

Impact records belong with their review or harvest run. Record the task, artifact
identity and version/digest, baseline revision, frozen fixture, required outcome,
observed result, limitations, and follow-up on negative or unavailable checks. Full
transcripts and consumer-specific evidence stay local. See the
[architecture execution evidence](reviews/2026-09-09-execution.md) and
[workflow evaluation protocol](evals/README.md). An unavailable comparison remains
review work; it is never converted into an impact-positive result.
