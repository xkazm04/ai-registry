---
layer: application
type: application
subject: data-access
technique: layering-rules
stack: rust
verified_on: 2026-08-29
verified_against: rust@1.97
---

# Layering rules in a five-crate Tauri workspace (personas)

Citations are against `personas` at `58cf9557f` (2026-08-29), workspace
`src-tauri/` with members `.`, `macros`, `core`, `db`, `engine`
(`src-tauri/Cargo.toml:14`); `personas-db` is `rusqlite@0.38` over SQLite
behind an `r2d2` pool. The tree is the technique's best and worst case at
once: it took the strongest available form of the dependency rule — a
separate compilation unit with an explicit manifest — and then re-exported
it wholesale, so the build enforces the boundary and nobody is behind it.

## The strongest form, obtained and then waived in one line

The data layer is its own crate, described in its manifest as "SQLite data
layer for Personas — schema, migrations, repositories"
(`src-tauri/db/Cargo.toml:4`). That is the form the technique says is
"worth real restructuring to obtain": the wrong import is a build error and
the rule needs no vigilance. The restructuring was done — the split moved
84k lines out of the desktop crate — and then `src-tauri/src/lib.rs:16`
reads `pub use personas_db as db;`, with the reason at `:12-15`: the
re-export "under the old name so every `crate::db::…` path across commands,
engine and companion resolves unchanged … without touching a single call
site".

The consequence is measurable. 171 files under `src-tauri/src/` and 15
under `src-tauri/engine/src/` reference `rusqlite` directly; `engine`
carries its own `rusqlite = { version = "0.38", … }` dependency
(`src-tauri/engine/Cargo.toml:66`) beside its dependency on the data crate.
`src-tauri/src/commands/communication/persona_channel.rs` imports two
repository modules (`:33-34`) and, in the same file, hand-rolls six
`conn.prepare(` statements (`:164`, `:205`, `:254`, `:300`, `:337`,
`:536`) building a cross-table read model in the command layer. The
technique's three questions — what breaks if this column changes, where
could injection enter, who writes to this table — are answered by a
directory listing for `db/src/repos/**` and by a 186-file text search for
everything else. The crate boundary bought parallel codegen; it did not buy
an enumerable surface, because the connection type and the statement API
were exported past the layer on day one.

## Hooks, not imports — done right for two consumers and waived for a third

The upward-signal half of the technique is the tree's strongest point.
`db/src/cdc.rs` registers a change hook on every pooled connection and
must react to writes that the cloud mirror and the event bus care about —
both "live *above* the data layer" (`:275-276`). The comment states the
inversion the technique warns of in the technique's own words: calling
them directly "made `db` depend on `cloud` and `engine`, which is the
inversion that kept the data layer from being extractable into its own
crate" (`:276-278`). The fix is the technique's, exactly: `CdcHooks`
(`:281-289`) is two plain `fn()` pointers — `notify_cloud_dirty`,
`wake_event_bus` — named for what happened, carrying no handle into the
layer, injected by the composition root; and the comment adds the property
the technique's "hooks are fire-and-forget" rule implies but does not
state: "unlike a global hook registry it cannot be silently left
unregistered" (`:279-280`).

The third rule — hooks fire after the fact is durable — is honoured with
its reasoning written down. The engine's change hook fires *inside* the
writing transaction (`:3-7`), so the hook body only pushes an event onto a
bounded channel; the wake-up is signalled from the drain task, "rather than
the update hook so the writing transaction has effectively committed by
the time the tick's `claim_pending` runs; in the rare case the tick still
races the commit and claims nothing, the retained poll heartbeat picks the
event up next interval" (`:397-401`). That is a hook ordered after commit,
with the residual race named and covered by a fallback instead of assumed
away.

And then the third consumer: the UI. `db/Cargo.toml:73-74` declares a
dependency on the desktop framework — "`cdc` emits change events to the
frontend, so it takes a `tauri::AppHandle`" — and `cdc.rs:24` imports it,
calling `app_handle.emit(…)` from inside the data crate (`:409`). The same
file that inverted two upward dependencies into injected functions kept
the third as an import, and the manifest comment presents it as a fact
rather than a choice. By the technique, the frontend emit is a hook like
the other two: a `fn(&str, &Event)` injected at the same composition
point, and the data crate compiles with no UI framework in scope. As it
stands, the "data layer" crate cannot be built, tested or reused without
the application shell it is supposed to sit beneath.

## Reconciliation summary

Confirmed: the strongest structural form of the dependency rule (a
separate crate with a manifest); upward signals inverted into injected
function pointers, with the "cannot be left unregistered" property stated;
hooks ordered after commit with the residual race written down and
covered. Deviations: the crate's entire surface re-exported to preserve
call sites, so the connection type and statement API are available to 186
files outside the layer and the enumerable-surface property is lost; a
second engine dependency declared in a consumer crate; a command module
that imports repositories and hand-rolls statements beside them; and the
UI framework imported into the data crate for one emit call that the
tree's own `CdcHooks` pattern already shows how to invert.
