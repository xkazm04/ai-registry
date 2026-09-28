---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: organisation-baseline-with-a-team-override
stack: react
status: forged
verified_on: 2026-09-28
verified_against: react@19
applied: code
ab_verdict: better
---

# The settings screen over a two-tier policy: a rules modal that shows one tier and writes another

The node application of this technique covers the store: one table, two partial indexes,
one cascade resolver. This one covers the screen that edits it:
`app/features/hiring/decisions/DecisionsRulesModal.tsx` (a React 19 client component in a
Next.js app). It is the operator's only editor for the automated-rejection switch and the
two numbers beside it. Read at one pinned commit of the consumer on 2026-09-26, and
re-read on 2026-09-28 when the first and third deviations below were fixed in the tree.

## What the screen gets right

**A failed read is never shown as the policy.** `decisionsRulesLoad.ts` names the defect
it replaced: a failed or empty config read used to resolve to the shipped defaults, so the
screen "showed the DEFAULT auto-reject thresholds as if they were the workspace's live
rules, and a save would have written them over the real ones". `readScreeningRule`
returns `null` unless the payload carries the three edited fields with the right types.
The modal then renders an alert with a retry, and disables Save while
`loadFailed !== null`. The server side draws the same distinction: an unreadable stored row
is recorded with its tier in a health ledger instead of reverting silently. So "nobody
decided" and "we could not read what somebody decided" stay two facts from the database
to the pixel.

**The loader refuses to invent keys.** `readScreeningRule` spreads the payload over
`SCREENING_DEFAULT`, which deliberately has no `holdoutPercent` and no `familyFloors`.
A workspace that never set them saves a rule that still omits them. The no-phantom-key
rule the schema tests pin therefore survives a round trip through the UI. This is where a
settings form usually breaks it.

**The policy is stated as a sentence, and the sentence includes the overrides.** Under the
inputs, the modal renders the rule in plain English. `ruleSentence` reads "Reject the
bottom {pct}% of a role's matched candidates whose match is also below {max}".
`ruleFamilyAppend` names every per-family floor in force, because "the saved per-family
overrides ARE in effect at screening ... so the plain-English rule must name them instead
of implying the single global floor governs every family". That is the golden path's
one-screen, non-engineer test met for this phase. The family values are read-only chips
that link to the calibration view where each one was derived. The number and its
derivation live on one screen, and the modal cannot overwrite either.

## Deviations

- **The screen showed one tier and wrote another (fixed 2026-09-28).** `GET /api/decisions/config` returns
  each phase through the cascade: this team's row, else the organisation row, else the
  code default. `save()` POSTed `{ phase, config }` with no `scope`, and the route mapped an
  absent scope to `"org"`. The calibration panel's apply-threshold route writes the same
  phase through `updateDecisionConfig(..., ws, "team")`, which materialises a full team
  row from the effective config. After one calibration apply, the workspace resolves to
  that team row, and every later save from this modal lands on the organisation row
  underneath it. A simulation of the tree's own SQL and merge rules walked three cases:
  - with no calibration apply ever made, unticking auto-reject turns it off;
  - after one apply, unticking it saves `false` to the organisation row while the
    workspace keeps running with `true`;
  - after one apply, lowering the global floor from 45 to 30 leaves the workspace at 45.

  After such a save the modal re-syncs from the response and shows the unchanged team
  values beside "Saved". This is the deviation the technique's new decision rule names:
  an editor writes the tier it displays. The fix is in the store, not the screen. An
  absent scope now means `"shown"`, which `setDecisionConfig` resolves under the write
  lock to the team row if one exists, else the organisation row. The same fix covers the
  jurisdiction picker, which also sent no scope. An explicit `"org"` or `"team"` is
  unchanged.
- **No provenance on the screen.** Nothing marks a value as inherited or overridden, or
  says which tier the screen is editing. The store's `updated_at` is the only stamp, and
  the modal never shows it. The technique's step 5 has no surface here. The fix above makes
  this deviation matter more. After a calibration apply, the screen edits that team's row,
  and nothing on it says that a save no longer reaches the organisation baseline.
- **The concurrency token was served and not used (fixed 2026-09-28).** The route returns `versions` beside
  `configs` so a client can echo `expectedUpdatedAt`, and the store checks it under an
  IMMEDIATE transaction. The modal did not send it, and the route reads a missing token
  as "a server-side writer with no read behind it", so two operators saving the auto-reject
  rules from this screen produced a last-write-wins lost update. The modal now keeps
  `versions.screening` from each read and each landed save (`readScreeningVersion`) and
  echoes it as `expectedUpdatedAt`. On `DECISION_CONFIG_STALE` it shows the refusal and
  re-reads, so the operator makes the change again against the rules now in force.

## Applied

Code, 2026-09-28, recorded in `librarian/applied.md`. The editor-writes-the-tier-it-shows
half of B is now the tree. A store test drives the three writes in order: an organisation
baseline, a calibration apply's full team row, and the screen's untick. It asserts that the
workspace stops auto-rejecting, the applied family floor survives, and another team's
inherited baseline is untouched. It fails against the old organisation default. Against a
clean checkout of the consumer, the unit suite shows the same 22 pre-existing failures with
and without the change, and no new ones. The delta half of B is still unapplied: the
calibration apply still copies the whole effective config into the team row, so that team
stops inheriting later baseline changes.

Simulation, 2026-09-26, recorded in `librarian/applied.md`. The three cases above were
walked under A (the tree: a cascade read, an organisation-scope write from the editor, a
full-row team write from calibration) and B (the technique: the editor writes the tier it
displays, and a team row stores only its delta). B keeps all three right. A gets cases 2
and 3 wrong. The switch that ends applications stays on after the operator turned it off,
and the screen reports the save as done. **Falsifier:** a production workspace that never
ran a calibration apply cannot reach case 2. The defect is conditional on that route
having been used once, which the tree cannot tell from the store alone.
