---
domain: agent-operations
subject: model-and-effort-selection
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
---

# model-and-effort-selection

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run, `dp-mae-0927`, dispatched by the Curator
lane on the scan finding "single stack (process)". Registry HEAD at dispatch was d93fbd78.
The primary checkout's main was 178 behind origin and 3 ahead, so the run worked from
origin/main (2d6ff5a1) in a detached worktree. The subject had never been deepened, and
there were three events to point at, not just a clock:
- a lead banked for it by agent-benchmark-design, with the return condition "when that
  subject is swept";
- two flips landed earlier the same day in sibling subjects that contradicted its text:
  "one run per cell is not a significance test", and "the resolution belongs to the
  family";
- a 2026-09-08 personas task naming this exact seam, still open.

## 2026-09-28 - a tier is a pinned (model, effort) pair, effort is not neutral on obedience, a report task has its own inversion

**Depth rung:** L2 primary for the corrections, L3 empirical for the new technique:
- vendor effort and model-configuration docs, read raw;
- the instruction-hierarchy-by-effort paper;
- the inverse-scaling-in-test-time-compute paper;
- the reasoning-and-instruction-following papers;
- the correlated-errors paper;
- an agent-trajectory study that controls for difficulty;
- the agent leaderboard paper, read in its body text;
- a paired headless probe on the installed CLI;
- a read-only census of 274 persisted fleet rows.

**Lanes:** four.
- A blind training-data lane.
- A web counter-evidence lane.
- A vendor primary-source lane.
- A fleet seam lane (personas, ascent, tracklight, this registry).

**Convergence:** three lanes reached pin-the-resolved-configuration independently. The
blind lane ranked it first of five. The vendor lane arrived at it from six documented
drift mechanisms. The fleet lane found a personas lane that pins effort because a CLI
release flipped the implicit default, and a second lane where that fix never arrived.

**Landed (45af95e0):**
- **New technique, pin-the-resolved-configuration.**
  - Enumerate every launch path, continuations included.
  - Pass both values from one resolver.
  - Use full identifiers.
  - Record requested and served.
  - Record "not passed" as a value.
  - Re-derive on a model, harness or resolution change.
- **Flipped: golden path, "does not buy obedience".** Effort moves obedience in both
  directions by family and constraint type: one family went from about 1 in 6 to 3 in 5
  on instruction conflicts, another dipped at the lowest level. The claim that survives
  is "effort is not a fix for obedience".
- **Flipped: tier-risk-inversion, "a read-and-report task has no inversion".**
  - Longer reasoning brings more distraction, fabrication and defended early errors.
  - "Read-only" is a property of the side effects.
  - "The mistake is constant" becomes a condition: the rate of the mistake can move with
    capability.
- **Conditioned: instruction-defect-before-tier-escalation.**
  - Identical failure is the first suspect, not the verdict, under correlated errors and
    shared knowledge.
  - The confirming step is a rewording.
  - "Family" becomes engine, and escalation is measured, not assumed.
  - Wording does not stop shortcuts; a mechanical check does.
- **Conditioned: cheapest-sufficient-tier.**
  - Sweep effort per model, never assume it is monotonic. This closes the banked lead:
    21 of 36 is verified in the body text, and the vendor docs are the second source.
  - Re-derive on a new model or harness version.
  - One clean pass per case over-certifies; rerun the hinge cells.
- **Conditioned: task-shape-tier-policy.**
  - A report's ceiling is a cost cap, not a stuck verdict.
  - A tier is a (model, effort) pair, mapped per model.
  - Shape applies per role, and helpers are pinned.
- **Golden path aligned with agent-benchmark-design.** One run per cell supports a paired
  comparison, not a per-cell verdict.
- **New second stack:** `rust--pin-the-resolved-configuration`.
- **Old tier-risk-inversion application annotated** with the field record that
  contradicts its deferring-engine contrast.
- **Verified and left untouched:**
  - damage grows with blast radius;
  - effort alone does not resolve instruction conflicts (plateau near 60%);
  - "no default when nothing clears the bar everywhere";
  - cost in binding units.

**Applied (four rows):**
- **pin-the-resolved-configuration: `better`, code, personas.** The fleet wake dropped a
  plan row's model and effort. On the installed CLI a bare resume keeps the model and
  loses the effort (11,295 and 6,157 cache-creation tokens, against 55 and 55 carried).
  Fixed in cc97afa6e and fe7ad01cb, pushed. The first push was refused by the project's
  census over real model ids in test fixtures.
- **Record not-passed: `better`, simulation, personas.** Three lanes ride unrecorded
  defaults: curator dispatch, the dev task runner, and charter workers.
- **Report-inversion flip: `better`, simulation, ai-registry.** Three of this registry's
  own incidents where a read-classified flag wrote shared files.
- **Obedience, perturbation and run-length flips: `unapplied`.** No tracked fleet tree
  runs an effort sweep.

**Impact:** none. `build-registry-map --dry-run` shows no fleet map pairs a context with
this subject, so no verdict went stale. The maps read STALE from other landings (208
verdicts across 58 subjects). This run did not regenerate them.

**Banked leads:**
- **personas curator lane tier.** The lane that dispatches this registry's runs passes
  neither model nor effort, so it rides the operator's interactive settings. The harness
  documents that a saved effort does not reach its newest models. Return when the owner
  picks the lane's tier. Until then, record "not passed" on the dispatch row.
- **personas effort record.** There is no effort column on executions. The codex
  maintenance row omits effort from its persisted args. The charter chain's
  model_step/effort_step is computed and discarded. Return when that record is next
  touched.
- **personas orphan re-attach.** The process scan re-attaches a crashed session with a bare
  resume. The orphan's command line could carry its flags. Return with the next change to
  the re-attach path.
- **pass^k for "every case".** Blind lane only. Return when a fleet benchmark plans
  reruns (it belongs with agent-benchmark-design's power guidance).

**Declined:**
- The leaderboard abstract's "reducing accuracy in the majority of runs": the body's "does
  not improve" includes ties. The body sentence is cited, not the abstract.
- Capability-rate evidence (a cheating benchmark) as an effort claim: it compares models,
  not effort levels. It was used only to condition "the mistake is constant".
- A same-task step-count figure for resolved vs failed runs: summary-only.

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- vendor docs for the vendor's own product, read raw;
- arXiv full text read for the verbatim sentence, not the abstract's paraphrase;
- the fleet's own code comments and persisted rows;
- a paired probe on the installed harness.

Declined as sole support: search-snippet numbers, and an abstract that rounds its body
up.
