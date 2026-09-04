---
layer: technique
type: technique
subject: execution-state-checkpointing
technique: runtime-bound-checkpoint
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [deciding whether a stored capture may be resumed on this host, a restored environment boots and then misbehaves inexplicably, choosing what a capture must record about the runtime that made it, deciding what has to be copied while a source is paused]
---

# Runtime-bound checkpoint

Captured execution state is meaningful only under the runtime that captured it.
Memory holds pointers into an address space that a particular allocator laid
out, device state negotiated with particular emulated hardware, and
instructions assuming a particular processor's feature set. None of that is
self-describing, and none of it fails at load. It fails later, in behaviour,
under a resume that reported success.

So a capture carries a **fingerprint of everything the resume depends on**, and
the restore refuses on any mismatch. The technique is the contents of that
fingerprint, the comparison rule, where the comparison runs, and how the
capture's own name declares where it can be redeemed.

## A version string is the wrong predicate

The instinct is to stamp a version — of the monitor, of the platform — and
compare it. It is not enough, in the specific way that matters: the version is
what the binary *says about itself*, and the thing that must match is the
binary. A locally patched build, a distribution's backport, a rebuild with a
different feature set and a rebuilt initial filesystem all report the same
version and produce incompatible runtime state. A gate that reads the
self-report is a gate observing a proxy for its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and it passes
exactly in the case it was built for: the day the two diverge.

**Fingerprint by content hash wherever a hash is available, and by exact value
elsewhere.** In practice the fingerprint has five classes of entry, and a
system that skips a class discovers which one it needed by shipping a broken
resume:

- **The executing code.** Content hashes of the monitor or supervisor binary,
  of any privilege-dropping launcher that shapes the environment, of the kernel
  image, and of the initial filesystem handed to it. These are the entries that
  a version string cannot stand in for.
- **The control protocol.** The version of the interface the resume speaks to
  the runtime, as an explicit integer, so an internal protocol change is a
  refusal rather than a malformed request.
- **The machine's shape.** Processor architecture, processor count, memory
  size. Captured memory is sized and addressed; restoring it into a different
  shape is not a resize, it is a mismatch.
- **The device policy.** Which virtual devices existed and under what rules —
  because the captured state includes the guest's negotiated view of them, and
  a resume that offers a different device set resumes a machine into hardware
  it never saw.
- **The requested specification itself.** A hash of the environment
  specification the capture was taken under (image, mounts, network posture,
  limits), so a resume against a specification that has since been edited is
  refused rather than silently honouring the old one.

Two rules keep the list honest. **Nothing gets a default.** A fingerprint field
that is absent from an older capture and filled in with a plausible value has
converted "we do not know what this was captured under" into a definite claim
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)); the
right handling is a refusal naming the capture as pre-dating the field. And the
fingerprint carries a **format version of its own**, checked first, so the
structure is validated before its contents are compared.

## Equality, not compatibility

The comparison is whole-structure equality. The temptation is to write a
compatibility predicate — this field may differ, that one may not, a newer
monitor can read an older capture — and every such predicate is a set of
claims about a matrix nobody has tested. It will be right for a year and wrong
once, and being wrong once costs a machine that runs and lies.

Equality has a real price and it is worth paying: every patch of the runtime
invalidates every stored capture. Accept it, and design around it rather than
around the predicate. Captures of live execution state are short-lived by
nature — they exist to resume work in progress, not to archive it — so the
correct response to "our captures all became invalid" is a shorter retention
window and a re-capture path, not a looser check. Where a genuinely portable
artifact is wanted, that is a *different format* with a different identifier
and its own compatibility story, not this one with the check relaxed.

## Check at both ends, through one door

The comparison runs at restore. It must also run at **capture**, against the
environment being captured: is the source still running under the runtime that
this host is currently configured with, and does the source's specification
still hash to what the request asks for? A source that has drifted produces a
capture that is born invalid, and refusing at capture time puts the failure in
front of the operator who has the context, rather than in front of whoever
tries to resume it three weeks later.

Both ends call the same construction and the same comparison
([one-validation-door](../../../../_laws.md#one-validation-door)). Two
hand-written comparisons will disagree about one field within a quarter, and
the disagreement is undetectable from either side: the capture path will accept
what the restore path rejects, or worse, the reverse.

## The coherence window

A live capture pauses the source, and the pause is a resource with a cost that
the caller pays in latency. The discipline that keeps it small is a rule about
*what must be internally consistent with what*: **only the state that has to
match the memory image byte-for-byte is copied inside the pause; everything
else is copied after the source resumes.**

The disk overlay is inside the window, because the moment the source resumes it
begins writing to it again and the memory image would then describe a
filesystem that no longer exists. The memory and device state files, once
written, are inert — the source cannot change them — so copying them out
happens afterwards, at no pause cost. Getting this backwards is the standard
mistake and it is invisible in testing: copying everything inside the window
works perfectly and merely costs seconds of paused source per capture, which is
exactly the cost that makes per-step checkpointing unaffordable.

State inside the window has to be copied by a primitive whose cost does not
scale with the data — a copy-on-write clone — for the window to stay small at
all, which is why that primitive is a design requirement rather than an
optimisation.

## The name declares where it can be redeemed

A capture that can only be resumed on the host that produced it, or only inside
one provider's service, is a different kind of artifact from one that travels,
and the difference belongs in its **identifier**, not in a document beside it.
Give host-local and provider-private captures a namespaced name whose prefix is
the runtime that owns it; reserve unqualified, shared names for formats whose
bytes genuinely mean the same thing to more than one consumer.

The payoff is that a reader can see the constraint without opening the payload
— and the cost of getting it wrong is a portability claim nobody made being
inherited by everybody: a capture stored under a neutral name will be handed to
a second backend eventually, and the failure will be at redemption time, on
whatever host the work moved to.

## Decision rules

- Fingerprint the executing code by content hash, never by its self-reported
  version.
- Include the control-protocol version, the machine shape, the device policy
  and a hash of the environment specification; a resume depends on all of them.
- Compare the whole fingerprint for equality and refuse on any difference; do
  not write a compatibility predicate.
- Never default a missing fingerprint field — refuse and say the capture
  pre-dates it.
- Version the fingerprint structure and validate that version before comparing
  contents.
- Run the same comparison at capture time against the source, so an invalid
  capture is never stored.
- Build and compare the fingerprint in exactly one place, used by both paths.
- Inside the pause window put only what must be byte-consistent with the memory
  image; copy the rest after the source resumes.
- Namespace the identifier of any capture that is redeemable in one place.

## When not to use it

Do not fingerprint a capture whose meaning is intrinsic. A portable filesystem
artifact — an image built from a manifest, a content-addressed workspace bundle
— means the same thing on every host that can read it, and binding it to the
runtime that produced it would make a portable artifact host-local for no gain.
The test is whether the payload contains state that only a specific runtime can
interpret: memory, registers, device negotiation, a handle into somebody's
service. Filesystem bytes alone do not qualify, and a capture of filesystem
bytes should be free to travel.

The technique also does not replace a compatibility story for long-lived
archives. If captures must survive runtime upgrades, that is a requirement for
a portable format and a conversion path, decided up front — not for a softer
version of this check.
