# Codex dispatch

How daybreak launches Codex and what it has learned about failing less. The measured CLI
facts are in `codex-probe.md`; this file is the operating procedure on top of them.

## Launch

```sh
node <skill>/scripts/codex-run.mjs --cwd <worktree> --brief <plan.md> \
  --run-dir <scratch>/daybreak/<date>/<slug>/<item> \
  --sandbox write --timeout-min 45
```

- A survey uses `--sandbox read` and a 30-minute timeout.
- Start it as a background command. The verdict is `<run-dir>/result.json`, not stdout.
- One brief file per run, written with the file tools; never inline a brief on a command line.
- Resume by the `sessionId` in `result.json`.

## What the runner tells you

`result.json`: `{class, exitCode, sessionId, minutes, filesChanged[], usage, modelUnknown}`.
`usage` is summed from `turn.completed`, and `modelUnknown` appears only when true.

A session pays roughly 35k input tokens before it does anything (measured 2026-11-09 on a
one-file task, about 31k of it cached). That is fine on a plan with tokens to spare, and it
is why many very small sessions are poor value: group items that touch one file.

## Failure classes

Count every failure under one of these. The right-hand column is what the brief template
must say to prevent it. **A class seen in two runs gets its clause promoted into the template.**

| Class | Symptom | Detected by | Prevention in the brief |
| --- | --- | --- | --- |
| `timeout` | No result inside the limit | `result.json` | One plan, one concern; split the item. |
| `crash` | Non-zero exit or no `turn.completed` | `result.json` | Read the `events.jsonl` tail first. |
| `no-diff` | Finished, changed nothing | `result.json` | Name the exact file and the change. |
| `scope-creep` | Files outside the plan | Director diff review | "Change only these files." |
| `tests-weakened` | Test removed, skipped, or re-expected | Director diff review | "Never edit a test to make it pass; report instead." |
| `gate-red` | Project gate worse than base | Director gate run | Name the gate the builder must keep green. |
| `hallucinated-path` | Cited path or symbol does not exist | Director triage | "Quote the line you cite." |
| `model-unknown` | Silent model fallback | `modelUnknown` in `result.json` | Fix the name before dispatching more. |

## Rows learned from runs

None yet. Each promoted row names the run date and the count that promoted it.
