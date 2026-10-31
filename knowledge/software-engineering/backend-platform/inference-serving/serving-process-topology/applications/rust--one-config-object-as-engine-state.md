---
layer: application
type: application
subject: serving-process-topology
technique: one-config-object-as-engine-state
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# One config field, two readers: a judge spec read whole in one place and parsed in four

The stack version comes from the tree's own `rust-toolchain.toml`, which pins
`channel = "1.96.1"` (xkazm04/lighttrack, a public Rust workspace checked out as tracklight, at commit `7a42e90`
before the change and `bc07275` after it). Tracklight is an LLM observability and
evaluation service. Its engine crate carries one composite configuration value,
`EngineConfig`, built once at the edge of each binary and passed by reference to every
judge, scorer and text call.

## The shape is the technique's, and the leak is a resolution rule

`EngineConfig` follows the technique in shape. It is built in `crates/runner/src/main.rs`
from the parsed CLI, passed whole as `&EngineConfig`, and its doc comment says why the
sandbox runner lives on it: the runner is "run-scoped, exactly like `claude_bin`: one runner,
decided once by the operator", rather than a parameter threaded through every judge
signature. That is the technique's argument almost word for word.

The `model` field breaks the technique's other half, *resolved, not absent*. It holds an
unresolved operator string, a `[provider/]model[@effort]` spec with default `opus@xhigh`
(the runner's `--model` flag, `crates/runner/src/cli.rs`). The spec is never resolved at
construction. Every reader parses it again:

- the judge door (`crates/runner/src/judge_spec.rs`), `calibrate` and `calibrate --watch`
  each call `parse_judge_spec(&engine.model)` and dispatch `(provider, model)` through
  `providers::generate`;
- `run_text`, the engine's free-form text call used by the dataset LLM scrub and the
  benchmark healing pass, handed `&cfg.model` straight to `claude -p` as a model id.

The tree had already paid for this drift class twice, and its comments say so. The
`@effort` suffix was once split only inside the CLI argv builder, so "the default judge spec
`opus@xhigh` was POSTed to the Messages API as a *model id*". The fix moved the split to "the
one point every generation path passes through". `run_text` was the one generation path
that did not pass through it.

## A and B

The seam was chosen to falsify the technique. The tree already has the single composite
object, so the question was whether, with the object in place, readers still disagree
about what a field means. If the answer had been no, the technique's resolution rule would
be ceremony wherever a shared parser exists.

- **Arm A**: `run_text` as it stood. A 10-spec matrix taken from the tree's own docs and
  tests (`opus@xhigh`, `haiku`, `sonnet`, `weird@thing`, `anthropic/opus@xhigh`,
  `anthropic/haiku`, `gemini/gemini-2.5-flash`, `openai/gpt-5@high`,
  `openrouter/anthropic/claude-sonnet-5`, `codex/gpt-5`) was rendered through the real
  posture planner and compared with the judge reader's `(provider, model)`. **6 of 10
  disagreed**, and those 6 are every spec with a provider prefix. `anthropic/opus@xhigh`
  reached the CLI as model `anthropic/opus`. The gemini, openai, openrouter and codex specs
  were sent to the Claude CLI at all.
- **Arm B**: `run_text` resolves the spec with the same parser and dispatches through the
  same `providers::generate`. Disagreement is **0 of 10 by construction**, because both
  readers now reach the same function.
- **Floor**: the four unprefixed specs render byte-identical CLI argv under both arms
  (4/4), so the default `opus@xhigh` path is unchanged. The engine (221) and runner (210 +
  integration) suites stay green. `cargo fmt --check` and `clippy -D warnings` are clean.
- **Regression test**: `run_text_resolves_the_spec_like_the_judges_do` removes the Gemini
  keys, points `claude_bin` at a nonexistent binary and calls `run_text` with a gemini spec.
  On arm A it fails by spawning the Claude CLI. On arm B it fails in the Gemini adapter, by
  name. No live call is made in either arm.

## What the tree's shape says

A single composite object is necessary for this technique, but it is not sufficient. The
object removed every threading problem here: adding the sandbox touched the type and its one
reader, as the technique promises. But a field that carries an operator string instead of a
resolved value turns each reader into a parser, and the readers stay in agreement only while
every one of them remembers to call the parser. The `@effort` incident and this one are the
same failure at two depths. A shared parser plus discipline held for the readers written
after the first incident, and missed the reader written before it.

## What this realization cannot do

The fix gives every reader one shared door. It does not resolve the spec at construction.
`EngineConfig.model` is still a string that each reader parses. The technique's full form
would carry a resolved `(provider, model, effort)` target on the object, built once in
`main.rs`. That change touches every hand-built `EngineConfig` literal: the two judge-override
copies in `main.rs` and `dispatch.rs`, the relay agent, and the gateway generator. It was
left as the return condition rather than shipped as a five-file refactor. One residue is
deliberate. With an Anthropic API key in the environment, `run_text` now takes the Messages
API like the judges do (the tree's decision D9), where it used to always spawn the CLI.
