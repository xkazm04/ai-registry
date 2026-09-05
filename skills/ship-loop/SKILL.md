---
name: ship-loop
description: "Milestone-driven ship-readiness loop for any app repo, resumable across sessions. Boots by profiling the stack, running the verification gate once, and fanning out read-only audit lenses into a 9-dimension scorecard plus an append-only numbered backlog; when the repo's overlay declares value journeys, a value ledger (one readiness light per journey) sits above the scorecard, every item carries a journey tag, and milestones are picked as the next slice of one journey. Work runs in user-gated milestones (CP checkpoints, single-keystroke questions, an AFK protocol with provisional re-askable picks); one backlog item = one atomic pathspec-scoped commit, premise-checked against current code first; each milestone is certified by the repo's ordered gate (typecheck/lint/tests/build sequentially, slow e2e last, typecheck after any build that rewrites generated types). State lives in .claude/ship-loop/ of the consuming repo; project specifics come from .claude/ship-loop/config.md and the loop runs on generic defaults without it. Invoke with /ship-loop (resume), /ship-loop boot (fresh loop, prior state archived), /ship-loop gate | audit | recall."
category: workflow
memory: project
version: 2.2.1
tags: loop, ship-readiness, scorecard, backlog, milestones, gate, checkpoints, value-ledger
argument-hint: "[boot|gate|audit|recall]"
---

# Ship Loop — milestone-driven ship readiness

A permanent loop that answers one question run over run: **how close is this app to its ship bar, and what is the highest-impact next batch of work?** It is *evaluative* (is the product good enough?) layered on *verification* (does the gate pass?). It is not a per-commit CI gate — it is a deliberate, memory-backed pass on a cadence. Any session can resume it: the state files are the single source of truth, and this file is the procedure.

**The flow:** BOOT → GATE → AUDIT (parallel lenses) → value ledger (if journeys are declared) + 9-dim scorecard → append-only backlog → CP0 → milestones (each: work → gate → CPn).
**Governing rule at every fork:** auto-decide reversible work and log it as re-askable; defer existential and product decisions to the user at a checkpoint.

> Origin note: the loop ran Boot→M7/M8/M9 in several repos during 2026-07 with no skill definition; it was codified from those precedents, grew a value-journey axis in one repo (2.0), and is generalized here (2.1.0). Project facts that used to live in the body — gate commands, use-case tables, LOC rules, billing/auth dimension names — now live in each repo's overlay.

## Project overlay

Read `.claude/ship-loop/config.md` at the start of every run (it sits beside the loop's state files). It is the only hand-maintained file in that directory. **The loop runs with no overlay present** — on generic defaults listed below — and Boot drafts one from what it finds in the repo for the user to confirm at CP0.

| Key (a `## ` section in `config.md`) | Carries | Default when absent |
|---|---|---|
| `Stack` | One-line stack profile (framework, backend, test runners, external bridges). Fixes which gate steps and lenses make sense. | Inferred at boot from manifests/scripts; written into `state.md` harness notes. |
| `Cadence` | `milestone` (batch → gate → CP), `continuous` (proceed by severity, stop only for blockers/product calls), `per-item`. | `milestone`; asked at CP0. |
| `Gates` | **Ordered** table `step / command / ratchet / when`. Order is load-bearing (see Gate). Include slow steps (e2e, tours) last with their trigger condition, and any convention checks (LOC limits, docs-in-sync) that certify a milestone. | Derived from the repo's own scripts: typecheck → lint (0 errors) → unit tests → build → e2e if a script exists; all sequential. |
| `Value journeys` | Optional table `tag / journey / what the loop certifies / owner persona / docs`. Declaring it turns on the value ledger and journey tags. | None — the loop runs the 9-dimension scorecard alone; dimension 9 is the value case. |
| `Dimensions` | Renames/re-points of the 9 defaults (e.g. dimension 5 re-pointed from billing to a product's real trust surface; dimension 9 retired into the ledger). | The default names below. |
| `Conventions` | Repo rules the loop must respect while executing: file-size limits, context-map upkeep, framework docs to read first, docs-as-source-of-truth, parallel-session ledger path, whether the state dir is tracked or gitignored, theme variants to verify, push policy. | Only this skill's invariants. |
| `Lenses` | Optional extra/renamed audit lenses and their dimension mapping, plus scoping hints (context map, size of the codebase). | The seven default lenses in `${CLAUDE_SKILL_DIR}/references/lenses.md`. |

Full template with examples: `${CLAUDE_SKILL_DIR}/references/overlay-template.md`.

## State files (in `.claude/ship-loop/`, repo root)

| File | Contract |
|---|---|
| `config.md` | The overlay above. Hand-maintained; the loop proposes edits at CPn, never rewrites it silently. |
| `state.md` | Current truth: ship bar, **value ledger** (when journeys are declared: one row per journey, 🔴/🟡/🟢 + the one sentence that says what the journey can and cannot do today + next slice + linked items), scorecard (every cell with evidence and top gaps → backlog #), milestone status, checkpoint history, harness notes. Rewrite freely; keep it one screen of load-bearing facts. |
| `backlog.md` | Item table `# / status / [journey] / dimension / size / description` (journey column only when journeys are declared). **Numbering append-only — never renumber.** Statuses: ☐ todo · ◐ in progress · ☑ done · ✕ cut. Impact-ranked (frequency × reachability × cost), not by severity word; inline `[C]/[H]/[M]/[L]` severity is allowed. |
| `journal.md` | Append-only, one line per event (item done w/ commit SHA, CP resolution, gate result, root-caused saga). Never edit past lines. |
| `decisions.md` | CP answers from the user + auto-decisions taken while AFK (each marked "pending user review at CPn"). |
| `value-case.md` | Dimension-9 (value & market) synthesis. Written once by the value lens, corrected only with code-verified evidence. When journeys are declared it is superseded by the ledger — keep it as a pointer. |
| `archive-*/` | Frozen state of previous loops (different app or restarted loop). Read-only. |

Exact formats (backlog header, journal verbs, decisions sections): `${CLAUDE_SKILL_DIR}/references/state-formats.md`. Legacy location: some repos kept this state in a `state/` directory next to a project copy of the skill — on first resume, move it to `.claude/ship-loop/` once and journal the move.

## Two axes: the value ledger (optional) and the 9-dimension scorecard

**Scorecard (the gate axis).** Default dimensions: 1-Build & types · 2-Functional completeness (things actually *produce*, not stubs; claims honest vs docs) · 3-Tests (suite green + coverage of load-bearing paths) · 4-Simulated UAT / e2e · 5-Value capture (billing, tiering, packaging — whatever turns the product into something paid for or installed) · 6-Security (auth boundary, secrets, unsafe input paths) · 7-UX/UI polish (shared primitives, a11y floor, reduced motion) · 8-Ops (CI, release/deploy, signing/updater, migrations, docs in sync) · 9-Value & market. Each is 🔴/🟡/🟢 in `state.md`; every cell carries **evidence** (`file:line`, gate output, or a lens verdict) and its top gaps → backlog #. Dimensions 4 and 9 run as **lenses** (audit passes that emit backlog items), not fixed at boot. A dimension with no surface in this product (no auth, no billing) is **re-pointed at the product's nearest real trust or value surface** in the overlay — never scored 🟢 by vacancy. Hold every dimension as a **ratchet**: a green that goes red files a backlog item.

**Value ledger (the value axis — only when the overlay declares journeys).** A dimension-only scorecard optimizes hygiene while the product's actual jobs stay red. When the overlay lists the journeys the product exists for, `state.md` carries one ledger row per journey: 🔴 journey broken/absent · 🟡 runs but a load-bearing step is missing, dishonest, or manual · 🟢 runs end-to-end, evidence-backed, tested. Each row names the *next slice* (the smallest change that moves the light) and links its backlog items. Every backlog item then carries a journey tag — one of the declared tags or `hyg` (hygiene with no direct journey effect) — and **milestones are picked per journey**: "the next coherent slice of one journey", not a grab-bag by dimension; hygiene items are picked when they block a slice or when the gate is red. Dimension 9 folds into the ledger (the value case *is* the journeys). Re-judge the ledger with a **journey lens** at every checkpoint: walk the journey as its owner persona and ask "can they complete the loop today, honestly?" — reuse the repo's UAT characters when it has a `uat/` overlay. Declaring journeys on a running loop means a one-time tagging pass on the existing backlog at the next resume, journaled.

## Phases

### Boot (`/ship-loop boot` — only for a fresh loop)
1. Archive any existing `.claude/ship-loop/` contents (except `config.md`) to `.claude/ship-loop/archive-<slug>/`.
2. Profile the stack. If `config.md` is absent, draft it: gate commands from the repo's scripts/manifests, the default dimensions, the conventions CLAUDE.md/AGENTS.md already state. Run the gate once for a baseline.
3. If journeys are declared, run the **journey lens** per journey first (walk it end-to-end against the current code; the overlay's docs list the known holes) → ledger rows + tagged items.
4. Fan out the audit lenses — **one read-only subagent per lens**, each returning a 🟢🟡🔴 verdict + top 3-6 gaps with `file:line` evidence + one strength worth protecting, scoped tightly ("verdict + top gaps + evidence, **do not fix anything**, be concise"; use the repo's context map to target files). Seed `backlog.md` + `state.md`.
5. **CP0**: present ledger (if any) + scorecard + backlog; ask four questions, one at a time (AskUserQuestion): ship bar (what *done* means; default with journeys: every light 🟢), cadence, first milestone cluster or journey, UAT depth. Confirm the drafted `config.md`. If AFK, record provisional picks in `decisions.md` and proceed on the least-destructive batch.

### Resume (default)
1. Read `state.md`, then `backlog.md` and the tail of `journal.md`. Do NOT re-audit what the scorecard already scores — but if many commits have landed since the last journal entry, re-run the gate and premise-check open items before trusting the scorecard.
2. Reconcile against reality before proposing anything: `git status` + branch vs the default branch. Parallel sessions ship commits outside the loop (it has happened repeatedly) and leave large uncommitted WIP that is not the loop's; backlog premises may have moved.
3. If the repo keeps a parallel-session ledger (overlay: conventions), register there.
4. Continue: an in-flight milestone → keep executing; a completed one → run/finish its gate; gate green → next checkpoint.

### Checkpoint (CPn — before each milestone)
- Present: ledger delta (if any), scorecard delta, recommended next milestone (a coherent batch of backlog items, usually 3-8 — by theme such as a test-pin batch, an ops unbrick, product decisions; or, with journeys, one journey's next slice with hygiene items only as blockers), and any product decisions the work needs. One question at a time, single-keystroke answerable. Re-ask deferred questions; confirm auto-decisions.
- **AFK protocol**: ask twice ~60s apart; if silent, record a provisional pick in `decisions.md` (least-destructive option, marked for re-ask), avoid boot-path and product-call edits while AFK, and never commit destructive changes on a provisional. Out-of-scope boundaries in the repo's CLAUDE.md (anything the user must push, destructive git, external publishing) are **never** crossable via timeout — explicit consent required.
- Under **continuous cadence**, proceed down the backlog by severity without a CP ask; stop only for blockers or product decisions.

### Execute (milestone)
- One backlog item = one atomic commit, referenced by SHA in `journal.md`. Keep each change small and reversible. Fan out parallel subagents only for disjoint paths.
- **Never bundle the loop's changes with foreign in-flight WIP.** Stage only your paths (one `git reset -q && git add <paths>` invocation) and commit with a pathspec (`git commit -m "..." -- <paths>`); never `git add -A` in a shared tree. If the tree is a WIP soup, defer the commit decision to the user and journal it. Treat any modified file you did not touch as live WIP.
- Defer any item whose files are another session's hot area — mark it in `backlog.md` with the reason, don't fight over files.
- **Premise-check before executing.** Audits overstate ("permanently disabled" that wasn't, a mock that was already real), backlogs go stale (an item already shipped; a "deleted route" that was context-map drift), and parallel sessions close items out-of-band — verify the claim against current code first; correct the backlog item if the premise moved.
- Respect the overlay's conventions (file-size limits — extract before committing an over-limit file; keep the context map accurate; read the framework's bundled docs before writing framework-specific code when the version is newer than training data; docs-in-sync in the same batch).

### Gate (after every milestone — certifies it)
1. Run the overlay's ordered `Gates`. Default order: typecheck · lint (0 errors; a warning baseline is out of scope unless the overlay says otherwise) · unit tests · build · slow e2e/tours last.
2. **Sequential, never concurrent.** Steps that share generated files (schema generation, a build that rewrites generated type files) read an inconsistent tree when overlapped, and CPU contention alone blows e2e bridge windows (bitten twice in one repo). **When the build rewrites generated type files, run typecheck AFTER the build completes** — a concurrent typecheck reports spurious route/type errors that a clean rebuild-then-typecheck disproves (bitten at boot and M2 in one repo). Test-only diffs may skip the build; typecheck then runs against the last build's generated types.
3. A second language touched (e.g. a native backend) → its check + lint + the touched modules' filtered test suites; full-suite failures are triaged pre-existing vs regression — only regressions block.
4. UI touched → e2e/tours, **serialized after the suites**; pre-warm the e2e target AFTER committing; retry once on a settled machine before deeper diagnosis; verify new surfaces in every theme/variant the overlay lists. Test-only diffs may justified-skip e2e — record the justification. Full UAT runs are backlog items (dimension 4), not per-milestone.
5. Overlay convention checks (e.g. a file-size check on touched files) must return zero rows.
6. **Run the gate before any push.** Parallel sessions pushing ungated commits to the default branch is the loop's known failure mode (CI red all day in one repo). The verification gate is the overlay's commands — a product feature that happens to be called "gate" is not it.
7. Record the gate line in `journal.md`; flip milestone ☑ in `state.md`; update the scorecard **and re-judge the touched journey's light** (a milestone that doesn't move or protect a light should say so).

### Wrap (session end)
Update `state.md` + journal (commit SHAs), leave no uncommitted loop work (or an explicit journaled deferral of the commit decision), close your parallel-session ledger entry if the repo keeps one. The next session resumes from files alone.

### Other verbs
- `/ship-loop gate` — run the gate alone, journal the `GATE(...)` line, update dimensions 1 and 3 only.
- `/ship-loop audit` — re-run the lenses without archiving; new findings append as new numbers; a closed finding that reappears is a **regression**, journaled as such.
- `/ship-loop recall` — read the state files and report the trajectory (which dimensions/lights moved run-over-run, open/closed/regressed items, current ship bar + cadence, top of the backlog) — no new scan. A light that moved is the headline.

## Invariants

- **User owns product calls.** Ship bar, scope narrowing, feature hide/delete, pricing/positioning, privacy boundaries (what may leave a user's machine), security trade-offs are CP questions — never auto-decided, only provisionally deferred.
- **Journeys over dimensions** (when declared). A green scorecard with a red ledger is not progress; report the ledger first.
- **Honesty over green.** A gate that passes while the claim is unverified is not done — distinguish "code-verified" from "subagent-claimed" in every journal line (one repo's cold-start corrections exist because this was violated once).
- **Grounding.** No scorecard cell or finding without evidence (`file:line` / gate output / observation). Never fabricate a benchmark, a test result, or a "done". A claim about an external system (a bridge, a device, a service) is not done until an observation confirms it — a green status that isn't derived from that system's truth is a finding, not a pass.
- **Lenses emit items, items get numbers, numbers never change.** With journeys declared, every item carries its tag; untagged items are a boot/resume bug, not a category.
- **Impact over label.** Rank by frequency × reachability × cost, not by the severity word.
- **Shared-tree hygiene.** Re-read before edit; targeted `git add`; pathspec commits; the user pushes unless the overlay says otherwise.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"ship-loop@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/ship-loop/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - ship-loop` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/ship-loop` in a consuming repo is a symlink to `<registry>/skills/ship-loop` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/ship-loop` and `git -C <registry> commit -m "skill(ship-loop): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/ship-loop/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/ship-loop` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
