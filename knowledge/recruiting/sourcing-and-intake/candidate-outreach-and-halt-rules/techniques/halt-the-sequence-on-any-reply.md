---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: halt-the-sequence-on-any-reply
status: forged
laws: [uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
shared_with: []
use_when: [a candidate answered and the follow-ups kept going, designing the state that stops a sequence, deciding whether a negative reply still halts]
---

# Halt the sequence on any reply

## The concern

A person answered. The automation must stop talking.

This is the load-bearing rule of the whole subject and it is stated absolutely on
purpose. Continuing to sequence someone who replied is not an aggressive setting
or an acceptable trade-off — **it is a bug, not a feature**. The recipient did
exactly what the sequence asked; responding by sending the next scheduled message
tells them, correctly, that nothing was listening.

The failure is nearly always structural rather than intentional. The halt was
evaluated when the message was scheduled rather than when it was sent; or it
lived in a recruiter's workflow rather than in the dispatch path; or it was
conditional on the reply being classified as positive.

## Procedure

1. **Record the reply as a timestamp on the outreach state**, not a flag. *When*
   they answered is what a cooling-off window, a re-approach policy and an audit
   all need; a boolean answers none of them and cannot be un-set safely. Make the
   write **idempotent on the first reply**: a person who sends three follow-ups
   keeps the earliest timestamp, because that is the one that answers "how fast
   did they respond" and the one an audit of "how long did you keep writing"
   measures from.
2. **Evaluate the halt at dispatch, not at enqueue.** A scheduled message is a
   proposal. Every gate re-runs at the moment of sending, against state as it is
   then. This single change fixes the majority of real-world sequence-after-reply
   incidents.
3. **Halt on the fact of an inbound message, not its content.** Sentiment,
   language and intent classification may route the reply to a human faster and
   may set priority. They may never license another automated send.
4. **Require that the inbound message actually be a reply.** An inbound message
   on a thread where you never sent anything is not a reply — see
   distinguish-a-reply-from-a-re-application. The halt and the discriminator are
   two halves of one mechanism and neither is safe alone.
5. **Provide a manual halt alongside the reply halt**, with its own timestamp and
   its own actor, so a recruiter who learns offline that a person is not
   interested can stop the sequence without fabricating a reply
   ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
   Two separate timestamps, never one shared field: "they answered" and "we
   stopped" are different facts with different consequences.
6. **Decide which reason is reported when both hold.** A person may reply *and* a
   recruiter may have halted the sequence by hand; both timestamps then exist and
   the surfaces need one answer. Report the **manual halt**: a deliberate human
   decision to stop is the more informative fact, it stays true after a reply
   arrives, and it is the one somebody must reverse before the sequence can
   resume. The precedence of the reported *reason* is a separate decision from
   the order of the *gates*, and both must be written down.
7. **Make resumption explicit and human.** Nothing automatic un-halts. A resumed
   sequence is a new decision by a named person, recorded as one.
8. **Surface the halt where the sequence is visible.** A halted sequence that
   still displays as running invites someone to fix the "stall" by restarting it.

## Decision rules

- **When any inbound message arrives on a thread with a prior send, halt.**
  Negative, positive, one word, an angry paragraph, a forwarded auto-reply — all
  halt. The uncertainty about whether you still have permission to speak resolves
  toward the person
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the reply is an out-of-office, halt anyway** and let a human decide the
  re-approach date. Auto-detecting absence replies to keep the machine running is
  a small optimisation that reliably produces the worst-looking incidents,
  because the person returns to a stack of messages sent while they were away.
- **When the inbound message is from a different address but the same human,
  halt.** Match on person identity, not on the address the mail arrived from.
- **When the halt state is missing or unreadable, do not send.** Fail closed. A
  send you skipped is a message a recruiter can send by hand; a send you made
  into an unknown state is not recoverable. There is a tempting argument the
  other way — that the irreversible risk is already covered because the consent
  gate ran first and failed closed, so an unreadable halt should fail *open*
  rather than silently stopping legitimate outreach. Resist it. The two gates
  protect different harms: consent answers "may we ever write", the halt answers
  "have they already told us to stop", and a storage fault is precisely the
  moment a whole batch of people who replied get written to again. If the fear is
  a transient fault stalling a campaign, make the failure loud and retryable, not
  permissive.
- **When a person replies during a bulk campaign already in flight, the
  in-flight batch must still check.** Batches are the most common place a halt is
  read once and applied to hundreds of dispatches minutes or hours later.
- **When a sequence halts, do not silently delete the remaining steps.** Mark
  them cancelled with the halting reason, so the record shows what would have
  been sent and why it was not.

## When not to use this

- **Process messages the candidate's own action requires** — interview
  confirmations, scheduling, outcomes — are not a sequence and are not halted by
  a reply. Halting them would leave a person who answered you with less
  information than one who ignored you.
- **A live human conversation is not a sequence.** Once a recruiter is writing by
  hand, this technique is finished; it governs automation, not people.
- **Do not use the halt as a substitute for a touch ceiling.** A sequence that
  never gets a reply must still end, and this technique has nothing to say about
  that.
