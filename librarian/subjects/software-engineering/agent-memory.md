---
domain: software-engineering
subject: agent-memory
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# agent-memory

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-31 - `/intake`, operator-directed at memory

Gained `lane-reconciliation` and `probe-without-write-back` (11 -> 13 techniques), plus
two applications carrying `better` verdicts. Source: [[2026-08-31-genesis-agi]] - a
20,905-LOC memory subsystem shipped with its own architecture documents and ADRs.

Both findings are **below the pipeline**, which is why eleven techniques of judgment
could not see them. Every existing technique governs what belongs in the store; these
two govern the machinery underneath it, and both defects are produced by components
that are individually correct.

The first is a missing stage. A store is a record plus derived retrieval lanes with no
shared transaction, so a half-completed fan-out leaves an item that satisfies
provenance, freshness and non-redundancy and cannot be recalled - and
`coverage-instrumentation` reports it covered, because coverage joins the record. The
severity discriminator did **not** come from the source: it came from the A/B tree,
where two structurally identical derived lanes land in opposite severity classes purely
because one lane's readers carry a fallback and the other's is promoted back into the
record on rehydration.

The second is an asymmetry the corpus had already half-modelled twice. `retrieval-
evaluation` requires the eval to run the production path and models eval-to-system
contamination only through the human tuning channel; `memory-value-model` models the
retrieval-feeds-rank loop and bounds it against organic traffic. Neither asks who else
calls recall. The read path writes, so a scheduled probe inflates its own ground truth
forever. The source implements the fix and gets the observation period wrong - it
reports `healthy` before a baseline exists, which is exactly the unverifiable-as-
verified collapse - so the technique is written against the corrected rule.

Still the #1 attention point after this run: the two largest memory files in the source
(`retrieval.py`, `dream_cycle.py`, 3,518 LOC combined) were never opened. Lead banked.

### 2026-08-22 - `/research`, from an external source

Gained `procedure-promotion` (9 -> 10 techniques). Source:
[[2026-08-22-ai-agent-race-exploded]].

Not a hole - a seam. `consolidation` already produced procedures as durable beliefs, so
the mapping instrument returned almost nothing and the finding had to be read out of the
prose. The boundary it names is where a remembered procedure becomes an invocable
capability, which is a different artifact class with a different lifecycle: executed
rather than injected, versioned rather than overwritten, and reviewable by a human who
never reads a transcript.

The finding met the corroboration bar by **cross-run convergence** - two independent
vendors shipping the same capture-and-promote feature across two runs - rather than by
a fetched source.

### 2026-08-22 - `/research`, from an external source (second touch)

Three techniques amended from [[2026-08-22-shapes-of-agent-memory]], a
first-party empirical study: `consolidation` gained the state-vs-event
supersedence type check; `episodic-capture` gained the distiller-ceiling
section (yield instrumentation + priced write path); `recall-injection`
gained two sections - "Labeled is not applied" (critique-and-reconstruct
before a recalled experience drives action; memory's value floats on the
consumer-task gap) and "Eager recall buys over-answering" (the answer-side
abstention discipline, with the should-abstain-in-denominator eval rule).
Zero new files; the subject stays at ten techniques. The trained-experience
architecture is banked as a lead with a return condition in the source note.

## Open leads

- **The promotion door and `hitl-approval` overlap.** A procedure with unbounded
  consequence is promoted with a gate attached; if a later run touches either subject,
  check the seam is stated once rather than twice.
- **This registry is itself an instance.** Its `skills/` lane is a library of promoted
  procedures with versions and lessons. Whether that is worth an application document is
  a real question and was not answered here.

## Standing debt

- Ten techniques is the largest count in `llm-agent`. Not a cap breach (files are not
  counted), but worth watching: a subject that keeps growing techniques may be two
  subjects.
- ~~Never swept by `/librarian`.~~ First sweep 2026-08-30 ([[2026-08-30-1]]).

## Declines

None.

## 2026-08-25 - /intake run 12 ([[2026-08-25-awesome-graph-engineering]])

- `procedure-promotion` gained two measured sections from the 2026 skills field study: the artifact carries actions not facts (65.7% vs 4.5%), and selection-at-scale is the silent failure (actual-use precision 29.6% -> 3.3% at pools 5 -> 100, success flat; cap and scope the live pool, merge confusable siblings, measure actual-use).
- Golden path gained the store-shape paragraph: two independent sightings (shapes-study hybrid-ties-flat; a graph vendor own-ablation +2%) that topology buys marginal recall; value lives in the transitions. Temporal-KG supersedence resolved as a catch - consolidation already outreasons it.

## 2026-08-25 - /intake run 13 ([[2026-08-25-awesome-llm-apps]])

- One sentence added to `procedure-promotion`'s confusable-siblings rule: static pairwise description linting as the standing admission guard. The registry now runs its own (`scripts/check-skill-triggers.mjs`).

## 2026-08-26 - /intake run 18 ([[2026-08-26-supermemory]])

- `decay-and-forgetting` gained a third axis: **the fact that expires by its own terms.**
  The technique's own enumeration said wrongness -> supersedence, staleness -> decay, and
  a self-dating claim is neither. The mechanism the corpus adds over the source: the
  retrieval term *protects* these items, because a time-boxed claim is maximally
  retrievable exactly during the window in which it is true. Cites
  `creation-names-reaper` at item level and `unknown-is-not-a-value` for the bound (an
  absent boundary is never a default expiry). `laws:` frontmatter extended accordingly.
- `episodic-capture` gained **the batch is the ceiling's other half** - third sighting of
  one root across two runs, landed as the root rather than a third dated fact. Distiller
  *strength* (2026-08-22, the study) and distiller *input size* (this run) bound the same
  thing from opposite sides and need opposite fixes; what a crowded batch drops first is
  the cross-item judgments, stated shape-neutrally so it does not smuggle in a store
  topology.
- **Two applications written against a real tree** (`rust--decay-and-forgetting`,
  `rust--episodic-capture`), and the expiry lane was realized and committed in the
  connected project the same run.
- **The tree corrected the technique once.** The first draft of the episodic-capture
  amendment claimed a batch never names what it crowded out. The tree's packer does -
  `dropped` against `total_available`, surfaced into the distiller's own prompt - and
  goes further: overflow is *deferred* to the next cycle, not discarded, with the
  stopping boundary recorded. "Overflow defers; it does not drop" is now the technique's
  rule and it came from the code, not from the source that started the run.
- Four catches, all real: version chains, tombstone-with-a-reason, static/dynamic
  profile split, container isolation. This subject outclassed a state-of-the-art vendor's
  published ontology on every one of them.

## Open leads (added 2026-08-26)

- **A deliberate forget and an expiry need opposite re-derivation policies.** An
  operator-issued forget must suppress re-derivation of a key or the next distillation
  pass reverses the correction from the same episodes; an expiry must leave the key
  learnable. A store with one forget operation cannot express both. Return when the
  connected tree's in-flight operator-forget lane lands in `HEAD`.
- **The coverage hole under the expiry lane.** Nothing counts boundaries the distiller
  failed to notice - an absence, and `coverage-instrumentation` says a listing surface
  cannot show one. The technique states the obligation; no realization measures it yet.

## 2026-08-29 - intake, single-paper explainer (arXiv 2608.24876 via a channel)

- `working-memory` gained its missing stage: **propose / check / commit**. The technique
  said the state is rewritten by judgment and never said whose; the paper's checker reads
  the environment result, never the model's claim, and its ablation puts almost all of
  working memory's value in the check (+23.9 verified state vs +2.0 skill store). Anchored
  on `gate-sees-target`; the sibling laws in game-production and localization say the
  same thing and are named in the source note, not linked.
- `procedure-promotion` selection: scope key is the verified current state, not history.
- Second sighting for `quality-gates/oracle-frozen-during-repair` from a research design
  (fixed meta-agent, fixed gate, frozen tools). Record there when that subject is next swept.
- Untriaged: memory decomposed by *control function* (skills / state schema / invocation
  policy / checkers) as an axis orthogonal to this subject's lifetime axis. Return when a
  second source or a connected tree treats checkers as editable data.

## 2026-08-30 - `/deepen` under the librarian sweep ([[2026-08-30-1]])

**The banked lead came due, and it was not close.** [[2026-08-22-shapes-of-agent-memory]]
filed *trained memory-use* as "one paper, one lab" with the return condition "a second
independent system training memory-use into the policy". The worker found not a second
but a populated field: RL-trained memory managers **and** read-path policies, multiple
independent groups, several benchmark families and scales, plus a unified
inference-and-training framework — infrastructure, not only papers.

Per the lead's own prescription this landed as a **boundary statement, not a pile of
techniques**: a new golden-path section, *"What this standard assumes."* It names the
frozen reader, then splits the standard three ways under a learned policy:

- **unchanged** — the store as record: provenance, supersedence, governance tiering, the
  audit answer. A learned reader does not turn a rumor with a database row into
  knowledge; it only makes the rumor harder to spot.
- **relocated** — read-path stages become weights, degrading "why was this recalled and
  that not" into "why did the policy do that", which nothing answers cheaply.
- **newly expensive** — held-out accuracy drops, and **a learned forgetting policy is a
  reward function with delete authority**, reopening by optimization the door
  `memory-governance` holds shut by design.

Framed as an enforcement-surface move, not a deprecation. The lead is now **closed**.

### New technique: `baseline-ladder` (11 techniques)

Lane convergence, and the convergence is auditable: the blind training-data lane
predicted the subject's biggest hole was the absent no-memory/full-history baseline
*before any search ran*, and a grep confirmed zero occurrences of "baseline", "long
context" or "full context" anywhere in the subject. The web counter-evidence lane
reached the same ground from confounds. Four rungs with the **crossover** as the output
rather than a winner.

It deliberately does **not** launder the benchmark figures upward — it keeps shapes
("tens of points", "an order of magnitude") and leaves the n and p-values in a
cross-subject proposal. That is the standard's numbers-carry-their-measurement rule
applied correctly by a worker without being told.

### Counter-evidence

- *"store shape doesn't matter; quality is transitions not topology"* — **confirmed and
  better grounded.** Pro-graph designs attribute their own gains, in their own ablations,
  to multi-step reasoning at recall time rather than structure. The sharper reason: a
  single uncontrolled variable moves results further than the architectures differ, so
  most shape comparisons are not evidence about shape.
- *"raw transcripts are not memory"* — **partially refuted as a performance claim,
  confirmed as a structural one.** Memory systems consistently lose to a long-context
  baseline on fixed-size suites. Landed as a bounding paragraph, not a rewrite: the four
  objections are claims about past-the-window and past-a-reversal, which such a suite
  cannot settle either way.
- *the age/last-confirmed omission* — **confirmed unchanged** by re-reading the renderer.
  A first-class null result.

### Version witness

Both rust applications re-verified against the real tree at `rust@1.97`; witness goes
**2/5 → 4/5** against a corpus that is 82% drift-blind. Real drift, spot-checked by the
Director: a run-level discard affordance is **gone** (it survives only in a stale
worktree, which is what makes it a genuine deletion), modules became directories, and a
write-path contract hardened into an error. That last earned a new paragraph: **a
placeholder in a citation slot is worse than an omission** — the old fallback rendered a
literal no-sources string as if it were a citation.

## Open leads (added 2026-08-30)

- **A learned forgetting policy is a reward function with delete authority.** Trained
  memory management puts retirement under optimization, reopening by reward the door the
  governance tier holds shut by design. Return when any connected project adopts a
  trained memory policy, or on a reported incident of learned deletion. May belong to a
  governance or safety subject rather than here.
- **The open head-to-head memory harness** ([[2026-08-26-supermemory]]) — return
  condition still **not met**, no connected project has two candidate memory
  configurations. But `baseline-ladder` now gives that decision a stated shape, so the
  harness has a spec to satisfy when it arrives. Nearest real candidate named by the
  worker: an uncapped access-boost in one store versus a capped one in its sibling.

## Declines (2026-08-30)

- The confound evidence (an embedding swap reversing an architecture ranking; one
  comparison giving three verdicts across three consumers; refusals-with-the-answer-present
  invisible to accuracy-only reporting) was **deliberately kept out** of `baseline-ladder`
  beyond the one sentence the ladder needs. It belongs to `eval-harness/judge-stability`
  and is proposed there, not written here.
- Four techniques (one-value-model, provenance-as-trust-anchor, human-gated identity,
  empty-vs-failed recall) were **not attacked this run** and produced no new evidence.
  Recorded as not-examined rather than as dry, which are different facts.

### 2026-08-31 - `/intake`, second pass, operator-directed at memory

Gained no techniques. `probe-without-write-back` gained two sections and a refinement;
`applications/rust--probe-without-write-back.md` is new and carries `better`. Source:
[[2026-08-31-future-agi]] - an open-core platform whose tree holds two agent memory
systems built to different standards, neither aware of the other.

**The amended technique was created earlier the same day**, by the run above. That is
not a collision but the useful case: a technique lands, a second source is read against
it within hours, and the second source is a counterexample to a specific sentence in it.
The sentence was the closing claim of "Which default the structure hands you" - that a
misplaced explicit write produces an under-count, and that an under-count "is the better
failure" because the item is ranked conservatively.

It is not conservative when the misplacement inverts the counter's meaning rather than
lowering it. In the source, the usage columns are written by the persistence helper -
the get-or-create every writer already calls - and by a single-key lookup, while the
bulk read that actually serves memory to the agent writes nothing. The usage axis then
counts edits, which is the exact failure `memory-value-model` installed that axis to
repair. Absence would have been safer: zeros get noticed, plausible integers do not.

So the technique now carries the writer-side enumeration beside the reader-side one, and
the argument that they do not substitute for each other - the reader-side question
presupposes that counting happens at the read path at all.

The A/B is the strongest part and it ran both arms on one managed tree. Arm A returned
zero findings over four production read sites; arm B returned one, and the finding is a
delivery surface arm A's own default (suppress new machine callers) correctly blesses.
The apply step also corrected the amendment: a read that hands its selection to a later
consumer must be counted at the consumer, not the read, and a naive writer-side audit
flags that correct deferral as an omission.

Second technique amended this run in another bundle - see [[entity-lifecycle]], which
holds the opposite side of the same source's memory-deletion story.


## 2026-09-02 - intake `deer-flow` ([[2026-09-02-deer-flow]], run intake-deer-flow-0902)

**`decay-and-forgetting` amended: "A review window is not an expiry."** A
contradicted pick kept on purpose. The technique's expiry section forbids
inventing a boundary; a harness's memory backend assigns every fact an
expected-valid window at write. Both hold, for different fields: an expiry
is a property of the claim and only the claim supplies it; a review deadline
is a property of the store's confidence, and its consequence is a
re-judgment (keep / remove / extend), so guessing it wrong costs a review,
not a fact. Five rules landed: clamp at write; extend under an absolute
ceiling rather than the creation multiplier; the reviewer touches only what
the deterministic selector surfaced, protected kinds never enter; a merged
item inherits the earliest source deadline relative to the newest source's
creation; the clock is the source's, not the synthesis's. The inheritance
rule is the half `consolidation` did not have - noted here, placed in the
decay technique so the window's rules stay in one file.

**Applied better** (simulation) against a fleet tree's persona memory store
(its second belief store - the companion brain already carries the expiry
exit from 2026-08-26): candidates are rank-selected, verdicts are
delete/keep/update-importance, and the reflection pass's synthesize restarts
the clock at merge and preserves no source clock. Filed as the tree's next
change with the keep-rate comparison as the return condition.

Untriaged with anchor: a subagent sharing the parent's thread id must skip
the parent's memory flush or its internal turns pollute the parent's durable
memory.
