---
layer: application
type: application
subject: llm-forensic-gating
technique: groundedness-scoring-triage
stack: process
status: forged
---

# The verification-tooling landscape around a gate stack — August 2026

A dated, sourced snapshot of the field this subject sits in, in the shape a
gate-stack owner consumes: what each tooling layer now provides, what it
measures, and what it leaves for the techniques here. It will go stale; that
is what the date is for. The organizing finding is that the field converged
on the same three-layer split this subject teaches — mechanical enforcement,
probabilistic groundedness measurement, human-institutional review — and
that no layer absorbed its neighbors.

## Enforcement layer: constrained decoding is table stakes, not a gate

Schema-constrained decoding is now a first-class runtime feature (OpenAI and
Gemini structured-output modes; open frameworks Outlines, Guidance, XGrammar,
LM Format Enforcer, vLLM structured outputs) — the model *physically cannot*
emit a shape-invalid token stream. JSONSchemaBench (2025) benchmarked six
such frameworks on ~10K real-world schemas and found the boundary this
subject's "enforce twice" step predicts: coverage of JSON-Schema features is
inconsistent across engines (`oneOf`, deep `$ref`), and validity guarantees
are syntactic only — values can be wrong, fabricated, or low-quality inside
a perfectly conforming object. A second measured caution: format restriction
itself can degrade reasoning quality ("Let Me Speak Freely?", 2024; follow-on
constrained-decoding cost studies 2026), which supports keeping the schema on
the *output*, never on the research process. Verdict for this subject:
runtime enforcement makes shape failures rarer but retires nothing — the
post-hoc validator remains load-bearing for the plain-agent path and for
re-running gates over stored artifacts, and every semantic gate
(membership, citation, sweep, register) operates entirely above what token
masking can express.

## Measurement layer: groundedness scoring grew benchmarks and judges

The gap this snapshot's technique addresses is now independently measured:

- **Attribution benchmarks.** AttributionBench (binary does-the-source-
  support-the-claim classification; fine-tuned GPT-3.5 at ~80% macro-F1),
  CiteME (citation matching, base LLMs at 4–18% accuracy), CiteGuard
  (retrieval-augmented citation verification, ~68% on CiteME), and TRACE-
  style retrieval-aligned citation evaluation reporting citation accuracy
  commonly in the 40–80% band with faithfulness rates as low as ~43% — i.e.
  a large fraction of machine citations exist but do not support their
  claims, which is exactly the class no deterministic membership or
  existence check can catch.
- **Composite metrics.** TRUST-SCORE (ICLR 2025) scores answer quality,
  citation support, and refusal behavior together; RAG-evaluation stacks
  ship faithfulness/groundedness scorers as standard components.
- **Hallucination benchmarks and judges.** FaithBench (NAACL 2025,
  human-annotated summary hallucinations with a benign/unwanted split),
  HalluLens (dynamic task generation against test-set contamination),
  HalluHard (multi-turn, hard cases), and the Vectara hallucination
  leaderboard with its HHEM/FaithJudge judge models — the most-cited public
  faithfulness ranking, itself an LLM-judge pipeline.

The load-bearing caveat travels with all of it: every scorer above is a
model verdict. The field's own numbers (80% classifier F1 as a *good*
result) are the argument for this subject's placement of scoring as triage
feeding a human door, never as the door.

## Practice layer: evidentiary institutions codified the human door

- **Newsrooms.** The Associated Press's updated AI guidelines require every
  AI-touched output to be reviewed by a human journalist before publication
  and hold that the technology cannot replace sourcing, verification, or
  editorial judgment; disclosure is required where generative AI played a
  material role. Large European broadcasters (BBC, YLE, Czech Television)
  have appointed named AI-oversight leads. This is human-review-doors and
  register/disclosure discipline arrived at institutionally.
- **Courts.** Public trackers of AI-fabricated legal citations in filings
  counted 1,300+ court proceedings by April 2026 (one tracker ~1,600), with
  escalating sanctions — from $5K fines in 2023 to a $110K penalty
  (Couvrette v. Wisnovsky, 2025–26) and an attorney suspension over a brief
  with 57 of 63 citations defective. The field-scale confirmation of this
  subject's founding claims: fabricated references survive careful
  instructions and professional oath alike ("contracts raise draft quality;
  only gates bound output quality"), and a hallucinated-reference sweep
  against an authoritative citation registry would have caught every one of
  these mechanically.

## Sources (accessed 2026-08-20)

- https://arxiv.org/abs/2501.10868 (JSONSchemaBench)
- https://arxiv.org/pdf/2408.02442 (Let Me Speak Freely?)
- https://letsdatascience.com/blog/structured-outputs-making-llms-return-reliable-json
- https://www.emergentmind.com/topics/constrained-decoding-json-mode
- https://www.emergentmind.com/topics/trustworthy-retrieval-aligned-citation-evaluation-trace
- https://arxiv.org/abs/2510.17853 (CiteGuard)
- https://proceedings.iclr.cc/paper_files/paper/2025/file/4c88827decab6c046b881a2c3a99c76f-Paper-Conference.pdf (TRUST-SCORE)
- https://aclanthology.org/2025.naacl-short.38.pdf (FaithBench)
- https://arxiv.org/pdf/2504.17550 (HalluLens)
- https://github.com/vectara/hallucination-leaderboard/
- https://github.com/vectara/FaithJudge
- https://halluhard.com/
- https://dig.watch/updates/ap-ai-newsroom-rules
- https://mediahelpingmedia.org/advanced/how-newsrooms-are-applying-ai-rules/
- https://www.haqq.ai/blog/ai-legal-hallucination-audit
- https://www.nortonrosefulbright.com/en-us/knowledge/publications/792d8bf3/ai-in-litigation-update-on-gen-ai-sanctions-in-2026
