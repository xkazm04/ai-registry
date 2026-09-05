---
domain: software-engineering
subject: agent-memory
last_touched: 2026-09-04
touched_by: deepen
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

## 2026-09-02 - intake run `intake-openviking-0902` (vendor repository, design read under 2.0.0)

Two techniques and two amendments, five source-tree applications, and a sibling subject.

- `owner-and-counterpart-scope` (new): the two identity axes a memory answers to;
  the runtime that wrote it is neither. From a store that retired its agent-id
  namespace for an owner/peer split and refused to migrate ownerless sessions.
- `read-set-bounded-links` (new): request-local integer ids so a model-authored
  link can only name what was read in or is being written; links beside the body.
- `lane-reconciliation` gained "the invariant chooses the write order, per
  operation" - delete lane-first where the lane is the consumer's door; with the
  scope condition (a join that drops missing rows makes the order moot) found on
  the personas seam.
- `baseline-ladder` gained "the judge and the per-arm budget travel with the rung".
- Applications: `python--lane-reconciliation`, `python--baseline-ladder`,
  `python--owner-and-counterpart-scope`, `python--read-set-bounded-links`,
  `python--probe-without-write-back` - the first applications written against a
  mined source's own tree in this subject.
- The golden path's shape hedge (lines 77-89) now has a subject on its far side:
  `context-hierarchy`, beside this one. The hedge text is unchanged; a later pass
  should add one sentence pointing across.

Apply rows: three simulations on personas, all `not-better`, each chosen to falsify
and each landing its condition. The technique pair is unapplied in the fleet's
current shape (one human, no model-authored links between existing memories); return
conditions in `librarian/applied.md`.

## 2026-09-02 - intake `claudeception` (run `claudeception`)

- Amendment to `procedure-promotion`: § "When the promoted store is the only durable
  store" - the four conditions assume an episodic layer to count in; a coding harness
  that persists only skills forces promote-first, and the count moves to the write
  door (search by trigger, then the six-row update/create/variant table). Measured
  on a 24-item first-sight store with one true duplicate: trigger search found the
  pair exactly; the technique's suggested pairwise vocabulary lint ranked it 3rd of 5.
- Application `claude-code--procedure-promotion`: the source tree (a skill that writes
  skills, PR #13's dedupe table) and the applied arm (the registry harness's memory
  store, two files on one trigger merged; `code`, `better`).
- Apply row in `librarian/applied.md`. Return condition: the store passing ~50 entries,
  when scoping joins the door.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**New technique `durable-store-failure-posture`.** Every other technique here
assumes the store can be read; this one covers the turn where it parses into
something that is not the shape it promised. The rule: **the read path degrades
and says so, the write path refuses.** The two symmetric designs are both wrong -
fail-open-to-empty on both paths means the next write serialises over recoverable
bytes (`deletion-is-not-repair`, executed by the component least aware it is
happening, with the audit trail recording a normal save); fail-hard on both bricks
a consumer that reads before every model call. And the degraded read must say
**"unavailable", never "empty"**, because the consumer here is an actor that
responds to "empty" by writing. Assert the asymmetry in one *paired* test: a test
on either posture alone passes on a codebase that has quietly aligned them, and
alignment is what a later refactor does, since two different handlers around one
store read like an inconsistency to anyone who does not know why.

Boundary written into the technique: this does not cover **concurrent loss**. A
refusing write path protects against a caller that could not read; it does nothing
about two callers that both read successfully and both write N+1. The source
discloses exactly that in its own tree - a `TODO(storage-rework)` noting no
compare-and-swap on an agent-scoped store whose default topology is concurrent
conversations - and has not fixed it, which is why the technique names it rather
than implying durability it does not deliver.

**Also recorded as a catch:** the source rejects embedding retrieval for
always-inject-the-whole-store, which is `baseline-ladder` rung 2. The corpus says
it better, with the measurement that rung 2 is the rung most often skipped and the
one that most often wins. `recall-injection` disagrees with the *sizing* though -
the source's own caps admit a ~120KB ceiling against a design note justifying the
choice on "a small set of short facts".

**Apply: `experiment`, `better`, shipped.** Seam in the fleet peer: a
read-modify-write over one durable JSON column parsed with a tolerant default, so
a corrupt payload was replaced by a one-element array while the call reported
success. Measurable: bytes of the unreadable payload surviving the next write -
A=0 of 35, B=35 of 35, three observation points because a two-point pair ties when
the corruption never lands. Product fix shipped; the paired test is committed
beside it but could not run against a pre-existing build-script failure in that
crate.

## 2026-09-04 - intake `wikiskill` (run `arxiv-27454`, intake 2.5.0)

Source: a single cs.AI paper on a skill-evolution loop ([[2026-09-04-wikiskill]]).
Class prediction stated before extraction and confirmed: a framework paper is
authoritative for its measurement and weak for its framework, so both techniques
came out of the ablation and the transfer table and the named architecture
yielded one lead and two catches. Home age read first, per the round-24 focus:
this subject is 15 days old with **9 prior sources**, so nothing was suppressed
and the landing is corroboration into a mature subject.

**The absolute that moved.** The golden path's hierarchy holds that "one policy
cannot govern" three layers of different physics, and calls the consolidated
layer "the only layer allowed to speak as knowledge". The paper splits that
layer: the procedures an executor runs on, and the accumulated diagnosis used to
revise them, need **opposite** read policies for the executing agent. Measured
2x2, one model, four benchmarks - the reviser's access to the store is worth
**+15.0** points (48.7 to 63.7); the executor's access **costs 2.8 to 3.4 in both
arms**, which is what makes it a property of the role and not an interaction. New
technique `diagnosis-withheld-from-the-executor`, plus a golden-path section
saying the hierarchy's own rule holds one level down.

**Two design candidates folded into one technique**, per the same round's second
focus item. "The knowledge layer is never rolled back" and "the harness, not the
proposer, writes the record" share a force - the gate's verdict and its evidence
outlive the artifact they rejected - so they landed as
`rejected-revision-leaves-its-evidence` rather than as a pair. Its sharpest line
is a boundary the paper does not draw: **store the diff and the number, not the
reason.** A reason written at rejection time is a hypothesis authored at the
moment of least information.

**`procedure-promotion` declared its own completeness and was incomplete.** "Two
sources feed promotion ... neither is sufficient alone" - Observation and
Demonstration. The third is **another agent's experience**, measured across five
models and two families: transferred procedures beat self-distilled ones in many
pairs (24.3 / 33.6 / **50.5** on one benchmark; 33.9 / 56.7 / **73.7** on
another), and transfer ran *upward* from a 4B-class author to a 31B-class
executor. The reason is recoverable from the host's own weakness analysis, which
is why it is an amendment: an author whose runs never failed at a step compresses
it out as incidental, so **a weaker author records more of the method.** The
enumeration got a forward pointer rather than a contradiction.

**Apply - all three landings were found in Phase 6, not Phase 3.** The eleven
extraction rows produced none of the three techniques in the shape they landed
in; the absolutes hunt and the enumeration hunt produced all three.

- `rejected-revision-leaves-its-evidence` -> **personas, `task`, `better`,
  `ab-paired`**. Its prompt-evolution loop stores `variants_tested` (a count),
  two fitness numbers and a prose `summary`, and no tested candidate anywhere.
  The structural fact: **the tree already holds the opposite design on its newer
  surface**, which carries `variant_prompt` and a provenance snapshot but whose
  fitness loop is deferred - so the surface that keeps the diff does not run and
  the surface that runs and rejects keeps no diff. Paired on a scratch database,
  0 of 3 recoverable at HEAD against 3 of 3 on the branch, with the CHECK, FK,
  UNIQUE and CASCADE exercised rather than assumed. Step 1 of 3 on a branch, not
  merged, not pushed. **Gate reached: the DDL. Gate not reached: `cargo check`.**
  An earlier run of that gate returned 0 on *both* arms from a bad schema-marker
  substitution - a tie meaning nothing ran, caught by printing the mid-state.
- `diagnosis-withheld-from-the-executor` -> **the registry's own skill lane,
  `experiment`, `better`**, and **personas verified conformant** (its evolution
  engine writes nothing into the memory store the executing persona reads; its
  only read of execution history is a `COUNT(*)`). The registry lane is
  configured the way the ablation measures as worse, and the size of it is now
  counted: 56 declared-focus blocks, **83 distinct imperatives, 9 carried by the
  gated file** under strict phrase matching, hand-sampled to a real range of
  **9-25 of 83**. The worst instance is the technique's promotion-signal clause
  verbatim - one demand appears **27 times**, its own text counting *sixth*
  through *tenth deferral*, and the gated file mentions it **zero** times.
- `procedure-promotion` amendment -> **personas, `experiment`, `not-better`**.
  The third source is unexpressible rather than absent: the genome is derived
  from the same persona, and a variant's `source_persona_id` is stamped with a
  minted `evo-<uuid>` - a generated value in exactly the field the amendment asks
  to carry an authoring lineage.

Two leads, both real gaps this source could not authorize: the push-a-sample /
hand-an-index asymmetry between the store's two readers (a design choice with no
ablation behind it - the class rule rejected it), and the monotone acceptance bar
excluding neutral proposals (the paper's own limitation 2, folded into technique
2 as a stated cost). Two catches where the corpus is ahead of the paper: store
pruning, which the paper names as future work and this subject models in three
places, and retrieval, whose absence here is a scope condition on citing the
paper rather than a gap.

## 2026-09-04 - `/deepen` batch ([[2026-09-04-1]])

Worker brief: attack the four claims the 2026-08-30 pass did not examine, then
the three fresh single-source landings of 2026-09-04. Blind lane written before
any search (`agent-memory-blind.md` in the run's scratch). 9 searches, 7 fetches.

### What landed, file by file

- `techniques/memory-value-model.md` - **corrected.** The clause "An unparseable
  instant is treated as new, not as poison" contradicted the clause above it
  ("clock skew clamps, it never boosts"): age zero is the maximum freshness the
  model awards, so a writer emitting timestamps the parser rejects promotes every
  one of its rows above correctly-dated rows of equal trust. Two independent
  stores (the node org-memory tree and personas' `memory_recall.rs`) carry exactly
  this default, both reasoned as "never punish a row for a malformed timestamp",
  and personas' sweep additionally returns `false` for a row it cannot date -
  ranked first and immortal. Both tolerate two timestamp formats because their
  tables hold both, which is the one condition under which a stricter parser
  would pin a whole writer's output to the top. Now: treat like an unknown kind -
  declared default age, never zero, never exempt, count the rows that took it.
- `techniques/durable-store-failure-posture.md` - **corrected** the opening
  sentence "Every technique in this subject assumes the store can be read."
  `recall-injection` already defines failed recall (store unreachable, query
  errored) as a signalled state distinct from empty. The opening now states the
  boundary: the degraded read *is* that state carried to the model as content;
  what is new is the write path's obligation and missing-versus-corrupt.
- `techniques/decay-and-forgetting.md` - **new section** "A deliberate forget
  bars re-derivation; an expiry does not" (the 2026-08-26 lead, come due - see
  below) and **corrected** the cap clause "the lowest-importance members demote
  one tier" to lowest-*valued* by the shared model, with the personas cap as the
  measured deviation.
- `techniques/memory-governance.md` - **new section** "The evidence has an
  author, and the lanes must read it." Lane convergence: the blind lane named
  memory poisoning as the field's technique the subject lacks; the web lane
  found a 2026 systematic study whose four write channels include compaction and
  experience-to-procedure (this subject's own stages), whose weak-signal
  fabricated facts evade every injection detector by >40 points against the
  explicit form, and whose two agents differ ~2x in attack success mainly by
  write-policy aggressiveness. No write-path defence was evaluated anywhere.
  `prompt-safety` owns the taint model (its golden path already names the
  agent-written store as the ordinary path an injection takes); this subject
  now owns what the lanes do with a third-party author: auto lane as "the
  source said", never the preference lane or a standing rule by repetition.
  Landed as a section, not a technique, because the home is split across two
  subjects and the mechanism is a lane input.
- `techniques/consolidation.md` - **qualified** "One conflicting episode against
  a many-times-reinforced belief is a reason to doubt, not yet a reason to
  reverse. Weight of evidence decides; recency is a tiebreaker, not a trump."
  Holds for inferred beliefs; inverts for a state-valued claim restated by its
  own authority. Web: a 2026 consolidation benchmark where every published
  system loses most later-overrides-earlier questions (best 54%), and a paper
  whose fix moves newest-wins out of the model into deterministic order over
  candidates, because a model comparing timestamps drifts with candidate-set
  size and lets its prior override an explicit newer value.
- `techniques/baseline-ladder.md` - **amended** the restraint section (landed
  today by the harness commit): the pair is selective prediction's risk-coverage
  trade-off, and its operating rule is compare at matched coverage or report the
  curve. Blind and web converged.
- `techniques/diagnosis-withheld-from-the-executor.md` - **qualified**, table
  **confirmed** verbatim against the paper (the intake's reading was right; a
  first fetch summary mislabeled the rows and was rejected against the paper's
  own sentences). Added: one model, no spread on ablation cells (repeats cover
  the headline only), the no-reviser arm's store is unmaintained so its 3.4 is
  the weaker observation, and the mechanism is the paper's stated hypothesis.
- `agent-memory.md` - one failure-mode bullet, "The laundered instruction".
- `applications/rust--decay-and-forgetting.md` - two sections (operator-forget
  lane in both stores; the cap's second ordering with a worked 10x
  disagreement), `verified_on` 2026-09-04, `rust@1.97` kept (rustc 1.97.1
  observed, MSRV 1.80).
- `applications/node--lane-reconciliation.md`, `node--probe-without-write-back.md`
  - drift re-verification (below).
- `applications/claude-code--memory-governance.md` - **new.** Closes the
  2026-08-22 lead "this registry is itself an instance": the instance is the
  harness's auto-memory, not the knowledge lane. 34 files; `type` vocabulary
  (22 feedback / 10 project / 1 reference); `originSessionId` provenance on 30
  of 33 topic files; index = always-include tier at a 200-line cap. Deviations:
  the kind is chosen by the writer it governs (lane-shopping is open); a
  standing operator rule is human-issued and agent-committed with no approval
  recorded; provenance optional in practice; the always-include tier has a cap
  and no admission argument.

### Counter-evidence that confirmed (no edit)

- *One value model, two callers* - **confirmed from outside the field**:
  cognitive-architecture activation models drive retrieval probability and
  forgetting with a single base-level activation, and 2026 LLM-agent work
  imports that equation under one unified activation metric. One sharpening
  banked rather than written: that model terminates the retrieval bonus by
  letting each retrieval *age* rather than by bounding the count; both
  terminate, the per-retrieval form needs per-retrieval timestamps.
- *Provenance is the trust anchor* - **confirmed as a standard, scope
  qualified** through the governance section: provenance to an episode proves
  derivation, not authorship; the new lane input is the missing axis.
- *Human-gated identity, always* - **confirmed as a posture, not refuted.** A
  2026 five-layer mutability paper reports identity hysteresis (0.68-0.95 of a
  behavioural shift surviving a self-description revert after memory
  accumulation, n=30 per cell, 240 generations) - evidence that memory is a
  governance surface, which is this subject's claim. It prescribes "governance
  depth matches mutation depth", not a gate; no incident cited. The harness
  instance above is the one place the absolute is measurably not met.
- *Empty vs failed recall* - confirmed; the seam with the new technique is now
  stated once.
- *Rung 2 "most often wins"* - confirmed within the window by the fleet's own
  year replay (0.90 at <=45 days, 0.23 at 46-120); the crossover framing
  already carries it. No edit.
- *WikiSkill 2x2* - confirmed verbatim; qualifiers landed.

### Drift re-verification (Lane 5)

| application | tree opened | runtime observed | before -> after | citations |
| --- | --- | --- | --- | --- |
| node--lane-reconciliation | `goat` `main` @ d35b2b3 (not in the dispatch's fleet list; the fleet map knows it with scope missing) | no `.nvmrc`/`engines`/CI; checkout `node` 24.14, framework floor 20 | node@22 -> node@24 | 13/13 (one path corrected: `category-config.ts` lives under `src/lib/config/`) |
| node--probe-without-write-back | same | same | node@22 -> node@24 | 8/8 |

The earlier `node@22` was never the tree's claim; the tree declares nothing.
The drift is the fleet's default node, not the applications'.

### Return conditions checked

- **Deliberate forget vs expiry** (2026-08-26) - **met.** Both personas stores
  now carry an operator-forget tombstone keyed on `(scope, key)`, consulted by
  consolidation, lifted only by an explicit write in its own transaction, with
  no un-forget entry point. Landed in the technique and the application.
- **Head-to-head memory harness** (2026-08-26 / 2026-08-30) - **met
  structurally, measurement pending.** `evals/memory-year/` now holds the four
  rungs plus three peer-mechanism arms over one four-call contract
  (hybrid-verbatim, write-verdict, compiled-truth) and a `--pin` learned rung.
  Smoke only (40 probes, all within a week of their fact - separates nothing).
  Return when the year run reports the arms; the `write-verdict` arm is the
  first measurement `consolidation`'s "batched, because judgment needs a
  horizon" will ever face.
- **Review window** (2026-09-02) - not met; `expected_valid_days` absent from
  `HEAD`.

### Open leads (added 2026-09-04)

- **Per-retrieval aging as the bound.** Return if a connected store gains
  per-retrieval timestamps, or when the harness prices the uncapped personas
  access boost against the capped node one (the 2026-08-30 nearest candidate,
  still unrun).
- **Sub-run flush isolation** (untriaged since 2026-09-02): a delegated sub-run
  sharing the parent's thread id flushes its internal turns into the parent's
  durable memory. Blind lane's answer: the unit of capture is the delegating
  boundary. Return on a second sighting or a connected tree that delegates with
  a shared thread id.
- **Fleet map reads 14 unknown, 2 deviations for personas**, and the two
  deviations are UI groups (`overview-memories`, `team-memory`) with no seam
  text. The dispatch's "14 deviations" is the unknown count. Worth a Director
  look at how the count is rolled up.

### Declines

- No new technique. Memory poisoning converged on both lanes but its home is
  split (taint model in `prompt-safety`, lane input here); landed as a section
  and a pointer, not a file.
- The unparseable-instant correction was not softened to accommodate the two
  trees that share the defect; two trees agreeing is a convention, and the
  technique's own neighbouring clause is the arbiter.
- A "useful memories become faulty when continuously updated" paper returned a
  summary inconsistent with its own title (fine-tuning, wrong models); rejected
  unread rather than cited.

### Proposals for other subjects

- `prompt-safety`: one sentence pointing at `memory-governance`'s new section as
  the write-door counterpart of its provenance-tracking rule.
- `eval-harness` / judge subjects: the personas harness's judge defect (a judge
  tuned to a terse consumer reads a conversational reply's dated history as a
  stale answer; +37 points on re-judging) is a judge-stability sighting.

Saturation self-forecast: the four un-attacked claims are now attacked and the
fresh landings confirmed with qualifiers; the next pass should find the harness's
year run and the `write-verdict` arm, and little else until a second human
reaches a connected store. One more productive pass, then dry.

## Impact (step 4, run 2026-09-04-1)

Fleet maps regenerated after the landing. Verdicts now judged against a subject that
moved: personas (2), ascent (2). The personas count the scan reports as "14 deviations"
is the map's *unknown* count for this subject on that project (14 unknown + 2
deviations, both UI groups with no seam text) - a demand number to read as unjudged,
not as fourteen shortfalls.

## Intake 2026-09-05 (`intake-utopia-0905`, source `github:deeplethe/utopia`)

**Landed:** `pending-beliefs-live-apart` (new technique, four sections: the pending
store is a separate table because a forgotten read must hide the queue rather than leak
a belief; the review card shows the utterance above the extraction and the reply never
claims a completion extraction has not reached; the proposer checks asserted, pending
and rejected by whole-claim identity, literal values exempt; the agent credential is
recorded beside the person when several agents share one identity). Application
`rust--pending-beliefs-live-apart` over the source tree, with the personas paired proof.

**Single-source debt, named on day one.** The technique is sourced on one tree's
decision record 0015 and its `pending.rs`. Counterpart already sighted: the personas
companion's consolidation review had rules one and two by construction and lacked rule
three, which the apply step added (branch `intake/utopia-pending-rejections`). A second
*independent* counterpart for the reconcile lane: any memory system with a review inbox
and a rejection verb - the harness's own auto-memory (`claude-code--memory-governance`)
has no rejection path at all, which is a sighting of the absence.

**Boundary drawn:** the technique assumes `memory-governance` has already classed the
write as proposal-reviewed; it decides the lane's shape, not its membership. Bulk ingest
stays optimistic.
