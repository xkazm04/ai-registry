---
subject: generator-uncertainty-scoring
domain: llm-observability
last_touched: 2026-09-10
touched_by: intake
dry_streak: 0
---

# generator-uncertainty-scoring

Created by [[2026-09-03-awesome-langchain]]. Five techniques, forged in-session by a
dispatched worker against a spec written in the same session — `score-source-kinds`,
`scorer-cost-class`, `probability-calibration-is-not-agreement`, `generator-vs-itself`,
and `score-source-ensembling` (the worker's own addition, accepted).

## What the gap actually was

An **unstated premise load-bearing across a whole category**. Five subjects in
`quality-scoring` presuppose a judge, and four verified enumerations say so out loud:
"Every quality number ... flows through one instrument: the judge"; "One pipeline, two
sources of score"; the read-only-against-the-serving-path invariant, justified solely by
"The judge is a metered model call"; and "agreement is judge-vs-human, drift is
judge-now-vs-judge-then, repeatability is judge-vs-itself".

A score computed from the generator's own output distribution is neither of the two
sources, falsifies the invariant's premise (its marginal cost can be zero, so the
argument from unbounded spend does not reach it), and adds a fourth quantity —
generator-vs-itself, which is the apparatus the subject already points at the judge,
turned around. Four mechanisms, one home that did not exist: the XL trigger fired by
count rather than by judgment, which is what the v2 rule was written for.

## The correction that matters most

The claim that motivated the subject was **wrong in the opposite direction**. A wave
worker reported, through a fetch summarizer, that judge-free scorers "consistently
outperform" judges. It was marked `[H]`; the forge brief required re-derivation or
removal; and the worker read the papers directly. The spec's citation had conflated two
documents, the quoted figures were in neither, and among non-ensemble scorers **a model
judge was the best available in 11 of 24 scenarios** — the plurality. The genuine
"judge at chance" instance is a *small* judge on a math benchmark, while a large judge
on the same benchmark was the best scorer available.

The subject therefore carries a section titled "This is not a demotion of judges, and
the measurement says so". Director-verified from the primary notebook rather than from a
report: ECE 0.428037 → 0.030675 while MCE moved 0.511129 → 0.500000. Average calibration
honesty was bought; worst-bin honesty was not — and a gating floor is a worst-bin claim.

## Open

Two things the forge worker flagged as low-confidence, which a later pass should check:
a novel reading of the unbudgeted-quality-apparatus law, used in *tension* rather than
in support; and an error-correlation mechanism asserted for the ensembling technique
that the paper does not measure. A proposed law recurred three times and was
deliberately not minted — *a configuration fitted against labels is valid only over the
generator-and-task pair it was fitted on, and carrying it across either is an untested
extrapolation that fails silently*. Return if a second bundle sights it.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/generator-uncertainty-scoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:437fdfa98eeb2048",
  "disposition": "reverify",
  "coverage": "All 6 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Many different correct paraphrases can have high textual disagreement.",
    "Squaring scores preserves order but changes mean absolute error and generally Pearson correlation.",
    "A classifier cutoff tuned on held-out outcomes can be useful without interpreting its score as a correctness probability.",
    "Parallel samples can multiply token spend without multiplying wall time by N."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "generator-uncertainty-scoring.md": {
      "disposition": "reverify",
      "reason": "Token likelihood and sample consistency are different proxies, not correctness or guaranteed useful rankings. Mechanical checks need correct references and nonzero resources. No-extra-call is not zero latency; asynchronous judging is an architecture policy, not a necessity. Thresholds can be empirically validated without probability calibration; percentiles do not certify safety. The precise 24-scenario and ECE claims lack an identifiable primary citation in the owned documents and remain unverified."
    },
    "techniques/generator-vs-itself.md": {
      "disposition": "clarify",
      "reason": "Repaired disagreement as proof of ignorance, gate variance as necessarily nuisance, sampling control versus identical repeated seeds and mechanical checks as free truth. Multiple valid answers and target variability can be meaningful outcomes."
    },
    "techniques/probability-calibration-is-not-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired MAE and all concordance statistics as rank-invariant, ECE as per-item error, threshold as necessarily probability claim and worst bin as necessarily at the threshold. Raw rankings also require evidence of useful discrimination."
    },
    "techniques/score-source-ensembling.md": {
      "disposition": "reverify",
      "reason": "Different error families do not guarantee averaging improves performance. Equal or policy-selected weights need not be fitted from labels; learned weights require separated training/selection/test data and uncertainty. A fitted classification cutoff need not claim probability calibration. Model-generated labels have varying provenance and bias rather than universally no measurement value. Precise scenario counts and transfer findings lack an identifiable source here."
    },
    "techniques/score-source-kinds.md": {
      "disposition": "reverify",
      "reason": "A deterministic function of recorded probabilities can be reproducible; mechanical checks can use stochastic or expensive components and are not universally exact truth. Semantic consistency can employ an entailment model and prompt, so no-instruction-channel is not universal. Answerability/hedging are not directly measured by peaked likelihood. Normalizing a score to zero-to-one does not establish calibration or aggregation validity."
    },
    "techniques/scorer-cost-class.md": {
      "disposition": "clarify",
      "reason": "Repaired zero marginal latency, N-fold wall time, automatic paid fallback, self-hosting guarantees and cost-class-only serving prohibition. Quality and safety requirements constrain affordability; random sampling can estimate traffic quality with uncertainty."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

All six documents read in full at restored bytes: golden path and five
techniques. Nothing under `knowledge/` was edited.

The subject's reason for existing is sound and unusually well argued. Four
neighbouring subjects presuppose a judge, and the presupposition was load-bearing
and unwritten until this one named it; a score computed from the generator's own
output distribution is neither of the contract subject's two sources, adds a
fourth quantity beside the calibration subject's three, and falsifies the premise
under the trace-scoring subject's read-only invariant. Restating that invariant as
a *consequence of the scorer's cost class* — binding absolutely at tier 2,
economically at tier 1, not at all at tier 0 — is the contribution, and the
document is careful to leave the invariant where it lives rather than relaxing it.
The section titled "This is not a demotion of judges, and the measurement says so"
is the sort of self-correction a corpus should reward: the claim that motivated the
subject turned out to be wrong in the opposite direction, and the document says so
in its own headline rather than in a footnote.

**The subject's evidence is not in the subject.** Every quantitative claim here is
uncited: the expected calibration error moving 0.428 → 0.031 while maximum
calibration error moved 0.511 → 0.500; the fifteen hundred prompts split one
thousand fit / five hundred held out; the best non-ensemble scorer being a model
judge in eleven of twenty-four scenarios, a consistency scorer in seven, a
token-probability scorer in six; the tuned combination beating every component in
twenty of twenty-four and leading on a threshold-dependent metric in seventeen; the
N-sweep from roughly 0.54–0.57 at one sample to roughly 0.75–0.80 at fifteen; the
small-judge-at-chance instance. Not one carries a paper, a venue or an identifier
in any of the six documents. These are not decorative figures — the MCE-did-not-move
result *is* the technique
`probability-calibration-is-not-agreement`, and the 11/7/6 split *is* the argument
against dropping judges. The note above this entry records that a director verified
the calibration numbers from the primary notebook and that a forge worker read the
papers directly after the spec's citation was found to have conflated two
documents, so the evidence exists in this project's history; it is simply absent
from the artifacts a reader consumes. The previous record reached the same verdict
and I confirm it rather than carrying it: this stays `reverify` until the citations
land, and the fix is cheap — the sibling `judge-contract-design` already
demonstrates the pattern, carrying arXiv identifiers in a dated application.

**No applications, which is the structural fact about this subject.** Six
documents, five techniques, zero application files — the only subject in this group
in that state. Nothing here has a field sighting, and the subject's central move
(licensing in-path consumption under two exact preconditions) has never been
applied against a real serving path. That is not a schema violation and the
coverage script accepts it, but it means the boundary conditions are reasoned
rather than observed, and the two items the forge worker flagged as low-confidence
— the novel reading of the unbudgeted-quality-apparatus law used in *tension*
rather than in support, and the error-correlation mechanism asserted for ensembling
that the paper does not measure — remain exactly as flagged.

**One cross-document rule that does not survive the ladder.**
`techniques/generator-vs-itself.md` says "When N is one, there is no spread and the
score does not exist. Return an absence, not a confident zero-variance one." Read
inside that technique, which is about generator variance, that is right. Read
against the golden path's ladder, tier 0 *is* an N=1 score — a single generation
whose token probabilities carry a perfectly good uncertainty reading — and a reader
carrying the rule across tiers nulls out the cheapest tier the subject exists to
promote. Scope the sentence to consistency scoring.

**One cost claim stated more absolutely than it holds.**
`techniques/scorer-cost-class.md` describes tier 0 as "No additional call, no
additional token, no additional latency. The marginal cost is arithmetic over data
already in hand." The availability precondition is handled well — a capability
check at configuration time rather than a hope checked per call — but several
serving APIs require an explicit request parameter to return log probabilities, and
that parameter changes the response payload. "Zero marginal *model* cost" is the
defensible form; response size and any per-request opt-in belong in the sentence,
because the subject's own admissibility condition for in-path scoring is that the
marginal cost is *genuinely* zero, and nothing here watches whether it still is.

**One sentence a reader will act on with the least evidence behind it.** "A model's
own accuracy on a task predicted its quality as a judge of other models on that
task" is offered as a usable heuristic for judge selection, with no effect size, no
count of scenarios it held over, and no source. It is the most directly actionable
claim in the subject and the least supported.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/generator-uncertainty-scoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:07c79704a464fa5d",
  "disposition": "reverify",
  "coverage": "All 6 owned documents read in full at restored bytes: golden path and 5 techniques; the subject owns no applications. Citation coverage audited across every quantitative claim in the subject and cross-read against this note's own history, which records director verification of the calibration figures from a primary notebook. The N=1 rule and the tier-0 cost claim were traced across the ladder in the golden path. Not evaluated: any of the underlying papers or notebooks (not fetched), any scorer implementation, the two forge-flagged low-confidence items, and consumer or field witness of any kind — there is none to evaluate. No knowledge/ file was edited.",
  "counterexamples": [
    "A model that has memorized a wrong fact answers identically on every draw: maximum consistency, maximum reported confidence, zero correctness. The subject names this as the characteristic failure and contains no mechanism that detects it.",
    "A tier-0 score is computed from a single generation, and generator-vs-itself's rule says a score at N of one does not exist — so the ladder's cheapest rung is nulled out by a rule written one document away.",
    "A strictly monotone rescaling leaves every concordance statistic unchanged while moving calibration error across its range, so the entire body of agreement evidence the neighbouring calibration subject holds is silent about every threshold this subject sets.",
    "An in-path tier-0 scorer whose provider begins charging for log probabilities has changed cost class with no code change, and the admissibility condition ('while its marginal cost is genuinely zero') has no mechanism watching it.",
    "An ensemble whose highest-weighted component is unavailable for one response: the rule forbids silent renormalization, but the composite is then unavailable on exactly the responses where a component failed, which is not a random subset of traffic."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring",
      "result": "Established by full read that every quantitative claim in the subject — the 0.428/0.031 expected calibration error pair, the 0.511/0.500 maximum calibration error pair, the 1500/1000/500 protocol, the 11/7/6 best-scorer split over 24 scenarios, the 20/24 and 17/24 ensemble results, and the 0.54-0.57 to 0.75-0.80 N-sweep — appears without a paper, venue or identifier in any owned document, and that the subject owns no application files at all. It did not establish whether any of those figures is correct."
    },
    {
      "path": "librarian/subjects/llm-observability/generator-uncertainty-scoring.md",
      "result": "The subject note's own history records that the calibration figures were director-verified from the primary notebook rather than from a report, that a forge worker read the papers directly after the founding spec's citation was found to have conflated two documents, and that two items were flagged low-confidence at forge time. This establishes that the evidence exists in project history and remains absent from the consumed artifacts; it does not substitute for a citation in the documents."
    }
  ],
  "documents": {
    "generator-uncertainty-scoring.md": {
      "disposition": "reverify",
      "reason": "The premise — four neighbouring subjects presuppose a judge, and a generator-distribution score is neither source, adds a fourth quantity and falsifies the invariant's premise — is correct and well argued, as is the refusal to read the comparison as a demotion of judges. Its two most consequential numbers (the calibration pair, the 11/7/6 split) carry no citation, and one boundary needs a carve-out: tier 0 is an N=1 score, which a rule in generator-vs-itself declares nonexistent."
    },
    "techniques/score-source-kinds.md": {
      "disposition": "keep",
      "reason": "The stochastic-and-rubricless cell is genuinely the thing that makes this a kind rather than a variant, and the document is precise about which inherited rules do not carry: not the mechanical agreement exemption (this kind is a draw, not a constant) and not the rubric rules (there is no prompt for a candidate to hijack). The orientation clause — normalize the sign once at the scorer boundary, because a mis-signed confidence still looks like a plausible number — is a real and cheap insight."
    },
    "techniques/scorer-cost-class.md": {
      "disposition": "clarify",
      "reason": "Cost class as the first selection input with accuracy as the tiebreaker among affordable tiers is the right inversion, the binary availability precondition is correctly a configuration-time capability check, and the degrade-and-say-so rule is properly a disclosure rather than a substitution. Tier 0's cost is stated as unconditionally zero; several serving APIs require an explicit opt-in parameter that changes the response payload, so 'zero marginal model cost' is the defensible form, and it matters because the in-path admissibility condition turns on that word."
    },
    "techniques/probability-calibration-is-not-agreement.md": {
      "disposition": "reverify",
      "reason": "The strongest reasoning in the subject: concordance and calibration answer questions that sound identical in English, a floor is a worst-bin claim rather than an average one, and the tell (a monotone rescaling that every concordance statistic cannot see would change the decision) is checkable. The entire refutation rests on one uncited experiment's four numbers, and the document's own decision rule tells its reader to say so when a held-out sample is small — advice it does not follow about its own source."
    },
    "techniques/generator-vs-itself.md": {
      "disposition": "clarify",
      "reason": "The four-quantity table and the frame discriminator are correct, and 'the failure is not choosing wrongly, it is failing to say' is the right diagnosis. The compute-once-derive-twice rule is the useful operational consequence. The N-of-one rule ('the score does not exist') is stated without scope and is false of tier 0, where a single generation's token probabilities carry a real score; scope it to consistency scoring. The N-elbow figures are uncited."
    },
    "techniques/score-source-ensembling.md": {
      "disposition": "reverify",
      "reason": "The label dependency, the per-generator-per-task scope condition, the refusal of a generator grading its own answer key, and the fix-the-objective-before-looking rule are all correct and correctly framed as boundaries rather than contradictions. Two items stay open: every number (20/24, 17/24, 11/7/6) is uncited, and the error-correlation mechanism offered as the reason averaging works was flagged at forge time as something the paper does not measure — it remains asserted here as the explanation."
    }
  }
}
```
