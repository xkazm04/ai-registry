---
layer: application
type: application
subject: pipeline-stage-modelling
technique: off-axis-candidate-recovery
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# The off-board section and the stale deep link

Two surfaces implement the technique's two shapes: candidates standing
nowhere the board draws, and a link naming a column this workspace does not
have. **Re-read 2026-09-29: the surface the first reading described is gone.**
Commit `b7fde0c32` deleted the old board view, and with it
`PipelineBoardOffAxisStrip.tsx` and `PipelineFilterBar.tsx`, the two files this
page cited. The occupant half was rebuilt on the kit view; the deep-link half
was not, and that is the finding below.

## The occupant: a caution section, not a fold into column zero

`app/features/hiring/pipeline/kit/PipelineKitOffBoard.tsx` (52 lines, mounted
once in `orbit/PipelineOrbitView.tsx`) is the strip's successor and keeps
its rule: candidates on a column the workspace removed are their own named
layer, never folded into the head of the funnel. The reason the standard gives
for the old fold, "visible and slightly wrong beats invisible" while the axis
was a constant and the worst option once a workspace can remove a column,
survives in `pipelineBoardLayout.ts:25` and `:51`, where `offAxisEntries` still
collects the entries that sit in no cell.

What it does, against the four things the standard asks for:

- **Names the stage** through `stageName` (`kit/pipelineKitMoves.ts:16-19`),
  which looks in the live axis and then the retired list, so a deleted "Second
  interview" reads as the label the recruiter knew; a stage no axis ever
  declared falls back to the localized enum catalog.
- **Groups by the stranded-on column** through `strandedByStage` (`:29-34`):
  one row per removed column, with the first three candidate labels and a
  count. Its test is `not on the live axis`, so retired and never-declared ids
  both land here.
- **Offers one resolving control** per group, "Move all to…", whose targets are
  `moveOptions("", axis, …)`, the same `moveTargetStages` list the per-entry
  menu uses, so it cannot offer a destination a move would refuse.
- **Renders nothing while nobody is stranded** (`:23`).

Two things it does differently from the strip it replaced. The control is
always offered: the old strip's read-only case ("names the problem without
offering a control that would do nothing") has no counterpart here. And "Move
all to…" is a loop of independent `s.moveEntry(e, to)` calls (`:44`), not one
request; a failure partway leaves the group half-moved, which the section then
shows as a smaller group rather than as an error. The removal door
(`stage-migration/route.ts`, see the sibling application) is atomic per
request; this backstop is not.

Resolution underneath is unchanged in shape. `pipeline-axis.ts:60`
(`knownStageIds`) treats live **and** retired ids as legitimate stored values,
`findStage` (`:66`) looks up across both so a historical event still renders a
label, and `offAxisStageIds` (`:73`) is the genuinely-unresolvable set, "what
the board must surface rather than silently fold into column 0".
`resolveStageAxis` (`:49`) falls back to the shipped axis for an empty stored
config, because "a blank board loses candidates from view entirely".

## The reference: the notice lost its only caller

the pipeline README's stale-`?stage=` section still documents the deep-link half:
validating an incoming `?stage=` against the hardcoded five "dropped every
custom or renamed stage on the floor and rendered the board **unfiltered**,
which is indistinguishable from *nothing was filtered out*". The parts that
survive in code:

- `readStageParam` carries the parameter **verbatim**, since it is only ever an
  equality key against `entry.stage`; `pipelineStageFilter.test.ts` pins
  renamed and custom stages.
- `resolveStageFilter(stage, axis, retired)` (`usePipelineFilters.ts:69-79`)
  returns a label and an `onBoard` flag, and a retired stage resolves to its
  authored label with `onBoard: false`.
- `usePipelineTabState.ts:155` still applies the stage filter to the entries,
  so the filter holds.

What did not survive: the notice. The doc says the explicit "this stage is no
longer on your board" line, with its one-click way out, rendered from
`PipelineFilterBar`, and the no-flash rule (wait for the board fetch) lived
there too. `resolveStageFilter` has no caller outside tests in the current
tree. Two things an earlier reading of this page got wrong, corrected at kp
`7340988e2`: the message keys the notice used (`pipeline.tab.stageOffBoard`,
`stageOffBoardClear`) are orphaned in `messages/*.json`, and the surface is not
silent. With `?stage=` set the orbit view renders a "Matches" section with a
Clear-filters button, listing the active candidates on that id or "Nobody on the
board matches this link." What a stale `?stage=` link does not get is a sentence
saying the stage is off this board, and nothing connects the Matches section to
the off-board one. That is the technique's silence in a weaker form, reintroduced
by a deletion whose commit message records that the source-reading tests pinning
the deleted files "lose those halves". The pure half stayed green; the naming
went. The README (`:838-860`) still documents the deleted filter bar rendering the
notice, and `usePipelineFilters.ts:57` still mentions the deleted strip.
`offAxisStageIds` also has no caller outside tests.

Labels follow one rule across the surviving pieces, the workspace's own label
wins where it authored one and otherwise the catalog translates the id, so the
section and the enum catalog never disagree about what a column was called.

## The rule that keeps the section empty, and where it does not

the README's "Off the board" section (`:175-203`): in
normal operation the section should stay empty, because Settings → Hiring refuses to
remove an occupied column without a destination and applies the moves in the
same request as the removal. The section is the backstop for what that gate
cannot cover, "a legacy row, an applicant-tracking sync replaying an older
mapping, or a config edited outside the UI", which is the standard's position
exactly: recovery is the safety net, not the process.

Where this stops short of the standard: the cross-team import path has no
role-based translation. A candidate arriving with another axis's stage is
handled by the same off-axis machinery as a legacy row, surfaced and moved by
hand, rather than mapped by role with the translation recorded. The recovery
is honest; the translation the standard asks for is absent, not lowered.
