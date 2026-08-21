---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: role-appropriate-deadline-bounds
status: forged
laws: [every-decision-names-its-actor, meaning-does-not-live-in-a-label, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [choosing an offer response window, building the deadline field on an offer form, justifying a deadline to a candidate who asks]
---

# Role-appropriate deadline bounds

The response window is a *parameter of the role*, not a property of the system.
The technique is to define a legitimate range, a default at the common case, and a
rule for moving inside the range — then to enforce the range in code so neither an
accidental zero nor a well-meant "take your time, no rush" can leave the offer
without a real clock.

## Why a single window fails in both directions

Pick one number and you have made the same mistake twice. Too long for the common
professional offer and you lose the momentum the interview loop built: the
candidate defers the decision until a slower competing process catches up, and you
have donated three weeks of exclusivity to a rival. Too short for a senior or
relocating hire and the deadline stops being a lever and starts being an insult —
a person who must discuss a move with a partner, count notice-period weeks and
weigh a counter from their current employer reads a three-day window as evidence
you have not thought about their life.

A tight, *role-appropriate* window is a genuine acceptance-rate accelerant: it
concentrates the decision while enthusiasm is at its peak and while the candidate's
memory of the team is fresh. A tight window applied indiscriminately is the same
instrument used as a bludgeon, and it converts into declines precisely among the
senior candidates who cost the most to source.

## The bounds

Define a hard floor, a hard ceiling and a default:

- **Floor — around one day.** An exploding offer can be legitimate. Volume,
  seasonal, shift and same-day hiring genuinely operate at this speed, and a system
  that forbids it forces those teams to work outside the record. What the floor
  prevents is the zero- or negative-length window: an offer that is expired the
  moment it is dispatched.
- **Default — about a week.** This is the common recruiting default because it is
  the shortest window that still contains a weekend and one conversation at home.
  Short enough to keep momentum, long enough not to rush a considered decision.
  Everything that does not deliberately set a window gets this one.
- **Ceiling — months.** Executive and board-level searches, academic cycles, and
  hires gated on visa or notice timing legitimately need windows measured in weeks
  or months. The ceiling exists so a mistyped year does not create an offer that
  never expires, not because long windows are wrong.

Store the window as a duration and derive the absolute deadline once, at dispatch.
A stored duration re-evaluated on every read means a deadline that moves.

Validate the per-offer value against the bounds at the point of resolution and fall
back to the default when it is missing or out of range, rather than rejecting the
offer. A recruiter who typed 400 gets the default window and a live offer; an offer
that refuses to exist because a number was wrong helps nobody.

**Absence is not zero.** An offer whose deadline is missing or unparseable never
expires. This is the migration case and it is not hypothetical: the offers minted
before a deadline field existed are live offers held by real people, and expiring
them because a column is null is the lever killing a candidate it was never aimed
at. Fail open on absence, and backfill the absence deliberately.

## Decision rules

- **When the role has a stated start date that is sooner than the default window
  plus the notice period, shorten the window** to preserve the start date, and say
  so in the letter. A constraint that is stated is a lever; the same constraint
  unstated is theatre.
- **When the candidate is under notice, relocating, or holding a competing process
  you know about, lengthen inside the bounds rather than expecting an extension
  request.** The extension you grant on request costs the same time and buys none
  of the goodwill of the window you set correctly.
- **When another candidate for the same requisition is holding a live offer,
  neither window may be set to expire the other into a fait accompli.** Sequencing
  offers is legitimate; using one candidate's clock to run out another's without
  telling either is not.
- **When no role-specific reason exists, use the default.** Do not let a per-offer
  field turn into a per-recruiter habit; a recruiter who always sets three days is
  running a policy nobody approved.
- **Never set a window shorter than the floor to force a same-week close.** If the
  business genuinely needs a decision in hours, that is a phone call from a named
  person, not a shorter countdown.

## Extension is a decision, not a setting

Extending a live offer is the recruiter's call and it is recorded as such — who
extended it, when, from what deadline to what deadline, and ideally why. Three
consequences follow.

First, an extension **re-dispatches**: the candidate is told the new date in the
same channel the original arrived in, because a deadline the candidate cannot see
change is not a deadline they can act on.

Second, an extension does not silently reset the pre-expiry nudge into a second
dunning message. Re-arm the nudge against the new deadline, but suppress it if the
extension itself already served as the reminder.

Third — and this is the rule that separates a correction from a re-send — **only a
material change to the terms restarts the clock.** A recruiter re-sending the same
offer verbatim (the candidate lost the email) gets an idempotent re-send: same link,
same deadline, reminder claim untouched. A recruiter who corrected the figure, the
currency or the start date is effectively re-extending, so the same live offer is
refreshed in place to the corrected terms, the window restarts and the reminder
re-arms. It must be the *same* link either way: minting a second live link for one
candidate and role means the binding page and the letter can disagree, and a
candidate can accept a number they were never sent. The refresh is conditional on
the offer still being live, so an offer accepted, declined or lapsed in the meantime
is never silently rewritten into different money.

Fourth, **an expired offer is not extended, it is re-issued.** Reviving a lapsed
offer by moving its date backfills a fiction into the record: the offer *was* over,
and a later reader deserves to see that it was over and that a person chose to
make a new one. The re-issue carries a fresh deadline and a fresh acceptance event,
which is also what any downstream headcount or start-date process needs.

## Say the date, not the duration

In every candidate-facing surface, express the deadline as an absolute date and
time with a named timezone — not as "you have 7 days". A duration is ambiguous
about its start (dispatch? read? the interview?), it invites arithmetic errors, and
it makes a diligent candidate compute the very thing you should be telling them.
The duration is the configuration; the date is the communication.

## Keying off the role, not the label

The window is selected from a stable role vocabulary — the seniority and hiring
class of the requisition — never from a board column's display string or a job
title's free text. Teams rename columns and invent titles; a rule that reads
"Senior" out of a title string will give a "Senior Barista" an executive window.
[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label).

## When not to use this

- **Verbal offers under active negotiation.** While terms are being agreed, the
  clock is on the negotiation, not on a document the candidate has not received.
  Start the window at dispatch of the final terms.
- **Contingent offers whose contingency has no date.** An offer gated on a
  background check or a visa decision should not carry a response deadline that can
  expire while the candidate is waiting on *you*. Either bound the contingency or
  pause the clock.
- **Internal transfers and rehires with a fixed organisational calendar.** The
  window there is set by the transfer cycle, and a role-derived default fights it.
