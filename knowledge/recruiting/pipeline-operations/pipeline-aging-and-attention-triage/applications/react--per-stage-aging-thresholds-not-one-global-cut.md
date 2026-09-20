---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: per-stage-aging-thresholds-not-one-global-cut
stack: react
status: forged
verified_on: 2026-09-20
---

# The per-role SLA table and its per-board overrides (React)

`app/features/shared/pipelineTypes.ts:115-168` holds the technique's whole policy
surface: one flat legacy constant kept as a last resort, one table keyed by stage
**role**, a derived name-keyed table for callers that only know a canonical name,
and one resolver.

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

`:157-168`. The resolution order is the recruiter's override for this column id →
`roleOf(stage, axis)` → the shipped default for a canonical id that has been
retired from the axis but still has candidates standing on it → the flat cut.
Every caller passes the axis it already held: the board's own reads, the row
tooltip, and the server-side badge in `app/_lib/attention.ts`, which resolves the
workspace's axis once (`:73`) and then asks both stage questions through it —
`stageHasRole(e.stage, "terminal", axis)` for the exclusion (`:76`) and
`slaForStage(e.stage, undefined, axis)` for the threshold (`:90`).

`attention.ts:87-89` records the failure the parameter closes, in the standard's
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

## Overrides: bounded and tenant-scoped, still unattributed

`app/features/hiring/pipeline/pipelineSla.ts` states the range once —
`SLA_MIN_DAYS = 1`, `SLA_MAX_DAYS = 365`, and `clampSlaDays` rounds to whole days
and clamps into that range. Its header records why the bound is enforced in code
rather than declared on the input: a native number input's `min`/`max` "are
advisory — they style the field, they do not stop a paste, an arrow-key overshoot
or a programmatic set", and a typed 5000 "silenced that column's amber aging dot
for fourteen years, with the field showing the honest 5000 and nothing saying it
was out of range". That is the standard's **bounded** requirement met, with the
suppression-with-extra-steps failure named.

`usePipelineSla.ts` is the store. Two properties match the standard: overrides
are keyed per workspace rather than per browser (`:7-11` records the bug —
"after a team switch team A's stage ids and cadences governed team B's aging
chips"), and values are clamped on the way *in* as well as on the way out, so a
value stored by an older, unbounded build cannot keep silencing a column. A
cleared override is a deletion, so the column goes back to its role default
(`:41`), and an unresolved tenant writes nothing while the override still applies
in memory for the session (`:43-45`).

What the standard asks for and this does not have: overrides are **unattributed
and undated**. Who set ninety days on this board, and when, is not recorded
anywhere — and an unexplained long threshold is indistinguishable from an
accident.

## The shared badge still approximates, and still says so only in source

Overrides live in `localStorage`, so the server-side count cannot see them. What
*has* changed is that the shared computation is no longer approximate about
**roles** — it resolves the workspace's own axis before it counts — so the
approximation is now confined to the per-board overrides, which is the boundary
the overridable-defaults technique actually describes.
`docs/features/hiring-pipeline/README.md` §"Aging thresholds follow the role, not
the name" states it for a reader: "the sidebar badge is computed server-side from
the defaults only — a recruiter's local overrides are a per-browser concern it
approximates."

The user-visible half of the declared-approximation contract is still missing.
The disclosure lives in a source comment and a feature doc, not on the badge, so
a recruiter who tuned their board has no in-product explanation for why the nav
count disagrees with their lanes.

## One reasoned divergence from the override rule

The overridable-defaults technique asks for overrides keyed by **role**, so an
override survives a rename exactly as a default does. Here they are keyed by
**column id** (`slaForStage`'s first lookup, and `setStageSla(stage, days)`).
On an editable axis that meets the same goal by a different mechanism: the id is
the column's stable identity and the label is the editable part, so a rename
carries the override with it. It also expresses something a role key cannot — two
columns playing the same role, tuned differently, which is precisely why a team
composes a second interview column in the first place.

## Where the strip sits

`app/features/hiring/pipeline/PipelineAttentionStrip.tsx:1-15` consolidates the
two queues that outrank the board into one ranked list, placed "above everything
a fresh workspace is shown, because a stalled application outranks onboarding".
The same header records the reachable-empty rule — "Renders nothing when both
queues are empty; the strip must never be a permanent fixture the eye learns to
skip" — which is the property terminal exclusion and per-role thresholds exist to
protect.
