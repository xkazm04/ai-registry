---
layer: application
type: application
subject: session-continuation
technique: advisory-guard-fail-mode
stack: claude-code
status: forged
verified_on: 2026-10-08
verified_against: claude-code@2.1.295
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Claude Code — a host-side `if` filter in front of a blocking guard is a second accept grammar, and it fails open by omission

The witness for `claude-code@2.1.295` is `claude --version` on the machine that ran
both arms, the same day. The realization is a fleet project's `PreToolUse` guard
that queues a second concurrent `cargo build|test|check|clippy|bench` behind the
first (a Rust desktop app whose test suite saturates every core when two run at
once). The guard is the technique's blocking interceptor: a total function of the
current command, an enumerated grammar (one regular expression over the command
string), everything else passes, fail-open and loud on an unreadable payload.

## What the registration cost before

The hook was registered with `"matcher": "Bash"` and nothing else, so the harness
started a Node process for every Bash call and the guard's own grammar decided
whether to act. The project's 30-day transcript history holds **19,122** Bash
calls, of which **112** match the guard's heavy-cargo grammar (0.6%). An idle-machine
spawn costs ~0.3 s; the harness logged two runs that exceeded the then-20 s timeout,
on commands that were not cargo at all (a `git diff … npm run …` chain and an
`npx vitest` run) - a stall before the grammar was even consulted. The harness logs
a hook's duration only when it times out, so the 0.3 s figure is a local re-timing,
not a measurement from the history. With the timeout since raised to 900 s so the
queue can actually wait, the same stall would hold any Bash call for up to fifteen
minutes.

## The trap: the filter's grammar intersects the guard's

The harness offers an `if` field in permission-rule syntax that skips the spawn
when the tool call does not match. The obvious registration, `"if": "Bash(cargo *)"`,
was what an automated configuration review recommended ("narrow the matcher to
cargo commands"). Run through the real harness with a logging hook on both arms,
it **did not fire on `timeout 30 cargo --version`**. In this project's history,
roughly a third of the heavy cargo invocations are wrapped that way
(`timeout 2400 cargo test`, `CARGO_TARGET_DIR=… timeout 900 cargo …`). The guard
would have kept passing every test written against it, because the guard never
changed: the command simply stopped reaching it.

That is the technique's "unlisted syntax passes" rule landing on a layer the guard
does not own. The effective accept grammar is the **intersection** of the host's
filter and the guard's expression, so a filter narrower than the guard is a
silent fail-open for the difference - with no `DEGRADED` line, because the guard
that would print it was never started.

## The registration that shipped, and the paired proof

Two entries under the same matcher, `"if": "Bash(cargo *)"` and
`"if": "Bash(timeout *)"`, both running the unchanged guard. Arms, same session
shape, same 13 commands taken from the history's own cargo shapes plus four
plain ones:

| arm | cargo shapes fired (of 9) | plain commands fired (of 4) |
| --- | --- | --- |
| A: `matcher: Bash` only | 9 | 4 |
| B: `if: Bash(cargo *)` | 8 (missed `timeout 30 cargo`) | 0 |
| C: B + `if: Bash(timeout *)` | 9 | 1 (`timeout 30 npm --version`) |

Shapes tested: bare, `timeout N cargo`, `VAR=… cargo`, `VAR=… timeout N cargo`,
`export VAR=… && timeout N cargo`, `export VAR=…; cargo`, `cd . && timeout N cargo`,
`time (cargo …)`, `cd . ; (cargo …)`. **Target**: spawns on non-cargo commands -
projected over the 30-day history at ~810 instead of 19,122 (calls that start a
segment with `cargo` or `timeout`). **Floor**: the guard still sees every heavy
cargo shape the history contains - held 9/9. Some shapes fired both entries
(two `if` rules matched, or the harness could not resolve `$PWD` and ran the hook
regardless, which its documentation says it does); the guard is a read-only
check, so a double spawn costs time and nothing else. Verdict `better`.

## What this realization cannot do

- The `if` filter is best-effort by the harness's own account - an unparseable
  command runs the hook anyway - so it is a cost filter, never an authority.
  The guard's expression stays the decision.
- Any wrapper beyond `timeout` (`nice`, `nohup`, a shell function, `npm run`
  scripts that call cargo internally) is outside both arms. `npm run` wrappers
  were already outside the guard's grammar; the other wrappers are not in the
  history and are untested.
- The proof is n=1 session per arm on one harness version. A harness release
  that changes how compound or wrapped commands are split re-opens the question;
  re-run the 13-command arm set after an upgrade.
