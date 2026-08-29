---
layer: application
type: application
subject: self-healing
technique: incident-promotion
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# "Louder, not quieter" is a sort order (React)

*Verified against the project tree at `bf2a1e249`.*

The technique's sentence with teeth is short: *a healer that keeps failing must
get louder over time, not quieter.* In a promoted-incident inbox that sentence
cashes out as an ordering, and an ordering is a function with a fall-through
arm.

## The seam

`src/features/overview/sub_incidents/libs/incidentTaxonomy.ts:60`:

```ts
export function severityRank(severity: string): number {
  switch (severity) {
    case 'critical': return 4;
    ...
    case 'low': return 1;
    default: return 0;
  }
}
```

Rank 0 is below `low`. `useIncidentLedger.ts:64` sorts the ledger by that rank
descending, so an incident whose severity the promoter could not classify sits
under every classified row on the surface whose job is to report it.

The interesting part is that the same token gets four different answers in the
same file. `severityBadgeClass` (`:57`) painted it `medium`.
`severityShapeStatus` (`:79`) shaped it `neutral`. `severityUrgencyLabel`
(`:95`) read it out to the user as "low". `severityRank` sorted it below `low`.
Four defaults, four directions, none of them agreeing, and each one individually
defensible at the moment it was typed.

## A and B

**A**: the four independent fall-through arms above.

**B**: one door. `UNCLASSIFIED_RANK = 5` sits above `critical`; the badge falls
through to `SEVERITY_COLORS.critical`; the shape falls through to `error`; the
urgency label falls through to the critical reading. The four classified rungs
(`critical`, `high`, `medium`, `low`) become explicit cases in every one of
those functions, so `low` keeps its own quiet treatment instead of riding the
same arm as the unknown. `isUnclassifiedSeverity` is exported as the marker that
keeps the loud default honest — the row is at the top because nobody could read
it, not because its content is critical. Thirty-two lines changed in one file,
most of them the comment explaining why.

## What was read

A unit test asserting three things: an unclassified token outranks `low` and
matches `critical`; its paint and shape match `critical`'s; and the four
classified rungs keep their existing relative order. Under A the first two fail
(`severityRank('sev1')` is 0, less than `severityRank('low')`; the badge returns
the warning palette where critical was expected). Under B all three pass, and
the 233 tests in the overview feature plus `tsc --noEmit` stay green.

## The structural fact, which is negative

The half of this technique that matters most could not be tested here, and the
reason is structural rather than incidental.

The technique says the incident is keyed by the mode, not the moment. This
tree's promoted-incident row is keyed by the moment, and says so in its own
generated doc comment: `dedup_key = "{source_table}:{source_id}"` is UNIQUE, and
callers use `INSERT OR IGNORE`
(`src/lib/bindings/AuditIncident.ts:5-8`). That key makes promotion idempotent
under *replay* — re-promoting the same source row is a no-op, which is one of
the technique's decision rules satisfied exactly. It does nothing at all for
*recurrence*: a hundred occurrences of one failure mode are a hundred source
rows, so a hundred incidents, none of which knows about the others.

And the ingredients for the missing axis are already present and unused. The
same binding carries `kind`, "a short machine token describing the incident
class (e.g. `tool_error`, `credential_decrypt_failure`)" — a coarse signature by
any other name — used only for icon mapping and i18n lookup. The one module in
the tree that could group by it, `libs/groupIncidents.ts`, offers agent,
severity, source and none, has no signature dimension, and — checked across
`src/` — has no caller: only its `IncidentGroup` type is imported. So the tree
holds a signature token nothing groups by and a grouping module nothing calls.
Nobody designed that arrangement; it is what a promotion layer looks like when
dedup was solved for the scan and never for the failure mode.

## What this cannot do or prove

The A/B moved the loudness rule and nothing else. It does not deduplicate
anything, does not count recurrence, does not carry the machine's notebook onto
the incident, and does not measure promotion latency. Under a failure storm the
change arguably makes the inbox *worse* before better: if a broken producer
starts emitting an unrecognised severity token at volume, every one of those
rows now sorts above the genuinely critical ones — the technique's own caveat
(if a large fraction of items land at the top by default, the ladder has stopped
measuring risk and started measuring the parser) applies here with no cap and no
meta-incident to spell the overflow.

It also cannot prove the sort is the thing operators read. That the ledger sorts
by rank is verified; that an operator triages top-down from the ledger rather
than from the KPI header or the autonomous lane is an assumption this run did
not test, and the instrument that would settle it — per-row open-rate telemetry
against ledger position — does not exist in the tree.
