---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: automation-ships-off-by-default
stack: node
status: forged
verified_on: 2026-08-20
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

The enforcement is not only the default. `screen-wave.ts:95` opens the keep-reason ladder
with `if (!cfg.autoRejectEnabled) return { reasonCode: "autoRejectOff" }`, and the
corresponding human-readable branch at `:118` returns `"auto-reject off"`. So with the
switch off, every candidate in the wave is recorded as kept *for that reason* — the
disabled state is a stated fact in the audit trail rather than an absence of events.

## The no-phantom-key rule

The calibration reserve was added later, and the way it was added is the reusable lesson.
`decision-config-schema.ts:36` declares the field as optional (`holdoutPercent?: number`)
and `:64` puts the default **outside** the persisted shape:

```ts
export const DEFAULT_HOLDOUT_PERCENT = 5;
```

with the reason written next to it: "Deliberately NOT a key in `SCREENING_DEFAULT`: the
persisted rule shape is pinned 'byte-identical, no phantom key' by the config tests, and a
saved rule from before the holdout existed must keep validating unchanged."

Resolution happens at the point of use, in `effectiveHoldoutPercent` (`:74`), and the
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
`decision-config-store.ts:88` re-runs it at the write boundary with the reason stated:
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
  decision scope and not at policy scope.
- **The enabled set is not reportable.** There is no query that answers "which teams
  currently permit unattended adverse action" — it would require reading every team's
  screening row and resolving each one.
- The standard's stronger reading is nonetheless met in practice further down the stack:
  even with the switch on, `screen-wave.ts` refuses to commit without an approval token
  echoed from a preview (`:283-286`), so the toggle enables a *proposal*, not an execution.
