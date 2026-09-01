---
layer: application
type: application
subject: concurrency-guards
technique: atomic-file-publish
stack: rust
status: forged
verified_on: 2026-09-01
verified_against: rust@1
---

# Atomic file publish in Personas (Rust + Tauri, shipping on Windows)

Personas is a Tauri desktop app developed and shipped on Windows, and it
publishes many files other processes read: vault notes Obsidian holds open, a
port/token file a terminal session polls, the Claude Desktop MCP registry, a
roadmap cache, and the lock files every instance polls. Roughly a dozen sites
do temp-then-rename. **Not one retries the rename.** `git log --all
-S"ERROR_ACCESS_DENIED"` and `-S"sharing violation"` return zero commits — the
writer's half has never been attempted, on the one platform where it is not
free.

The sting is that the repo already knows how — on a different call. Verified
against `rust@1` (toolchain 1.97.1; MSRV 1.80.0) at HEAD `b6dcf28aa`.

## The discipline exists in this repo, on the wrong operation

`scripts/i18n/split-locales.mjs:25-48` is the technique's retry loop, complete
and correct, wrapped around `rmSync` instead of a rename. Six attempts,
100/200/300/400/500 ms backoff, and an explicit transient set — `EBUSY`,
`EPERM`, `ENOTEMPTY` — with everything else and the final attempt rethrown
immediately. Its comment (`:27-31`) names the population the technique
describes: "Windows can hold transient locks on locale JSON files (AV scanner,
Search Indexer, recently-closed editor). A single fs.rmSync racing against
those crashes the dev server with EBUSY."

Landed by `86d792ffe`. The classification rule, the bound and the backoff are
already written, reviewed and shipping; they were simply never carried to the
publish path. `docs/concepts/golden-paths/codegen-task-registration.md:620-624`
records the missing half — `renameSync` over an existing target fails
`EPERM`/`ENOTEMPTY` on Windows, a correct atomic replace "is a real
engineering task and not a three-line fix", and that "is the reason
`split-locales.mjs` already carries a six-attempt EBUSY retry loop."

## The publishers, and what each one already knows

**`src-tauri/src/commands/obsidian_brain/mod.rs:59-71`** (`atomic_write`,
landed by `2dada15af`) writes `<path>.tmp`, renames, and on error removes the
temp and propagates. Its doc comment (`:56-58`) names the exact failure — "on
rename failure (e.g. target file is open elsewhere on Windows), the temp file
is best-effort cleaned up". Cleanup is right (the reaper rule); propagate is
the gap, because that handle belongs to Obsidian or the scanner and is going
away on its own. Eleven call sites publish vault notes through it.

**`src-tauri/src/commands/obsidian_brain/graph.rs:516-527`** (`d082fe04e`) —
same shape plus a per-call UUID temp name (`:518`); its comment claims "a
concurrent reader can never observe a torn note" — true of the reader, silent
about the writer that reader can block.

**`src-tauri/src/commands/live_roadmap.rs:376-397`** states the platform claim
outright (`:386-387`): "`fs::rename` is atomic on POSIX and on Windows
(MoveFileEx semantics for same-volume rename)". The same-volume reasoning is
worth keeping; the atomicity claim is the wrong half. `MoveFileEx` documents
only that `MOVEFILE_REPLACE_EXISTING` replaces contents subject to ACL
conditions, promising nothing about atomicity or an open destination, and in
practice returns `ERROR_ACCESS_DENIED` while a reader's handle is live because
`std::fs::rename` does not pass `FILE_RENAME_POSIX_SEMANTICS`
(rust-lang/rust#123985).

Three sites are worse than un-retried. `src-tauri/src/local_http/mod.rs:203-238`
publishes the port/token file that a terminal session is documented to read,
and on `persist` failure logs a warning and **returns** — a skipped write
spelled as success, leaving the poller a stale file
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
`src-tauri/src/companion/brain/{goals,procedural,semantic,rituals}.rs`
(`:248`, `:310`, `:509`, `:229`) discard the result outright — `let _ =
fs::rename(&src, &dst);`. And `mcp_integration.rs:133,171` hand-roll the
pattern with a fixed `.json.tmp`, re-introducing the clobber `graph.rs` fixed.

## The worst instance: the heartbeat that relinquishes leadership

`src-tauri/src/daemon/lock.rs:230-248` (`heartbeat`) is the best-built
publisher here — temp opened explicitly, `sync_all`ed (`:244`, the only
durability flush on any publish path), renamed. It is also where a refused
rename costs most: the lock file is rewritten every 30s and *polled by every
contender*, so an open handle on the destination is the design, not an edge
case — and `src-tauri/src/engine/leadership.rs:173-178` treats any heartbeat
error as loss of tenure ("engine leadership heartbeat failed — relinquishing
leadership").

So a sharing violation raised by a contender's own read makes the sitting
leader stand down and the singleton loops stop. Relinquish-on-failure is
itself correct — a holder that cannot prove its lease must not act on it
([cross-process-exclusion](../techniques/cross-process-exclusion.md)); what is
wrong is feeding that rule an error meaning "someone is reading right now".
That is the conversion at its most expensive: not a torn read, but leadership
churn. The cheap version is still data loss — `obsidian_graph_append_daily_note`
reads, appends, publishes, so a refused rename drops the append after the
merge was computed. On Windows only, under conditions no Linux CI reproduces.

## What the repo owes the technique

1. **One publish door.** A dozen implementations already disagree — UUID temp
   names in three, fixed `.tmp` in the rest, `sync_all` in one, error discarded
   in four. Collapse to one helper (`graph.rs`'s base plus `lock.rs`'s flush)
   and route every site through it, including the sidecar's plain `fs::write`
   at `mcp_server/tools.rs:1471`.
2. **Port the retry that already exists.** Lift `split-locales.mjs`'s
   classify-and-back-off shape onto rename: match `raw_os_error()` against
   `ERROR_ACCESS_DENIED` (5), `ERROR_SHARING_VIOLATION` (32),
   `ERROR_LOCK_VIOLATION` (33); retry only those; propagate the rest at once.
3. **Bound it and spell exhaustion.** Cap attempts and elapsed time; return an
   error naming the held destination, attempts and wait, not a bare "Access is
   denied" sending the next reader after a permissions bug. For `heartbeat`,
   only exhaustion should reach `tick`'s relinquish branch.
4. **Never discard the result**, and fix the comments either way. `let _ =
   fs::rename(...)` and warn-and-return are the silent-skipped-write the retry
   exists to avoid; `live_roadmap.rs:386-387` teaches the next author the wrong
   thing. Honest wording: atomic *for readers*, refusable *for the writer*.

## Citations re-opened at HEAD

Re-read at `b6dcf28aa` on 2026-09-01: `scripts/i18n/split-locales.mjs:25-48`,
`obsidian_brain/mod.rs:45-71`, `obsidian_brain/graph.rs:510-527`,
`live_roadmap.rs:376-397`, `mcp_integration.rs:127-134,166-172`,
`local_http/mod.rs:203-238`, `daemon/lock.rs:230-248`,
`engine/leadership.rs:168-190`, `Cargo.toml:108-115`. No rename retry and no
error classification exists on any publish path in `src-tauri/`; `sync_all`
appears only at `lock.rs:220,244`.
