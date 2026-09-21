---
product: "ai-registry"
stack: "Node (builtins only, no package.json) scripts over markdown/JSON lanes"
vault: []                 # default <repo>/.spark (gitignored)
vault_subdir: Spark
context_map: ""           # none - target from top-level lanes: skills/, knowledge/, scripts/, docs/, librarian/, usage/, signals/
base_branch: ""           # detect: the checked-out working branch, not main - main trails it (2026-09-21: skill-llm-bench was 39 ahead, 0 behind)
active_runs_ledger: ""    # scripts/run-board.mjs holds live runs in $(git-common-dir)/run-board/runs/ - read it in Phase 0, do not register
locale_count: 1
---

## Gates

always:
- `node scripts/gate.mjs --all`
when scripts/ changed:
- `node --test "scripts/tests/*.mjs"`   (Node 22+ refuses a bare directory argument)
when skills/ changed:
- `node scripts/check-skills.mjs --since HEAD`
builder:
- `node scripts/gate.mjs --lane <lane>` for the lane the package touches

## Rituals

none.

## Repo law

- Read CONTRIBUTING.md and the lane doc under docs/ for the lane you touch. Scripts are builtins-only Node with a header comment that says WHY; exits go through scripts/lib/exit-codes.mjs.
- Generated files (catalog.json, knowledge/*/index.json, rules/*, .claude-plugin/marketplace.json) are regenerated, never hand-edited; a stamped `<!-- clause: -->` block is edited in docs/skill-clauses/ and re-stamped.
- The checkout hosts concurrent sessions: stage per file, never stash, never `git add -A`; builders never touch the index.

## Question taste

- The operator extends scope through "Other" with concrete fields (2026-09-21: provider/model/effort added to the run log) - leave room for it in scope questions rather than over-specifying.
- Recommendations were accepted in every question of two waves on an internal-tooling spark; keep the recommended option first and the trade-off honest.

## Skill improvement log

- 2026-09-21 skill-run-log: HEAD carried a stale knowledge index from an unrelated intake commit; gate --all was red before any change. Run the gate on a fresh worktree in Phase 0 so inherited red is known before builders report it.
- 2026-09-21 skill-run-log: a clause re-stamp touches every skills/*/SKILL.md; the landing checkout held foreign WIP in one of them plus in catalog.json and the index - compute that overlap at the go-gate, not at merge.
