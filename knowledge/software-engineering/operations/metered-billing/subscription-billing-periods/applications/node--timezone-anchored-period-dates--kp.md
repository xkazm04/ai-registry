---
layer: application
type: application
subject: subscription-billing-periods
technique: timezone-anchored-period-dates
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# One boundary, one day: the label was the second resolver

The stack version comes from the tree's own `package.json` `engines` field, which pins
Node `>=24.0.0 <25.0.0`. The tree is xkazm04/kp, a public hiring application, at
`988d54e22` before the change and `97c25de52` / `f3e3f243b` after it. Its billing keys a
monthly allowance on the subscription's anchor and renders that window on a settings
page in three places: the plan card, each usage meter row and the spend panel.

## Where the technique's shape is in this tree

kp is the technique's single-zone branch. It has no per-subscriber zone field and never
had one. Every boundary is computed in UTC on purpose. The anchored window keeps the
anchor's own time of day, not midnight:
`app/_lib/billing/plans.ts:186` "anchor.getUTCHours(), anchor.getUTCMinutes()". The
question "do the paid end and the allowance reset fall on different days" is answered
in UTC too: `app/features/settings/billing/meterForecast.ts:85` "const day = (iso: string) => new Date(iso).toISOString().slice(0, 10)".
So the arithmetic already followed the rule: one declared frame and no ambient zone.

The label did not follow it. Before the change, the card built its date with
`{ dateStyle: "long" }` and no zone, because UTC was opt-in through a `utc` flag, and
the paid-period end was rendered without that flag. A browser fills a missing zone with
the viewer's own zone. The meter row and the spend panel already passed
`timeZone: "UTC"` for the same reset instant. That made two resolvers for one
vocabulary on one page. The ambient one was the one shown to the customer.

## The paired proof

Seam chosen to falsify. The obvious reading was that a UTC boundary drawn in the
viewer's zone only matters at midnight, and only for viewers west of UTC. That would
have made the defect a narrow calendar-fallback edge case. A caught outcome would have
cut the technique's "never read an ambient zone" rule down to a midnight-only note. That
is not what happened. The anchored window keeps the subscription's time of day, so
viewers east of UTC split late-evening resets too.

- **Measurable.** Count the boundary × viewer pairs where the card names a different
  calendar day from the meter row for the same instant. Boundaries: four anchored
  resets (03:12Z, 22:40Z, 12:00Z on a month end, 23:30Z on a year end) and two
  calendar fallbacks at 00:00Z. Viewers: UTC, Prague, Los Angeles, Auckland, Tokyo.
  That gives n = 30.
- **Calibrated first.** One known-bad pair (03:12Z seen from Los Angeles) has to
  disagree, and one known-good pair (the same instant seen from UTC) has to agree.
  Both separated before anything was read.
- **A** (the card's old options): **9 / 30**. **B** (`boundaryDateOptions`, a single
  `BOUNDARY_ZONE = "UTC"` that every label reads): **0 / 30**. Pinned at
  `app/features/settings/billing/boundaryLabelZone.test.ts:58` "assert.equal(mismatches(ARM_A_CARD, METER_ROW_OLD), 9);"
  and `app/features/settings/billing/boundaryLabelZone.test.ts:62` "assert.equal(mismatches(boundaryDateOptions(".
- **Floor.** Declared before the run: the meter row's day must not change, UTC viewers
  must see no change, `planDatesView` verdicts must not change, and the unit suite
  must stay green. Result: 30 / 30 meter-row days were identical, the unit suite ran
  13,922 tests green, and typecheck was clean. The project's pre-push gate (a full
  build) passed.

## What the tree shows about the technique

- **"Label from the boundary, never beside it" fails at the zone as well as the
  string.** Each label here was interpolated from the boundary instant the meter used.
  None was typed by hand. They still disagreed, because a formatter is a second
  zone resolver whenever its options may omit the zone. The fix is not a label.
  It is to give the formatter's zone a single owner
  (`app/features/settings/billing/meterForecast.ts:96` "export const BOUNDARY_ZONE =").
  The technique's "has one implementation" property covers the label path too, not
  only the event selection.
- **Declaring one zone is a commitment in the view as well as the store.** The
  technique says a product that bills everyone in one zone should declare it. kp did,
  in its arithmetic. The view inherited the browser's default only because the
  declaration was a value passed at some call sites and not a module everything
  imports.
- **Event times are out of scope, as the technique says.** The alerts panel still shows
  an alert's `createdAt` in the viewer's zone. That is an instant something happened,
  not a period boundary, and the "When not to use it" list already excludes it.

## What this realization cannot do

It does not give a subscriber their own midnight. kp has no subscriber zone, so a
customer in Los Angeles now reads every boundary as a UTC date. That date is consistent
across the page, but it can be one day off from their wall calendar near midnight UTC.
The pricing copy and the window computation already define the frame as UTC, so the
label matches the contract. Moving to per-subscriber periods would need the technique's
full resolution chain and a persisted resolved zone, and none of that exists here.
