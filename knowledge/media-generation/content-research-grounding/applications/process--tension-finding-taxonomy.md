---
layer: application
type: application
subject: content-research-grounding
technique: tension-finding-taxonomy
stack: process
status: forged
---

# Process: the ten-phase research prompt (Gravitone pipeline)

The Gravitone video pipeline realizes tension-finding — and the whole
research-before-writing split — as a single prompt document,
`pipeline/RESEARCH-PROMPT.md`, whose deliverable is a `notebook.json`
conforming to `pipeline/NOTEBOOK-SCHEMA.md`. The brief states the split in
its opening lines (`RESEARCH-PROMPT.md:13-18`): *"You are not writing prose
and you are not choosing an engine… The failure you exist to prevent: a model
handed a topic writes a wiki timeline… That happens when research and writing
are the same step. They are not."*

## The phase order

Ten phases (`RESEARCH-PROMPT.md:20-157`) sequence the techniques of this
subject: Phase 0 declares the prior; Phase 1 builds the factual spine
breadth-first, deriving the subject's own 5-7 domains into `domains[]` with
the baseline and counter-case rows mandatory in every derived table
(`:29-43`); Phase 2 is the tension hunt; Phases 3-4 build mechanisms and
reversals; Phase 5 converts scales; Phase 6 steel-mans; Phase 7 records
unknowns; Phases 8-9 assess engine fit, currency, and gaps.

## Tension-finding as written

Phase 2 (`RESEARCH-PROMPT.md:55-82`) carries the five-shape taxonomy
verbatim — prediction-that-came-true-and-didn't-work (annotated *"Strongest.
This is what the Bitcoin run found"*), number-contradicts-narrative,
mechanism-runs-backwards, the absent thing, the category error — and the
structured output `{expectation, reality, why_it_is_a_tension}` that
`NOTEBOOK-SCHEMA.md:49-56` types as the notebook's "load-bearing field",
consumed by composition step 1.

Three of the prompt's rules confirm the technique's decision rules exactly:

- **Null is a pass**: *"If you cannot find one, stop and say so. A topic with
  no tension is not a video, and reporting that honestly is a successful
  run"* (`:69-70`).
- **Baseline sizing before scoring** (`:72-77`): record `normal_range`,
  locate the instance, and if ordinary, either report the null or pivot to
  *"why everyone needed this to be anomalous"* — "two honest outcomes and no
  third".
- **Counter-case coupling** (`:79-82`): `strength` measures checkability,
  and a counter-case surviving Phase 6 downgrades it one step, naming the
  case that did it — "a counter-case that survives and leaves the score
  untouched is the failure this rule exists to catch."

## The quality bar as the gate

The 17-item checklist (`RESEARCH-PROMPT.md:161-191`) makes the taxonomy's
outputs auditable: tension written and honestly graded; effect shown outside
normal variation *or* the tension explicitly about the reaction; every
compared pair of quantities recomputed for magnitude, window, and basis —
with the scar quoted inline: *"77,800 is slightly more than 270,000 over the
same 60-day window passed twelve self-checks because none of them was
arithmetic."*

## The upward lesson the repo teaches

The prompt's closing cost note (`:193-197`) is the strongest confirmation of
the technique's premise: run 1 used six web searches and rendered three
scripts from one notebook; the bottleneck was Phase 2 — tension-finding —
"which is judgment, not retrieval. Do not optimise this prompt by adding
searches; optimise it by making Phase 2 sharper."
