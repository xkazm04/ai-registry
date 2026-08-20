---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: structural-slot-validation-on-submit
status: forged
laws: [uncertainty-resolves-toward-the-candidate, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [accepting a booking from a candidate link, hardening a scheduling endpoint, deciding what a stale browser tab may still submit]
---

# Structural slot validation on submit

A submitted booking is accepted only if the server can prove it is a slot the
server itself would have offered. The proof is structural: re-generate the
offered grid from the invitation, and require **membership** in it. Everything
else — range checks, sanity checks, "looks reasonable" — is a weaker
approximation that admits the bookings you were trying to exclude.

## Set membership, not range containment

The offered times are a discrete set. A range check treats them as a continuum,
and the gap between the two is where every real attack and most real accidents
live: 09:07 instead of 09:00, a Saturday inside "this fortnight", a slot at the
top of the lunch hour, a time thirty seconds off because a client rounded
differently. Each of those passes "is it between the window's start and end" and
fails "is it one of the offered starts".

So the conjunction is explicit, and every clause is load-bearing:

- **In the future**, evaluated at submit time — a tab left open overnight will
  cheerfully resubmit a slot that has passed.
- **Within the invitation's booking window** — a replayed or hand-edited payload
  otherwise books a month out.
- **On a business day in the anchor zone** — weekend and holiday exclusion is a
  fact about the interviewer's calendar, and must be computed in the anchor zone
  (interviewer-timezone-anchoring).
- **One of the offered start times** — the actual membership test, against a
  freshly generated grid rather than a cached one.
- **Exact to the minute** — no tolerance window. A tolerance is a second,
  undocumented grid.

Additionally, the invitation itself must be live: not revoked, not cancelled,
not past its deadline, and not already booked beyond its reschedule budget.
Those are state checks rather than slot checks, and they run first, because
telling a candidate their slot is invalid when the real answer is that the link
is dead is a needlessly cruel and confusing error.

## Procedure

1. **Load the invitation and resolve its state** before looking at the payload
   at all.
2. **Re-generate the grid** with the same generator the picker used, from the
   invitation's own parameters — never from parameters echoed back by the
   client.
3. **Test membership** of the submitted instant, exact to the minute.
4. **Re-derive everything else** about the slot from the matched grid entry —
   label, end time, duration (server-authored-slot-labels).
5. **Check availability with the calendar owner** — the freshly generated grid
   proves the slot was *offerable*, not that it is still free. The conflict
   answer comes from the calendar subject, not from here.
6. **Persist the matched slot, not the submitted one.** This is the whole point:
   what is stored is the server's object, and the client's payload was only ever
   a selector.

## Decision rules

- **When a check can be expressed as membership, express it as membership.** A
  predicate that describes the set is a re-implementation that will drift from
  the generator.
- **When validation fails for any reason, respond with the same shape**: "that
  time is no longer available — here are the current options", plus a refreshed
  grid. Enumerating the violated clause tells an attacker the shape of the grid
  and tells an innocent candidate they did something wrong when they did not.
- **When the failure is ambiguous — a clock skew, an unreadable payload, a
  partially applied write — fail toward the candidate**: do not book, do not
  spend a reschedule attempt, do not mark the invitation as anything, and put
  the candidate back on a working picker. The recoverable outcome is a retry;
  the unrecoverable one is a phantom booking neither party can see.
- **When client-side filtering exists, treat it as courtesy only.** It should
  exist — it is a better experience than a server round-trip to learn that lunch
  is blocked — but it is never the control, and a change to the rules must land
  in the generator, not in the picker.
- **When a slot passes membership but the calendar says it is taken, that is not
  a validation failure** — it is a race, and the honest response says so and
  re-offers, rather than accusing the candidate of submitting something invalid.

## Idempotency and the double-submit

The commonest real-world "attack" is a candidate double-clicking, or a flaky
connection retrying. Make the booking idempotent on (invitation, instant): a
second submission of the same slot returns the existing booking rather than
creating a second one or spending a reschedule attempt. Anything else turns
network jitter into a punishment.

## When not to use this

The structural check is deliberately strict, which makes it the wrong tool for
the escape hatch. A candidate proposing their own times is answering a different
question — *when could this work?* — and their proposal must not be filtered
through the grid that already failed them
(propose-your-own-times-escalation). Validate proposals for sanity (in the
future, bounded count, bounded text) and route them to a human; do not require
membership.

Likewise, a recruiter acting inside the trust boundary may legitimately book
outside the grid — an evening slot agreed by email, a slot on a day the
generator excludes. That path is authenticated, attributed to a named actor, and
recorded as a recruiter action. It is not an exemption to this technique; it is
a different actor, with different authority, on a different path.
