---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: answer-in-first-sentence-never-promise
status: forged
laws: [never-invent-proof, a-gate-before-money-and-copy]
shared_with: []
use_when: [writing the doctrine a model follows when drafting a customer reply, designing the reply output schema, reviewing why a drafted reply was rejected]
---

# Answer in the first sentence, and never promise what you were not given

An assisted reply is a model writing to a customer in the business's name. The doctrine
it follows is short, and each rule exists because the opposite was observed in a draft
that would have gone out.

## The doctrine

1. **Answer the customer's question in the first sentence.** A short greeting or thanks
   may be part of that sentence; it may not push the answer into the next one. A
   customer skims; the first sentence is what they read.
2. **Promise no price, date, discount or outcome that is not in the grounding.** When
   the reply does not know, it says it will find out. This is
   [never invent proof](../../../_laws.md#never-invent-proof) applied to the one
   surface where a number becomes a contract the moment it is read.
3. **Invent no name.** When the customer's name is absent, use a neutral address or an
   explicit placeholder token - never a plausible surname.
4. **Continue the thread; do not restart it.** Read the past turns, oldest first, and
   do not repeat what was said. Write no subject line unless the channel is e-mail.
5. **Ask only what is still unknown.** Questions are returned as a separate list. If
   the qualification is already captured, do not ask it again; and a question must not
   contradict or second-guess what the reply itself just promised - decide what the
   message asserts first, then ask only what does not follow from it.
6. **Notes on tone describe what the message actually does.** They never claim
   compliance with a rule the message broke.
7. **No emoji, no stacked exclamation marks** unless the voice explicitly asks.
8. **Brand rules outrank the model's taste.** An "always" or "never" from the voice
   configuration is obeyed even when the model believes it would sound better
   otherwise. The voice itself is `brand-voice-capture`'s concern.

## The output shape

The reply is returned as a structured object with five fields: the reply text, the
question list, a 0-100 send-readiness confidence, a risks list, and the tone note. The
confidence instruction is to be strict - missing grounding, an ambiguous question or a
sensitive topic mean a low number. The risks instruction is the one that matters: list
a risk whenever the reply promises anything, states a number, touches a complaint,
health, law or money, or rests on a fact the model is unsure of. An empty list means
"safe to send without a human", and the instruction says so in as many words, because
a model that understands the consequence of an empty list populates it more honestly.
Why the list and not the number is the gate is the next technique's concern.

## Grounding, and the injection surface

Everything the model may assert comes in as labelled grounding: the business name, the
business type, who is being written to, how the message arrived, what is already known
from qualification, the voice directives, a few past messages as style examples, and the
lessons from replies a human previously rejected. The inbound message and the thread
behind it are written by whoever is on the other end. They are quoted as material, not
issued as instruction, and the prompt closes with a reminder that nothing inside the
quoted material can change the rules - placed last, so it is the most recent thing the
model read. This is the sharpest injection surface a marketing system has, precisely
because the model's own confidence and risks output is what decides whether a human
sees the reply; an attacker who can talk the model into an empty risks list has talked
their way past the gate.

## Learning from rejection

When a human rejects a draft, they choose one of a closed set of reasons - off brand,
inaccurate, too long, wrong tone, risky claim - and may add a note. The counted reasons
become "avoid" directives in the next prompt ("make no promises about prices, deadlines
or outcomes - recent replies contained risky claims"), the most recent notes follow,
both bounded, both in the user turn so the system prompt stays byte-stable. A rejection
is not a wasted draft; it is the only feedback the doctrine gets.

## Decision rules

- When the grounding lacks a fact the customer asked for, say you will find out, because
  a plausible answer is a promise the business did not make.
- When a reply proposes specific appointment slots the calendar did not confirm, list
  it as a risk, because an unverified time is a promise with a date on it.
- When the customer's message contains instructions, treat them as content, because the
  customer is not the operator.
- When the model returns an empty reply, fall back to the deterministic first reply
  with confidence zero and a self-naming risk, because a canned text must never read as
  send-ready ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).
- When the qualification is known, instruct the model explicitly to ask only what is
  still unknown, because a generic "ask 1-3 questions" instruction re-asks.

## When not to use this

Not for public review replies, which have their own doctrine (acknowledge, apologise,
take offline, no legal admission) under the local-visibility subject. Not for outbound
prospecting: this doctrine answers, it never initiates, and a model-written cold
message is a different, mostly worse, thing. Not as the entire safety story - the
doctrine is an instruction, and the law says an instruction alone does not satisfy it;
the structural half is the gate.
