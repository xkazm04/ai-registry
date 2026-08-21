---
layer: application
type: application
subject: peer-benchmarking-under-k-anonymity
technique: normalise-each-contributor-to-its-own-process
stack: sql
status: forged
verified_on: 2026-08-20
---

# Per-team axis resolution over a cross-workspace join (SQLite)

The cross-workspace query in `app/_lib/db/org-benchmarks.ts:114-120` selects
`pe.stage, pe.created_at, pe.stage_changed_at, pe.workspace_id` joined
`pipeline_entries pe JOIN workspaces w ON w.id = pe.workspace_id WHERE
w.org_id = ?`. The `workspace_id` column is carried through the join for exactly
one reason: it is the key the normalisation needs.

## The incident that produced the rule

`statsFrom()` lines 44–49 record it: "teams may run DIFFERENT boards — one team's
'Onsite' is another's 'Interview', and neither name means anything to the other.
Each row is therefore judged against ITS OWN team's axis … Reading one shared
axis (as this did) silently counted a renamed column as 'never reached
interview', which is exactly the kind of quiet wrong number a benchmark must not
produce."

That is the technique's core claim with a scar on it. The pre-fix behaviour was
not an error — it was correct arithmetic over incoherent groups, producing a
plausible interview-conversion rate that penalised every team whose board used
non-default stage names.

## How the normalisation is done

- A per-workspace axis cache (`axisFor` / `teamAxis`, lines 50–58) resolves
  `getPipelineAxis(workspaceId).stages` **once per contributing team** and reuses
  it across that team's rows — the technique's "resolved once per contributor,
  not per row".
- Each row is then projected onto structure rather than label:
  `stageIndex(r.stage, axis)` compared against `screeningGateIndex(axis)` for the
  "reached interview" bucket (line 65), and `stageHasRole(r.stage, "terminal",
  axis)` for the hired bucket (line 66). Neither predicate compares a stage
  string across teams; both ask where the stage sits in *that team's* ordering,
  and what role it plays there.
- What crosses the boundary into the pooled counters is therefore an ordinal
  position and a role, never a name — and the returned `HiringStats` (line 27)
  carries no stage vocabulary at all.

## The denomination half, elsewhere in the same codebase

The unit rule shows up as a global constraint rather than a benchmark-local one.
`app/_lib/format.ts:22-32` declares `APP_CURRENCY` as "the single currency every
stored/rendered monetary figure in this app is denominated in", and states the
consequence: a figure carrying a different currency code "is NOT directly
comparable" — so `isSameCurrency` / `salaryBandPosition` in
`app/_lib/salary-band.ts` "gate the over/under-band verdict on a currency match
instead of silently comparing across currencies".
`app/_lib/db/salary-benchmark.ts:17` makes the same commitment in the benchmark's
own type, pinning `currency: "CZK"` and deferring multi-currency bands to a later
tier rather than mixing.

The unpriceable-row rule appears in the cost aggregate:
`app/_lib/db/analytics.ts:875-882` sums cost over priced rows only and returns
`unpricedCalls` counting "the NULL-cost rows … that would otherwise sum to a
misleading $0". Same comment names the other honest caveat — the ledger has no
`workspace_id`, so the figure is an account-wide total and the callers say so.

## Deviations

- Normalisation is depth-relative to each team's axis but not **length**-
  normalised: `stageIndex` against `screeningGateIndex` handles differing
  vocabularies, and the gate role handles differing semantics, but a team with a
  nine-stage board and one with a five-stage board are still compared on the same
  binary "past the screening gate" cut. That is defensible for this metric; the
  standard's fraction-of-own-funnel projection would be needed before any
  stage-by-stage comparison.
- A workspace with no resolvable axis falls back to whatever `getPipelineAxis`
  returns for it rather than being excluded with its exclusion reflected in the
  counts. The standard excludes and reports; the repo defaults.
- `costPerApplicantCzk` in the channel breakdown (`analytics.ts:868`) is a hard
  `null` — the per-channel cost comparison the standard's currency rule would
  govern is not implemented, so there is no cross-organisation cost benchmark to
  reconcile against. The dispatched anchor `app/_lib/analytics-channel-roi.ts`
  does not exist in the tree; the surviving cost craft is the account-wide
  window above.
