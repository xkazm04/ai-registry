---
layer: technique
type: technique
subject: mcp-tools
technique: suspendable-request-classes
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [deciding which operations may pause for human input, a discovery or listing call that can block on a person, designing a protocol where the callee may need to ask the caller something, a proxy or cache that stalls behind a consent prompt, auditing which calls a policy layer is allowed to interrupt]
---

# Suspendable request classes

A protocol that lets the callee stop mid-operation and ask the caller a
question has introduced a second kind of latency: not "this is slow" but
"this is waiting for a human, and may wait for days, or forever." The
temptation is to make that capability uniform — any call may suspend, because
uniformity is simpler to specify and simpler to implement. It is the wrong
default, and the discriminator that replaces it is sharper than "use
judgement".

> **Only a call that invokes application semantics may suspend. A call that
> asks the protocol about itself must be answerable by machine alone.**

Split the surface in two before deciding anything else. **Invocation verbs**
do the work the protocol exists for: run this tool, read this resource, render
this prompt. **Metadata verbs** describe the protocol's own state: what
version do you speak, what capabilities do you have, what exists here, what
completes this argument, give me the next page. The first class may pause for
a person. The second class may not — and the reason is not politeness, it is
that everything else in the system is built on the second class terminating
promptly and without a human.

## Why the metadata surface cannot be allowed to block

Three consumers depend on it, and each breaks differently:

- **Bootstrap.** A client that must ask a person something before it can
  learn what a server supports cannot start unattended, cannot start in CI,
  and cannot start on a machine with no one at the keyboard. Every headless
  caller is excluded by one suspendable discovery call.
- **Caching.** A cacheable answer that may instead return "I need to ask
  someone" has two result shapes, only one of which is storable, and the
  cache must now model a state that is neither hit, miss, nor error. In
  practice caches do not model it; they store the wrong thing or refuse to
  store at all.
- **Proxying and federation.** An intermediary aggregating several backends
  fans out metadata calls and merges the answers. One backend that suspends
  turns a merge into an indefinite hold on every caller behind the
  intermediary, including callers who never touch that backend.

The rule is therefore structural rather than stylistic: the metadata surface
is the part of a protocol that other machinery is entitled to treat as a pure
function of (server state, credential). Admitting a human into it converts a
lookup into a workflow.

## Make the partition total, and check it

The failure mode is not choosing wrong — it is leaving the classification
implicit, so that each new verb inherits whatever the last one did. State the
partition over the **complete** set of operations and leave no member
unclassified ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)):
every operation is *suspendable*, *non-suspendable*, or *streaming*, and a
new operation does not ship until its cell is filled in. A protocol whose
answer is "most calls can't, probably" has no partition; it has a habit.

Two boundary cases are worth pre-deciding, because both look like
counter-examples and neither is:

- **A cacheable invocation verb is still suspendable.** Reading a resource
  may be cacheable *and* may need a credential the user has not yet supplied.
  Cacheability is a property of the answer; suspendability is a property of
  who must be present to produce it. Do not collapse them — the intuition
  that "cacheable implies never blocks" is the most likely wrong hypothesis
  here.
- **A long-running invocation is not the same as a suspended one.** Work that
  takes an hour with nobody to consult is a durable-handle problem, and the
  answer is a pollable receipt, not a paused call. Suspension is specifically
  *a person is required*; conflating the two puts human latency and machine
  latency behind one mechanism and neither gets the right timeout.

## Consequences for the caller

A caller cannot discover which operations may suspend by trying them, because
the ones that can may not do so today. So the classification is part of the
published contract, and a caller writes two code paths only where the contract
says it must. That is worth stating in the contract explicitly, because the
alternative — every call site defensively handling a pause — is the cost the
partition exists to avoid, and it is paid silently by clients rather than
visibly by the protocol.

Where the surface is gated by a policy layer rather than by the protocol, the
policy must read the operation actually resolved, not the transport-level
shape it arrived in
([gate-sees-target](../../../../_laws.md#gate-sees-target)): a batched or
proxied call that resolves to an invocation verb is suspendable even if its
envelope looked like metadata.

## When NOT to use this

A closed system with one client, one server, no intermediaries and no cache
gains nothing from the partition; the uniform rule is cheaper and nothing
downstream depends on the distinction. The partition earns its cost at the
moment a **third party** appears — a proxy, a shared cache, an aggregator, a
headless CI caller — because that is the party that cannot see the human and
cannot wait for one.
