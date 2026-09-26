---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: tie-safe-cutoff-resolved-toward-the-candidate
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# A tie-safe bottom-slice cutoff in two pure functions

The cutoff for a screening auto-reject wave is computed by two exported pure functions in
`app/_lib/decision-config-schema.ts`, called in sequence from `app/_lib/screen-wave.ts`.
Keeping them pure and outside the wave is what makes both decisions unit-testable and
re-derivable from the scores alone. Every citation below is pinned to a single commit of
the app, read on 2026-09-26.

## Step 1 — the window size

`decision-config-schema.ts:853`:

```ts
export function screenBottomCount(cohortSize: number, rejectBottomPercent: number): number {
  if (cohortSize <= 0 || rejectBottomPercent <= 0) return 0;
  return Math.max(1, Math.floor((cohortSize * rejectBottomPercent) / 100));
}
```

The header comment at `:829` records the decision and the two rejected alternatives:
`ceil` was "too aggressive (it adds a candidate to large pools too)", and plain `round`
"still rounds the smallest pools (n≤2 @ 20%) to zero, leaving the bug". The bug being
targeted is the silent exemption: the old plain `Math.floor` made the default 20% over a
cohort of 4 come to `floor(0.8) = 0`, so small roles were exempt from an automation the
recruiter had explicitly enabled. The floor of 1 is bounded by the fact that the selected
candidate is still only rejected if they also fall below the match floor, so a
strong-but-small pool rejects nobody.

## Step 2 — never split a tie

`decision-config-schema.ts:892`:

```ts
let b = bottomCount;
while (b > 0 && sortedScoresAsc[b - 1] === sortedScoresAsc[b]) b -= 1;
return b;
```

The cutoff sits between index `b-1` (last rejected) and `b` (first kept); while those two
share a score the boundary is inside a tied run, so it walks **down** to the run's lower
edge and the entire tied group lands on the keep side. The comment at `:859` states the
rationale in the standard's own terms: the ascending sort is JavaScript's stable sort, so
a straddling tie "would be split purely by pipeline ARRIVAL ORDER — one candidate
auto-rejected, an indistinguishable peer kept, with no merit-based or documented reason",
which is "indefensible for an irreversible automated rejection and makes the boundary
non-reproducible from the scores". Expanding the window instead was **explicitly rejected
as over-eager**: it would auto-reject candidates the configured percentage never
selected, purely because they tied with someone below the cutoff. Candidates strictly
below the tied run are unaffected.

The function is total: `bottomCount <= 0 → 0`, `bottomCount >= length → length`
(`:893-894`).

## Where they meet the wave

`screen-wave.ts:187-206`. `screenBottomCount` runs over `n = sorted.length`, the
**scored** cohort only (`screen-wave.ts:188-192`), a percentage of candidates who can be
ranked, not of a pool padded with unmeasured people. `tieSafeBottomCount` receives
`sorted.map((e) => e.matchScore)`, genuine scores by construction because the null-score
policy at `:179` excluded the unscored before ranking. No fabricated zero can form a tie
or occupy the boundary.

## Making the shrink visible

- A candidate inside the raw window but outside the tie-safe one is flagged `tieSpared`
  (`screen-wave.ts:355`) and receives the byte-pinned keep reason `"tie at cutoff — kept
  so equal scores aren't split"` (`screen-wave.ts:101`, checked before the plain "above
  the bottom cutoff" branch precisely so the audit trail says *why* they were above the
  effective cutoff).
- Every reject rationale reports the effective count and, when it was shrunk, the raw one:
  `" (tie-adjusted from ${bottomCount} so no equal score is split)"`
  (`screen-wave.ts:462-464`), with `tieAdjusted` carried in `reasonParams` (`:478`) for
  localized rendering. The shortfall therefore reads as a decision rather than a defect.
- The per-candidate floor is the *effective* one, a role-family override or the global
  value (`decision-config-schema.ts:53`, applied at `screen-wave.ts:232`). The rationale
  and `reasonParams.threshold` report that resolved number, so the audit trail "can
  never claim a floor the wave didn't use" (comment at `:455-458`). The sealed record
  keeps it in its inputs as `threshold` (`:561`), while the record's `policyVersion` is
  the policy string the reviewer's approval signed (`:550`).

## Deviations

- **Comparison precision is exact equality on the stored number** (`decision-config-schema.ts:899`). Scores here
  are integers, so displayed and compared precision coincide today; nothing pins that
  invariant, and a fractional score would let a visible tie split on an invisible
  difference.
- **No insufficient-sample disclosure in the wave.** The floor of 1 keeps a small role
  from being silently exempt, but the wave's preview and sealed records carry no marker
  that a cohort is too small for its fairness statistics to mean anything. The app does
  have such a threshold elsewhere (`ADVERSE_IMPACT_MIN_COHORT = 30`,
  `app/_lib/adverse-impact.ts:39`, used by a separate compliance panel), but nothing in
  `screen-wave.ts` reads it.

## Since first documented

### 2026-09-26 re-verification

- **The tie-safe logic itself is unchanged.** Both functions are byte-identical to
  2026-08-30; only their line numbers moved.
- **The sealed record's `policyVersion` changed meaning.** `fix(decisions)` (2026-09-04,
  commit `81a35926d`) made every `auto_rejected` seal carry the token's policy string
  (`screen-wave.ts:550`) instead of a per-candidate
  `screen-wave/bottom<pct>/maxMatch<effective floor>`. The effective floor moved to the
  sealed `inputs.threshold`, so the "resolved number" is still recorded, just in a
  different field.

### Corrected on re-verification

- **The earlier text named a size of 5.** It said a wave "over 5 candidates" carries no
  small-sample marker. No threshold of 5 exists in the wave or the cutoff functions; the
  only insufficient-sample threshold found in the app is the 30 above, and the wave does
  not use it. The deviation now says so without the unanchored number.
