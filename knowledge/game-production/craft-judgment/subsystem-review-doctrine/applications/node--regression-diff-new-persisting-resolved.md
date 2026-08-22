---
layer: application
type: application
subject: subsystem-review-doctrine
technique: regression-diff-new-persisting-resolved
stack: node
status: forged
verified_on: 2026-08-20
---

# Diffing evaluator scans between runs

`PoF` implements the three-bucket diff in `src/lib/evaluator/regression-diff.ts` (133 lines,
no dependencies beyond the finding types). `diffScans(previous, current, opts)` returns a
`RegressionDiff` carrying the tagged current findings, the resolved prior findings, a status
lookup by id, and a `RegressionSummary` with per-severity counts for all three buckets.

## Line-insensitive identity

The comparison keys on `fingerprintFinding` from
`src/lib/evaluator/finding-collector.ts:212`:

```ts
const descKey = f.description.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 80).trim();
return `${f.moduleId}::${fileKey}::${descKey}`;      // line excluded by default
```

Module, file, and a case-folded, punctuation-stripped, 80-character description — no line
number. The file's own header comment states why: "so a finding that merely shifted lines
reads as persisting rather than churning into one resolved + one new."

The same function takes `{ includeLine: true }`, used at `finding-collector.ts:237` by the
within-run deduplicator that merges findings reported by several passes. That is the split the
technique calls for: **line-insensitive across runs, line-sensitive within a run**. The
deduplicator also keeps the higher severity on collision (`:242`), so merging never silently
downgrades.

## Scope restriction

The rule that prevents the flattering false result is `opts.scopeModuleIds`
(`regression-diff.ts:79`), documented as: "When only a subset of modules was re-evaluated,
restrict the comparison to those modules so untouched modules aren't falsely reported as
resolved." It filters the prior findings before the fingerprint sets are built:

```ts
const previousScoped = !previous ? [] : scope ? previous.filter((f) => scope.has(f.moduleId)) : previous;
```

One line. Without it, a partial re-scan of two modules would report every finding in the other
thirteen as resolved.

## The no-baseline case

`hasPrevious` is `previous != null`, distinguished from an empty array, which the JSDoc calls
out explicitly: "An empty array means a prior scan that found nothing." First scan and
clean-prior-scan are different states and stay different values, so the report can say
"not compared" rather than "all new".

## Where severity roll-up meets it

`src/lib/evaluator/combined-health.ts` carries the reporting half. `WEIGHTS` (`:44`) is the
base composite — 40% quality, 30% dependency health, 20% coverage, 10% activity — and
`WEIGHTS_WITH_JUDGE` (`:59`) reweights when content-judge verdicts exist: judged content takes
**25%**, carved from quality (40→30), dependency health (30→20) and coverage (20→15). The
comment names the failure it closes: "so a module can no longer read green while the judges
failed its produced content — the false-green the base composite was blind to."

`judgeDiscrepancy` (`:77`) is the single shared rule — matrix quality at or above 70 while any
fail verdict exists or the judged average is under 70 — returning a plain-language reason
(`"Feature-matrix quality reads healthy (82/100) but 2 of 5 content judgments failed."`). Its
docblock states the invariant: "shared by the composite and the badge so they never diverge."

## Deviations, standard unchanged

- **Resolved is one bucket.** `resolved` (`:96`) is every prior finding whose fingerprint is
  absent from the current run, with no check that the file or construct still exists.
  Resolved-by-deletion is folded into resolved-by-fix, which is exactly the inflation the
  technique warns about. `src/lib/evaluator/git-attribution.ts` holds the change data that
  would discriminate them; it is not wired into the diff.
- **No promotion of long-persisting findings.** Persisting counts accumulate with no path to an
  explicit accept-or-schedule decision, so a finding can persist indefinitely at no cost.
- **No instrument-change guard.** A changed prompt or model would show up as a spike in `new`
  with nothing in the data marking the run as a new baseline.
