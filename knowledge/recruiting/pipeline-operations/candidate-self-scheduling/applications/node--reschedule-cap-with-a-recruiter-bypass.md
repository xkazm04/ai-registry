---
layer: application
type: application
subject: candidate-self-scheduling
technique: reschedule-cap-with-a-recruiter-bypass
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
---

# One reschedule transaction, two actors (kp)

Re-read at kp `20d0a8db3` on 2026-09-28 (Next.js on Node 24, SQLite). The first
reading (2026-08-20) cited lines that have all moved. One deviation has closed
since then (the balance is now shown), and the rest still hold.

kp caps candidate self-reschedules and lets a recruiter repair a booking without
spending the candidate's budget, and it does both inside *one* function rather
than forking a parallel recruiter path. `rescheduleScheduleInvite`
(`app/_lib/schedule-store.ts:561`) is the whole mechanism, and the interesting
part is which lines are conditional on the actor and which are not.

## The actor is a parameter, not a second endpoint

```
opts?: { recruiter?: boolean }
```

The comment above it (`schedule-store.ts:566-571`) states the rule the technique
names: *"the MAX_RESCHEDULES cap exists to stop a CANDIDATE churning the
calendar; a recruiter repairing a booking is trusted, so `recruiter:true`
bypasses the cap AND does not consume the candidate's reschedule budget. The
collision authority and the reminder-cycle reset are identical — the recruiter
path layers on this same transaction rather than forking a parallel one."*

Exactly two lines vary by actor:

- `schedule-store.ts:581`: `if (!recruiter && inv.rescheduleCount >= MAX_RESCHEDULES) return { ok: false, reason: "limit", invite: inv };`
- `schedule-store.ts:591`: `const countClause = recruiter ? "" : "reschedule_count = reschedule_count + 1,"`

Everything else is shared: the SQLite transaction (now `tx.immediate()`, `:614`),
the collision check, the reminder-cycle reset, and the clearing of stale proposal
state. The authority difference is expressed by *who may call with the flag*.
The candidate route (`app/api/schedule/[token]/route.ts:496`) never passes it,
and every `recruiter: true` call site is on the workspace-authenticated route
(`app/api/schedule/route.ts:248`, `:368`, `:415`).

## What does not spend the budget

kp gets the accounting right on four of the technique's six cases, and each is
a distinct line of code:

| Case | Where | Effect |
| --- | --- | --- |
| re-picking the same time | `schedule-store.ts:584`: `if (inv.slotAt === slotAt) return { ok: true, invite: inv }` | free no-op, returned *before* the counter clause |
| a failed attempt (`taken`, `not_confirmed`, `not_found`) | early returns at `:578-589`, plus `:611` | the `UPDATE` never runs, or matches no row, so nothing increments |
| a recruiter move | `:591` | counter clause omitted |
| a first booking | `confirmScheduleInvite` (`:434`) is a different function | not a reschedule |

The comment on the same-slot short circuit is the honest one (`:582`): *"the
reschedule count is precious"*. Since the first reading the `UPDATE` has
tightened. It now matches only `WHERE token = ? AND status = 'confirmed' AND
reschedule_count = ?` (`:601`), so a concurrent move that already spent the
budget makes this one match zero rows and return `taken` (`:611`). The count
read and the count written are the same row version, so two tabs cannot both
spend the last attempt.

The collision check is now `otherBookingsNear` (`schedule-store.ts:403-419`,
called at `:588`). It excludes the invite's own row and is scoped by workspace
(`token != ? AND workspace_id = ?`, `:409`). Since 671d424e1 it tests a
real-duration overlap through `bookingCollides` instead of `slot_at` equality,
so a booking of any length collides with every slot it overlaps, not only
with one that starts at the same minute.

## The cap routes to an escape hatch, not a wall

The cap is `MAX_RESCHEDULES = 3` (`schedule-store.ts:547`). The GET on the
candidate route derives two booleans from it (`[token]/route.ts:115`, `:119`):
`canReschedule` while budget remains, and `rescheduleCapReached` at zero. The
second exists so the page can render the escalation instead of a dead end. The
`POST` propose branch (`[token]/route.ts:246-284`) admits a candidate only from
the two genuine dead ends:

```
stuckPending: proposeFreeSlots(bookedIntervals(...), ...) is empty   (:263-272)
stuckCapped:  invite.status === "confirmed" && invite.rescheduleCount >= MAX_RESCHEDULES   (:273)
```

A candidate with open slots is steered back to the picker with
`SCHEDULE_SLOTS_STILL_OPEN` (409, `:275`). The escalation is **wider** than the
offered grid, though not as wide as the technique asks. `proposedSlotFor`
(`app/_lib/schedule-slots.ts:275`) accepts any weekday minute inside
`PROPOSAL_HOURS` `{ startHour: 8, endHour: 18 }` (`:260`) rather than the two
fixed offered times, and `schedule-slots.ts:252-253` records why: *"the
candidate reaches this path precisely because the offered grid is exhausted"*.
A proposal writes no booking. `setScheduleInviteProposals` (`schedule-store.ts:739`)
parks server-authored labels plus `proposal_status = 'pending'` (`:744`), and it
never spends a reschedule attempt. A recruiter accepts one through
`accept_proposal` (`app/api/schedule/route.ts:378-452`). Since the first reading
that path refuses an inactive pipeline entry (`:390-395`), re-checks free/busy
(`:407-412`), and seals the decision with a recruiter actor (`:440-448`) before
booking through the *same* collision-checked transaction.

## Deviations from the standard

- **Closed since 2026-08-20: the remaining balance is surfaced.** The GET returns
  `reschedulesRemaining` (`[token]/route.ts:172`, helper `:43-46`), POST
  responses carry it (`:518`, `:543`), and `BookedCard.tsx:131-133` renders
  "{n} changes left". The new edge: it renders unconditionally, so a capped
  candidate reads "0 changes left" next to the proposal form. The technique now
  says the counter gives way to the route at zero.
- **The cap is global, not per-invitation.** Still true. `MAX_RESCHEDULES` is a
  module constant (`:547`), and the table has only `reschedule_count` (`:64`).
  No cap column exists in the schema or its migrations (`:24-131`).
- **The actor is not stored.** Still true on the row, and partly recorded
  elsewhere. `schedule_invites` has no actor column. Seals carry
  `actor: "human:recruiter"` for grid book, accept_proposal, cancel, no_show and
  decline_proposals, but the recruiter `reschedule` action
  (`app/api/schedule/route.ts:348-377`) seals nothing, and neither does a
  candidate reschedule. `pipeline_events.actor` exists, but the schedule callers
  pass no opts, so it stays NULL. "The candidate moved this three times" and "we
  moved it three times" are still not separable on the record.
- **The exhausted-cap refusal still points at the old dead end.** The POST now
  answers a `limit` with a code, `SCHEDULE_RESCHEDULE_LIMIT` (409,
  `[token]/route.ts:502`), and the code's English text is still *"Reply to your
  confirmation email and we'll help you find a slot."* The client's 409 handler
  (`use-schedule-invite.ts:189-198`) refreshes slots but not `capReached`, so the
  proposal form appears only after a reload. The store's own docblock (`:545`)
  still promises that "the email's 'just reply' path takes over". The GET-driven
  surface is right, and the refusal that actually meets the candidate at the
  cap is not.
- **No lead-time cutoff.** Nothing stops a candidate moving a confirmed booking
  an hour before it starts. The only lead-time logic in the flow is the
  short-notice rule for reminders (`isShortNoticeBooking`,
  `[token]/route.ts:412-413`). The technique's condition names the cutoff as the
  control that limits the late moves the cap exists for.
- **The escape hatch is weekday working hours with no free text.** It is wider
  than the grid's two times, but `PROPOSAL_HOURS` is 08:00-18:00 on weekdays
  and the form carries only up to three times (`MAX_PROPOSALS = 3`, `:263`). An
  evening, a weekend, or a constraint in words ("only after my shift") cannot be
  proposed.
- **A pending proposal does not hold the invite open.** `isScheduleInviteExpired`
  (`schedule-slots.ts:67-79`) reads `status`, `createdAt` and the cancel-reopen
  stamp, never `proposalStatus`. A candidate stuck on an empty grid proposes
  times, is told *"You can close this page"*, and the link expires on day seven
  while the proposal waits. The technique's decision rule is "when the
  invitation would expire while a proposal is open, extend it". The function has
  seven callers, and `candidate-next-action.ts:54` duplicates its anchor.
