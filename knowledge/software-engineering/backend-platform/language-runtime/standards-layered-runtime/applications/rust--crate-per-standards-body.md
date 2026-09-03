---
layer: application
type: application
subject: standards-layered-runtime
technique: crate-per-standards-body
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Four crates, one dependency edge per claim, and the flags that survived

`boa-dev/boa` at `665f03924a54e5162be227e7e909612e36f6e35a` is a JavaScript
engine written in Rust, workspace version 0.22.0 at `Cargo.toml:29`, pinned to
`rust-version = "1.91.0"` at `Cargo.toml:30`. Its runtime is layered by
standards body in the sense this subject means, and the layering is stated in
the crates' own manifests and module docs rather than in a diagram, which is
what makes it citable.

## The four layers as dependency lines

The engine, `boa_engine`, implements ECMA-262 and nothing above it. The
standards crate, `boa_wintertc`, implements the WinterTC (Ecma TC55) Minimum
Common Web API, and its manifest at `core/wintertc/Cargo.toml:14-15` depends on
`boa_engine` and `boa_gc` — the collector, which sits *below* the engine — and
on no other workspace crate. The crate's own docs state the rule in the words
this subject uses: "`boa_wintertc` is a standalone crate that depends only on
`boa_engine`" (`core/wintertc/src/lib.rs:10`), and then state the claim a
dependency edge makes: "If you only want the TC55-mandated APIs and nothing
else, depend on `boa_wintertc` directly" (`lib.rs:14`).

The extras layer, `boa_runtime`, depends on `boa_wintertc` at
`core/runtime/Cargo.toml:16` and re-exports it (`core/runtime/src/lib.rs:94-108`
explains why; `lib.rs:124-151` does it, with `pub use boa_wintertc::timers as
interval` at `lib.rs:143` preserving the historical import name). What
`boa_runtime` adds is exactly what no standard requires: `message`
(`postMessage` with a host `MessageSender`), `process` (a host
`ProcessProvider`), the `test262` harness object, and the concrete
`BlockingReqwestFetcher` behind `fetch`. The executable, `boa_cli`, depends on
`boa_engine`, `boa_parser`, `boa_gc` and `boa_runtime` at `cli/Cargo.toml:15-18`
and assembles the runtime in one function, `add_runtime` at
`cli/src/main.rs:829-843`: a `ConsoleExtension` wrapping the CLI's printer and,
under the `fetch` feature, a `FetchExtension` wrapping the blocking fetcher,
passed to `boa_runtime::register`. The context itself is built at
`main.rs:570-577` from three library choices — `job_executor`,
`module_loader`, `can_block` — which is the thin-assembler choice list.

The changelog records the migration order the technique prescribes: the
skeleton first ("add boa_wintertc crate skeleton for WinterTC compliance",
`CHANGELOG.md:58`), then APIs moved down one at a time — `atob`/`btoa` at
`CHANGELOG.md:376`, `structuredClone`/`queueMicrotask`/timers at
`CHANGELOG.md:380`, `console` at `CHANGELOG.md:384` — each leaving a re-export
behind.

## The publisher is not the package

The baseline the crate implements is curated from several publishers' documents,
and the crate follows the curator, not the publishers: the timer module's
header cites the WHATWG HTML timers section (`core/wintertc/src/timers/mod.rs:3`),
the abort module cites the DOM standard (`abort/mod.rs:3`), fetch cites the
Fetch standard (`fetch/mod.rs:3`), console cites the WHATWG console
specification (`console/mod.rs:11`), and every one of them sits in the single
`boa_wintertc` crate under a `# TC55 Status` header. There is no
`boa_whatwg_dom` crate and there should not be; the embedder's claim is
"TC55", and the publishers' names live in the headers.

## Deviations, recorded against the standard

**The standards crate carries feature flags on required APIs.** Its manifest
declares `url = []` and `fetch = []` at `core/wintertc/Cargo.toml:33-34` (both
empty — they pull no dependency), and `lib.rs:45-46,50-51` gate the `fetch`
and `url` modules on them, with `lib.rs:76-79` gating their registration. The
technique's one permitted flag gates a *backend* with a heavy or non-portable
dependency, and `boa_runtime` uses it exactly that way — its manifest says
"Default should not add `reqwest` as it is not available on all platforms"
(`core/runtime/Cargo.toml:42`) and gates only `reqwest-blocking`
(`Cargo.toml:60`). The two flags in the standards crate gate the API surface,
so a dependent that omits them has depended on the TC55 crate and not
received two TC55-required APIs; the manifest cannot tell the difference. At
this commit both modules are stubs (see the sibling application), so the flags
currently gate nothing, which is the moment to remove them.

**The console is not in the extras layer's fixed baseline.** `boa_runtime::register`
at `core/runtime/src/lib.rs:172-194` installs base64, timers, encoding,
microtask, structured clone, and under features URL, process and abort — and
then the caller's tuple. The console, a TC55-required API, is not in that
list; the CLI must pass `ConsoleExtension(printer)` itself
(`cli/src/main.rs:832`), and the crate docs tell every embedder to do the same
(`lib.rs:50-63`). A `ConsoleExtension::default()` with a `DefaultLogger`
exists (`core/runtime/src/extensions.rs:88-92`), so the fix the
[baseline-plus-extension-tuple](../techniques/baseline-plus-extension-tuple.md)
technique names — keep the member in the baseline with its default backend —
costs one line. As shipped, an embedder that forgets the console gets a
successful registration and no `console` global.

**The fixed baseline is itself feature-shaped.** Three of its members are
`#[cfg]`-gated (`lib.rs:183-188`), so "the baseline" an embedder receives from
`boa_runtime::register` depends on which features its build unified in — the
exact illegibility the technique's argument against flags describes, one layer
up from where the crate boundary fixed it.
