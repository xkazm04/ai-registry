---
source: github:NVIDIA-Omniverse/PhysX
kind: repository
url: https://github.com/NVIDIA-Omniverse/PhysX
title: A physics-engine monorepo whose agent-facing runtime ships the tuning guides the engine's own docs lack
author: NVIDIA-Omniverse
words: 453
words_in_tree: 12738
extracted: 11
accepted: 4
declined: 0
leads: 3
already_covered: 1
untriaged: 0
dispatched: 4
applied: 1
shipped: 0
run_id: px1014
siblings: 3
fetches: 0
rescan_when: a release lands after 6dc53585 (2026-10-14); or 8 weeks elapse (2026-12-09)
---

# Operating guides and a requirements lane, behind a README that is an index

**Class:** vendor repository over a hosted-binary-plus-source runtime. The README is
453 words; the first-party prose swept is about 12,700 words (five tuning guides, the
population findings, the overview) plus the requirements and decision records under
`plc/`. Expected yield per the class: the docs rules page and the types. Here the yield
was the tuning guides (a derivation method, not claims) and the requirements lane.
Not swept: the 50,000-word SDK changelog, `physx/source`, `blast/`, `flow/`, the
simulation-setup pages, the 80-odd requirement files beyond two read. Live siblings at
start: 3 (harvest on software-engineering memory/quality-gates/accessibility; two intake
runs on other repositories), none holding game-production.

Declared focus from the scorecard (apply stage) applied: a seam was found in a fleet
project and a paired experiment run; no project change shipped because the project
already complied.

## Design record (ovphysx and its guides)

Six entries, in the handoff `librarian/handoffs/2026-10-14-native-runtime-contracts.md`
(D1-D6, anchors verified: 5 of 5 held). Routing count written there: physics tuning
clears the XL trigger (five techniques, one home, corpus search returned zero for the
spring vocabulary); the runtime-contract cluster is partial/unverified and spans three
subjects, so it is banked as a scout brief, not forged.

## Candidates and triage

| # | Lane | Shape | Eff | Candidate | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | subject | XL | rigid-body-simulation-stability (5 techniques) | new-subject | real gap | 3+1/1/3 (E4) | **forged in session**, `game-production/engine-integration` |
| 2 | K | technique | M | spring by frequency and damping ratio | (in 1) | real gap | - | landed as technique 1; primary corroborates, overrides the guide on saturation |
| 3 | K | technique | M | triage by stiffness source (the guides contradict each other on which lever is first) | (in 1) | real gap | - | landed |
| 4 | K | technique | M | bound actuation by lightest body | (in 1) | real gap | - | landed; tripwires replaced by a derived check |
| 5 | K | technique | S | cloned environments share unbounded geometry | (in 1) | real gap | - | landed; N-squared is inference, stated as such |
| 6 | K | technique | S | prove the class, then filter the pair | (in 1) | partial | - | landed standalone |
| 7 | K | amendment | S | pin a known divergence with a ledger; an unobserved defect is documentation (D5) | extends seams-and-adapters | partial | - | **landed in the forge wave** (fg1014) as a section of `module-design/seams-and-adapters`; host past the ceiling, so no new file |
| 8 | K | technique | M | a bounded wait leaves the operation unconsumed (D2) | new-technique | real gap | - | **landed in the forge wave**: `background-jobs/timeout-is-a-status-not-a-consumption` + cpp application |
| 9 | K | technique | M | generation-stamped handles, stale check before kind check (D3) | new-technique | thin | - | lead: scouted NEW, but no subject in the corpus has a native-API-surface home (nearest, `language-runtime`, is about embedded engines) |
| 10 | K | amendment | S | unset delegates the choice to a dependency (D1) | extends misconfiguration-never-reaches-a-fallback | partial | - | **landed in the forge wave** as a section + cpp application; hosts past the ceiling |
| 11 | K | technique | S | cost lands under the wait, not the enqueue (D4) | new-technique | thin | - | lead: scouted NEW but one sentence of content; `perf-regression-gating` is silent on it |

Vetoes: none fired. V1 checked: engine-integration had 9 subjects, now 10 (full).
Forge wave (run fg1014, 2026-10-14): scouts A/B/C read the implementation and the
neighbours' prose; three workers on three disjoint folders; every anchor on the two new
applications verified (26/26 and 11/11). Rows 7, 8 and 10 landed; rows 9 and 11 are
leads, not declines. D6 (requirement files with criterion IDs) is a lead too: 66 files,
no checker in the tree, so only the convention can be described.

Leads (return condition): D3, "when a second source with a handle-based API appears, or
a subject for native API surfaces exists"; D4, "when a second source shows enqueue-versus-
wait attribution beyond one sentence"; D6, "when a checker that reads the criterion tags
is found (the tree's own doc points at a file not in the clone)"; the changelog, "when a delta re-scan reads the SDK
changelog for failure modes recorded as revisions".

Convergence worth recording: the vehicle-model integrator in a fleet project arrived
independently at the same two rules the guides state (exact exponential discretization,
and a correction clamped to what one step can absorb), which is why the apply row
shipped nothing.

## Apply (Phase 7.5)

One row, `experiment`, project `firetv-deathride`. Seam chosen to falsify "an exact
discretization needs no further step-size care": five step sizes (120, 60, 30, 20, 15
Hz) against a 240 Hz reference over a 2 s full-lock corner, through the project's own
gradle gate (scratch test, deleted; tree verified clean). Target: stability under a
coarse step; floor: none declared for the project (no change proposed). Result: finite
at all rates (the technique's stability rule holds), error first-order in the step
(position error 0.77 m at 60 Hz, 3.7 m at 15 Hz), existing step test covers
straight-line only. Verdict `unmeasurable` for a change (the project is already the B
arm); return condition: a project variable-step path, or a yaw-path convergence
assertion, which would make the first-order error a gate. The measured table is carried
in the kotlin application.

Directions (7.6): 0 proposed. No managed project runs a constraint solver; the forces
(stiff drives, closed loops, cloned environments) are not ones any `scope.does` admits.
Gate (7.7): skipped, nothing proposed.
