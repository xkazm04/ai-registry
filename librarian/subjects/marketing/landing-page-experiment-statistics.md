---
subject: landing-page-experiment-statistics
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-peeking-guard-1022 (apply)
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

- 2026-10-22, intake-apply-peeking-guard-1022: `peeking-guard` applied to systedo-case
  in code, verdict `better`. The procedure said a closed test is read on confidence
  alone, and the tree did exactly that. A null test closed on its first crossing became
  a winner 0.19-0.22 of the time, against 0.04-0.05 with the gate on closed tests too;
  closing when the gate opens was unchanged at 0.027-0.029. The procedure was inverted,
  and the golden-path summary and the trust-gate application were corrected. Also
  refuted, and not fixed in the tree: "the badge is a single look". Waiting for the
  badge gave 0.094-0.107 null winners in both arms, because the gate moves with the
  observed control rate and the looks continue after it opens. Written up as "What the
  gate does not close".

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- Single stack stays: on 2026-10-22 the only other marketing tree in the fleet had no
  experiment surface, so the second stack waits for a tree that grows one.
- Badge-wait leak: the consumer recomputes its horizon on every read; return when it
  stores a horizon at test start or a gate-open snapshot.
- Unapplied: `distinct-hypothesis-per-arm`, `sample-size-trust-gate`,
  `uniform-split-disclosed-no-ramping` have no `librarian/applied.md` row unless the
  ledger says otherwise.
- Mid-test arm change: the consumer swaps a running test's arm list in place with no
  restart disclosure; the technique's rule is unmet there.
