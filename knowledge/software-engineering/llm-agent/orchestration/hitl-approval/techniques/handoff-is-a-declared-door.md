---
layer: technique
type: technique
subject: hitl-approval
technique: handoff-is-a-declared-door
status: forged
laws: [gate-sees-target, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a model can ask for a human and something has to decide whether the ask is honoured, deciding who is allowed to answer an escalation the machine raised, an approver's answer arrives over a chat channel or a forwarded notice, a machine-facing token can post a decision, choosing between a declared escalation point and a universal one]
---

# A handoff is a declared door, and the answerer is resolved before the ask

The review and consent flows assume a human is already in the loop and ask how to
pause for them. This technique is the step before that: **how a human gets pulled in
at all, and who is allowed to answer once they are.** Both halves fail the same way,
by letting the untrusted side of the exchange decide. A model that can summon a human
whenever its output says so makes human involvement unpredictable, and an escalation
whose answer is accepted from whoever sends one turns the gate into a form anyone can
fill in.

## Part one: the model requests, the graph grants

A conversational agent working through a declared workflow may emit "I need a human
here". Treat that as a **request, not an event**. The handoff is created only if the
step the run is standing on declares a handoff: a node of that type, or an action on
the node that names it. Three outcomes, and each is a recorded fact:

- **The step declares one.** The handoff is created, the run suspends with the question
  and its resume snapshot stored on the handoff row.
- **The step does not, but the workflow declares a handoff node elsewhere.** The run is
  routed to that node first, and the request is re-tested there.
- **Neither.** The request is *ignored with a reason* that names the step and the
  request, as a distinct event, never silently dropped and never honoured. A user who
  merely asks for a person in a flow with no declared door does not trigger one.

The set of places a human can be pulled in is then exactly the set of declared nodes,
which is a property a reviewer can enumerate from the workflow definition alone.
That is the same substrate rule the subject states for approvals
([gate-sees-target](../../../../_laws.md#gate-sees-target)), applied to the opposite
direction: the model cannot open a gate, and it cannot open a door either.

## Part two: resolve the answerer before you ask

Who may answer is decided when the handoff is created, not when a reply arrives.

1. **A fixed chain of authenticated internal identities.** Step-level assignee, then
   the channel's default, then the agent's owner, then the tenant administrator. The
   first entry that resolves to a real, in-tenant, first-party account wins.
2. **Never derive the answerer from content.** A contact found in a knowledge base, a
   name in a document or a role in a prompt changes whenever the content changes, and
   carries no permission and no audit entry. Removing the inference is the fix, not
   tightening it.
3. **The person served is never a candidate answerer.** A guest or customer identity
   that reached the agent through a channel cannot fall through the chain to become the
   approver of their own escalation. An assignee that is null is a refusal, not
   "anyone".
4. **More than one pending request means refuse, not guess.** An answer that could
   attach to either of two open questions attaches to neither and asks which.

## Part three: reply authority is bound to the delivered notification

When the answer travels back over a chat channel, the check is not "does this look like
an answer" but **"is the sender the exact identity the notice was delivered to, replying
to that delivered notice"**. Match the reply's parent message to a stored delivery row
of the handoff kind, and compare the sender's stable channel identity with the delivery
target. A forwarded notice or a screenshot carries the text and none of the standing,
so a reply on someone else's copy is consumed and answered with a hint instead of
entering the agent's conversation. Replying to an already-answered notice is likewise
absorbed, so an approver's stray tap never starts a fresh conversation with the agent.

This is [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) at the
reply door: the notice's identity is what ties the verdict to the question, and the
recipient's identity is what ties the answer to a person.

## Decision rules

- **When the human is a resource the workflow owns** (capacity, cost, a specialist),
  declare the door. Undeclared requests are ignored on the record.
- **When the human is a right of the person being served** (a statutory request for a
  person to review a consequential decision, a safety or distress signal), the door is
  **universal**: recognised from any channel and any workflow position, because the
  person cannot know which node they are standing on and must not have to. Declaration
  is a design tool for scarce attention; it is the wrong tool for an entitlement. Most
  systems that get this wrong copied the first rule onto the second class of request.
- **The answer is a conditional write.** Test that the request is still pending inside
  the same statement that marks it answered. A check-then-set answered from two
  channels at once lets both succeed.
- **Record who answered and on what.** The handoff row carries requester, assignee,
  trigger step, the resume payload and the identity that answered.
- **The same discipline covers machine channels.** A token that authorizes a system to
  report telemetry does not thereby authorize it to post a decision. If a decision can
  arrive over a machine-facing channel, the decider's identity is a field of the
  payload, and its absence is a recorded fact rather than an implied one.

## Failure modes

- **A universal door built as a declared one**, so a request made at the wrong node
  vanishes with a log line nobody reads.
- **A declared door with a null assignee** that any authenticated user can answer.
- **Confirmation attested by flow position alone.** The record shows a preview
  existed and the step was reached, not that a person said yes.
- **A reply handled by a read-then-write** that two channels win at once.

## When not to use it

A single-operator deployment has one possible answerer, so the chain collapses to a
constant. Keep the declared door and the reply-binding, and record the placeholder
identity honestly rather than claiming a named approver the install cannot have.
