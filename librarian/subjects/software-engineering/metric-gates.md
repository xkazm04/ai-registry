---
subject: metric-gates
domain: software-engineering
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# metric-gates

## 2026-09-06 - split out of quality-gates ([[2026-09-06-1]])

**Born from a size question, not a source.** The 2026-09-04 `/deepen` pass on
quality-gates ([[2026-09-04-1]]) found the subject at 25 techniques and asked whether it
held two. The worker's seam: *predicate gates* (a verdict is a property of the tree)
versus *metric gates* (a measured number compared to a recorded number, where the
design problems are baseline provenance and instrument noise), with the evidence that
five techniques cited each other far more than the other twenty. The operator executed
the split on 2026-09-06.

**Four techniques moved whole**: `ratchet-design`, `counted-set-snapshot`,
`operation-assertion-gates`, `deterministic-proxy-gate`, with their three applications
(`node--ratchet-design`, `node--deterministic-proxy-gate`,
`node--operation-assertion-gates`). Two golden-path sections migrated verbatim
("When the input is fine and the instrument is not", "Ratchets"); two sections are new
("The founding measurement is the one reading nobody re-examines", "A baseline records
where it was taken" - the latter is the 2026-09-04 deterministic-proxy-gate apply row's
finding, a baseline held across a bundler major, raised to golden-path prose).

**What did not move, and why.** The proposal named "the founding-baseline half of
`excess-indicts-the-instrument`". Splitting a technique file in two would have left two
weak halves; the technique's subject is the instrument's *scope declaration* (a count
that is implausibly large indicts the roots, not the tree), which is predicate-side. It
stays in quality-gates whole, and this subject's golden path cites it for the founding
reading. `blocking-by-input-determinism` stays as the hinge: a metric gate is graded on
the same input axis, and its third class is the door into this subject.

**Boundaries stated on both sides.** quality-gates (mechanism of refusal, liveness,
laddering, binding - inherited unchanged); quality-regression-gating (judged model
outputs against a scored baseline: the comparison is between judgments and the noise is
the judge's; not this subject). Inbound links repaired in i18n/completeness-gates and
supply-chain/secret-scanning-architecture; five quality-gates techniques now link across.

**Ledger continuity.** The `librarian/applied.md` rows dated 2026-08-31 and 2026-09-04
for the moved techniques keep `quality-gates` in their subject column - they record what
was true when the test ran. The project ledgers (`.ai/applied.jsonl`) likewise.

## Open leads

- Four techniques is a thin subject. The 2026-09-04 merge-result gap (two individually
  green changes composing red) is predicate-side and does not belong here. Candidates
  that would: a technique on baseline derivation stamps (instrument version, toolchain,
  machine class) now argued only in golden-path prose; the two-consumer ratchet
  (blocking outside the allowlist, advisory inside) recorded in quality-gates' note on
  2026-09-01. Return condition: a second sighting of either in a fleet tree.
- Demand unknown: no installation has reported on this slug; the pairs the fleet maps
  held against quality-gates for these four techniques re-match on the next
  regeneration.

## Impact (step 4, run 2026-09-06-1)

First regeneration with the slug present: metric-gates matched two contexts, both in
systedo-case (a tree with a committed contract-snapshot ratchet), and no other project.
Every pair `unknown`; no judged verdict exists yet. Four techniques with narrow
`use_when` phrases match narrowly - that is the matcher working, not a coverage gap;
the size gate in personas and the CI-ratchet trees the 2026-09-04 apply rows walked are
the contexts a `/conform` pass would judge first.

## 2026-09-06 - /intake run (praisonai)

- New technique `proxy-metric-counts-its-own-satisfiers`, the subject's fifth.
  `deterministic-proxy-gate` swaps a **noisy** instrument for a deterministic one;
  this covers the substitution nobody chose - a metric cheap enough to compute
  that its **population can be moved toward it directly**. Name existence standing
  in for feature parity is the emblem: when the cheapest way to clear a row is to
  export the name, the row clears and the tracker truthfully reports progress.
- Three-part corrective, all three present in the source and measured: the artifact
  states in itself what a green cell does not mean **and refuses its own
  cross-side comparison** (411 vs 2,018 features, "not directly comparable"); a
  strictly stronger tier gates, with unevaluable failing closed to a named waiver
  rather than passing; and **the metric carries a column counting the shims built
  only to satisfy it**. The two tiers disagreed in the direction the proxy is
  structurally unable to disagree in - 0 gaps beside 28 parameter mismatches over
  the same 17 surfaces.
- The third part is the one almost never built and the cheapest of the three,
  because the generator already knows which module provided each name. Its
  precondition is that satisfiers are structurally identifiable; a codebase where
  they are scattered indistinguishably cannot have the column, **and that is itself
  the finding**.
- No fleet seam: no fleet project maintains a cross-language parity tracker.
  Application is against the source tree only.
