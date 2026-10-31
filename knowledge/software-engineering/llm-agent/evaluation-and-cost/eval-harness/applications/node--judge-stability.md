---
layer: application
type: application
subject: eval-harness
technique: judge-stability
stack: node
verified_on: 2026-10-31
verified_against: node@22
---

# Judge packets and the model bench — instrument discipline in scripts

## The judge packet, literally named

`scripts/test/judge-packet.mjs` assembles the per-run **JUDGE PACKET** for
the autonomy-eval loop: one reproducible artifact containing everything the
agent-judge reads — run metadata, seed and goal, per-persona outputs
(clipped at a declared budget, `clip(…, 2200)`), the reviews and memories
the team produced, mechanical grounding scores inherited from
`scorecard.json`, and a pointer to `repo.patch` for work-taxonomy
classification. The judge scores the declared dims
(correctness/actionability/specificity/role-fidelity) and writes
`judge.json`, which `evaluate.mjs` merges into the final verdict.

Two technique properties are load-bearing here:

- **The packet is assembled, not browsed.** The judge sees a frozen,
  scripted selection — same fields, same clipping, same ordering every run
  — so verdicts across runs are comparisons of the same evidence shape,
  not of whatever the judge happened to wander into.
- **Mechanical scores stay mechanical.** Grounding percentages are computed
  before the judge and handed to it as inherited facts ("Grounding
  (mechanical, inherited)"), not re-judged — the deterministic band is not
  re-litigated by the expensive instrument.

## The bench that pins its cells and defers its judge

`scripts/test/athena-model-bench.mjs` runs the model×effort matrix for the
companion's turn model: nine named cells (`o-base`, `o-med`, `s-high`,
`s-low-r`, …) with model and effort **pinned per cell** in a literal table
(`:102-124`), `--reps N` per cell, and scenario seeds/pinned sections frozen
in fixtures. Scoring is a deterministic validator (`runValidator`, checking
pinned-connector claims against the scenario contract); the header states
that the **LLM prose-quality judge is a deliberate follow-up** — the
harness already records everything a future judge needs (message, turn
text), but no unpinned judge is allowed to contribute verdicts yet. That
is assertion-first layering enforced by omission: better no judge than an
uncontrolled one.

## The bias measurements this repo owns

`docs/development/model-effort-guide.md` is the local proof that judge
biases are measured facts, not folklore:

- Two judge models scoring the same eight design runs agreed at **ρ =
  0.50** — and **each ranked its own model family first**. The guide's
  conclusion ("the model axis did not survive its own cross-check") is the
  own-family-preference systematic, observed in-house.
- Both judges saturated at 4/4, and one of them **awarded 4/4 on evidence
  discipline while logging 3–5 unsubstantiated claims per attempt** — the confidence-is-not-calibration finding, and the origin
  of the golden path's "read the transcripts" ritual: the benchmark's own
  fixture corpus passed a green data round-trip gate and was still
  anatomically broken the moment a human looked.

Together the three files split the technique's duties: the packet freezes
*what the judge sees*, the bench freezes *what the candidates are*, and
the guide documents *how far the judge itself can be trusted* — the drift
and bias ledger every score in the other two must be read against.

Re-checked 2026-10-31 against the project tree at `61029d7ae0`: the anchor above is
re-pointed to that commit. The judge packet, the `judge.json` merge in
`evaluate.mjs` and the bias figures in the guide read as described. The bench
matrix grew from nine cells to eighteen. It now adds chat-prompt cells,
Sonnet 5.5 and Haiku 5.5 cells, and two metered cells on a second engine, and
each cell still pins its engine, model, effort and prompt class. The LLM
prose judge is still a deliberate follow-up: the report prints
"LLM-judge prose scoring: not run". So the defer-the-judge reading holds. The
judges sentence above is corrected to match the guide. Both judges
saturated, but the guide attributes the unsubstantiated-claims count to one
judge, not to both.
