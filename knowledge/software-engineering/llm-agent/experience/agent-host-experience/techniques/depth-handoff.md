---
layer: technique
type: technique
subject: agent-host-experience
technique: depth-handoff
status: forged
laws: [claimant-does-not-adjudicate, creation-names-reaper]
shared_with: []
use_when: [a task that starts in a general assistant and must finish in the product, an irreversible or money-bearing act requested through an agent host, a link back into the product that must land on the exact state]
---

# Depth handoff

A host conversation is where a task starts well and a consequential one finishes badly.
The host renders a glimpse of the product; it does not have the product's history, its
editing surfaces, its audit trail, or its consent ceremony, and it cannot be made to.
The handoff is the seam between the two: the agent does the heavy lifting — finding,
drafting, narrowing — and the product owns the depth and the commitment.

## What may finish in-host, and what must come home

Sort every journey's final step by what it costs to get wrong:

- **Finishes in-host:** reads, searches, comparisons, drafts the user will review later,
  reversible changes the product can undo, and proposals that only add a record someone
  can still answer (an offer the other side may decline, a request a person must sign).
- **Comes home:** anything irreversible, anything that moves money or grants access,
  anything that signs on the user's behalf, anything whose correct review needs the
  product's full context (history, limits, other pending items), and any editing longer
  than a glance.

The second list does not run in the host with a confirmation added. It is filed and
completed elsewhere: the operation records a pending item and returns its identity, and
the act happens when the person confirms it in the product's own consent surface.

## The pending answer says nothing has happened

An operation that filed a pending item answers in-band, successfully, with the item's
identity in the structured result and a sentence in the text that **nothing has
happened yet** and nothing will until the person confirms. The product's instructions to
the agent say the same thing once, at discovery: a filed item is not a done item, so
never report it as done. This is the most common failure on the agent's side — a model
that reads "filed" as "booked" and tells the user so — and the only defense is to make
the answer impossible to misread. The pending item runs once, when the person confirms,
and nothing a caller sends can run it.

## The link carries a handle, never the state or a credential

The handoff link lands the user on the exact decision, not on a home screen. It carries
an **opaque, expiring handle** the product minted for this item, which the product
resolves to state it already holds:

- **Never the state itself** in the link. A link that encodes the amount, the recipient
  or the draft lets anyone who edits the link change what the user is asked to confirm.
  The confirmation is rendered from the resolved item, never from the link's or the
  view's own label.
- **Never a credential.** The handle names an item; it does not authenticate the person
  who opens it. The product authenticates and authorizes on arrival exactly as for any
  other entry, and a handle opened by the wrong principal resolves to nothing. A handle
  is a name, not a capability; its design is
  [sealed-continuation-state](../../../runtime-and-io/mcp-tools/techniques/sealed-continuation-state.md).
- **Expiring, with a stated reaper.** The handle and the pending item it names have a
  lifetime and an owner that expires them
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)); a link opened
  after expiry says so and offers the current state, not an error page.

Where the host offers a standard way for a view to open a link, use it; where it offers
nothing, put the link in the text result, because a link in text works in every host.

## The product enforces the confirmation

A destructive behavior hint lets a host confirm before calling. It is advice: some hosts
honor it, some ignore it, and a user who ticked "always allow" has turned it off. The
host's report that the user confirmed is a claim by a party that does not own the
consequence, and it does not decide whether the act happens
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)). So
**confirmation of an irreversible act is enforced by the product**: in its own consent
surface, or through an out-of-band confirmation bound to the authenticated user — a
paired device, a signed approval, a step only the person can perform. The consent model
itself — grants, gate states, what a decision record holds — is
[consent-gates](../../../orchestration/hitl-approval/techniques/consent-gates.md); which
operations may pause for a person mid-call and which must not is
[suspendable-request-classes](../../../runtime-and-io/mcp-tools/techniques/suspendable-request-classes.md).

## Secrets and payment details never pass through a readable form

A host that can show a form inside the conversation can show its contents to the model,
log them, and keep them in a transcript. Passwords, keys, tokens, card numbers and
third-party sign-ins therefore never travel through a form the model or host can read.
Send the user to a page the product serves directly — opened so neither the host nor
the model can inspect it — bound to the user the product already authenticated, and
answer the operation once the out-of-band step completes. A product that asks for a
card number in an inline form has handed its compliance boundary to every host it runs
in.

## Counter-cases

- **A host-native completion surface.** Some hosts offer their own checkout or payment
  surface. Using it can be right — the user trusts the host and the host carries the
  compliance — but it is a host-specific extra, detected at run time, with the product's
  own handoff as the fallback in every other host.
- **Low-stakes reversibility.** A change the product can undo with one step, visibly,
  may finish in-host; forcing a handoff for it trains users to approve handoffs without
  reading them.
- **Unattended callers.** An outside agent running with no person behind it cannot
  complete a handoff. The pending item waits or expires; the operation must never fall
  back to acting because nobody arrived to confirm.

## When not to use this

- When every journey is a read; there is nothing to hand off, though a link to the
  record is still a courtesy.
- When the product is the host — inside its own front end, consent is already home.
