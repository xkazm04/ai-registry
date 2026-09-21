---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: delivery-fails-closed-cap-consent
status: forged
laws: [a-gate-before-money-and-copy, not-measured-is-not-zero]
shared_with: []
use_when: [deciding whether an approved reply may be sent right now, adding a weekly send cap or a consent requirement to a channel, running an unattended send loop]
---

# Delivery fails closed on cap, consent and connector

Approval is a judgement about the text. Delivery is a judgement about the act. They are
separate gates by construction, because the world changes between them: a draft a human
approved last week must still be refused today if the channel was switched off, the
weekly cap filled, the connector was never configured, or the recipient withdrew
consent in between. This technique is the second gate, and every branch of it refuses.

## The four refusals

- **Disabled** - the channel is off, or the draft was judged against another channel's
  configuration. The second case is a caller bug, and the safe reading of a caller bug
  on a send path is "do not send".
- **Connector unconfigured** - nothing real is wired to this channel, or the connector
  needs an address and the draft has none.
- **Cap exceeded** - the channel's weekly send cap is full.
- **Consent required** - the channel demands a recorded consent and none is in force.

The order matters only for the message the operator reads: the nearer limit first, so
"cap full" is reported before "consent missing" when both apply. Every branch refuses.

## The cap is counted inside the claim

A weekly cap on what *leaves* a channel is a human promise about a human week: weeks
start Monday in local time, the same week definition the publishing cadence uses,
because two week definitions in one product is a bug waiting. The count is of sent
drafts on the same channel inside the week - not drafted, not approved, sent.

The load-bearing detail is *where* it is counted. A cap checked before the send is
claimed lets two concurrent sends both pass a cap of one. The count is taken from the
same state the claim mutates, inside the same transaction: the second sender sees the
first send already recorded and refuses. The cap limits sends; it is not a drafting
cadence, and the assistant still only answers and never initiates.

## Consent fails closed

Consent is recorded per purpose - service, marketing by e-mail, marketing by short
message, profiling - never as one boolean, with the lawful basis, the timestamp, the
exact wording shown, and a withdrawal timestamp, append-only. The delivery gate reads
one question: is a consent for this channel's purpose in force for this contact? The
answer is true, false, or *could not establish* - no linked contact, no record, an
unreadable store. The third answer is refused exactly like the second, because an
absent record has never been a permission
([not measured is not zero](../../../_laws.md#not-measured-is-not-zero) applied to
the one place where reading absence as zero is a legal breach).

Which channels require consent by default follows the regional rules for electronic
direct marketing. Under the EU regime, unsolicited electronic marketing to a person
needs prior opt-in, with a narrow existing-customer exception - similar products,
address obtained in the course of a sale, an easy objection offered at collection and
in every message - and the Czech transposition records which of the two routes applies.
A reply to an enquiry on the channel it arrived on is service communication and is not
consent-gated by default; short messages and messaging-app messages to a person are
direct marketing by default and are gated. The operator can switch the requirement on
for any channel and off only deliberately; a stored configuration that predates the
field reads as the channel's default, never as "off". And content changes the
category: a service reply that pitches something the person did not ask about has
become marketing, and the recent case law that free sign-ups are not automatically
exempt cuts the same way.

## Unattended delivery

An unattended loop delivers only approved drafts, only on channels the operator set to
auto with a real configured connector, never on a demo tenant, and never through the
interactive route. It drafts and sends a bounded number per tenant per run, and a gate
refusal is counted and left alone - retrying inside the same run only spends budget
relearning the same no. It never touches an assist or review channel: those are the
operator's promise to themselves that a human is in the loop, and a scheduler is not a
human ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

## Procedure

1. Implement the gate as a pure function of channel configuration, the draft's channel,
   and a context of sends-this-week, consent state (true, false, unknown) and
   connector state. Both the interactive send and the unattended loop call it.
2. Resolve consent before the claim, only when the channel requires it; pass unknown
   through as unknown.
3. Inside the claim, count sends from the state being mutated, call the gate, and mint
   the sent timestamp only on allow.
4. On a connector failure after the claim, revert the claim with a retry, so a message
   that never left is not recorded as sent.
5. Record every refusal with its reason and, for a cap, the count and the limit.

## Decision rules

- When consent cannot be established, refuse, because unknown is not permission.
- When the cap is reached, refuse at or above the limit and allow the send before it,
  counted inside the claim, because a cap counted outside it is a cap of two.
- When a draft is handed to the wrong channel's configuration, refuse as disabled,
  because a judgement made against the wrong rules is not a judgement.
- When a channel's configuration predates the consent field, apply the channel's
  default, because a missing field must not silently disable a legal gate.
- When a cap value is junk - zero, negative, a string - drop it rather than clamp it,
  because a cap of one invented from a typo is a different promise than the operator
  made, and the absence of a cap is the honest reading of an unparseable one.

## When not to use this

Do not put text judgements here: whether the reply is on-brand or over-promises is the
approval gate's question. Do not gate service replies on consent by reflex - a customer
who wrote in and gets no answer because their own message had no consent record
attached is a harm of the opposite kind; the default is per channel for this reason.
Do not treat the cap as a quality lever; a low cap makes a channel quieter, not safer,
and the safety lever is the risks list upstream.
