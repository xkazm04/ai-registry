---
layer: application
type: application
subject: hitl-approval
technique: handoff-is-a-declared-door
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.11
---

# A digital-employee platform that declares its handoffs, and where it stops short

The version witness is the backend's own `requires-python = ">=3.11"` in
`backend/pyproject.toml`; the tree ships one commit, so no earlier state was
available to compare against. The tree is an open-source enterprise platform for
conversational agents that run written procedures as state machines, with a
human-handoff step. Every anchor below was resolved against the clone with
`scripts/check-anchors.mjs`.

## What the tree does

**The model requests, the graph grants.** After each step the turn finalizer asks
whether the current step allows a handoff. If not, it first tries to route the run
to a declared handoff node, and if the step still does not allow one it records an
ignored event with the reason:

- `backend/app/core/turn_finalizer.py:46 "current_step_does_not_declare_handoff"`
- `backend/app/core/agent_loop.py:541 "handoff_human" in self._step_actions(step)`

A step declares the door either by being of type `handoff` or by listing the
`handoff_human` action. The router prompt says the same thing to the model in prose
(a user who merely asks for a person, in a flow with no declared node, does not
trigger one), and the finalizer enforces it, so the prompt is not the only holder.

**The answerer is resolved from a chain, and only internal accounts qualify.** The
handoff service walks step assignee, then the channel binding's default, then the
agent's owner, then the tenant administrator, and accepts an entry only if it is an
in-tenant account created through the web console:

- `backend/app/core/human_handoff_service.py:145 "user.source == "web""`
- `backend/app/core/human_handoff_service.py:76 "if self._is_internal_assignee(tenant_id, user_id)"`

A comment beside the chain records the rejected alternative: assignees are no longer
inferred from contacts in the knowledge base, because content changes make the
assignee unstable and give no permission or audit entry. A test pins it
(`backend/tests/test_feishu_handoff.py:435 "Contact" not in CONCEPT_TYPES"`).

**Chat replies are bound to the delivered notice.** A reply is accepted only if its
quoted parent message matches a stored `handoff_notice` or `handoff_ack` delivery row
for the binding and the sender's channel id equals the delivery's `receive_id`:

- `backend/app/channels/service_intake.py:901 "delivery_receive_id != inbound.from_user_id"`

The docstring names the threat: replies from a forwarded notice or a screenshot.

## What it cannot do

- **The web reply path lets a null assignee be answered by anyone in the tenant.**
  `backend/app/api/chat.py:2349 "row.assignee_user_id not in {None, current_user.id}"`
  refuses a different assignee but accepts an unassigned one, so the technique's
  refusal for a null assignee holds on the chat channel and not on the web one.
- **The answer is a read-then-write.** `backend/app/api/chat.py:2354 "row.status != "pending""`
  is checked in one statement and the answered state is set afterwards, so a web
  reply and a chat reply arriving together can both pass. The tree's inbound event
  claim, by contrast, is a conditional update.
- **The declared-only rule is applied to every request alike.** A request for a
  person in a flow with no declared node is ignored on the record. That is the right
  rule for a scarce specialist and would be the wrong one for a legal request to have
  a decision reviewed by a person, and the tree has no second class of request for
  the latter. The technique's boundary is exactly this line.
- **"Human takeover" in the README is this escalation.** There is no mode in which a
  person joins or mutes a live conversation; the word appears in code only for
  recovery of stale events.
- **The confirmation is inferred.** The handoff row records who answered, but the
  submission gate elsewhere in the tree proves only that a preview existed and the
  step was reached, not that a person said yes.

## Verdict

Structural only. Nothing here ran; the record is the anchors, and the unattended
question the tree does not answer is whether its ignored events are ever read.
