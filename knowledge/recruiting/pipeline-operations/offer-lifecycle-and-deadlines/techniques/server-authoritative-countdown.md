---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: server-authoritative-countdown
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [building the candidate-facing offer page, showing time remaining on any deadline, reconciling a candidate who says the page told them they still had time]
---

# Server-authoritative countdown

The candidate-facing offer page shows how long is left. That number must be
computed where the expiry is enforced and delivered to the page as a value — never
computed on the device from a deadline timestamp and the device's own clock.

The reason is one sentence: **a skewed client clock must not disagree with a
server-enforced expiry.** A device set to the wrong day, a traveller who crossed a
date line, a laptop resumed from sleep with a stale clock, a browser throttling
timers in a background tab — each produces a page that confidently tells a person
they have time, followed by a submission the server refuses. The candidate does not
experience that as a clock bug. They experience it as an organisation that pulled an
offer while they were reading it.

## The procedure

- **Compute remaining time server-side** at render, from the same stored deadline
  and the same clock the expiry check uses. Send the *remaining amount*, not just
  the deadline instant, so the page never has to consult the device to know where it
  stands.
- **Let the page tick down from that value** for local smoothness if you like, but
  treat the ticking as decoration. Re-fetch on focus, on reconnect, and before the
  terminal action, so a page left open overnight corrects itself instead of counting
  into fiction.
- **Render the absolute deadline alongside the countdown**, with a named timezone.
  The countdown creates urgency; the absolute date is what a candidate writes in
  their calendar and what they will quote back to you.
- **Choose units by proximity**, not by precision available: days when the deadline
  is days away, hours inside the last day, and never seconds. A seconds counter on a
  job offer is pressure theatre, and it is also the display most likely to be
  visibly wrong.
- **Round the remaining figure UP, and clamp it at zero.** A candidate with ninety
  minutes left should read "2 hours left", not "1". Rounding down manufactures a
  deadline earlier than the enforced one, and — worse — lets the page display "0
  hours left" on an offer that is still perfectly acceptable. With round-up, zero
  can only ever mean actually expired, which makes the display and the enforcement
  agree by construction.
- **When the remaining time is zero or absent, the page is not a countdown** — it
  is either the expired answer (a different response with different content and a
  different status) or, when the offer simply carries no deadline, no countdown at
  all. Render nothing rather than a placeholder: an offer with no deadline does not
  lapse, and inventing a timer for it is a threat the system will not carry out.

## The boundary is the server's, and it is generous

Two candidates will submit within seconds of the deadline: the one at 23:59 and the
one at 00:01. Decide the boundary deliberately.

The rule that survives contact with reality is: **the server's evaluation instant
decides, and the boundary is inclusive of the candidate.** An acceptance whose
request arrived at the deadline is accepted. Where a small grace period is granted —
minutes, not hours, to absorb network latency and a slow form submit — grant it
uniformly, encode it once next to the expiry check, and never grant it ad hoc for
one candidate, because a grace period applied by hand is a fairness problem in a
process that must be able to explain itself.

What you must not do is show a grace period in the countdown. The displayed
deadline is the published deadline; the grace is slack behind it. A visible grace
period is just a later deadline with extra steps, and it will itself need a grace
period.

## The terminal action lives on this page, and decline is guarded

The offer page is where the candidate performs the single most consequential act in
their side of the process. Two design rules follow.

**Accept is direct.** The person came to say yes; do not put a confirmation dialog,
a survey or an account creation between them and the button. If anything must be
collected, collect it after the acceptance is recorded.

**Decline is behind a deliberate confirm** — and the confirm is *inline*, in the
page, not a native browser prompt that a candidate can dismiss with a reflex. A
decline is irreversible and it is the click nearest to a mis-tap. When the confirm
appears, **move focus to the safe option**, so a keyboard-driven confirmation or a
double-press of the same key cannot complete an irreversible decline the person had
not decided on. State plainly, in the confirm, that declining ends the offer and
that it cannot be undone.

Neither surface should shame the decliner. A confirm that says "Are you sure? This
is a great opportunity" is a dark pattern; a confirm that says what will happen is
not.

## The page must work when your systems do not

The countdown is server-computed, which makes the page dependent on the server.
Design that dependency honestly: if the remaining-time computation cannot be
performed, show the absolute deadline and let the candidate act, rather than
blocking the terminal buttons behind a number that failed to load. And the terminal
action itself is never gated on the organisation's plan, quota or billing state —
the acceptance is debited, never blocked, because the organisation's commercial
condition is not the candidate's problem.
[A candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## Accessibility of a moving number

A countdown that updates in place is hostile to screen readers if it is announced
on every tick. Mark the ticking region so it is not a live announcement, and expose
the deadline and the remaining time as static, readable text. The urgency is
conveyed by the words; the animation is for the sighted and the incidental.

## When not to use this

- **Non-urgent deadlines far out.** An offer with a month to run does not need a
  countdown at all; a date is clearer and less coercive. Introduce the countdown
  only inside the last stretch.
- **Internal recruiter views.** A recruiter looking at pipeline aging needs elapsed
  and remaining time as data, not as a ticking widget.
- **Anywhere the deadline is not actually enforced.** A countdown toward a soft date
  nobody will act on teaches candidates that your deadlines are decorative — which
  costs you the one instrument this subject is built around.
