---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: dead-letter-escalation-and-orphan-receipts
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
shared_with: []
use_when: [a message could not be delivered and nobody has noticed, designing the queue a human works, deciding what happens after the last retry]
---

# Dead-letter escalation and orphan receipts

## The concern

Retry policy is the neighbouring engineering craft's; it decides how many times
and how fast. This technique starts where retries end: **after the last attempt,
a human must find out, and a candidate must not be left believing they were
contacted.**

Two populations need catching, and they are different.

- **Dead letters** — messages that definitively could not be delivered:
  unaddressable recipients, hard bounces, terminal transport refusals. The system
  knows they failed.
- **Orphans** — two shapes, both of which render as nothing on every screen
  ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)):
  messages that entered the pipe and produced no receipt of any kind within the
  window in which one was expected, and receipts that arrived matching no send at
  all. The second belongs in this queue even though it is not a message, because
  it means your identifiers and the transport's have diverged — and while they
  have, real bounces are being discarded as unmatched noise.

A delivery system without an orphan concept will lose messages at a low, steady,
undetectable rate forever.

## Procedure

1. **Write a dead-letter record at the moment of terminal failure**, carrying:
   the intended recipient identity (not just the address), the candidate and
   stage it concerned, the template or purpose, the failure reason as an enum
   plus the raw transport text, the attempt count, and the actor that gave up —
   process or human ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
2. **Define the orphan window as a named constant** derived from the transport's
   observed receipt latency, and run a sweep that promotes past-window
   receiptless attempts into the same queue as dead letters. Both populations
   need the same human.
3. **Escalate on a clock, not on a dashboard visit.** A queue nobody opens is a
   silent drop with extra steps. Route by consequence: an offer or an adverse
   decision that did not arrive escalates within hours; a nurture message can
   wait a day.
4. **Rank the queue by candidate impact, not by age.** An undelivered offer
   outranks a hundred undelivered newsletters. The queue's order is a statement
   about whose time matters.
5. **Give the queue a real resolution path**, and record which was taken:
   corrected address and re-sent; delivered by another channel and recorded as
   such; recipient genuinely unreachable and the candidate's record marked so
   that no surface claims contact; or a deliberate decision not to retry, with a
   reason and an actor.
6. **Propagate the truth backwards.** When a message is dead-lettered, any
   candidate-visible surface that would have implied contact must reflect
   reality, and any recruiter view that showed a green tick must be corrected.
   The correction is an event, not an edit.

## Decision rules

- **When the last retry fails, the candidate's process must not be considered
  advanced.** Do not let a delivery failure of yours close a stage, expire a
  deadline, or count as a non-response
  ([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
  Deadlines that depend on the candidate having been told restart from actual
  delivery.
- **When nothing has been heard within the window, treat it as a dead letter for
  escalation purposes but keep the state distinct in the record.** Orphaned and
  failed are different facts; only the queue treats them alike.
- **When a dead letter concerns an adverse outcome, a human must decide the next
  step.** No automated re-route, no automated closure.
- **When the queue exceeds a threshold, that is an incident, not a backlog.** A
  sudden rise almost always means a configuration change — a broken address, an
  expired credential, a mis-provisioned channel — and every hour it sits is a
  cohort of people not being told things.
- **Keep the failure reason bound to the failure, and only to it.** Persist the
  precise transport detail on the failed record itself — a refusal code, a name
  resolution error, a timeout — never on the candidate or the message thread,
  where a reason left over from an attempt that later succeeded ends up sitting
  next to a green badge and telling a third story.
- **Never delete from the queue to clear it.** Resolution is a recorded action
  with an actor; deletion is the failure mode this whole technique exists to
  prevent.

## When not to use this

- **Low-consequence, high-volume broadcast** where individual delivery genuinely
  does not matter can be monitored in aggregate — but nothing in a hiring process
  that names a specific person's outcome qualifies, however routine it feels.
- **Where the transport already provides an operator-facing suppression and
  failure console**, do not rebuild it; do bind its records back to candidate
  identities, because a queue of addresses cannot tell anyone whose process is
  stuck.
- **This is not a retry mechanism.** If you find yourself adding backoff logic
  here, you are duplicating the neighbouring engineering craft — take theirs and
  keep only the escalation and the claim correction.
