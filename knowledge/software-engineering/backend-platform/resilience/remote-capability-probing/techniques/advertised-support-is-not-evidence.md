---
layer: technique
type: technique
subject: remote-capability-probing
technique: advertised-support-is-not-evidence
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, derivation-names-recomputation]
shared_with: []
use_when: [a read path is about to branch on a capability header the peer sent, deciding what observation proves a peer supports partial reads, a capability verdict was cached and outlived the setting that would have changed it, a peer returned success and the code concluded the capability works]
---

# Advertised support is not evidence

Access protocols that support fragment reads almost always define a way for a
peer to announce it: a header naming the accepted unit, a capability field in a
discovery document, a flag on a metadata response. Branching on that
announcement is the first thing anybody writes and it is the weakest signal in
the whole subject.

The reason is not that peers lie. It is that **the component that emits the
announcement is usually not the component that would serve the request.** In
front of any store worth reading there is a stack: a caching tier holding its
own copy, a rewriting proxy, a signing gateway that validates each request
against a policy, an edge node in another region. Each layer can pass through an
advertisement it does not itself honour, and each can strip one the origin would
have honoured. A declaration produced by one component about another
component's behaviour is a proxy, and a gate over a proxy passes exactly when
the proxy diverges from its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

Treating the announcement as a fact has a second cost that is easy to miss.
Absence of the announcement is not evidence of absence — plenty of peers serve
fragments perfectly and advertise nothing — so a read path that branches on it
converts *we have not asked* into *the capability is not there*, which is
[unknown rendered as a definite value](../../../../_laws.md#unknown-is-not-a-value)
at the exact boundary where the definite value is expensive.

## The rule

**Accept a capability only on a response you provoked, and name the exact
observation that constitutes acceptance.**

The observation is a conjunction, and every term is load-bearing:

1. **A status that could only have been produced by the capability running.**
   Not a success status — the distinct status that means *this response is a
   fragment*. A peer that ignores the fragment request and serves the whole
   object returns an entirely successful response, and a check for success has
   then concluded that fragments work on the strength of a whole-object
   transfer.
2. **A field that only that status carries**, present and parseable. A peer or an
   intermediary that fabricates the fragment status without the accompanying
   length or offset information has told you something you cannot use, and the
   read path that trusts the status alone will compute its next request from a
   number that is not there.
3. **Consistency between the two.** The returned extent must be the extent you
   asked for. A peer that answers a one-byte request with the fragment status
   and the object's full length has satisfied both terms above and still cannot
   serve fragments.

Write the acceptance test as one expression at the point the verdict is minted,
not as a chain of nested conditions spread over the ladder. The failure mode
this prevents is real and common: each rung of a ladder grows its own
slightly-different acceptance rule, they drift, and the rung nobody exercises
accepts a weaker observation than the rung everybody does.

## What is not the observation

- **The advertisement header.** Covered above; it is a hint that the probe is
  worth attempting, and nothing more. It is legitimate as an *ordering* input —
  probe the peers that advertise first — and illegitimate as a verdict.
- **A success status.** The most common defect in the subject.
- **The absence of an error.** A gateway that swallows the fragment request and
  returns a cached whole object raises nothing.
- **A previous verdict about a different peer.** Capability is a property of the
  address, not of the protocol, and two objects behind the same protocol reached
  through different infrastructure routinely differ.
- **A verdict inferred from the address's shape.** Branching on a hostname
  pattern, a path prefix, or a provider guessed from the address is the proxy
  defect one layer out; it is true on the day it is written and drifts
  afterwards.

## The verdict's scope and its clock

The verdict is **per peer**, where the peer is the smallest unit whose
infrastructure can differ — in practice the address's origin, not the protocol
and not the object. It is a stored derivation, so it names how it is recomputed
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
and its recomputation is event-shaped rather than timed:

- **Cached for the session,** because the fact it records — which layers sit in
  front of this store and what they honour — changes on somebody's deployment
  schedule, not on a timer. A time-to-live short enough to catch such a change is
  short enough to make the probe a recurring cost against a stranger's
  infrastructure.
- **Invalidated by a settings change,** because every switch in
  [assertion-permission-and-bypass-are-three-switches](./assertion-permission-and-bypass-are-three-switches.md)
  changes what the verdict would have been. A verdict that survives the operator
  turning a switch is a configuration nobody can apply.
- **Invalidated by a credential or signing change,** because a signing policy is
  one of the layers that decides the answer.
- **Never invalidated by a read failure.** A failed read is a fact about a
  request, and re-probing on it is how one flaky moment turns into a permanent
  demotion to the expensive path.

Store the verdict beside the reason it was reached — which observation accepted
it, or which one refused it — because the alternative is a boolean that nobody
can audit and that the next contributor will "fix" by widening the acceptance
test.

## When the announcement is enough

Two cases, and both are narrow. If the announcement and the read are served by
the same process and you own both, there is no divergence to catch and the
declaration is a fact; that situation belongs to the neighbouring subject about
dependencies you administer, not here. And if acting on a wrong answer is
free — the capability is an optimisation whose absence costs one extra request,
not a transfer — then paying a round trip to establish it is the wrong trade and
an optimistic attempt with a cheap correction is better than a probe. Probe when
being wrong is expensive; that is the only justification the round trip has.
