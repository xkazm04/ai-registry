---
layer: application
type: application
subject: application-intake-and-conversion
technique: recoverable-decline-and-no-dead-ends
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
---

# An audited decline that mints no row, and a gate that is still the last word (Node route handlers)

A knockout failure on any apply door goes to one audit function and creates
no pipeline entry. That half of the technique is built deliberately and well.
The other half is not built: a person never sees the decision, and the
candidate is never told which gate declined them.

**Re-checked 2026-10-31 at kp@6edf5d7. The tree has since closed part of what
this application lists as open, and that reverses two of its deviations.**
ADR `0019-the-knockout-decline-is-automatic-and-says-so` landed the change:

- **The failed gate is now named to the candidate.** Both doors return
  `failedKoNames` with the decline (`route.ts:278-284`,
  `quick/route.ts:192-195`), and both decline screens render them through the
  shared `ApplyDeclineDetail` (`app/apply/[id]/ApplyDeclineDetail.tsx`). The
  screen says the decision was automatic and how to ask a person to review it.
  The webhook letter's "One of the role's eligibility requirements isn't met" is
  gone. `koDecline.body` (`en.json:577-581`) lists the must-haves, says "A person
  did not make this decision", and offers "reply to this message and a person
  will review it". That deviation is resolved.
- **The notice now goes out at every door.** `dispatchKnockoutDecline`
  (`app/_lib/comms-dispatch.ts:644-681`) is sent whenever an address is in hand:
  from the lead core (`lead-intake.ts:136-165`, where `notifyDecline` is now
  `@deprecated No effect`) and from the conversational door
  (`route.ts:259-277`). The quick form therefore shows the decline on screen
  *and* sends the email. "One notice, on the channel the candidate watches"
  below no longer describes the tree.
- **The gate is still the last word, but it is no longer final.** There is
  still no hold state and nobody sees the decision before the candidate does.
  A person can now be reached afterwards by replying to the letter. That is a
  route to human review after the decision, not the hold the technique asks for,
  so the deviation narrows and does not close.
- **The contactless claim now has a time limit.** The `ko_declined` event still
  records no address. The decline letter keeps the address, the name and the
  letter for `KO_DECLINE_CONTACT_RETENTION_DAYS = 30` (`pipeline.ts:3442-3445`),
  and the letter tells the applicant so.

Still as described: no actor on the audit event, no correction trail, and no
onward option.

## Audited, entry-less, and deliberately contactless

`recordKnockoutDecline` (`app/_lib/db/pipeline.ts:3447`, rationale at
`:3425-3441`) writes a `ko_declined` event with no entry. The event carries the
applicant's display name, the role, the channel, and which gates failed.
The reasons, from the comment:

- **No entry, on purpose:** "a mis-tapped eligibility toggle must not mint a
  terminal row the candidate can never retry past".
- **A record anyway:** "without this the discard vanished without a trace".
- **No contact address:** "no entry was created, so no deliverable identity
  should be retained for a declined applicant".
- **Required tenant:** omitting it would zero every other team's
  turned-away metric.

The conversational door calls it at `app/api/apply/[id]/route.ts:250`, and the
lead core behind the quick form and the webhooks at
`app/_lib/lead-intake.ts:127`. This is the technique's "a standalone audit event
that does not mint a pipeline record", and the retention clock of a full
application never starts.

## One notice, on the channel the candidate watches

The lead core sends a decline email only when the caller asks for one
(`lead-intake.ts:136`). Only the inbound webhooks do (`app/_lib/inbound-lead.ts:151`),
because their candidate's only touchpoint said "submitted" on someone else's
board. The quick form shows the decline live and sends nothing, so there is
no double notice for one event.

## Recovery: in place on one door, an announced restart on the other

- **Quick form.** The decline card's "Try again" is `setDone(null)`
  (`app/apply/[id]/quick/QuickApplyForm.tsx:215`). The form re-renders with the
  name, email and every toggle still held. That is the technique's standard.
- **Conversational door.** The decline's recovery is "Start over"
  (`app/apply/[id]/ApplyDoneCard.tsx:47-57`), and it says so first:
  "Your earlier answers weren't kept, so you'll enter them fresh"
  (`messages/en.json:2334`). The behaviour is pinned by
  `candidate-door-conversion.test.ts:136`. For a script of eight to eleven
  steps this meets the technique's stated minimum, not its standard.

## Deviations

- **The gate is the last word.** There is no hold state and no human review.
  A failed knockout on either own door ends the application, and nobody is
  shown the decision before the candidate is. The technique's machine
  outcomes are proceed and hold, with a decline only as a recommendation
  parked for a person. Under the technique's own jurisdiction note this is
  stricter than U.S. law requires. It is not stricter than an EU deployment
  would need.
- **Unclassifiable is decline, not hold, on the own doors.** The strict
  server rule turns an absent answer into a fail. That is right for the
  eligibility technique's trust boundary, and it collides with this
  technique's "ambiguity resolves to hold". The collision is survivable only
  because the forms never post an incomplete answer set.
- **No actor on the audit event.** The `recordEvent` call passes none, where
  other automation in the tree marks itself `auto:`. The technique asks for
  the automated gate to be named as the actor.
- **No correction trail.** Neither the declared answer nor a later
  correction is kept or linked. A pattern of corrections at one gate, which
  the technique reads as a signal about the question, cannot be seen.
- **The failed gate is never named to the candidate.** The screen says
  "Based on your answers this role isn't the right fit right now"
  (`en.json:2238`), and the webhook email says "One of the role's eligibility
  requirements isn't met" (`en.json:578`). The server holds the failed ids and
  returns them only to the integrator on the webhook path. The technique's
  "what would change the answer" is unreachable without them.
- **No real onward option.** There are no other open roles and no talent
  pool, only "we'd welcome a future application". That is honest, since
  nothing is promised that does not exist, and it is also empty-handed.
