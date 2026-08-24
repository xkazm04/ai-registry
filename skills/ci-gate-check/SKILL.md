---
name: ci-gate-check
description: "Run the exact checks CI enforces before you push, so a red pipeline is never how you find out. Use before every push, before opening a PR, and after an agent finishes a batch of edits."
category: ci-cd
memory: project
version: 1.3.0
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
