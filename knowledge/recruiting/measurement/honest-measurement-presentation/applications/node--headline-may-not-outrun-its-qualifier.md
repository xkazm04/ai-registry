---
layer: application
type: application
subject: honest-measurement-presentation
technique: headline-may-not-outrun-its-qualifier
stack: node
status: forged
verified_on: 2026-09-10
verified_against: node@18
proof: structural-only
---

# A replay pass names the predicate it actually gates

Career-ops declares Node `>=18` in `package.json`. Citations here resolve against
commit `6ddfca5aaa1a488bd55b0c1eca80d6896f855062`; the replay ran on Node 24.14.0.

The [golden-set protocol](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/evals/README.md#L13)
uses ten synthetic job descriptions with frozen reference-model labels. It is
designed to assess cheaper-model agreement with a reference. These are neither
independent human correctness labels nor observed hiring outcomes.

The harness deliberately separates two predicates. A row's positive marker
requires both archetype agreement and score error within 0.5. The exit gate
requires only at least 80% archetype agreement. The
[aggregation and final message](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/eval-golden.mjs#L233)
name that narrower predicate rather than declaring the model generally accurate.

## Observed replay

`node eval-golden.mjs --replay --model cheap-stub` exited zero on 2026-09-10:

| Measurement | Result |
| --- | --- |
| Archetype matches | 9 of 10 cases, clearing the 80% gate |
| Rows satisfying both conditions | 7 of 10 cases |
| Mean absolute score difference | 0.23 over 10 of 10 scored cases |
| Score-only failures | Two cases, each with difference 0.60 |
| Live latency and provider cost | Not measured in this replay |

A copied headline of “evaluation passed” would hide why three rows carry negative
markers while the process succeeds. The useful headline is the actual one: the
archetype agreement gate passed. Preserve the denominator beside that statement.

The source's protocol also says that reproducing a reference makes routing safe.
That is a hypothesis beyond what this replay establishes: profile conditions,
model variability, downstream effects, and human validity remain separate checks.
The committed stub fixtures demonstrate the harness's decision rule, not the
quality of a live cheap model. No routing or hiring recommendation follows from
this result alone.
