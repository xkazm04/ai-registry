---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: risks-gate-not-confidence
status: forged
laws: [a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [deciding whether a model-drafted reply may skip a human, setting an autonomy level per channel, choosing a model tier for a reply tool, a stranger's inbound message can reach the model that scores its own draft]
---

# The risks list is the gate, not the confidence number

A reply tool that returns a confidence score and a risks list has produced two signals,
and they are not of equal quality. The design question is which one may let a message
leave without a human, and the answer - measured, not argued - is the list.

## Why the number cannot gate alone

A 0-100 send-readiness score is a self-report. A model that is weak at the reply is
also weak at judging the reply, and the weakness shows as inflation exactly where it is
most dangerous. In a measured comparison on the same prompt and schema, a fast-tier
model returned 78 on an e-mail combining a health complaint, a price-match demand and a
guarantee request; a stronger tier returned 35 with four risks, including "proposed
slots not verified against the calendar". On a second scenario the fast tier returned
an empty risks list while proposing specific unverified appointment times - a message
that, with a high number and no risks, was eligible to auto-send unverified dates.

The list behaves differently. Any entry buys a human read regardless of the number;
the model has to actively *omit* a concern for the list to fail, whereas the number
fails by being slightly optimistic. A gate on the list fails toward the human; a gate on
the number fails toward the send. Even when the number is kept in the conjunction as
the channel's bar, the list is the conjunct that holds when the model is weak, and the
lesson from the measurement is stated plainly: never auto-send on a low risk count alone
from a weak model.

## Autonomy levels and the gate

Three levels per channel, chosen by the operator:

- **Review** - the assistant writes nothing; a human drafts and sends.
- **Assist** - the assistant drafts; a human approves every message. The default.
- **Auto** - the assistant drafts and may self-approve, but only through the gate.

The gate is one pure function in one place: a draft is *approved* only when the channel
is enabled, its autonomy is auto, the draft's confidence clears the channel's bar, and
the risks list is empty. Everything else is *pending* for a human. A disabled channel
whose stored configuration still says auto may receive a pending draft but never an
approved one - switching a channel off is the operator's promise to themselves that
nothing leaves, and a stale setting must not break it
([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

The bar is per channel and operator-configurable inside a floor and ceiling; a default
of 80 is practitioner convention, and a public review deserves a higher bar than a
private chat ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
Published oversight guidance agrees on the shape without the number: authority scales
inversely with irreversibility, thresholds are calibrated against the deployment's own
rejection data rather than copied, and a target share of drafts escalated to a human
is a vendor convention, not a measurement.

## Procedure

1. Return confidence and risks from the same structured call as the reply; sanitise
   both on the way in (clamp the number, bound the list).
2. A canned or model-less fallback scores zero and lists itself as the risk.
3. An inbound message awaiting an answer carries a placeholder risk so it can never be
   auto-approved before a draft exists; the model's list replaces it, never merges.
   A risk the code detected in the inbound is not a placeholder: it merges ahead of the
   model's list, and the model cannot clear it (see the next section).
4. Apply the gate in exactly one function; the interactive path and the unattended
   path call the same one.
5. Render the number against the channel's bar - clear, close, well short - with the
   risk count beside it, so a human sees why a draft is pending.
6. Choose the model tier by the two dimensions that make the gate safe - risk
   completeness and confidence calibration - not by the reply's prose quality, and
   re-measure when the tier changes.

## Decision rules

- When the risks list is non-empty, hold for a human whatever the confidence says,
  because the list is the model's own statement that something needs checking.
- When the channel is disabled, never approve, because a stale auto setting is not an
  operator's intent.
- When the model tier is changed to a cheaper one, re-run the calibration scenarios
  before trusting the gate, because the cheaper tier's failure mode is exactly the one
  the gate relies on not happening.
- When a draft was auto-approved and later rejected by a human, feed the rejection
  reason into the next prompt's avoid block, because the gate cannot learn but the
  prompt can.

## When the inbound is written to move the list

The argument above has a premise it does not state: the model's errors are honest. A
weak model omits a concern by accident, so the list fails toward the human more often
than toward the send. An inbound message is written by whoever is on the other end, and
a hostile one does not need the model to misjudge anything. It asks the model to report
a high number and an empty list, and a model that obeys produces exactly the two values
the gate reads. Under that input the list fails toward the send, and it fails the same
way on every tier, because following text is not a weakness a better tier removes.

So the two scores stay the model's, and the gate gains a third input the model cannot
write: the hostile shapes the code itself recognises in the inbound text - an override
phrase, a forged role or template token, the gate's own field names with passing values,
invisible characters. Each hit becomes a risk entry of its own kind, merged ahead of the
model's list, stored with the draft so the reviewer sees why it is held, and evaluated
inside the same one gate function so the interactive and unattended paths cannot
disagree. The cost of a false hit is one human read on a message that would have been
fine, which is the recoverable error; the cost of a miss without it is a reply sent under
the operator's name on a stranger's instruction.

Measured on a workspace that already quoted inbound text as data and already detected
these patterns, but used the detection only to add a warning to the prompt: with the
model assumed to obey, 12 of 12 adversarial payloads from its own test corpus were
auto-approved by the old gate and 0 of 12 by the gate that reads the detection; its nine
ordinary customer messages were auto-approved 9 of 9 under both, so the floor held at
that sample size. Two limits travel with the rule. Detection is a pattern list, and an
empty result means "nothing recognised", not "safe", so the structural quoting of the
inbound stays mandatory. And a word that ordinary customers use for an ordinary reason,
a forgotten password for instance, will hold some honest messages; measure the hold rate
on the channel's own traffic before tightening the pattern list, not after.

## When not to use this

Do not use the gate as the delivery decision. It judges text; whether the act of
sending may happen now - channel still on, cap, connector, consent - is the delivery
gate's question, and a draft approved last week may be refused today. Do not apply
auto to a channel with no real, configured connector: an auto channel behind a manual
connector is a setting with no wire, and an unattended run must skip it rather than
approve into a void. Do not extend the risks-empty rule into a general trust in the
model's self-assessment; the list is trusted because it fails toward the human, not
because it is accurate - and it only fails toward the human while nothing in the input
was written to make it fail the other way.
