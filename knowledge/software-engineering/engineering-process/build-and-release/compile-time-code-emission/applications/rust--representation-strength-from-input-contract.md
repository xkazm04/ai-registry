---
layer: application
type: application
subject: compile-time-code-emission
technique: representation-strength-from-input-contract
stack: rust
status: forged
verified_on: 2026-11-11
verified_against: rust@1.96.1
---

# One crate, two input contracts, two parse strengths

Read-only reconciliation against the Personas desktop app at commit `8d076db46a`, crate
`src-tauri/macros` (toolchain 1.96.1). The crate's two macros sit on opposite sides of the
technique's rule, and each chose the strength its input promises. Anchors are
root-relative to the Personas checkout.

## Guaranteed host code: the full tree

`#[requires(level)]` is an attribute on a function, so its item is guaranteed to be a
function. It parses it as one, `src-tauri/macros/src/lib.rs:61 "parse_macro_input!(item as ItemFn)"`,
with the parser's `full` feature enabled in `src-tauri/macros/Cargo.toml:13 "features ="` (the `full` feature),
and then reads typed fields instead of matching tokens: asynchrony from
`src-tauri/macros/src/lib.rs:63 "item_fn.sig.asyncness.is_some()"` and the name from
`src-tauri/macros/src/lib.rs:64 "item_fn.sig.ident.to_string()"`. Asynchrony decides which
guard is emitted; hand-matching an `async` keyword among visibility modifiers, attributes
and generics is exactly the re-derived grammar the full tree removes.

The re-emission is additive in the sense of the subject's additive technique: attributes,
visibility, signature and every original statement are interpolated back, with one guard
statement prepended - `src-tauri/macros/src/lib.rs:115 "#guard_stmt"` followed by
`src-tauri/macros/src/lib.rs:116 "#(#stmts)*"`.

## A little language: a narrow parser, and the original tokens passed through

`ipc_shard!` wraps an invocation of the framework's handler-list macro. Its outer input
is host syntax - a macro invocation - so it parses that much:
`src-tauri/macros/src/lib.rs:160 "parse_macro_input!(input as syn::Macro)"`. The list
inside is the framework's little language, and the macro does not parse it as anything
broader than it needs: a custom grammar of outer attributes then a path,
`src-tauri/macros/src/lib.rs:132 "input.call(syn::Attribute::parse_outer)?"`, applied as a
comma-terminated sequence,
`src-tauri/macros/src/lib.rs:175 "Punctuated::<ShardEntry, syn::Token![,]>::parse_terminated"`.

Then it re-emits the wrapped invocation untouched,
`src-tauri/macros/src/lib.rs:204 "#inner,"`, so the framework's own macro still receives
exactly what the user wrote, with the user's spans. The doc comment states the intent:
`src-tauri/macros/src/lib.rs:142 "re-emitted"`. This is the technique's "parse no deeper
than the decision needs": the wrapper decides only which wire names it owns, so it parses
names and carries the rest through.

## Confirmed: the parse rejects rather than filters

`parse_terminated` with a typed entry grammar fails on a missing separator or a stray
token instead of skipping it, and the failure is returned as a located error
(`src-tauri/macros/src/lib.rs:178 "Err(e) => return e.to_compile_error().into(),"`). That
is the opposite of the permissive filter-based extractor the technique warns about, where
a list with its commas removed is silently read as the list.

## Upward lesson: keep what people edit in source

The module that hosts the shards declares them outside the macro on purpose:
`src-tauri/src/ipc_shards/mod.rs:41 "Declared outside the macro on purpose"` and
`src-tauri/src/ipc_shards/mod.rs:42 "emitted by a macro is invisible to it."`
The formatter only reaches modules it can find in source. That observation shaped the
additive technique's section on keeping editable structure in source, and it is the
reason the handler lists stay in eight plain files that contributors append to, with the
macro consuming them.

## Sources

- Language reference, procedural macros take and return token streams: https://doc.rust-lang.org/reference/procedural-macros.html
- Quasi-quoting and interpolation: https://docs.rs/quote/latest/quote/macro.quote.html
