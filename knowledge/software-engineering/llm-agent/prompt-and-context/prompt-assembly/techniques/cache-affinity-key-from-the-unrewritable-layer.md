---
layer: technique
type: technique
subject: prompt-assembly
technique: cache-affinity-key-from-the-unrewritable-layer
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a provider accepts a routing or cache-affinity key and the client must derive one, a derived request key changes mid-session after compaction, every session sharing a standing prompt lands on one key, a blank key would be sent and route every caller together, one key carries more traffic than the provider's guidance allows, deciding whether a session identity can be recovered from a single request]
---

# A cache-affinity key comes from the layer the compactor cannot rewrite

Some providers cache a request prefix on their own and accept an optional key whose
only job is to steer requests toward the machines holding that prefix. The key does
not change what is cached; it changes which requests can reach a cached prefix.
That makes it a derivation, and
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applies: a value derived from the request has to name what it is derived from, and
that input has to hold still for as long as the session wants the cache.

[fingerprinting-and-cache-keys](./fingerprinting-and-cache-keys.md) covers the other
key, the stamp that decides whether a resumed session still matches its prompt. This
is the per-request key sent to the provider, and its failure is different: it is
wrong silently, in exactly the long sessions the cache exists for.

## The tempting derivation and why it fails

A request has a system prompt, tool definitions and a message list. The natural way
to give each conversation its own key is to hash something that looks like
conversation identity: the system prompt plus the first user message. It is stable
under every test that appends messages, so it passes review.

It fails the moment history is rewritten. A compactor may drop the head of the
transcript and put a constant marker in index zero; the constant is deliberate, so
the cached prefix stays byte-stable. The "first user message" is now the marker for
every compacted session, so:

- the key **drifts mid-session**: before compaction it hashed the real first
  message, after it hashes the marker, and the requests that should find the
  cached prefix are routed elsewhere;
- the key **collapses across sessions**: every compacted session that shares a
  standing prompt now has the same key, which routes unrelated sessions together,
  the harm a guard against empty heads exists to prevent, arriving through the other
  door.

Both failures begin at the moment a session is long enough to be worth caching. The
original tests all appended, which is the one condition under which the derivation
holds, so nothing failed until a reviewer thought about the compactor.

> **Session identity is not recoverable from a single request snapshot.** A request
> carries a standing layer and a rewritable layer. Only the standing layer is stable
> for the life of the session, and it does not carry identity.

## The rule

- **Derive the key from the layer nothing downstream rewrites.** Usually that is
  the standing prompt, held in its own field where the compactor cannot reach it.
  It is also the cacheable prefix, which is what the key is meant to route toward.
- **Accept that sessions sharing a standing prompt share a key.** That is the
  correct grouping, since they share the cached prefix, but it concentrates traffic
  on one key. The primary guidance for the providers that publish it is to keep the
  key stable within a group and to partition high-volume traffic across several
  keys by a stable mapping; the same provider states that cached state lives on
  individual machines and that traffic above fifteen requests per minute can lead
  to overflow routing. Offer an
  explicit override so a deployment can supply a per-tenant or per-session key, and
  treat the override as the way to get identity, since the derivation cannot.
- **A blank key is unset, never sent.** An empty key routes every caller who sent
  one onto a single cache. Trim it away before it reaches the request
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **Send it only where it is understood.** A strict server that validates unknown
  fields rejects the whole request instead of ignoring the key, so the key is gated
  on a capability flag that is on for the one provider that reads it. Where the flag
  is off and a caller supplied a key, warn; discarding it silently hides a
  configuration the caller believes is working.
- **Treat the key as a model-dependent aid.** The provider's own guidance says that
  on its newest models routing is automatic and the key is optional, while on
  earlier ones it matters for hit rate. A key that was worth deriving carefully is
  worth re-checking against the provider's current statement before it is relied on.
- **A key also separates tenants.** The same primary lists separate cache accounting
  and preventing cache-hit probing across users among the reasons to key by user or
  workspace. A key derived from the shared standing prompt gives that up on purpose,
  so a multi-tenant deployment sets the override.

## Verifying it

Write the test the original suite lacked: build two conversations that share a
standing prompt, run both through the real compactor at a budget small enough that
the head is dropped, and assert two things: **each session's key is the same before
and after compaction, and the two sessions' keys are equal by design** (and differ
once an explicit key is set). Then assert a blank explicit key produces no key. A
test that only appends proves nothing about this derivation; the test has to rewrite
the head to reach the failing condition.

## Decision rules

- Derive the key from the standing layer, never from a message the compactor can
  rewrite.
- Say in the interface that sessions sharing a prompt share a key, and give an
  explicit per-session override.
- Treat a blank key as absent.
- Gate the key by provider capability and warn when a supplied key cannot be sent.
- Test the key across a compaction that drops the head, not across appends.
- Re-read the provider's current guidance; the key's value is model-dependent.
