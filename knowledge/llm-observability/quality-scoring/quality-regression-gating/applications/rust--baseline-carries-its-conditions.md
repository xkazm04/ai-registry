---
layer: application
type: application
subject: quality-regression-gating
technique: baseline-carries-its-conditions
stack: rust
status: forged
applied: code
ab_verdict: better
proof: ab-paired
verified_on: 2026-09-01
verified_against: rust@1.97.1
---

# Rust: the conditions are recorded, and discarded at the call boundary

A self-hosted LLM observability service in a Rust workspace runs benchmarks,
stores a baseline per benchmark, and gates deploys on the comparison. It is a
good implementation of this subject — it already refuses to crown a winner on
a bare argmax, and its comparison module says so in a comment before it says
it in code. The baseline's conditions are where it stops.

## What the tree already knows and does not use

The benchmark row holds, in one table, the judge model, the dataset
reference, the dataset itself, the baseline score, and the row's creation
timestamp. There is no update path for that row — only a create — so the
baseline and the conditions it was set under were written in the same
statement and neither can be edited afterwards. **The provenance this
technique asks for is already recorded, by accident of immutability rather
than by design.**

The gate then throws it away at the call boundary. The verdict function takes
the run list and one `Option<f64>` — the caller holds the whole benchmark and
passes a float. Everything the predicate would need is one field access away
at the call site and unreachable one line later.

That is the shape worth reporting, because it is not the failure the
technique predicts. The technique predicts a bare scalar in a column with no
conditions anywhere. What this tree has is conditions recorded and a
narrowing at the seam, which is a cheaper repair and a harder one to notice:
nothing is missing, so nothing looks wrong.

## The arms

The behavioural arm ran on the one surface where model identity is actually
resolved: the canonicalization applied at collective-ingest, whose shipped
table is real data with 11 model entries and 7 provider entries.

- **Arm A (as shipped)** — comparability key is the normalized family.
- **Arm B (predicate)** — comparability key is the dated variant as written.

Same table, same function, both arms:

| | distinct identities |
| --- | --- |
| Arm A (normalized family) | 8 |
| Arm B (dated variant retained) | 11 |

Five real instruments collapse into two identities: three `gpt-4o` variants
spanning 2024-05-13 to 2024-11-20, and two `claude-3-5-sonnet` variants five
months apart. **9 of the 11 entries (82%) carry an explicit date that arm A
discards.** Under arm A a baseline set against one variant and a run scored
by another six months later are indistinguishable, and the collapse happens
upstream of every place a verdict is formed, so no downstream surface can
report that the distinction was lost.

Verdict: **better** — arm B recovers three identities arm A cannot express,
on real shipped configuration rather than constructed cases.

## The result corrected the technique

The table is not a defect. Its own header states its purpose: without it,
`gpt-4o`, `openai/gpt-4o` and `gpt-4o-2024-08-06` are three leaderboard rows
and the reader cannot see the model. Collapsing dated variants is *correct*
for the surface it serves.

What the arms established is that a codebase has **one** identity function,
and the surface that wants a family is the surface that gets looked at every
day. The predicate then reaches for an identity and silently inherits the
aggregation surface's answer. That discriminator — aggregate on the canonical
identity, compare on the measured one, keep both fields — was added to the
technique from this result; the technique did not carry it before.

## The change that shipped

The verdict function now takes the benchmark rather than its `baseline_score`, and
applies the one predicate the run can actually answer: a run scored against an
**unfrozen dataset** may have used a different case set than the one the baseline was
established on, so the two means are over different populations. That degrades to the
unverified lane the exit-code contract already carries — deliberately a distinct code
from a regression, so CI warns rather than hard-fails — and a `caveat` field names which
condition expired, because "no_baseline" alone sends an operator hunting for a baseline
that is sitting right there.

Paired arms over eight cases, same inputs, both arms in one test binary:

| case | arm A (as shipped) | arm B (predicate) | caveat |
| --- | --- | --- | --- |
| passed / unfrozen | `pass` | `no_baseline` | yes |
| regressed / unfrozen | `regressed` | `no_baseline` | yes |
| legacy scalar / unfrozen | `pass` | `no_baseline` | yes |
| partial / unfrozen | `partial` | `partial` | — |
| legacy / unfrozen / no baseline | `no_baseline` | `no_baseline` | — |
| passed / frozen | `pass` | `pass` | — |
| regressed / frozen | `regressed` | `regressed` | — |
| passed / inline dataset | `pass` | `pass` | — |

Three of eight differ, and all three are exactly where a verdict rested on a comparison
against a moving case set. Green count 4 → 2. **Five of eight are byte-identical**,
which is the number that matters for the golden path's composition doctrine: the
predicate adds detection and disarms nothing.

Two restraints are worth recording because both were tempting and both are wrong.
Verdicts that never consulted the baseline — `partial`, and `no_baseline` arising from
*absence* — keep their status; overwriting them would trade one honest unverified state
for another and lose the reason. And an inline dataset stamps no frozen flag at all, so
absence is read as "nothing says the cases moved" rather than as a refusal: a benchmark
carrying its own cases has no separate dataset to drift underneath it.

## What this realization cannot do

**It checks one condition, not the predicate.** The technique asks for judge
model and version, dataset version, and the baseline's own date. This ships
only the dataset's frozen flag, because that is the only condition where the
run's stamp and the baseline's silence produce a decidable answer. The judge
is recorded per run and *inherited* from an immutable benchmark row, so within
one benchmark it can never disagree with itself — which means this tree cannot
detect judge drift at all, and the appearance of safety comes from
immutability rather than from a check. A service that adds a
benchmark-update endpoint acquires the full failure the same day.

**Nor does it date the baseline.** The remaining half needs the baseline
stored as a record rather than a scalar — the number beside the run it came
from, the judge and version that produced it, and when it was set — which is a
schema change across four stores and was deliberately left out of a change
scoped to the call boundary.

**And the frozen flag is a proxy, not the condition.** An unfrozen dataset
*may* have changed; it is not established that it did. The predicate therefore
produces false refusals on benchmarks whose unfrozen dataset happened to stay
stable. That is the correct direction to be wrong in for a gate — an
unverified verdict costs a re-run, where a false `pass` costs the thing the
gate exists for — but it is a real cost, and the honest fix is comparing the
recorded `dataset_version` against the baseline's, which is the same schema
change.
