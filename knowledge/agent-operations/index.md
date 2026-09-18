---
okf_version: "0.1"
okf_bundle_name: agent-operations
okf_bundle_title: Agent operations
profile: rkb/0.1
purity: agent-ops
stacks: [process]
---

# Agent operations

The craft of running autonomous coding agents as a fleet rather than one at a time:
deciding which model and how much reasoning a task deserves, measuring what a run
actually did rather than what it said, judging quality without letting a vendor grade
its own homework, telling a model's defect apart from the harness's, and confining an
unattended run so a bad one costs a clone and not a working tree.

## Boundary contract with `software-engineering` and `llm-observability`

`software-engineering`'s `llm-agent` category owns building an agent system:
`model-routing` (the runtime routing decision inside a product), `eval-harness`
(offline datasets before ship), `agent-instruction-files`, `cost-metering`.
`llm-observability` owns production traffic you did not emit: telemetry, price books,
judge-scoring of live traces. This bundle owns neither. It owns the **operator side of
agents that change a repository**: a fleet of unattended runs against real trees, where
the output is commits and files, the measurement is a gate plus a blind verdict, and the
failure modes are a spoiled clone, a refused seat, a suspended host and a skill whose
wording every model reads the same wrong way.

The seam is stated per subject. Where a concern touches a neighbour, the golden path
names it in prose; cross-bundle links are forbidden by the profile, deliberately.

The upper two layers are transplant-clean per the `agent-ops` purity profile: no vendor,
model or product names, because a standard that names this season's model stops
transplanting the moment it is renamed — and reads as an endorsement, which a standard
must never carry. Applications name models, efforts and harnesses freely: that is their
job, and every number there carries its n and its date.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped — and located — by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
