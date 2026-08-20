---
layer: application
type: application
subject: knowledge-registry
technique: per-contributor-aggregation
stack: node
verified_on: 2026-08-19
---

# The usage lane — one file per installation, aggregated into the catalog

How this registry realizes per-contributor aggregation, end to end.

## The lane

```
usage/<contributor>.json
```

```json
{
  "schema": "rkb-usage/1",
  "contributor": "dev-box",
  "app": "personas",
  "generatedAt": "2026-08-19T12:00:00Z",
  "windowDays": 30,
  "skills": { "ci-gate-check": { "invokes": 41, "lastUsed": "2026-08-18T09:14:00Z" } }
}
```

Specified in `docs/usage-lane.md`, gated by `scripts/check-usage.mjs`, aggregated
by `scripts/build-catalog.mjs` into each catalog skill entry's `invokes30d` plus
a `usageContributors` list.

## What the gate enforces, and why each rule is there

`scripts/check-usage.mjs` fails on:

| Rule | The failure it prevents |
| --- | --- |
| `contributor` must equal the filename stem | Two installations both declaring `team-a` in different files, double-counting |
| No key outside the specified set | A per-project breakdown smuggled in as an extra field |
| Path-, URL- and address-shaped values, scanned over the RAW text | A leaked absolute path becoming permanent in a public history |
| `invokes` a non-negative integer | A negative or fractional count silently skewing the aggregate |
| Schema id and ISO timestamps | A file from a future format read as if it were this one |

The privacy rules scan the raw text rather than the parsed object, so a leak in
an unexpected place is caught even though unknown keys are already rejected.

A count for a skill the registry does not publish is a **note, not a failure** —
it is dropped from the aggregate, and dropping it silently would be the worse
outcome.

Fault-injected on introduction: valid file aggregates; Windows path, POSIX path,
email address, contributor/filename mismatch, negative count and an extra
top-level key each fail; the unknown-skill case warns.

## The producer shapes out the leak

The contributing side is a command that reads a 30-day window from a local event
table and writes the file. The privacy rule is enforced by the **query's shape**:

```sql
SELECT skill_name, COUNT(*), MAX(occurred_at)
  FROM skill_usage_events
 WHERE event = 'invoke' AND occurred_at >= datetime('now', ?1)
 GROUP BY skill_name
```

Grouping by the skill alone drops the project identifier on the floor. There is
no per-project row to leak, so the rule cannot be forgotten by the next person
editing the file.

The identity rule is enforced by construction too: the contributor id is
slugified and the **filename is derived from the result**, so an unnormalized id
cannot produce a file the gate then rejects. `slugify` returns nothing rather
than a default when nothing usable survives — a fallback like the tool's own name
is exactly how two installations would collide on one filename.

## The piggyback

The producer only writes the file. Committing it is the job of the task that was
already committing something else — the share of a reusable instruction into the
registry — so counts never earn a commit of their own.

Writing is best-effort: a failure drops the piggyback and the share proceeds.
Failing to contribute telemetry must never block publishing content. The
instruction that performs the commit branches on whether a usage file was
actually written, because an instruction to commit a file that does not exist
would fail the commit and take the share down with it.

## The aggregate is derived, and says so

`build-catalog.mjs` recomputes `invokes30d` on every run, so hand-editing it in
the catalog is overwritten — which is the point. `usageContributors` sits beside
it so a reader can tell *nobody reports on this* from *nobody uses this*: a zero
with an empty contributor list means the lane has no witness.

The catalog's own note previously claimed those counts were hand-seeded. That
stopped being true when the aggregation landed, and a reader taking the note at
its word would have discounted a real number as a placeholder — the note is now
corrected to name which producer owns which field.
