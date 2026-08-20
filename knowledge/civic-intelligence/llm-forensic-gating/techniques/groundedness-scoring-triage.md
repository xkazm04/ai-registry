---
layer: technique
type: technique
subject: llm-forensic-gating
technique: groundedness-scoring-triage
status: forged
laws: [lead-not-finding, deterministic-code-owns-numbers]
shared_with: []
use_when:
  - every deterministic gate passes and nobody has checked whether cited sources support their claims
  - a pending-review queue grows faster than human reviewers can clear it
---

# Groundedness-scoring triage

The deterministic stack checks everything decidable: shape, membership,
citation existence, reference reality, register. None of it checks the one
thing that makes a citation meaningful — whether the cited source actually
*supports* the claim bound to it. A claim can carry a real store id, a real
instrument number, a fetchable address, and still assert something its
evidence never says; today that gap is caught only at the human door.
Groundedness-scoring triage inserts a probabilistic layer between the
deterministic gates and that door: an independent verifier model scores each
claim–source pair for support, and the score is used to *order and thin* the
review queue — bounce clear non-support into re-runs, surface the shakiest
leads first — never to promote anything. It is a machine opinion about a
machine lead, and both stay leads.

## Procedure

1. **Score the binding the citation gate already established.** The unit is
   the claim–source pair the per-claim citation binding produced — not the
   verdict as a whole. Whole-verdict scores hide one unsupported accusation
   inside ten supported summaries; the accusatory unit is what can defame, so
   it is what gets scored.
2. **Keep the verifier independent of the analyst.** A different model, or at
   minimum a different prompt with no access to the analyst's reasoning —
   self-verification correlates errors, and a model grading its own homework
   converges on agreeing with itself. The verifier sees the claim, the
   resolved source content, and nothing else.
3. **Use the score in the two directions that cannot publish.** Clear
   non-support may hard-reject into the standard discard-and-re-run path —
   rejection is safe by construction, since nothing rejected ever renders.
   Everything else lands in pending review *ordered* by the score, weakest
   support first, so reviewer attention concentrates where the defamation
   risk is. There is no third direction: no threshold, however high, routes
   around the door.
4. **Calibrate against a labeled incident set before trusting the ordering.**
   Score a corpus of past human decisions — claims the door confirmed, claims
   it rejected — and measure whether the verifier's ranking would have
   surfaced the rejects early. An uncalibrated triage layer reorders the
   queue by noise while looking like diligence.
5. **Log and sample-audit the rejections.** A verifier that silently bounces
   honest work trains the same workarounds an over-broad gate does. Keep the
   rejected pairs, sample them on a schedule, and treat a measured precision
   failure as an incident: fix, keep the case as a regression fixture, and
   ship the sample's population size with the audit.

## Decision rules

- **A passing score upgrades nothing.** High support is not verification; it
  is a well-ordered lead. The verifier's verdict is exactly as machine as the
  analyst's, and copy or state that treats its pass as review asserts a
  verification level no one performed.
- **The score never renders and never persists as a product figure.** It is
  internal queue mechanics. The moment a support score reaches a reader — as
  a confidence badge, a percentage, a rank — a model has authored a published
  number, and the deterministic-ownership law is breached at the last step of
  a pipeline built to honor it.
- **Run it after the deterministic stack, never instead.** Decidable checks
  are cheap, exact, and re-runnable; the verifier is none of those. Scoring
  an object that would fail shape or membership wastes the expensive layer on
  verdicts the cheap layers already kill — and inverting the order tempts the
  team to let a good score excuse a hard-gate failure.
- **When verifier and reviewer disagree, that is contract signal.** A claim
  scored well-supported that the human rejects — or the reverse — is a case
  for the calibration set and often a symptom: a field conflating
  interpretation with assertion, a citation kind being misused. Feed the
  disagreement into the next schema and contract revision, not into a
  threshold tweak.
- **Throughput pressure tightens this layer, not the door.** When the queue
  floods, the sanctioned responses are stricter re-run thresholds and better
  ordering here — never an auto-approval band above some score. That rule
  exists at the door; this technique is its upstream instrument, not its
  loophole.

## When not to use it

Do not score the fields whose job is interpretation against source text as if
they were factual claims — a hypothesized effect is *licensed* to exceed what
any single source states, and an entailment check applied to it either flags
all honest analysis or gets tuned so loose it measures nothing; what the
verifier checks there is only whether the cited basis exists in the source,
not whether the hypothesis follows. Do not adopt the layer before the
deterministic stack is complete: triage over unfabrication-checked verdicts
ranks poison by plausibility. And do not let its existence relax the door's
staffing math — the technique buys reviewer *focus*, not reviewer *absence*,
and a queue that is never actually reviewed has a triage layer as its only
review, which is the exact state this subject exists to prevent.
