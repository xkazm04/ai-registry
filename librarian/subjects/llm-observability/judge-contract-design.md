---
domain: llm-observability
subject: judge-contract-design
last_touched: 2026-09-10
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

## 2026-09-10 — architecture re-review after the compression revert

All eleven documents read in full at restored bytes: golden path, seven
techniques, three applications. Nothing under `knowledge/` was edited.

The subject's frame — that the contract is a stored, versioned, immutable-in-effect
object, and that a rubric passed as an ad-hoc string "is not a contract; it is a
mood" — is the correct organizing claim, and the two hardest documents here
(`nonce-fenced-candidate-isolation`, `mixed-rubric-honesty`) are both unusually
good. The fence's four parts are each argued from a mechanism rather than asserted:
a per-call nonce because a constant nonce is just a longer fixed marker; visible
neutralization of *any* marker shape because a model on a repair path can echo a
previous prompt's fence back; and the invariant stated as something testable
(strip every well-formed fenced block and the remainder must contain no
candidate-controlled bytes) rather than as a property to believe. Its
self-limiting clause — read a quiet flag as "no boundary forgery", never as "clean
input" — is the single most important sentence in the subject, and the field
application backs it with the right instance (JudgeDeceiver optimizes a
naturalistic token sequence that never touches a marker).

**The load-bearing empirical claims sit in the layer with no citations.**
`techniques/reference-guided-grading.md` attributes precise magnitudes to "the
founding judge-measurement study" — the default contract "misgraded most cases",
step-by-step reasoning "cut the failures by half", derive-then-grade "cut them to a
small fraction of the default" — and names no study, no venue, no identifier.
`techniques/bias-counterbalancing-instructions.md` grounds its structural
counterbalance on "published benchmark work has shown an instruction-only judge's
preference swinging by tens of points". `techniques/nonce-fenced-candidate-isolation.md`
grounds its ceiling clause on "published measurements of judge attacks show that
in-band class succeeding at high rates". Each figure is the reason its rule exists.
The subject's *applications* carry proper identifiers — arXiv:2403.17710,
arXiv:2504.18333, arXiv:2404.04475 and others — so the corpus has the citations; it
simply does not carry them into the layer where the claims are made. That is
worth fixing, because a technique is the artifact a reader acts on and it currently
cannot be checked from its own bytes. (The magnitudes are consistent with the
MT-Bench reference-guided-grading result as I hold it, but "consistent with what
the reviewer remembers" is not a source and I am not recording it as one.)

**One source class carries more weight than it can bear.**
`applications/process--nonce-fenced-candidate-isolation.md` gives its most
decision-relevant numbers — random-delimiter fencing at 89.7% defense versus 60.7%
without, and a terse "strict" boundary contract beating a threat-model explanation
96.3% to 89.1% — to a dev.to community benchmark. Those two figures are what
license the technique's declarative preamble and its visible-neutralization
choice, and they are the only numbers in that document not from a peer-reviewed or
arXiv-indexed source. Mark them as a community benchmark rather than a
measurement, or replace them.

**One attribution to sharpen in the same document.** The Length-Controlled
AlpacaEval result is reported as narrowing the verbosity swing "and *improved*
human correlation (Spearman 0.94 → 0.98)". That correlation is with Chatbot Arena
rankings — an aggregate of human preferences over models — not a per-item human
label agreement, and a reader deciding whether to trust a length-adjusted score on
one response will read it as the latter.

**One unaddressed boundary between two techniques.** `gating-floors` says floors
apply to a dimension's final score, and "for a sampled dimension that is the
cross-sample mean". `mixed-rubric-honesty` says agreement is computed over
per-sample *overalls* across judged dimensions. Neither says what happens when the
floor decision flipped across samples: a rubric can report high agreement on the
overall while half its samples scored a floored dimension above its floor and half
below. The verdict then carries a floor hit that was a coin flip, reported with the
authority of a mean, and the reader sees exactly the "invisible veto" failure
`gating-floors` names. The fix is small — report per-dimension sample dispersion
for floored dimensions, or the fraction of samples that hit the floor — but nothing
in the subject asks for it today.

**One seam with the sibling subject.** `deterministic-dimension-kinds` says an
all-mechanical rubric records "the determinism stamp set to exact". The
benchmark-operations subject's `determinism-stamping` stamps two halves and folds
to the weaker, with an unrecorded half folding to "not recorded" rather than to its
neighbour's level. An all-mechanical rubric has an exact *judging* half and a
generation half that plainly happened and is not stamped here. Read across the two
subjects, the run folds to "not recorded", not exact. Say which half the stamp is
on.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/judge-contract-design",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:3eaf5833eb0184fc",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes: golden path, 7 techniques, 3 applications. Citation coverage audited across the technique and application layers; the Length-Controlled AlpacaEval attribution and the arXiv identifiers were checked for plausibility against the reviewer's own knowledge and are recorded as unverified where that is all the support available. The gating-floors / mixed-rubric-honesty seam and the determinism-stamp seam with the sibling benchmark subject were traced by cross-reading. Not evaluated: the LightTrack prompts, fence and judge line anchors, any executed test, the dev.to delimiter benchmark, and any application maturity or verified_on refresh. No knowledge/ file was edited.",
  "counterexamples": [
    "A floored sampled dimension whose per-sample scores straddle its floor: the verdict reports high agreement on the overall and a floor hit that half the samples disagreed with, which is the invisible veto the floors technique names, arriving through the aggregation instead of through the reporting.",
    "A candidate that persuades the judge from inside its own fenced block — JudgeDeceiver's entire design — passes the fence untouched and unflagged, and the subject correctly says so, which leaves the contract with no instrument of its own against the attack class the field measures as most successful.",
    "An all-mechanical rubric stamps judging exact and leaves generation unstamped; folded by the sibling subject's pessimistic rule the run reads 'not recorded', not exact, so the two subjects disagree about the same run.",
    "A rubric re-versioned after a weight change produces two versions of one contract, and nothing states what a leaderboard does with verdicts spanning them beyond 'announce it'.",
    "A mechanical dimension misconfigured as a pattern check with no pattern fails loudly by design — but a pattern that is present and wrong scores every candidate zero silently, and the operator-error rule only covers the absent case."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/judge-contract-design",
      "result": "Established by full read that the subject's quantitative claims are concentrated in the technique layer and uncited there, while the arXiv-indexed identifiers that would support several of them sit only in the applications. It did not establish whether the uncited magnitudes are correct; the reviewer's own recollection of the founding study's grading-failure figures is consistent with them, which is not a source and is not recorded as one."
    },
    {
      "path": "knowledge/llm-observability/quality-scoring/cross-provider-benchmark-operations/techniques/determinism-stamping.md",
      "result": "Read as a cross-check on the all-mechanical determinism claim in deterministic-dimension-kinds. Established that the sibling subject stamps generation and judging separately, folds to the weaker half, and folds an unrecorded stamp to 'not recorded' rather than to its neighbour's level — under which an all-mechanical rubric's run does not read as exact. It did not establish which subject's phrasing is intended to govern."
    }
  ],
  "documents": {
    "judge-contract-design.md": {
      "disposition": "keep",
      "reason": "The contract-not-a-mood frame, the stored-and-versioned argument from the accounting law, the dimensions-not-a-vibe section, the conjunction pass semantics, and the hostile-by-construction treatment of candidate text are all correct and each hands off to a technique that carries it. The failure-mode catalogue names seven distinct mechanisms rather than restating one."
    },
    "techniques/weighted-anchored-dimensions.md": {
      "disposition": "keep",
      "reason": "Four-part dimension shape, anchors described as observable properties rather than adjectives, the narrow-scale argument (a judge discriminates coarsely, so a fine unanchored scale adds noise averaging cannot remove), and the version-rather-than-tune rule tied to the retroactive-restatement law. The 'what this is not' section correctly refuses to overclaim determinism."
    },
    "techniques/gating-floors.md": {
      "disposition": "clarify",
      "reason": "The conjunction semantics, the per-dimension floor-hit reporting, the floor-at-the-unacceptable-anchor rule and the floor-sparingly discipline are all right. One boundary is unaddressed: floors apply to the cross-sample mean, so a floored dimension whose samples straddle the floor produces a floor hit that was a coin flip, reported with a mean's authority. Ask for per-dimension dispersion or a floor-hit sample fraction on floored dimensions."
    },
    "techniques/deterministic-dimension-kinds.md": {
      "disposition": "clarify",
      "reason": "The kind vocabulary, the loud-operator-error rule, the null-not-zero cost treatment and the auditable mechanical reasoning are all correct, and the phantom-judge failure mode is well named. The claim that an all-mechanical rubric sets 'the determinism stamp set to exact' does not say which half of the sibling subject's two-half stamp it means; folded by that subject's rule the run reads 'not recorded'. One clause fixes it."
    },
    "techniques/mixed-rubric-honesty.md": {
      "disposition": "keep",
      "reason": "Four rules, each closing a specific invisible dishonesty, with the reasons stated mechanically: shared filter between prompt and schema so they cannot drift; agreement over sampled dimensions only because a mechanical dimension drags a mixed rubric toward perfect agreement in proportion to its weight; parse failure as a measurement of the judge rather than of the candidate; every paid sample's reasoning kept in index order."
    },
    "techniques/nonce-fenced-candidate-isolation.md": {
      "disposition": "clarify",
      "reason": "The mechanism is the best-argued in the subject and the self-limiting clause — a quiet flag means no boundary forgery, never clean input — is its most valuable sentence. The clause's evidence is 'published measurements of judge attacks show that in-band class succeeding at high rates', with no identifier; the supporting arXiv reference exists in this subject's own field application and should be carried into the technique."
    },
    "techniques/bias-counterbalancing-instructions.md": {
      "disposition": "clarify",
      "reason": "The two-layer discipline (instructions mitigate, structure measures) is the right shape, the tie-outlet-as-anti-position-hygiene observation is a real insight, and the refusal to pile on unmeasurable counter-instructions is the correct restraint. The verbosity clause rests on 'published benchmark work has shown … swinging by tens of points' with no citation, while the exact figures and identifier sit in the sibling application. Carry the reference up."
    },
    "techniques/reference-guided-grading.md": {
      "disposition": "reverify",
      "reason": "Three quantified magnitudes are attributed to 'the founding judge-measurement study' with no study named, no venue and no identifier, and they are the entire evidential basis for the technique ('the mechanism, not the instruction, is what moved the number'). The design rules that follow — reference derived without the candidate in view, reference as scratch never truth, inherited-error spot-checking, second-stage budget — are sound independently. Evidence unresolved, not refuted."
    },
    "applications/process--bias-counterbalancing-instructions.md": {
      "disposition": "reverify",
      "reason": "Reads as a faithful realization: full instruction set in the pairwise block, one shared filter feeding prompt and schema, verdicts matched by echoed case_id rather than position, and the structural halves documented at the call sites that perform them. Not re-executed and the prompts.rs / judge.rs / BENCHMARK_FRAMEWORK.md line anchors were not checked against the tree. The claim that the caller counterbalances is recorded from a doc comment, which evidences intent rather than behaviour."
    },
    "applications/process--nonce-fenced-candidate-isolation.md": {
      "disposition": "reverify",
      "reason": "The arXiv-indexed layer is appropriate and the JudgeDeceiver instance is exactly the right support for the technique's ceiling clause. Two items are not: the delimiter-efficacy figures (89.7 vs 60.7, 96.3 vs 89.1) that license two of the technique's design choices come from a dev.to community benchmark and should be labelled as such; and the Length-Controlled AlpacaEval correlation improvement is with Chatbot Arena rankings, not per-item human labels, which the phrase 'improved human correlation' will be read as. refresh_by 2026-11-20 still in force."
    },
    "applications/rust--nonce-fenced-candidate-isolation.md": {
      "disposition": "reverify",
      "reason": "Documents the two details a from-scratch design misses — neutralize every marker shape ever used because of the repair-path echo, and preserve the payload as declawed evidence rather than deleting it — and the instruction_channel test states a syntactic invariant honestly as a syntactic invariant. The nonce construction (clock, atomic counter, stack address, hashed twice) is disclosed as non-cryptographic with its threat model, which is right, but unpredictability against a determined pre-call author is asserted rather than shown. Not re-executed; anchors unchecked."
    }
  }
}
```
