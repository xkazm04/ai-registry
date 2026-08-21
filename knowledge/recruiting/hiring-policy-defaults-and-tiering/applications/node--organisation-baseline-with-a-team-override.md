---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: organisation-baseline-with-a-team-override
stack: node
status: forged
---

# Two policy tiers in one SQLite table

`app/_lib/decision-config-store.ts` holds the whole tiering in a single table and two
partial indexes. The comment at `:41` states the model:

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
(phase, team). The migration path (`:53-63`) rebuilds a pre-tier table by moving its rows
to `workspace_id NULL` — the old single-org policy *becomes* the baseline, which is the
correct direction, since the alternative would have promoted one team's settings to the
company's.

`getDecisionConfig` (`:71`) is the one resolver every reader calls:

```sql
SELECT config_json FROM decision_config
 WHERE phase = ? AND (workspace_id = ? OR workspace_id IS NULL)
 ORDER BY (workspace_id IS NULL) ASC LIMIT 1
```

The team row sorts ahead of the org row, and the winner is merged over the code default
(`{ ...fallback, ...JSON.parse(row.config_json) }`). A parse failure returns the code
default rather than throwing — policy reads never fail the caller.

## Omission is not erasure

The strongest thing in this module is `:100-110`. The screening row is written wholesale,
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

## Role-family overrides live inside the baseline

The occupational variation is not a third tier. `decision-config-schema.ts:33` adds
`familyFloors?: Record<string, number>` inside the screening rule, keyed by the slugs in
`role-families.ts` — sixteen families spanning clinical, trades, frontline, finance and
professional work, deliberately opened past the original three technical families so
non-technical workforces are representable "instead of collapsing to
`software_engineering`". `effectiveFloor` (`:49`) is the resolution rule:

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
- **No provenance on a value.** Nothing records who wrote a config or what the previous
  value was (`updated_at` only), and no surface distinguishes an inherited value from an
  overridden one, so the deviation set is not queryable and cannot be reviewed.
- **Nothing is baseline-only, and there is no ratchet.** Any phase, including the automation
  posture, is overridable at team scope, and a family floor may be set more permissive than
  the global one — the validator bounds each value 0–100 independently but does not compare
  them. The standard asks for a declared non-overridable set and for safety values to move
  in one direction only.
- **No derivation is stored with a family override.** The value is persisted without the
  sample, period or reasoning it came from, so a per-occupation bar cannot be defended by
  the record alone.
