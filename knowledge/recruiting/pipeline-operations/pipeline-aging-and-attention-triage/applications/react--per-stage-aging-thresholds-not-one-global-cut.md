---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: per-stage-aging-thresholds-not-one-global-cut
stack: react
status: forged
verified_on: 2026-09-29
---

# The per-role SLA table and its per-board overrides (React)

`app/_lib/aging-policy.ts:33-90` holds the technique's whole policy surface (it moved
there from `pipelineTypes.ts` on 2026-09-23 so the server-side store can read it
without the client module; `pipelineTypes.ts:111` re-exports it): one flat legacy
constant kept as a last resort, one table keyed by stage **role**, a derived
name-keyed table for callers that only know a canonical name, and one resolver.

```
export const STALE_DAYS = 10; // legacy flat default — fallback for unknown stages

export const ROLE_SLA_DEFAULTS: Record<StageRole, number> = {
  entry: 14, screening: 7, homework: 7, interview: 5,
  scoring: 5, offer: 3, terminal: 0, custom: STALE_DAYS,
};
```

The comment above it is the standard's worked contrast verbatim — "a candidate
sitting 10 days at an offer is a stall worth chasing; 10 days freshly arrived is
normal" — and the table has the monotonic shape the standard requires, 14 days at
intake down to 3 in Offer.

## Keyed by what a column means

`StageRole` (`app/_lib/pipeline-stages.ts:57`) is the closed vocabulary — `entry`,
`screening`, `homework`, `interview`, `scoring`, `offer`, `terminal`, `custom` —
and `STAGE_ROLE` (`:90`) maps the shipped five onto it. The table's own comment
states the standard's reason rather than a preference: the axis is
workspace-editable, and "a threshold keyed to the name 'Interview' stops firing
the moment a team renames the column to 'First round' and adds a 'Tech round'
beside it — the badge goes quiet with nothing on screen admitting it."

`STAGE_SLA_DEFAULTS` (`:145-147`) survives only as a *derived* projection —
`PIPELINE_STAGES.map((id) => [id, ROLE_SLA_DEFAULTS[STAGE_ROLE[id]]])` — so the
name-keyed and role-keyed answers cannot disagree. That is the say-it-twice
pattern used correctly: one table is computed from the other rather than
maintained beside it.

## The axis is a parameter, not an ambient default

```
export function slaForStage(
  stage: string,
  overrides?: Record<string, number> | null,
  axis: readonly StageDef[] = DEFAULT_STAGE_AXIS
): number
```

`aging-policy.ts:77-90`. The resolution order is an explicit override for this column
id (the board's optimistic value between a save and the next load) → the team's own
cadence on the axis, `slaDays` (terminal never carries one) → `roleOf(stage, axis)` → the shipped default for a canonical id that has been
retired from the axis but still has candidates standing on it → the flat cut.
Every caller passes the axis it already held: the board's own reads, the row
tooltip, and the server-side badge in `app/_lib/attention.ts`, which resolves the
workspace's axis once and then asks both stage questions through it, now as the single
call `agingTierAt(e.stage, e.stageChangedAt, now, axis)`, which applies the terminal
exclusion and `slaForStage` internally.

`attention.ts`'s `attentionStale` comment records the failure the parameter closes, in the standard's
own terms: "a composed column ('Tech round', role interview) ages at the
interview default, not on the flat legacy cut a name lookup fell through to."
The same block documents a second, sharper case for honouring the resolver's
non-positive contract rather than relying on coincidence: retire the id `Hired`
while renaming the terminal column, and every already-hired entry resolves to no
live role, escapes the terminal exclusion, and is counted as aging from day zero
forever with no board move that can clear it.

Four tests in `app/features/hiring/pipeline/pipelineStageFilter.test.ts:141-166`
pin the behaviour on a composed axis: role resolution for a workspace-authored
`tech_round` and `ai_score`, override precedence and a cleared override falling
back to the role default, byte-identity on the shipped axis (asserted against the
literal `{ Accepted: 14, Screened: 7, Interview: 5, Offer: 3, Hired: 0 }`), and
the retired-canonical-id fallback beside a never-existed id.

## Where the standard's homework row came from

`homework: 7` carries its own derivation in the source, and it is the standard's
who-owes-the-next-action exception stated from the other side: "a case takes real
evenings to do. Chasing at day 5 reads as pressure on unpaid work; a week is the
point at which silence is genuinely worth a nudge." It sits equal to `screening`
rather than below `interview`, which is the one place the monotonic ordering is
deliberately not followed.

## The remaining deviation: `custom`, and the unknown id

`custom` maps to `STALE_DAYS`, and an id nothing on the axis knows gets the same
flat cut. The standard's rule is that an unresolvable stage renders **no** aging
state, because a guessed threshold on an unmapped column is a badge nobody can
justify. Here it renders a badge derived from a constant the file itself calls
legacy.

The deviation has narrowed in a way worth naming: it is now *declared* rather
than accidental. A column whose author chose the `custom` role has said it maps
to no product semantics, and a test asserts that choice
(`pipelineStageFilter.test.ts:145`). The standard still stands — a declared
"I don't know" is an argument for no badge, not for a ten-day one — but the
population it applies to is now the columns a team explicitly declined to
classify, not every column it ever added.

## Overrides became team data

This is the largest change since the note was first written. Overrides used to
live in `localStorage`, so the server-side count could see none of them and the
badge could only approximate. On 2026-09-23 the cadence moved onto the workspace
axis as an optional `slaDays` per column, written by `PATCH /api/pipeline/stage-sla`
inside the store's read-modify-write (`applyStageSla`, `stage-sla.ts`), and read
through the one clock by the board, the sidebar badge and the automation pass. The
`stage-sla.ts` header gives the reason in the standard's terms: two recruiters on
one team aged the same board differently, and the server-side surfaces contradicted
the board the moment anyone tuned a column.

What that satisfies of the override contract:

- **Bounded, in code.** `STAGE_SLA_MIN_DAYS = 1` and `STAGE_SLA_MAX_DAYS = 365` in
  `decision-config-schema.ts`, refused with a named error, and the schema refuses
  `slaDays` on the terminal role. `pipelineSla.ts` still clamps the browser side
  and still records why `min`/`max` on a number input are advisory.
- **Authority, not taste.** The route asks for `pipeline:write`, the same
  capability every axis write asks for; its comment calls this a tighten, since
  before anyone could tune their own browser.
- **Migration offers, never imports.** A browser's leftover per-browser cadences
  (`kp.pipelineStageSla:<ws>`) are offered to the team once and cleared after
  adoption or discard, "because one browser's taste is not team policy until
  someone with `pipeline:write` says so".
- **No approximation left to declare for cadence.** The shared badge now reads the
  same team value as the board, so the technique's own "when not to use" clause
  applies: where the shared surface can see the true policy, use it and skip the
  apparatus. The standard still stands for any policy that stays local.

What the standard asks for and this still lacks: an override's **actor and date**.
The route writes the axis with scope `"team"` and I found no `updatedBy` or actor
on the write in the route or in `stage-sla.ts`; I did not read the store's own audit
trail, so whether it records who set ninety days on a column is not evaluated here.
The SLA editor that used to render the override was deleted with the old board view
(2026-09-25); the kit view's `PipelineKitSla.tsx` now carries the edit, showing the
team cadence with the role default as placeholder. Whether it marks a column as
running a custom policy was not read.

## One reasoned divergence from the override rule

The overridable-defaults technique asks for overrides keyed by **role**, so an
override survives a rename exactly as a default does. Here they are keyed by
**column id** (`slaForStage`'s override and axis lookups, `setStageSla(stage, days)`).
On an editable axis that meets the same goal by a different mechanism: the id is
the column's stable identity and the label is the editable part, so a rename
carries the override with it. It also expresses something a role key cannot: two
columns playing the same role, tuned differently, which is precisely why a team
composes a second interview column in the first place.

## What stopped being true

Two claims in the earlier version of this note are gone and should not be repeated
from memory. The attention strip (`PipelineAttentionStrip.tsx`) and its
"reachable-empty" header were deleted with the old board on 2026-09-25, so this
application no longer evidences the ranked-strip rule; the node application records
what replaced it. And the "approximation is confined to per-board overrides" claim
is void for cadence, per the section above, because there is no per-browser
override left for the server to miss.
