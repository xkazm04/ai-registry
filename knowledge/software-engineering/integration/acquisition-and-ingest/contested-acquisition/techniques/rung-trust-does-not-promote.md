---
layer: technique
type: technique
subject: contested-acquisition
technique: rung-trust-does-not-promote
status: forged
laws: [verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [wiring a response that delegates the retrieval to another party, deciding what a delegated step's output may be stored as, a step sends the target address off-machine]
---

# Rung trust does not promote

A ladder of responses to a refusal ends up containing steps of very unequal
trust. Some run entirely inside your process. Some hand the work to a service
you operate but did not write. Some hand it to a third party you neither
operate nor wrote, which fetches the target on your behalf and returns what it
got.

Every one of them returns the same thing: a document. The uniform interface is
the whole benefit of the ladder and it is also the mechanism of this failure —
**the difference in trust is invisible at the point of reuse**, because a
document is a document and a stored artifact carries no memory of which step
filled it.

> A delegated step's product carries **that step's trust tier forward**. Use it
> for the request in hand; never store it where a later read will find it
> indistinguishable from one you produced yourself.

## The sharp case is not the content, it is the reusable artifact

Content flowing out of a delegated step is usually handled with appropriate
suspicion, because somebody sanitizes it before it is parsed. The artifacts
that get through are the *reusable* ones: credentials, cookies, session
values, anything a delegated step hands back that a store exists to replay.
Those are the things a store is *for*, and the store is read by code that has
no idea which step filled it.

The rule for them is stark and easy to implement: **a delegated step's
credentials are not surfaced as reusable.** Discard them at the boundary of
the step that produced them. They may be used, if at all, only inside the
single operation that obtained them, and they never reach the shared store,
never cross a host boundary, never appear in a later request the caller did
not connect to this one.

Implement it as a discard at the boundary, not as a filter at the store's
door. A filter is a check somebody must remember to write for the next step
added; a discard is a property of the step, visible in the step, and it
survives the store being rewritten. Say in a comment at the discard site
*that the discard is deliberate*, because silently dropping something that
looks useful reads as an omission and gets "fixed".

## Provenance is a value, not a comment

Where a delegated product legitimately does flow onward, its tier travels with
it as a typed field — which step produced this, at what tier — and reaches
every boundary that acts on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
The stored row that cannot say where it came from has already lost the
distinction, and it is not recoverable afterward by inspection: a credential
minted by a third party and one minted by your own pass are the same shape of
string.

That absence is the laundering step this subject's classifier rule warns about
in another guise — an unknown provenance read later as *ours*
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). If a
store cannot carry provenance, the delegated product does not go in it. That
is the whole decision, and it is cheaper than the column.

## Egress is a property of the step, not of the deployment

The second half of this technique is about disclosure rather than trust, and
it is regularly mis-filed as an operations concern.

A step that hands the target address to another party has **egressed the
request off-machine**. What was a local retrieval — a caller asking a program
on their own machine to read a document — has become a disclosure of what that
caller is reading, to a party the caller did not choose. That is true whether
the deployment is a laptop, a container or a shared host. It is a property of
the step.

Three obligations follow, all cheap:

- **The step is opt-in and off by default.** It engages only when explicitly
  configured, and an installation that configures nothing never reaches it.
  Wiring it in lazily — the module is not even loaded until a configured step
  needs it — makes the default provable rather than asserted, and keeps the
  cost of an unused capability at zero.
- **The address is redacted in logs.** The step's own diagnostics are where
  the target most often leaks, because the author was debugging the delegation
  and not thinking about the target. Redact at the logging call, in the step.
- **Everything the step touches is guarded like an inbound address.** The
  delegate's endpoint, the target, and every redirect hop are each validated
  before the connection is made, with the hop count bounded, and any
  credential dropped on a cross-host hop. A delegated step is a request the
  caller did not write, aimed at an address the caller did not choose, and it
  points inward as easily as outward.

## Decision rules

- **When a step is executed by another party, discard its reusable artifacts
  at the step boundary.** Not at the store.
- **When a delegated product must flow onward, it carries its tier as a typed
  field.** If the destination cannot hold the field, the product does not go
  there.
- **When a step egresses the target off-machine, it is off by default and its
  addresses are redacted.** Both, always, regardless of deployment.
- **When adding a step, state its tier where the step is declared.** The tier
  is the first thing the next reader needs and the last thing they will
  reconstruct correctly from the code.

## When not to use this

If every step in your ladder runs in your own process on your own machine, the
tiers are equal and this technique is bookkeeping. It becomes load-bearing the
moment the first delegated step is added, which is also the moment nobody
revisits the store's assumptions — so the useful time to read it is one step
before you need it.
