---
layer: application
type: application
subject: quality-regression-gating
technique: baseline-carries-its-conditions
stack: rust
status: forged
applied: experiment
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

## What this realization cannot do

The gate's own arm is **not measured here.** The verdict function never
consults judge identity at all, so there is no A and B to run against it, and
the store this workspace ships with holds zero benchmarks and zero runs. The
instrument that would measure it is a populated benchmark store with at least
two runs spanning a judge change — which this tree cannot currently produce,
because the immutable benchmark row means a judge change is a *new benchmark*
and therefore a new baseline. That immutability is why the failure has not
bitten here, and it is not a property the technique can assume elsewhere: a
service that adds an update endpoint acquires the full failure the same day.
