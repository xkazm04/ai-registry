---
layer: application
type: application
subject: peer-benchmarking-under-k-anonymity
technique: exclude-yourself-from-the-peer-aggregate
stack: node
status: forged
verified_on: 2026-08-20
---

# Self-exclusion in the org benchmark read (Next.js server module + SQLite)

`app/_lib/db/org-benchmarks.ts` is this codebase's single deliberate
cross-workspace read, and its header comment says so in as many words
(lines 6–13): it is "the ONE module that reads `pipeline_entries` ACROSS the
workspace boundary on purpose", it "returns ONLY aggregates … never a raw row, a
candidate, or a team name", and it is explicitly excluded from
`pipeline-tenancy.test.ts`, which otherwise forbids unscoped `pipeline_entries`
reads. That is the technique's "isolate the crossing" step realized: one file,
one exemption, one guard.

## The attack, as this repo found it

`teamBenchmark()` (line 144) carries the incident in its docblock, tagged
`bug-ui-scan-2026-07-09 (analytics-calibration-dashboards #3)`: with the caller
included in the org aggregate, a two-team org "let the caller subtract its OWN
known stats from the 'org' aggregate and back out the lone peer's figures". The
same finding is pinned by two tests in `app/_lib/db/org-benchmarks.test.ts` —
one that states the vulnerability explicitly (line 52: the raw self-included
aggregate clears the floor and, paired with the caller's own stats, exposes the
single peer) and one asserting the fixed behaviour (line 70).

## How the exclusion is implemented

`orgHiringBenchmark(orgId, opts)` takes `excludeWorkspaceId` and pushes a
`AND pe.workspace_id != ?` predicate into the org-join (lines 110–113), so the
exclusion happens **in the query**, not in the caller and not in the UI. The
floor is then evaluated on what remains: `contributingTeams` is derived from the
returned rows (line 121) and compared against `BENCHMARK_MIN_TEAMS` at line 123
— i.e. *after* the exclusion, which is exactly the ordering the technique
requires. The route docblock states the consequence: the floor "covers only
OTHER teams" (`app/api/benchmarks/route.ts:10-12`).

The API surface never gives a caller the un-excluded variant.
`app/api/benchmarks/route.ts:31` calls `teamBenchmark(workspaceId)` and nothing
else, and `teamBenchmark` hard-wires `{ excludeWorkspaceId: workspaceId }`
(line 148). The self-inclusive form remains reachable in-process for an operator
report, but no participant-facing path can reach it — the "make exclusion a
property of the read, not of the caller" rule, honoured through the one caller
that matters.

The reader's own figure is computed separately by `teamHiringStats()`
(line 95, workspace-scoped) and returned alongside as `{ team, org }`
(`TeamBenchmarkResponse`, line 133), so the comparison is two labelled numbers
rather than one number with an implied population.

## Deviations from the standard

- `BENCHMARK_MIN_TEAMS = 2` (line 24) is the floor *after* self-exclusion, so a
  participant sees an aggregate over at least two unknown peers. That defeats
  exact recovery but leaves no headroom: at exactly two peers, one contributor
  joining or leaving moves the aggregate by a recoverable amount, which is the
  regime the technique says to treat as withheld. The standard's "keep working
  room above the anonymity floor" is not implemented here.
- There is no **dominance check**. Two contributing teams satisfy the count even
  if one supplies 95% of the rows, in which case the aggregate is effectively
  that team's figures. The standard requires a maximum single-contributor share
  alongside the count; the repo has only the count.
- The below-floor return (line 128) zeroes `interviewRatePct` and `hireRatePct`
  rather than typing them as absent. `available: false` and
  `medianTimeToHireDays: null` carry the state correctly, and the panel branches
  on `available` (`AnalyticsOrgBenchmarkPanel.tsx:106`), so nothing renders the
  zeros today — but a second consumer that reads the rates without checking the
  flag would read "0% hire rate" as a measurement. The standard's rule is to
  type the withheld state rather than to coerce it and rely on a sibling field.
