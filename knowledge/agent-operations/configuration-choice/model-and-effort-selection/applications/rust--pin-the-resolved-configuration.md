---
layer: application
type: application
subject: model-and-effort-selection
technique: pin-the-resolved-configuration
stack: rust
status: forged
verified_on: 2026-09-28
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# Rust: a desktop fleet whose wake path dropped the effort its plan chose

Personas is a Tauri desktop app (Rust backend) that dispatches Claude Code and Codex CLI
runs as a fleet of sessions. Measured 2026-09-27/28 at personas origin/master `3fd8f0e44`
against Claude Code 2.1.283.

## Seven launch paths, and the one that was left out

The app chooses a model and an effort in several places, and they did not agree on how
to pass them:

| Path | Model | Effort |
|---|---|---|
| Persona executions (`engine/src/prompt/cli_args.rs`) | pinned | always pinned, `medium` by default |
| Fleet plan rows (`approval_exec_fleet.rs`) | when the row sets one | when the row sets one; `None` "leaves the CLI default" |
| Persona charter workers (`attention.rs`) | always, via a precedence chain | only when a rung names one |
| Codex maintenance lane (`headless.rs`) | pinned | pinned, but the persisted row omits it |
| Dev task runner (`task_executor.rs`) | pinned | never passed |
| Curator dispatch (`curator/tick.rs`) | never passed | never passed |
| **Fleet wake (`fleet_wake_session`)** | **dropped** | **dropped** |

The persona-execution lane had already met this bug once, and its comment says so: a run
whose profile asked for `high` "was silently downgraded to `medium` the moment it was
resumed", fixed by routing resume through the same resolver as the fresh path. The same
file records why it pins at all: "CLI 2.1.94 silently changed the implicit default from
`medium` to `high`". That fix landed 2026-09-06, and it did not travel: the fleet lane
had the same shape, found two days later and still open three weeks after. `resume_target`
returned only the conversation id and cwd, and the wake spawned
`--resume <id> <prompt>`, so a plan row's `--model` / `--effort` never reached the
continuation. They were also missing from the woken row's persisted `args_json`, the only
record the app keeps of them. A 2026-09-08 task file planned the fix. Nothing had landed.

## What a bare resume actually re-resolves

The owed question was which half of the pair the resume loses, because the harness might
restore it. A paired headless probe answered it: each session was started at
`--model claude-sonnet-5 --effort low` and then resumed, on a machine whose user
settings say `model: opus[1m]`, `effortLevel: xhigh`.

| Resume arm | n | Served model | Cache-creation tokens on the resumed turn |
|---|---|---|---|
| bare `--resume` (what the wake did) | 2 | `claude-sonnet-5` | 11,295 and 6,157 |
| `--model … --effort low` carried | 2 | `claude-sonnet-5` | 55 and 55 |
| `--effort low` only | 1 | `claude-sonnet-5` | 55 |

The CLI restores the conversation's **model** by itself. It does not restore the
**effort**. The effort-only arm isolates it: carrying the effort alone brings the cached
prefix back. The bare arm resumed at a different effort and rewrote the cached
conversation to do it. This matches the fleet's 2026-09-08 measurement on 2.1.263 (9,415
against 59). The two woken sessions in the app's own table show the same model survival:
both kept `claude-opus-5` across a CLI upgrade that re-pointed the `opus` alias.

## The change

`resume_target` now also returns `pinned_config_args(&s.args)`: the row's `--model` /
`--effort` pairs, in either `--flag value` or `--flag=value` form. `fleet_wake_session`
puts them ahead of `--resume`. The model is carried too, although today's CLI restores
it, because that restoration is harness behaviour the app does not own. The woken row's
args now contain the pair, so the persisted record keeps it, and a second wake keeps it
again. Two unit tests cover this: the parse (including a look-alike flag, a trailing
flag with no value, and a value that happens to start with `--effort`), and a
two-wake chain plus a bare row that carries nothing. Making `resume_target` drop the
flags again turns the second test red. Shipped in personas `cc97afa6e` and
`fe7ad01cb`. The project's pre-push census refused the first push over the fixtures'
real model ids, and the second commit replaced them with placeholders.

## What is left unpinned, deliberately or not

The row census from the app's own `fleet_sessions` table, read-only, 274 rows:
165 carry `--model` without `--effort`, 93 Curator rows carry neither, and 9 autopilot
rows carry a model only. The Curator lane, which dispatches this registry's own
unattended runs, therefore resolves both values from the operator's interactive settings.
The harness documents that a saved effort does not apply to its newest models, so the
saved `xhigh` probably never reaches them. Whether the Curator should be pinned, and at
what, is the owner's policy call. The technique's demand is narrower: pass it, or record
"not passed" as a decision.
