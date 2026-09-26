---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: organisation-baseline-with-a-team-override
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# Two policy tiers in one SQLite table

`app/_lib/decision-config-store.ts` holds the whole tiering in a single table and two
partial indexes. The comment at `:96` states the model:

> Tenant tiers (P2 — the dual-tier shared policy): a config row is either ORG-DEFAULT
> (workspace_id NULL — the company baseline every team inherits) or a TEAM OVERRIDE
> (workspace_id = team).

```sql
CREATE TABLE IF NOT EXISTS decision_config (
  phase TEXT NOT NULL, config_json TEXT NOT NULL, updated_at TEXT NOT NULL, workspace_id TEXT
);
CREATE UNIQUE INDEX uq_decision_config_org  ON decision_config (phase) WHERE workspace_id IS NULL;
CREATE UNIQUE INDEX uq_decision_config_team ON decision_config (phase, workspace_id) WHERE workspace_id IS NOT NULL;
```

The two partial indexes are what make the baseline's identity a schema fact rather than a
convention: exactly one org-default row per phase can exist, and one override per
(phase, team). The migration path (`:108-119`) rebuilds a pre-tier table by moving its rows
to `workspace_id NULL` — the old single-org policy *becomes* the baseline, which is the
correct direction, since the alternative would have promoted one team's settings to the
company's.

`getDecisionConfig` (`:126`) is the one resolver every reader calls:

```sql
SELECT config_json, workspace_id FROM decision_config
 WHERE phase = ? AND (workspace_id = ? OR workspace_id IS NULL)
 ORDER BY (workspace_id IS NULL) ASC LIMIT 1
```

The team row sorts ahead of the org row, and the winner is merged over the code default
(`{ ...fallback, ...JSON.parse(row.config_json) }`). A parse failure returns the code
default rather than throwing, so policy reads never fail the caller. Since 2026-08-20 the
failure is no longer silent: `workspace_id` comes back with the payload so the store can
record which tier went dark ("an org baseline going dark is a different incident from one
team's override going dark"), in a health ledger beside the fallback.

## Omission is not erasure

The strongest thing in this module is `:242-250`. The screening row is written wholesale,
and the rules interface predates the per-family floors field, so it simply omits the key.
Rather than letting a stale client silently clear a set of overrides, the write carries
them forward:

> omission means "no opinion", not "clear the overrides". When the validated config carries
> no `familyFloors` and THIS TIER's stored row does, carry them forward. An EXPLICIT
> `familyFloors: {}` still clears (the validator keeps an empty present map), so clearing
> stays expressible.

"THIS TIER's stored row" is the load-bearing qualifier: the carry-forward reads the row at
the same scope being written, so a team's wholesale write cannot inherit and then re-persist
the org's overrides as its own.

By 2026-09-26 the rule had been reused. The compliance phase gained an optional
`interviewRecordingOffered`, and its only writer, a jurisdiction picker that sends
`{ jurisdiction }` alone, would have withdrawn the recording offer on every jurisdiction
change. The store carries it forward the same way ("the SAME rule, and for the same
reason, as familyFloors above"), and an explicit `false` still clears it. A third optional
field will need a third copy. The rule is written per field, not once over the phase's
optional keys.

## Role-family overrides live inside the baseline

The occupational variation is not a third tier. `decision-config-schema.ts:33` adds
`familyFloors?: Record<string, number>` inside the screening rule, keyed by the slugs in
`role-families.ts` — sixteen families spanning clinical, trades, frontline, finance and
professional work, deliberately opened past the original three technical families so
non-technical workforces are representable "instead of collapsing to
`software_engineering`". `effectiveFloor` (`:53`) is the resolution rule:

```ts
export function effectiveFloor(cfg: ScreeningRule, roleFamily: string | null | undefined): number {
  const override = roleFamily && cfg.familyFloors ? cfg.familyFloors[roleFamily] : undefined;
  return typeof override === "number" && Number.isFinite(override) ? override : cfg.maxMatchToReject;
}
```

Pure and total, and it fails to the baseline exactly as the standard requires: "A null /
unknown family, or a family with no override, always resolves to the global value." The
motivating gap is stated at `:22-24` — per-family reliability was measurable and a
per-family recommendation computable, "but the screening floor used to be a single GLOBAL
knob — so the per-family view could only inform, never act."

## Deviations

- **The team override is a full row, not a sparse delta.** The cascade selects one row and
  merges it over the *code* default, never over the org-default row. So a team that
  overrode anything in a phase stops inheriting that phase entirely: a later change to the
  company baseline reaches every team except the ones that deviated — which are precisely
  the teams a policy change most needs to reach. The standard's sparse-delta requirement
  stands; this is the fragmentation-by-copy failure in its milder, one-level form.
  Re-verified 2026-09-26, and the copy now has a writer that makes it. The calibration
  apply writes through `updateDecisionConfig(..., ws, "team")`, whose `current` for a team
  write is the *effective* config. The first apply therefore materialises the whole
  organisation baseline into a team row, plus one family floor. Nobody chose to fork the
  policy; accepting one recommendation did it.
- **Two writers of one phase write two different tiers.** The config route maps an absent
  `scope` to `"org"`, and the rules screen sends none. The calibration apply writes
  `"team"`. After the first apply, the screen's saves land under a row that shadows them.
  The react application walks the three cases, including the auto-reject switch that stays
  on after it is turned off.
- **Provenance exists for some writes only.** The config row still carries `updated_at`
  and no actor or previous value, and no surface distinguishes an inherited value from an
  overridden one. A floor applied from calibration is the exception: it seals a
  `screening_threshold_adjusted` record with the signed-in human, the previous and new
  threshold, and the evidence. The deviation set is still not queryable from the store.
- **The `updated_at` stamp is now a concurrency token.** It is strictly increasing, resolved
  through the same cascade as the read, and re-asserted under an IMMEDIATE transaction
  when a writer echoes it. That closes lost updates for writers that send it. The rules
  screen does not.
- **Nothing is baseline-only, and there is no ratchet.** Any phase, including the automation
  posture, is overridable at team scope, and a family floor may be set on either side of
  the global one. The validator bounds each value 0–100 independently and does not compare
  them. The standard asks for a declared non-overridable set, and for any change that
  enlarges the population exposed to automated rejection to need the stronger review.
  Here that is a *raised* `maxMatchToReject`, because candidates below it are rejected.
- **The derivation lives in the seal, not beside the value.** A family floor applied from
  calibration seals its basis: the score band, the advance rate, `n` and the overall `n`.
  The stored config holds the bare number. A per-occupation bar can be defended by joining
  the value to its latest `screening_threshold_adjusted` record. A floor typed in any other
  way has no basis anywhere.
