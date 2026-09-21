---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: outcome-closed-by-own-metric-with-dead-band
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Outcome closed by its own metric - the diagnosis snapshot and the outcome chip

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) closes a stored diagnosis
by re-deriving its key metric in `src/lib/diagnoses/outcome.ts`. The module's header
(`:1-20`) is the technique's thesis: a persisted diagnosis "records an at-diagnosis
KEY-METRIC snapshot; at render time the CURRENT value of the SAME key metric is
re-derived from the (already re-computed) page data and compared, so the operator sees
whether the diagnosed problem actually improved - not just that a status was flipped
to 'resolved'". The tree proves the technique structurally: a per-kind metric table,
server-side extraction, a single dead-band constant, and an inverse-key set that flips
the verdict but not the delta.

## One metric per kind, from the server-rebuilt request

The header lists the metric per diagnosis kind (`:9-17`): cohort - the worst cohort's
LTV:CAC; lead-source - the source's `qualRate`; ads - portfolio PNO, "the ONE metric
where LOWER is better"; local - `coveragePct`. The extractors at `:37-64` read the
request the server rebuilt ("the tamper-proof numbers Direction 1 already re-derives",
`:7-8`), never the wire. Two of them return `null` when there is nothing to snapshot:
`extractCohortSnapshot` with no cohorts (`:38`) and `extractAdsSnapshot` when
`totals.pno` is not a finite number (`:61-64`), whose comment states the law: "a
missing baseline means no chip, never a fabricated one".

The local extractor's comment (`:48-51`) is the upward lesson about *movability*: the
coverage percentage was made "GENUINELY movable" by deriving it from the resolved
coverage matrix, so that publishing a page for the worst gap "actually raises it, and
the outcome chip reflects real progress instead of a snapshot==current constant". A
key metric the lever cannot move produces a permanent grey chip; the tree fixed the
metric rather than the chip.

## The dead-band and the inversion

`OUTCOME_THRESHOLD = 0.05` (`:92`) is the relative band; the comment calls it "a
deterministic dead-band so tiny wiggles don't flip the chip". It is this tree's
convention - nothing in the tree derives it from a variance estimate - and the
technique labels it as such. `INVERSE_METRIC_KEYS` (`:85-87`) holds `pno` alone, with
the comment that carries the inversion rule verbatim (`:81-84`):

> The reported `deltaPct` is deliberately NOT inverted - it always states what the
> tracked metric itself did (a PNO that fell 20 % reads "improved -20 %"), because a
> sign-flipped number beside the word "improved" would claim the metric rose.

`compareOutcome` (`:99-122`) implements it: relative delta against `|base|`, a sign
comparison when the base is zero or negative (`:108-115`) so nothing divides by zero,
`good = -delta` for an inverse key (`:118`), and the three-way verdict at `:119-121`.
It returns `null` - no chip - for a missing snapshot, a null or non-finite current
value, or a non-finite base (`:103-105`).

## The "already handled" guard

`alreadyResolvedUnchanged` (`:130-143`) is the technique's display-only guard: true
when a new run's subject matches a `resolved` diagnosis of the same kind whose
metric compares `unchanged` since. The docstring says it "never blocks the run".

## Two surfaces, one band

`src/lib/advice/ledger.ts:29-34` copies the band, the inverse handling and the
zero-baseline fallback "deliberately rather than imported" because the outcome
module's functions are typed to `DiagnosisMetricKey` while a producer's snapshot key
is an open string - and states that "two outcome chips that disagreed about which
direction is 'better' would be worse than either chip alone". `ADVICE_OUTCOME_DEADBAND`
(`ledger.ts:87`) is 0.05 and `ADVICE_INVERSE_KEYS` (`:101`) contains `pno`. The
technique's rule that the two surfaces share one value is satisfied by a copy with a
comment, and only half-pinned by tests: `test-unit/advice-ledger.test.mjs:56` asserts
the ledger's copy equals the literal `0.05`, while `test-unit/diagnoses-outcome.test.mjs`
uses `OUTCOME_THRESHOLD` symbolically (`:88`) and never asserts its value - so an
edit to the outcome constant alone passes both suites. Mild deviation: the standard
wants one assertion that the two are equal.

## Where the tree stops

The chip is a before/after read of one ratio of sums. The tree says nothing causal on
this surface, which is correct; but it also attaches no confidence claim and no
weekday balance to the comparison, so a diagnosis snapshotted on a Monday and re-read
on a Saturday compares two differently-shaped windows. The period-comparison subject
owns that concern and the outcome module does not consult it.

## Verification

Pure module, no I/O. On Node 24, `compareOutcome({ key: "pno", metric: 0.25 }, 0.20)`
returns `{ status: "improved", deltaPct: -0.2 }`; the same call with key `"qualRate"`
returns `worse` with the same delta. `compareOutcome({ key: "pno", metric: 0.25 },
0.24)` is inside the band and returns `unchanged`.
