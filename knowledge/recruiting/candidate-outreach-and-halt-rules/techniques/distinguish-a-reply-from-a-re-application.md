---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: distinguish-a-reply-from-a-re-application
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [an inbound message could be an answer or a fresh approach, a halt fired on a thread nobody had written to, designing what counts as engagement]
---

# Distinguish a reply from a re-application

## The concern

"They replied" is the trigger for the strongest rule in this subject, so what
counts as a reply must be defined precisely — and the obvious definitions are
wrong in opposite directions.

An inbound message is a **reply** only if you spoke first. Somebody arriving on
their own initiative — a fresh application, a second application to another role,
a duplicate submission, an unsolicited introduction — has not answered anything.
Treating that as a reply sets a halt on a sequence that never ran, and the
observable symptom is a candidate who is never contacted because the system
believes it already got an answer.

The mirror error is treating a genuine answer as a new arrival because it looks
like one — it came from a different address, it repeats their background, it
arrives with a fresh document attached. That produces the worse failure: the
sequence keeps going after a real reply.

The discriminator is the **record of prior sends on that thread**. It is a fact
about your own behaviour, it is cheap, and it does not depend on interpreting
anything the person wrote.

## Procedure

1. **Keep a per-thread count of outbound sends** on the outreach state, written
   after the transport accepted each message. The counter is the discriminator:
   zero prior sends means this cannot be a reply.
2. **Define the thread scope explicitly** and identically on both sides of the
   test — the same person-and-role pairing the halt state uses. A count kept at a
   different grain than the halt it feeds produces halts on the wrong sequence.
3. **On any inbound message, branch on the counter, not on the content.** With
   prior sends: it is a reply, halt. With none: it is an arrival, route it as an
   application or an introduction, and set no halt.
4. **Do not use a duplicate-application flag as the discriminator.** Whether a
   submission is a duplicate is a question about the person's history; whether an
   inbound message is a reply is a question about yours. They correlate often
   enough to look interchangeable and they diverge exactly where it hurts — a
   first-time applicant who was also being sourced, a repeat applicant you never
   wrote to. [Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label):
   the flag's name suggests it answers this question and it does not.
5. **Record the classification with the inbound message**, so a later reader can
   see why a halt did or did not fire, and so a wrong classification can be
   corrected as an event rather than by editing state.
6. **Handle the write-back path.** Only sends that actually left increment the
   counter. A refused or failed send must not, or a person who was never
   contacted becomes eligible to "reply".

## Decision rules

- **When the send count is zero, an inbound message never halts anything.** It
  may create a candidature, notify a recruiter, or start a conversation; it does
  not set a reply timestamp.
- **When the send count is unknown rather than zero, treat it as unknown and
  escalate to a human.** An unreadable counter is not evidence of no contact
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence));
  defaulting it to zero is how a real reply gets ignored.
- **When an arrival and a live sequence coexist**, the arrival is still not a
  reply, but a person who has just applied to you unprompted should not keep
  receiving cold sourcing messages about the same role. Route it to a human and
  stop the cold sequence on that basis — recorded as a manual halt with its own
  reason, not as a reply.
- **When an inbound message arrives from an address you never wrote to but
  resolves to a person you did write to, count the sends at the person-and-role
  scope, not the address.** Thread identity is an implementation detail of the
  transport; the discriminator is about the human.
- **When in doubt between reply and arrival, prefer reply.** The cost is a
  suppressed automated message and a human looking at it; the opposite error is a
  message sent to someone who already answered.

## When not to use this

- **Where no outbound automation exists at all**, the distinction is decorative —
  every inbound message goes to a human anyway.
- **Do not use this to classify intent.** It answers one question, "did we speak
  first", and it is deliberately blind to whether the person said yes, no, or
  something else entirely. Intent classification is a separate, weaker, and
  non-load-bearing signal.
- **Do not repurpose the send counter as a contact history for reporting.** It
  counts sends on one thread at one scope; the question "how many times has this
  organisation contacted this person" is a different, wider aggregate and
  answering it from this counter will understate.
