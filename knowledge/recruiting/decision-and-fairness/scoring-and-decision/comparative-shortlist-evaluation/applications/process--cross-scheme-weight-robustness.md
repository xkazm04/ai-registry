---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: cross-scheme-weight-robustness
stack: process
verified_on: 2026-08-20
---

# The fairness matrix and the honest status it reports (Python pipeline → payload)

The check itself lives in the spawned analysis pipeline; the vocabulary that
reports it lives in the shared types the server and the panel both import. Both
halves are needed — a correct check with a boolean flag would still lie.

## Bounded dynamic weights

Per-candidate weights let demonstrated, role-relevant evidence count for more for
the candidate who actually has it. The bounds that keep that fair are three
constants (`pipeline/jobfit/matching.py:670-672`):

- `_WEIGHT_MAX_DELTA = 0.15` — a proposal may move each slot at most this far
  from the archetype baseline;
- `_WEIGHT_FLOOR = 0.10` — no dimension can be zeroed out of the rubric;
- `_WEIGHT_CEIL = 0.60` — no dimension can dominate.

`weight_bounds` (`:675`) composes them into a per-slot `[min, max]` around the
baseline, and the header states the guarantee: "so one strong signal can neither
erase a dimension nor let it dominate" (`:664-665`).

`resolve_weights` (`:688`) is where the standard's projection rule appears as
code. Its docstring names the failure the obvious repair causes: clamp each slot
to its bounds, then make the vector sum to 1 "by pushing the residual onto slots
that still have headroom in the needed direction — so the result both sums to 1
AND stays inside the bounds (**a plain clamp-then-divide can renormalize a slot
back past its ceiling**)" (`:689-694`). The implementation (`:701-716`) is a
bounded simplex projection: at most 8 passes, residual distributed proportionally
to available headroom, `break` when the sum converges or no headroom remains. It
returns the archetype baseline unchanged when no proposal is given, so default
scoring is byte-identical and the feature is additive.

`propose_weights` (`:719`) supplies the deterministic proposal — weight shifts
toward demonstrated skill when the candidate backs the role's must-haves with
high-trust evidence (`observed`, `professional`, `internship`, `open_source`) —
and returns the vector *plus its reasons*. Those reasons matter downstream: they
are how the payload later knows whether the weights actually varied.

## Score everyone under everyone's yardstick

`fairness_matrix` (`:916`) takes `(candidate, weights)` pairs and a job. Its
docstring is the technique in two sentences: "A single weighted scalar drawn from
different yardsticks isn't comparable, so instead of trusting each candidate's
score under their own weights we score every candidate under EVERY candidate's
scheme and rank by the mean — a candidate who stays strong under everyone's
weights is robustly strong, not just flattered by their own" (`:917-923`).

Two implementation details the standard calls for are both present:

- **The diagonal is kept.** `own = [matrix[i][i] …]` (`:939`) is each candidate's
  score under their own scheme, retained next to `mean` — the pair is the
  flattery measure.
- **The cost argument is answered.** Dimension scores are scheme-independent, so
  they are computed once per candidate (`dims = [_score_dimensions(c, job) …]`,
  `:934`) and combined with every scheme by cheap multiply-adds, replacing "the
  old n² full `score_job` calls." The comment records that the per-cell value is
  byte-identical, which is what made the optimization safe to take.

Every input vector is run through `resolve_weights` inside the matrix (`:926`),
so a caller cannot bypass the bounds by passing raw proposals.

## The status is derived, not asserted

`assessRobustness` (`app/features/shared/groupEvalTypes.ts:77`) turns the matrix's
presence and content into one of five values (`:41`), and the comment block above
the type (`:26-40`) is the epistemology, worth reading as written:

- `assessed` — the ranker ran **and** weights actually vary, "so the cross-scheme
  re-scoring genuinely tested the order";
- `not_varied` — every candidate carries the same uniform weighting, "so the
  cross-scheme test is a NO-OP: 'order unchanged' is guaranteed a priori and
  proves nothing. **NOT 'robust'**";
- `unavailable` — a matrix was expected but the ranker produced none: "could not
  assess";
- `not_applicable` — a job-less role, no ranker, "the panel stays hidden — no
  false claim";
- `insufficient_sample` — below the min-cohort floor, so "no robustness is claimed
  and no lead is crowned."

Variance is detected from `weightNotes` — a candidate whose proposal produced no
reasons was never moved off the baseline (`:80`), which is why `propose_weights`
returning its notes is load-bearing rather than cosmetic.

`isFairnessAligned` (`:54`) is the unreadable-check guard. The type *asserts* that
`labels / candidateIds / schemes / matrix / mean` align and that the matrix is
square, and "nothing enforced it" — the blob is persisted as JSON and re-parsed
unvalidated on every open, so one malformed record used to throw inside the
panel's unguarded indexing "and take the WHOLE modal down: comparison table,
decide buttons and the Re-run button that would have replaced the bad blob
included" (`:47-53`). `assessRobustness` treats a misaligned matrix exactly like a
missing one (`:79`, with the comment "an unreadable check is not a check"),
degrading to the honest `unavailable` panel and keeping the repair path reachable.

## The gate order

`group-eval-run.ts:406` composes the two floors in the order the standard
requires: `comparable ? assessRobustness(!!job, fairness) : "insufficient_sample"`
— the cohort refusal wins over every other status, and `:378-380` records why:
below the floor the run crowns no lead "so nothing auto-seals," claims no
robustness, and says so. The status then rides into the sealed record's `inputs`
(`:657`, `:672`) "so the sealed lead never reads as robustness-verified when it
wasn't."
