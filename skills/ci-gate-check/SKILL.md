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

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/ci-gate-check/config.md` for Codex or `.claude/ci-gate-check/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
