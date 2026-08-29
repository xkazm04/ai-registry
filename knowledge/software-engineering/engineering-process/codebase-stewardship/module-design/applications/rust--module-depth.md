---
layer: application
type: application
subject: module-design
technique: module-depth
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1
---

# Rust — a repository module growing a projection-by-filter lattice

A live tree exhibiting the lattice failure that
[module-depth](../techniques/module-depth.md) names — and, in the same
module, the typed alternative that resolves it — is the desktop agent
platform in the `personas` project checkout, database crate
`src-tauri/db/src/repos/core/personas.rs` (a ~2,000-line repository module;
tree at commit `58cf9557f`, `rust-version = "1.80.0"`), read for this
document on the `verified_on` date.

## The lattice: two dimensions, four functions

The module's list surface is the product of two variations, neither of which
changes behaviour:

| | full projection | lean projection |
| --- | --- | --- |
| **all rows** | `get_all` (`:467`) | `get_all_lean` (`:629`) |
| **filtered by lifecycle** | `get_all_by_lifecycle` (`:490`) | `get_all_by_lifecycle_lean` (`:642`) |

The filter dimension is plainly data — the lifecycle variants take
`stages: &[&str]` and an empty slice delegates to the unfiltered twin
(`:491-493`, `:643-645`), so that dimension is already half-parameterised.
The projection dimension is encoded as sibling functions, and the doc
comment on the lean row-mapper records the price:
*"Mirrors the light-field reads of `row_to_persona_with_mode` — **keep the
two in sync** when adding a persona column that the roster needs"*
(`:544-547`). Two column constants (`FULL_COLUMNS` `:363`,
`LEAN_LIST_COLUMNS` `:537`) and two row-mappers encode one decision — which
columns exist and what they mean — in two places, held together by an
instruction to remember. The technique's arithmetic also holds exactly: two
dimensions, four functions; the module's own history shows the second
dimension (lean) arriving after the first and doubling the surface.

## Where the technique's discriminator bites

The projection variation is *not* pure data, and that is the interesting
part. `row_to_persona_lean` returns the same `Persona` type with the five
heavy editor-only fields deliberately blank — `system_prompt:
String::new()`, `structured_prompt: None`, `notification_channels: None`
(`:556-567`). The variants therefore differ in **what is guaranteed** — a
`Persona` from `get_by_id` has a real prompt; a `Persona` from
`get_all_lean` has an empty string where the prompt would be, and nothing
in the type marks which kind a caller holds. By the technique's rule ("when
they differ in what is guaranteed … the variation is a unit"), the lean
projection deserves its own type, and the module itself proves the point:
it already has one for another projection — `PersonaSummary` with
`get_summaries` (`:1290`) — so the typed form is not foreign to this tree,
it is just not applied to the roster path.

## Leverage, read from the call sites

The blanked-`Persona` compromise also shows the leverage failure of
defaulting to the deep-and-heavy read. Callers that need only names call
the full-fat function: the system tray builds a name lookup from
`get_all` (`src-tauri/src/tray.rs:205-212`), and debug-path pickers do the
same to select one id (`src-tauri/src/commands/execution/knowledge.rs:98`,
`src-tauri/src/commands/tools/triggers.rs:1625`) — every such call decrypts
and materialises every heavy column to read one light one. The lean path
exists precisely because the IPC-facing roster couldn't afford that
(`src-tauri/src/commands/core/personas.rs:37-46`), but with the projection
encoded as a parallel function family rather than a parameter or a return
type, each call site independently re-decides which family to use, and the
convenient wrong default keeps winning at the sites nobody profiled.

## What the target shape would be, in the technique's terms

One list function per filter concern, parameterised by projection, with the
projection reflected in the return type (`Persona` vs a roster row) — the
variation that is data becomes a parameter, the variation that changes a
guarantee becomes a type. Recorded here as a deviation with the standard
unchanged; the module is otherwise a strong specimen of a single validation
door (every query passes through the pooled `conn` and `timed_query!`
instrumentation) and of naming its redaction modes explicitly
(`ProfileMode`, `:340`).
