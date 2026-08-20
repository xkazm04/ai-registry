---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: tally-reconciliation
status: forged
laws: [disclose-never-repair, provenance-or-nothing, missing-is-not-zero]
shared_with: []
use_when: [publishing metrics derived from re-tallied ballots, validating an ingest of individual votes, a derived count disagrees with the source]
---

# Tally reconciliation

Most roll-call sources publish two accounts of every division: the individual
ballots, and the chamber's own aggregate totals (so many yes, so many no,
so many abstained). An analysis pipeline re-derives everything from the
individual ballots — that is what makes member-level metrics possible — which
means every published number stands on *your recount*, not on the source's
totals. Reconciliation is the systematic comparison of the two. On a surface
whose brand is "every number can be checked", the recount is the one layer
nobody else can check unless you check it yourself, in public.

What reconciliation catches is precisely the failure class that unit tests
cannot: not bugs in the formulas but defects in the *corpus* — an ingest that
silently dropped a member's ballots for a year, a mandate resolution that
lost a seat, a vocabulary mapping that misfiled a code. Each of these leaves
every formula correct and every published rate wrong.

## The procedure

1. **Compare one-to-one, never approximately.** Map each derived bucket to
   the source's published column exactly: derived yes ↔ published yes,
   derived no ↔ published no. Where the source's columns are finer than your
   vocabulary (it publishes abstain and not-voting separately while the
   modern recorded codes merge them), sum the source's columns to your
   bucket's grain — a grain change is arithmetic, not estimation.
2. **Refuse to compare what would require estimation.** If the source
   publishes no column for a category (absent/not-logged-in members),
   deriving one from seat counts is an estimate, and reconciliation compares
   data with data, never data with estimates. The slot is simply excluded
   from comparison, and the exclusion is documented where the results
   render.
3. **Distinguish "no recount exists" from "recount is zero".** A division
   for which you hold no individual ballots has a *null* recount, counted in
   its own category — never a zero tally that would reconcile as a wild
   discrepancy against the published totals. Feeding display-layer tallies
   (which legitimately zero-fill empty rows for rendering) into
   reconciliation converts missing into zero and floods the report with
   fake findings.
4. **Record per-division deltas and a corpus summary.** Per division: which
   slots were comparable, the signed delta per slot, and a total distance.
   Corpus-wide: divisions examined, recounted, compared, agreed, discrepant,
   plus the count where the source published nothing comparable. Determinism
   throughout — fixed slot order, stable sort — so two runs over the same
   corpus produce byte-identical reports.

## A difference is a finding, never a repair

The central rule, and the one under most pressure when a discrepancy
appears: **nothing is corrected.** A delta means either your ingest is wrong
or the source's published totals are — and until a human investigates, you
do not know which. Patching the derived numbers toward the published totals
destroys the evidence and asserts, without investigation, that the source's
aggregates outrank the source's own ballots. Publishing the delta —
count, affected divisions, worst example — keeps both accounts intact and
puts the blame where it can be examined. The same posture applies in
reverse: do not "correct" the source's totals to match your recount in any
rendered surface.

Reconciliation output is itself a published metric with provenance: the
report names the corpus, the comparison rules, and the divisions behind
every count, so a reader can re-run the check.

## Decision rules

- **Run reconciliation on every corpus rebuild**, not once at ingest
  adoption. The defect class it catches (partial ingests, upstream data
  revisions) recurs; a one-time green check certifies one snapshot.
- **A green report is scoped, not general.** "All compared slots agree"
  certifies the buckets that were comparable on the divisions that had both
  accounts — the report says how many that was. It is not proof the ingest
  is complete (a division missing from your corpus entirely is invisible to
  a per-division comparison; completeness is a separate count against the
  source's division index).
- **Discrepancy handling is triage, not automation.** A nonzero delta gates
  publication of *confidence language* ("verified against the chamber's own
  totals"), not publication of the data itself — the numbers ship with the
  disclosed discrepancy while investigation proceeds.

## When not to use it

- Not as a substitute for unit-testing the derivation formulas — matching
  totals with a wrong line definition is easy, since the line never touches
  the tally.
- Not across sources (your recount vs a third-party aggregator): that is
  source triangulation, a different technique with different authority
  rules — the chamber's own publication is the only account with
  self-audit standing here.
