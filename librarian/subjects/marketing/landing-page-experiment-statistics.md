---
subject: landing-page-experiment-statistics
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-maac-1022 (apply)
dry_streak: 0
---

# landing-page-experiment-statistics

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `conversion-and-leads`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** declaring or refusing an A/B winner on a landing page, sizing a landing-page test before it starts, reviewing an experiment surface that shows a winner badge, designing how arms are assigned and served, drafting challenger arms for a running or finished test

**Techniques (6):** distinct-hypothesis-per-arm, experiment-pages-print-no-numbers, multi-arm-alpha-correction, peeking-guard, sample-size-trust-gate, uniform-split-disclosed-no-ramping.

**Applications (5; stacks: node):** node--distinct-hypothesis-per-arm, node--experiment-pages-print-no-numbers, node--multi-arm-alpha-correction, node--sample-size-trust-gate, node--uniform-split-disclosed-no-ramping.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

- 2026-10-22, intake-apply-maac-1022: `multi-arm-alpha-correction` applied to systedo-case
  as an experiment (null replay over the real evaluator, two seeds of 100k tests). The
  shared-control caveat was inverted: the product form measured conservative on a shared
  control (0.046/0.044/0.042 at 3/4/6 arms vs 0.050 independent), so switching to the
  division form is `not-better`. Corrected in the technique, the golden path and the
  trust-gate application, which had carried the same sentence. Also measured: a surface
  that declares only an arm above control spends about half its two-sided budget.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- Unapplied: `distinct-hypothesis-per-arm`, `peeking-guard`, `sample-size-trust-gate`,
  `uniform-split-disclosed-no-ramping` have no `librarian/applied.md` row unless the
  ledger says otherwise.
- Mid-test arm change: the consumer swaps a running test's arm list in place with no
  restart disclosure; the technique's rule is unmet there.
