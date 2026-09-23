---
layer: application
type: application
subject: codebase-scanning
technique: sensor-pipeline
stack: node
verified_against: node@24
verified_on: 2026-09-23
---

# A repository scanner reported its own failed reads, and scored them as missing controls

A repository-maturity scanner gathers from a hosting platform through a set of
token-gated enrichments — pull requests, governance, an organisation's security
posture, the installed-App inventory, CI health, deployments — each wrapped in
its own `.catch`. The gather stage was tolerant in exactly the sense the
technique asks for: no single failed read took the scan down. And each catch
returned the pipeline's degraded value, which for most sensors was `null` or
`[]` — the same value a read that succeeded and found nothing returns.

## What the tolerant catch produced

The security checks below the gather stage read that value as absence. A
posture read that threw made the security-policy check publish score 0 with
the evidence "No security policy (SECURITY.md) found" and a remediation, for a
repository whose organisation-level policy the failed read would have found. A
failed App-inventory read floored the SAST and dependency-update checks at 0,
against the inventory type's own documented contract that `null` never means
"no Apps installed". The report was not smaller than it should have been; it
was louder, and wrong about the target.

One sensor already had the repair. A failed pull-request read set a flag that
became a persisted caveat, "a failed read, not a repository without pull
requests" — landed a week earlier, citing this subject's
failure-not-empty-success. The fix did not generalise because it was written
for the sensor, not for the stage.

## The repair, read at the tree on 2026-09-23

- **One recorder at every catch site** (`scan-ingest.ts`, `sensorFailed`). It
  returns the same degraded value the catch returned before — the pipeline's
  shape is unchanged — and adds the sensor id to a set. The set is read after
  the enrichments settle and ordered by a fixed sensor order, so the caveat
  text is stable across runs. The comment states the purpose: a new
  enrichment cannot be added with a silent `.catch(() => null)`.
- **The failure reaches the rules, not only the report.** Each posture check
  declares the sensor whose input could refute its zero
  (`security/checks.ts`). When that sensor is in the failed set and the check
  scored exactly 0, the result becomes `score: null` with evidence "not
  observable: <sensor> read failed" and is excluded from the weighted blend.
  The trigger is deliberately `score === 0`: a check that scored on evidence the
  failed sensor could not have supplied — a repository-local policy file, a
  committed analysis workflow — keeps its score.
- **A carried reading counts as read.** When an earlier scan's reading is
  carried forward in place of the failed one, the sensor is dropped from the
  failed set before scoring (`scan-score-input.ts`), so the carry is not
  punished for a failure it already repaired.
- **One caveat names the reads that failed**, in the same honesty channel as
  the older pull-request caveat, stating that the affected checks were
  excluded rather than scored zero (`scan-compose.ts`).

## Guards, and what they discriminate

The end-to-end suite (`scan-ingest.test.ts`) pins both sides of the boundary:
a posture read that throws yields a null security-policy score and the
"not observable" evidence; a read that ran and found no organisation policy
still scores 0 *with* its remediation; a read that found the policy still
scores 8; a read that succeeds with nothing to report, and an enrichment the
platform does not offer, are not failures. The discriminating pair is the
first two — a change that nulled every zero would pass the first and fail the
second.

## The residual, stated

The commit notes that the persisted scan record has no column for the failed
set, so only the prose caveat survives persistence; the typed list lives on
the in-memory report and whatever reads it in the same request (the
merge-gate route does). A later sweep therefore cannot compute "this sensor
has failed on every scan this month" from stored history — the longitudinal
half of the persist stage is still owed.
