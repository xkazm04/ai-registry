---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: contest-door-at-the-point-of-decision
status: forged
laws: [every-decision-names-its-actor, no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a rejection notice tells the candidate they may ask for a human to look again, a candidate's reply to a decision message has nowhere structured to land, deciding how a request for human review reaches the reversal queue, designing what a contest request is stored as, choosing between a declared escalation point and a universal one for a candidate-facing request]
---

# The contest door sits at the point of decision

A rejected candidate is told, somewhere, that they may ask for a person to look again.
That sentence is a promise, and the reversal queue is only half of keeping it: the queue
is filled by the system, by construction, from automated outcomes. **What fills it from
the other side, the candidate's own request, is a separate mechanism**, and a system can
have a well-built queue and no way for a candidate to get into it.

The failure is common enough to have a shape. The notice says "reply to any message
from the hiring team", the reply goes to whatever mailbox the outbound relay is
configured with, and from there the request depends on whoever reads that mailbox.
There is no link, no record, no clock and no named person. It is prose, and prose is
not a safeguard.

## What the regulator's guidance asks for

The automated-decision guidance (WP251 rev.01) says the safeguards "should include as a
minimum a way for the data subject to obtain human intervention, express their point of
view, and contest the decision", that "any review must be carried out by someone who has
the appropriate authority and capability to change the decision", and that the reviewer
must consider "any additional information provided by the data subject". Its good-practice
list names the mechanism: "a link to an appeals process at the point the automated decision
is delivered to the data subject, with agreed timescales for the review and a named
contact point for any queries". Each phrase is a design requirement below.

## The door

1. **Deliver it with the decision.** The link, or the equivalent control on the
   candidate's status page, is part of the same message or page that carries the
   outcome, addressed by the capability the candidate already holds. A candidate who has
   to find where to complain has been given the sentence, not the door.
2. **Accept it from anywhere, and never lose it.** The request may arrive through the
   control, through a reply to any outbound message, or through a channel the deployment
   wires. A free-text message that cannot be classified is still stored as an
   *unclassified message from a candidate with an open adverse decision*, and surfaced;
   it is never dropped and never absorbed by an unrelated flow. In particular a message
   that reads as a new lead or as a reply to sourcing outreach must not be the only place
   it is recorded ([unknown is not no](../../../../_laws.md#absence-of-evidence-is-not-evidence)).
3. **Store it as a record keyed to the sealed decision.** Received-at, channel, the
   decision it concerns, the candidate's stated view and any material they added, and
   the acknowledgement sent. The clock for the review starts at receipt, not at triage.
4. **Route by the sealed actor.** If the decision was automated, the request enters the
   [reversal queue](./reversal-queue-that-reads-the-sealed-reason.md) with its added
   material attached. If a named person made it, the request does not join a queue that
   by design excludes human decisions: it becomes a review request assigned to someone
   other than the person who decided, who has the authority to change the outcome. A
   decision whose actor cannot be determined is treated as automated.
5. **Name the contact and the timescale.** Both belong in the acknowledgement, and both
   are configuration the operator sets rather than text a developer wrote once.
6. **Record the outcome with the reviewer's identity, upheld or reinstated.** "Reviewed
   and upheld by a named person" is the record that shows the oversight was real.

## The door is universal, not declared

Systems that let an agent hand a conversation to a person often do so only at nodes the
workflow declares, and ignore a request made anywhere else. That is a sound rule when the
person is a scarce resource the workflow owns. A statutory request is not that: it is an
entitlement of the person, who cannot know which step the system considers itself to be
in and must not need to. **A contest request is recognised from any channel and any
stage, and is never ignored for being out of position.** Copying the declared-node rule
onto it produces a door that works in the demo and vanishes for anyone who says it in
the wrong place.

## Decision rules

- **When the deployment has no inbound mail path**, say so honestly on the notice and
  route the candidate to the control instead of promising a reply address that leads
  nowhere. A promise the mechanism cannot keep is a defect in the notice.
- **When a request arrives after the retention window has begun closing the record**,
  the request itself extends what must be kept for that decision until it is resolved.
- **When the reviewer sees only the score**, the door has a queue and no review. Show
  the sealed reason and the candidate's added material together.
- **When the queue grows faster than it is worked**, the same rule as for the reversal
  queue applies: pause the automated waves.

## Metrics the door makes possible

Requests per wave and per reason code; time to acknowledgement; time to decision against
the stated timescale; the share upheld. One more measures the door itself: the count of
requests that were **found late**, that is, first recorded from an unstructured channel
and later matched to a decision. A non-zero count there is the door leaking.

## When not to use it

A deployment that never makes an automated adverse decision has no statutory request to
carry, but it still owes candidates a way to ask a person. Keep the record and the
named contact; drop the queue routing.
