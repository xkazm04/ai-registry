---
layer: technique
type: technique
subject: mcp-tools
technique: enumeration-without-a-scope
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [designing a list operation over per-caller resources, a listing whose access check has no natural scope to check against, removing a session or tenant boundary that a list endpoint depended on, deciding whether an unguessable identifier is enough, reviewing an API that leaks the existence of other callers' objects]
---

# Enumeration without a scope

An operation that returns *one* object can be authorized by recognising that
object: the caller presents an identifier, the server checks whether this
caller may have it, and answers. An operation that returns *a list* cannot
work that way. It has to answer "which ones are yours", which requires the
server to hold a notion of *yours* — a scope it can evaluate before it knows
which objects are in play.

Most systems get that scope for free from something else: a session, a
tenant, an account, a workspace. The technique is about what to do when the
free scope goes away, or was never definable in the first place.

> **When an enumeration cannot be scoped by anything the server defines
> unilaterally, delete the operation. Do not ship it with the obligation
> documented.**

The reflex is the opposite — keep the endpoint, write "servers SHOULD scope
this to the authenticated caller" in the contract, and let each
implementation satisfy it against its own permission model. That reflex is
what this technique exists to interrupt, and the reason is a real asymmetry
rather than a preference for strictness.

## Why an unguessable identifier does not rescue a list

A per-item handle with enough entropy is a genuine security primitive: the
server recognises one at a time, and an attacker who does not have it cannot
guess it. It is tempting to conclude that a list of such handles is equally
safe, and it is not, for a reason that survives every implementation:

**Recognising one handle requires no notion of who is asking. Correlating two
requires exactly that.** The server can decide "is this handle real and is
this caller allowed it" without any concept of a caller *identity* spanning
calls. It cannot decide "which of these ten thousand handles belong to the
party currently connected" without one. So the list operation reintroduces,
as a hard requirement, precisely the cross-call caller identity that the
handle design was chosen to avoid — and where that identity is not available,
the list has no correct implementation, only implementations that have not
been noticed yet.

## Deleting it is stronger than documenting it

The two options are not equally safe, and the difference is where the failure
lives:

- **Documented obligation.** The endpoint exists. Every implementer must
  independently notice the scoping requirement, choose a scope, and get it
  right. The ones who do not ship a listing that returns other callers'
  objects, and the defect is invisible from the outside — a correct-looking
  response, a well-formed list, no error. The protocol has distributed a
  security requirement to the population least equipped to satisfy it and
  retained no way to tell who failed.
- **Deleted operation.** There is no endpoint. The leak is not *prevented*,
  it is **unrepresentable** — a structural property rather than a
  configuration property, which is the difference between a guarantee and a
  hope ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

State the trade honestly, because there is one: callers lose recovery. A
client that loses its handles cannot ask what it had. The correct answer is
to make the caller responsible for durably keeping what it was given, and to
say so in the contract — which is cheap for the caller, who has exactly one
scope to worry about, and impossible for the server, who has all of them.

## The review question

This is the one to run when a scoping boundary is being removed for good
reasons — statelessness, horizontal scale, a tenancy model that stopped
matching reality:

> **What did that boundary silently scope?**

Removing a session removes far more than the session's stated purpose.
Enumeration is the load-bearing one, because it is the only operation class
that *cannot* be re-derived from a per-item check. Everything else usually
can: a per-item read becomes an identifier check, a mutation becomes an
identifier check plus authorization, subscriptions become an explicit
registration. The list is the residue, and it is the one that needs a
decision rather than a translation.

Do that inventory before the boundary is removed, not after. The failure
order in the wild is: the boundary goes, the list keeps compiling, and the
scope it was quietly using is gone — so the endpoint now returns everything,
and every test that only ever ran one caller still passes
([gate-sees-target](../../../../_laws.md#gate-sees-target): the check must see
the thing it now actually governs).

## When NOT to use this

Where a durable, server-verified caller identity genuinely exists —
authenticated accounts, a tenant on every request, a workspace the server
owns — the scope is real and the listing is fine. Keep it, scope it, test it
with two callers. This technique is for the case where the honest answer to
"scoped to what?" is a shrug, and the endpoint has been shipping anyway.
