---
layer: application
type: application
subject: llm-forensic-gating
technique: groundedness-scoring-triage
stack: process
status: forged
verified_on: 2026-08-20
---

# Evidence boundaries for a forensic gate stack

## Primary-source review - 2026-09-09

This replaces the earlier landscape summary with the evidence checked here.
The historical witness date is retained; this review is not a deployment or
benchmark rerun.

[JSONSchemaBench](https://arxiv.org/abs/2501.10868v3) evaluates six constrained-
decoding systems against 10K schemas, separating efficiency, constraint coverage
and output quality. Its abstract supports evaluating those dimensions separately;
it does not establish current runtime coverage or factual correctness.

[Let Me Speak Freely?](https://arxiv.org/abs/2408.02442v3) reports degraded
reasoning performance under format restrictions in its studied settings.
That is a reason to evaluate the chosen task and model, not a universal claim
that structured output harms every task.

[AP's published standards](https://www.ap.org/the-definitive-source/behind-the-news/standards-around-generative-ai/)
treat generative output as unvetted material and retain journalists' responsibility
for sourcing and editorial judgment. The checked page is dated August 2023;
it does not establish a newly adopted August 2026 policy.

## Application decision

Retain mechanical validation, probabilistic support triage and human editorial
review as separate responsibilities. Deploying a verifier still requires a
versioned source-resolution path and held-out, locally adjudicated evaluation;
none was run here. Unsupported survey superlatives, mixed benchmark percentages,
court-case totals and sanction amounts from the earlier summary are withdrawn
pending primary-source verification. Their removal is not a finding that every
underlying claim was false. An identifier sweep cannot establish that a real
case supports a quoted proposition, so the claim that it would catch every
defective court citation is also withdrawn.

The process remains a re-verification lead until a concrete consumer evaluation demonstrates the ordering and rejection behavior.
