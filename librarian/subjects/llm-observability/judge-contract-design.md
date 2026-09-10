---
domain: llm-observability
subject: judge-contract-design
---

# judge-contract-design

## 2026-08-28 - /harvest batch 1 + A/B evaluation

`reference-guided-grading` landed as a new technique (from the founding
LLM-as-judge measurement paper's 70/30/15 misgrade ladder). A/B probe in a
connected project (correctness-judging design for its autonomy-eval agent-judge)
returned **impact-null, first of two** - a blind 10-10 tie: the subject's
existing techniques carried both arms to full marks on a 5-check rubric. The
technique's truth is corroborated; its marginal impact where this bundle is
consumed is not yet shown. A second null marks it `unproven-in-project`.
Evaluation ledger: [[../../harvest/evaluations.md]].

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/judge-contract-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ffdf1c4e37d49622",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A score of 0.5 is not below a floor of 0.5.",
    "One successful parse out of ten attempts cannot estimate repeatability.",
    "A documentation answer can legitimately contain section markers.",
    "The first number in \"case 3: total 42\" is not the answer total."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/judge-contract-design",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://arxiv.org/abs/2403.17710",
      "scope": "Primary abstract confirms optimized candidate-response injection and limitations of examined detection defenses; exact rates and nonce-specific efficacy not reverified."
    },
    {
      "url": "https://arxiv.org/abs/2404.04475",
      "scope": "Primary abstract reports improved length-manipulation robustness and correlation with Chatbot Arena from 0.94 to 0.98; no universal immunity claim."
    }
  ],
  "documents": {
    "judge-contract-design.md": {
      "disposition": "reverify",
      "reason": "Versioned definitions support comparability but identical rubric alone does not establish it; byte-pinned inline contracts are legitimate. Anchors do not guarantee consistent model behavior. Mechanical checks have resource and specification costs, and known no-call cost can be zero with provenance. Nonce formatting is not a model-enforced trust boundary; single/no samples cannot establish sampled agreement."
    },
    "techniques/bias-counterbalancing-instructions.md": {
      "disposition": "reverify",
      "reason": "Bias can interact with input, not merely add a constant. One swapped-order disagreement can be sampling noise; repeated controlled counterbalancing is needed for attribution. Style, format and length may be legitimate task criteria, and automatic ties are a policy. Anchors do not eliminate length bias; length regression is model-dependent rather than ungameable."
    },
    "techniques/deterministic-dimension-kinds.md": {
      "disposition": "clarify",
      "reason": "Repaired permissive first-number extraction, missing config versus candidate failure, byte-identical serialization guarantee and null-versus-known-zero cost. Deterministic checks establish their implemented predicates rather than complete truth, with bounded resource use."
    },
    "techniques/gating-floors.md": {
      "disposition": "clarify",
      "reason": "Repaired strict-less-than boundary contradiction: score equal to floor passes, including 0.5 at floor 0.5. Missing/nonfinite values and sampled uncertainty need explicit handling. Multiple subjective floors can be legitimate; they do not automatically become mechanical checks."
    },
    "techniques/mixed-rubric-honesty.md": {
      "disposition": "clarify",
      "reason": "Repaired one parsed sample as full agreement and no-sample agreement, parse-selection bias and scope of mechanical composite variation. Merely mentioning a check does not inherently double-count; aggregation ownership does. Raw judge output requires access and retention controls."
    },
    "techniques/nonce-fenced-candidate-isolation.md": {
      "disposition": "clarify",
      "reason": "Repaired unforgeable boundary as behavioral guarantee, weak randomness rationale and marker collision as proof of malicious intent. Construction tests assess string placement, not model obedience; authorized originals and altered grading inputs must remain distinguishable."
    },
    "techniques/reference-guided-grading.md": {
      "disposition": "reverify",
      "reason": "Independent reference generation can reduce anchoring but is fallible. Versioned validated references may legitimately be reused across candidates; reuse is not inherently stale. Reference examples can help preference tasks, although not unique truth. Cost need not double and deterministic checking is not always equivalent to a regex. Precise founding-study reductions have no identifiable citation here."
    },
    "techniques/weighted-anchored-dimensions.md": {
      "disposition": "reverify",
      "reason": "Anchors and dimensions are useful but do not guarantee stable meaning or reduce every form of noise. Validate finite nonnegative weights with positive total, unique keys, missing scores and ordinal-to-interval assumptions. Three-to-six dimensions and the given priorities are examples, not universal optima; dimensional pairwise evaluation can be useful."
    },
    "applications/process--bias-counterbalancing-instructions.md": {
      "disposition": "reverify",
      "reason": "Historical LightTrack prompt and aggregation claims retained, not rerun. A caller comment does not prove actual counterbalancing. Shared filters do not make drift impossible; echoed IDs need duplicate/missing validation. Anchors do not neutralize verbosity by construction, and a no-parse output requires safe error handling. Sample and cost semantics remain residual."
    },
    "applications/process--nonce-fenced-candidate-isolation.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained without maturity refresh. Primary abstracts confirm optimized candidate attacks and length-control robustness improvements, not nonce-fence immunity or ungameable regression. Precise attack rates, community benchmark and all-framework feature-gap claims were not reverified. The cited length-control correlation is with Chatbot Arena, not a direct per-item human-label correlation."
    },
    "applications/rust--nonce-fenced-candidate-isolation.md": {
      "disposition": "reverify",
      "reason": "Historical Rust implementation and tests retained, not rerun. Hashing time/counter/address does not establish unpredictability. A test parser that strips fenced blocks proves its own syntactic property, not an LLM trust boundary. Marker-shaped documentation may be innocent; rewritten text can change grading. Complete caller/input coverage and adversarial efficacy remain unproven."
    }
  }
}
```
