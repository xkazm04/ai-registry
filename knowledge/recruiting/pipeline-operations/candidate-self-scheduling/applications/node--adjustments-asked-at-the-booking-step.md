---
layer: application
type: application
subject: candidate-self-scheduling
technique: adjustments-asked-at-the-booking-step
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The booking step in a hiring app that asks nothing (kp)

Walked at kp `20d0a8db3` on 2026-09-28 (Next.js on Node 24, SQLite). Policy A is
this subject's golden path as it stood before the technique: a trust boundary,
an anchor zone, no dead end, and honest endings. Policy B is the technique.

kp is a good test because it already does A well. Its offered grid is
validated structurally, its escape hatch exists and is wider than the grid, and
its endings are kept apart. A certifies every path below.

## The instrument

A search of the tree for any adjustment ask, before or at scheduling:
`accommodation`, `reasonable adjust`, `access needs` and `adjustments` across
`app/`, `messages/` and `pipeline/`. The positive control, `formatSlotForLetter`,
was found in `app/_lib/comms-dispatch.ts`. The only matches are UI craft
comments (a voice component whose static text "is the accommodation" for
reduced motion), the interview-kit validator's truncation set, and the proposal
decline copy ("couldn't accommodate the times you suggested"). No candidate-facing
string asks about adjustments, and nothing earlier in the funnel does either.

## Three real paths

**1. The invitation letter.** `dispatchScheduleInvite`
(`app/_lib/comms-dispatch.ts:847`) sends `comms.scheduleInvite.body`: *"Good
news. We'd like to talk about {role}. Pick an interview time that suits you
here: {link} The same link lets you reschedule later if something comes up."*,
plus the length when one is set. A passes it, because delivery and content
belong to the communication subject, and the letter carries a working link and
a reschedule route. B fails it twice. It does not say what the round involves
beyond a length (live or not, video or audio, a timed exercise or not), and it
asks nothing. Under the US guidance this ask is lawful. Under the UK guidance
it is expected, and this letter is where the ask belongs.

**2. A candidate whose need changes the slot's shape.** Take a candidate who
needs thirty extra minutes, or only mornings, or a captioner. The picker offers
two fixed times of the configured length. The propose form (`ProposeSection.tsx`)
takes up to three weekday times between 08:00 and 18:00 (`MAX_PROPOSALS = 3`,
`PROPOSAL_HOURS`, `schedule-slots.ts:260-263`), and it has no free-text field,
because proposal labels are server-minted and *"never candidate text"*
(`schedule-store.ts:83`). A passes: the hatch exists and is wider than the grid.
B fails: nothing on the page can carry the need, and the only way to state it is
a reply to the email, sent to whoever sent it. No route leads outside the
assessing panel, and nothing can make the slot longer. The only way to book a
longer slot is a recruiter using the grid.

**3. The confirmation.** `comms.interviewConfirmation.normal` says *"If you need
to change the time, just reply and we'll sort it out."* A passes: a human route
exists for a change. B fails the ask again. The reply route is offered for a
*time* change, and a candidate who needs a different format has to reinterpret
it. If their need moves the booking, it also runs into the reschedule budget's
view of a candidate-initiated move (`MAX_RESCHEDULES = 3`, global).

**Tally:** B finds a gap on 3 of 3 real paths that A certifies. The verdict is
`better` in the sense this ledger uses for a simulation: the new rule sees a
failure the old one passes, on real paths, with an instrument that found its
positive control.

**Falsifier:** an adjustment ask delivered to the candidate before the booking
step by some other route: the job posting, the application form, the
application acknowledgement, or an out-of-band recruiter call script. The tree
search found none. A recruiter's call script outside the tree would falsify
path 1 and not paths 2 and 3.

## Return condition for code

One neutral, optional line in the invitation letter and on the booking page,
with a free-text field and a reply route. The answer is stored as a process fact
on the invitation, visible to the scheduling recruiter and absent from every
scoring surface. A booking made to honour it is a recruiter move that spends no
budget, and the invitation does not expire while the request is open. The copy
lands in all four message catalogues (`messages/en.json`, `cs`, `de`, `fr`).
Return when the kp tree is quiet: at this reading a sibling session had
uncommitted work in its pipeline and store modules.
