---
spec: execution-state-checkpointing
bundle: software-engineering
category: backend-platform/work-execution
raised_by: intake intake-exo
source: librarian/sources/2026-09-04-exo.md
source_commit: 7801005e6a1ab77008a05dbba80e0a2a7a56e35d
status: DISPATCHED
placement_verified: taxonomy.json -> backend-platform/work-execution holds 7 subjects (cap 10)
---

# Spec: execution-state-checkpointing

## Why this is XL rather than an amendment

Four design-record entries from one system (the exo sandbox/checkpoint layer)
carried `corpus: NONE`, and the routing count fired on that system alone. They are
not one mechanism with three boundary cases; they are four decisions that only make
sense together, because each one is about the same thing: **a running execution
environment is captured, and something later has to decide whether that capture may
be resumed.**

The corpus models the neighbours and not the centre. `versioning-snapshots` owns
*declaring a snapshot's scope* — what is in the capture — and its exclusion ledger
is the nearest existing artifact. `concurrency-guards/atomic-file-publish` owns the
publication half. `job-coordination/liveness-proof-reclaim` owns reclaiming a
holder's resource. `undo-history/checkpoint-restore` owns a human's document undo.
None of them models **validity**: that captured runtime state is only meaningful
under the runtime that captured it, that the restore must refuse rather than
degrade, and that a system which rolls back its own environment must keep a record
that outlives the rollback.

## The forces the golden path must state

1. **A checkpoint of live execution state is not a backup.** A backup is restored
   into a world that has moved on; a checkpoint is resumed into a world that must
   be bit-compatible. The two have opposite failure postures — a backup should
   restore what it can, a checkpoint must refuse what it cannot.
2. **Capability is per-backend and the capture primitive is not one operation.**
   A container commit, a provider-side registry reference, a full VM memory image
   and "nothing at all" are all legitimate implementations of one API, and their
   restore *semantics* differ (processes die vs processes resume mid-flight).
3. **The system that rewinds may be the system under study.** When an agent rolls
   back its own environment, the record of what it already tried is the one thing
   that must not be rolled back with it, or the next attempt starts from amnesia.
4. **A working fallback can be the wrong answer.** Where a cheap primitive is a
   design invariant rather than an optimisation, silently substituting the slow
   correct one converts an invariant into an unmonitored regression.

## Proposed techniques, each with the decision rule it must carry

- **`runtime-bound-checkpoint`** — captured runtime state is valid only under the
  runtime that captured it, so the capture carries a fingerprint of everything the
  resume depends on (binary hashes, protocol version, architecture, resource shape,
  device policy) and the restore refuses on any mismatch. *Rule:* a checkpoint that
  cannot resume correctly must fail to resume at all; portability is a property to
  be claimed explicitly, never assumed. Where the artifact is host-local, the
  identifier is namespaced so it cannot be mistaken for a portable one.
  Anchors: `firecracker.rs:246-264, 266-315, 786-796, 869-885, 892`.

- **`restore-semantics-belong-to-the-format`** — one API over captures whose
  meaning differs; the format identifier is the contract and the payload is opaque
  to the layer that stores it. *Rule:* a caller may route a payload it cannot
  interpret, and must never infer semantics from the bytes. Boundary with
  `repo-manifest-standard`: that subject owns the open-vocabulary and
  must-ignore-unknown rules; this one owns the case where the identifier is
  load-bearing and an unknown value must be *refused* rather than ignored.
  Anchors: `sandbox-snapshots.md:36-40, 283-289`; `sandbox.rs:118-126, 129-135`.

- **`declared-consumable-formats`** — the restoring side declares which capture
  formats it can consume, and the layer above validates the stored payload against
  that declaration *before* dispatch, naming both the requested format and the
  supported set in the refusal. *Rule:* a backend that genuinely cannot checkpoint
  returns an explicit error from both capture and restore rather than silently
  degrading; "supported formats: none" is an answer. Boundary with
  `untrusted-extension-host/pluggable-isolation-runner`: that technique owns
  capability declaration across *isolation* runners with a closed vocabulary; this
  one is the checkpoint axis with an open one, validated at dispatch rather than
  startup. Anchors: `sandbox.rs:253-278, 649-654, 1014`; `basic.rs:3425-3446, 4825-4841`.

- **`the-record-outlives-the-rewind`** — the audit trail of what was tried is
  written on a different axis from the state that gets reset, and the rewind itself
  appends to that trail rather than truncating it. *Rule:* publish a state
  inventory as a matrix — every state category against every reset operation the
  system offers — not as a single "what a snapshot captures" declaration, because a
  system with more than one reset button cuts a different set with each. The
  operating rules fall out of the matrix. Boundary with `versioning-snapshots`:
  that subject's exclusion ledger answers *what is in the capture*; this technique
  answers *what survives which reset*, which is a different question the moment a
  second reset axis exists. Anchors: `SELF-CONTROL.md:54-66, 68-84`;
  `harness_tool.rs:561-618, 620-690`; `snapshot_round_trip.rs:38-190`.

- **`cost-invariant-refusal`** — refuse a working fallback whose cost profile
  breaks an invariant the design depends on, and encode the refusal where it cannot
  be reverted by accident. *Rule:* when a cheap primitive is load-bearing rather
  than optimising, the absence of that primitive is a hard failure at first use, not
  a slow success discovered from a full disk. Distinguish sharply from
  `optional-dependency-degradation`, whose whole argument is the opposite (degrade
  when a capability is absent so the thing still boots) — the discriminator is
  whether the fallback's *cost* violates a stated contract, and that must be written
  out, because the two rules look identical and invert.
  Anchors: `firecracker.rs:2061-2106`; `firecracker_tests.rs:89-100`;
  `support/firecracker/README.md:238-240`.

## Boundaries this subject must NOT absorb

- `operations/governance-and-records/versioning-snapshots` — declared snapshot
  scope and the exclusion ledger. Cite it; do not restate it.
- `security/extension-trust/untrusted-extension-host` — isolation runners and
  their ceilings.
- `engineering-process/standards-and-gates/repo-manifest-standard` — versioned
  identifiers, additive evolution, must-ignore-unknown.
- `backend-platform/work-execution/concurrency-guards` — atomic publication and
  cross-process exclusion. `atomic-file-publish` is a sibling in the same category;
  reference, never duplicate.
- `backend-platform/work-execution/job-coordination` — `liveness-proof-reclaim`
  already owns reclaiming a dead holder's resource.
- `ui-surfaces/input-and-editing/undo-history` — a human's document restore points.
- `backend-platform/resilience/optional-dependency-degradation` — the inverting
  neighbour named above.

## Open questions the drafter must decide

1. Is `declared-consumable-formats` a technique here, or a boundary paragraph that
   belongs to `pluggable-isolation-runner` with a pointer from this side? Decide
   from the two golden paths' stated scopes, not from convenience. **You may reject
   this technique and say why** — three strong techniques beat five padded ones.
2. Does the state-inventory matrix belong here or as an amendment to
   `versioning-snapshots`? The spec's position is *here*, because the force is a
   second reset axis rather than an under-declared scope, but the drafter reads
   both and may overrule.
3. `cost-invariant-refusal` is arguably a `backend-platform/resilience` concern
   rather than `work-execution`. If the drafter concludes that, say so in the
   report and leave it out — a misplaced technique is worse than a missing one.

## Instruction to the worker

Read `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`, this
spec, and every neighbour named above, in that order. Draft expert-first. **Override
this spec where the neighbours' stated scopes contradict it, and put the argument in
your report** — both workers dispatched on 2026-08-22 overrode their briefs and both
were right. Run `node scripts/check-bundles.mjs` on your own subject. Run no git.
Every technique needs `use_when`. The source is one system, so the evidence is n=1:
write the golden path so that is visible rather than hidden.
