# Lens map - three measured lenses over the scan-sweep lens prose

Read from `SKILL.md` phase 2 (judgement). A lens-scan lens is a **measurement lens**:
it owns metric keys (see [metrics.md](metrics.md)). The judging prose - what to look
for, what a defect is - is scan-sweep's, by reference:
[scan-sweep lenses](../../scan-sweep/references/lenses.md). Read the sections named
below for the lens in scope, and only those.

| Lens | scan-sweep lenses it reads | Metrics their findings feed |
| --- | --- | --- |
| `development` | `code-optimizer`, `architecture-analyst`, `test-strategist`, `dependency-auditor`, `tech-debt-tracker`, `risk-assessor`, `devops-optimizer` | `dupSites`, `standardsPct`; context for `loc`, `depCount`, `testRatioPct`, `p50Ms`, `p95Ms` proposals |
| `security` | `security-auditor` | `findingsCritical`, `findingsHigh`, `findingsMedium`, `findingsLow`, `standardsPct`; false-positive review of `secretHits`, `unsafeSinks` |
| `design` (the UI/UX lens) | `ux-reviewer`, `accessibility-checker`, `mobile-specialist`, `error-handler`, `visual-craft` | `undesignedStates`, `standardsPct`; context for `axeViolations`, `rawLiterals`, `minTextPx`, `consoleErrors` proposals |

Every other scan-sweep lens is **out of scope for v1** (product, growth, docs,
onboarding, the challenge lenses, registry-conformance as a lens - conformance is what
`coverage` rows record here). A finding outside the map is not stored as a metric; if
it matters, name it in the report for another skill.

## Lenses with a scan block (1.2)

Any other lens in the map - a project lens, a temporary `tmp.<kebab>` lens, a built-in
the table above does not list - is measurable when its manifest declares
`scan: { method: 'judgement', instructions }` (or, from 1.3, composed `steps`:
[lens-manifest-scan.md](lens-manifest-scan.md)). It reads **no** scan-sweep lens: the
author's `instructions` are the whole judging prose, and the fields with a `metric`
block and a numeric type (`integer`, `number`, `percent`, `money`) are its metric keys.
`structure.mjs lens --id <id>` prints both. The three lenses in the table keep their
methods even when their manifest carries a scan block.

Such a lens also judges **impact**: a feature the instructions do not touch at all gets
no reading and a facet `applicable: false` with a one-line reason
(`structure.mjs facet`), so it reads `na` rather than a misleading `0`. A feature that
has the thing and no problems with it is touched, and its counts are `0`.

## How a judgement becomes a number

1. Read the feature's files once (scan-sweep's rule: reading is the expensive part).
2. Judge through each mapped lens, with the governing techniques and house lines from
   phase 0 in hand.
3. Each finding is a site with `file:line`. Count sites per metric key as the catalog
   defines it; the evidence column lists them.
4. Each technique or house line judged becomes one `coverage` row for the feature.
5. Write the counts with `method: judgement`. A lens that found nothing writes `0` for
   the counts it judged - that is a measurement - and nothing for counts it did not
   judge.

Judgement numbers drift with the reader. Keep them comparable: same lens sections,
same house lines, and a run note when the governing standard changed since the last
measurement.
