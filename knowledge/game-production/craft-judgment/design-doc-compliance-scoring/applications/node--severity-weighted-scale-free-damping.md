---
layer: application
type: application
subject: design-doc-compliance-scoring
technique: severity-weighted-scale-free-damping
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The gap-density damping curve in the PoF audit engine

## What it replaced

`src/lib/gdd-compliance.ts:502` records the prior penalty term literally:
`Math.min(gapCount * 2, 10)`. Three failures in one expression — it saturated at 10 points
(so five gaps and five hundred were the same number), it ignored severity entirely, and it
counted gaps rather than measuring density, so a module with eighty features looked worse
than one with eight at the same defect rate.

## The replacement

```ts
function gapDamping(gaps: ComplianceGap[], measuredRows: number): number {
  if (measuredRows === 0) return 1;
  const load = gaps
    .filter((g) => !g.resolved && !GAP_LOAD_EXCLUDED.has(g.category))
    .reduce((sum, g) => sum + GAP_SEVERITY_WEIGHT[g.severity], 0);
  return 1 / (1 + load / measuredRows);
}
```

The comment above it states each property and why it is required: "strictly decreasing, never
saturating (each additional gap always costs something), scale-free (six gaps over eight
features is worse than six over eighty), and asymptotic to 0 rather than reaching it, because
a score of exactly zero would claim certainty of total failure that gap counting cannot
support."

Note the `measuredRows === 0` guard returns `1`, not `0`: with nothing measured there is
nothing to damp, and the module is reported as unmeasured rather than as a zero.

## Severity weights

`GAP_SEVERITY_WEIGHT` at `src/lib/gdd-compliance.ts:485`:

| severity | weight |
| --- | --- |
| `critical` | 4 |
| `major` | 2 |
| `minor` | 1 |
| `info` | 0.25 |

`info` is deliberately near-zero rather than zero, with the stated reason that "a code-ahead
'implemented but not checked off' is bookkeeping, not non-conformance" — but a module drowning
in bookkeeping still registers.

## The double-punishment exclusion

`GAP_LOAD_EXCLUDED` (`:497`) removes `missing-feature`, `partial-implementation` and
`unmeasured` from the load, each with its pricing authority named in the comment: `missing`
already scores 0 credit in `calculateConformance`, `partial` already scores half, and
`unmeasured` is what `coverage` reports. The gaps are still emitted and still listed — the
partial-implementation gap at `src/lib/gdd-compliance.ts:249` was previously silent entirely,
and its comment states the principle exactly: "the gap exists to be visible, not to punish
twice."

Resolved gaps also leave the load (`!g.resolved`), while remaining attached to their module;
the report's headline counters at `:691` count only open gaps, which is what keeps
`criticalGaps <= totalGaps` true against the client-side transform.

## Deviation not lowered

The engine has no re-baselining discipline for the weights: changing `GAP_SEVERITY_WEIGHT`
would silently invalidate any stored historical comparison. The standard's rule — change
weights once and re-baseline the whole series — is not enforced here, and the standard stays.
