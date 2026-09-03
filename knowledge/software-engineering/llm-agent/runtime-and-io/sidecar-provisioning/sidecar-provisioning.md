---
layer: golden-path
type: golden-path
subject: sidecar-provisioning
status: forged
techniques:
  - resolution-ladders
  - grade-selection
  - change-rate-partitioning
  - atomic-downloads
  - source-pinning
  - process-isolation
  - capability-detection
  - model-storage-lifecycle
  - plugin-lazy-load-and-reload
  - split-trust-by-registration-path
---

# Sidecar binaries & model provisioning

This is the subject you own when the application's capabilities depend on
artifacts it **does not ship**: external executables it will spawn as
sidecars, tools it will invoke, and model or data files measured in hundreds
of megabytes. The installer delivers the application; these dependencies
arrive **afterwards** — downloaded on first use, discovered on the user's
machine, or pointed at by an operator override — and the application must be
correct in every combination of present, absent, half-arrived, and wrong.

The boundary with the neighbors is precise. What ships *inside* the
installer — bundled libraries, embedded payloads, the install-tree acceptance
walk — is [packaging](../../../engineering-process/build-and-release/packaging/packaging.md)'s subject (its
[native-payload-verification](../../../engineering-process/build-and-release/packaging/techniques/native-payload-verification.md)
technique verifies the caravan that shipped; this subject owns the caravan
that arrives after install). Once an external executable exists on disk and
must *run*, everything about spawning, supervising, and terminating it is
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md)'s
subject — the handoff is a resolved, verified path to an executable this
subject vouches for. The *mechanics* of probing — timeout posture, caching,
three-state outcomes — belong to
[health-checks](../../../operations/service-operations/health-checks/health-checks.md); this subject decides
*what* a capability probe must establish about an external dependency and
what the product does with absence.
[voice-io](../voice-io/voice-io.md) and [retrieval](../../prompt-and-context/retrieval/retrieval.md)
are the archetypal consumers: speech and embedding features are exactly the
ones whose engines and models are too large and too optional to ship.

Four facts make this subject harder than it looks:

1. **Acquisition happens at feature time, not install time.** The user meets
   the download in the middle of trying to do something else. Every failure
   mode of the network — interruption, slowness, a captive portal, a dead
   mirror — becomes a *feature* failure mode unless the design absorbs it.
2. **The artifacts are too large to be casual about.** A multi-hundred-MB
   model cannot be re-downloaded on every doubt, cannot be duplicated per
   feature, and cannot be left where a failed transfer dropped it. Size turns
   sloppiness that would be invisible for a config file into user-visible
   cost.
3. **Every download is a supply-chain door.** The application is about to
   execute or load bytes it did not build, fetched from infrastructure it
   does not control. An artifact fetched from wherever, trusted because the
   transfer completed, is an injection point with a progress bar.
4. **Native code you did not compile shares your process at its peril.**
   Inference runtimes and media engines carry their own native libraries,
   allocators, and thread pools; two of them loaded into one process is a
   crash that no test on the developer's machine reproduces.

## One ladder, declared, for every dependency

The first question about any external dependency — *which* binary, *which*
model file will actually be used — must have one answer, computed one way,
for every dependency the application has. The standard order:

1. **Explicit override** — an environment variable or setting naming an
   exact path. The operator's word is law; it is never silently ignored,
   and when it points at something unusable that is an error, not a fall
   through.
2. **Managed directory** — the application-owned location where provisioned
   artifacts live. This is the rung the application controls end to end.
3. **System discovery** — the ambient search path, well-known install
   locations. Convenient, uncontrolled, verified before trust.

An application that resolves each dependency with its own bespoke order is
undiagnosable: "it works on my machine" becomes unanswerable because no two
dependencies mean the same thing by "found". The
[resolution-ladders](./techniques/resolution-ladders.md) technique owns the
ladder, the per-dependency overrides, and the diagnostic obligation — every
resolution can report *which rung answered and what it rejected on the way*.

## The ladder answers *where*; the grade answers *how good*

Some dependencies do not resolve to one file. They resolve to a family of
files that are interchangeable at the interface and unequal in what they
produce — precision variants of the same weights, capacity tiers of the same
model, an accelerated build and a plain one of the same engine. The ladder
picks the rung; something still has to pick the member, and that second
choice is what decides how good the product's answers are on this machine.

It is a distinct axis, not a version and not a rung: no grade supersedes
another, and the right one depends on the host and on the job. Three
obligations follow. The capability keeps **one identity across its grades**,
so that "this machine is running at a reduced grade" is a sentence with a
subject. The ceiling is **derived from the host with headroom** for the
working state the artifact accumulates, and it is recomputed when the
hardware or the catalog moves. And a reduced grade is **reported, never
substituted silently** — the verdict says which grade is in force and the
output records the grade it was produced at, because two results from
different grades are not comparable and a quality regression that is really
a grade change is otherwise undiagnosable. The
[grade-selection](./techniques/grade-selection.md) technique owns the axis,
the derived ceiling, and the honest verdict.

## Cut the payload where its parts change at different rates

Before asking *how* a payload arrives, ask whether it should arrive as one
thing. A provisioned dependency is usually a single archive because that is
how the build emitted it, and inside it sit parts on wildly different
clocks: a core rebuilt with every application release, and an accelerator
or runtime-library set — frequently the larger half — that moves only when
an upstream toolchain generation does. Shipped as one unit, every routine
patch release recharges gigabytes to deliver megabytes of change.

The decision precedes the arrival mechanism, and it is a decision about
change frequency, not about size or directory structure. Each partition
carries **its own version identity and its own staleness predicate**,
computed independently, so the acquisition flow fetches only what actually
moved; readiness is the conjunction across parts, never "the last download
succeeded". Two version numbers here are two facts about two vocabularies,
not two replicas of one — the distinction is what keeps the partition on
the right side of
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary).
The classifier that assigns files to partitions carries an enumerated
hold-back list, because what is deliberately kept out of a partition is as
much a declared fact as what goes in. The
[change-rate-partitioning](./techniques/change-rate-partitioning.md)
technique owns the cut rule, the two-predicate discipline, and the boundary
against grades — the halves of a partition do not substitute for one
another, so a half-provisioned dependency is *absent*, not degraded.

## Arrival is atomic or it did not happen

A download in progress must be invisible to every reader, and a download
that died must be indistinguishable from one that never started. The
mechanism is staging: bytes stream into a distinctly-named partial file,
verification runs against the staged copy, and a single atomic rename
publishes it. No consumer ever observes a half-written model; a crash leaves
a partial file whose name declares it garbage and whose reaper is named.
Alongside atomicity: an in-flight guard so two features wanting the same
model produce one transfer, not a corrupting race; progress that is
throttled into a human-rate signal rather than a firehose of events; and a
policy — resume or restart — chosen deliberately per artifact class. The
[atomic-downloads](./techniques/atomic-downloads.md) technique owns all of it.

## The catalog is the authority; the digest is the proof

What may be downloaded is a **curated catalog** — a closed, versioned list of
artifacts with pinned sources and expected identities — not a string the
caller assembles. Verification happens on content, not on labels: a digest
where the source publishes one, a size class and a format sniff at minimum,
and always *before* the rename that publishes the artifact. The most
instructive real-world failure is the **mislabeled artifact**: an upstream
package whose name promises one machine architecture and whose bytes are
another. A label check passes it; only content sniffing catches it — the
same discipline [packaging](../../../engineering-process/build-and-release/packaging/packaging.md) applies to shipped
payloads in
[os-arch-matrix](../../../engineering-process/build-and-release/packaging/techniques/os-arch-matrix.md), applied here to
payloads that arrive later. The
[source-pinning](./techniques/source-pinning.md) technique owns the catalog,
the pinned hosts, and the verification ladder.

## When native worlds collide, put a process boundary between them

Two ML runtimes, two media stacks, or two versions of one native library in
a single process is not a performance problem — it is undefined behavior:
duplicate symbols, allocator fights, thread-local collisions, crashes at
load or, worse, at the thousandth inference. The standard answer is
**out-of-process isolation**: the conflicting engine runs as a sidecar
executable that this subject provisions, and the host talks to it over an
explicit interface with a version handshake. The process boundary converts
an undebuggable in-process collision into an ordinary integration seam. The
[process-isolation](./techniques/process-isolation.md) technique owns the
decision rule and the handshake; the running sidecar's lifecycle — spawn
door, termination ladder, orphan sweeps — is
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md)'s
(see [spawn-contract](../subprocess-lifecycle/techniques/spawn-contract.md)
and
[termination-and-reaping](../subprocess-lifecycle/techniques/termination-and-reaping.md)).

## When the sidecar is a plugin, the seam gets a lifecycle and a trust rule

One sidecar shape stretches the seam further than an engine does: the
**plugin** — an executable the host did not build, dispensed from a catalog
and mounted many times over, each mount a slightly different configuration,
registered by whoever had the authority to register it. The handshake is
still the seam, but two more questions have answers only here. *When* does
a process exist behind a mount, and when may two mounts share one: dispense
in metadata mode so routing questions are answered without running the
plugin, load fully on the first real request, restart on the process's
shutdown error and re-verify its declared shape before serving again, and
share a process only between mounts whose whole runner configuration is
identical — the
[plugin-lazy-load-and-reload](./techniques/plugin-lazy-load-and-reload.md)
technique owns all three, while the spawn and restart mechanics stay with
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md).
And *what the host trusts* about a loaded plugin, which is decided by the
door it came through, not by the binary: a plugin the host's configuration
file declares carries its operator's own authority, as the ladder's override
rung already does, while one registered through the API must carry a digest
and run from one directory; errors leaving the plugin pass a sanitizer that
strips the host's secrets and keeps the verdict, and a privilege decision
the plugin must never see stays on the host's side of the boundary. That is
[split-trust-by-registration-path](./techniques/split-trust-by-registration-path.md).
The line against [supply-chain](../../../security/code-provenance/supply-chain/supply-chain.md)
is the moment of loading: provenance of what the host is about to run —
where it was built, who signed it, what the download verified — is that
subject's; how a plugin, once loaded, is isolated and trusted at run time is
this one's.

## Absence is a designed state, not an error path

Every capability built on an unshipped dependency will run on machines where
the dependency is missing — that is not an edge case, it is the *initial
state of every installation*. The design obligation is a first-class
degraded mode: probe for presence and version, surface a status affordance
that says what is missing and how to get it, gate the dependent features so
they disable gracefully instead of crashing into a spawn failure, and offer
the acquisition path right there. "Not installed" is a different fact from
"installed but broken" and from "could not check", and the three route to
different affordances
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
[capability-detection](./techniques/capability-detection.md) technique owns
the gating and the affordances; probe mechanics live in health-checks'
[probe-design](../../../operations/service-operations/health-checks/techniques/probe-design.md).

## Everything downloaded names its reaper

Provisioned artifacts accumulate. Models superseded by better ones, engines
for features the user tried once, versions kept "just in case" — on a
machine the application does not own, whose disk the user will eventually
audit with the question "what is taking forty gigabytes?" The law is general
([creation-names-reaper](../../../_laws.md#creation-names-reaper)); for this
subject it means: every artifact lives in the managed directory under an
accountable identity, the application can enumerate what it holds and what
each item costs, artifacts shared by several features are stored once and
reference-counted by need rather than duplicated per consumer, and there is
a designed eviction path — user-driven at minimum, policy-driven where
usage is tracked — that removes an artifact *and* returns the capability to
its honest "not installed" state. The
[model-storage-lifecycle](./techniques/model-storage-lifecycle.md) technique
owns residency, accounting, sharing, and eviction.

## The provisioning lifecycle

Every external dependency is in exactly one of these states per machine, and
each transition is owned by named code:

| State | Meaning | The application's obligations |
| --- | --- | --- |
| **unresolved** | ladder not yet run | resolve on demand or at feature entry; never assume |
| **absent** | ladder exhausted, nothing usable | degraded mode active; acquisition affordance offered |
| **downloading** | transfer in flight to a staged partial file | in-flight guard held; throttled progress; cancel honored |
| **staged** | bytes complete, not yet verified | verification runs against the staged copy, never the published name |
| **resident** | verified, atomically published in the managed directory | accounted for; identity and version known; shared by reference |
| **external** | resolved to an override or system copy | trusted per its rung: verified, but not managed, never evicted |
| **quarantined** | verification failed | staged copy retained or removed by policy, outcome recorded; never published |
| **evicted** | removed by user or policy | capability returns to absent honestly; accounting updated |

Two rules fall out of the table:

1. **Only the rename publishes.** No state other than *resident* is ever
   visible at the published name; every path into *resident* passes
   verification first. A consumer that reads the managed directory directly,
   bypassing the resolution ladder, forfeits every guarantee this subject
   provides ([one-validation-door](../../../_laws.md#one-validation-door)).
2. **The application never evicts what it does not manage.** Overrides and
   system copies are the operator's property; the reaper's jurisdiction ends
   at the managed directory.

## The techniques

- [resolution-ladders](./techniques/resolution-ladders.md) — the uniform
  override → managed → system order, per-dependency overrides, resolution
  diagnostics.
- [grade-selection](./techniques/grade-selection.md) — choosing among
  interchangeable, unequal variants of one dependency: the host-derived
  ceiling, measurement over label, per-capability floors, no silent
  downgrade.
- [change-rate-partitioning](./techniques/change-rate-partitioning.md) —
  cutting a distributable payload along its change-frequency seam; a version
  identity and a staleness predicate per part; the hold-back list; why two
  facts are not two replicas.
- [atomic-downloads](./techniques/atomic-downloads.md) — partial-file staging
  and atomic rename, in-flight guards, throttled progress, resume-or-restart
  policy.
- [source-pinning](./techniques/source-pinning.md) — curated catalogs, pinned
  hosts, digest and content verification, the mislabeled-artifact sniff.
- [process-isolation](./techniques/process-isolation.md) — out-of-process
  sidecars for native-library collisions, the interface seam, version
  handshakes.
- [capability-detection](./techniques/capability-detection.md) — presence and
  version probes, status affordances, feature gating on absence.
- [model-storage-lifecycle](./techniques/model-storage-lifecycle.md) — managed
  directories, storage accounting, sharing across features, eviction.
- [plugin-lazy-load-and-reload](./techniques/plugin-lazy-load-and-reload.md)
  — metadata mode at mount and full load on first request, restart on the
  shutdown error with the shape re-verified, the full runner configuration as
  the multiplexing key, the handshake as a user-experience feature.
- [split-trust-by-registration-path](./techniques/split-trust-by-registration-path.md)
  — the config author as host-level, the API caller's mandatory digest and
  single execution directory, the error sanitizer at the boundary, privilege
  decisions kept on the host's side.
