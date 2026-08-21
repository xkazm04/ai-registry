---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: idempotent-event-lifecycle-with-orphan-surfacing
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor]
use_when: [writing interview events back to an external calendar, handling reschedules and cancellations, an interviewer reports a duplicate or missing calendar entry]
---

# Idempotent event lifecycle with orphan surfacing

## The concern

One interview must equal one calendar event for the whole life of that interview
— through creation, one or more moves, and cancellation. The naive integration
writes per *action* instead of per *interview*, and every failure mode follows
from that single choice:

- A create that times out is retried and produces two events. A human reading the
  calendar sees two interviews.
- A reschedule creates a new event without removing the old, so the interviewer
  attends the wrong one.
- A cancellation deletes an event that a retry already recreated.
- A grant is revoked, or an interviewer deletes the entry by hand, and the local
  record keeps asserting that a calendar event exists — the icon is drawn, the
  recruiter relaxes, and nobody is expected anywhere.

The last of these is the state most systems have no name for, and it is the one
that produces the empty room.

## The procedure

1. **Key every write by the interview, not by the action.** The scheduling record
   holds the remote event's identifier once created, and every subsequent write
   is an update to *that* identifier. A retry after a timeout finds the
   identifier and updates; if it does not find one, it may need a
   deterministic request key so the remote system can dedupe an in-flight create.

2. **Model the write-back state explicitly, on its own axis.** This is the
   *write* axis and it is not the free/busy *read* axis; the only value the two
   should share is *not connected*, which really is the same fact. A lookup can
   succeed while a write fails and vice versa, so one enum cannot carry both.
   A workable write vocabulary: *not connected* (no integration — link-only
   behaviour, exactly as before the integration existed), *written* (the event
   exists and its handle and link are stored), *failed* (a calendar is connected
   and the write did not land; the booking still stands), *removed* (the
   interview closed and its event was deleted — nothing left behind), and
   *orphaned*. Five states, and the fifth earns the technique its name.

3. **Name both directions of orphaning.** One is the entry that should exist and
   does not: you hold an identifier the remote system no longer honours. The
   other is worse — the interview *closed* and the deletion did not land, so a
   stale entry is still live on somebody's calendar telling them to attend. The
   first costs visibility; the second puts a person in an empty room. In both
   cases **keep the stored identifier** rather than clearing it: it is the only
   handle a retry has, and clearing it converts a recoverable state into a
   permanent one.

4. **Move, do not recreate.** A rescheduled interview updates the existing event's
   time. It does not cancel-and-create, because the two halves of that pair fail
   independently and leave either a duplicate or a hole. The same applies to a
   changed joining link or location: patch the existing event, never create a
   second one carrying the correction.

5. **Cancel the event, keep the record.** Cancelling an interview removes or marks
   the remote event and leaves the local scheduling record intact with its
   history. The interview's story is yours; the calendar entry is a projection.
   When the interview is one a candidate may re-book — a withdrawal, an
   RSVP saying they cannot make it — clear the stored handle on a *successful*
   delete, so that a later re-booking creates a clean new event rather than
   patching a deleted one.

6. **Do not compose the event body at the write site.** The title, description,
   joining details and location already exist wherever you generate the
   downloadable invitation and the add-to-calendar link. Write *that* object.
   Composed twice, the real entry and the fallback will eventually disagree about
   the time or the round, and the candidate will be holding whichever one is
   wrong.

7. **Do not let the calendar provider send its own invitation.** Most will email
   every attendee for you by default, producing a second, unbranded message for
   one interview, outside your delivery record entirely. Suppress it explicitly;
   the invitation is yours because you are accountable for what it says.

8. **Repair a live interview, surface a closed one.** When an update reports the
   event is gone: if the interview is still going to happen, re-creating it is
   the correct repair and converges on the one-event invariant. If the interview
   has closed, there is nothing to repair — record *orphaned* and show it to a
   human, since only they can check whether a stale entry is still sitting on
   somebody's calendar. Either way the miss is recorded; what varies is whether
   the fix is automatic.

9. **Never cancel an interview because its event vanished.** The source of truth
   for whether an interview is happening is the scheduling record, always. The
   external calendar is downstream of it and has no authority to end anything.

10. **Retry with bounds.** Failed writes retry a small number of times with
   backoff and then stop in a recorded terminal state. An unbounded retry loop
   against a revoked grant is an outage generator, and a failure that retries
   forever is a failure nobody ever sees.

## Decision rules

- **When you cannot confirm the event exists, do not render the affirmative
  state.** No "added to calendar" tick on a record whose write-back state is
  anything but *written*
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **When the write fails, the interview still succeeds.** The booking is
  committed locally first; the calendar write is an asynchronous projection whose
  failure degrades visibility, never the schedule itself.
- **When a human edited the event on the remote side** — moved it, renamed it —
  treat the local record as authoritative for the schedule but surface the
  divergence rather than silently overwriting. A person made a decision, and
  overwriting it without telling anyone erases an actor
  ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
- **When an interviewer's grant is revoked, mark existing events orphaned rather
  than deleting the local links.** Revocation removes your access, not the
  history of what you did.
- **When rendering the five states, weight them by actionability.** Only the two
  a human can do something about — *failed* and *orphaned* — earn a prominent
  badge; the rest are quiet single-line facts, and *written* is worth linking
  straight to the event. Five equally loud chips train the recruiter to ignore
  all five, including the one that means somebody is about to attend a cancelled
  interview.
- **When more than one calendar should carry the interview**, model one write-back
  state per target rather than one aggregate. An aggregate "synced" that hides a
  failed second target is exactly the lie this vocabulary exists to prevent.

## When not to use it

- **When the calendar entry is genuinely disposable** — an informational hold
  nobody attends, regenerated freely — the full five-state machine is overhead.
  Say so explicitly, though, rather than letting it be an accident of a missing
  branch.
- **When the remote system offers native idempotency keys and reliable
  reconciliation**, lean on them instead of a hand-rolled state machine, but keep
  the orphaned state: no remote system will tell you that a human deleted
  something unless you look.
- **When there is no human who could act on an orphan**, surfacing it is noise.
  Fix that first: the state is only worth detecting if it lands in front of
  someone with the authority to re-create the entry or contact the interviewer.

## The tell

You have this right when deleting the interview's entry directly from the
external calendar causes the recruiter's view to say the entry is missing and
the interview still stands — and a retry of the write-back produces one event,
not a second.
