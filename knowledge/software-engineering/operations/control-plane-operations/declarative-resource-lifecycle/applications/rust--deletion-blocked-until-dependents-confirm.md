---
layer: application
type: application
subject: declarative-resource-lifecycle
technique: deletion-blocked-until-dependents-confirm
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# Deletion markers in the kube-rs controller runtime

Citations resolved on 2026-09-03 against `kube-rs/kube` at commit
`7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`. The version witness is the tree's
own workspace manifest: `Cargo.toml` declares `rust-version = "1.89.0"` under
`[workspace.package]` (line 27), and `version = "4.2.0"` for the crates it
publishes — so `rust@1.89` is what this tree states about itself, not a
toolchain inferred from the environment. There is no `rust-toolchain.toml`.

Kubernetes calls the marker a **finalizer**: a string in
`metadata.finalizers`. The API server honours it by refusing to complete a
deletion while the list is non-empty — it sets `metadata.deletionTimestamp`
and leaves the object in place. `kube-runtime`'s `finalizer()` helper
(`kube-runtime/src/finalizer.rs:127-232`) is one controller's side of that
contract, and it is a compact, faithful realization of the technique.

## The four-arm state machine

`FinalizerState` (`:56-73`) computes exactly the two facts the technique
names: `finalizer_index` — the position of *our* name in the list, `None` if
absent — and `is_deleting`, which is `obj.meta().deletion_timestamp.is_some()`
(`:70`). The `match` at `:138-231` has four arms and no default:

| arm | lines | act |
|---|---|---|
| marker present, not deleting | `:139-144` | run `Event::Apply` |
| marker present, deleting | `:145-178` | run `Event::Cleanup`, then remove the marker |
| marker absent, not deleting | `:179-223` | add the marker, apply nothing |
| marker absent, deleting | `:224-230` | `// Our work here is done` |

**Claim custody in one pass, act in the next** is realized literally. The
third arm ends `Ok(Action::await_change())` with the comment `// No point
applying here, since the patch will cause a new reconciliation` (`:221-222`),
and the preceding comment states the rule as a rule: `// Finalizer must be
added before it's safe to run an 'Apply' reconciliation` (`:183`). Nothing is
applied in the pass that claims custody, and the claim's own write is the
trigger for the next one.

**A failed cleanup keeps the marker** is the `?` at `:154`, annotated
`// Short-circuit, so that we keep the finalizer if cleanup fails` (`:153`).
The removal patch at `:157-176` is unreachable unless cleanup returned `Ok`.

## The guarded compare-and-remove, and why the guard exists

The removal is a JSON Patch of two operations against
`/metadata/finalizers/{finalizer_i}` (`:156`): a `Test` that the position
still holds `finalizer_name`, then a `Remove` at the same pointer
(`:164-172`). The rationale is inline at `:161-163`:

> `// All finalizers run concurrently and we use an integer index`
> `// Test ensures that we fail instead of deleting someone else's finalizer`
> `// (in which case a new Cleanup event will be sent)`

That is the positional-index hazard, named and fenced, with the failure
routed back into the loop rather than logged — a failed `Test` surfaces as
`Error::RemoveFinalizer` (`:176`) and the next pass recomputes the index.

The **addition** is guarded too, in two shapes (`:184-213`). When the list is
empty the patch tests `/metadata/finalizers` against `Null` and adds the
whole array; when it is not, it tests the entire current list and appends at
`/metadata/finalizers/-`. The comment at `:199-201` gives the force:
Kubernetes does not deduplicate finalizers, so a concurrent add by another
party must make this write fail and retry — otherwise the same name lands
twice and one copy becomes a hold nothing will remove.

## The guarantee and its cost, stated together

The doc comment does what the technique demands of an operator-facing
mechanism: it states the deadlock beside the guarantee, one after the other.

> `# Guarantees` — "If `Event::Apply` is ever started then `Event::Cleanup`
> must succeed before the Kubernetes object deletion completes." (`:99-101`)

> `# Caveats` — "Object deletes will get stuck while the controller is not
> running, or if `cleanup` fails for some reason." (`:112-114`)

Re-runnability is spelled out at `:105-110`, including the cancellation
clause the technique insists on: both branches "must both be idempotent, and
tolerate being executed several times (even if previously cancelled)", and
cleanup "must tolerate `Event::Apply` never having ran at all, or never
having succeeded. Keep in mind that even infallible `.await`s are
cancellation points." The `Event` enum repeats it per variant (`:238-253`).
Marker-name uniqueness is an assumption, stated: "`finalizer_name` must be
unique among the controllers interacting with the object" (`:105`).

## The rejected alternative, rejected in the tree

`kube-runtime/src/watcher.rs:56-62` documents `Event::Delete` with the
warning the technique's rejected-alternative section argues for:

> "NOTE: This should not be used for managing persistent state elsewhere,
> since events may be lost if the watcher is unavailable. Use Finalizers
> instead."

And the boundary against ownership edges is stated at the top of the worked
example, `examples/secret_syncer.rs:3-5`: "This is designed to demonstrate
how to use finalizers, but is not in itself a good use case for them. If you
actually want to clean up other Kubernetes objects then you should use
`ownerReferences` instead and let k8s garbage collect the children." That is
the technique's *when not to use this*, written by the library authors about
their own example. The wiring is at `:89-100`.

## The fleet already runs the degraded case, under another name

The technique's degraded form — an application-level marker plus a guarded
compare-and-act — is already in production in this fleet. `tracklight`'s job
lease reclaim (`crates/store/src/sqlite/jobs.rs:106-125`) proves custody with
a fence token inside the write rather than before it, and reads the affected
row count as its verdict: *"Zero rows means this caller no longer holds the
job — the affirmative evidence its work loop needs to stop, rather than a
guess."* Same guarded compare-and-act, different scope: a lease over one job
rather than a hold on a record's existence. The relevance is that the
positional-guard discipline is not exotic — a project with SQLite and no
control plane already needed it, and got it right, because the alternative
was a caller acting on a job it had lost.

## Deviations recorded against the technique

1. **The state machine has no test.** `kube-runtime/src/finalizer.rs`
   contains zero `#[test]` or `#[tokio::test]` items. The only assertions in
   the tree that name finalizers are `kube/src/lib.rs:383` and `:391`, which
   exercise the `ResourceExt` accessors (`finalizers_mut().push(...)`, then
   `finalizers().contains(...)`) on a list fetched from a cluster — the
   accessor, not the guarded add/remove. The guarantee at `:101` and both
   `Test` operations are unexercised, and a guard whose failure path is never
   run is where a refactor drops the `Test` without anything going red.

2. **A stale comment claims a finalizer assertion that no longer exists.**
   `kube/src/mock_tests.rs:97` reads `// We expect a json patch to the
   specified document adding our finalizer`, and the three assertions beneath
   it check a paginated `GET` carrying `limit=` and `continue=` tokens
   (`:98-101`). The comment survived a scenario the file no longer contains.

3. **The two operator escapes are not named.** The caveat at `:114` states
   the deadlock and stops. Neither escape the technique requires — restoring
   the owner, or an explicitly recorded abandonment — appears anywhere in the
   module, so an operator reading the only documentation the mechanism has is
   left with waiting as their sole option. The standard keeps both, and keeps
   the rule that a manual strip is logged as an abandoned cleanup rather than
   a completed delete.

4. **The removal is guarded on the name at a position, not on the record's
   identity.** `:157-176` patches with `PatchParams::default()` and a `Test`
   on the marker string only. A record deleted, recreated under the same
   name, and re-marked between the `Cleanup` await and the patch would have
   the *new* owner's marker removed — the `Test` compares the name at index
   *i*, which is identical across both incarnations. The tree has the
   primitive for this class: `DeleteParams::preconditions`
   (`kube-core/src/params.rs:786-790`, builder at `:841-844`) exists for
   exactly the "still the object I meant" question, and the helper does not
   reach for its patch-side equivalent.

5. **The cascade shape is decided implicitly by the marker set.**
   `kube-core/src/params.rs:780-784` documents `propagation_policy`: "The
   default policy is decided by the existing finalizer set in
   `metadata.finalizers`, and the resource-specific default policy." A caller
   that names no policy has its cascade behaviour chosen by a combination of
   this technique's markers and a per-kind default — an implicit coupling
   between the hold and the store's own cascade that neither side documents
   at the call site.
