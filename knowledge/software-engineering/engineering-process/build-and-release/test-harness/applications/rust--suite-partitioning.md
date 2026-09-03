---
layer: application
type: application
subject: test-harness
technique: suite-partitioning
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# A partition written as prohibitions (rust)

`kube-rs/kube` is a Rust client and controller runtime for the Kubernetes API,
read at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`. Version witness:
`Cargo.toml:27`, `rust-version = "1.89.0"` — there is no `rust-toolchain` file
in the tree, so the workspace's declared minimum compiler is the only version
it states about itself.

The interesting part is not that this tree has four suites. It is that the
partition is written as a **ladder of prohibitions with a stated default**,
and that the membership mechanism is not the one the technique recommends —
which turns out to matter less than expected, for a reason worth recording.

## The ladder, as the tree writes it

`CONTRIBUTING.md:86` opens "Test Guidelines"; `:96` opens "What type of test",
and the ladder is six lines of MUST/MUST NOT (`:98-103`):

> - Unit tests **MUST NOT** try to contact a Kubernetes cluster
> - Doc tests **MUST** be marked as `no_run` when they need to contact a Kubernetes cluster
> - Integration tests **MUST NOT** be used when a unit test is sufficient
> - Integration tests **MUST NOT** assume existence of non-standard objects in the cluster
> - Integration tests **MUST NOT** cross-depend on other unit tests completing (and installing what you need)
> - E2E tests **MUST NOT** be used where an integration test is sufficient

Then the rule the whole list exists to state, at `:105`: *"In general: **use
the least powerful method** of testing available to you"* — followed
immediately by a per-crate assignment (`:107-110`): unit tests in `kube-core`;
unit tests in `kube-client` and *"in rare cases"* integration; unit and
*"occasionally"* integration in `kube-runtime`; end-to-end *"when testing
differences between in-cluster and local configuration"*.

Three things this does that the corpus's fidelity ladder does not do on its
own. It is written as **prohibitions**, which is what makes it usable in a
review — "this integration test could be a unit test" cites a line rather than
a taste. It names a **default direction** (down the ladder) so an
under-determined case has an answer. And it is **assigned per module**, so the
question "which suites does this crate have?" is answered from the guideline
rather than from a directory listing.

## Membership: annotation, not location — with the compensating property

The technique argues for location-based membership and against annotation,
because a forgotten annotation drops a test into the wrong machine silently.
This tree does the opposite: integration tests live **inline, in the same
files as unit tests**, marked `#[ignore]`, so the default `cargo test` is
hermetic and the integration lane is `-- --ignored`. The two lanes are the
justfile's `test` (`justfile:26-43`) and `test-integration` (`:45-51`).

The measured compensating property: **33 of 33 `#[ignore]` attributes in the
crate sources carry a reason string, and zero are bare** (counted over
`kube-core`, `kube-client`, `kube-runtime`, `kube`, `kube-derive` at this
commit; 24 in `kube-client`, 6 in `kube`, 3 in `kube-runtime`, 0 in the other
two). The reasons are specific enough to be a partition key on their own —
`"needs cluster (gets and writes cms)"` (`kube-client/src/api/entry.rs:333`),
`"needs kubeconfig"` (`kube-client/src/api/util/mod.rs:76`), `"needs cluster
(uses aggregated discovery, requires k8s 1.26+)"`
(`kube-client/src/lib.rs:197`). An annotation that must carry a reason is a
much weaker version of a directory boundary, but it is not nothing: a reviewer
reading a diff sees the claim, and a bare `#[ignore]` would stand out against
33 justified ones.

**The standard does not move.** Annotation membership still fails in the
direction the technique names: nothing structural stops a test that needs a
cluster from shipping without the marker, and the symptom would be a
mysterious failure in the hermetic lane rather than a misfiled file visible in
review. The convention here is discipline holding a line that structure should
hold. What transfers is the cheap half — **the default command must never need
a live dependency** — which this tree achieves regardless of the mechanism.

## The tier table, as configured

| Lane | Configuration | Touches | Invocation |
| --- | --- | --- | --- |
| unit + doc | `justfile:26-43` — five `cargo test` passes across feature sets | memory | default |
| integration | `justfile:45-51` — `-- --ignored`, plus two examples run as canonical tests | a live cluster in the current context | opt-in |
| coverage | `tarpaulin.toml:8-17` — `ignored = true`, `exclude = ["e2e"]`, `timeout = "600s"` | a live cluster | opt-in |
| end-to-end | `e2e/` — two binaries, `deployment.yaml` | a real in-cluster identity | pipeline |

Two details in the unit lane are worth stealing. It runs **five times over
different feature selections** (`justfile:34-41`) — no default features,
default, all features, doc tests, and the examples — with a comment naming why
the second pass exists: *"default features too, for the `#[cfg(not(feature =
...))]` paths the first pass can't reach"* is the sibling rationale at
`justfile:12`. And the lane's first act is a guard: a grep for fenced doc blocks marked
"ignored" fails the run before a single test compiles, with the message
*"ignored doctests are not allowed, use compile_fail or no_run"*
(`justfile:29-32`) — a suite
enforcing its own membership rule as a test, which is the shape the technique
calls the partition being exhaustive.

The coverage configuration is the honest one in the set: it declares
`ignored = true`, so the coverage number is measured over **unit plus
integration**, and `CONTRIBUTING.md:94` says so in the same words — *"will run
both unit and integration tests"*. A coverage figure that silently excluded
the cluster-dependent lane would be the technique's counts-travel-with-their-suite
failure.

## The end-to-end lane is deliberately trivial, and says why

This is the sharpest thing in the tree on this subject. `e2e/README.md:5`
leads with *"**[You probably do not want to make an E2E test]**"*, linking the
guideline. `e2e/job.rs` is **47 lines**: create a job whose container is
`alpine:latest` doing nothing, await completion with a 20-second caller-side
timeout, delete it (`:38-45`). `e2e/boot.rs` is **13 lines**: list pods and
log their names.

The README states the scope rule in one sentence (`:19`): the job binary is
*"intended as a safety mechanism to ensure in-cluster authentication is
working, not hanging, and its minimal work is verifiable out-of-band"*. And
`:11` gives the boot binary a different job entirely — *"a compilation target
to ensure kube builds with any k8s-openapi version feature selection greater
than or equal to our MK8SV"*.

So neither end-to-end binary tests logic. One proves that a workload identity
injected by the cluster is accepted by the client; the other proves the
library compiles against a range of dependency versions. Both are properties
**only the real environment can falsify** — exactly the technique's rule that
the top rungs exist because the bottom rungs see proxies
(`gate-sees-target`). `e2e/deployment.yaml` is the whole environment those
properties need and no more: a namespace, a service account with
`automountServiceAccountToken: true`, a role, a binding, a job.

## Deviation

**No suite reconciles its own denominator.** The technique's closing rule —
match files discovered against files that reported — has no instrument here.
The five feature-permutation passes in `justfile:34-41` are the closest thing,
and they answer a different question (does every `#[cfg]` path compile and
run) rather than *did every discovered test report*. A silently skipped module
in one of those passes would be invisible. Given a suite whose membership is
annotation-based, this is the reconciliation that would most cheaply restore
the structural guarantee: count the tests the hermetic lane ran, count the
`#[ignore]` attributes, and assert the sum against the total the compiler
knows about.
