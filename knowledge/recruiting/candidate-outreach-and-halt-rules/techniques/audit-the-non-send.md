---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: audit-the-non-send
status: forged
laws: [every-decision-names-its-actor, absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [a gate refused to send and the record shows nothing, proving a suppression worked, explaining why a candidate was never contacted]
---

# Audit the non-send

## The concern

Every gate in this subject ends in the same place: the message does not go. The
naive implementation returns early and writes nothing, and the record then shows
an absence — which is indistinguishable from "nobody ever tried", from "it was
sent and lost", and from "the gate was never wired up at all".

Three specific costs follow, and each is expensive on its own.

- **You cannot answer why.** A month later somebody asks why this candidate was
  never approached. Silence is the only answer the system can give, and silence
  is read as neglect.
- **You cannot prove the suppression.** A compliance question about whether an
  opted-out person was contacted is answered by *the absence of a send*, which
  proves nothing. A recorded refusal proves the gate ran, saw them, and stopped.
- **You cannot detect a gate that is over-firing.** A misconfigured consent check
  that suppresses an entire import looks exactly like a quiet week. Refusals are
  the only signal that distinguishes a working filter from a broken pipeline.

[Absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
is the whole technique. A non-send needs a state, and the state is an event.

## Procedure

1. **Write a refusal record at every gate exit that declines to send**, carrying:
   the intended recipient at both grains (the person and the candidature), the
   role or sequence concerned, the message purpose or template, the gate that
   refused as a closed enum, a human-readable reason, the actor — the automated
   process or a named human
   ([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)) —
   and the time.
2. **Record only the gate that actually refused.** The chain short-circuits at
   the first refusal, so the record names one gate, and the gate order is
   therefore part of what the audit means. This is why consent runs first: a
   message that was unlawful must be recorded as unlawful, not as whichever
   reversible halt happened to fire before it.
3. **Keep the refusal object distinct from the send marker.** Two different
   objects. The refusal says *we declined to contact this person, for this
   reason, on this date*. The send marker says *this person has been contacted at
   this stage*, and it is what later sequencing reads to decide whether they are
   exhausted. Writing the marker on a refusal permanently skips a candidate who
   re-consents next month.
4. **Never write the send marker at the attempt.** It is written after an
   external acceptance. Counting an attempt as a contact makes a failed send
   consume a person's touch budget and makes a recruiter read "already contacted"
   for a message nobody received. What counts as acceptance belongs to the
   communication-integrity subject; take its definition, do not invent a looser
   one here.
5. **Give every refusal one closed vocabulary and one return type.** The
   compliance refusals and the operational halts belong in a single union that
   the dispatch function returns, so a caller cannot handle "consent expired" and
   silently drop "the sequence was halted". Two parallel refusal channels
   guarantee that one of them ends up unhandled at some call site, and it will be
   the one nobody thought to render.
6. **Surface refusals as a first-class view**, not a log line: filterable by gate,
   by role, by day. The view is what makes rule 3's distinction visible to a
   human.
7. **Alert on the shape of the refusal stream, not its size.** A new gate
   dominating, a gate falling to zero, or one import producing all of a day's
   refusals are each an incident. Absolute volume is meaningless without those.
8. **Report the pair, never the single number.** "Messages sent" alone is a
   flattering half-truth
   ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds));
   the honest headline is what went and what was stopped.

## Decision rules

- **When a gate refuses, the refusal is written before the function returns** —
  in the same transaction where one exists. A refusal recorded on a best-effort
  path is the one that goes missing precisely during the incident it would have
  explained.
- **When the same gate refuses the same recipient repeatedly, keep every
  occurrence.** Deduplicating refusals hides the sequence that kept trying, which
  is often the actual finding.
- **When a refusal concerns an adverse or time-critical message** — an outcome, a
  scheduling deadline — it is not merely audited, it is escalated to a human, and
  the candidate's clock does not run while they are uninformed.
- **When a recruiter overrides a gate, the override is a record with an actor and
  a reason, linked to the refusal it overrode.** An override that replaces the
  refusal instead of pointing at it erases the finding.
- **Never delete refusals to tidy a dashboard.** The refusal is the record with
  evidentiary value; the successful send is the routine one.

## When not to use this

- **Do not audit a message that was never proposed.** A candidate who was
  filtered out before any sequence considered them produces no refusal, and
  manufacturing one for every non-selected person would flood the record with
  noise and hide the real refusals. The technique starts at the point a specific
  message to a specific person was proposed.
- **Do not use the refusal stream as delivery telemetry.** Bounces, dead letters
  and orphaned receipts are the communication-integrity subject's queue; a
  refusal is a decision not to send, which is a different fact from a send that
  failed, and merging them makes both unreadable.
- **Do not let the audit become the remediation.** Recording that ten thousand
  messages were suppressed is not the same as fixing the import that lost its
  consent field.
