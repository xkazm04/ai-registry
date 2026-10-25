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
- `node scripts/check-skills.mjs --since origin/main`   (branch commits + dirty + untracked; the range the push carries)
when recipes/ changed:
- `node scripts/check-recipes.mjs --since origin/main`
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
- **Write every file - script, test, brief, edit helper - with the file tools, never a shell heredoc.** Backslashes are eaten (`\b`, `\\t`, regex escapes). Promoted 2026-10-25 after the third and fourth sightings (2026-10-05 x3; 2026-10-25: the Director's edit helper and two sweep round-agents' test literals).
- **A generated file's field is a fleet contract, not an in-repo one.** Before dropping or renaming a field of index.json / catalog.json / rules, grep the consumers OUTSIDE this repo (personas reads `laws[].techniques` in src-tauri/src/commands/infrastructure/registry_galaxy.rs). An in-repo-only grep said "no consumer" on 2026-10-25.
- **context-map.json has a guard test (scripts/tests/context-map.test.mjs): every new code file must be claimed in the SAME commit.** Regenerate the map from the index being committed, not from the tree, or the guard passes on an untracked file and goes red once it lands.

## Question taste

- The operator extends scope through "Other" with concrete fields (2026-09-21: provider/model/effort added to the run log) - leave room for it in scope questions rather than over-specifying.
- The operator may answer wave 1 with "do all of it, then run the follow-up skills, I delegate approval, run overnight" (2026-10-25). Make wave 1 decision-complete (scope, engine, proof bar, autonomy), because there may be no wave 2. Decide the rest as Director and record each decision as such.
- Recommendations were accepted in every question of two waves on an internal-tooling spark; keep the recommended option first and the trade-off honest.

## Skill improvement log

- 2026-09-21 skill-run-log: HEAD carried a stale knowledge index from an unrelated intake commit; gate --all was red before any change. PROMOTED to `## Repo law` and to the method (spark 1.7.0, Phase 0 step 4).
- 2026-09-21 skill-run-log: a clause re-stamp touches every skills/*/SKILL.md; the landing checkout held foreign WIP in one of them plus in catalog.json and the index. PROMOTED to the method (spark 1.7.0, Phase 4 go-gate).
- 2026-09-21 skill-run-log: two machines (Fox, Wolf) develop the registry in parallel; origin/main was 267 commits ahead. PROMOTED to `## Repo law` and to the method (spark 1.7.0, Phases 0 and 2).
- 2026-10-06 cloud-parallel-engine: origin/main itself was red on arrival (`check-public-paths`, 36 machine paths from 8270e5a4), so `gate --all` stops at step 6 and hides 19 steps; run the steps individually from gate.mjs's ALL list and compare the red one's count to the base. A cloud session cloning origin inherits the same red gate.
- 2026-10-06 cloud-parallel-engine: local main was diverged 3/11 from origin with a second contest 1.9.0 on each side; built in a short-path worktree off origin/main and landed as PR #13 instead of ff-merging. Second time the base was behind on arrival (see 2026-09-21) - already promoted to Repo law; this run confirms worktree-off-origin + PR is the landing path when local main diverges.
- 2026-10-05 idea-to-content-blog-pipeline: when the design writes files into a repo, scout that repo's file-type policy first (`.gitattributes` here says the registry holds no binary asset); two builders read the contract differently and only a real-gate smoke exposed it. A worktree for a consuming Next.js repo must sit inside its main checkout for the Turbopack-in-worktree recipe to work; a short external path (chosen for Windows path length) failed with `Invalid distDirRoot`. Write briefs and scripts with the file tool, not shell heredocs (three quoting failures).
- 2026-10-14 dicklesworthstone-research-series: a run-board claim lapses during a long wait on background builders (no beat, reaped; `list` showed no live runs mid-run). Beat the claim when dispatching builders that run over an hour, and re-claim before the landing phase.
- 2026-10-14 dicklesworthstone-research-series: builder briefs carried five premises taken from memory notes or a worker's study that were stale (an incident's cause, transcript retention, which project folders commit here). Check each premise against its record at brief time; first sighting for spark (intake's scorecard focus says the same).
- 2026-10-14 dicklesworthstone-research-series: when an amendment claims a trade the registry itself is subject to, run the measurement before drafting the text - the K1 replay refuted a clause that had already been written and had to be rewritten.
- 2026-10-14 dicklesworthstone-research-series: under a "measured A/B only" bar, a build that changes no verdict does not land; keep it on a local branch named in the next round's brief (with its retire condition) instead of discarding it.
- 2026-10-25 registry-self-scan: heredoc escaping hit again (Director edit helper, two sweep round-agents). PROMOTED to `## Repo law`.
- 2026-10-25 registry-self-scan: a builder answered "no consumer reads index.json laws[].techniques" from an in-repo grep; the Director's fleet grep found personas reading it. PROMOTED to `## Repo law` (fleet contract). First sighting for spark, promoted at once because the cost of the miss is a broken consumer.
- 2026-10-25 registry-self-scan: tuning a router on the held-out bench was prevented by telling the core builder NOT to read the fixture and to tune on a leave-one-out dev set from the corpus itself (use_when line held out). Held-out result 61/82/52 vs the builder's dev set 25/60, 41/60 - the two disagreed on weights, and the held-out set decided. Reuse for any ranking work.
- 2026-10-25 registry-self-scan: a population guard committed alongside the file it should claim passed pre-commit (file untracked) and went red post-commit. PROMOTED to `## Repo law` (context-map guard).
- 2026-10-25 registry-self-scan: overnight capacity is about one /scan-sweep wave: 4 round-agents averaged ~6 h wall each on 16-28-file contexts. Plan multi-skill overnight runs as spark plus architect plus ONE sweep wave, and register the rest.
