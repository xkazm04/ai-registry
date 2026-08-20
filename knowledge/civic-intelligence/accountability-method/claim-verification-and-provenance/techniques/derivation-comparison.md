---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: derivation-comparison
status: forged
laws: [deterministic-code-owns-numbers, incident-anchored-doctrine, missing-is-not-zero]
shared_with: []
use_when: [a formula behind published figures changes, stamping recomputed stores with provenance, aggregating provenance across a population, wiring a staleness sentinel]
---

# Derivation comparison

A published figure has two identities: its value and its **author** — the
formula, at a version, in a pass, that wrote it. Provenance that records only
where data came from misses the author; and the author is what changes most.
This technique makes the derivation identity a carried, compared value: every
computed figure is stamped with `formula-ref @ pass` (plus the computation
date), and three consumers actively compare stamps instead of displaying them.

The incident that mandates it, told once
([incident-anchored-doctrine](../../../_laws.md#incident-anchored-doctrine)):
a scoring formula was corrected in code, and the store was recomputed only
six days later. For six days, one published number had **two possible
authors**, and no surface could say which one wrote the value on screen —
the stamp existed in the store but nothing read it, so the divergence was
invisible everywhere. Worse, a citation minted in that window could later
match today's value *by coincidence of two different formulas*. Carrying and
comparing the derivation is the only defense that works at the citation
level.

## Comparison one: the citation vs. today

When a citation carries a derivation stamp and the gate re-verifies it,
compare the stamp too, after the value:

- Value differs → **moved (by value)**.
- Value matches, derivation matches → **verified**.
- Value matches, derivation differs → **moved (by basis)**. The number is the
  same; the claim is not. "Verified" here would certify agreement between two
  different computations — a coincidence, not a confirmation. The copy states
  it plainly: "the figure is unchanged, but a different derivation now writes
  it".
- Either side lacks a stamp → the stamps are not compared. An absent basis
  asserts nothing ([missing-is-not-zero](../../../_laws.md#missing-is-not-zero));
  treating it as a mismatch would punish older citations for a field that did
  not exist when they were minted.

## Comparison two: the population vs. itself

Never read one row's stamp and publish it as the population's provenance. A
writer that crashes mid-recompute leaves the store split across two passes,
and "the pass of the first row iterated" is then a fabricated single answer.
Aggregate instead, and report a three-state summary:

- **uniform** — every scored row carries the same `{pass, ref}`; the aggregate
  may state one pass, one ref, and (only if every row also agrees on one day,
  with no row missing a stamp) one date.
- **mixed** — more than one combination present. The aggregate has *no* pass,
  no ref, no date — it has a variant table: each combination with its count,
  deterministically ordered. Never collapse a disagreement into one tidy
  number; the disagreement *is* the finding.
- **absent** — no row carries a stamp. Absent claims nothing: it neither
  matches nor mismatches the declared formula, and no surface may print an
  accusation about a blank.

Ship coverage with the summary (rows stamped / rows read) so a stamp rollout
in progress is distinguishable from a uniform store.

## Comparison three: the store vs. the code

The code declares its current formula ref as an exported constant — one
definition, imported by the computation that stamps, the aggregate that
summarizes, and the sentinel that alarms. The invariant: **every scored row's
ref equals the declared ref.** False is not an error page; it is an honest
label on the published ranking ("computed by an earlier formula") *and* an
alarm in the invariant sentinel, so the six-day window becomes a red check
instead of a silent divergence.

Two sentinel disciplines, per
[deterministic-code-owns-numbers](../../../_laws.md#deterministic-code-owns-numbers):
re-derive a sample twice and require identical output (a formula with hidden
nondeterminism cannot be compared at all), and make "never ran" impossible to
read as "passed" — a sentinel run that could not reach the data emits an
explicit unevaluable report with every invariant marked unevaluated, in the
same machine format, with a failing exit. The absence of an artifact must
never be the success state.

## Decision rules

- Version the formula ref on every semantic change to the computation,
  however small — the ref exists to distinguish authors, and an unbumped ref
  after a change recreates the incident.
- Keep the derivation out of the claim *address* and out of the dataset name;
  it lives in the claim body. Baking it into the address invalidates every
  issued citation on every recompute.
- For a composite score, the citation's derivation comes from the
  population aggregate, not from the subject's own row — and when the
  aggregate is mixed or absent, the claim ships **without** a derivation
  field. A half-recomputed store has no single author, and a claim that picks
  one asserts more than the data carries.

## When not to use it

Skip derivation stamps for values that are literal transcriptions of a source
(a name, a registry identifier, a raw filed amount) — their provenance is the
source reference itself, and a formula ref on a copy operation is noise that
dilutes the stamps that matter. The technique is for *derived* figures, where
an author exists to name.
