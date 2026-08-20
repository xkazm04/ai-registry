---
layer: application
type: application
subject: people-analytics-ethics
technique: contribution-eligibility-floors
stack: node
status: forged
---

# Eligibility floors over a mixed-cadence fleet

The source app (`C:\Users\kazda\kiro\ascent`) aggregates contributor activity
from per-repository snapshots that are refreshed independently — each repo's
data is anchored to that repo's own last scan. That single fact produces the
recency failure this technique exists to prevent, and the fix is recorded at
`src/lib/db/org-contributors.ts:14-23`.

## The heterogeneous-recency guard

The comment states the failure directly:

> each repo's snapshot is anchored to that repo's OWN last scan, so on a
> mixed-cadence fleet a repo last scanned a year ago would otherwise inject its
> stale activity into orgAiShare / champions / busFactor with the same weight
> as yesterday's snapshot — an engineer who left could stay the org's "#1 AI
> champion" via one unscanned repo.

The implementation: `CONTRIBUTOR_HORIZON_MS = 26 * 7 * 86_400_000` (~6 months),
and repos whose snapshot recency "trails the fleet's newest by more than the
horizon are DROPPED from the human aggregates". Three details make it a usable
guard rather than a blunt filter:

- **The horizon is relative to the freshest source, not to wall-clock now.** A
  fleet that has not been scanned in a year is uniformly stale and stays
  internally consistent; only *divergence* between sources is the defect.
- **Unknown recency is kept, not dropped**: "Repos with no lastActiveAt data at
  all are kept — their recency is unknown, not provably stale." Dropping on
  missing data would silently delete populations for an invisible reason.
- **The exclusion is counted and published** as `staleRepos`
  (`src/lib/db/org-contributors.ts:53-56`), "so the UI can annotate 'N stale
  repos excluded' instead of silently blending mixed-age windows."

The comment also notes the guard mirrors an earlier fix in the org-signals
module — the same class of defect found twice, which is the usual sign that the
horizon belongs to the aggregation layer rather than to one query.

## Volume and habit floors before a ranking

`MIN_CHAMPION_COMMITS = 3` (`src/components/org/shared/champions.ts:21-26`)
gates entry to the champions ranking, with the rationale stated as the harm it
prevents: "without a floor, a drive-by contributor with a single ... commit
ranks as a '100% AI' champion above people doing sustained work." The same
predicate is applied in two producers —
`src/lib/db/org-contributors.ts:320-327` and `src/lib/db/org-teams.ts:252-262`
— with the team-side comment explicitly aligning the two: "a 1-commit drive-by
must not headline a card the Contributors tab withheld."

`CHAMPION_LIMIT = 6` (`champions.ts:28-32`) is the bounded-not-ranked property:
"small enough that inclusion stays meaningful and the grid never degenerates
into a ranked list of most of the team — which would defeat the not-a-scoreboard
framing."

`src/lib/org/adoption.ts:69` adds an eligibility floor on the other side of the
distribution — `ENABLEMENT_MIN_COMMITS = 3`, "Minimum commit volume before a
zero-AI contributor is a meaningful enablement target" — so that a person with
one commit is not listed as needing enablement. Note that this is a
deficit-adjacent cohort that does name people; it survives only because it sits
behind the population floor as well (`enablementTargets` returns `[]` when
`namingAllowed` is false, `adoption.ts:96`) and is framed as an invitation to
enable rather than a shortfall. The standard's preference — additive framings
only — would still push this list toward an artifact-level or opt-in phrasing.

## Ordering

Both producers evaluate eligibility *inside* the population that already passed
the naming floor, and the recency guard runs before either, at snapshot merge
time. That is the ordering the technique requires: recency, then volume, then
naming — so the floor is compared against the population that actually
survives.
