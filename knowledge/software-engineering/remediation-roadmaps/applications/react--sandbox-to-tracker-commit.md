---
layer: application
type: application
subject: remediation-roadmaps
technique: sandbox-to-tracker-commit
stack: react
status: forged
verified_on: 2026-08-20
---

# Roadmap sandbox and commit bar (Ascent)

Ascent's report page carries an interactive Roadmap Sandbox: the reader
clicks "Try it" on recommendations, watches the projected score move, and
then commits the plan. The two phases are cleanly separated across
`src/lib/scoring/engine.ts:460-496` (the pure projection) and
`src/components/report/RoadmapSandboxCommit.tsx` (the commit boundary).

## Phase one: a pure client-side projection

`projectSandbox(report, overrides)` takes hypothetical per-dimension score
overrides and re-derives *everything the hero shows* — overall score, level
transition, both axis roll-ups, and the posture quadrant. Its doc comment
states the two properties the technique demands. It is pure and
dependency-light, *"so the client can re-run it live on every slider tick
with no server round-trip"* — the sandbox writes nothing anywhere. And it
recomputes rather than sums: overrides are clamped and fed through
`overallScoreFor` / `axisScore` / `postureFor`, *"the exact functions
assembleReport used"*.

## The empty-selection identity, and the bug that proves it

The comment states the invariant outright: *"With an empty override set this
returns the report's own numbers byte-for-byte (overall, adoption, rigor,
posture)."* The bug fix recorded at `engine.ts:472-479`
(`maturity-model-scoring-engine #1`) is the upward lesson generalized in the
technique. The axis paths did not pass the present-id predicate that
`overallScoreFor` uses, so on a partial report — a dropped or failed detector
leaving fewer than nine dimensions — the absent dimension *"charged 0 at full
weight on these axis paths only, deflating adoption/rigor and potentially
flipping the posture quadrant, so the Sandbox baseline silently disagreed
with the report header."* The headline number stayed correct throughout,
because it routed through the shared function; only the secondary rollup
drifted. Two lessons, both now in the technique: every projection path shares
the scorer's missing-input policy, and the identity test must run over an
incomplete fixture, since *"with every dimension present the predicate is
always true"* and a complete-input test passes either way.

## Phase two: one explicit commit

`RoadmapSandboxCommit.tsx:12-14` names the problem the boundary solves: the
sandbox *"models the cheapest path to the next level with real engine math,
but that plan was fully ephemeral — a team that just modeled its path lost it
on unmount."* `SandboxCommitBar` persists the applied items as `in_progress`
recommendations through the existing per-row `PATCH /api/recommendations/:id`
path, stamping an event-trail note that records the projection it was
committed under: `` `Committed from sandbox simulation, projected +${...} pts overall.` ``
— projected and realized kept as different facts, with the projection
recorded as provenance rather than as an outcome.

Three details match the technique's rules:

- **Idempotence by status filter.** `committableRecs`
  (`RoadmapSandboxCommit.tsx:15-41`) admits only recommendations whose status
  is `open`, with the comment *"re-committing an already
  in_progress/done/dismissed rec would either no-op or regress it"*, and
  dedupes by rec id because *"two roadmap items can name the same
  dimension."*
- **Partial failure is per item.** The loop counts `saved` and a network blip
  on one rec *"shouldn't abort the rest — the summary reports how many
  landed."* Only a `403` (read-only public report) or `503` (no database)
  short-circuits, because every remaining item would fail identically; the
  bar then explains itself rather than retrying.
- **The disabled state explains itself.** `disabledTitle`
  (`RoadmapSandboxCommit.tsx:67-73`) distinguishes "no database", "nothing
  tried yet", and "everything you tried is already tracked" — three different
  reasons a commit is unavailable, which is what the technique's "show what
  commit will do before it does it" rule looks like in its negative case.

## Targeted rollback

`src/components/report/recommendationRowState.ts` holds the per-row
optimistic transforms as pure functions, extracted from the client component
*"so they can be unit-tested without a DOM"*. `rollbackRowStatus` carries the
invariant verbatim: reverting to a whole-list snapshot *"would clobber other
rows' concurrent optimistic or already-confirmed changes when several updates
overlap; this touches only `id`."* A vanished row (undefined prior status) is
a no-op for every row.

## Deviation: identity by dimension plus title

Committable items are joined to persisted recommendations by a
`` `${dimension}\0${title}` `` key — the same key the persist layer
writes. The technique's standard is identity minted from a stable catalog id
plus the assessment run. Title equality is a display-string join: a
re-worded catalog entry, or a model-generated title that differs by a
character between the persist pass and the render, silently produces zero
matches and a commit bar that reports nothing to commit — a failure that
looks like "already tracked" rather than like a broken join. A stable
per-recommendation id carried on the roadmap item would remove the coupling
between wording and identity entirely.
