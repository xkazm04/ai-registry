---
layer: technique
type: technique
subject: untrusted-extension-host
technique: pluggable-isolation-runner
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [the product must run isolated extensions on more than one deployment target, deciding what belongs in the isolation runner and what belongs above it, publishing what a sandbox actually enforces]
---

# Pluggable isolation runner

Isolation is a property of the platform, not of the product. A managed edge
runtime, a container supervisor, a language runtime with an isolate API, and a
bare process on an operator's own machine offer different primitives with
different ceilings, and a product that must run on more than one of them has to
treat the isolation primitive as an **injected dependency**. This technique
owns that seam: what goes below it, what must never go below it, and the
obligation the seam creates to publish what each implementation actually
enforces.

## The line: platform features below, policy above

The runner interface is small on purpose, and the rule for what belongs inside
it is mechanical: **only what the platform provides.** In practice that is four
things — instantiating an execution context with no ambient reach, loading the
extension's code into it, imposing whatever resource ceilings the platform can
impose, and tearing the context down. Nothing else.

Everything a second platform would otherwise have to reimplement belongs
**above** the seam, in code that is written once:

- **The broker.** The set of host functions the isolated code may call, their
  argument validation, and their return shapes.
- **The privilege check.** Every brokered call resolves against the
  extension's declared grant, in shared code, before the host function runs.
- **The manifest and its parse.** One reader, one canonical form, one derived
  privilege set.
- **Dispatch, ordering, error attribution, and the failure policy.** Which
  callbacks run, in what order, and what their failures mean.
- **Storage namespacing and query validation.**

The test for a proposed runner method: would two runners implement it
*identically*? If yes, it is policy and it belongs above. A runner interface
that grew a permission check would have two permission checks in the product,
which is one more than the number a privilege system can survive
([one-validation-door](../../../../_laws.md#one-validation-door) applies at the
broker, and the broker is one).

The seam also fixes the direction of the dependency. The runner receives an
already-authorized call surface from above; it does not consult policy, and it
does not know what an extension is allowed to do. A runner that decides is a
runner whose replacement changes the security model.

## Two runners are not two of the same thing

Here is the asymmetry that hosts hide, and it is the load-bearing part of this
technique. Ceilings are not portable. A managed platform runtime typically
enforces a wall-clock limit, a memory ceiling, a processor-time ceiling and a
count of outbound requests, because the platform's scheduler and allocator are
enforcing them anyway for its own reasons. A standalone runner on an operator's
own machine, built from a language runtime's isolate facility, will very often
enforce **wall time only** — because processor-time accounting and hard memory
ceilings are supervisor features that the embedded facility does not expose,
and implementing them honestly means a process boundary the runner does not
have.

So one interface, two implementations, and one of them cannot honour half the
fields the other does. That is acceptable. What is not acceptable is calling
both of them "the sandbox" and publishing one guarantee.

**Every runner declares which ceilings it enforces, the host reads that
declaration, and every surface that describes an extension's containment
reports the *effective* set rather than the configured one.** A configured
memory ceiling on a runner that cannot enforce memory is not a limit; it is a
number in a settings file that reads as a guarantee to everyone who sees it,
which is unknown rendered as a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
operator who chose the standalone runner for an air-gapped deployment must be
able to learn, from the product, that a runaway extension on that deployment
will be stopped by a timer and by nothing else.

The same rule covers absence: a host with no runner configured has no
isolation, and "no isolation configured" must be a loud state rather than an
implicit one ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
A product that silently runs sandboxed extensions unsandboxed when the runner
is missing has inverted its own trust model at the moment nobody was looking;
the correct behaviour is to not run them at all and say so.

## The interface carries the ceiling vocabulary, not the ceilings

One design detail keeps the declaration honest. The set of ceiling *kinds* is
part of the shared interface — one vocabulary, defined above the seam — and
each runner declares which of them it supports and what the platform's own
hard maximum is. That is what lets the host validate a configured ceiling
against the runner at startup, refuse a configuration that asks for an
unenforceable one, and render the effective set without asking the runner to
describe itself in prose.

It also makes adding a platform a bounded job: implement four methods, declare
a support set, and inherit the broker, the policy, the manifest and the
dispatcher unchanged. A host that has to port its permission model to add a
deployment target does not have a pluggable runner; it has two extension
systems that share a repository.

## Decision rules

- Put only platform primitives below the seam: context creation, code loading,
  resource ceilings, teardown.
- Keep the broker, the privilege check, the manifest parse, dispatch and the
  failure policy above it, written once.
- If two runners would implement a method identically, it is policy — move it
  up.
- Make the ceiling vocabulary shared and the ceiling *support* per-runner;
  refuse at startup a configured ceiling the selected runner cannot enforce.
- Report the effective containment, not the configured one, on every surface
  that describes it.
- Treat a missing runner as a refusal to run sandboxed extensions, announced —
  never as a fallback to running them unisolated.

## When not to use it

A product that ships on exactly one deployment target, and will not ship on a
second, should use that platform's primitive directly and skip the interface —
a seam with one implementation is an abstraction validated by nothing, and it
will fit the second platform badly anyway when it arrives. Introduce the seam
when the second target is real, and let the second implementation shape the
interface rather than the first.
