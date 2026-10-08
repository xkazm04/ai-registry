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
- **Two machines (Fox, Wolf) develop this registry in parallel and both push to `origin/main`.** Fetch first; the local base has been hundreds of commits behind. Prefer the remote's version of any file the idea targets, and expect `gate --all` to be red on arrival from a landing that did not regenerate.
- Generated files follow their source in the SAME commit chain, and `changedAt` in the bundle indexes comes from git history: rebuild indexes AFTER the merge commit, or they stamp today's date on everything.
- A skill's own version is not visible to the running agent (the harness strips frontmatter); resolve it from the lane file or the installation receipt, never from the agent.

## Question taste

- The operator extends scope through "Other" with concrete fields (2026-09-21: provider/model/effort added to the run log) - leave room for it in scope questions rather than over-specifying.
- Recommendations were accepted in every question of two waves on an internal-tooling spark; keep the recommended option first and the trade-off honest.

## Skill improvement log

- 2026-09-21 skill-run-log: HEAD carried a stale knowledge index from an unrelated intake commit; gate --all was red before any change. PROMOTED to `## Repo law` and to the method (spark 1.7.0, Phase 0 step 4).
- 2026-09-21 skill-run-log: a clause re-stamp touches every skills/*/SKILL.md; the landing checkout held foreign WIP in one of them plus in catalog.json and the index. PROMOTED to the method (spark 1.7.0, Phase 4 go-gate).
- 2026-09-21 skill-run-log: two machines (Fox, Wolf) develop the registry in parallel; origin/main was 267 commits ahead. PROMOTED to `## Repo law` and to the method (spark 1.7.0, Phases 0 and 2).
- 2026-10-06 cloud-parallel-engine: origin/main itself was red on arrival (`check-public-paths`, 36 machine paths from 8270e5a4), so `gate --all` stops at step 6 and hides 19 steps; run the steps individually from gate.mjs's ALL list and compare the red one's count to the base. A cloud session cloning origin inherits the same red gate.
- 2026-10-06 cloud-parallel-engine: local main was diverged 3/11 from origin with a second contest 1.9.0 on each side; built in a short-path worktree off origin/main and landed as PR #13 instead of ff-merging. Second time the base was behind on arrival (see 2026-09-21) - already promoted to Repo law; this run confirms worktree-off-origin + PR is the landing path when local main diverges.
- 2026-10-05 idea-to-content-blog-pipeline: when the design writes files into a repo, scout that repo's file-type policy first (`.gitattributes` here says the registry holds no binary asset); two builders read the contract differently and only a real-gate smoke exposed it. A worktree for a consuming Next.js repo must sit inside its main checkout for the Turbopack-in-worktree recipe to work; a short external path (chosen for Windows path length) failed with `Invalid distDirRoot`. Write briefs and scripts with the file tool, not shell heredocs (three quoting failures).
