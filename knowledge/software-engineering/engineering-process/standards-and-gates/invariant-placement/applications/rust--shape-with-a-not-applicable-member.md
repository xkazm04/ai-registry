---
layer: application
type: application
subject: invariant-placement
technique: shape-with-a-not-applicable-member
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@2021
---

# Shape with a not-applicable member, in cargo-make

Verified against `sagiegurari/cargo-make` at commit
`95dcc545db8cf08af6fbec524e200e7c80b06027`, package version 0.37.24; toolchain
witness `Cargo.toml:9`, `edition = "2021"`, CI matrix at
`.github/workflows/ci.yml:18`. Every line below was re-opened on the date above.

cargo-make chooses a script engine per task — a native OS script, an embedded
scripting language, an embedded Rust script, a shell-to-batch translation, a
generic external runner, or a shebang. The set is modelled as an enum and it
carries a seventh member. This application runs the technique's producer audit
against it and reports a live dead arm.

## The set, with the member

`src/lib/scriptengine/mod.rs:27-45`:

```rust
#[derive(Debug, Clone, PartialEq)]
/// The currently supported engine types
pub(crate) enum EngineType {
    /// OS native script
    OS,
    /// Duckscript script runner
    Duckscript,
    /// Rust language
    Rust,
    /// shell to windows batch conversion
    Shell2Batch,
    /// Generic script runner
    Generic,
    /// Shebang script runner
    Shebang,
    /// Unsupported type
    Unsupported,
}
```

`Unsupported` matches every signature in the technique: it carries no data, its
doc comment restates its own name, and it means *none of the other six*.

## Why it exists: a resolver's convenience, exactly as predicted

`get_internal_runner` at `scriptengine/mod.rs:92-105` maps a runner string to an
engine:

```rust
fn get_internal_runner(script_runner: &str) -> EngineType {
    if script_runner == "@duckscript" { ... EngineType::Duckscript }
    else if script_runner == "@rust" { ... EngineType::Rust }
    else if script_runner == "@shell" { ... EngineType::Shell2Batch }
    else { EngineType::Unsupported }
}
```

The honest return type is `Option<EngineType>`; the member exists so this
function can return `EngineType` instead. The convenience is local to this
function and its two callers, both inside the same file.

## The producer audit, and the finding

The only public producer of `EngineType` is `get_engine_type` at
`scriptengine/mod.rs:106-157`. Walking every path through it:

- `script_runner = Some(runner)` — calls `get_internal_runner`; on `Unsupported`
  it returns `Generic` (line 122) when a `script_extension` is present and `OS`
  (line 126) when it is not. Otherwise the real engine.
- `script_runner = None`, shebang present with **no** arguments — calls
  `get_internal_runner`; on `Unsupported` it returns `Shebang` (line 147).
  Otherwise the real engine.
- `script_runner = None`, shebang present **with** arguments — `Shebang`
  (line 151), because an internal engine cannot accept interpreter arguments.
- `script_runner = None`, no shebang — `OS` (line 155).

**No path returns `Unsupported`.** Every branch that receives it from
`get_internal_runner` maps it onto a real fallback in the next statement. The
member is unconstructible as an output of the only function callers use.

## The compiler-mandated arm, and what was written in it

`invoke` at `scriptengine/mod.rs:263-312` dispatches on the resolved engine, and
its match must be exhaustive. The last arm, `scriptengine/mod.rs:310`:

```rust
        EngineType::Unsupported => Ok(false),
```

This is the technique's central claim instantiated. The author had no decision
to make — the value cannot arrive — and the checker would not let them say so,
so they wrote the cheapest arm that compiles. `Ok(false)` in this function's
contract means *no script was run*, and the caller in `runner.rs` treats a
`false` return as "this task had no script", not as a failure. The placeholder
is a **silent success**: the task reports done, the script never executed, and
nothing is logged.

The arm is unreachable today. It becomes reachable the moment any future
resolution path forwards `get_internal_runner`'s result one level further
without mapping it — a two-line refactor with no test that would fail — and the
behaviour on that path is a task that silently does nothing. Compare the sibling
handling in `io.rs:135`, where an unrecognised value at least reaches
`error!("Unsupported ignore type: {}", ...)`; the enum arm says nothing at all.

## The repair, in this tree

`get_internal_runner` returns `Option<EngineType>` and loses the seventh member.
Its two call sites, at lines 119 and 144, already contain the fallback policy —
`Generic`/`OS` and `Shebang` respectively — and become `match ... { Some(e) => e,
None => ... }` or `unwrap_or_else`. `EngineType` then holds six reachable
members, `invoke`'s match loses its last arm, and its exhaustiveness check goes
back to being a proof that every engine the resolver can produce has a runner.
The edit touches three sites in one file and deletes the silent-success path.

## What this realization cannot show

The audit is structural: it establishes that no current path constructs the
member, not that none ever did. The tree's git history was cloned at depth 1, so
whether `Unsupported` was reachable in an earlier version — and the arm a
faithful port of behaviour that once mattered — is not determinable from what was
read. That question does not change the finding for the commit verified, but it
would change how the arm should be described in a patch to the upstream project.
