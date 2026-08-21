---
layer: golden-path
type: golden-path
subject: candidate-self-scheduling
status: forged
use_when: [building a candidate-facing booking link, handling reschedules or no-shows, deciding what a scheduling token may authorize, designing timezone behaviour for interviews]
techniques:
  - server-authored-slot-labels
  - interviewer-timezone-anchoring
  - structural-slot-validation-on-submit
  - reschedule-cap-with-a-recruiter-bypass
  - propose-your-own-times-escalation
  - withdraw-is-not-cancel
---

# Candidate self-scheduling

Self-scheduling is letting a candidate choose their own interview time without
letting them — or an outage, or a stale browser tab — corrupt the calendar, and
without trapping them when none of the offered times work. It is a small feature
with an unusually high density of judgment, because it is the first moment in
most hiring processes where the candidate is handed a control that writes to the
company's systems.

That is also why it is a moral test disguised as a form. A scheduling flow is
where a hiring process most often reveals whether it treats the candidate as a
**participant** or as a **resource to be slotted**. Every parameter in it is a
statement about whose time is assumed to be flexible: a two-reschedule cap says
the candidate's week is expected to bend and the interviewer's is not; a picker
that renders in the company's timezone says the candidate is expected to do the
arithmetic; a grid with no escape hatch says a candidate whose only free hour
falls outside your business day is not really wanted. None of those statements
is usually intended. All of them are made, in code, by defaults nobody argued
about.

The principal reading holds two things at once. The candidate is a **hostile
input source** at the protocol layer — a booking link is a bearer credential
handed to an unauthenticated stranger, and everything that arrives back through
it is attacker-controlled until proven otherwise. And the candidate is a
**person with a job, a timezone and childcare** at the product layer, who must
never be able to reach a state where the interface offers them nothing. Systems
that hold only the first belief build a validated cage. Systems that hold only
the second build a calendar that anyone with a link can write junk into. The
craft is holding both.

## The trust boundary: what a scheduling token authorizes

A self-scheduling link is issued to one candidate for one round, and it must be
treated as exactly that: a capability, not an identity. It authorizes a *very*
small verb set — see the offered times for this invitation, book one of them,
reschedule within a cap, propose alternatives, or decline this round — and
nothing else. It does not authorize reading other candidates, seeing interviewer
names or free/busy, learning who else is in the pipeline, or discovering the
stage vocabulary of your process.

The single invariant that makes the rest of the subject tractable is this:

> **A candidate-submitted booking is only ever persisted as a slot the server
> itself would have offered.**

Not "a slot that looks plausible". Not "a slot that passed a range check". A
slot the server would have generated, independently, from the invitation, with
no input from the client except *which one*. The client's job is to name a
choice; the server's job is to re-derive everything about it. Anything the
client sends beyond the choice — a display label, a duration, an end time, a
timezone name, a formatted date — is discarded, not validated, because
validating transported data preserves the assumption that the client had a right
to author it (server-authored-slot-labels,
structural-slot-validation-on-submit).

The failure mode this prevents is not an exotic one. A booking payload that
carries its own human-readable label is an **injection vector with a delivery
mechanism attached**: the label is stored, then rendered into a confirmation
email, an interviewer's calendar invitation, and a recruiter's activity feed.
The attacker does not need to breach anything; they need only to submit a
booking. A token holder who can also choose an arbitrary timestamp gets a second
prize — an interview at three in the morning, on a Sunday, or last Tuesday.
Range-checking the timestamp is not enough, because the offered grid is a
*discrete* set and a range is continuous; the check must be membership in that
set, down to the exact minute.

The general engineering half of this — token issue, rotation, transport, rate
limiting, injection defence in the rendering layer — belongs to ordinary
application-security practice and is not this subject's to teach. What is this
subject's is the hiring-specific consequence: a scheduling artifact is an
**identity-bound record**. It ties a named person to a hiring event, it is
forwarded to interviewers and stored in the candidate's file, and it is read
later as evidence of what was offered and what was agreed. That is why its
contents must be authored by the party that is accountable for them.

## The wall clock has an owner

The most expensive bug in this subject is not a security bug. It is the quiet
assumption that "ten in the morning" is a property of a moment in time.

An interview slot has three timezones circling it: the interviewer's, the
candidate's, and the server's. Exactly one of them defines the slot's identity.
It is the **interviewer's** — because the constraints that generate the grid
(business hours, lunch, a day that is not a public holiday, "not before nine")
are facts about the interviewer's working life, not about a datacentre's locale
and not about where the candidate happens to be sitting this week
(interviewer-timezone-anchoring).

Get this wrong and the symptom is bizarre enough to burn a day of debugging: a
mid-morning slot renders as pre-dawn for a candidate in another region, and when
that candidate sensibly picks the local time that looks right to them, the server
rejects it as "not an offered slot". Both halves of that incident are the same
root cause — hour arithmetic performed in whatever zone the code happened to run
in, while the picker rendered in whatever zone the browser happened to be in.
The candidate experiences it as the company being unable to tell time, and they
are not wrong.

The discipline: generate and validate in the anchor zone; **render** in the
candidate's zone with the anchor zone shown alongside; store the instant
unambiguously; and never let a display string round-trip back into a decision.
A candidate should see "14:00 your time (09:00 in the interviewer's)" and should
never have to compute anything. Doing the arithmetic on the candidate's behalf
is not a nicety — it is the difference between a process that works for
distributed candidates and one that quietly filters them out.

## Structure, not trust, on submit

Validation on submit is **structural**, and the structure is a conjunction, not
a menu. A submitted booking is accepted only if it is in the future, within the
invitation's booking window, on a business day in the anchor zone, one of the
offered start times, and exact to the minute. Each clause exists because a real
attack or a real accident violates exactly that clause and no other: a stale tab
resubmits a slot that has since passed; a replayed payload lands outside the
window; a hand-edited timestamp lands on a Saturday; a rounding difference lands
ninety seconds off a real slot.

Two rules keep the check honest. First, the checks run **server-side and again**
— the picker's own filtering is a courtesy to the candidate, never a control.
Second, the rejection message tells the candidate what to do, not what they did
wrong. "That time is no longer available — here are the current options" is a
correct and kind response to every failed clause; enumerating which invariant
was violated leaks the grid's shape to an attacker and confuses a human who did
nothing unusual.

## The dead end is the real product failure

Everything above is about not letting the candidate break the calendar. The
harder half is not letting the calendar break the candidate.

A grid of offered times is a hypothesis about when the candidate is free, and it
is often wrong — night shifts, a current job with no daytime privacy, a
timezone offset that makes your business hours their small hours, caring
responsibilities. When the hypothesis fails, the naive system has nothing: the
candidate stares at five impossible times and either books one they cannot keep
or emails someone and waits. Both outcomes are recorded against *them* — as a
no-show, or as a slow candidate.

Two mechanisms prevent the dead end, and they are deliberately different.

**A reschedule cap with a recruiter bypass.** A small cap on candidate-initiated
reschedules is legitimate: an uncapped loop lets a token holder churn the
interviewer's calendar indefinitely, and each churn is a real cost to a real
person. But the cap must be a budget the *candidate* spends, and only the
candidate. A recruiter repairing a mistake — wrong interviewer, wrong duration,
a slot that should never have been offered — must bypass the cap and must not
debit the candidate's budget for the company's error. Re-picking the same time
is a free no-op, not a spent attempt; charging for that is a bookkeeping bug
that reads to the candidate as a punishment
(reschedule-cap-with-a-recruiter-bypass).

**Propose your own times.** The escape hatch is reached precisely when the grid
is exhausted, so it is deliberately **wider** than the grid — evenings, other
weeks, a free-text constraint. Tightening it to match the offered window is the
single most common way this feature is built uselessly: it re-imposes the exact
constraint the candidate has already told you they cannot meet. A proposal is
not a booking; it is a request that lands in a human's queue and is answered by
a human. Its promise to the candidate is bounded and honest: *this reaches a
person, and you will hear back* (propose-your-own-times-escalation).

Both mechanisms rest on the principle that a candidate's own action must not
fail because of your constraints. Your interviewer's calendar being full, your
scheduling window being narrow, your integration being down — these are your
problems, and the candidate's process must have a path forward through all of
them.

## States, ordering, and what is derived

A self-scheduling page is a small state machine, and its *ordering* is the
logic. Given a token, resolve state in a fixed priority: **a dead link beats a
booking, and a booking beats the picker.** Revoked, cancelled or expired
invitations must be reported as dead even if a booking exists on them, because
showing a confirmed time on a revoked invitation tells the candidate to turn up
to an interview nobody will attend. A booked invitation shows the booking and
its remaining reschedule budget, never a fresh picker — a picker on a booked
invitation invites accidental double-booking and communicates that the previous
choice did not matter.

Expiry is **derived, not stored**. A stored `expired` flag is a claim that needs
a job to keep true, and the job will be down when it matters; a link then stays
live past its deadline or, worse, an unrun sweep marks a valid link dead. Derive
expiry from the deadline and the current instant at read time, and let the
stored states carry only what a human or the system actually *did* — issued,
booked, rescheduled, withdrawn, cancelled, revoked. The general practice of
deriving state rather than materializing it belongs to ordinary engineering; the
hiring-specific reason is that a candidate who arrives one minute after a
deadline deserves the truth about why, not an artifact of your cron schedule.

## Withdraw is not cancel

The state vocabulary must distinguish two acts that look identical in a database
and are opposite in meaning. **Cancel** is the company calling off this
interview. **Withdraw** is the candidate declining this round. Collapsing them
into one terminal state destroys the only fact anyone will want later: who ended
it, and whether the candidate is still interested in the company at all
(withdraw-is-not-cancel).

The consequences differ all the way down. A cancellation obliges you to
re-offer; a withdrawal does not. A withdrawal may leave the candidate warm for a
future role and must not be recorded as a rejection or as a no-show. Only the
candidate's own act may be labelled withdrawal, and it should be reversible for
as long as the round is still live, because "I can't make any of these and I
have a deadline at work" is not the same sentence as "I no longer want this
job", and a one-way button will collect both.

The same honesty rule governs the terminal record generally: a booking that did
not actually advance the pipeline must not be written as though it did. If a
scheduled round ends without a decision — the interviewer never joined, the
round was abandoned, the requisition closed — the record seals a reason that
says so. A record that asserts a state that is not real is worse than a gap,
because the gap is later read as a gap and the assertion is later read as fact.

## Seams with neighbouring subjects

Self-scheduling is the *candidate's agency in choosing a time*. It borders three
subjects and must not absorb them:

- **Calendar integrity** owns free/busy resolution, conflict detection, holds,
  and the one-event lifecycle across create, move and cancel. This subject
  hands it a validated intent and asks whether the slot is truly free; the
  detail of *why* two things collide, and the idempotency of the calendar event
  itself, live there. What belongs here is only the coarse collision key used to
  keep a picker from offering an obviously-taken hour.
- **Pipeline aging and attention triage** owns what a stalled invitation does to
  a recruiter's queue — when an unanswered link becomes an item demanding
  attention, and how it is ranked against everything else waiting. This subject
  emits the events; it does not own the queue.
- **Communication integrity** owns whether the invitation ever arrived, how many
  times it was sent, and what the message may claim. This subject assumes
  delivery and owns what happens once the candidate clicks.

## Failure modes of the naive reading

- **Trusting the client's label because "it's just display text".** It is
  display text that will be emailed to an interviewer and stored in a hiring
  record. Re-derive it.
- **Range-checking instead of set-checking.** "Between nine and five" admits
  09:07 on a bank holiday. The offered grid is a set; membership is the check.
- **Rendering in the server's zone.** The server's locale is an accident of
  deployment and has no standing in anyone's working life.
- **A cap the recruiter also pays.** Then fixing your own mistake costs the
  candidate a chance to fix theirs.
- **An escape hatch as narrow as the grid.** It is reached because the grid
  failed; matching the grid's constraints makes it decoration.
- **One terminal state for every ending.** Cancelled, withdrawn, expired and
  no-showed are four different facts about four different actors, and the
  distinction is exactly what someone will need six months later.
- **A picker that never says "none of these work".** Whatever the interface
  omits, the candidate concludes is not allowed — and the ones who conclude it
  hardest are the ones already least confident that they belong in your process.
