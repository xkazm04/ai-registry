---
layer: application
type: application
subject: plan-review
technique: informational-fold-in
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19.2
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# React — a cycle-time forecast folded into the plan pane, with one scope it does not state

The realization is a milestone plan pane in a desktop app: the pane a person already
opens to read a milestone's brief and scope ledger carries one caption line, "typical
cycle: N days from cut to ship, across K shipped", and for the milestone being viewed a
forecast ship date. It was read at commit `63a1703a4e` of the consuming tree;
`verified_against` is the React range its `package.json` declares (`^19.2.6`).

## What the four constraints confirm

The tree is a good fold-in, and the sentences below are checkable rather than assumed.

- **A field, not a step.** The line is rendered inside the pane header
  (`src/features/notepad/plan/NotePlanPane.tsx:155` "ShipVelocityNote rows="); the only
  gate on this surface, the ship confirm, is a separate component that carries none of
  the figure (`ShipCertifyModal.tsx` "certify_criteria_summary" shows criteria met, not
  the forecast).
- **No verdict.** The late marker is a coloured span beside the date
  (`src/features/notepad/plan/ShipVelocityNote.tsx:44` "forecast.late && forecast.targetDate"); nothing branches
  on it, and the confirm does not read it. The accretion path starts exactly there, at
  the threshold colour, and it has not taken the next step.
- **Unavailable below the evidence bar.** With fewer than two observed cycles the
  derivation returns null (`src/lib/milestone/shipVelocity.ts:119` "cycles.length <
  MIN_SAMPLES") and the pane prints a sentence saying so
  (`src/features/notepad/plan/ShipVelocityNote.tsx:26` "velocity_no_history"), not zero and not the last value.
- **The predicate travels.** "Across K shipped" carries the sample size and "from cut to
  ship" carries the interval; the median-not-mean rule is in the derivation's header.
- A shipped milestone renders nothing at all
  (`src/features/notepad/plan/ShipVelocityNote.tsx:21` "vm.status === 'shipped'"). That is the loud-absence rule
  satisfied by a different route: a shipped milestone has an actual date elsewhere on the
  page, so the forecast slot is not unavailable, it is superseded.

## The seam chosen to falsify it

The question was whether "unavailable is a state" holds on every path out of the
derivation, because the first path (too little history) is the one a test names and the
others are where a field quietly disappears. The derivation computes one forecast, for
the next unshipped milestone (`src/lib/milestone/shipVelocity.ts:105` "export function nextUnshipped"),
and the component keeps it only when it matches the milestone on screen
(`src/features/notepad/plan/ShipVelocityNote.tsx:30` "velocity.forecast?.milestoneId === vm.id"). The pane is
opened per milestone through a linked note, so any note linked to a later planned
milestone is a third path.

An existing test pair plus a scratch probe, run and deleted, built four rows: two shipped
(10 and 12 days), one active, one planned behind it. The derivation returned a forecast
for the active milestone (median 11 days, sample 2). The probe asserted that the
forecast's milestone is the active one and is not the planned one, and passed. For a
note linked to the planned milestone the component therefore renders the cycle sentence
alone: no forecast, no marker, no sentence saying this milestone has none. Nothing in
the pane distinguishes that from a milestone the forecast would have covered. The
finding held against the technique only partly: the tree gets the project-wide state
right and the item-scoped state wrong. A caught outcome would have taught nothing new
about the rule; this one taught its scope, which is now a paragraph in the technique.

## What this does not show

No render ran: the pane was read, and the derivation was executed, but no component test
mounted the note for the planned milestone, so the visible result is inferred from the
branch at line 30 and not observed. The fix is a one-line fallback ("no forecast for this
milestone; the next to ship is X") that needs a new string in thirteen locale files and
the generated types, in a checkout with unrelated edits, so it was filed rather than
shipped. The instrument that would turn this into a verdict is a mounted-component test
over the four-row fixture asserting a visible no-forecast state for the planned
milestone.

## What the realization cannot do

It cannot tell a reviewer whether the forecast is right. Two shipped milestones clear the
evidence bar, and a median of two is the average of both, so the "typical" figure is
as thin as the bar allows; the sentence prints the sample size, which is the whole of the
protection. It also has no retained forecast to compare against the eventual ship date,
so nothing here measures the figure's error, which is the calibration use the technique's
retention section allows for.
