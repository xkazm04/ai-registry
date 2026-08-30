---
layer: application
type: application
subject: content-drift-and-revision
technique: bounded-revision-history
stack: sql
status: forged
verified_on: 2026-08-30
verified_against: sql@3
---

# SQLite revision archive for pipeline artifacts (PoF)

PoF stores every produced pipeline step in SQLite through `src/lib/pipeline-artifacts-db.ts`.
The live table `pipeline_artifacts` is keyed `PRIMARY KEY (catalog_id, entity_id, step)` and
written by upsert, so before the archive existed *every re-produce destroyed what the step
previously held* — the DDL comment says exactly that. Gallery steps happened to survive
because they kept their candidate batches inside `data.genHistory`; a static step's prior
output was simply gone.

## The bound and its argument

```
export const MAX_REVISIONS = 20;   // pipeline-artifacts-db.ts:49
```

The comment is the reasoning the technique asks for, not a number: *"Bounded on purpose: the
history is a safety net for 'that re-produce made it worse', not an archive — and one row can
hold a produce body's full output, which is often 10-60× what any View renders."* Both halves
of the bound argument are present — the accident it insures against, and why unbounded is
expensive here specifically.

## Archive only on real content change

`contentChanged(prev, next)` (`pipeline-artifacts-db.ts:~135`) compares `data` and `ueAssets`
by `JSON.stringify` and is the gate on `archive()`. The comment names the failure it prevents:
*"A gate drain, a static-verify pass and a packaging verify all re-upsert the same `data` with
a new status/tier/reason — archiving those would bury the handful of real produce versions
under dozens of identical rows and make the history useless for the thing it exists for."*

This is the status-versus-content distinction landing inside the persistence layer, and it is
what makes the archive usable as a change oracle downstream.

## Archive + prune in one statement pair

```sql
INSERT INTO pipeline_artifact_revisions
  (catalog_id, entity_id, step, data, ue_assets, status, tier, reason, updated_at)
VALUES (@catalog_id, …, @updated_at);

DELETE FROM pipeline_artifact_revisions
WHERE catalog_id = ? AND entity_id = ? AND step = ? AND id NOT IN (
  SELECT id FROM pipeline_artifact_revisions
  WHERE catalog_id = ? AND entity_id = ? AND step = ?
  ORDER BY id DESC LIMIT ?          -- MAX_REVISIONS
);
```

Pruning is a `NOT IN (… ORDER BY id DESC LIMIT N)` anti-join executed on the same call path as
the insert — no background sweeper, so retention never depends on a job's health.
`idx_artifact_revisions_step (catalog_id, entity_id, step, id DESC)` makes both the prune and
the newest-first `listRevisions` read a seek rather than a scan.

The archived row carries two timestamps, and the DDL comment states why: `updated_at` is
*"when the archived version was WRITTEN (the live row's `updated_at`), not when it was
archived — the operator is choosing between versions by when each was made"*, while
`archived_at` defaults to `datetime('now')`.

## Restore, and what the archive proves

`GET /api/pipeline-artifacts/revisions?catalogId&entityId&step` lists them; `POST` with
`{ revisionId }` restores one through `getRevision` — restore is an operator action, not a
database exercise.

`GET /api/pipeline-artifacts/changes?catalogId&since=<ISO>` is where the bound becomes a
reportable basis. Its contract is stated in the route header:

- `revisionsSince > 0` — *"versions were archived after `since`, and a version is archived only
  when the content actually differed. That is PROOF the content changed, and how many times."*
- `revisionsSince === 0` — the live row was written after `since`, which also covers a drain, a
  verify pass, a re-produce with identical content, or a first write. The row therefore says
  **written**, never *changed*.
- `historyTruncated` + `cap: MAX_REVISIONS` — the step is at the cap, so the count is *"a
  FLOOR, not a total. The caller must say so."* The test at
  `src/__tests__/lib/pipeline-artifacts-changes-route.test.ts:56` churns a step 24 times and
  asserts `revisionsSince === MAX_REVISIONS` with truncation flagged.

The route also refuses a missing `since`: *"there is no digest without a baseline"* — a missing
stamp is not "everything changed". And because SQLite holds two timestamp formats here
(`datetime('now')` and ISO-8601), comparisons go through SQLite's own `datetime()` rather than
string comparison.

## Deletion is four tables, not one

`src/lib/catalog/artifact-purge.ts` lists the tables a produced step writes to — 
`pipeline_artifacts`, `pipeline_artifact_revisions`, `judge_verdicts`,
`judge_verdict_history` — once, in `PURGE_TABLES`, *"so a count and its delete can never
disagree about which tables are in scope"*. The prior implementation deleted only the live row
and reported `targets.length`, the number of rows it *attempted*; every field of `PurgeCounts`
is now a real `changes()`. Nothing in the module runs automatically: *"An operator may be
mid-investigation with the fixture rows on screen; the purge is an action they take, never a
boot-time sweep."*
