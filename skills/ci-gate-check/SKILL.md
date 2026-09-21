---
name: ci-gate-check
description: "Run the exact checks CI enforces before you push, so a red pipeline is never how you find out. Use before every push, before opening a PR, and after an agent finishes a batch of edits."
category: ci-cd
memory: project
version: 1.5.0
tags: pre-push, gate, lint, typecheck, tests
argument-hint: "[--fix]"
---

# CI gate check

CI is the slowest possible place to learn that a change is broken. This skill runs the same
checks locally, in the same order, and reports one verdict: **safe to push** or **not yet**.

## When to use

- Before `git push`, always.
- After an agent has made more than one file's worth of edits.
- Before marking a PR ready for review.

## The gate

Read the repo's declared commands first. In order of preference:

1. `.ai/manifest.yaml` -> `capabilities` (`lint`, `typecheck`, `test`, `build`)
2. `package.json` scripts, `Makefile` targets, `justfile` recipes, `pyproject.toml` tool config
3. The CI workflow itself (`.github/workflows/*.yml`) - whatever it runs IS the gate

Never invent a command. If a stage has no command in this repo, report it as **not configured**
and move on; a fabricated command that "passes" is worse than a missing one.

Run the stages in this order and stop at the first hard failure:

| Stage | Why it is here | Typical command |
| --- | --- | --- |
| format | cheapest, removes noise before it reaches review | `npm run format:check`, `ruff format --check .`, `gofmt -l .` |
| lint | catches the class of bug a type checker will not | `npm run lint`, `ruff check .`, `golangci-lint run` |
| typecheck | the highest signal per second on typed codebases | `npx tsc --noEmit`, `mypy .`, `go vet ./...` |
| test | behaviour, the only stage that proves intent | `npm test`, `pytest -q`, `go test ./...`, `cargo test` |
| build | catches boundary breaks a type check cannot see | `npm run build`, `cargo build --release` |

The `build` stage matters more than it looks: a project can typecheck clean and still fail to
build (a server-only import pulled into a client module, a missing asset, a bad path alias).
If the repo has a build command, it is part of the gate.

## Reporting

Print one line per stage and one verdict. Do not paste whole logs.

```
format     ok      0.8s
lint       ok      4.1s
typecheck  FAIL    9.2s   src/api/user.ts:41  Type 'string | null' is not assignable to 'string'
test       -       skipped (earlier stage failed)
build      -       skipped

VERDICT: do not push. 1 failing stage, first error above.
```

On failure: fix the first error, then re-run the gate from the top. Do not fix errors in bulk
across stages - a lint fix routinely changes what the type checker sees.

## Rules

- **Never** push with a failing stage because "CI will catch it". CI catching it is the failure.
- **Never** disable a check to make the gate green. If a rule is wrong, change the rule in its
  config file, in its own commit, with a reason.
- A flaky test is a failing test until it is quarantined deliberately and tracked.
- Timebox: if the full suite takes longer than a few minutes, run the affected subset locally
  and say so in the verdict (`test  ok (subset: src/api)`), so the reader knows what was proven.

## Related

- `test-before-commit` - the tighter inner loop this skill backstops.
- Practice `ci-gates` (D3) - the CI side of the same contract.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Lane 0 is written on EVERY run; lanes 1-3 are not. Be honest about volume: most runs produce nothing in lanes 1-3. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 0 - RUN LOG** (every run that started work, including failed and aborted ones; skip read-only info modes such as a status peek, and runs cancelled before any work). Append one row to the registry's run log with one command - identity (project, device) and the skill's version are resolved by the script, never typed (`<registry>` resolves as in lane 2 step 4):

```sh
node <registry>/scripts/log-run.mjs --skill ci-gate-check --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence: what this run produced>" --comment "<free text>"
```

- `--outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted` (stopped by the operator or the harness).
- `--difficulty`: 1 trivial - mechanical, no judgment needed; 2 routine - the method applied as written; 3 demanding - real judgment calls, or one detour; 4 hard - several dead ends, rework, or an operator course-correction; 5 at the edge - partial or failed on the merits, not on tooling. Rate the TASK as this run met it, not the effort you spent.
- `--model` / `--effort`: what you are running as, as your harness states it; omit `--effort` when you cannot see it. `--tokens-est`: the drop in the harness's remaining-token counter from just before this skill was invoked to now; omit it when your harness shows no counter. Exact figures are measured later from the transcript and stored apart - never guess one.
- `--comment` is the self-reflection a reviewer will read: what went well, what the method made harder, where the skill's instructions were wrong, missing or ignored. Specific over polite; no filesystem paths or email addresses (the writer rejects them).
- If the command fails on validation, fix the named field and rerun. If the registry is unreachable, add `--pending` (the row waits in the project's `.ai/`). Never read the run log during a run: it is evidence ABOUT this skill for `/librarian skills`, and an executor that reads its own diagnosis contaminates the next measurement.

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/ci-gate-check/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - ci-gate-check` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/ci-gate-check` in a consuming repo is a symlink to `<registry>/skills/ci-gate-check` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/ci-gate-check` and `git -C <registry> commit -m "skill(ci-gate-check): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/ci-gate-check/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/ci-gate-check` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
