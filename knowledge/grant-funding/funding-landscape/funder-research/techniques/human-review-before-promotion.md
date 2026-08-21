---
layer: technique
type: technique
subject: funder-research
technique: human-review-before-promotion
status: forged
laws: [never-fabricate-a-figure, clean-is-not-ready]
shared_with: []
use_when: [moving discovered candidates into a live corpus, designing the review queue and its states, making promotion safe to re-run]
---

# Human review before promotion

The final stage of the research pipeline is a person. Every automated defense
— instruction design, structural validation, adversarial verification —
reduces the fabrication rate; none zeroes it, and the cost asymmetry decides
the rest: a fabricated program that reaches applicants damages trust in the
entire corpus, while a real program delayed a day by review costs almost
nothing. So discovered candidates land in a **staging queue**, and only an
explicit human approval moves a row into the live corpus. The technique is
the mechanics that make this gate cheap enough to sustain and safe enough to
re-run.

## The state machine

Each candidate carries exactly one review state, and the transitions are
one-directional:

**pending → approved | rejected**, then **approved → promoted**.

- **Pending** is where the pipeline's authority ends. Nothing the pipeline
  computes — however high the confidence — moves a row past pending.
- **Approved** records the human decision but is *not* presence in the
  corpus. The separation matters: approval is a judgment, promotion is a
  write, and conflating them makes failures of the write invisible.
- **Promoted** is set only after the corpus write *demonstrably happened*.
  This is the load-bearing subtlety: if promotion marks rows "promoted" and
  then writes — or marks them when the write silently no-ops because storage
  is unavailable or misconfigured — the approvals are consumed and lost,
  and a re-run finds nothing to do while the corpus holds nothing. Mark
  promoted only on a confirmed non-zero write; on anything else, leave the
  row approved so the operator can fix the environment and simply run
  promotion again. A clean-looking promotion run over a dead store certifies
  nothing.
- **Rejected** rows are kept, with the reviewer's reason where one is given.
  They are the pipeline's ground-truth error set — the only data from which
  discovery instructions, verifier strictness and confidence weights can be
  tuned — and they inoculate future runs: a rediscovered rejected program
  should be recognized, not re-reviewed from scratch.

Idempotence falls out of the states: promotion selects only rows still
"approved," writes them, and advances them. Running it twice is safe; running
it after a partial failure completes the remainder. Corpus writes are upserts
keyed on the row's stable identity, so a promote retried after a crash
cannot double-insert.

## What review actually is

Review is not re-verification — the pipeline already fetched sources and
recorded verdicts. The reviewer's questions sit above what automation can
answer: Is this a program *our applicants* can plausibly use? Does the funder
accept unsolicited applications at all? Does the summary say what the source
says? Is this a duplicate the key logic missed? The interface earns its cost
by making those questions answerable in seconds: candidates sorted by
confidence, each showing its provenance, verdict reason, and a click-through
to the claimed source. A review surface that shows bare titles forces the
reviewer to re-do the research, and a gate that expensive gets skipped —
which is how "human review" degrades into rubber-stamping without anyone
deciding it should.

Batch by jurisdiction. A reviewer holding one market's context — its funders,
its portals, its language — reviews an order of magnitude faster and more
accurately than one context-switching per row.

## Decision rules

- When the queue outgrows review capacity, throttle *discovery*, not review
  standards — a growing pending queue is a planning-cadence signal, and
  lowering the bar to drain it defeats the gate exactly when volume makes
  fabrication most likely to slip through.
- When a reviewer rejects, capture the reason even as one phrase — a
  rejection corpus without reasons can tune nothing.
- When promotion reports zero writes against a non-empty approved set, treat
  it as an incident, not a quiet no-op: something between approval and the
  corpus is broken, and the approvals are the evidence.
- When the same reviewer approves near-100% for a sustained period, audit a
  sample independently — sustained perfect agreement means either the
  pipeline got very good or the gate went soft, and only a sample can tell
  which.

## When not to use

The gate governs *research-discovered* rows entering the corpus. Rows from
trusted structured feeds pass through ingest validation instead — routing a
high-volume feed through human review buries the queue and starves the rows
that genuinely need eyes. Metadata *enrichment* of already-promoted rows can
also run gate-free when every enriched value carries provenance and remains
individually reversible. And if a team is tempted to automate the gate away
once precision "looks high": the graded review stream is the only measurement
of that precision — removing the gate removes the evidence that removal was
safe.
