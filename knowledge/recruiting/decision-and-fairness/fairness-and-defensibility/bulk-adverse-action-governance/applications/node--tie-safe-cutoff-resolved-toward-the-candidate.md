---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: tie-safe-cutoff-resolved-toward-the-candidate
stack: node
status: forged
verified_on: 2026-08-20
---

# A tie-safe bottom-slice cutoff in two pure functions

The cutoff for a screening auto-reject wave is computed by two exported pure functions in
`app/_lib/decision-config-schema.ts`, called in sequence from `app/_lib/screen-wave.ts`.
Keeping them pure and outside the wave is what makes both decisions unit-testable and
re-derivable from the scores alone.

## Step 1 — the window size

`decision-config-schema.ts:777`:

```ts
export function screenBottomCount(cohortSize: number, rejectBottomPercent: number): number {
  if (cohortSize <= 0 || rejectBottomPercent <= 0) return 0;
  return Math.max(1, Math.floor((cohortSize * rejectBottomPercent) / 100));
}
```

The header comment at `:753` records the decision and the two rejected alternatives:
`ceil` was "too aggressive (it adds a candidate to large pools too)", and plain `round`
"still rounds the smallest pools (n≤2 @ 20%) to zero, leaving the bug". The bug being
targeted is the silent exemption — the old plain `Math.floor` made the default 20% over a
cohort of 4 come to `floor(0.8) = 0`, so small roles were exempt from an automation the
recruiter had explicitly enabled. The floor of 1 is bounded by the fact that the selected
candidate is still only rejected if they also fall below the match floor, so a
strong-but-small pool rejects nobody.

## Step 2 — never split a tie

`decision-config-schema.ts:816`:

```ts
let b = bottomCount;
while (b > 0 && sortedScoresAsc[b - 1] === sortedScoresAsc[b]) b -= 1;
return b;
```

The cutoff sits between index `b-1` (last rejected) and `b` (first kept); while those two
share a score the boundary is inside a tied run, so it walks **down** to the run's lower
edge and the entire tied group lands on the keep side. The comment at `:783` states the
rationale in the standard's own terms: the ascending sort is JavaScript's stable sort, so
a straddling tie "would be split purely by pipeline ARRIVAL ORDER — one candidate
auto-rejected, an indistinguishable peer kept, with no merit-based or documented reason",
which is "indefensible for an irreversible automated rejection and makes the boundary
non-reproducible from the scores". Expanding the window instead was **explicitly rejected
as over-eager** — it would auto-reject candidates the configured percentage never
selected, purely because they tied with someone below the cutoff. Candidates strictly
below the tied run are unaffected.

The function is total: `bottomCount <= 0 → 0`, `bottomCount >= length → length`.

## Where they meet the wave

`screen-wave.ts:226-236`. `screenBottomCount` runs over `n = sorted.length`, the **scored**
cohort only (`screen-wave.ts:218`) — a percentage of candidates who can be ranked, not of
a pool padded with unmeasured people — and `tieSafeBottomCount` receives
`sorted.map(e => e.matchScore)`, genuine scores by construction because the null-score
policy at `:209` excluded the unscored before ranking. No fabricated zero can form a tie
or occupy the boundary.

## Making the shrink visible

- A candidate inside the raw window but outside the tie-safe one is flagged `tieSpared`
  (`screen-wave.ts:314`) and receives the byte-pinned keep reason `"tie at cutoff — kept
  so equal scores aren't split"` (`screen-wave.ts:112`, checked before the plain "above
  the bottom cutoff" branch precisely so the audit trail says *why* they were above the
  effective cutoff).
- Every reject rationale reports the effective count and, when it was shrunk, the raw one:
  `" (tie-adjusted from {bottomCount} so no equal score is split)"`
  (`screen-wave.ts:359-364`), with `tieAdjusted` carried in `reasonParams` for localized
  rendering. The shortfall therefore reads as a decision rather than a defect.
- The per-candidate floor is the *effective* one — a role-family override or the global
  value (`decision-config-schema.ts:53`, applied at `screen-wave.ts:262`) — and the
  sealed record's `policyVersion` carries that resolved number
  (`screen-wave.ts:399-401`), so the audit trail "can never claim a floor the wave didn't
  use".

## Deviations

- **Comparison precision is exact equality on the stored number.** Scores here are
  integers, so displayed and compared precision coincide today; nothing pins that
  invariant, and a fractional score would let a visible tie split on an invisible
  difference.
- **No insufficient-sample disclosure.** The floor of 1 keeps a small role from being
  silently exempt, but a wave over 5 candidates carries no marker that its fairness
  statistics cannot be computed at that size.
