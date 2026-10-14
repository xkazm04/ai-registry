---
layer: application
type: application
subject: error-handling
technique: containment-boundary-restores-state
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.90
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# An open-source word processor contains at four doors and restores one way

The version witness is the workspace manifest's `rust-version` at
`Cargo.toml:10 "rust-version"`, read from a clone pinned at commit
`04f6f53`. The product is an 85k-line editor whose written standard is "a crash
loses their work", and its tree is the clearest realization of the technique
found so far, including the places where it stops.

## What the tree does

**One chokepoint, one failure shape.** Every user-visible action is a command run
through one session method. The command body runs inside an unwind catch at
`crates/engine/src/session.rs:1198 "std::panic::catch_unwind"`, and the caught
payload becomes the ordinary failure value at
`crates/engine/src/session.rs:1203 "panicked"`. Because it is the same value an
ordinary failed command returns, the single restore branch that handles an error
also handles a panic: `crates/engine/src/session.rs:1246 "before_doc"` puts the
document, selection, both history stacks, the typing-group flag, the eviction
counter and the column state back.

**The snapshot is whole.** The comment above the snapshot states the reason the
technique gives for it:
`crates/engine/src/session.rs:1161 "snapshotted whole, not as a length"`. Nested
commands run their own checkpoints and undos and evict at the limit, so a restored
length would lose the evicted entries. The snapshot is affordable because blocks
are shared by reference: the architecture document records that snapshots are cheap
for that reason.

**Three more doors, each at a trust edge.** A third-party web-font decoder reads
user-supplied bytes behind its own catch
(`crates/fonts/src/fontdb/user.rs:164 "third-party code reading"`), and a caught
panic becomes the same "damaged file" error the decoder's own rejection returns.
The reference-manager protocol handler wraps its dispatch
(`crates/zotero/src/bridge.rs:184 "pub fn handle"`), answers with the protocol's
error reply, and clamps the selection back into range first. The reporting hook
installed by the desktop app logs every panic, caught or not
(`apps/wordcraft/src/logging.rs:326 "set_hook"`), and its module header says
text a panic message quotes between backticks is dropped because it can be the
user's writing (`apps/wordcraft/src/logging.rs:21 "Text a panic message quotes"`).

**The net is paired with prevention and a sweep.** Production crate roots deny the
panicking constructs by lint; a test runs every registered command with junk
parameters (`crates/engine/src/tests.rs:1977 "fn hostile_params_never_panic"`).
The sweep skips the commands that reach outside the session, which the test says
in a comment, and tries four junk values per command.

## The experiment

Arm A is the tree as it is. Arm B is the technique's checklist read over the
fleet's Rust workspaces with per-project `git grep`: is there a catch at the
mutation chokepoint, at each foreign-bytes door, and is the report hook scrubbing
quoted text. Result: all three fleet workspaces read have unwind catches at their
job or tick boundaries, and two of them also wrap a third-party parser fed
file bytes (a PDF text extractor, an inference-runtime loader), so the
chokepoint half is already practised. I did not read the report hooks of the
three. None of them restores a document, because none of them holds one. The seam is not a gap in those projects, it is a boundary
case: where the state is a database row or a queue item, "restore" is a
transaction rollback and the catch only has to convert, which the technique's
opening paragraph does not say. The technique was amended in this landing to name
that case.

## What the realization cannot do

The catch does not exist where panics abort. The web build of the same editor
targets a platform on which unwinding is unavailable, and the font door's own
comment says its catch is native-only, so on that target the lint set is the only
defence. The tree states this in one comment
(`crates/fonts/src/fontdb/user.rs:165 "caught (native)"`) and nowhere in its written standard;
the standard promises that a panic becomes an error and restores the document
without saying on which targets. That is the technique's final section, observed
as an omission in a project that otherwise practises everything above it.
