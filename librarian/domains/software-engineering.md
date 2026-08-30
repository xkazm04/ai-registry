---
domain: software-engineering
last_swept: 2026-08-28
layout: nested
demand_known: false
---

# Software engineering

Coverage note for the `software-engineering` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at the last sweep (2026-08-22, after the harvest merge)

| | |
| --- | --- |
| Subjects | 143 |
| Techniques | 893 |
| Applications | 361 |
| `use_when` written | 893/893 |
| Version witness (`verified_against`) | 37/361 |
| Expired applications | 0 |
| At-risk applications | 0 |
| Never swept | 112/143 |
| Attention points | 488 |
| Cap breaches | none - every level is under ten, top level still at nine |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain software-engineering`.

**These numbers are the merged tree, not any one lane's own.** Several waves ran against
this bundle on the same day from different branches - an external-reconcile wave
[[2026-08-22-2]], a research pass [[2026-08-22-3]], a harvest [[2026-08-22-4]] and a
backend-refactor harvest that landed while the harvest branch was open - and each measured
a shape the others could not see. A figure taken from any single branch is wrong now, and
the count moved three times between this note being written and the merge landing. That is
the argument for the vault's standing rule in one day's evidence: **record what a run DID,
and recompute every number from the scan.**

## What changed

[[2026-08-22-4]] was a harvest: 10 read-only scouts over one repository's 56 contexts,
then 20 subject-workers - 14 new subjects and 6 extensions. It added a fifth subcategory
under `ui-surfaces` (`published-surfaces`, five founding subjects) and left the top level
at nine categories, deliberately, so the bundle keeps headroom for a genuinely new one.

The external-reconcile and research lanes ran alongside it, clearing single-stack
subjects against world-class trees and adding `module-design`. (Correction, same
day: the run ids in this paragraph's first draft pointed at the wrong notes -
`runs/2026-08-22-2` through `-8` are the reconcile lane's waves and cycles, and
the harvest described above carries no run note of its own yet. Corrected rather
than left, because a vault whose links misattribute its own history is worse
than one with a visible patch.)

**Version witness moved 0/311 -> 37/357.** That line had read zero since the bundle was
founded. The harvest wrote the runtime major for every application it produced except two
`sql` ones whose author declined to guess; the reconcile lane contributed the rest.

[[2026-08-22-9]] - the fifth reconcile wave: Tailscale (peer-state-honesty),
Argo Workflows (conditional-edges), OPA (failure-direction) and containerd
(termination-and-reaping). Twenty-one single-stack debts cleared across the
lane's six runs; two law questions triggered in one wave (opt-in-guard at four
sightings, unknown-is-not-a-value at four).

[[2026-08-22-11]] - the sixth reconcile wave, and the lane's pivot: with the
rust backlog nearly drained, react subjects now earn their second stack from
framework-agnostic cores (TanStack query-core, Style Dictionary) beside two go
trees (restic, n8n's agent module). Twenty-five single-stack debts cleared
across seven runs; the one-mechanism-or-two-that-agree family reached three
sightings.

[[2026-08-23-2]] - the seventh reconcile wave: Floating UI, TanStack Form,
Vega-Lite and OpenMeter. Twenty-nine single-stack debts cleared across eight
runs; a measured double-submit bug found in a current release; the
lossy-branch-carries-a-counter family recognized at three sightings.

## 2026-08-28 — a four-round `/deepen` loop, one subject at a time

Not a sweep; a loop. Scores recomputed fresh before every round from
`librarian-scan`, top candidate taken each time, ledger written per subject.
Selection ran on the demand signal throughout — a reporting installation now
contributes deviation counts, so this is the first pass on this bundle where
demand ranked candidates rather than structure alone.

| Round | Subject | Yield |
| --- | --- | --- |
| 1 | [[accessibility]] | `assistive-tech-divergence` + a two-file correction |
| 2 | [[quality-gates]] | `enforcement-binding` + a `gate-laddering` amendment |
| 3 | [[error-handling]] | `cancellation-attribution` |
| 4 | [[authorization]] | `delegated-authority` |

989 -> 993 techniques. Four new, one per round, each on lane convergence; one
correction; two amendments; five counter-evidence confirmations that produced
no edit and are recorded in the subject notes rather than lost.

**Nothing saturated.** Dry streak is 0 on all four; not one round came back
without an earned technique, which for a bundle this mature was not the
forecast. Round 2 in particular was forecast confirmation-heavy — a
ten-technique subject with dense law wiring — and was not.

### The pattern this loop found, worth carrying into the next one

**Three of four gaps sat at the edge of a condition the original forge could
safely assume**, and in two cases the corpus had *written the assumption down*
and then reasoned no further:

- `accessibility` said announcements behave a certain way "on most
  platform/reader combinations" — the hedge was correct, load-bearing, and
  undeveloped for six techniques.
- `error-handling`'s neighbour bounded itself with "on an ordinary request the
  ambiguity barely exists" — true of the traffic it was forged against, no
  longer true generally, and precisely why the general case was missing.
- `authorization` graded channels because it was forged where the channel *is*
  the originator.

This is a cheaper gap-thesis than scanning for missing topics: **grep a subject
for its own qualifiers — "most", "usually", "barely", "on an ordinary" — and
ask whether the excluded case is still rare.** Offered to the next loop as a
scan heuristic, not yet promoted to the skill; three sightings in one domain is
one domain.

Second, smaller: two rounds found their gap by reading *inbound references from
other subjects* rather than the subject itself. `authorization` had three
neighbours deferring an entitlement model to it that it did not have. A
reference that resolves is not a reference that is answered.

### Registry-local, and a real cost

The whole loop ran against a tree with a concurrent session active in
`game-production`, `media-generation`, `localization` and the harvest lane.
Every round, `build-index` and `build-knowledge-rules` swept that session's
in-flight files into shared generated outputs, and `build-catalog` eventually
refused to write at all — correctly, its consistency check catching exactly
this. Handled by restoring foreign generated files to HEAD and committing
path-scoped, four times. It worked, and it is not free: **`catalog.json` is
deliberately left stale** and needs one regeneration in a quiet tree.

## What is owed

- a second stack for the ~44 single-stack subjects the last scan showed - the
  lane has cleared twenty-one; the harvest added new single-stack subjects, so
  recompute before the next wave
- a reporting installation - demand is still UNKNOWN, not zero
- the maturity ladder - everything still says `forged`
- **one `build-catalog.mjs` run in a quiet tree** — left stale by the
  2026-08-28 loop on purpose rather than regenerated across another run's
  in-flight files
- `accessibility` is still single-stack (`react`) and still tops the worklist
  on that plus the fleet's highest deviation count; the debt is a reconcile-lane
  job (a non-web accessible-UI tree), not a research one
- `scripts/check-skills.mjs` exits 1 on trunk as of 2026-08-28 — an em-dash
  inside a fenced code block in `skills/architect/SKILL.md`. Not this lane's to
  fix, recorded because a red gate on the binding rung is the first number
  [[quality-gates]] says to check

## 2026-08-29 — architecture batch (seven workers) and the demand-provenance rule

Run [[2026-08-29-4]]: seven subjects in one Director-reviewed batch, all seven
productive (three new techniques on convergence, two corpus numbers refuted,
17 new/refreshed witnessed applications; 998 techniques / 488 applications
after merge). Per-subject state now lives in `librarian/subjects/` for all
seven; four previously single-stack subjects gained a second stack, so the
single-stack debt shrank without a reconcile wave.

New rule earned here: **read a deviation count's provenance before planning
work against it.** The worklist's client-state/entity-lifecycle deviations are
the other machine's; on this device those pairs are unjudged. The impact plan
([[2026-08-29-architecture-round]]) was therefore built from tree reads, and
recording local verdicts into the maps is its Phase B.

Owed (updated): the maturity ladder (still all `forged`); a reporting
installation for demand on THIS machine's projects beyond ai-registry-scripts;
`check-skills.mjs` still red on trunk (architect em-dash) — unchanged, not this
lane's; ~40 single-stack subjects remain after this round's four.


## 2026-08-30 — the sweep that fixed its own instrument ([[2026-08-30-1]])

The worklist this domain has been ranked on was **inflated 1.49x and unevenly**, because
`librarian-scan` summed consumer deviations across contributor files and the two
contributors are one fleet on two machines. Concentrated in 33 of 89 demand-bearing
subjects, so it reordered rather than inflated: `quality-gates` sat 13th when it belonged
2nd. Fixed — states take the floor across contributors, events still sum, and demand now
prints as a range. **Any deviation figure in this note written before 2026-08-30 is a
sum and reads high.**

Six subjects deepened, all productive: agent-memory (a closed banked lead → the
frozen-reader boundary statement, plus `baseline-ladder`), markdown-vault
(`replicated-substrate`, single-stack closed), diff-comparison (its own review-mode claim
refuted, plus `invisible-differences`), app-shell (the frame-continuity correction, 2 → 8
applications), agent-cli-transport (`child-observed-posture`, four refutations), and
llm-observability's operator-surfaces. 1000 → 1004 techniques, 491 → 500 applications.

Two stacks added to this bundle's `stacks:` from worker proposals — `spec` and
`gemini-cli`. The `spec` one matters beyond one subject: a public standard is a second
**origin**, and for `ui-surfaces` subjects it tests transplantability better than a
second framework does. It immediately found two gaps in our own upper layers.

Owed (updated): `accessibility` is still single-stack and still a **reconcile** job, not
a research one — declined again this run for that reason. The maturity ladder is still
untouched. The catalog/rules/marketplace debt that reopened at `5781c97` is closed, and
trunk was red on two of those before this branch. New: **a contributor-identity notion**,
without which demand stays a range.
