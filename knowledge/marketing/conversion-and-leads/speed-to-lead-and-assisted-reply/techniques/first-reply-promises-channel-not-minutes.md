---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: first-reply-promises-channel-not-minutes
status: forged
laws: [never-invent-proof, a-gate-before-money-and-copy]
shared_with: []
use_when: [writing the deterministic first response to an enquiry, choosing what an auto-acknowledgement may promise, building the no-model floor under an assisted reply]
---

# The first reply promises the channel, not the minutes

The first reply is the message that goes out before anyone has thought. It must be
instant, it must work with no model and no key, and it must not say anything the next
hour can make a lie. Its whole craft is in what it promises.

## What it promises

**The lead's own channel.** A form enquiry gets "we will get back to you on the contact
you gave us"; an e-mail gets "we will reply to your e-mail"; a chat gets "we will
answer here"; a call gets "we will call you back". The promise follows the arrival
channel, because a phone call promised to an e-mail that carried no number is a promise
nobody can keep, and a first message that cannot be kept is the worst first
impression a business can buy.

**As soon as we can - never a number of minutes.** The internal target is a promise to
yourself; the moment it appears in a customer's inbox it is a promise to them, and the
queue that will or will not keep it is not the sentence's to command. "As soon as
possible" is honest under every load. "Within fifteen minutes" is honest until the
first busy afternoon.

**Nothing else.** No price, no date, no availability, no discount. The first reply
has no grounding beyond the enquiry itself, so anything it asserts about the offer is
invented ([never invent proof](../../../_laws.md#never-invent-proof)).

## What it asks

The three qualification questions the rep would ask - expected timeline, approximate
budget, scope or size of the job - returned as a separate list, not woven into the
body. Separate because the assisted reply and the rep both consume them as questions,
and because a customer reads three short questions and answers them, while a paragraph
that contains three questions gets one answer.

## Shape

Greeting by first name when a name was given, a thank-you, one sentence that says the
enquiry will move forward and how the business will follow up, the questions, a
sign-off. The sign-off is the business's own name when one is configured and a neutral
"our team" when it is not - never a placeholder token, never an invented name. Keep it
gender-neutral in languages that inflect the speaker, because the sender is the
business, not a person of known gender.

## Procedure

1. Implement the reply as a pure function of the lead (name, channel, message) and an
   optional brand name. No clock, no model, no network.
2. Table the contact-back sentence by arrival channel; the table is the only place the
   promise lives.
3. Return the reply body and the question list as two fields.
4. Use this function as the keyless demo *and* as the floor for any field an assisted
   reply leaves empty - a model's blank reply falls back to this text, scored as
   not-send-ready.
5. Keep the deterministic reply's tone plain; the voice a business wants is applied by
   the assisted layer and belongs to `brand-voice-capture`.

## Decision rules

- When the arrival channel carries no callback detail, promise that channel, because
  the alternative promises a call to a number you do not have.
- When the business has a target in minutes, keep it out of the reply, because a
  target stated to a customer is a commitment the queue may not keep, and a missed
  commitment is worse than no commitment.
- When no brand name is configured, sign as the team, because a placeholder in a sent
  message is the enquiry's first proof that nobody is home.
- When this reply is used as a fallback under an assisted draft, mark it as
  not-send-ready with a risk naming itself, because a canned draft must never clear an
  autonomy gate ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

## When not to use this

Not for the *second* message. Once a rep or an assisted draft has answered the
substance, a canned acknowledgement is noise. Not as a substitute for a real answer on
a channel where the customer expects one - a chat visitor who asked a question and got
"we will answer here as soon as we can" from a bot has been told to wait by a machine;
on live chat, either answer or say plainly that a person will pick up. Not on channels
whose messages are marketing by default; an acknowledgement on a messaging app is a
delivery decision that belongs to the delivery gate, not a reflex.
