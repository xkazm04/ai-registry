---
layer: technique
type: technique
subject: authorization
technique: unregistered-is-stronger-than-refused
status: forged
laws: [absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [an authorization dimension is fixed for the whole process lifetime, a deployment mode must remove a class of operation rather than restrict it, deciding whether a mode belongs in the gate or in the route table, a read-only or degraded deployment still exposes its mutating surface]
---

# Unregistered is stronger than refused

This subject's discipline moves an authorization decision from N handlers that
could forget it to one chokepoint that cannot be bypassed. That is the right
answer for every decision the gate has to make **per request**. It quietly
assumes the decision has to be made per request at all.

Some do not. An authorization dimension that is fixed when the process starts
and cannot change while it runs — a deployment configured read-only, a build
shipped without an administrative surface, an instance whose licence tier
forbids a whole feature class — is not answering a question about *this
caller*. It is answering a question about *this process*, and it already knows
the answer before the first request arrives. For that dimension there is a
construction stronger than the chokepoint: **do not build the operation**.

The operation is never bound into the dispatch table. There is no handler to
reach, no requirement to declare, no gate evaluation to get wrong, and no code
path in which the answer could come out differently. The dispatcher's own
not-found response is the refusal, produced by the framework before any
application code exists to be audited. This is the operation-level form of the
move [identity-bearing-keys](./identity-bearing-keys.md) makes on data: there
the caller cannot *spell* a reference to another owner's rows; here the caller
cannot spell a reference to the operation.

## The test that decides which construction applies

One question, and it is about the dimension rather than the operation:

> **Can the answer differ between two requests to the same process?**

- **No** — it is fixed at startup by configuration, build, or licence. Bind it
  into the route table. The decision is made once, where it is made once.
- **Yes** — it depends on the caller, the resource, the time, or any state that
  moves. It belongs at the chokepoint
  ([dispatch-chokepoint-gating](./dispatch-chokepoint-gating.md)), because a
  route table cannot vary per request and any attempt to make it do so is a
  cache of an authorization decision, which is a different and much worse
  technique.

Most systems carry both kinds at once and should use both constructions at
once. A surface where a process-constant mode governs which *classes* of
operation exist, and a per-request gate governs who may invoke the ones that do,
is not an inconsistency — it is each dimension enforced where it is decided.
What is an inconsistency is running a process-constant dimension through the
request-time gate "for uniformity", which buys a checkbox and pays for it with
a check that a new endpoint's author can omit.

## What it buys that a check does not

- **A new operation is not covered by default — it is visible by default.** The
  mutating operations live inside the conditional block that builds them. An
  author adding one either puts it in the block, where it inherits the mode, or
  outside it, where the indentation says so in the diff. The reviewer's question
  stops being "did you remember the annotation?" and becomes a structural fact
  they can see without knowing the annotation exists.
- **The surface is absent, not merely defended.** Generated schema documents,
  client stubs, and capability listings are emitted from the route table, so
  they show a read-only deployment as *read-only* rather than advertising
  operations that will refuse. Nothing has to remember to filter them; per
  [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
  the route table is the one authority and every derived artifact is already
  derived from it.
- **The refusal precedes deserialization.** Nothing parses the body, resolves
  the path parameter, or touches attacker-supplied input, because there is no
  handler whose preamble could run — the same property the chokepoint buys,
  obtained without an application-level gate to trust.
- **It survives the gate's own failure.** A misconfigured, crashed, or
  accidentally-disabled authorization kernel cannot uncover an operation that
  was never bound.

## The failure mode this construction has, and it is the opposite one

The mechanism is only as good as the direction it fails in, and it is worth
stating flatly because it is where this technique meets
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud).

The construction removes routes when the restrictive mode is **on**. The
adjacent and much more common pattern — assembling a list of guards and
attaching it to every route — removes *guards* when the permissive mode is on,
and it does so by evaluating to an empty list. An empty guard list is not an
error, produces no log line, and attaches cleanly to every route in the system;
the surface stays fully addressable and is now fully open. The two mechanisms
sit side by side in most codebases that use either, and they fail in opposite
directions under the same class of misconfiguration: one removes the door, the
other removes the lock and leaves the door.

So the pairing rule: **a construction whose disabled state is "no guards" must
be loud about being disabled; a construction whose enabled state is "no route"
does not need to be.** Where the guard list can degrade to empty, that emptiness
is logged at startup as a deliberate posture, named in the health or
configuration surface, and asserted in a test that fails when the list is empty
under a configuration that should populate it. Where the route is simply not
built, the absence is self-evidencing: the operation returns not-found, which is
observable from outside without reading any code.

## Decision rules

- **Ask whether the answer can differ between two requests to this process.**
  It decides the construction, and nothing else does.
- **A process-constant dimension binds into the route table**; a request-varying
  one binds into the chokepoint. Do not route the first through the second for
  tidiness.
- **Never invert it.** A dimension that varies per caller must not be resolved
  at startup, however static it looks in the current deployment; that is an
  authorization decision cached for the process lifetime, and the cache has no
  invalidation.
- **Emit derived artifacts from the route table**, so a restricted deployment's
  documentation and client stubs are restricted for free.
- **Guard lists that can evaluate to empty announce it at startup.** The
  companion pattern's failure direction is open, and it is silent.
- **State the mode in a read-only surface the operator can query**, because an
  absent operation and a broken deployment are indistinguishable from outside
  otherwise — the client needs to know the difference between *you may not* and
  *this instance does not do that*.
