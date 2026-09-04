---
layer: application
type: application
subject: guest-language-introspection
technique: flag-gated-debug-global
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Flag-gated debug global — Boa's `$boa`

Boa (github `boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
`0.22.0` at `Cargo.toml:29`, toolchain witness `rust-version = "1.91.0"` at
`Cargo.toml:30`) is a JavaScript engine in Rust, and its debug global `$boa` is the
technique in its cleanest form: one flag, one injection site, one builder per
namespace, non-enumerable, and — the structural fact this application exists to record
— built in the `boa_cli` crate and not in `boa_engine`, so an embedder of the engine
cannot obtain it.

## The flag and the site

`cli/src/main.rs:152-158` declares two independent booleans on the clap argument
struct, one line apart:

```rust
/// Inject debugging object `$boa`.
#[arg(long)]
debug_object: bool,

/// Inject the test262 host object `$262`.
#[arg(long)]
test262_object: bool,
```

Both default to off. `cli/src/main.rs:588-604` is the only place either is read: under
`args.debug_object` the CLI calls `init_boa_debug_object(context)`; under
`args.test262_object` it calls `boa_runtime::test262::register_js262(...)` and then
defines the `print` global that test262 expects. The two blocks are adjacent, the two
objects are separate, and the engine's own conformance run is driven by `boa_tester`
with the second flag's machinery and never the first, so `$boa` is absent from every
conformance result by construction.

## The global and its namespaces

`cli/src/debug/mod.rs:70-79` is the single installation function:

```rust
pub(crate) fn init_boa_debug_object(context: &mut Context) {
    let boa_object = create_boa_object(context);
    context
        .register_global_property(
            js_string!("$boa"),
            boa_object,
            Attribute::WRITABLE | Attribute::NON_ENUMERABLE | Attribute::CONFIGURABLE,
        )
        .expect("cannot fail with the default object");
}
```

The sigil name, the non-enumerable attribute, and the deliberate choice to leave it
writable and configurable — the guest may shadow or delete it — are all on those nine
lines. `cli/src/debug/mod.rs:15-67` is the builder: eight namespaces (`function`,
`object`, `shape`, `optimizer`, `gc`, `realm`, `limits`, `string`), each obtained from
its own module's `create_object` (the string module names its builder
`create_string`), each attached with the same non-enumerable attribute set. The
namespace modules are `cli/src/debug/{function,gc,limits,object,optimizer,realm,shape,string}.rs`
— one file per namespace, 16 to 178 lines each, exactly the ownership shape the
technique asks for. `docs/boa_object.md:1-6` states the same three facts in prose:
injected only under `--debug-object`, "separated into modules".

## The structural fact: the surface is in the shell, not the engine

The debug module is declared at `cli/src/main.rs:37` (`use debug::init_boa_debug_object`)
and nowhere in `core/`. `boa_engine` exposes the primitives the namespaces call —
`CodeBlock::set_traceable` at `core/engine/src/vm/code_block.rs:230`,
`Context::runtime_limits_mut` at `core/engine/src/context/mod.rs:601`,
`boa_gc::force_collect` at `core/gc/src/lib.rs:534` — but the object that gathers them
under a guest-visible name exists only in the binary whose users are engine developers.
An application embedding `boa_engine` through `Context::default()` has no path to `$boa`
short of reimplementing `cli/src/debug/`. This is the placement rule of the technique,
and the tree could not have been arranged to demonstrate it: a debug object built inside
the engine crate behind a feature flag would have satisfied every other rule and still
shipped the surface to every embedder that enabled the feature.

The conformance host object confirms the boundary from the other side. `$262` lives in
`core/runtime/src/test262.rs`, a library crate, because the conformance runner
(`boa_tester`) and the CLI both need it; `$boa` lives in the CLI because only the CLI
needs it. Where the two overlap — both offer a realm factory — they diverge exactly as
the technique warns two constructions will: `test262.rs:151-158` builds the new realm
with `context.create_realm()` (the in-context constructor at
`core/engine/src/context/mod.rs:540-547`, sharing the caller's host hooks and root
shape) and returns a wrapper carrying `global` and `evalScript`;
`cli/src/debug/realm.rs:225-229` instead constructs a throwaway `Context::default()`
and returns its global object. Two realm factories, two definitions of "a realm", in one
binary.

## What the tree does not do

The design record behind this subject credits the debug object with "engine tests
written in the guest language". A search of the whole checkout for `$boa` finds it in
`cli/src/debug/mod.rs`, `cli/src/main.rs`, `docs/boa_object.md`, `docs/debugging.md`,
`cli/README.md`, the root `README.md` and `CHANGELOG.md` — and in no test. No file under
`core/engine/src/` or `tests/` passes `--debug-object` or calls a `$boa` member, and the
examples in `docs/boa_object.md` are not executed by any harness. The surface exists,
documented and gated correctly, and the engine's tests are still written on the host
side against `Context` (the `debug_object` test at `core/engine/src/value/tests.rs:386`
is unrelated — it exercises the Rust `Debug` formatter). The technique's claim that a
namespace's examples are its tests is the standard; this tree has the namespaces and
the examples and has not yet joined them.
