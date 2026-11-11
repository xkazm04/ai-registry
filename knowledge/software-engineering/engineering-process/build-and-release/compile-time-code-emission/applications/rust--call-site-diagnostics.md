---
layer: application
type: application
subject: compile-time-code-emission
technique: call-site-diagnostics
stack: rust
status: forged
verified_on: 2026-11-11
verified_against: rust@1.96.1
---

# Two procedural macros in a desktop app: located errors, and the one dependency they do not check

Read-only reconciliation against the Personas desktop app at commit `8d076db46a`, crate
`src-tauri/macros` (toolchain pinned to 1.96.1 in `rust-toolchain.toml`). The crate holds
two procedural macros: `#[requires(level)]`, an authorization attribute applied 240 times
in `src-tauri/src` (lines that begin with the attribute; doc-comment mentions excluded), and `ipc_shard!`, a function-like
wrapper around the framework's handler-list macro. Anchors are root-relative to the
Personas checkout.

## Confirmed: errors are compile errors on the user's tokens

Neither macro panics. Every rejection is a `syn::Error` turned into a `compile_error!`
invocation, spanned to the smallest token that is wrong:

- An unknown level is reported on the level identifier and names the expected set:
  `src-tauri/macros/src/lib.rs:96 "unknown level"` and
  `src-tauri/macros/src/lib.rs:94 "level.span()"`.
- The one invalid combination - `cloud` on a synchronous function - is rejected with a
  message that offers both fixes:
  `src-tauri/macros/src/lib.rs:87 "Either make the fn async, or use #[requires(privileged)] for a sync command."`
- `ipc_shard!` rejects a wrapped macro that is not the handler list by spanning the whole
  path: `src-tauri/macros/src/lib.rs:167 "Error::new_spanned"`, with the message
  `src-tauri/macros/src/lib.rs:169 "ipc_shard! wraps exactly one"`.
- Parse failures inside the handler list are returned as the parser's own located error
  rather than unwrapped: `src-tauri/macros/src/lib.rs:178 "Err(e) => return e.to_compile_error().into(),"`.

The generated wire-name literal keeps the user's span:
`src-tauri/macros/src/lib.rs:188 "last.ident.span()"`, so a duplicate or malformed arm in
the generated `owns` match is reported on the handler entry that caused it, not on the
macro invocation.

## Deviation: the caller-side name is not validated

`#[requires]` emits a guard that reads a binding named `state` from the handler's
parameters. The macro does not check that such a parameter exists; its documentation
tells the user what will happen instead:
`src-tauri/macros/src/lib.rs:55 "uses a different name"` and
`src-tauri/macros/src/lib.rs:56 "cannot find value"`.
That is the failure the technique's step 5 names: the emitter knows its precondition and
leaves the compiler to report it as an unresolved name in generated code. The fix is
small and stays inside the macro: walk `item_fn.sig.inputs` for a typed pattern whose
identifier is `state`, and when none is found, emit a `syn::Error` spanned to the
function name saying the attribute requires a `state` parameter. The dependency on a
caller-side name is legitimate here - it is documented, which is the escape module
design's hygiene technique allows - but the diagnostic belongs to the macro. Recorded as
a deviation; not changed (read-only reconciliation).

## Deviation: no fixtures pin the diagnostics

The crate has no tests directory and no compile-fail harness dependency
(`src-tauri/macros/Cargo.toml` lists only the parser, quoting and token libraries). The
three messages above are an interface 240 call sites rely on and nothing would notice a
refactor moving them. One `trybuild` fixture per message - unknown level, sync `cloud`,
wrong wrapped macro - is the proportionate cover.

## Upward lesson

The `cloud`-on-sync rejection is a check the type system would eventually make anyway
(an `.await` in a sync body fails), but later and with a message about `.await`, not
about the attribute. Rejecting it in the macro, with both fixes named, turns a
consequence into a cause. The technique now states the general form in its step 5:
validate what the expansion depends on, not only what it parses.

## Sources

- Error type guidance: https://docs.rs/syn/latest/syn/struct.Error.html
- Compile-fail harness: https://docs.rs/trybuild/latest/trybuild/
- Procedural macro errors in the language reference: https://doc.rust-lang.org/reference/procedural-macros.html
