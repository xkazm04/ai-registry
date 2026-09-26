---
domain: software-engineering
last_swept: 2026-09-23
layout: nested
demand_known: true
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
## Run [[2026-09-02-1]] - seven fresh targets, six inbox rows ruled

Shape at close (record, not input): 156 subjects, 1094 techniques, 589
applications, `use_when` 1094/1094, version witness 212, expired 0, at-risk 0,
never swept 58/156, attention points 1448, no cap breaches.

Seven `/deepen` workers at subjects with no recent touch (four never swept,
three single-stack). All seven landed; none dry. Three single-stack subjects
closed (browser-credential-boundary → next, demo-data-plane → go, guided-tours →
node). One new technique (terminal-multiplexing/multi-client-fan-out). One new
stack in the vocabulary: `elixir`. The first `refresh_by` clock in
plan-entitlements (spec application, 2026-12-02).

The first six rows of `librarian/inbox.md` ever ruled on: four landed (one
restated against the RFC it contradicted), one already present, one placed as
a lead on credential-vault. 81 rows remain unruled.

Trunk `rules/` was stale for two OTHER bundles before this run began - the
third occurrence. Regenerated here.

### What is owed (updated)

- **The 81 unruled inbox rows** - the cheapest work on the table.
- accessibility - three declines deep; it is a `/reconcile` job.
- 84 single-stack subjects (was 87): one wave, not 84 dispatches.
- The maturity ladder - every status still `forged`.
- `rules/` regeneration is skipped by every non-librarian landing; the gate is
  only green because the librarian pushes last.
- A feature-flags subject: the bundle has none, and plan-entitlements now has
  a seam with nothing to link to. Forge candidate.
- The frontier question above is unchanged.

## Run [[2026-09-04-1]] - three demand-ranked subjects, no new technique, eleven absolutes down

Shape at close (record, not input): 214 subjects, 1583 techniques, 931
applications, expired 0, at-risk 0, 58 stack-drift applications before the run.

Three `/deepen` workers at the top two demand subjects (agent-memory, quality-gates)
and the never-deepened, highest-drift one (agent-runtime-assembly). No new technique
- every candidate had prior art or an ambiguous home - and the yield was corrections:
six absolutes or numbers refuted, three internal contradictions the blind lane caught,
three banked leads whose return condition was met, ten drift applications
re-witnessed. Eight apply rows, three of them `not-better` with the condition written
back the same hour.

### What is owed (updated)

- **quality-gates at 25 techniques holds two subjects** - a `metric-gates` split is
  proposed with its seam and its five techniques named; operator decision.
- **Merge-result gating is a coverage hole** with zero prior art; second sighting
  wanted, home ambiguous.
- `check-currency` compares against the fleet's maximum runtime major; four of ten
  drift rows this run were the developer box outrunning the tree's own CI pin.
  Read the tree's pin where the application records one.
- A `bun` stack witness, or a rule for a tree that pins no node at all.
- **Fleet-wide 247 of 287 recorded verdicts are stale** and nobody has run
  `/conform --stale` since the per-subject digest landed (2026-09-02). Regenerating
  maps every run keeps the queue honest; it does not drain it.
- Node 20 is past end-of-life and still pinned by ai-registry, pumper and one personas
  job - the deployment-contract lane's, not this one's.
- Unchanged from [[2026-09-02-1]]: the 81 unruled inbox rows, the single-stack wave,
  the maturity ladder, the frontier question.

## Run [[2026-09-05-1]] - one demand subject, two never-deepened drift subjects, one technique

Shape at close (record, not input): 219 subjects, 1632 techniques, 962
applications, expired 0, at-risk 0, 59 stack-drift applications after the run.

Three workers here (client-state at demand #6; agent-instruction-files and
stream-proxy-hop as never-deepened drift subjects) plus one in llm-observability.
One new technique (`stream-proxy-hop/lifetime-cap-rotation`, on blind + web + tree
convergence). Two foundations fell to counter-evidence: the instruction-file dilution
claim was a density result stated without its scale, and the stream subject's "client
does not reconnect" was the hand-rolled reader's shape, not the standard client's.
Three second-stack or first-of-kind applications from fleet trees; nine drift
applications re-witnessed, two witnesses withdrawn (a bun-pinned tree; three trees
with three pins).

### What is owed (updated)

- **Fleet declaration gap**: a project whose checkout exists on this machine is not
  listed for it in `projects.json`, so its map was not regenerated and the one real
  node stream hop in the fleet carries two live defects nobody's map can see.
- **Two rust witnesses for one tree in one batch** (MSRV floor vs observed toolchain);
  aligned to the observed toolchain with the floor in the body, but the convention is
  undocumented - the currency instrument should say which it reads.
- Four of the remaining drift rows on the touched subjects are trees whose own CI
  pins the lower major - the [[2026-09-04-1]] instrument item, unchanged.
- The "safe default is the failure you can see" law candidate now has six sightings
  in client-state alone; operator call on `_laws.md`.
- Unchanged from [[2026-09-04-1]]: the quality-gates split, merge-result gating, the
  bun witness, the 247 stale verdicts nobody has drained (215 after this run's
  regeneration - the number moves with digests, not with conform runs).
## Run [[2026-09-06-1]] - quality-gates split; metric-gates is the bundle's 215th subject

Operator executed the split proposed on 2026-09-04. Four techniques and three
applications moved whole; `excess-indicts-the-instrument` stayed (predicate-side, and a
half-technique is two weak ones). quality-gates 25 -> 21 techniques. The split changes
no rule; it changes which golden path a reader lands on when the verdict is a number.

### What is owed (updated)

- metric-gates: demand unknown, four techniques, two named candidates waiting on a
  second sighting. First `/conform` on a project with a ratchet or size gate.
- The quality-gates split item is closed. Everything else from [[2026-09-04-1]] stands.

## Run [[2026-09-23-3]] - the companion subcategory on fresh demand, four clocks

The first sweep of companion-runtime and companion-identity since their 2026-08-24 forge,
ranked on the regenerated registry map rather than the scan, whose signals were three
weeks old. Twelve corrections, no new technique, eight apply rows (two `not-better`, each
a condition). Four applications on their own clocks refreshed ahead of expiry.

### Saturation ledger (companion subcategory)

| subject | rung | last-pass yield | clocks | demand | dry |
| --- | --- | --- | --- | --- | --- |
| companion-runtime | L3 (read-only experiments on a live tree) | 8 corrections, 1 condition | three applications still at 2026-08-23 | 10 stale verdicts, one project | 0 |
| companion-identity | L3 | 4 corrections, 1 condition | none near | 6 stale verdicts, one project | 0 |
| conversation-orchestration | not swept | - | - | 3 stale deviations | - |

### What is owed (updated)

- Refresh `signals/` from both machines; the scan's demand input is stale.
- `/conform --stale` on personas for the two companion subjects (16 verdicts).
- conversation-orchestration, the third companion subject, is unswept with 3 stale
  deviations - the natural next target in this subcategory.
- A testing-isolation home for process-global state in tests (two independent sightings
  this run).

## Run [[2026-09-23-2]] - four subjects outside the companion area, one technique

templates-scaffolding gained `instance-upgrade`; connector-catalog, credential-vault and
app-shell took corrections. Thirteen apply rows, four `not-better`. 13 of 22 demand
deviations were already fixed in the projects.

### Saturation ledger (this batch)

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| templates-scaffolding | L3 | 1 technique, 10 corrections, 1 condition | 8 stale, 4 fixed in tree | 0 |
| connector-catalog | L3 | corrections, 1 condition, 1 app corrected | 5 stale, 2 fixed/superseded | 0 |
| credential-vault | L3 | 4 corrections, 2 conditions | 9 stale, 5 fixed in tree | 0 |
| app-shell | L3 | corrections, 2 technique fixes from apply | 3 stale | 0 |

### What is owed (updated)

- `/conform --stale` on personas: the fleet's stale verdicts are now mostly fixed code, not
  open defects - the queue measures the conform lane's lag more than the corpus.
- A testing-isolation home (from [[2026-09-23-3]]), and a status-vocabulary application for
  a panel whose fallback defaults to healthy.

## Run [[2026-09-23-1]] - the instruments first, then table and three lead drains

Four instruments were wrong before any content moved (upstream pin parsing, the signals
deviation sum, a dry streak nothing wrote, machine paths the purity gate never looked
for); all four fixed and gated. Then a scoped deepen of `table` (most fresh deviations:
11 in 8 projects) and three category drains: 41 leads ruled, 30 landed across 19
subjects, 6 covered, 5 declined. Seven apply findings at five projects: 5 better and
shipped (not pushed), 2 not-better; five of the seven returned a condition the corrected
rule lacked. Attention points barely moved - they measure consumer deviations, which only
`/conform` clears. Owed: the post-merge map rebuild (223 stale verdicts before this run's
digests moved), the other contributor's re-collect, 52 open leads.

## Run dp-be0926 - bounded-enumeration, a second stack and no absolute left standing

Curator dispatch on "single stack (go)". A Rust data service's paging surface was read and
measured. It gave the second stack, and it gave the one measurement: a newest-first walk
over a mutable `updated_at` misses a record updated mid-walk, and a change feed from the
walk's high-water mark recovers it. Six claims were attacked. One was refuted as stated
("a consistent view is unbounded by construction"); five were conditioned, and no new
technique was earned (every convergence was a condition on an existing one). Scan points
went from 5 to 0, after the landing plus this subject's first note. Seven joined
maps were rebuilt: 10 pairs, all `unknown`, 0 stale verdicts.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| bounded-enumeration | L3 | 2 applications, 1 refuted-as-stated, 5 conditions, 0 techniques | 0 stale (10 unjudged pairs, 7 projects) | 0 |

Source-class tally (post-hoc, this run):
- The keyset reference text and the policy engine's own source code carried the
  accepted claims.
- The published API-design conventions did the refuting (opaque tokens, over-max
  coercion, zero as unset).
- One developer blog was the only written source for the mutable-order skip. It was
  accepted only because the tree measured the same thing.

## Run dp-cg-0926 - canvas-graph, a second tree where a second stack does not exist

Curator dispatch on "single stack (react)". The finding cannot be cleared from this
fleet: every canvas surface is React-hosted and the Rust trees draw none. The pass widened
across trees instead. kp's PlantUML renderer (elkjs, read-only) joined as two
applications, and two experiments on its 15 committed diagrams measured:
- reordering the same graph re-placed boxes in 14 of 15 diagrams, while reruns moved 0;
- straight edges would cross a foreign node 16 of 189 times, against 0 for the engine's
  routes.

Four claims flipped: order is input, engine routes are the geometry, nodes may read a
stepped zoom, and the engine-driven layout inputs. Five were conditioned: the render
ladder is retained-mode, the commit cadence exists to protect subscription isolation,
fixed anchors are force-only, force engines often ship a fixed seed, and the region's role
must be nameable. No new technique. Both 2026-08-18 personas applications cited a camera
deleted on 2026-08-23. Those citations are repinned to the last commit that had it, and
twelve drifted line ranges and one misquote are fixed. Scan points stayed at 5 through the
landing (single stack stands). The subject note clears "never swept". kp now joins the
subject on 2 contexts. Personas carries 1 stale verdict and its map was not rebuilt
(another session's uncommitted map rewrite).

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| canvas-graph | L3 | 2 applications, 2 re-verified, 4 flips, 5 conditions, 0 techniques | personas 1 stale; kp newly joined; 10 unjudged contexts | 0 |

Source-class tally (post-hoc, this run):
- Library source code and vendor docs did the conditioning: the leading node editor's
  event handler, the ELK option reference, the d3-force docs, and a whiteboard engine's
  performance page.
- The ARIA spec and the APG settled the accessibility conditions.
- The consumer tree's own experiments carried both flips that have numbers.
- Search excerpts that were never fetched were landed only as soft wording, and each is
  flagged in the subject note.

## Run dp-cim-0926 - cicd-monitoring, a rust second stack and "terminal" was only per attempt

Curator dispatch on "single stack (react)". The one joined tree (Personas) gave the second
stack from its Rust backend. It also showed that the react applications had drifted: the
job-log command landed on 2026-09-17, and the four pipeline commands are still
unregistered. Six claims were attacked:
- two refuted as stated: terminal immutability, and every poll spending budget;
- four conditioned: push, the canonical status set, the trigger's identifier, and retry
  blast.

No new technique was earned. The three converged findings (per-attempt terminality with
its dedup consequence, the provider-specific free 304, and the parked class) all landed as
conditions. Three applied rows are simulation `better` and two are unapplied. Impact:
Personas, 2 contexts, 0 stale verdicts (both unjudged). Personas' committed map rebuild is
owed, because another session holds that file.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| cicd-monitoring | L2 | 3 applications, 2 refuted-as-stated, 4 conditions, 0 techniques | 0 stale (2 unjudged pairs, 1 project) | 0 |

Source-class tally (post-hoc, this run):
- The providers' own REST references and changelog carried every accepted claim.
- The web lane caught its page summarizer inventing a provider sentence, and a verbatim
  re-fetch removed it. A summarized provider doc needs a verbatim check before it is
  quoted.
- The joined tree outranked both lanes on the application side. The fallback act, the
  unrecorded undeploy and the hardcoded result appeared in neither lane.

## Run dp-dnd-0926 - drag-drop, a rust second stack at the host boundary

Curator dispatch on "single stack (react)". The second stack came from where the
decision lives: personas' desktop host. Its drag-drop switch defaults on. On Windows the
switch replaces the page's drop target, and on macOS it keeps every drag from the page.
The tree's file zones and in-page reorders are both written for the other branch. goat
joined as a second React tree: its dnd-kit items announce a keyboard path that no sensor
implements. Four absolutes were conditioned or refuted:
- the deprecated grab attributes;
- the single-pointer alternative;
- "no browser" keyboard entry;
- copy, not link, as the cross-boundary default.

The single-pointer condition's own simulation came back `not-better`. The goal board's
click path lives in an editor, so the rule now judges the operation, not the surface.
Impact: 0 stale verdicts (12 unjudged contexts, 4 projects). The personas map rebuild is
owed, because another session holds that file.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| drag-drop | L2 | 2 applications, 1 flip, 1 refuted, 3 conditions, 0 techniques | 0 stale (12 unjudged pairs, 4 projects) | 0 |

Source-class tally (post-hoc, this run):
- Pinned third-party source in the local package caches carried every host and library
  claim. It outranked the vendor's doc comment, which names one platform where the source
  shows two.
- The standards bodies' own text (ARIA 1.2, WCAG 2.2 Understanding) settled both
  accessibility corrections. Commentary was not needed.
- The open issue and the unmerged pull request dated the upstream state. They were used
  only for dating, never as the claim itself.
- The blind lane reached the host rule, the platform split and the test blindness
  unprompted. That convergence is what placed the condition at technique level.

## Run dp-dsl-0926 - dynamic-secret-lifecycle, a rust second stack where the issuer is its own verifier

Curator dispatch on "single stack (go)". The one real join is Personas'
api-key-management; pumper's join is a same-word match. The Rust backend
mints its own management-API keys and verifies them against the same table,
which exposed the case the subject had not named: the record is the
credential, so the effect that can fail is the plaintext handout. Nine claims
were attacked:
- two refuted: renewal past the maximum "refused", and store-nothing
  "unrevocable";
- five conditioned: persist-first order, the backstop's reach, absent-target
  identity, signing-key retention, and the no-op lease.

One widening was earned by tree-plus-blind-lane convergence
(persist-before-provision, issuer-as-verifier). A phantom deviation in the Go
application was retracted: the core does revoke on a failed lease write, one
call deeper than the call site. One applied row is simulation `better`, and
four are unapplied with return conditions. Impact: 0 stale verdicts (2
unjudged pairs, 2 projects). The personas map rebuild is owed; pumper's is
committed locally and unpushed on a diverged master.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| dynamic-secret-lifecycle | L2 | 1 application, 1 widening, 2 refuted, 5 conditions, 1 retraction, 0 techniques | 0 stale (2 unjudged pairs, 2 projects) | 0 |

Source-class tally (post-hoc, this run):
- Source at the application's own pinned commit, fetched raw, settled both
  refutations and the retraction. The help text of a switch overstated its
  own price, and the code under it is what the correction cites.
- A standards body's ballot page and a database's own reference page carried
  the backstop and short-lived-certificate conditions. A search summary of
  vendor commentary was not relied on.
- The joined tree outranked both lanes on the application side: the
  unclaimed-pairing orphan and the system-key race appeared in neither lane.

## Run dp-mpe-0926 - modelled-performance-estimates, a next and a react second stack, and zero turned out to be a price

Curator dispatch on "single stack (rust)". The three joined trees gave two new stacks:
ascent's usage page (next) and personas' preflight estimates (react). goat's one seam is
dead code. Six claims were attacked, and all six were conditioned; none was refuted
outright:
- the ceiling (bound-type models only; name the class);
- the interval (measured residuals give one, inside the calibrated population);
- the sentinel (true of zero; negatives and not-a-number fail at a hop);
- the one ratio (absolute terms go in the numerator first);
- the band edge (documented slack is larger and often absolute);
- per-category entries (shrink thin ones toward the fixed default).

The web lane and the blind lane converged on all six. The two structural ones landed as
technique text, but as conditions, so no new technique was earned. The tree added what no
lane predicted: zero as a true value (ascent prices local inference at zero, and its meter
lanes contradict that), and three disagreeing price tables in one app (personas). One
applied row is simulation `better`, two are simulation `unmeasurable` and one is
unapplied. Impact: 0 stale verdicts. No context in the three joined projects pairs with
the subject. goat's map was committed locally, unpushed on a diverged main. The ascent and
personas map rebuilds are owed, because other sessions hold those files.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| modelled-performance-estimates | L2 | 2 applications, 6 conditions, 0 techniques | 0 stale (0 pairs, 3 candidate projects) | 0 |

Source-class tally (post-hoc, this run):
- Primary papers carried every accepted upper-layer condition: the roofline paper's own
  framing against predictive models, a multilevel-modelling paper's cross-validation
  table, and a conformal-prediction tutorial. Runtime source and READMEs, fetched raw,
  carried the slack figures. One remembered default (0.9) was stale against the
  source (0.92).
- The blind lane reached all six conditions without search, and it proposed the fix
  (numerator, shrinkage) before the web lane had its sources. That is agreement on the
  training-data side, and it is why both landed as technique text.
- The joined trees outranked both lanes on the application side. The zero-is-a-price
  converse and the three-table disagreement appeared in neither lane. A lane summary's
  "never persisted" claim did not survive a known-positive check, and it was narrowed in
  the note.
## Run dp-cc-0926 - connector-catalog, a rust second stack and a third writer

A Curator dispatch on "single stack (react)". The `next` application is the react family.
This scan scored the subject 0 points both before and after the pass, so the dispatcher's
lens and the scan's lens disagree on what counts as a second stack. The second stack came
from a desktop app's Rust boot seeder, on the one technique with no application. The
canonical clobber was re-verified unchanged.

Five writers were enumerated. The replay showed four losses: the import writer's appends,
a label edit, a rename (the split key made it an unmarked fork), and a deletion (the row
was resurrected). The live store testified exactly as the conditioned audit predicts.

Six claims were attacked: 0 refuted, 5 conditioned, 1 confirmed with a refinement, and 0
techniques earned. The blind lane was wrong once, predicting a duplicate row on rename,
and the replay caught it. One `code` apply was pushed to the project.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| connector-catalog | L3 | 1 application, 8 conditions, 1 code fix pushed, 0 techniques | 5 stale (personas 4, ascent 1) | 0 |

Source-class tally (post-hoc, this run):

- Accepted claims rested on package-manager policy and manual pages, a declarative
  platform's own reference text, and an infrastructure tool's language docs.
- One official doc site blocked the fetch. Its raw source repository served the same
  page, and the fetch tool's summary of the rendered page had truncated the one table
  that mattered.
- A platform's KB and community pages were declined because no primary source was
  reached, and so was a PM's blog.

## Run dp-mf-0926 - metric-forecasting, a rust second stack and a measured pacing condition

Curator dispatch on "single stack (node)". The map joins the subject to four
TypeScript projects. The genuine second stack came from a tree the map does
not join: tracklight's Rust spend-forecast gate, found by searching the
fleet's non-TypeScript code for forecasting. Five claims were attacked. None
was refuted, four were conditioned (richer methods, the crossing range, the
anchor, linear pacing), and the horizon cap was confirmed in direction with no
source for its number. The anchor condition was earned by blind-lane plus
web-lane convergence, with the Rust tree's EWMA origin as the third branch.
The pacing condition was earned by a replay simulation through systedo-case's
own code: no gain under a mild weekday shape, and under a strong one 27-28
verdict flips against 3-10. One applied row is not-better (the condition),
one unapplied. Impact: 0 stale verdicts (8 unjudged pairs, 4 projects);
tracklight is a join miss.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| metric-forecasting | L2 | 1 application, 4 conditions, 0 refuted, 0 techniques | 0 stale (8 unjudged pairs, 4 projects) | 0 |

Source-class tally (post-hoc, this run):
- A forecasting textbook (FPP3) and a statistics journal's method paper
  carried every accepted condition on the fit and the range. A vendor pacing
  blog was used only as corroboration of a practice, never as the claim.
- The fleet tree outranked both lanes on the application side. The
  dense-zero-fill defect and burn-rate corroboration appeared in neither lane.
- A per-project search for forecasting code outside the dominant language
  found the second stack the map missed. A same-language join would not have
  cleared "single stack".

## Run dp-nss-0926 - narrative-scroll-surface, a next second stack and print routed

Curator dispatch on "single stack (react)". The whole fleet is React, so the
genuine second stack is its server-rendered half: `next`, where
`reveal-without-loss` happens and which had no application. ascent's `/about`
was the seam. Its shared wrapper was already fixed for the served frame, and
an evidence heatmap island was not: 41 inline `opacity:0` served, 40 of them
cells. Print was blank with scripts on (15/15 blocks, 40/40 cells), and a
toggling wrapper defeated walk-and-return (15/15 hidden after the walk). Six
claims were attacked. Two were confirmed and four conditioned, one of them a
golden-path flip (in-view-triggered motion is self-starting per WCAG
Understanding 2.2.2). The lane's "smoothing is never needed" did not survive
the tree: kp's station, documented as native-eligible, ran 0 scroll timelines
(instrument checked against a stylesheet `view()` control). So the rule
became "read the clock off the page". Applied: 3 better (2 code, 1
experiment), 1 better (simulation), 1 not-better (experiment). Impact: 1
stale verdict (personas).

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| narrative-scroll-surface | L3 | 1 application (next), 4 conditions + 1 golden-path flip, 1 code fix committed (unpushed), 0 techniques | 1 stale (personas 1); 36 unjudged pairs across 8 projects | 0 |

Source-class tally (post-hoc, this run):
- Standards text (W3C Understanding docs) carried the one golden-path flip,
  quoted verbatim. Library docs (Motion) and MDN carried two conditions, and
  every quote was re-fetched with curl before it landed.
- The fleet tree outranked the refutation lane once: the lane's documented
  native path did not engage in the real tree. Library documentation is a
  claim about a path, not evidence that a page is on it.
- The training-data lane independently reached the print override. It is the
  cheapest convergence lane in this bundle's UI subjects.
