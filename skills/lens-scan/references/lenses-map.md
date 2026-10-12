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
