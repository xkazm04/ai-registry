---
layer: technique
type: technique
subject: mcp-tools
technique: sanctioned-session-state
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [a caller must reach the replica holding its state, sticky routing survives a restart and lands on a node that lost the state, deciding whether a service may opt into affinity]
---

# Sanctioned session state

The golden path settles this: the protocol's current revision removed
connection lifecycle, cross-call state is an explicit handle, and possession
of a handle is not authentication. All of that stands. But a protocol
removing sessions does not remove the deployments that have them — a server
holding an in-memory workspace, a streaming operation mid-flight, an
expensive warmed context — and those deployments will acquire affinity one
way or another. The choice is whether it is a designed capability with an
argued boundary, or a load-balancer setting somebody added during an
incident.

This technique is the designed version: **how to ship instance affinity for a
stateless protocol without teaching every consumer that stateful servers are
normal.**

## Opt in twice, or a dependency will opt in for you

Affinity is acquired by two separate deliberate gestures: **registering** the
capability in the application's composition, and **applying** it to a
specific endpoint. Neither alone turns it on.

One gesture is not enough, and the reason is transitive dependencies. If
merely referencing a package — or merely registering a service another
package pulled in — made a deployment sticky, then a service could become
stateful because something three levels down its dependency graph wanted to
be. The property would be acquired without any author of the affected service
having decided anything, which is the precise shape of a change nobody can
find later. Two gestures make the second one local to the endpoint it
affects, and make the grep that answers "what in this deployment is sticky"
return the truth.

## Ship it arguing against itself

A capability that reintroduces a property the protocol deliberately removed
must carry its own counter-argument, positioned **before** its usage
instructions, or it becomes the default by the ordinary mechanism: someone
searches for how to keep state, finds a supported feature, and uses it.

So the documentation for such a capability states, up front and without
hedging: it is **not required for protocol compliance**; stateless routing
with externalized state is preferable wherever it is achievable; and here is
the enumerated list of situations in which you should **not** use this. The
usage section comes after. A capability documented in the ordinary
enthusiastic order teaches every consumer to build stateful servers by
default, and the cost of that lands on operators who never read either
document.

## Degrade to nothing at one replica

With a single instance, the local cache alone is correct: every caller
already reaches the only node that could hold its state, and no shared store,
no coordination and no operational bill are required. The capability should
behave that way — the shared ownership record is what the *second* instance
needs, and asking for infrastructure before it is needed is how a feature
acquires a reputation for being heavy.

## The restart oracle

This is the real content, and it is the part everyone gets wrong once.

Affinity works by recording *which instance owns this caller's state* and
routing subsequent requests there. Those records outlive the process that
wrote them — they are in a shared store precisely so that other nodes can
read them. So the question that decides the design is: **what identifies the
owner?**

The obvious answer is a stable identity — hostname, orchestrator-assigned
pod name, a configured instance name. It is exactly wrong. After a restart,
the new process answers to the old identity, so every ownership record
written by the *dead* process still resolves, still points at a reachable
node, and still routes callers to an instance that believes it owns state it
no longer has. The failure is not an error; it is a **silent wrong answer** —
the caller's session appears to work and behaves as though it forgot
everything, intermittently, only after restarts, only for callers who were
mid-session.

Make the owner identity **ephemeral: regenerated at every process start**, and
carried in the record alongside the address. Now the stale record is provably
stale — the address matches, the generation does not — and the reader drops
it rather than trusting it. A silent wrong answer has become a detectable
mismatch, which is the whole trade.

What that buys operationally is the important part: **no deregistration hook,
no heartbeat, no lease.** Each of those is a mechanism that must run for
correctness to hold, and a crash — the case affinity is most likely to be
tested by — skips every shutdown hook there is. The generation check needs
nothing to run; it is a comparison the reader performs against data it
already fetched.

### This inverts a law, deliberately

[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) says
identity must survive restart. Here the owner identity must **not**, and the
inversion is the point rather than an oversight.

The law protects the identity of a *record*, so that the thing being tracked
stays the same thing across reordering, duplication and resume. What is
being identified here is not a tracked entity but a **claim's validity
window** — "the process that made this promise". Survival is precisely the
property that makes a dead process's claim indistinguishable from a live
one's. The law and the inversion agree on the underlying rule, which is that
an identifier must answer the question actually being asked: apply the law to
the *session* handle, whose identity must absolutely survive restart, and
invert it for the *owner*, whose identity is the restart boundary.

## Second detection channel, and its trap

The generation check catches restarts. It does not catch a node that is alive
but has lost the state — evicted from a bounded cache, dropped after a
timeout. For that, a second channel: when a request is forwarded to the
recorded owner and the owner answers "not found", the record is evicted and
the caller starts fresh.

That predicate must be **scoped to the protocol's own endpoints**. A blanket
"any 404 evicts" rule means an unrelated health check, a missing static
asset, or a probe against a path that never existed will evict live sessions
in bulk, and the resulting mass session loss will be attributed to anything
except the eviction rule.

The general trap, worth stating because it recurs: **scope the predicate on
endpoint metadata, not on a substring match against a display string.** A
rule that fires when the endpoint's *name* contains some token has two
failure modes and both are silent — rename the endpoint and eviction quietly
stops happening, so stale records accumulate forever; and any unrelated
endpoint whose name happens to contain that token silently gains the power to
evict sessions. Either way the gate is reading a proxy rather than the thing
it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Key on the
routing metadata that says *this is a protocol endpoint* — the attribute, the
group, the registered route — which changes only when the fact itself
changes.

**Expect the tests to be the reason the proxy survives.** A thorough
behavioural suite written against the proxy *pins it in place*: if every case
constructs its endpoints by setting the display string and leaving the real
routing metadata empty, then correcting the predicate to read metadata turns the
entire suite red at once, and the correct fix now looks like a regression. The
suite is complete about the behaviour and silent about the discriminator, so it
grades a rewrite as a break. When a check keys on a proxy, the tests must supply
the *real* attribute too, or the fragility acquires a defender. Look for the tell
in the fixtures rather than in the assertions: endpoints built with empty
metadata, or a quadrant covering a configuration the wiring cannot actually
produce, mean the suite is exercising the proxy and not the rule.

## The boundary that does not move

None of this makes the routing token a credential. The affinity key routes a
request; it never authenticates one. Every rule the golden path states about
handles applies unchanged: the server binds the session to the principal it
verified on each request, re-verifies on every call, and treats a caller
presenting someone else's affinity key as an unauthorized caller who happens
to know where a node is. Affinity is a **placement** decision made before
authorization and never in place of it. A design that skips the check because
"they routed to the right node, so it must be them" has converted a load
balancer into an authentication system.
