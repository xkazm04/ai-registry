---
domain: software-engineering
last_swept: 2026-09-01
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

## 2026-08-31 — the construction frontier ([[../sources/2026-08-31-tigerbeetle]])

A `/intake` run on a systems-database repository could not place a single one of its
architectural claims, and the diagnosis is a property of this bundle rather than of that
source. **This bundle builds at one layer and consumes everything below it**, and the
boundary has never been stated, so nothing has ever been measured against it.

### The probe

Fifteen builder-position systems concepts mapped against the corpus. Every one resolved
to a semantically unrelated subject by slug-token collision:

| term | top hit | score |
| --- | --- | --- |
| `write-ahead log` | `audit-logging` (on "log") | 10 |
| `zero copy` | `recruiting/rejection-with-dignity` | 12 |
| `work stealing` | `recruiting/public-work-evidence-bounding` | 19 |
| `memory barrier` | `llm-agent/agent-memory` (on "memory") | 27 |
| `lock free` | `recruiting/interview-calendar-integrity` | 5 |
| `leader election` | `recruiting/comparative-shortlist-evaluation` | 4 |
| `b-tree` | `build-and-release/packaging` | 7 |
| `quorum` | `fleet-orchestration` | 2 |

Four returned **zero corpus-wide**: `fsync`, `allocator`, `syscall`, `numa`.

The control run resolves cleanly, which is what makes the above a fact about the corpus
rather than about `research-map`: `retry backoff` → `retry-backoff` (42), `schema
migration` → `migrations` (21), `rate limiting` → `rate-limiting` (24), `error taxonomy`
→ `error-handling` (19), `connection pooling` → `embedded-db` (18).

### Where the frontier sits

The bundle is not consumer-position throughout — `llm-agent` (29 subjects, 231
techniques) is deeply builder-position, and so are `ui-surfaces`, `client-architecture`
and the whole of `engineering-process`. The line is not competence, it is **subject
matter**: this bundle builds what a product team writes and consumes what a product team
installs. `backend-platform/data-layer` is the clearest case — its four subjects
(`data-access`, `embedded-db`, `migrations`, `sync-replication`) all begin after an
engine exists, and `embedded-db` is *operations*: pooling, journal modes, storage
accounting.

### Why it is self-reinforcing, and the second sighting that proves it

Two mechanisms keep the frontier where it is, and neither is visible from inside a sweep.

**The source diet.** 77 sources mined to date are overwhelmingly agent harnesses, LLM
tooling, media generation, evals and process. TigerBeetle is the first systems-
infrastructure source in the ledger. An application repository contains no
write-ahead log; it contains a client for someone else's.

**The intake method itself.** Phase 4 maps candidates against existing subjects; below-
the-line material returns noise or `none`; `none` reads as "does not belong here" rather
than "no home exists yet", so the candidate is dropped before the operator sees a triage
row. That is not hypothetical — it is exactly what happened on the first pass of this
run, which produced twelve process rows and zero architecture rows from a database.

The confirming evidence is a **second sighting**, and it is stronger than this run's.
On 2026-08-27 an intake run from two independent database sources reached the same
structural conclusion and wrote it down precisely — "`data-layer`'s four all begin
*after* the engine exists; nothing owns the decision that produces them" — then filled
the hole with [`storage-engine-selection`](../../docs/subject-proposal-storage-engine-selection.md),
whose eight proposed techniques are all *selection* rules: which engine, when to defer
commitment, workload-class inventory. A run standing exactly on this ground still
reached for the consumer position. The frontier is not an oversight anyone can spot by
looking harder; it is the default the corpus falls into.

### What is owed

Not content — this is a scoping decision the corpus has never consciously made, and it
should be made before anything is forged:

1. **State the frontier or move it.** If the bundle is deliberately application-layer,
   `rkb-profile.md` should say so, and below-the-line candidates become an honest
   decline with a reason rather than a silent drop. If it is not deliberate, the gap is
   a new category under `backend-platform` written from the builder's position, and it
   is `/forge` scale, not one intake run.
2. **The concept-zero check belongs in the method.** The 2026-08-27 run invented it by
   hand — "a *concept* returning zero is the finding, while a product name returning
   zero is correct by the purity floor" — and it has lived in one proposal document ever
   since. It is the only cheap instrument that distinguishes "no home" from "no gap".
3. **`librarian-scan` cannot see this class.** It ranks by attention debt over subjects
   that exist; a category that does not exist accrues none. Every hole this bundle has
   of this shape is invisible to the worklist by construction.

## 2026-09-01 - librarian sweep ([[2026-09-01-1]])

Swept: 156 subjects, 0 structural defects, 46 single-stack, 60 never swept. The demand head
was suppressed (all touched within four days, no new clock). The work went to three
systemic passes instead: the maturity flip (29 golden paths here now say `reconciled`),
an inbox drain (85 consumer leads triaged, 62 of them pointing here), and the reconcile
lane at `accessibility`, whose single-stack debt is closed against a non-web tree.
Landed from the inbox in this bundle: 7 new techniques (`effect-identity-and-latched-
callbacks`, `instrument-answers-only-its-own-question`, `read-write-predicate-symmetry`,
`outbound-fetch-destination-validation`, `atomic-file-publish`, `overlay-merge-absence-
semantics`, `hidden-but-mounted-inertness`), amendments in 13 subjects, 20 applications.
Four subjects were claimed by a live sibling intake run and their leads are banked, not
landed: error-handling, test-harness, agent-memory, docs-sync. Owed: writers for 30 banked
EXTENDS/NOVEL leads (each carries its amendment text in the inbox row); a project change
in personas for the un-retried publish paths `atomic-file-publish` found; `unknown-is-not-
a-value` added to `vocabulary-chain-integrity`'s laws; the `spec`/`data`-class definition
of `reconciled` (see the run note) before 18 more subjects can flip.
