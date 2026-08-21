---
layer: application
type: application
subject: pipeline-stage-modelling
technique: off-axis-candidate-recovery
stack: react
status: forged
verified_on: 2026-08-20
---

# The off-axis strip and the stale deep link

Two surfaces implement the technique's two shapes: candidates standing
nowhere the board draws, and a link naming a column this workspace does not
have.

## The occupant: a named strip, not a fold into column zero

`app/features/hiring/pipeline/PipelineBoardOffAxisStrip.tsx:1-16` records the
reversal the standard describes. `bucketLaneEntries` used to fold an unknown
stage into **column 0**, and that was the right trade while the axis was a
compile-time constant: an unknown stage could only be a legacy row, and
"visible and slightly wrong beats invisible". The moment a workspace can
remove a column the same fold "turns into the worst possible behaviour — a
dozen candidates silently reappearing at the top of the funnel, looking
exactly like a mass reset, with nothing on screen to say what happened."

`pipelineBoardLayout.ts:24` and `:50` are the split: an off-axis entry lands
in **no** cell, and `offAxisEntries` collects them. `pipelineBoardLayout.test.ts:36`
pins it — "an off-axis entry occupies no column" — and `:49-57` pins that only
genuinely unresolvable stages qualify, so extending the axis with a new column
removes its entries from the strip rather than double-reporting them.

The strip then does the four things the standard asks for:

- **Names the stage**, recovering the label from the retired list where one
  exists (`:43-48`): the strip says "Second interview" — the column the
  recruiter deleted — "rather than a bare id". A stage no axis ever declared
  falls back to its id, which is the honest limit of what the record holds.
- **Groups by the stranded-on column** (`:57-60`): "one heading per removed
  column reads as *this is what deleting that column did*, which is the
  actual story."
- **Offers exactly one resolving control** per group — move them somewhere
  that exists — built from `moveTargetStages("", axis)` (`:50`), which is
  the same target list the drawer uses, so the strip cannot offer a
  destination the board would refuse.
- **Withholds the control where it would not work**: `onMove` is optional and
  documented as omitted on a read-only board, so the strip "names the problem
  without offering a control that would do nothing" (`:35-37`).

`boardVisibleOrder` (`pipelineBoardLayout.ts:63-74`) appends the strip's
entries after the grid so the drawer's prev/next can reach them — the comment
gives the reason directly: "a card you can see but cannot step to reads as
broken" (`pipelineBoardLayout.test.ts:114-124` pins the order, including that
an off-axis entry whose lane is not rendered is dropped rather than
orphaned).

Resolution is layered underneath: `app/_lib/pipeline-axis.ts:52-58`
(`knownStageIds`) treats live **and** retired ids as legitimate stored
values — "a retired stage is still a legitimate place for a candidate to be
standing until they are migrated" — `findStage` (`:61-64`) looks up across
both so a historical event still renders a label, and `offAxisStageIds`
(`:66-70`) is the genuinely-unresolvable set, "what the board must surface
rather than silently fold into column 0". `resolveStageAxis` (`:45-51`) falls
back to the shipped axis for an empty stored config, because "a blank board
loses candidates from view entirely".

## The reference: filter held, notice explicit, no flash

`docs/features/pipeline/README.md:295-318` documents the deep-link half.
Validating an incoming `?stage=` against the hardcoded five "dropped every
custom or renamed stage on the floor and rendered the board **unfiltered**,
which is indistinguishable from *nothing was filtered out*."

The shape now:

- `readStageParam` carries the parameter **verbatim** — it is only ever an
  equality key against `entry.stage` — pinned for renamed and custom stages
  at `pipelineStageFilter.test.ts:29-41`.
- `resolveStageFilter(stage, axis, retired)` answers whether the board can
  honour it, against the axis that arrives with the board payload, "the only
  list that can answer". It returns a label *and* an `onBoard` flag, and a
  retired stage resolves to its authored label with `onBoard: false`
  (`:70-71`) — enough to name the thing the link pointed at.
- `PipelineFilterBar.tsx:241-253` renders the explicit notice with a
  one-click way out, and **the filter stays applied**: candidates still
  standing on the dropped column then surface in the off-axis strip, "which
  is exactly what the stale link was pointing at".
- `:114-116` is the no-flash rule as code: `stageOffBoard` requires
  `stageResolved != null`, with the comment "Definite, not merely unknown:
  only once the axis has arrived can the board say a stage is not one of its
  columns." `PipelineTab.tsx:152` supplies the resolution only once
  `entries != null`.

Labels follow one rule across both surfaces — the workspace's own label wins
where it authored one, otherwise a catalog translates the id — so the two
never disagree about what a column was called.

## The rule that keeps the strip empty, and where it does not

`docs/features/pipeline/README.md:150-156`: in normal operation the strip
should stay empty, because the settings surface "refuses to remove an occupied
column without a destination, and applies the moves in the same request as
the removal". The strip is the backstop for what that gate cannot cover — "a
legacy row, an applicant-tracking sync replaying an older mapping, or a config
edited outside the UI" — which is the standard's position exactly: recovery is
the safety net, not the process.

Where this stops short of the standard: the cross-team import path has no
role-based translation. A candidate arriving with another axis's stage is
handled by the same off-axis machinery as a legacy row — surfaced and moved
by hand — rather than mapped by role with the translation recorded. The
recovery is honest; the translation the standard asks for is absent, not
lowered.
