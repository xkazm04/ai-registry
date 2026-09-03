---
project: source tree (not a fleet project) - github:kube-rs/kube
run: intake-kube-rs-0903
subject: software-engineering/operations/control-plane-operations/declarative-resource-lifecycle - technique deletion-blocked-until-dependents-confirm
technique: deletion-blocked-until-dependents-confirm
mode: task
branch: intake/deletion-marker-uid-precondition - exported as `2026-09-03-kube-rs-source-tree-task.patch` beside this file (commit b839c0a over base 7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e); the clone is deleted at Phase 9. Re-apply with `git clone <url> && git am <patch>`.
size: 1 file / 147 insertions, 51 deletions / S
status: landed on the branch; not pushed; no PR opened
---

# Task: the marker removal names the record, not just the slot

**Why a task against the source tree.** The application forged this run
(`applications/rust--deletion-blocked-until-dependents-confirm.md`) is against
`kube-rs/kube`, which no fleet project consumes, so the standing rule puts one `task`
row against the source itself, drawn from the recorded deviations. Deviations 1, 3 and 4
are addressed here.

**The seam.** `kube-runtime/src/finalizer.rs:156-176` (pre-change). After `Event::Cleanup`
returns `Ok`, the removal is a JSON Patch of two operations against
`/metadata/finalizers/{finalizer_i}`: a `Test` that the slot still holds our finalizer
name, then a `Remove` at the same pointer. The `Test` fences the positional hazard the
technique names — another owner shifting the list under us — and nothing else. The name at
index *i* is byte-identical across incarnations of an object, so a delete / recreate under
the same name / re-finalize race between the `Cleanup` await and the patch removes the
**new** object's marker: a hold released whose cleanup never ran, produced by the mechanism
that exists to prevent exactly that (deviation 4). The tree already owns the primitive for
the "still the object I meant" question on the delete side —
`DeleteParams::preconditions` (`kube-core/src/params.rs:786-790`) — and the helper never
reached for its patch-side equivalent.

Secondarily, the module had **zero** `#[test]` or `#[tokio::test]` items (deviation 1), so
both `Test` operations — the whole guard — were unexercised, and the caveat named the
deadlock without either of its two exits (deviation 3).

**What changed.** One file, `kube-runtime/src/finalizer.rs`.

1. Patch construction is factored out of the `async fn` into two pure functions —
   `remove_finalizer_patch(finalizer_name, finalizer_index, uid) -> Result<json_patch::Patch, InvalidFinalizerPath>`
   (`:209`) and `add_finalizer_patch(finalizer_name, finalizers)` (`:236`). Pure-function
   first: no mock API, no server, no async in the test path. The private
   `InvalidFinalizerPath` marker maps to the existing `Error::InvalidFinalizer` at both
   call sites, so the public error enum is untouched.
2. `remove_finalizer_patch` prepends a `Test` on `/metadata/uid` (`:218`) when the object
   has a uid, taken from `obj.meta().uid` and captured (`:158`) *before* `obj` moves into
   `reconcile(Event::Cleanup(obj))`. The index `Test` and the `Remove` are unchanged and
   still present; an object with no uid gets exactly the two-operation patch it got before.
3. Four unit tests in `#[cfg(test)] mod tests` (`:291`) assert the serialized patches:
   removal with a uid is `[test /metadata/uid, test /metadata/finalizers/1, remove
   /metadata/finalizers/1]`; removal without a uid omits the uid op and nothing else;
   both add shapes (empty list → test `null` + add array; non-empty → test whole list + add
   at `/-`) are byte-for-byte what they were.
4. Doc comment: `# Guarantees` states the uid precondition; `# Caveats` names the two exits
   from a stuck delete and no third — restore the controller and let it finish, or an
   operator strips the finalizer by hand, which abandons the cleanup and leaks what it
   protected.

**How it was verified.** `cargo test -p kube-runtime finalizer` (cargo 1.97.1) —
`4 passed; 0 failed; 0 ignored; 82 filtered out`, compile of the workspace crates in 3.75s,
so the full-build fallback was not needed. `cargo clippy -p kube-runtime --tests` finished
clean (`#![deny(clippy::all)]`, `#![deny(clippy::pedantic)]` per `kube-runtime/src/lib.rs`).
Formatting: the repo formats with **nightly** rustfmt (`just fmt` → `cargo +nightly fmt`)
and its `rustfmt.toml` sets seven nightly-only options; no nightly toolchain is installed
here, and stable `cargo fmt -p kube-runtime` proposes edits in eight files it did not
write. So `rustfmt --edition 2024` was run on `finalizer.rs` alone and the hunk list
checked: every hunk falls inside the new code. A maintainer with nightly should re-run
`just fmt`; the only likely delta is `overflow_delimited_expr` re-collapsing the
`assert_eq!(as_json(&patch), json!([...]))` calls.

**The measurable.** Before: the removal patch carries 2 test/remove operations, 0 of which
constrain object identity; 0 tests cover `finalizer.rs`; a delete/recreate/re-mark race
removes the new object's finalizer. After: 3 operations when a uid is present, 1 of which
is the identity precondition — the API server rejects the patch with a `test` failure, the
error surfaces as the existing `Error::RemoveFinalizer`, and the next pass recomputes
against the live object; 4 tests cover the patch builders, including the guard's shape.
Objects without a uid: unchanged, and asserted so.

**What a maintainer would need to review.** Three things, in order. (a) Is a failed uid
`test` acceptable as `Error::RemoveFinalizer` rather than a distinct variant? It routes
back into the reconcile loop the same way the index test does, which is the existing
contract, but it is a new failure cause under an old name. (b) The uid is read from the
cached object handed to `finalizer()`, not re-fetched — correct for this purpose (it is the
identity cleanup ran against) but worth stating out loud. (c) The `Option<&str>` arm: an
object with no uid is only reachable for hand-built objects and some fake/mocked clients,
so making the op conditional is a compatibility concession, not a live case; a maintainer
may prefer to require it.

**Not done, and left as-is.** Deviation 2 (the stale finalizer comment at
`kube/src/mock_tests.rs:97`) is in another crate and unrelated to this seam. Deviation 5
(`propagation_policy` defaulting off the finalizer set) is a documentation question for
`kube-core`, not a change to this helper. No integration or e2e test was added: both
classes require a live cluster per `CONTRIBUTING.md`, and none was available.

**applied row.** mode `code`; verdict **better** — the removal patch gained an identity
precondition that closes a named race with no behaviour change for objects without a uid,
and the previously untested guard is now asserted by four passing unit tests
(`cargo test -p kube-runtime finalizer`: 4 passed, 0 failed). Measured on the tree, not
argued.
