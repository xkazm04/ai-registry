---
product: "ai-registry"
stack: "Zero-dependency Node ESM (.mjs) scripts + Markdown/JSON content lanes. No package.json, no lockfile, no test runner - `git clone` and a recent Node is the whole toolchain."
vault: ["C:/Users/kazda/kiro/ai-registry/.explorer"]
vault_subdir: Explorer
context_map: ""
coverage_context_source: ""
active_runs_ledger: "scripts/run-board.mjs"
---

# /explorer overlay - ai-registry

The registry is content plus the gates that keep the content honest. There is no app to
smoke, no UI, no i18n catalog and no test suite; what stands in for all of them is a set
of dependency-free Node checkers that CI runs on every push. So a sweep here is worth
running on `scripts/` (real code, real gates) and is usually the WRONG instrument for
`knowledge/` - a bundle's defects are editorial, and `/librarian`, `/deepen` and
`/intake` are the tools that measure them. Say so rather than surfacing prose items.

The run board is not a file: `node scripts/run-board.mjs` collates single-writer records
out of the git common dir, so parallel sessions in worktrees see each other. Claim before
Phase 4 and release in Phase 9g:

```
node scripts/run-board.mjs claim --skill explorer --source <area-slug> --run <id> --path scripts
node scripts/run-board.mjs check --run <id> <path>...     # exit 3 = a sibling holds it
node scripts/run-board.mjs release --run <id>
```

Exit 3 from `claim`/`check` is CONTENDED, not a failure - it is the answer. Re-scope to a
different area rather than writing into a live sibling's paths.

## Context sources

There is no `context-map.json` and no `CLAUDE.md` here. Read, in order:

1. `CONTRIBUTING.md` - the repo law: lane gates, the privacy rule, ASCII rules per lane,
   the pathspec-scoped-commit rule. This is the closest thing to a rules file.
2. `.github/workflows/knowledge.yml` and `.github/workflows/skills.yml` - the actual
   gate set, and the only place that records which checks are blocking and which report.
   The workflow comments carry the reasoning; they are worth reading, not skimming.
3. `docs/rkb-profile.md` - the four-layer bundle contract the `knowledge/` lane obeys.
4. `docs/skills-lane.md` - the skill contract `scripts/check-skills.mjs` enforces.
5. `librarian/index.md` - what the maintenance lane already knows is owed.

## Area menu

1. `scripts/` generators - `build-*.mjs` + `scripts/lib/` (the `--check` / rewrite pairs)
2. `scripts/` gates - `check-*.mjs` (what CI blocks and reports on)
3. `scripts/` fleet lane - `fleet-*.mjs`, `link-registry.mjs`, `lib/projects.mjs`
4. `scripts/` research + librarian lane - `research-*.mjs`, `librarian-scan.mjs`,
   `leads-collect.mjs`, `run-board.mjs`, `compression-scan.mjs`
5. `skills/` lane - the shared skills every fleet project links to
6. `.claude/skills/` - the registry's own maintenance skills (/forge /deepen /librarian
   /intake /harvest /reconcile)
7. `docs/` - briefs, the RKB profile, the lane docs
8. Cross-lane - CI workflows, `CONTRIBUTING.md`, `README.md`, `registry.yaml`,
   `catalog.json`, `projects.json` and whether they still describe the tree

## Gates

There is no `package.json`, so nothing is auto-detectable. Run what the lane matrix in
`CONTRIBUTING.md` names, by what the change touched:

| Touched | Run |
| --- | --- |
| `scripts/` (a generator) | that script's own `--check`, then `node scripts/build-catalog.mjs --check` |
| `scripts/` (a gate) | run the gate itself; a gate that changes verdicts must be run over the whole tree, not one file |
| `skills/` | `node scripts/check-skills.mjs && node scripts/build-marketplace.mjs --check && node scripts/build-catalog.mjs --check` |
| `knowledge/` | `node scripts/check-bundles.mjs && node scripts/build-index.mjs --check && node scripts/build-knowledge-rules.mjs --check && node scripts/build-catalog.mjs --check` |
| `usage/` | `node scripts/check-usage.mjs && node scripts/build-catalog.mjs --check` |
| `signals/` | `node scripts/check-signals.mjs` |
| `docs/`, `README.md`, workflows | `node scripts/check-readmes.mjs` |

**Order matters and is not a style preference:** `build-index.mjs` before
`build-catalog.mjs`, because the catalog's content hash covers the index. The reverse
order writes a catalog that is stale the moment it lands.

**Never `cmd --check | tail`.** A pipe discards the exit code, so a stale generated
artifact reads as fresh and CI catches it instead of you. Capture the status directly.

## Repo law

- **Pathspec-scoped commits, always.** This checkout is shared with parallel agent
  sessions. `git add -A`, `git add .` and `git add -u` are forbidden - they sweep a
  sibling session's in-flight work into your commit under your authorship. Stage the
  exact paths, then `git diff --cached --stat` in the SAME invocation and check the list
  is only yours before committing.
- **`git commit -- <paths>` commits the WORKING TREE, not the index.** When you have
  staged a partial hunk of a shared file, commit without a pathspec or you silently ship
  the whole file.
- **The privacy rule (CONTRIBUTING.md) is a hard gate.** No machine paths, no secrets, no
  repo-identifying pointers - not in content, not in an example, not in a fixture.
  Aggregates are published; pointers stay in gitignored `.local` overlays.
- **ASCII where it bites.** `practices/` and `memory/` are ASCII-only; in `skills/`,
  frontmatter is ASCII and fenced code carries no Unicode lookalike punctuation (a smart
  quote or en-dash inside a command breaks it when pasted); `knowledge/` is UTF-8 prose.
- **A skill edit needs a `version:` bump plus a `LESSONS.md` entry**, and
  `check-skills.mjs --since <ref>` enforces it. Never edit inside a stamped
  `<!-- clause: ... -->` block - change `docs/skill-clauses/` and re-stamp with
  `node scripts/apply-skill-clauses.mjs`.
- **Generated files are not editable by hand:** `rules/`, `catalog.json`,
  `.claude-plugin/marketplace.json`, each bundle's `index.json`,
  `librarian/fleet-map.*`. Change the generator or the source, then regenerate.
- **Zero dependencies is a design constraint, not an accident.** Do not propose a
  library. The gates must run on a bare `git clone` plus Node.
- LF endings, no trailing whitespace.

## Baseline exclusions

- **Prose in `knowledge/`.** Subject quality, citation currency and coverage debt belong
  to `/librarian`, `/deepen` and `/intake`, which measure them properly. Only a
  *structural* defect in a bundle (a broken four-layer contract, a leaked evidence key)
  is an explorer item.
- **The `docs/subject-proposal-*.md` pile.** Those are deliberate intermediate artifacts
  awaiting triage, not clutter.
- **Duplication across `check-*.mjs`.** The gates are intentionally standalone and
  dependency-free; a shared helper that couples two gates is usually a regression, not a
  cleanup. Extracting one is `m` at minimum and needs the conversation.
- **`.claude/worktrees/`** - live worktrees of parallel sessions. Never an item, never a
  read target, never staged.

## Smoke

There is nothing to run. The gates ARE the verification: a script change is proven by
running that script over the real tree and reading its output, not by inspection. State
plainly in the run record which gate output backed each item, and say when an item was
only reasoned about.

## Skill improvement log

- 2026-09-04: first run in this repo. Overlay authored from CONTRIBUTING.md + the two CI
  workflows; no context map exists, so the area menu above is hand-cut by lane.
