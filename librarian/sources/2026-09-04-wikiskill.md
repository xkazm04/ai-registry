---
source: arxiv
kind: paper
url: https://arxiv.org/abs/2608.27454
title: "WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution"
author: Tang, Rashtchian, Ferng, Tomkins, Juan, Vu
words: 698 landing / 14416 full text
extracted: 11
accepted: 3
declined: 0
leads: 2
already_covered: 2
untriaged: 4
dispatched: 0
applied: 3
shipped: 1
run_id: arxiv-27454
siblings: 1
rescan_when: a code or artifact release appears for this paper (none today - the
  full text carries no repository link and no release promise, which is why the
  design half could not be read from a tree); or a second independent source
  measures the executor-access sign flip; or 8 weeks elapse (2026-10-30)
---

# WikiSkill - a skill-evolution loop whose ablation is worth more than its framework

**Class: paper** (single primary, cs.AI, submitted 2026-08-27). Expected yield
stated before extraction, per the class entry: *authoritative for its
measurement in its protocol, weak for its framework - framework papers are the
class's marketing; measurements, failure taxonomies and negative results are its
substance.* This is a framework paper, so the prediction was that its named
architecture would yield little and its ablation and transfer tables would yield
the run. That is what happened: both landed techniques come from the ablation and
the transfer table, and the framework's other three design choices became one
lead and two catches.

**Two fetches spent of three.** The `/abs/` page is 698 words of pointer; the
paper is the extraction, and `/html/2608.27454v1` rendered because this is a
LaTeX submission. No third fetch was needed - every corroboration came from the
primary itself or from reading the corpus and two fleet trees.

**Siblings: 1 live** (a run mining a media-generation repository). It held no
subject this run touched; both homes checked clear on the board at Phase 4 and
again immediately before the first write.

**Declared focus, consumed.** All three round-24 focus blocks were read at Phase
1. (1) *Home age before the routing count*: `agent-memory` is 15 days old with
**9 prior sources**, so it is neither fresh nor single-sourced - no forge
suppression applied, and the landing is corroboration into a well-built subject
rather than a second source for a thin one. (2) *Hunt the corpus's absolutes*:
done, and it produced the framing for the first landing - `absolutes=3/1`. (3)
*Check whether a fleet project already studied the source*: done before
extraction; `grep -ril wikiskill librarian/` and a search of `applied.md`
returned nothing, so this is a first mine.

## The absolutes that were read, and the one that moved

The host golden path's unqualified sentences, per focus item 2:

1. *"Memory is not one store with one policy ... which is why one policy cannot
   govern them."* - **survived, and extended.** The paper's finding is the same
   argument one level down: one policy cannot govern the *consumers* of a single
   layer either. Landed as prose in the golden path and as the first technique.
2. *"Consolidated - the only layer allowed to speak as knowledge."* - **the one
   that moved.** The corpus models consolidated memory as a single layer holding
   "distilled facts, preferences, procedures". The paper splits it: the
   procedures the executor runs on, and the accumulated diagnosis used to revise
   them, must have **opposite** read policies for the executing agent.
3. *"Nothing reaches the agent's attention by residence alone."* - survived
   untouched; the new technique's discriminator is written to not contradict it.

## Routing count (Phase 2d)

`routing=n/a`. This is a paper, not a repository: no clone, no `file:line`
anchors, no tree to sweep, and the full text carries no code release. Design
decisions were reconstructed from sections 3.1-3.2.4 and became claim candidates
rather than a design record, so **no forge handoff was considered and Phase 7.6
was skipped** (`directions=n/a`). Recording this explicitly because "count met,
no cluster" and "no count to take" are different outcomes and a reader will
otherwise mistake this for a declined handoff.

## Triage table (v2.5 scored gate)

`auto=3/2/0`, `fp=0`. No row was declined; the two the score rejected are
recorded as leads, which is a stronger outcome than untriaged and is what they
earned.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Withhold the diagnostic store from the executor | agent-memory (`probe-without-write-back`, `instrument-exposure-control`) | new-technique | real gap | 4/0/2 | **accept** |
| 2 | K | technique | M | A rejected revision leaves its evidence | agent-memory (`procedure-promotion`, `audit-logging`) | new-technique | real gap | 4/0/2 | **accept** |
| 3 | K | amendment | M | A third capture source: transfer | agent-memory/`procedure-promotion` | corrects-claim | real gap | 3/1/2 | **accept** |
| 4 | K | technique | M | Push a sample to one reader, an index to the other | agent-memory (`recall-injection`, `read-set-bounded-links`) | new-technique | real gap | 2/2/2 | lead |
| 5 | K | technique | S | A monotone bar rejects the scaffolding step | game-production/`prompt-fitness-and-evolution` | none | partial | 1/2/1 | lead |
| 6 | - | catch | - | The accumulated store has no pruning mechanism | agent-memory/`decay-and-forgetting`, `rollup-compaction` | none | likely catch | - | already covered |
| 7 | - | catch | - | Full injection, so retrieval is unevaluated | agent-memory/`procedure-promotion` § Selection | none | likely catch | - | already covered |
| 8-11 | - | untriaged | S | four dated facts (see below) | - | - | thin | - | untriaged |

### Row 1 - `diagnosis-withheld-from-the-executor` (accepted, landed)

Anchor: §3.2, *"the Inference Agent is restricted from accessing the Wiki Layer,
as our ablation study shows that allowing wiki access during training negatively
affects skill development"*, and Table 3.

The ablation is a 2x2 varying store access independently for the two readers, one
model, four benchmarks, library empty in every arm: no library 40.4; neither
reader 48.7; **executor only 45.3**; both 60.9; **reviser only 63.7**. The
reviser's access is worth **+15.0**; the executor's access costs **2.8 to 3.4 in
both arms**, which is what makes it a property of the role rather than an
interaction.

Strip test survives cleanly and the mechanism generalises: a trace is only
evidence about an artifact if the artifact was the only source of what the task
needed, so any second store the executor can reach makes the trace a measurement
of the side channel. Boundaries written to the two nearest instruments, both of
which say "the read path is not neutral" and differ in what the read damages -
`probe-without-write-back` (the ranking state; the instrument is a *writer*) and
`instrument-exposure-control` (the score itself, upward). Neither owns this, and
the direction of the harm here is the opposite: the current number is honest and
the *next* one is worse, so no check on the current score can see it.

The technique's strongest section is not in the paper. The paper's hypothesis -
that the executor "may obtain task-solving knowledge directly from the wiki
rather than the skills" - implies the leak **is** the promotion backlog, so a
loop that keeps finding the executor needs the store is reporting an unpromoted
capability in the only way it can. That reading is what made the apply step
productive.

### Row 2 - `rejected-revision-leaves-its-evidence` (accepted, landed)

Anchors: §3.1 (Wiki Layer, *"not reset between iterations"*), §3.2.4 (*"the wiki
is never rolled back regardless of the acceptance decision"*; the harness
appends proposal metadata, target, unified diff, validation score and outcome
*"programmatically"*), and limitation 2.

**Two design candidates were folded into one technique**, per round 24's second
focus item - *before drafting N techniques from N design entries, ask which two
share a force.* "The knowledge layer is never rolled back" and "the harness, not
the proposer, writes the record" are two arms of one rule: the gate's verdict and
its evidence outlive the artifact they rejected, and are recorded by the gate.
Splitting them would have been padding at the design layer.

What is measured and what is design is stated inside the technique rather than
blurred: the +15.0 covers persistent accumulation as a whole (that arm removes
the maintainer too), and §5.2's late-revision timing supports it - 33% of
accepted revisions in the middle third and 28% in the late third on the hardest
benchmark. The never-roll-back rule and the gate-authored record are structural
choices in the same system, not arms of its experiment, and clear the
corroboration bar by **convergence** instead: any maintained corpus that triages
candidates reaches the same rule because an unrecorded rejection is re-proposed
indefinitely.

The technique's own sharpest line is a boundary the paper does not draw: **a
rejection record is not a verdict on the idea.** Store the diff and the number;
do not store the reason. A reason written at rejection time is a hypothesis
authored at the moment of least information, and it hardens into a fact later
iterations reason from.

### Row 3 - amendment to `procedure-promotion` (accepted, landed)

The host technique declared its own completeness - *"Two sources feed promotion,
and they have opposite weaknesses"*, Observation and Demonstration, *"neither is
sufficient alone"* - which is the enumeration hunt, and the paper contains the
third member. Anchor: Table 2 and §4.2.

Measured across five models spanning two families: a mid-size model on
spreadsheet manipulation went 24.3 with no procedures, 33.6 with its own, **50.5
with a larger sibling's**; a 31B-class model on competition mathematics went
33.9, 56.7, **73.7**. Transfer ran *upward* too - a 4B-class model's procedures
lifted the 31B-class model to 73.1 and 66.9. *"Stronger source models do not
necessarily produce better skills."*

The enumeration sentence was given a forward pointer rather than contradicted
two screens later, so the file's existing sentences stay true and the change
scores as an append. The reason the third source works is recoverable from the
host's own weakness analysis, which is why this is an amendment and not a
technique: an author whose runs never failed at a step has no evidence the step
is load-bearing and compresses it out, so **a weaker author records more of the
method.** One provenance addition: name the *authoring agent*, not only the
episodes.

Scope condition carried into the section, because it binds every number in it:
the procedures were injected in full with no retrieval step, deliberately, so
none of this speaks to whether a transferred procedure is *selected* correctly -
which is where the host's own § "Selection is the scaling failure" numbers (8,135
controlled trials) say the real degradation lives.

## Leads

- **Push a sample to one reader, an index to the other** (row 4). The paper gives
  its two store readers opposite context strategies: the consolidator receives a
  *stratified sample pushed to it* (§3.2.2, sampled to avoid context limits),
  while the reviser receives *the index plus a pass/fail summary* and pulls
  specific pages and traces on demand with `read_file` (§3.2.3). The
  discriminator looks real - whether the consumer knows in advance which traces
  it needs - and nothing in the corpus owns the choice: the promoting question
  was executed against `recall-injection` and `read-set-bounded-links` and
  neither covers delivery shape (the latter is about link authoring via a
  request-local identity map). **But the paper makes no measurement here** - it is
  a design choice justified by context exhaustion, with no ablation - and by this
  class's own rule the framework cannot authorize a technique. *Return condition:
  a source that measures pushed-sample against index-and-pull for a trace-store
  consumer, or a fleet project that grows both readers.*
- **A monotone acceptance bar rejects the scaffolding step** (row 5). Limitation
  2, in the paper's words: gating requires each accepted proposal to improve the
  validation score, *"which excludes neutral proposals that preserve immediate
  performance but could enable gains in subsequent iterations"*. Adopted for
  comparability with prior work; no alternative measured. Folded into technique 2
  as a stated cost of the high-water bar rather than banked bare, so a reader
  setting the bar sees it. *Return condition: a source that measures a loosened
  bar, or a loop in a fleet tree that admits neutral proposals and can be
  compared.*

## Already covered (catches)

- **No pruning mechanism for the accumulated store** (limitation 3: the wiki
  *"continuously accumulates ... but currently lacks an automated mechanism to
  prune"*). The corpus is ahead of the literature here, and by some distance:
  `decay-and-forgetting` (with the audit trail obligation),
  `rollup-compaction` (the pass the other two cannot see - decay finds nothing
  low-value and supersedence finds no contradiction), and the
  `creation-names-reaper` law. Worth recording as a catch precisely because a
  frontier paper names as future work a stage this subject models in three
  places.
- **Full injection, so nothing here evaluates retrieval or triggering**
  (limitation 1). `procedure-promotion` § "Selection is the scaling failure"
  already owns this with a far larger measurement, and its finding is the harsher
  one: in-execution invocation precision collapsed 29.6% to 3.3% as pools grew 5
  to 100 while task success stayed flat. This paper's scope condition is
  therefore not a gap to fill but a qualifier on citing it, and it is written
  into the amendment.

## Untriaged (nobody verified these; anchors kept so a later run need not re-derive)

- **Revision timing across the run.** Appendix Table 5: 39-52% of accepted
  updates land in iterations 0-1 across models, 39-58% across benchmarks, with
  33% middle / 28% late on the hardest benchmark. Cited into technique 2 as
  support for accumulation; the *shape* of the curve (when to stop iterating) is
  unmined.
- **Artifact length varies by model more than by task.** Table 4: 118.9-128.6
  lines for one family, 45.1 and 81.2 for two others; 142.5 lines on the
  hardest benchmark against 84.6 on the easiest.
- **Store growth rates.** Table 4: 6.3-8.9 patterns created and 7.0-18.4 edits
  per run by model; 4.4-9.8 patterns by benchmark.
- **Skill evolution complements model scaling.** Figure 1 and §4.2: the
  advantage is *more* pronounced for stronger models, while smaller models with
  procedures beat substantially larger ones without. A dated fact about a model
  generation; cited into the amendment rather than landed.

## Apply (Phase 7.5) - three rows, and where each was FOUND

Reported per round 24's second focus block - *report where in the pipeline the
run's landings were found, not just where they landed.* All three landings came
out of **Phase 6 verification** (the absolutes hunt and the enumeration hunt),
not out of extraction; Phase 3 produced eleven claim rows and none of the three
techniques in the shape they landed in.

1. **`rejected-revision-leaves-its-evidence` -> personas, `task`, `better`,
   `ab-paired`.** The fleet's prompt-evolution loop records `variants_tested` as
   a count plus two fitness numbers and a prose `summary`, and stores no tested
   candidate anywhere - three of the technique's four required fields, plus the
   one field it argues against. The structural fact is that **the tree already
   holds the opposite design on its newer surface**, whose fitness loop is
   deferred: so the surface that keeps the diff does not run, and the surface
   that runs and rejects keeps no diff. Nobody designed that. Paired on a scratch
   database: 0 of 3 candidates recoverable at HEAD, 3 of 3 on the branch, with
   the CHECK, the FK, the UNIQUE and the CASCADE each exercised. Shipped as step
   1 of 3 on a branch, not merged - a table nothing writes to is half a feature.
   Gate reached: the DDL, paired. Gate not reached: `cargo check`.
2. **`diagnosis-withheld-from-the-executor` -> the registry's own skill lane,
   `experiment`, `better`, `before-after`.** This method is configured the way
   the ablation measures as worse: the executor is instructed to read the
   diagnostic layer at Phase 1, and the run's outputs are the evidence Phase 11
   revises the method with. Measured: 56 declared-focus blocks, **83 distinct
   numbered imperatives, 9 carried by the gated file** under strict phrase
   matching, 73 not. Hand-sampled twelve in both directions - eight likely-absent
   all genuinely absent, two of four likely-reworded had in fact landed - so
   carriage is **9 to roughly 25 of 83**. The worst instance is the technique's
   promotion-signal clause verbatim: one demand appears **27 times**, its own text
   counting *sixth* through *tenth deferral*, and the gated file mentions it
   **zero** times. Nothing was promoted by this run; that lane's bar is
   three-runs-confirmed and a mid-flight method edit is the one change a parallel
   fleet cannot absorb quietly.
   *The same technique was also checked against personas and the tree is
   **conformant**: `engine/evolution.rs` writes nothing into the memory store the
   executing persona reads, and its only read of execution history is a
   `COUNT(*)` for the trigger. Verified rather than assumed.*
3. **`procedure-promotion` third-source amendment -> personas, `experiment`,
   `not-better`.** The third source is unexpressible in the shipped loop, not
   merely absent: the genome is derived by `PersonaGenome::from_persona` from the
   *same* persona, and a variant's `source_persona_id` is stamped with a freshly
   minted `evo-<uuid>` - a generated value occupying exactly the field the
   amendment asks to carry an authoring lineage. The ingredient exists one layer
   down (`team_memories` shares recorded experience across the personas in a
   team), but that is memory, not a promoted procedure, which is the distinction
   the host technique exists to draw. Nothing shipped. *Return condition: the loop
   can seed one persona's genome from another's episodes, at which point
   `source_persona_id` is the field to fix first.*

## Method notes for the reflection lane

- The class prediction paid twice: it named the ablation as the substance before
  extraction, and it is what **rejected row 4** - a real corpus gap whose only
  support was an unmeasured design choice in a framework paper. A gap the run
  believes in and declines to land on the source's authority is the class rule
  doing its job.
- The first version of the Phase 7.5 instrument **failed its own assertion** -
  bag-of-words scored a known negative at 1.00 - and the second one caught a
  both-arms-zero tie in the personas gate. Two instruments, two self-catches, in
  one run.
