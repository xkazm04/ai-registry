---
layer: application
type: application
subject: standards-layered-runtime
technique: status-header-per-api
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A claim in progress: eleven headers, five stubs, one entry point that says yes

`boa-dev/boa` at `665f03924a54e5162be227e7e909612e36f6e35a`, workspace version
0.22.0 at `Cargo.toml:29`, `rust-version = "1.91.0"` at `Cargo.toml:30`. The
`boa_wintertc` crate is the subject's clearest specimen of a standards package
that is a claim in progress — and of the two ways such a package can say so,
one honest and one not. The structural facts below are ones the tree could
not have been designed to prove: they fall out of a crate skeleton landing
before its contents (`CHANGELOG.md:58`) and the migration arriving one API at
a time.

## The headers, as the technique describes them

Every API module under `core/wintertc/src/` opens with a doc header carrying
the spec link and a `# TC55 Status` section stating that the API is required
by the Minimum Common Web API. Landed modules carry the citation and nothing
else: `timers/mod.rs:1-7` (WHATWG HTML timers), `console/mod.rs:9-16` (WHATWG
console), `base64/mod.rs:5-7`. Modules whose implementation still lives in the
extras layer carry the citation *and* a `# TODO` marker naming the current
home: `abort/mod.rs:9-11` ("Migrate `AbortController` and `AbortSignal` from
`boa_runtime::abort`"), `fetch/mod.rs:9-11` ("Migrate ... from
`boa_runtime::fetch`"), `url/mod.rs:9-11`, `encoding/mod.rs:10-12`
(`boa_runtime::text`). `events/mod.rs:10-16` carries a five-line TODO listing
the interfaces not yet implemented anywhere. A grep for `# TODO` across the
crate lists the owed APIs; a grep for `# TC55 Status` lists the promised ones.
That is the computable inventory the technique asks for, and it is complete
from the standards crate alone — the extras-layer originals
(`core/runtime/src/abort/mod.rs:1`, `core/runtime/src/fetch/mod.rs:1-8`) carry
no marker pointing downward, so the destination stub is the only record of
the move.

## The stubs, and the entry point that reports success over them

The marker modules are not merely documented; they are registrars. Each
exposes a `register(_realm, _ctx)` that ignores both arguments and returns
`Ok(())`: `abort/mod.rs:18-25`, `fetch/mod.rs:19-25`, `url/mod.rs:20-24`,
`encoding/mod.rs:22-26`, `events/mod.rs:24-28`. The crate's entry point,
`boa_wintertc::register` at `lib.rs:63-82`, calls `encoding::register`
(`lib.rs:71`) and `abort::register` (`lib.rs:75`) unconditionally, and
`url::register` and `fetch::register` under their flags (`lib.rs:76-79`). So a
call that the docs describe as "Register all TC55-mandated Web APIs"
(`lib.rs:53`) succeeds while installing five of nine groups, and an embedder
who took `lib.rs:14` at its word — "depend on `boa_wintertc` directly" — gets a
context with `console`, timers, `queueMicrotask`, `structuredClone` and
`atob`/`btoa`, and no `AbortController`, `fetch`, `URL`, `TextEncoder` or
`EventTarget`. This is the deviation the technique's last rule names: the
stub's registrar returns success, so the package's own entry point is an
empty success wearing a green result. The `boa_runtime` layer papers over it
by registering its own implementations for the same names
(`core/runtime/src/extensions.rs:44-49,129-134`), which is why the CLI works
and a direct dependent does not.

One module is worse than a stub: `events` is declared at `lib.rs:44` and never
called from `register` at all. The header promises it, the registrar exists,
and nothing reaches it.

## The registrar that differs from its siblings

The handoff's recorded deviation holds on re-reading. `lib.rs:68-70` says, in
a comment beside the call, that "`timers` mirrors `boa_runtime::interval::register`,
which does not take a realm (timer globals are registered directly on the
context)", and `timers/mod.rs:218-220` confirms a `register(context)` with no
realm parameter while every sibling takes `Option<Realm>`. The extras layer's
`TimeoutExtension` adapts by discarding the realm it was given
(`extensions.rs:24-28`, `_realm`). The console has the same shape one step
removed: `console/mod.rs:52-54` accepts `_realm` and drops it, calling
`register_with_logger(DefaultLogger, context)` (`console/mod.rs:340-346`),
which takes no realm either. Neither case is written into the module's status
header, which is where the technique says a known gap goes — a reader of
`timers/mod.rs:1-7` sees "required" and nothing about realms.

## What holds without qualification

The header's first line, the spec citation, is present on every module and
correct on every one opened. The crate's top-level doc (`lib.rs:1-14`) states
the claim, the dependency rule and the intended embedder in three sentences,
and the changelog line that created the crate calls it a skeleton
(`CHANGELOG.md:58`) — the one word the crate's own docs at this commit do not
use, and the one an embedder reading `lib.rs:14` would most need.
