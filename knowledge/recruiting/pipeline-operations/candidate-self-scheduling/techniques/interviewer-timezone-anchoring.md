---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: interviewer-timezone-anchoring
status: forged
laws: [meaning-does-not-live-in-a-label, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [generating an offered slot grid, a candidate reports impossible times, validating a submitted booking across regions]
---

# Interviewer timezone anchoring

A slot's wall-clock identity is defined in **one** zone, declared explicitly, and
that zone is the interviewer's — not the server's, not the candidate's, and not
the browser's. Generation, business-hour arithmetic and validation all happen in
the anchor zone; only rendering happens in the candidate's.

## Why the interviewer's zone is the anchor

Every rule that shapes the grid is a fact about the interviewer's working life:
the day starts at nine, lunch is blocked, Friday afternoons are not offered,
this is a public holiday here, this is a weekend here. Those constraints have no
meaning in any other zone. Anchor elsewhere and you get contradictions that are
not bugs in the code but bugs in the premise — a "business day" that is Sunday
for the person who has to attend, or a "morning" that is the candidate's night.

That makes "the interviewer's" the default answer to a narrower question:
**which zone do the grid's constraints belong to?** For one interviewer on a
remote call, that is the interviewer. For an interview at a place, it is the
place: the room's building keeps the hours, and the location's zone is the
anchor even when the interviewer travels in from elsewhere. For a panel spread
across zones there is no single owner of the constraints (see the panel rule
below). What never changes is that the anchor is declared, named, and chosen
for a reason the interface can state.

The server's zone is the worst possible anchor and the most common accidental
one. It is an accident of deployment: it changes when infrastructure moves,
differs between a developer's machine and production, and represents nobody's
working hours. Code that computes an hour-of-day from a raw instant without
naming a zone has silently chosen this anchor.

## The incident this prevents

The characteristic failure has two symptoms that look unrelated and share one
cause. First, a mid-morning slot displays as pre-dawn to a candidate in another
region, because the picker renders in the browser's zone while the grid was
generated with hour arithmetic in the server's. Second, when the candidate picks
the local time that looks sensible to them, the submit handler rejects it as
"not an offered slot" — because the handler is doing its own hour arithmetic in
a third frame of reference.

The candidate's read of this is that the company cannot tell time, and the
distributed candidates — the ones you most need this feature to serve — are the
ones who hit it. Anchoring fixes both symptoms with one change, because both
symptoms are the same missing declaration.

## Procedure

1. **Store an explicit zone identifier on the invitation** — a named zone from
   the standard database, not an offset and not an abbreviation. Offsets do not
   survive daylight-saving transitions; abbreviations are ambiguous across
   regions.
2. **Generate the grid in that zone.** Every predicate — is this a business day,
   is this within working hours, does this cross lunch — evaluates against the
   local wall clock of the anchor zone.
3. **Transport instants, not wall clocks.** Slots cross the wire as unambiguous
   absolute instants. The wall clock is a *presentation* of an instant in a
   zone, and there are at least two presentations of every slot.
   **Store more than the instant.** A booking weeks out is an agreement about
   the anchor's wall clock, and the instant is derived from it under the zone
   rules current at booking. Zone rules change - a region drops or moves
   daylight saving - and the stored instant then points an hour away from what
   both people agreed. Keep the anchor wall-clock time and the zone name beside
   the instant. When they disagree after a rules update, the wall clock wins,
   the instant is re-derived, and both people are told if either one's local
   time moved.
4. **Render dual, both ways.** Show the candidate's local time as primary, the
   anchor zone secondary, and name both zones in words. Never make the
   candidate compute an offset; never show a bare time with no zone. The mirror
   serves the interviewer: their view shows the candidate's local hour beside
   their own, so a slot at the candidate's six in the morning is visible to the
   person who can move it. A zone abbreviation alone is not a zone name; the
   same three letters mean different places.
5. **Validate in the anchor zone**, using the same generator — not a
   re-implementation of the same rules in the validation path. One generator,
   two callers.
6. **Handle the transition weeks explicitly.** A slot generated before a
   daylight-saving change and booked after it must keep its wall-clock identity
   in the anchor zone, because that is what the interviewer's calendar means by
   "ten o'clock". Test the two transition weekends deliberately; they are where
   this silently breaks every year.
   Two cases need an explicit rule rather than a library default. A wall-clock
   time that **does not exist** on a spring-forward day is not generated at all.
   The common default resolves it by shifting it forward an hour, and a shifted
   slot is a time nobody offered. A wall-clock time that **occurs twice** on a
   fall-back day is resolved to one instant and shown with its offset. And the
   weeks when regions change clocks on different dates are their own test case:
   for two or three weeks a year the gap between the candidate's zone and the
   anchor is an hour off from the rest of the year, and a grid or a reminder
   that cached the usual offset is wrong for exactly those weeks.

## Decision rules

- **When hour-of-day, day-of-week or business-day arithmetic appears anywhere in
  this flow, a zone must appear in the same expression.** An unqualified
  arithmetic on an instant is a defect regardless of whether it currently
  produces the right answer.
- **When generation and validation both need the rules, share the generator.**
  Two implementations of "is this an offered slot" will diverge, and the
  divergence surfaces as a candidate being told their correct choice is invalid.
- **When a panel spans zones, evaluate each interviewer's constraints in their
  own zone, and name one zone for the round.** Generation is the intersection
  of each person's working hours, each evaluated on their own wall clock. The
  output is a set of instants, and none of them may be at another panelist's
  three in the morning. The round then carries one declared label zone, the
  organizer's or the location's, and the interface says which it is. Do not
  average zones. Do not evaluate the whole panel in the organizer's zone: that
  books the other panelists into their night. A slot's identity is its instant
  and the round's declared zone. Each panelist's own wall clock is only a
  rendering of it.
- **When the candidate's zone is unknown, render in the anchor zone and label it
  loudly** rather than guessing. A stated foreign time is honest; an unlabelled
  one is a trap.
- **When a candidate tells you the times looked wrong, believe them and check
  the anchor before checking anything else.** This class of report is almost
  never a misreading.

## When not to use this

Anchoring is not appropriate for the parts of the flow that are genuinely about
the candidate's clock rather than the interviewer's: deadline countdowns ("this
link expires in 48 hours"), reminder scheduling, and the courtesy warning that a
slot falls outside the candidate's own working hours all belong in the
candidate's zone. And for a genuinely asynchronous round with no live attendee,
there is no interviewer's working day to anchor to — anchor to the deadline's
declared zone instead, and still declare it.
