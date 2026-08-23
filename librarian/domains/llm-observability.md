---
domain: llm-observability
last_swept: 2026-08-21
layout: nested
demand_known: false
---

# LLM observability

Coverage note for the `llm-observability` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at the last sweep (2026-08-21)

| | |
| --- | --- |
| Subjects | 16 |
| Techniques | 98 |
| Applications | 41 |
| `use_when` written | 98/98 |
| Version witness (`verified_against`) | 0/41 |
| Expired applications | 0 |
| Never swept | 16/16 |
| Attention points | 60 |
| Cap breaches | none - every level is under ten |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain llm-observability`.

[[2026-08-23-6]] - the first reconcile wave outside software-engineering, and
the bundle's first touch by the lane: Phoenix, Langfuse, promptfoo,
lm-evaluation-harness, MLPerf Inference and LiteLLM. All six single-stack
debts cleared in one wave (python declared as the bundle's second extra
stack); two measured disproofs of technique text queued cycle-ready; three
upstream-reportable bugs; one law-confirming sighting (nullable-never-zero,
LiteLLM's 0.0 coercion) and one lossy-branch sighting (MLPerf's silent
division skip) for the cross-bundle family.

## What is owed

- a second stack for 6 subject(s) - the transplant claim is untested at one
- a reporting installation - demand for every subject here is UNKNOWN, not zero
- a maturity signal - all 16 documents say `forged`, nothing has ever been reconciled or transplant-tested

## Highest attention at the last sweep

- **margin-and-unit-economics** (5) - single stack (rust); never swept by the librarian
- **federated-benchmark-sharing** (5) - single stack (rust); never swept by the librarian
- **cross-provider-benchmark-operations** (5) - single stack (rust); never swept by the librarian
- **production-trace-scoring** (5) - single stack (rust); never swept by the librarian
- **quality-regression-gating** (5) - single stack (rust); never swept by the librarian

## Dispatched

Nothing yet. The sweeps so far have measured and restructured; no research worker has
been dispatched at content. See the run notes for why.

## Declined

Nothing yet.
