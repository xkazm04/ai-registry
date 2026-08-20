---
layer: application
type: application
subject: production-pipeline-phasing
technique: worst-news-first-progress
stack: react
status: forged
verified_on: 2026-08-19
---

# React: worst-news-first progress in a five-phase studio

Gravitone (repo `gravitone-gcloud`) is a Next.js studio that takes a short
video through Research → Script → Frames → Score → Cut. Its project record
and progress machinery live in `lib/projects.ts`, and they realize this
technique almost clause for clause.

## The phase order, declared once

`lib/projects.ts:39` is the single source of the order:

```ts
export const PHASES = ["research", "script", "frames", "score", "cut"] as const;
```

The `/studio` stepper and every `/projects` surface read it from here. The
comment above it records the granularity lesson: a Motion phase used to sit
between Frames and Score, and was retired because "a still and the movement
given to it are one art-direction decision made against one source frame" —
the phase boundary was cutting through a single act, so Frames absorbed
both.

## Retirement migrated at the read seam, merged worst-news-first

`RETIRED_PHASES` (`lib/projects.ts:58`) maps `motion → frames`, and
`migrateProject` (`:67-83`) applies it inside `getProject`/`listProjects` —
the read seam — so a stored `phase: "motion"` cannot silently open the
studio on Research. The merge rank sits right below (`:86`):

```ts
const STATE_RANK: PhaseState[] = ["blocked", "review", "working", "done", "empty"];
```

with `worseOf` picking the leftmost — "the further left, the more it needs
saying". The migration's own docstring names the law: reporting the
survivor as done "when half of what it now covers had stopped would be the
one lie this migration must not tell."

## Aggregation and the first-class blocked state

`projectState` (`lib/projects.ts:231-237`) is worst-news-first verbatim:
blocked if any phase is blocked, then delivered, then review, then working,
then draft. The `PhaseState` doc (`:94-98`) justifies `blocked` as
non-decorative: every phase surface "already renders refused renders and
missing blocks, so a project list that cannot say 'stuck' would be
flattering the product." `doneCount` (`:209`) survives only as the
secondary figure every shelf variant shows.

## Single writer, and `empty` as unreported

`reportPhase` (`lib/projects.ts:382-391`) is "the ONE mechanism — five
surfaces do not each invent a write." Its signature excludes the empty
state — `state: Exclude<PhaseState, "empty">` — so a reporter with nothing
to say says nothing, and a phase with no reporter reads identically to one
whose reporter found nothing. `ProjectDraft` (`:183`) deliberately omits
`progress`: "progress is not a form field, and no dialog should be able to
type a project into `done`."

The dead-derivation lesson also lives here: an `openStep(p)` helper ("the
first step that is not done") was deleted rather than wired up (`:214-221`)
because nothing in the app can lock a step yet, so it was "guaranteed to
answer 'research' for every project a user creates, forever."

## The bookmark/progress split

The block comment at `lib/projects.ts:328-361` states the two-writer
design: `parkAt` (`:365`) moves only `phase` — not `progress`, not
`updatedAt`, so the shelf's sort never moves on a browse — while
`reportPhase` is a claim that stamps `updatedAt`. The history is recorded
too: the rail once wrote nothing (defending "browsing is not progress") and
froze `phase` at `"research"`, making the user re-walk the rail on every
re-entry.

## The gate that extends the rule inward

`app/_phases/script/gate.ts:25-43` carries the graduation-gate half. Its
header states "THE ONE HONESTY RULE: the gate may never report `pass` for
something it did not check" — `unmeasured` is a first-class verdict,
counted separately, and `gateSummary().enforced` reports what fraction of
declared constraints were actually executable. It replaced a hand-authored
constraint ledger whose defect a reviewer named exactly ("the honesty field
has a vibe"): a real causality violation shipped past twelve self-checks
because every check was a sentence about the render, not a function that
read it.
