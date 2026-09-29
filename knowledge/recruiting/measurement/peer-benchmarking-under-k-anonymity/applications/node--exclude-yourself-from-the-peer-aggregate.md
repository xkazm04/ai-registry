---
layer: application
type: application
subject: peer-benchmarking-under-k-anonymity
technique: exclude-yourself-from-the-peer-aggregate
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Self-exclusion in the org benchmark read (Next.js server module + SQLite)

`app/_lib/db/org-benchmarks.ts` is this codebase's single deliberate
cross-workspace read, and its header comment says so in as many words
(module header): it is "the ONE module that reads `pipeline_entries` ACROSS the
workspace boundary on purpose", it "returns ONLY aggregates … never a raw row, a
candidate, or a team name", and it is explicitly excluded from
`pipeline-tenancy.test.ts`, which otherwise forbids unscoped `pipeline_entries`
reads. That is the technique's "isolate the crossing" step realized: one file,
one exemption, one guard.

## The attack, as this repo found it

`teamBenchmark()` carries the incident in its docblock, tagged
`bug-ui-scan-2026-07-09 (analytics-calibration-dashboards #3)`: with the caller
included in the org aggregate, a two-team org "let the caller subtract its OWN
known stats from the 'org' aggregate and back out the lone peer's figures". The
same finding is pinned by two tests in `app/_lib/db/org-benchmarks.test.ts` —
one that states the vulnerability explicitly (the raw self-included
aggregate clears the floor and, paired with the caller's own stats, exposes the
single peer) and one asserting the fixed behaviour (the test titled with the same bug id).

## How the exclusion is implemented

`orgHiringBenchmark(orgId, opts)` takes `excludeWorkspaceId` and pushes a
`AND pe.workspace_id != ?` predicate into the org-join, so the
exclusion happens **in the query**, not in the caller and not in the UI. The
floor is then evaluated on what remains: `contributingTeams` is derived from the
returned rows and compared against `BENCHMARK_MIN_TEAMS`
— i.e. *after* the exclusion, which is exactly the ordering the technique
requires. The route docblock states the consequence: the floor "covers only
OTHER teams" (`app/api/benchmarks/route.ts` header).

The API surface never gives a caller the un-excluded variant.
`app/api/benchmarks/route.ts` calls `teamBenchmark(workspaceId)` and nothing
else, and `teamBenchmark` hard-wires `{ excludeWorkspaceId: workspaceId }`
. The self-inclusive form remains reachable in-process for an operator
report, but no participant-facing path can reach it — the "make exclusion a
property of the read, not of the caller" rule, honoured through the one caller
that matters.

The reader's own figure is computed separately by `teamHiringStats()`
(workspace-scoped) and returned alongside as `{ team, org }`
(`TeamBenchmarkResponse`), so the comparison is two labelled numbers
rather than one number with an implied population.

## The withheld payload leaked a volume, then was closed

The below-floor return once carried `totalEntries` unwithheld. After self-exclusion
in a two-team org the aggregate has one contributor, so `{ available: false,
contributingTeams: 1, totalEntries: 137 }` told the caller exactly how many
candidates the lone peer holds - and `GET /api/benchmarks` returns the payload
verbatim, so hiding it in the panel was not enough. The current code reports the
size only when `contributingTeams >= BENCHMARK_MIN_TEAMS`, otherwise `0`; the
test "a below-floor aggregate that >=2 teams DO stand behind still reports its
size" pins the released half. This is the case the withhold technique now names:
a pool size is a contributor's figure once one contributor stands behind it.

## Deviations from the standard

- `BENCHMARK_MIN_TEAMS = 2` is the floor *after* self-exclusion, so a
  participant sees an aggregate over at least two unknown peers. That defeats
  exact recovery but leaves no headroom: at exactly two peers, one contributor
  joining or leaving moves the aggregate by a recoverable amount, which is the
  regime the technique says to treat as withheld. The standard's "keep working
  room above the anonymity floor" is not implemented here.
- There is no **dominance check**. Two contributing teams satisfy the count even
  if one supplies 95% of the rows, in which case the aggregate is effectively
  that team's figures. The standard requires a maximum single-contributor share
  alongside the count; the repo has only the count.
- The below-floor return zeroes `interviewRatePct` and `hireRatePct`
  rather than typing them as absent. `available: false` and
  `medianTimeToHireDays: null` carry the state correctly, and the panel branches
  on `available` (`AnalyticsOrgBenchmarkPanel.tsx`, the `!org.available` branch), so nothing renders the
  zeros today — but a second consumer that reads the rates without checking the
  flag would read "0% hire rate" as a measurement. The standard's rule is to
  type the withheld state rather than to coerce it and rely on a sibling field.
