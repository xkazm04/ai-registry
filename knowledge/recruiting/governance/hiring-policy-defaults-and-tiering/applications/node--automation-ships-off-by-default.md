---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: automation-ships-off-by-default
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The shipped screening rule in a TypeScript policy module

`app/_lib/decision-config-schema.ts` is the single source of the decision-rule contract —
deliberately dependency-free (no `better-sqlite3`, no `@/` aliases) so the validator loads
in the Node test runner and in the browser bundle alike. Both the persistence layer
(`decision-config-store.ts`) and the route boundary (`api/decisions/config`) validate
through it, and `screen-wave.ts` reads its policy from it.

## The default that matters

`decision-config-schema.ts:58`:

```ts
export const SCREENING_DEFAULT: ScreeningRule = {
  autoRejectEnabled: false,
  rejectBottomPercent: 20,
  maxMatchToReject: 45,
};
```

Automated rejection ships **disabled**. The comment above the type (`:18-20`) states the
posture in one line — "Off by default (opt-in), like the automation clock" — and the two
numbers beside it are inert until someone flips the boolean, which is the shape the
standard asks for: an organisation must actively turn on the ability to reject people
unattended.

The enforcement is not only the default. `screen-wave.ts:58` opens the keep-reason ladder
with `if (!cfg.autoRejectEnabled) return { reasonCode: "autoRejectOff" }`, and the
corresponding human-readable branch at `:85` returns `"auto-reject off"`. So with the
switch off, every candidate in the wave is recorded as kept *for that reason* — the
disabled state is a stated fact in the audit trail rather than an absence of events.

## The no-phantom-key rule

The calibration reserve was added later, and the way it was added is the reusable lesson.
`decision-config-schema.ts:46` declares the field as optional (`holdoutPercent?: number`)
and `:69` puts the default **outside** the persisted shape:

```ts
export const DEFAULT_HOLDOUT_PERCENT = 5;
```

with the reason written next to it: "Deliberately NOT a key in `SCREENING_DEFAULT`: the
persisted rule shape is pinned 'byte-identical, no phantom key' by the config tests, and a
saved rule from before the holdout existed must keep validating unchanged."

Resolution happens at the point of use, in `effectiveHoldoutPercent` (`:75`), and the
function encodes all three states the standard asks for:

- **absent or null** → `DEFAULT_HOLDOUT_PERCENT`, so an old saved rule still gets a clean
  arm;
- **explicit `0`** → disabled, "which is how a workspace opts out" — an opt-out that
  required someone to type it;
- **non-finite or negative** → `0`, because "a malformed config must never spare an
  unbounded share of a wave".

That last clamp is the direction-of-safety point made concrete: this control fails closed
*downward*, the opposite of a confidence floor, because sparing candidates from a wave is
the action this setting causes. The upper bound is applied in the same expression
(`Math.min(100, raw)`).

## Bounds as policy, not as validation hygiene

`validateDecisionConfig` clamps and range-checks every numeric field 0–100, and
`decision-config-store.ts:234` re-runs it at the write boundary with the reason stated:
"never persist an unvalidated config, no matter the caller ... enforcing the schema HERE —
at the actual write boundary — guarantees a bad write can't slip into `runScreenWave`'s
math through any other path". `screen-wave.ts` then validates the per-run override a third
time (`validateScreeningOverride`) before merging it into the config that drives
irreversible auto-rejections, "at the actual destructive operation". Three enforcement
points for one invariant, each justified by the caller it does not trust — the same
defense-in-depth posture the fairness-gate subject applies to the reject path.

## Deviations

- **There is no recorded act of enablement.** Flipping `autoRejectEnabled` to `true` is an
  ordinary config write: `setDecisionConfig` stores `config_json` and `updated_at`, with no
  actor column and no acknowledgement of what is being turned on in outcome terms. The
  standard asks for actor, previous value and an outcome-phrased confirmation; the repo has
  the safe default and the timestamp, and stops there. The decision *records* the wave
  produces do name their approver (`inputs.approvedBy`), so the accountability exists at
  decision scope and not at policy scope. Re-verified 2026-09-26: the numbers now have a
  recorded act, and the switch still does not. A floor applied from the calibration panel
  (`api/analytics/calibration/apply-threshold`) seals a policy-change record that names the
  signed-in human. The auto-reject boolean is still written by the rules screen as an
  ordinary save.
- **The off position does not survive a team row.** The rules screen writes the
  organisation tier. The calibration apply writes a full team row, and that row shadows the
  organisation row for the workspace. After one apply, turning the switch off from the
  screen changes the organisation row and leaves the workspace running with auto-reject on
  (see the react application of the baseline technique, which walks it). The shipped
  default is safe. The path back to it is not.
- **The enabled set is not reportable.** There is no query that answers "which teams
  currently permit unattended adverse action" — it would require reading every team's
  screening row and resolving each one.
- A stored row that will not parse falls back to the code default, where the switch is
  off, so the revert fails closed for this capability. Since 2026-08-20 the revert is no
  longer silent: `decision-config-store.ts` records it with its tier in a health ledger
  (`getDecisionConfigHealth`). The same fallback still resets the thresholds and family
  floors the operator set, and the ledger is what tells anyone that happened.
- The standard's stronger reading is nonetheless met in practice further down the stack:
  even with the switch on, `screen-wave.ts` refuses to commit without an approval token
  echoed from a preview (`:276-290`), so the toggle enables a *proposal*, not an execution.

## Applied

Simulation, 2026-09-26, recorded in `librarian/applied.md`. The subject is the knockout
condition the technique gained on this date. The seam is outside the screening rule.
Both public apply routes reject an applicant whose knockout answers are not all
explicitly `true` (`failedKoStepIds` in `app/_lib/apply-intake.ts`, called from
`app/api/apply/[id]/route.ts` and the quick-apply route). The questions come from the
job's own script: `ko_auth` on every job, `ko_mode` when the job declares a work mode,
and `ko_lang` when it declares languages. The three questions were walked under A and B.
A is the absolute as first written: auto-reject ships off, always. B is the condition: a
statutory question is a constraint; a declared, objective knockout is its own capability,
ships unwritten, and owes a stated job-relatedness, a notice and a route to a person.

- `ko_auth` (right to work). A sees an automated rejection that ships on in every job,
  which is a violation. B sees a statutory constraint, which is correct as shipped.
- `ko_mode` (on-site, hybrid or remote). A: a violation. B: authored through a field the
  recruiter set, so it is acceptable as written, but the decline owes the candidate a
  route. The candidate reads "this role isn't the right fit right now", which names no
  gate and offers no person.
- `ko_lang` (required languages). A: a violation. B: the same route gap, plus the
  missing job-relatedness. A language requirement is where a knockout most easily becomes
  a national-origin proxy, and nothing beside the job's language field says why the role
  needs it.

A returns one verdict for three different things, and that verdict is wrong for the
first. B separates them and finds two actionable gaps. Every decline is already audited:
an entry-less `ko_declined` event names the role and the gate. **Falsifier:** a knockout
in this tree that reads a score, a parsed CV or an inferred attribute. Under B that is the
table's last row and would have to ship off. None was found in the apply routes.
