---
layer: application
type: application
subject: markdown-vault
technique: editor-interop
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.96
applied: experiment
ab_verdict: better
---

# Atomic replace, measured on the filesystem that makes it awkward (Rust)

*Verified against the project tree at `bf2a1e249`.*

"Atomic replace on every write — temp sibling, then rename over the target" is
the kind of rule that gets agreed to in review and then not applied, because the
cost of not applying it is a defect nobody can reproduce on demand. This tree
offered a clean case: the same product, two crates, one rule, applied in one of
them.

## The seam

The app crate has the primitive and a doc comment that states the technique
better than the technique does — `atomic_write` at
`src-tauri/src/commands/obsidian_brain/mod.rs:59`, explaining that
`std::fs::write` "truncates the destination first and then streams bytes", that
the rename is atomic "on the same filesystem (POSIX rename semantics; Windows
MoveFileEx-equivalent)", and that on rename failure the temp sibling is cleaned
up "so we don't accumulate `.tmp` siblings under the vault". The reaper is named
at creation, exactly as the law asks.

The MCP sidecar writes notes into the same vault and does not use it.
`src-tauri/src/mcp_server/tools.rs:1471` is a bare
`std::fs::write(&full, body)`. Same vault, same human, same Obsidian window —
the guest that inherited the rule and the guest that did not, inside one
repository.

## Why experiment and not code

The change itself is one line. The gate is the problem: no test in this tree
exercises the sidecar's write path, tearing is a race rather than a return
value, and `cargo check` cannot see the difference between the two policies at
all. Building the crate proves the edit compiles, which is not the claim. So the
A/B ran outside the product: a harness that reproduces the two syscall sequences
directly against the real filesystem, with a concurrent reader standing in for
Obsidian's renderer, and no product code changed.

## A and B

**A** — `writeFileSync(note, body)`: truncate, then stream. The semantics of
`std::fs::write`.

**B** — write `note.tmp`, then `rename` over `note`; on rename failure remove
the temp and surface the error. The semantics of `atomic_write`.

Both wrote a 4 MB note sixty times while a separate process reopened and re-read
it in a loop, classifying each read as whole (frontmatter intact, body a single
generation's marker, terminated) or torn. Four runs, NTFS.

## What was read

| policy | reads | torn | write errors (of 240 rounds) |
| --- | --- | --- | --- |
| A — truncate + stream | 80 | 16 (20%) | 0 |
| B — temp + rename | 71 | 0 | 58 (24%) |

Policy A tore in three of the four runs, with per-run rates from 0% to 32%.
Policy B never produced a torn read. The verdict on the technique's actual claim
is better, and it is a measurement rather than an appeal to POSIX.

The second column is the part worth carrying. On Windows, renaming over a target
another process holds open fails, so B converted roughly a quarter of its writes
into errors. That is not a refutation — a failed write the caller is told about
is categorically better than a corrupt note the caller is not, and the sidecar's
`Err(format!("write {}: {e}"))` does tell the caller. But it means "just use
atomic_write" is incomplete advice on this platform: the temp-and-rename
primitive needs a bounded retry, or the same reader that used to see half a note
will now see an unchanged one and no error anywhere it looks.

## The structural fact

The technique frames atomic replace as a discipline the application adopts
toward the human's editor. What this tree shows is that the discipline is
adopted per *crate*, not per product, and that the boundary where it lapses is
invisible from the vault. The app crate carries `atomic_write` twice over — the
sibling application document for `vault-as-database` records another copy at
`graph.rs:513-527`, with a unique-uuid temp name — while the sidecar, which is
the process an external MCP client actually drives, writes the naive way. The
vault cannot tell the two writers apart, the human cannot either, and the rule
propagated along crate boundaries instead of along the shared resource it exists
to protect. A shared store needs its write primitive owned by the store's
abstraction, not by whichever module happened to learn the lesson.

## What this cannot do or prove

The harness is not Obsidian. Its reader reopens the file as fast as the loop
allows, which is far more aggressive than a renderer refreshing on a watcher
event; that inflates both A's torn rate and B's rename-collision rate, and
neither number should be quoted as what a user would experience. The measured
claim is directional and ordinal — A tears and B does not — not a rate.

It also proves nothing about a 2 KB note, which is the common case; a small
write may complete inside a single reader's window often enough that A looks
clean for a long time. That is the property that makes this defect ship: it is
size-dependent, load-dependent, and absent from every small-input test.

And atomicity is not concurrency control. Neither policy arbitrates a
read-modify-write race between the sidecar and the human editing the same note —
the app crate's own doc comment says so, and it remains true. B guarantees the
reader sees old-or-new; it does not guarantee the new is not an overwrite of an
edit the human made thirty seconds ago.
