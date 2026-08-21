---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: re-check-at-confirm-time
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints, absence-of-evidence-is-not-evidence]
use_when: [a candidate confirms a slot that was offered earlier, deciding whether a conflict check may block a booking, an offered page can sit open for days before it is used]
---

# Re-check at confirm time

## The concern

Availability is checked when times are *proposed*. The booking happens when the
candidate *clicks*. Those are two different moments, and the gap between them is
not bounded by anything you control: an invitation page renders when the
candidate opens their mail, which may be on the train, at midnight, or the
following Tuesday with the laptop lid closed in between.

In that gap the interviewer's calendar keeps moving, and it moves in the
direction that hurts — it fills up. A check performed only at suggestion time is
therefore not a control at all; it is a stale hint. The double-booking it fails
to prevent is the most expensive defect in this subject, because it is only
discovered by two people sitting in different meetings at the same time.

## The procedure

1. **Run the availability check twice, with different jobs.** The suggestion-time
   run is a *courtesy*: it keeps obviously-taken times out of the candidate's
   face and makes the grid pleasant. The confirm-time run is the *control*: it is
   the one whose answer is allowed to change the outcome. Do not merge the two
   into one cached result — caching the first and reusing it at confirm time
   reintroduces exactly the staleness the technique exists to remove.

2. **Re-check the same real interval you would book**, in the interviewer's
   anchor zone, with the interview's actual duration and buffer — not the start
   instant, and not the coarse hour bucket used against your own bookings.

3. **Keep the second check three-valued.** It returns checked-free, checked-busy,
   or unknown, exactly as the first one does. This is where most implementations
   quietly regress, because "be careful at the moment of commitment" sounds like
   good engineering and produces exactly the wrong behaviour.

4. **Branch asymmetrically on the three values.**
   - *Checked-free* — book.
   - *Unknown* — **book anyway**, record that the confirmation proceeded without
     a verified calendar, and surface that fact to the recruiter who can resolve
     it.
   - *Checked-busy* — do not book; return the candidate to the current set of
     available times with a message that names no cause and offers a next step.

5. **Order the check after your own structural validation and before the write.**
   The invariants you own — the slot is in the future, in the window, on a
   business day, a member of the offered set — are cheap, certain, and belong to
   the neighbouring self-scheduling discipline. Only a slot that has passed all
   of those is worth spending a network call on.

6. **Make the whole confirm path idempotent.** A candidate double-clicking, or a
   retry after a timeout on the calendar write, must converge on one booking and
   one event, not on a second attempt that now sees the first one as a conflict
   and refuses.

## Decision rules

- **An outage must never block a booking.** Only a *positive* busy answer may
  stop a confirmation. A candidate blocked because a token expired has been
  charged for your failure, whereas a booking that lands on a real conflict costs
  one apologetic reschedule initiated by the party who owns the calendar
  ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate),
  [a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the check says busy, show the current options in the same response.**
  Rejecting into a dead end converts a recoverable near-miss into an email
  thread and a day of latency.
- **The rejection message names no cause.** "That time has just been taken — here
  are the times available now" is correct for every branch. Naming the
  interviewer's conflicting commitment discloses their calendar to a stranger;
  naming the failing integration discloses your internals.
- **Record the branch that was taken on the booking itself.** A booking made
  under an unknown status is a different object from one made under a verified
  free status, and someone will need to know which it was when the clash
  surfaces.
- **Never write the unknown branch as a verified check.** The record must say
  what happened, not what usually happens
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## When not to use it

- **When the offer window is genuinely instantaneous** — an interactive picker
  used live on a call, where propose and confirm are seconds apart and the same
  human is watching both — a single check is defensible. Note how rare that is:
  any flow that involves sending a link does not qualify.
- **When the calendar you check is your own database**, the re-check is still
  required but is a transaction concern rather than an integration one: use a
  uniqueness constraint on the collision key and let the write itself be the
  check. A second read before the write is weaker than the constraint.
- **When the check would be the only thing standing between a candidate and a
  booking, and it cannot be made fast**, prefer booking with a recorded unknown
  over an interstitial spinner. Confirmation is the moment with the least
  tolerance for latency in the whole flow.

## The tell

You have this right when severing the integration mid-session lets an
already-open invitation page complete a booking successfully, and the recruiter's
view of that interview says plainly that the calendar could not be verified.
