---
layer: application
type: application
subject: execution-state-checkpointing
technique: runtime-bound-checkpoint
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.95
---

# A microVM snapshot fingerprint in an agent harness

Citations resolved against `github.com/exoharness/exo` at commit `7801005`
(`Rename sandbox conversation ID to thread ID`, #250). The tree is an agent
harness whose sandbox layer puts Docker, Apple's `container` CLI, several
hosted providers and a Firecracker microVM backend behind one
`ManagedSandboxBackend` trait. The Firecracker provider is the only backend
that captures memory as well as disk, so it is the one that carries the full
compatibility predicate.

## The fingerprint is two structs and a fold

`crates/exoharness/src/sandbox_provider/firecracker.rs:223-236` defines
`FirecrackerRuntimeFingerprint`: `architecture`, `protocol_version`, and then
four content hashes — `firecracker_sha256`, `jailer_sha256`, `kernel_sha256`,
`initramfs_sha256` — plus `vcpu_count`, `memory_mib` and
`network_device_policy`. `firecracker_version` is carried alongside the hash of
the same binary, which is the right order: the version is for humans reading a
refusal, the hash is what the comparison uses.

The split at `:238-247` is the load-bearing design decision. A
`FirecrackerHostFingerprint` holds only what the *host* determines — the
binaries, the kernel, the protocol, the device policy — and
`for_resources(...)` at `:250-264` folds a per-request
`SandboxResourceShape` (processor count, memory size) into it to produce the
runtime fingerprint. So the host publishes one fingerprint and each sandbox
specification derives its own, which is exactly the shape the technique asks
for: the machine's shape is part of the predicate, but it is not a property of
the host.

`FirecrackerSnapshotManifest` at `:267-273` wraps the fingerprint with
`format_version`, a `template_key`, a `spec_hash` of the whole sandbox
specification, and the source's network slot. `validate()` at `:299-313`
checks `format_version` against `SNAPSHOT_FORMAT_VERSION` **first** and refuses
on mismatch before anything else is compared — the structure-before-contents
rule, realised.

## Both ends, and the capture end refuses first

Capture-side checks live in the snapshot path at `:783-797`. The source's
`spec_hash` must equal both the recorded one and a freshly computed
`sandbox_spec_hash(&request.spec)` (`:783-787`); the source's recorded runtime
must equal `host_fingerprint.for_resources(request.spec.resources)`
(`:788-794`); and the source process must actually be running (`:795-797`).
A capture is refused before it is taken if any of the three has drifted.

Restore-side checks are the mirror, at `:864-893`: `manifest.validate()`, then
a warm-lifecycle requirement (`:864-866`), a refusal for durable filesystems
(`:867-869`), `spec_hash` equality (`:870-872`), full runtime-fingerprint
equality (`:873-880`), and finally `snapshot_template_ready(...)` — a check
that the referenced template is present on *this* host, with the failure spelled
"is not available on this host" (`:886-893`).

Both ends compare with derived `PartialEq` on the same struct
(`:222` derives `PartialEq, Eq`), so there is one comparison and no
hand-written field list to drift — the one-door rule satisfied by the type
system rather than by discipline.

## The name says it is host-local

`crates/exoharness/src/sandbox.rs:151-152` declares
`SnapshotFormat::FirecrackerHostRef = "firecracker-host-ref"`, documented as
"Reference to an immutable bundle in a Firecracker host's private root". The
namespaced identifier is the technique's naming rule: a reader routing this
payload can see it is redeemable in one place without opening it. The contrast
in the same file is `docker-image-tar` (`:139-140`) — an unqualified, portable
name, consumed by two different backends.

## The coherence window

`capture_snapshot_template` (`:3654-`) pauses the source, calls
`/snapshot/create`, and then — inside the pause — copies **only** the disk
overlay (`:3708-3711`), with the comment stating why: "the overlay has to match
the memory image byte-for-byte, and the source starts writing to it again the
moment it resumes." The VM is resumed at `:3714`, and only afterwards are the
`state` and `memory` files copied out (`:3724-3733`), with the second comment
recording that "the copy runs after the source resumed, so it costs no pause
time." Publication then follows atomic-publish rules — root-owned, mode `0444`,
`sync_all`, a `complete` marker, and a directory rename at `:3779` — with a
post-publish `validate_snapshot_template` at `:3781`.

This is the upward lesson the draft did not have. The pause window as a *scoped
resource*, with membership decided by "must this be byte-consistent with the
memory image?", is a rule the technique now states because this tree stated it
first.

## The cost invariant, encoded so it cannot drift back

`SparseCopyMode` at `:2061-2073` offers exactly two argument sets:
`Full` is `--sparse=always --reflink=never`, `ReflinkRequired` is
`--sparse=auto --reflink=always`. There is no `--reflink=auto` anywhere, which
is the mode that would silently fall back to a byte copy when the filesystem
cannot clone. Every capture and clone path uses `copy_sparse_reflink`
(`:3711`, `:3733`, `:3794`), and
`crates/exoharness/src/sandbox_provider/firecracker_tests.rs:89-100` asserts
the two argument sets verbatim under the name
`sparse_copy_modes_never_allow_automatic_reflink_fallback`. The operator
documentation states the consequence plainly:
`support/firecracker/README.md:236-240` — capture and clone creation "require
reflink support in the state-root filesystem and fail rather than silently
performing a full copy."

That is the cost-as-contract rule with a test standing guard over the flag
string, which is what "encoded where it cannot be reverted by accident" means
in practice.

## One deviation

`:232-234` marks `network_device_policy` `#[serde(default)]`. A manifest
written before that field existed therefore deserialises with the default
policy and compares equal to a host that happens to use the default — an
unknown rendered as a definite value, in the one struct whose entire job is to
refuse on uncertainty. The standard stays: a missing fingerprint field should
refuse with "this capture pre-dates the field", not default. The bounded blast
radius here is that `format_version` would also have to have gone unchanged for
such a manifest to reach the comparison at all.
