---
product: "ai-registry"
stack: "content registry - markdown lanes (knowledge, skills, practices, memory, usage, signals, librarian) gated by zero-dependency Node .mjs scripts; no package.json, no runtime"
vault: []                      # none declared -> <repo>/.perfect/ (gitignored: the checkout hosts concurrent agent sessions)
vault_subdir: Perfect
base_branch: main
wave_size: 3
lot_caps: {}
pool_target: 10
round_shape: round             # single-owner registry: propose 1-3 contexts, gate, build the same session
cooldown_rounds: 2
commit_format: "<lane>(<context>): <title>"   # matches the repo's history: skill(name): ..., knowledge(subject): ..., scripts: ...
context_map: .perfect/context-map.json        # PROVISIONAL - one context per top-level directory, written by /perfect init 2026-09-04
active_runs_ledger: ""
locale_count: 1
---

# /perfect overlay for ai-registry

Written by `/perfect init` on 2026-09-04. Everything below was derived from THIS repo
(CONTRIBUTING.md, `.github/workflows/*.yml`, `.gitignore`, `docs/skills-lane.md`), not
imported from another project's overlay.

## Gates

- always: `node scripts/check-skills.mjs && node scripts/apply-skill-clauses.mjs --check && node scripts/build-marketplace.mjs --check && node scripts/check-bundles.mjs && node scripts/build-index.mjs --check && node scripts/build-knowledge-rules.mjs --check && node scripts/check-usage.mjs && node scripts/check-signals.mjs && node scripts/build-catalog.mjs --check`
- when skills/ changed: `node scripts/check-skills.mjs --since <base sha>` (version-bump discipline) and `node scripts/check-skill-triggers.mjs` (advisory)
- when knowledge/ changed: regenerate in ORDER `build-index.mjs` -> `build-knowledge-rules.mjs` -> `build-catalog.mjs`, then the `--check` forms
- slow: none - every gate runs in seconds, no install step
- builder: run the lane gate for the lane you touched (CONTRIBUTING.md "Lane gates" table), always ending with `node scripts/build-catalog.mjs --check`; for `scripts/` changes run every script you touched against the real tree and paste the exit code

## Class B

- `skills/<name>/LESSONS.md` - append-only, one dated block per run
- `librarian/applied.md`, `librarian/inbox.md`, `librarian/watchlist.md` - append-only ledgers
- `.personas/memory-outbox.jsonl` - append-only

## Class C

- Generated views: `catalog.json`, `.claude-plugin/marketplace.json`, `knowledge/*/index.json`, `knowledge/*/index.md`, `rules/ai-registry-*.md`, `librarian/fleet-map.json`, `librarian/fleet-map.md`, `librarian/upstream.md` - builders REPORT what needs regenerating; the Director runs each builder script once at quiescence
- `.perfect/context-map.json` and this overlay
- The git index: this checkout hosts CONCURRENT agent sessions (explorer, intake, scan-sweep edits observed live on 2026-09-04) - never a branch switch, never `git add -A`, `git commit --only <paths>` always

## Repo law

- Read `CONTRIBUTING.md` first. Content, not running code: gates are zero-dependency Node; `git clone` + Node 20 is the whole toolchain. Never add a dependency or a package.json.
- Privacy: no machine paths, secrets, or repo-identifying pointers anywhere tracked. `usage/` and `signals/` carry counts and verdicts only. Evidence stays in gitignored `.*.local.*` overlays.
- Lane depth is a contract: `skills/<name>/SKILL.md`, `practices/<slug>/PRACTICE.md`, `memory/<kind>/<slug>.md` are matched at exactly 3 segments; `knowledge/` is nested with max 10 child dirs per level. Never add a category folder to a fixed lane.
- A skill body is generic - no project name, path, vault or gate command inside `skills/*/SKILL.md`; project bytes go to that project's overlay. Any SKILL.md edit bumps `version` and appends a `LESSONS.md` block recording the version USED. Never edit inside a stamped `<!-- clause: ... -->` block; edit `docs/skill-clauses/` and re-stamp.
- Generated files are regenerated in order (`build-index` before `build-catalog`); a conflict in a generated file is resolved by regenerating, never by taking a side.
- Conventions: LF, no trailing whitespace; ASCII frontmatter and ASCII fenced code in `skills/`; `practices/` and `memory/` ASCII-only; vendor-neutral wording.
- Commits: pathspec-scoped subject in the lane's voice (`skill(<name>): ...`, `knowledge(<subject>): ...`, `scripts: ...`, `docs: ...`); docs updated in the same commit as what they describe. Push only when the operator says so.
- Out of scope for builders: `CODEOWNERS`, `registry.yaml`, `.ascent/`, `practices/supply-chain-security/`, `.github/workflows/*` action pins.

## Context sources

- The queue source is the provisional map at `.perfect/context-map.json` (one context per top-level directory). No external scan has produced a `context-map.json` for this repo; `.personas/registry.yaml` declares Personas management but the app's context name set for this repo is unknown - outbox nodes use the provisional names and may count toward nothing until the app maps them.

## Smoke

- No dev server. A smoke pass is: run the `always` gate chain on a clean tree, then `node scripts/librarian-scan.mjs --top 10` and `node scripts/check-currency.mjs` and read the reports for regressions.

## Opportunity arcs

- Single-owner doctrine: links and present-context beat plugins and consult-only; the registry is the fleet's one home per skill name.
- `docs/skills-lane.md` names two adopted-direction tiers not yet standing: deterministic script tests beside lane scripts, and behavioral evals.
- Open thread: four lane skills exceed the 500-line body guidance (architect, research, friend, explorer); a progressive-disclosure pass is owed.
- Open thread: the signals lane carries stack + consults only; `resolved/moved/gone` citation verdicts need a producer.

## Vetoes

- Do not propose a plugin/marketplace-pinned distribution for the fleet (settled: links, single-owner doctrine).
- Do not propose adding a package.json/runtime dependency to the gates.
- Do not propose category folders in fixed-depth lanes.

## User taste

- Outcome-value over cosmetic churn; a direction must name the moment an operator or agent session is helped.
- Measured claims: a number is not a finding until its mechanism is read; state predicted effects as hypotheses to measure.
- Thin, honest slates win; "near-polished, N residuals" is a valid verdict.

## Skill improvement log

- 2026-09-04: overlay scaffolded by init; defaults in force except `round_shape: round`, `commit_format`, `context_map`.
