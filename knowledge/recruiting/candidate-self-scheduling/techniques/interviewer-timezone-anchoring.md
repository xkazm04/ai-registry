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
4. **Render dual.** Show the candidate's local time as primary, the anchor zone
   secondary, and name both zones in words. Never make the candidate compute an
   offset; never show a bare time with no zone.
5. **Validate in the anchor zone**, using the same generator — not a
   re-implementation of the same rules in the validation path. One generator,
   two callers.
6. **Handle the transition weeks explicitly.** A slot generated before a
   daylight-saving change and booked after it must keep its wall-clock identity
   in the anchor zone, because that is what the interviewer's calendar means by
   "ten o'clock". Test the two transition weekends deliberately; they are where
   this silently breaks every year.

## Decision rules

- **When hour-of-day, day-of-week or business-day arithmetic appears anywhere in
  this flow, a zone must appear in the same expression.** An unqualified
  arithmetic on an instant is a defect regardless of whether it currently
  produces the right answer.
- **When generation and validation both need the rules, share the generator.**
  Two implementations of "is this an offered slot" will diverge, and the
  divergence surfaces as a candidate being told their correct choice is invalid.
- **When a panel spans zones, anchor to the round's owning interviewer** (or the
  organizer) and say so in the interface. Do not average zones and do not switch
  anchors per interviewer; a slot with two identities has none.
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
