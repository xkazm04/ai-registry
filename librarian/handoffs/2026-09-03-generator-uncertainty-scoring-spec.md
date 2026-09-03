# XL spec — `generator-uncertainty-scoring`

**Status:** PROPOSED · dispatched in-session (intake run `intake-awelc-0903`)
**Source:** `github.com/kyrolabs/awesome-langchain` @ `9796b1d` → references
`cvs-health/uqlm` @ `5ef8ff4`, `cvs-health/langfair` @ `afd6dc0` (one author org, one voice)
**Bundle / category:** `llm-observability` / `quality-scoring` (flat, 5 subjects, no subcategories —
adding a 6th subject is legal; verified against `knowledge/llm-observability/taxonomy.json`)
**Proposed path:** `knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring/`
**Link depth:** subject doc → `../../_laws.md`; techniques → `../../../_laws.md`

## Why this is XL and not four amendments

The mechanical trigger fired: **four mechanisms share one home that does not exist.** But the
argument for the subject is stronger than the count, and it is the reason this is not an
amendment pass.

Every one of the five subjects in `quality-scoring` presupposes a **judge** — a metered model
call scoring a candidate against a rubric. The premise is never stated, and it is load-bearing
in at least four verified places:

- `judge-calibration-and-drift.md:19-21` — *"Every quality number in an LLM observability system
  flows through one instrument: the judge."* [V]
- `judge-contract-design.md:83-87` — *"One pipeline, two sources of score."* Two: judged-by-model,
  or a deterministic local check. [V]
- `production-trace-scoring.md:124-130` — *"The scoring loop is asynchronous and read-only against
  the serving path — it observes traffic, never gates it"* — an unconditional invariant whose only
  stated justification is price: *"The judge is a metered model call. Against unbounded traffic,
  'score everything' is a cost function with no ceiling."* [V, `:55-59`]
- `judge-calibration-and-drift.md:135-142` — *"agreement is judge-vs-human, drift is
  judge-now-vs-judge-then, repeatability is judge-vs-itself."* Three quantities, enumerated. [V]

A score computed from the generator's own output distribution is **neither** of the two sources,
falsifies the invariant's premise, and adds a fourth quantity. Landing these as amendments would
scatter one mechanism across four files and leave the premise itself unwritten — which is the
v1 failure the method's v2 amendment rule exists to end.

## The techniques this subject must carry

Each must carry a decision rule, not a description.

1. **`score-source-kinds`** — the third source of score. The contract types a dimension by *who
   decides*: the model against a rubric, a deterministic check, or **the generator's own
   uncertainty**. The third is stochastic (so the mechanical lane's "exactly reproducible"
   exemption does not apply) and consults no rubric (so anchors, weights, floors and nonce
   fencing are inapplicable — there is no prompt for a candidate to talk to). Decide: which
   dimensions may take this kind, and what its verdict flows through.
2. **`scorer-cost-class`** — cost and API access as the *first* selection input, ahead of accuracy.
   The ladder: a single-generation white-box scorer over token probabilities the API already
   returned (no extra call), an N-sample consistency scorer (N generations), a judge (a separate
   metered call). Must carry the precondition that makes the cheapest tier reachable at all —
   *the serving API exposes its own token probabilities* — and must state the consequence for
   `production-trace-scoring`'s read-only invariant: that invariant is a consequence of the
   scorer's cost class, not a property of quality scoring.
3. **`probability-calibration-is-not-agreement`** — the corpus measures correlation, MAE,
   directional bias and kappa; all are *rank and concordance* statistics. Every downstream
   mechanism in the bundle (gating floors, the trust bar, regression gating's absolute floor)
   is an **absolute-level** claim on a 0–1 scale, and nothing measures whether 0.7 means 70%.
   Must carry the measured instance and its protocol, and must carry the refutation:
   **ECE 0.428 → 0.031 after isotonic/Platt fitting, while MCE moved 0.511 → 0.500 — average
   honesty bought, worst-bin honesty unbought.** A floor is a worst-bin claim.
4. **`generator-vs-itself`** — the fourth quantity. The subject already re-scores a frozen slice
   N times to measure the *judge* arguing with itself (`repeatability-floor`). The identical
   apparatus pointed at the **generator** is a quality signal rather than an instrument caveat.
   Must state the frame discriminator, because `quality-regression-gating:41-44` lists
   sample-to-sample generator variance as *noise to be stripped* — correct for a gate wanting a
   per-case point estimate, inverted for a scorer wanting the spread. Name which frame you are in.

## Boundaries this subject must NOT absorb

- Rubric design, anchored levels, weights, nonce fencing → `judge-contract-design`.
- Judge-vs-human agreement, judge drift, the repeatability floor → `judge-calibration-and-drift`.
- Sampling policy, spend segregation, the serving-path invariant itself → `production-trace-scoring`
  (this subject supplies the *condition* on that invariant; it does not restate it).
- Benchmark slicing, dataset freezing → `cross-provider-benchmark-operations`.
- Bias/fairness assessment → out of bundle entirely.

## Open questions the drafter must DECIDE, not discover

- **Does a judge-free score ever gate?** The source's default configuration says yes
  (`ensemble.py:54`, `use_best: bool = True`) and rebuilds long-form answers by dropping claims
  below 1/3. Decide whether the subject licenses in-path consumption, and under exactly what
  cost and calibration preconditions.
- **What does the third kind do when the API returns no logprobs?** Degrade to the N-sample
  consistency tier, or refuse? Name the fallback and its cost.
- **Where does the subject sit relative to `eval-harness`?** Builder-side harnesses assume their
  assertions are correct; this is production-side with no ground truth. State the boundary.

## Honest limits on the evidence — the drafter must not overclaim

- The headline comparative (judge-free scorers "consistently outperform LLM-as-a-Judge";
  ROC-AUC 0.88 vs 0.51 on one benchmark) is **[H]** — read through a fetch summarizer, not from
  the table. It is arXiv:2504.19254 / JMLR v27/25-1557. **Re-derive it from the JMLR PDF or do
  not cite a number.**
- The 0.51 figure is a *self-judge* — same model, no rubric, no anchors. That is the weakest
  judge configuration, not a well-designed judge contract. Do **not** write this subject as a
  demotion of judges. It establishes that a judge at chance exists in practice where a cheaper
  instrument discriminated, and nothing stronger.
- The calibration table (ECE/MCE) **is** [V] — read from the notebook's own output cell, with its
  protocol (NQ-Open, 1500 prompts, 1000 train / 500 test). Cite that one freely.
- A black-box uncertainty score measures the model's self-consistency, **not correctness**. A
  confidently wrong model scores high. I could not find an explicit admission of this in either
  tree; the strongest in-tree evidence is the measured 0.90-confidence / 0.48-accuracy gap, which
  *is* that failure quantified. Carry the boundary.

## Where an instance already exists that somebody can open

`librarian/applied.md` and the fleet: `politicas`, `LightTrack` and `pumper` all declare
`llm-observability`. Any of their scoring paths is a live seam for technique 2's cost ladder.
