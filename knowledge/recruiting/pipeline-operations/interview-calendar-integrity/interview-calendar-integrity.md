---
layer: golden-path
type: golden-path
subject: interview-calendar-integrity
status: forged
use_when: [integrating an external calendar into scheduling, deciding what to do when a free/busy lookup fails, designing interview event create/move/cancel write-back, building a recruiter view of upcoming and past interviews]
techniques:
  - three-valued-free-busy-unknown-is-not-free
  - re-check-at-confirm-time
  - real-duration-conflict-window
  - idempotent-event-lifecycle-with-orphan-surfacing
  - audience-scoped-calendar-disclosure
  - lifecycle-bucketing-with-a-post-start-grace
---

# Interview calendar integrity

An interview is a promise that two or more people will be in the same place at
the same time. A calendar event is a *record* of that promise living in a system
you do not own, cannot fix, and were only ever loaned access to. This subject is
about keeping those two things equal to each other — one interview, one event —
when the second one can be unavailable, revoked, edited by a human behind your
back, or simply wrong.

The naive reading is that a calendar integration makes scheduling better. The
principal reading is that a calendar integration makes scheduling **conditional**,
and that the entire craft is refusing to let that condition become load-bearing.
Scheduling worked before you had the integration. It has to keep working while
the integration is down, after the grant is revoked, and for the interviewer who
never connected one. Everything below is an elaboration of that single sentence.

## The failure that defines the subject

There is one bug in this area that is worse than all the others combined, and
it is not a crash. It is a lookup that fails and returns *nothing*, which the
caller reads as *nothing in the way*, which the product renders as *these times
are free*. The candidate books. The interviewer is on a plane.

Nothing errored. No alert fired. The system was never more confident than at the
moment it was most wrong, because an outage and an empty calendar are the same
bytes if you chose a two-valued type. The type is the bug. A boolean cannot
express "I asked and could not find out", so somebody had to pick a side, and
whichever side they picked becomes a lie half the time.

Hence the spine of this subject: **free/busy is three-valued**. Free, busy, and
unknown — and unknown is neither of the other two, never coerced, never defaulted,
never collapsed at the boundary "for simplicity". This is
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
in its most literal mechanical form: no answer from a calendar is not an answer
about a calendar (three-valued-free-busy-unknown-is-not-free).

What makes the discipline tractable is that unknown has an obvious correct
behaviour, and it is not an error page. When the answer is unknown, the caller
returns **exactly what the product would have proposed if the integration had
never existed** — the full configured grid, unfiltered. That is not a degraded
mode bolted on; it is the base case the integration was an optimization over.
Filtering is a *subtraction* from a list that is already complete and already
correct. Subtracting nothing is always safe. Refusing to produce the list at all
is the only genuinely broken outcome, because it stalls a candidate over an
infrastructure problem they cannot see, cannot influence, and did not cause
([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

## Three statuses, one of which is a claim

Because the third value must survive to the surface, the status carried alongside
any set of offered times has three members, and only one of them asserts that a
calendar was actually consulted:

- **Not connected** — no grant exists. Nothing was consulted; nothing was hidden.
- **Unavailable** — a grant exists, the lookup was attempted, and it failed or
  timed out. Nothing was hidden. This is a statement about *your* infrastructure.
- **Checked** — the calendar answered, and the answer was applied. This is the
  only status permitted to imply that a conflict would have been caught.

The distinction between the first two matters even though both produce an
unfiltered grid, because they demand different human action: nobody needs to be
paged because an interviewer has not connected a calendar, and somebody does need
to know that a connected one stopped answering. Collapsing them into a single
"couldn't check" is the small compromise that later makes a chronic token
expiry invisible for a quarter.

The rule that keeps this honest is that a status is an **assertion boundary**, not
a decoration: no surface may render "checked" copy — no "we found a free time",
no green tick, no "conflict-free" — on a payload whose status is anything else.
This is [meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)
applied to availability, and it is the same rule that neighbouring communication
work applies to delivery receipts, for the same reason: the tidy word is always
available and always tempting.

## Suggestion time is not decision time

A conflict check performed while generating suggestions has a shelf life, and the
shelf life is not the one people assume. The offer is rendered when the candidate
opens the page. The click can land minutes later, or days later, or after the
page has sat open on a laptop lid all weekend. Everything the calendar knew at
render time may have changed, and in the direction that matters most: the
interviewer's own calendar filled up.

So the check runs **twice**, and the second run is the one that counts
(re-check-at-confirm-time). The first is a courtesy that keeps obviously-bad
times out of the candidate's face. The second is the control.

The re-check is three-valued too — and this is where most implementations
quietly reintroduce the original bug, because a re-check that returns unknown
feels like a good place to be cautious. It is not. An outage at confirm time must
**never block a booking**. If the lookup fails, the booking proceeds and the
uncertainty is recorded and surfaced to the humans who can resolve it. The
asymmetry is deliberate and it is a values choice, not an engineering
convenience: a candidate who cannot complete a booking because your token expired
has been penalised for your failure, while a booking that lands on a genuine
conflict costs one apologetic reschedule from the party that owns the calendar
([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
Only a *positive* busy answer — the calendar said yes, there is something there —
may stop a confirmation, and even then the candidate is shown the current
alternatives rather than a dead end.

## What counts as a collision

A conflict check is only as good as its window, and the window has to be the
**real** one — the interview's actual duration plus whatever buffer the process
needs, anchored in the interviewer's zone (real-duration-conflict-window).
Checking the start instant alone catches only exact ties and misses every overlap
that matters: a ninety-minute panel that swallows the next slot, a call that
starts fifteen minutes before yours ends.

There is a second, coarser notion that is easy to confuse with the first and must
be kept separate: an internal collision key that stops your *own* system from
offering the same interviewer the same hour twice. A bucketed key — the
interviewer's hour, in the interviewer's zone — is deliberately blunt: two
bookings at ten past and half past the same hour collide under it even though
their real intervals may not overlap. That bluntness is correct for its job,
because back-to-back interviews in one hour are a scheduling smell regardless of
the arithmetic, and a coarse key is cheap, index-friendly and never produces a
double-book through a rounding difference. Use the coarse key against your own
bookings; use the real interval against the external calendar. Never substitute
one for the other, and never let the coarse key leak into a claim about the
interviewer's actual availability.

Because collisions are computed in a wall-clock zone, all of the timezone
discipline that neighbouring self-scheduling work establishes applies unchanged
here: the interviewer's zone is the anchor, and the candidate's zone is a
rendering concern only.

## One event for the whole life of an interview

An interview that is booked, then moved, then moved again, then cancelled must
leave **one** trail in the external calendar, not four. Every write is keyed to
the interview, not to the action, so a retry after a timeout updates rather than
duplicates, and a moved interview is the same event at a new time rather than a
new event beside a stale one (idempotent-event-lifecycle-with-orphan-surfacing).

The reason to insist on this is not tidiness. Duplicate interview events are read
by humans as *two interviews*, and the human who reads them is often the
candidate. Stale events left behind after a move are worse: the interviewer
attends the old one.

Write-back therefore has its own state vocabulary — and it is a **second axis**,
not an extension of the free/busy one. Whether a calendar answered a question is
a different fact from whether a calendar accepted a write, and the two go out of
step constantly: a lookup can succeed while the write fails, and a write can
succeed on a connection whose next lookup times out. The only value the two axes
should share is *not connected*, because that one really is the same fact.

The write axis must include the state everybody forgets, and it has two
directions. One is the entry that should exist and does not — the grant was
revoked, an interviewer deleted it by hand, an administrator tidied a shared
calendar. The other is more dangerous and less obvious: the interview **closed**
and the deletion did not land, so a stale entry is still sitting on somebody's
calendar telling them to show up. The first costs visibility; the second puts a
person in a room for an interview that was cancelled. Both are the same
**orphaned** state, and in both the remote identifier is *kept* rather than
cleared, because it is the only handle a retry has. It is surfaced to a human —
"the calendar entry for this interview is gone; the interview still stands", or
"this interview closed but its calendar entry may still be live" — because
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
cuts in the unflattering direction too: if you cannot confirm the event exists,
you may not draw the icon that says it does. The interview itself is never
cancelled because its calendar shadow disappeared — the source of truth is your
scheduling record, and the external event is a projection of it.

Two smaller rules make the projection trustworthy. **Do not compose the event
body at the write site.** The title, description, joining details and location
already exist wherever you generate the downloadable invitation and the
add-to-calendar link, and the written event must be that same composed object.
Composed twice, the real entry and the fallback link will eventually disagree
about the time, the round or the meeting URL — and the candidate will be holding
whichever one is wrong. **Do not let the calendar provider send its own
invitation.** Most will happily email every attendee on your behalf, which
produces a second, unbranded, differently-worded message for one interview, sent
outside your delivery record entirely. One interview, one event, one
invitation — and the invitation is yours, because you are the one accountable
for what it says.

## Who is told what

A conflict check produces a fact about a specific person's calendar, and that
fact has an audience (audience-scoped-calendar-disclosure).

The recruiter is internal to the process and is accountable for the schedule
working, so they get the operative detail: which status the lookup returned, and
how many candidate-visible times were removed as busy. That count is what makes a
thin grid legible — three options is alarming until you know that nine were
hidden, at which point it is merely a busy week.

The candidate gets **one bit**: these times reflect current availability, or they
may not. Nothing more. The count of hidden times is a statement about the
*interviewer's* calendar — how loaded they are, whether they work Fridays, how
much of their week is already committed — and none of that is the candidate's
business or the company's to disclose. The asymmetry is not paternalism about
what candidates can handle; it is a straightforward boundary about whose personal
schedule is being described. The same rule extends to error text: a candidate must
never see which integration failed or why, only that the times shown may not be
current.

The strongest form of this rule is enforced at the permission you request rather
than at the field you render. Ask for the narrowest access that answers your
question — the busy/free projection, not the contents — so that the system is
*incapable* of learning why someone is busy, only that they are. A disclosure
boundary that depends on remembering not to render a field will eventually be
crossed by a debugging log or a well-meaning new panel; one that depends on
never having fetched the data cannot be.

## Nothing may silently disappear from the agenda

The last third of this subject is not about the external system at all. It is
about the internal view, and it exists because of a specific class of incident
that recurs everywhere: **the interview that vanishes from the screen while it is
still happening.**

The mechanism is always the same. A view splits interviews into "upcoming" and
"past" with a single comparison against now. At the start time, the interview
leaves upcoming. It has no outcome yet, so it does not appear in a completed
list either. For the entire hour in which it is actually being conducted — and
often for hours after, until somebody remembers to record something — it is in
neither bucket, and to everyone watching, it has been cancelled.

The fix is bucketing with a **post-start grace window**: an interview stays
visible on the live agenda for its duration plus a margin, and when it finally
leaves, it lands in an explicit *awaiting outcome* bucket rather than in nothing
(lifecycle-bucketing-with-a-post-start-grace). The invariant to test for is
total: every live interview is in exactly one bucket at every instant, and no
clock value makes it in zero. Bucket membership must be a partition of time, not
a set of independently-authored predicates that happen to have covered most of
it.

Two corollaries of the same principle:

**Eligibility rules that must agree must be one rule.** Whether an interview can
be re-invited and whether it can still be reminded about are the same underlying
question — is this still live and still actionable — asked by two features. Written
twice, they drift, and the drift shows up as a reminder for something nobody can
act on, or a re-invite button on something already gone. Derive both from one
predicate.

**A displayed time window must include everything that exists.** A week grid whose
rows come only from configuration will silently hide any booking outside those
hours — the seven-in-the-evening interview a recruiter created by hand, or the
one booked before someone narrowed the business day. The rows must be the union
of the configured hours, the proposal window, and every hour any real booking
actually occupies. Configuration describes what you *offer*; it does not get to
decide what *exists*. This is the same failure as the vanishing interview wearing
different clothes: a display rule that quietly filters reality.

Reminders live at this same seam and carry their own trap, which is worth stating
precisely because almost everyone builds it. Two different questions get asked
with one number. The first is a **look-ahead window**: how soon before the
interview does a reminder fire. The second is a **short-notice floor**: how close
to the interview must a booking have been made before a separate reminder stops
being useful. Set both to the same value — twenty-four hours is the number
everyone picks — and an interview booked inside that window satisfies the
suppression clause while never becoming due, so it receives **no reminder at
all**. The gap is silent, it is undocumented, and it hits precisely the
last-minute bookers who are most likely to forget.

The fix is not simply "two bounds". It is understanding why the floor exists at
all: below it, **the confirmation message the candidate just received is the
reminder**. A separately-fired reminder would land moments behind it and read as
a system stuttering. So the floor is real and should be kept — but it must be a
distinct, named, deliberately unequal duration, small enough that a booking made
this afternoon for tomorrow morning still gets served, and its existence must
change the *copy*: a short-notice confirmation is worded as a see-you-soon note
and must not promise a later reminder it will never send. One further rule earns
its place: an unknown confirmation time must never suppress. A missing timestamp
is a gap in your data, not evidence that the candidate was already reminded.

Send attempts get bounded retries with backoff and a recorded terminal give-up.
Unbounded retry against a failing channel is not resilience — it is a re-claim
and re-fail storm across every due reminder at once, and it hammers the
dependency that was already struggling. Whether the reminder actually *arrived*
is the neighbouring communication-integrity discipline's question, not this
one's.

## Seams with the neighbours

- **Candidate self-scheduling** owns the candidate's agency: the booking token,
  slot validation on submit, server-authored labels, the reschedule cap, the
  propose-your-own-times escape hatch. It hands this subject a validated intent
  and asks "is this slot truly free". Everything about *how that question is
  answered*, and about the calendar event that results, is here. The one place
  the two touch tightly is the coarse hour collision key, which self-scheduling
  uses to avoid offering an obviously-taken hour and this subject defines.
- **Pipeline aging and attention triage** owns the recruiter's queue — what
  ranks above what, when an unanswered invitation becomes an item demanding
  attention. This subject owns the lifecycle buckets and hands them over; triage
  consumes them and must not recompute a second private notion of whether an
  interview is still live.
- **Candidate communication integrity** owns whether the invitation or reminder
  actually arrived, and what a send status may claim. This subject decides
  *whether and when* a reminder is warranted; the delivery record is theirs.
- The general engineering of tokens, refresh, retries, queues and third-party
  API plumbing is ordinary application practice and not this subject's to teach.
  What is this subject's is the hiring consequence of each failure: who is
  stalled, who is misinformed, and who is standing in an empty room.

## Failure modes of the naive reading

- **A boolean free/busy.** The type cannot say "I don't know", so the code lies
  in whichever direction the default points.
- **Failing closed on an outage.** Refusing to offer times because the calendar
  is down converts your incident into the candidate's delay.
- **Blocking a confirmation on an unknown.** The one moment where caution is
  most tempting is the one where it costs the wrong person.
- **Checking only the start instant.** Overlaps are intervals; instants find
  only exact ties.
- **Keying calendar writes by action.** Retries duplicate, moves orphan, and the
  interviewer attends the wrong one.
- **Treating a missing remote event as a missing interview.** The scheduling
  record is the truth; the calendar entry is its shadow.
- **Telling the candidate how busy the interviewer is.** It is not their
  calendar and not their business.
- **Two buckets separated by one comparison.** An interview in progress belongs
  to neither, and disappears exactly when someone is looking for it.
- **One threshold doing two jobs.** The candidates who lose the reminder are the
  ones who booked latest and needed it most.
