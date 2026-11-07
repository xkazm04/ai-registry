---
layer: application
type: application
subject: invariant-placement
technique: string-keyed-context-is-an-unchecked-join
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.99
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Rust: a gateway's extension map and a CLI's untyped commands

The version is the compiler this probe ran on, rustc 1.99.1. Two trees by two authors were read and neither was run, so
every statement about what they do is a reading, and a single integration test could refute one. Nothing was reported
upstream. `Phixsura/orthic-mono` is BSL-1.1, so its design is in our words, with line references and no code.
`vercel-labs/agent-browser` is Apache-2.0.

## Inside one request

orthic-mono at `24665cd7` shares one context across concurrent handlers, with a map from a static string to a type-erased
value (`crates/orthic-gateway/src/pipeline/dag/context.rs:75`, read at `crates/orthic-gateway/src/pipeline/dag/context.rs:454-458`).
A literal search across its crates for one key finds three readers and no writer: output checks, a liability step and a
cache store (`crates/orthic-gateway/src/pipeline/handlers/guardrails/output.rs:66`,
`crates/orthic-gateway/src/pipeline/handlers/liability.rs:41`, `crates/orthic-gateway/src/pipeline/handlers/cache/handlers.rs:507`).
The response content is written under another name (`crates/orthic-gateway/src/hooks/mod.rs:1087`), and a reader that finds
nothing returns success (`crates/orthic-gateway/src/pipeline/handlers/guardrails/output.rs:320`). A rule reads one key for
detected personal data (`crates/orthic-gateway/src/policy/handler.rs:47`), and the input step writes another
(`crates/orthic-gateway/src/pipeline/handlers/guardrails/input.rs:736`). Policy actions write keys with no reader, which is the
dead-knob direction (`crates/orthic-gateway/src/policy/handler.rs:161-163`).

## Across a command boundary

agent-browser at `71850a02` passes commands as untyped JSON inside one binary. The direction a one-request bag would call a
report did the most here, by reading. The parser writes a session name,
`cli/src/commands.rs:1981 "cmd["sessionName"] = json!(name);"`. No other code literal reads it; the handler reads a path,
`cli/src/native/state.rs:808 "let path = cmd.get("path").and_then(|v| v.as_str());"`, and with none it walks the sessions
directory, `cli/src/native/state.rs:642 "pub fn state_clear(path: Option<&str>) -> Result<Value, String> {"`. So a command scoped
to one name would clear them all. The same holds for an approval's identifier, written at
`cli/src/commands.rs:1372 "confirmationId"` and ignored by a handler that takes its command argument unread,
`cli/src/native/actions.rs:14237 "async fn handle_confirm(_cmd: &Value, state: &mut DaemonState)"`. That is why the technique
treats written-never-read as a failure on this side of the line, correcting the first miner's proposal.

## The run

A bag of our own, with a guard written the way these readers are.

| Arm | Case | Result |
| --- | --- | --- |
| A, string keys | writer used another spelling | compiled, guard said nothing to check |
| A, string keys | right spelling, wrong stored type | compiled, guard said nothing to check |
| A, string keys | control, both right | guard refused |
| B, typed key constants | reader names a key nobody declared | refused, E0425 |
| B, typed key constants | writer stores the wrong type | refused, E0308 |
| B, typed key constants | control, both right | value returned |

Target: mismatches that compile, 2 to 0. Floor: the control, which held in both.

## The seam

None chosen. The nearest connected project has a downcast helper and 11 files holding string-to-value maps, unread for whether
any crosses steps with a guard behind it. A scan of those is what would make this measurable, so the verdict is `unmeasurable`.
Nothing was changed there.

## What this realization cannot do

Typed keys do not reach values built at runtime, or a bag serialized across a process, where a schema has to do the same job.
The miners' whole-tree key diffs were not re-run; only the keys named above were re-searched, by literal.
