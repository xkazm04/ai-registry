---
okf_version: "0.1"
okf_bundle_name: llm-observability
okf_bundle_title: LLM observability
profile: rkb/0.1
purity: software
stacks: [rust]
---

# LLM observability

The operator-side craft of running production LLM traffic as a product: telemetry
that stays auditable months later, price books and cost attribution, usage
governance, per-customer unit economics, continuous judge-scoring of live traces,
statistically defensible quality verdicts, and federated benchmark sharing that
leaks no one.

## Boundary contract with `software-engineering`

The `software-engineering` bundle's `llm-agent` category owns the **builder side** —
instrumenting and operating one's *own* agent system: `tracing` (span emission),
`eval-harness` (fixed offline datasets pre-ship), `cost-metering` (metering one's
own runs), `model-routing` (the runtime model decision), `structured-output`
(getting parseable JSON out). This bundle owns the **operator side**: receiving
traffic you did not emit, on clocks you do not own, from SDK versions you cannot
pin, for customers whose money flows both directions. The seam is stated per
subject in its golden path; no subject here duplicates a builder-side technique —
where a concern touches the seam, the golden path names the neighbor in prose
(cross-bundle links are forbidden by the profile, deliberately).

The upper two layers are transplant-clean per the `software` purity profile.
Applications cite real code and name their stack in the filename.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped — and located — by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
