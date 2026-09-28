---
layer: application
type: application
subject: module-design
technique: emitted-code-names-from-a-root
stack: rust
status: forged
verified_on: 2026-09-25
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Rust — exported pattern macros after a crate split

Witness: the observed toolchain (rustc 1.96.1); the data-layer crate declares
`rust-version = "1.80.0"` as its floor.

A desktop application's SQLite data layer exports nine `macro_rules!` macros
with `#[macro_export]`: two SET-clause builders, a row-mapper generator, four
CRUD generators (`get_by_id`, `get_all`, `delete`, `update`), a timing wrapper,
and a lab-run CRUD family. About forty repository modules invoke them, all
inside the data-layer crate, reached through `#[macro_use]`.

When the data layer was extracted from the application crate, the path
rewrite broke `$crate::error::AppError` inside the bodies, and the fix routed
own types through `$crate::` with the core crate re-exported for the purpose —
"so the macros keep working wherever they expand". That fixed the one class
the split had exposed. The bodies still named `rusqlite::`, `chrono::`, the
sibling macros (`push_field!`, `timed_query!`) and their own internal arms
(`row_mapper!(@get …)`, `crud_update!(@push …)`) bare, along with `Result`,
`Box`, `Ok`, `Some` and `format!`. `macro_rules!` hygiene is mixed-site:
locals are enclosed automatically, paths and items resolve where the macro
expands. Every in-crate call site compiled, because every one of them had the
crate's dependencies and the `#[macro_use]` textual scope.

## Arms

Probes were two temporary workspace crates, one test target per macro, each
invoking the macro by path with nothing from the data layer imported and
referencing every item the invocation asked for.

| arm | peer crate (db + rusqlite + chrono) | thin crate (db only) | caller with `type Result<T>` alias | in-crate `cargo check --all-targets` |
| --- | --- | --- | --- | --- |
| A — as-is | 6/9 | 2/9 | 0/6 | green |
| B1 — literal rule: item macros wrapped in `const _: () = { … };` | 0/9 (db fails) | 0/9 | — | **red, 240 errors** (`cannot find function get_by_id` …) |
| B2 — roots for everything not passed in; products left visible | **9/9** | **9/9** | **6/6** | green |

B2 spells own items and sibling macros as `$crate::…`, re-exports `rusqlite`
and `chrono` from a `#[doc(hidden)] pub mod __rt` inside the macros module,
and writes std as `::std::…`. `crud_update!` still calls the caller's
`get_by_id`, and its documentation names that obligation.

Positive controls: the three A-failing macros compile in A when the caller
imports the helpers the way in-crate callers get them (3/3) — so A's failures
are dependencies on the caller's imports, not malformed probes. A probe that
references a never-generated item fails in both arms. Floor negative
controls: misspelling one `$crate::perf::record_query` path turns the in-crate
check red at 5 sites; dropping the `id` parameter from `crud_update!` turns
two repository CRUD tests red.

Floor held: the in-crate check green in A and B2; clippy on the library green,
the 18 pre-existing lib-test clippy findings identical in both arms; the
repository tests for the macro-using modules (lab, teams, credentials,
assertions, connectors, automations) 43/43 in both.

## What the tree corrected

The technique's source stated the second half as "bind nothing the caller can
see". The B1 arm is that sentence applied to item-emitting macros, and it
deleted the products. The landed rule is "bind only what the invocation or the
documentation named". The tree also produced the one caller-scope dependency
no root can reach — the update generator re-reading through the caller's
generated lookup — which the technique now carries as a documented
obligation rather than a violation.

The fix ships with a foreign-caller regression test (by-path invocations, a
shadowing `Result` alias, every product referenced): red on the old macros
with 27 errors, green on the new.
