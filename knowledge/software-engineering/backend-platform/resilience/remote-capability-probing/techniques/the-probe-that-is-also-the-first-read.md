---
layer: technique
type: technique
subject: remote-capability-probing
technique: the-probe-that-is-also-the-first-read
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [choosing between a metadata request and a small real read to establish a capability, a capability probe costs a round trip against infrastructure you do not own, a metadata request said yes and the real read behaved differently, designing the rungs of a capability ladder]
---

# The probe that is also the first read

A probe against a remote you do not administer is charged twice: once in
latency the caller waits through, and once in a request against somebody else's
infrastructure that produced nothing the caller asked for. The general
discipline for probes says to perform the **smallest real interaction** the
verdict requires and to change nothing. This technique takes the second half
and argues with the first, because the constraint that made "smallest" the right
word does not hold here.

The general rule excludes representative workloads because a probe must be safe
to run at any frequency and must not disturb the target's state. A capability
probe against a read path disturbs nothing by construction — a read has no state
to change — so the scarce resource is not the peer's integrity, it is **the
round trip**. And once the round trip is the scarce thing, the cheapest probe is
not the smallest one; it is the one whose successful response is *work the
caller wanted anyway*.

## The rule

**Prefer a probe that requests the smallest genuine fragment of the real
resource over a metadata-only request about it.**

Two independent arguments, and they compound.

**The metadata verb is the one most often specially handled.** It is the request
that a caching tier answers from its own store, that a rewriting proxy
synthesises, that a signing policy rejects because the policy was written and
tested against reads. It is simultaneously the cheapest question to ask and the
question whose answer least predicts the behaviour of the request you actually
intend to make. A gate must see its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the target here
is *a read of this object*, not *a description of this object*.

**A successful fragment is not overhead.** It proves the capability and returns
bytes the caller keeps. On the path that matters — the peer supports fragments,
which is the case the whole ladder exists to serve — the probe's marginal cost
falls to zero, and a system whose fast path pays nothing for its own correctness
check is a system nobody is tempted to switch off.

## The ladder, and why the second rung exists

One probe is not always enough, because a fragment request has three possible
outcomes and only one of them is unambiguous.

1. **A fragment response with a consistent extent.** The capability is proven and
   the bytes are kept. Mint the verdict and stop.
2. **A whole-object response.** The peer ignored the fragment request. This is
   informative — it establishes the absence of the capability — but it may also
   have just transferred the entire object, which is why the request that
   provokes it asks for the *smallest useful* fragment rather than a
   representative one. The size of what came back is itself a measurement, and
   whether it is acceptable is the ceiling question owned by
   [degraded-rung-refusal-ceiling](./degraded-rung-refusal-ceiling.md).
3. **A response that is neither** — a refusal, a rejection from a signing layer,
   a fragment status with no usable extent. Here, and only here, a metadata
   question earns its round trip, because what the ladder now needs is not the
   capability verdict but the *size*, which decides whether the expensive rung is
   affordable at all.

Ordering the ladder this way puts the ambiguous, specially-handled request last
instead of first, which is the inversion of what most implementations do. The
cost of the inversion is one extra round trip on the peers that were going to be
expensive anyway; the benefit is that the peers that were going to be cheap pay
nothing.

## Decision rules

- **Ask for a fragment of the object you are about to read**, not of a probe
  object, a well-known path, or a sibling. Capability is a property of the route
  the request actually takes.
- **Ask for the smallest fragment the protocol will express**, because the
  outcome that ignores the request transfers whatever you did not bound.
- **Keep the bytes.** A probe that discards a successful fragment has converted
  a free check into a paid one, and the discard is usually an accident of the
  probe living in a different layer from the reader. If the layering makes the
  bytes unkeepable, that is an argument about the layering, not a reason to
  discard them.
- **Never issue the probe twice to be sure.** The second issue is answered by
  the same infrastructure as the first and adds no information; where the first
  outcome was ambiguous, the disambiguation is a *different* request, not a
  repeat.
- **Do not probe an object you are not about to read.** Speculative capability
  probing across a catalogue of peers spends a stranger's budget on a question
  nobody has asked yet, and the verdict will have aged by the time anybody does.
- **Attach a deadline, and let the deadline conclude *unknown*, not *no*.** A
  probe that times out has established nothing about the capability; recording it
  as absence demotes a peer permanently on the strength of one slow moment.

## When the metadata request is still right

Three cases, and naming them is what keeps the rule from being dogma.

If the caller genuinely needs the **size before the content** — it is deciding
whether to read at all, allocating, or showing a progress figure — then the
metadata question is not a probe, it is the read, and it should be issued as
such with the capability verdict taken from whatever it happens to reveal.

If the object is **small enough that the whole of it is an acceptable fragment**,
the ladder collapses: read it, and the capability question never needed asking.
The threshold for "small enough" is the same derived number as the refusal
ceiling, which is one more reason for that number to exist in one place.

And if the peer's protocol offers **no fragment request at all**, there is
nothing to probe. Classify the peer by its access class at open
([buffer-by-access-latency-class](./buffer-by-access-latency-class.md)) and skip
the ladder entirely rather than issuing a request whose answer is already known.
