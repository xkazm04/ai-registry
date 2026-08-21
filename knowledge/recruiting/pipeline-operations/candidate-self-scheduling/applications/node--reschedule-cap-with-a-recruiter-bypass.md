---
layer: application
type: application
subject: candidate-self-scheduling
technique: reschedule-cap-with-a-recruiter-bypass
stack: node
status: forged
verified_on: 2026-08-20
---

# One reschedule transaction, two actors (kp)

kp caps candidate self-reschedules and lets a recruiter repair a booking without
spending the candidate's budget — and it does both inside *one* function rather
than forking a parallel recruiter path. `rescheduleScheduleInvite`
(`app/_lib/schedule-store.ts:497`) is the whole mechanism, and the interesting
part is which lines are conditional on the actor and which are not.

## The actor is a parameter, not a second endpoint

```
opts?: { recruiter?: boolean }
```

The comment above it (`schedule-store.ts:503-509`) states the rule the technique
names: *"the MAX_RESCHEDULES cap exists to stop a CANDIDATE churning the
calendar; a recruiter repairing a booking is trusted, so `recruiter:true`
bypasses the cap AND does not consume the candidate's reschedule budget. The
collision authority and the reminder-cycle reset are identical — the recruiter
path layers on this same transaction rather than forking a parallel one."*

Exactly two lines vary by actor:

- `schedule-store.ts:517` — `if (!recruiter && inv.rescheduleCount >= MAX_RESCHEDULES) return { ok: false, reason: "limit" }`
- `schedule-store.ts:528` — `const countClause = recruiter ? "" : "reschedule_count = reschedule_count + 1,"`

Everything else — the SQLite transaction, the `slot_at` collision query, the
reminder-cycle reset, the clearing of stale proposal state — is shared. The
authority difference is expressed by *who may call with the flag*: the candidate
route (`app/api/schedule/[token]/route.ts:429`) never passes it, and every
`recruiter: true` call site is on the workspace-authenticated route
(`app/api/schedule/route.ts:169`, `:277`, `:308`).

## What does not spend the budget

kp gets the accounting right on three of the technique's four cases, and each is
a distinct line of code:

| Case | Where | Effect |
| --- | --- | --- |
| re-picking the same time | `schedule-store.ts:519-521` — `if (inv.slotAt === slotAt) return { ok: true, invite: inv }` | free no-op, returned *before* the counter clause |
| a failed attempt (`taken`, `not_confirmed`, `not_found`) | early returns at `:515-526` | the `UPDATE` never runs, so nothing increments |
| a recruiter move | `:528` | counter clause omitted |
| a first booking | `confirmScheduleInvite` (`:405`) is a different function | not a reschedule |

The comment on the same-slot short circuit is the honest one: *"the reschedule
count is precious"*. Because the increment lives in the same `UPDATE …
RETURNING *` as the new `slot_at`, inside `d.transaction(...)`, there is no
window where a budget is spent for a booking that did not land.

The collision query excludes the invite's own row (`:524`) so freeing the old
slot cannot be read as a clash against itself, and is scoped by `workspace_id`
so another team's calendar cannot block a booking.

## The cap routes to an escape hatch, not a wall

The cap is `MAX_RESCHEDULES = 3` (`schedule-store.ts:483`). The GET on the
candidate route derives two separate booleans from it (`route.ts:92`, `:96`):
`canReschedule` while budget remains, and `rescheduleCapReached` at zero — and
the second exists specifically so the page can render the escalation instead of
a dead end. The `POST` propose branch (`route.ts:216-235`) admits a candidate
only from the two genuine dead-ends:

```
const stuckPending = invite.status === "pending" && proposeSlots(bookedSlots(invite.workspaceId)).length === 0;
const stuckCapped  = invite.status === "confirmed" && invite.rescheduleCount >= MAX_RESCHEDULES;
```

A candidate with open slots is steered back to the picker with a `409` rather
than into a manual loop. The escalation itself is deliberately **wider** than
the offered grid: `proposedSlotFor` (`app/_lib/schedule-slots.ts:231`) accepts
*any* weekday minute inside `PROPOSAL_HOURS` `{ startHour: 8, endHour: 18 }`
(`:216`) rather than the two fixed offered times, and `schedule-slots.ts:197`
records why — *"the candidate reaches this path precisely because the offered
grid is exhausted"*. A proposal writes no booking: `setScheduleInviteProposals`
(`schedule-store.ts:668`) parks server-authored labels plus
`proposal_status = 'pending'` on the invite, and it never spends a reschedule
attempt. A recruiter later accepts one through `accept_proposal`
(`app/api/schedule/route.ts:290-320`), which re-validates the aged proposal and
books it through the *same* collision-checked transaction with recruiter
authority.

## Deviations from the standard

- **The cap is global, not per-invitation.** `MAX_RESCHEDULES` is a module
  constant; there is no per-invite column, so a recruiter cannot raise one
  candidate's budget without changing everyone's. The technique asks for the cap
  on the invitation.
- **The actor is not stored.** `reschedule_count` records how many
  candidate-initiated moves happened, but no column names *who* moved a booking,
  so "the candidate moved this three times" and "we moved it three times" are
  not separable on the row six months later. The bypass is an authority
  decision correctly made and then not written down.
- **The remaining balance is not surfaced.** The candidate route exposes only
  the booleans `canReschedule` / `rescheduleCapReached`, never the number left,
  so the cap reveals itself on exhaustion — the hidden-limit failure the
  technique warns about.
- **The exhausted-cap copy still points at the old dead end.** `route.ts:439-441`
  answers a `limit` reschedule with *"reply to your confirmation email and we'll
  help you find a slot"*, which is the very message the escalation was built to
  replace. The GET-driven surface offers the proposal form; this POST branch
  does not mention it.
