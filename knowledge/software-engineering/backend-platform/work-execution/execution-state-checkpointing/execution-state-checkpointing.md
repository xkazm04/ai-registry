---
layer: golden-path
type: golden-path
subject: execution-state-checkpointing
status: forged
use_when: [capturing a live execution environment so work can resume later, deciding whether a stored capture may be restored at all, one capture API must cover backends whose restores mean different things, a system that resets its own environment needs to remember what it already tried]
techniques:
  - runtime-bound-checkpoint
  - restore-semantics-belong-to-the-format
  - resume-mints-a-duplicate
  - the-record-outlives-the-rewind
---

# Execution-state checkpointing

An **execution checkpoint** is the captured state of a *running* environment —
a filesystem, and sometimes the memory and register state of the processes on
it — stored so that execution can be picked up again afterwards. The unit is
neither a document nor a row; it is the machine the work was happening on. That
substitution changes every question. A document is data, and data can be read
by anything that understands its shape. A captured machine is data *plus the
assumption that the machine will be there again*, and nothing in the bytes
records whether that assumption still holds.

So the centre of this subject is not capture and not restore. It is
**validity**: whether a given capture may be resumed, here, now, by this
runtime, into this world. Capture is mostly mechanical — pause, copy, tag,
publish — and every system gets it working in a week. Validity is where the
same systems are still finding defects a year later, because an invalid resume
does not fail. It succeeds, and produces an environment that boots, answers,
and is quietly wrong about what it is.

## Where this subject starts and stops

This subject begins the moment a capture of live execution state exists and
something has to decide what may be done with it; it ends at the borders of
five neighbours that own the surrounding machinery.

[versioning-snapshots](../../../operations/governance-and-records/versioning-snapshots/versioning-snapshots.md)
owns *what goes into a capture* — the behavioural dependency graph, the
embed-versus-reference decision, the exclusion ledger, and the promise that a
version can be returned to later. Everything it says about declaring scope is
true here and is not restated. The line is that its snapshot is of an *entity*
whose meaning is intrinsic: the restored record means the same thing on any
host that can parse it. A captured machine's meaning is extrinsic — it is
relative to a runtime that may not exist any more — so this subject owns the
compatibility predicate, and that subject owns the contents.

[undo-history](../../../ui-surfaces/input-and-editing/undo-history/techniques/checkpoint-restore.md)
owns a person's restore points over their own document: capture at nameable
boundaries, non-destructive restore, a browsable timeline. Its non-destructive
rule holds here too and this subject inherits it rather than re-arguing it. The
tell is who resumes and into what: a human returning a document to an earlier
draft is there; a process resuming an environment it did not create, possibly
on another host, possibly weeks later, is here.

[concurrency-guards](../concurrency-guards/concurrency-guards.md) owns
publication and exclusion. Writing a finished capture into a place other
readers will find it is
[atomic-file-publish](../concurrency-guards/techniques/atomic-file-publish.md)'s
job — write beside, then replace — and a capture is a shared file like any
other. [job-coordination](../job-coordination/job-coordination.md) owns the
work record: where a job got to, whether its step can re-run, and, in
[liveness-proof-reclaim](../job-coordination/techniques/liveness-proof-reclaim.md),
taking a dead holder's resource. A capture that is a *lease* on a host-local
artifact reclaims by that technique's rules, not by new ones invented here.

[untrusted-extension-host](../../../security/extension-trust/untrusted-extension-host/untrusted-extension-host.md)
owns isolation: what a runner enforces, what its ceilings are, and the rule
that effective containment is published rather than assumed. Its
[pluggable-isolation-runner](../../../security/extension-trust/untrusted-extension-host/techniques/pluggable-isolation-runner.md)
is the closest neighbour this subject has, and the line between them is a line
between two questions asked at two times. That technique asks *what can this
runner enforce while code runs*, answers it from a closed vocabulary of ceiling
kinds, and validates the answer at startup, when the runner is chosen. This
subject asks *what can this runner consume from storage*, answers it from an
open vocabulary that grows every time somebody adds a capture format, and
cannot validate the answer until a payload arrives — because the payload may
have been written by a different backend, in a different process, on a
different day.

Finally,
[repo-manifest-standard](../../../engineering-process/standards-and-gates/repo-manifest-standard/repo-manifest-standard.md)
owns versioned machine-readable identifiers and the discipline of evolving
them additively, including the rule that a reader ignores what it does not
understand. That rule is right for a manifest and wrong for a capture, and the
inversion is the seam: a manifest field a reader ignores costs a feature, while
a capture format identifier a reader ignores costs the caller a restore of
something it could not interpret. Where the identifier is load-bearing, unknown
is **refused**, not ignored.

## A checkpoint is not a backup, and the postures are opposite

The most expensive confusion in this subject is a vocabulary accident: both
things are "a copy of state, taken earlier, restored later", so teams reach for
backup habits and they are the wrong habits.

A **backup** is restored into a world that has moved on. The schema changed,
the host is new, half the fleet was replaced. Under those conditions
best-effort restore is a virtue — recover what is recoverable, report what is
not, let an operator reconcile the rest. A restore that refuses because the
kernel version differs is a backup system that has failed at its job.

A **checkpoint** is resumed into a world that must still fit it. Captured
memory encodes pointers into an address space laid out by a particular
allocator, device state negotiated with particular emulated hardware, and
instruction-set assumptions baked in at the moment of capture. There is no
partial credit. A resume that is 99% compatible is not 99% correct; it is a
machine that runs and then does something inexplicable four hours later, far
from the restore that caused it.

So the failure postures invert. **A backup should restore what it can; a
checkpoint must refuse what it cannot.** Every rule below is downstream of that
sentence, and the commonest defect in the subject is a checkpoint path written
by somebody carrying backup instincts: a compatibility check softened to a
warning, a missing field defaulted, a version mismatch logged and continued.
Each of those converts a loud refusal into a silent corruption, and the trade
is never worth it, because the thing being protected — the resume — was
optional and the thing being destroyed — trust in resumed state — is not.

## The capture primitive is not one operation

A single `capture` and `restore` pair on an interface hides a genuine spread of
meanings, and the spread is not an implementation detail a caller can be spared.
Four legitimate implementations of one API:

- **An image commit.** The filesystem is frozen into a portable artifact.
  Processes do not survive; restore boots a fresh instance from the captured
  disk and long-running work must be relaunched.
- **A provider-side reference.** The capture lives inside somebody else's
  service and what you hold is a handle. The bytes you store are an identifier,
  and only that provider can redeem them.
- **A full machine image.** Memory, devices and registers as well as disk.
  Restore resumes processes mid-instruction, which is the strongest form
  available and by far the most fragile — it is the one that binds hardest to
  the runtime that produced it.
- **Nothing at all.** Some execution environments genuinely cannot be captured,
  and "this backend supports no capture format" is a complete, honest answer
  that must be expressible.

Because those meanings differ, the identifier that names the format is the
contract and the payload beneath it is opaque. A layer that stores and routes
captures can do its whole job — persist bytes, hand them back, choose a
consumer — without ever interpreting them, and it must never *infer* semantics
from the bytes it holds. That discipline, the declaration each restoring side
publishes, and the refusal that names both what was asked for and what is
available are
[restore-semantics-belong-to-the-format](./techniques/restore-semantics-belong-to-the-format.md).

## Validity is a fingerprint, and it is checked twice

The compatibility predicate cannot be a version string, because "the runtime"
is not one thing. A resume depends on the monitor binary, the supervising
helper, the kernel and its initial filesystem, the control-protocol version,
the processor architecture, the declared resource shape, and the device policy
that decided which virtual hardware existed. Change any one and the captured
state is describing a machine that is no longer being offered.

So the capture carries a **fingerprint of everything the resume depends on** —
content hashes for the binaries, not their self-reported versions — and the
restore compares the whole fingerprint and refuses on any difference. The
comparison is equality, not compatibility: a predicate that tries to decide
which differences are tolerable is a predicate that will be wrong once, and
being wrong once costs a silently broken machine. And the check runs at
*capture* time as well, against the environment being captured, so a capture
whose source has already drifted is refused at the point where the operator
still has context, rather than stored and refused months later.

Two consequences follow, and both are the technique's ground.
[runtime-bound-checkpoint](./techniques/runtime-bound-checkpoint.md) carries
them: the fingerprint's contents and the equality rule, and the naming
discipline that keeps a host-local artifact from being mistaken for a portable
one — a capture that can only be redeemed on the machine that made it wears a
namespaced identifier, so a reader can see the constraint without reading the
bytes.

## A resume is a duplicate, not a continuation

This is the distinction that separates execution checkpointing most sharply
from every neighbouring kind of snapshot, and it is the one teams meet last.

Restoring a document twice yields two copies of a document, which is fine.
Resuming a captured machine twice yields two machines that *both believe they
are the original*, and everything that was supposed to be unique per instance
is now shared: the entropy pool and any seed derived from it, the host or
machine identity, session tokens and credentials held in memory, the clock,
open connections whose peers moved on, and every lease or lock the captured
instance held. None of this announces itself. The resumed machine works
perfectly and produces the same "random" values as its sibling.

The rule: **treat a capture as a template and every resume as a new instance
that must re-derive whatever must be unique.** At capture-design time,
enumerate the per-instance values and record, for each, whether the runtime
reseeds it, the layer above re-derives it, or the design knowingly accepts the
collision — the third is a defensible answer only when it is written down.
This is [resume-mints-a-duplicate](./techniques/resume-mints-a-duplicate.md),
and it applies even to a system that only ever restores once, because "only
ever once" is a property of today's caller and not of the artifact.

## The record outlives the rewind

Some systems reset their own environment. An agent that can roll its workspace
back to an earlier capture has a recovery tool and a hazard in the same lever:
if the record of what it already tried lives on the surface being reset, every
rewind is an amnesia event, and the next attempt repeats the failure that
caused the rewind.

The rule is a separation of axes. **The audit trail of what was attempted is
written on a different substrate from the state that gets reset, and the rewind
appends to that trail rather than truncating it** — the reset is itself an
event in the history, so a later reader can reconstruct what was rolled back
and when.

The artifact that makes this reviewable is not a prose statement of what a
capture contains. It is a **matrix**: every category of state the system holds,
against every reset operation the system offers, with the surviving/not-surviving
answer in each cell. The moment a system has a second reset button — a workspace
rewind and a service restart, a cache clear and a sign-out, a container
recreate and a host rebuild — a single "what a snapshot captures" declaration
stops being answerable, because each button cuts a different set and the reader
needs to know which. The operating rules then fall out of the matrix instead of
being invented beside it: the row that survives nothing is the row that may
never be the only home of durable memory. That is the boundary against
[versioning-snapshots](../../../operations/governance-and-records/versioning-snapshots/versioning-snapshots.md)'s
exclusion ledger — that ledger answers *what is in the capture*, one column;
this answers *what survives which reset*, and it is a different question the
moment the second column exists.
[the-record-outlives-the-rewind](./techniques/the-record-outlives-the-rewind.md)
carries the matrix's construction and the rules it generates.

## The capture's cost is part of its contract

A checkpointing design chooses a frequency — per turn, per step, before every
destructive operation — and that frequency is affordable only because of a
specific cheap primitive: a copy-on-write clone, a layered filesystem, a
content-addressed store that deduplicates. Substitute a correct-but-expensive
equivalent and every function still works. What breaks is the frequency, which
was the design.

This is where a rule from the neighbouring
[optional-dependency-degradation](../../resilience/optional-dependency-degradation/optional-dependency-degradation.md)
subject inverts, and the two look identical on the page, so the discriminator
has to be stated rather than felt. That subject's argument is that a capability
whose backing dependency is absent should degrade to a named, weaker fallback
so the system still runs — correct, and the default. The question that decides
which side you are on is: **does the fallback preserve the contract the caller
was given, or only the function?** A slower path that keeps the same guarantee,
where nobody promised a speed, is a degrade and should be taken. A path that
keeps the function and destroys a cost profile the design's own invariant rests
on has not degraded anything — it has deleted an invariant and reported success,
and the discovery event is a full disk or a run that takes forty minutes
instead of forty seconds, weeks later, with no error anywhere.

Where the cheap primitive is load-bearing, the correct behaviour is to **fail
at first use on a host that lacks it**, loudly, rather than to succeed slowly;
and the refusal is encoded where a tidy-up edit cannot silently re-enable the
fallback — the substitute path is not merely unused, it is unavailable, and a
test asserts that the two modes are the ones intended rather than trusting the
option string to stay as written.

## What this subject refuses

- **A resume that proceeds on a partial match.** Any difference in the
  fingerprint is a refusal; there is no compatible-enough.
- **A capability check softened to a warning.** The warning is read by nobody
  and the machine runs anyway.
- **Semantics inferred from payload bytes.** A caller that sniffs a capture to
  decide what it means has taken ownership of a contract it does not hold.
- **An unknown format identifier ignored rather than refused.** Ignoring is the
  manifest rule; this is not a manifest.
- **A backend that cannot capture pretending it can** — by returning an empty
  capture, a zero-byte payload, or a success with nothing behind it. "No
  supported formats" is an answer and it is spelled as a refusal
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
- **A host-local artifact under a portable-looking name.** The identifier
  states the constraint or the constraint is discovered by a failed restore on
  another host.
- **A resume that inherits per-instance identity.** Seeds, machine identity,
  tokens and leases are re-derived or the collision is declared.
- **Durable memory whose only home is the resettable surface.** If the matrix
  says a row does not survive the rewind, that row cannot be the record of what
  was tried.
- **A rewind that truncates the history it is part of.** The reset is an entry
  in the log, never an edit to it.
- **A capture with no reaper.** Captures are created resources and accumulate
  faster than anything else in the system, because they are whole machines
  ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).

## The evidence behind this subject

The reconciliation is **n=1**. One agent-harness tree, one team's decisions,
read at one commit — a sandbox layer whose several isolation backends sit
behind a single capture-and-resume interface. That is enough to confirm
mechanisms and to supply the two lessons this document would not otherwise
carry (the per-instance duplication hazard, and the coherence window below),
and it is not enough to make any of it a survey.

What raises the rules above one team's practice is convergence reached without
that tree in front of the reader: process-level checkpoint tooling that refuses
across kernel and processor-feature mismatches; live migration that requires a
common processor-feature baseline before it will move a machine; the long,
well-documented history of cloned images shipping a baked-in machine identity
or a replayed entropy pool, and the generation-counter mechanisms hypervisors
added specifically to tell a guest it has been resumed; content-addressed
artifact stores whose media-type identifier is the routing contract. Where a
rule below has that shape, it is stated as a rule. Where it rests on the single
tree — the shape of the fingerprint's field list, the specific matrix columns —
it is stated as a worked example and the reader should expect their own
system's list to differ.

## The techniques

- [runtime-bound-checkpoint](./techniques/runtime-bound-checkpoint.md) — the
  fingerprint of everything a resume depends on, equality rather than
  compatibility, checking at capture as well as restore, the coherence window
  that decides what must be copied while the source is paused, and namespaced
  identifiers for host-local artifacts.
- [restore-semantics-belong-to-the-format](./techniques/restore-semantics-belong-to-the-format.md)
  — the format identifier as the contract, an opaque payload the storing layer
  never inspects, the consumable-format declaration each restoring side
  publishes, validation before dispatch, the refusal that names both sides, and
  the producer-to-consumer table that turns portability into a claim someone
  can check.
- [resume-mints-a-duplicate](./techniques/resume-mints-a-duplicate.md) — the
  per-instance inventory, who re-derives each entry, the values that are
  invisible when duplicated, and why a single-restore design still owes the
  enumeration.
- [the-record-outlives-the-rewind](./techniques/the-record-outlives-the-rewind.md)
  — the state-by-reset matrix, the append-only trail on a separate substrate,
  the rewind as an entry in its own history, and the operating rules the matrix
  generates.
