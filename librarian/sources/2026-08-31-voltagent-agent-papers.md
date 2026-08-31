---
source: awesome-ai-agent-papers
kind: reference-index
url: https://github.com/VoltAgent/awesome-ai-agent-papers
title: "Awesome AI Agent Papers"
author: VoltAgent (curated)
commit: a2ffba2be2752f22e151619cd3d5a0447a1d4372
words: 16346
refs_found: 1159
refs_distinct: 382
refs_ranked: 382
refs_read: 24
waves: 3
refs_untriaged: 358
fetches: 44
extracted: 66
accepted: 28
declined: 0
leads: 21
already_covered: 16
untriaged: 358
dispatched: 0
applied: 4
shipped: 0
run_id: 2026-08-31-voltagent-papers
siblings: 7
---

# Awesome AI Agent Papers - first run of the reference-wave lane

The lane's first real source, and it behaved as designed. 382 distinct documents,
16 read across two waves, the other 366 ranked and recorded rather than discarded.
Ranked tail: [`2026-08-31-voltagent-agent-papers.refs.md`](./2026-08-31-voltagent-agent-papers.refs.md).

Seven live siblings on the board at start. They held `agent-memory`, `retrieval`,
`eval-harness`, `model-routing`, `quality-gates`, `measurement-honesty` and
`fleet-orchestration` - most of the ground a 2026 agent-paper index maps onto. That
steering is recorded because it changed what was read, not only what was written.
It also killed the top-ranked paper in the whole index: its only home is
`retrieval`, which a sibling held.

## What the index is, and its one finding about itself

A pure bibliography: one 175KB README, no other file, 16,346 words that are almost
entirely link text plus a ~23-word curator annotation per row. Five sections, zero
papers cross-listed, all arXiv, all 2026-01 onward.

Signal mix across all 382 annotations - the class's marketing half, quantified:
**28 claim a negative result (7%), 126 claim a measurement (33%), 167 propose a
framework with nothing measured (44%)**, 68 neither.

Its own finding, a bibliography being a stated opinion about a field's edge, is a
divergence: the curator puts ~47% of 2026 agent-paper output in tooling and
security, while our `llm-agent` bundle has 29 subjects of which one is agent
safety. Recorded as a lead, not acted on.

## Three annotations were materially wrong

The lane exists because titles and annotations cannot rank references. First
contact confirmed it at a measurable rate - 3 of 16 read:

- one named random seeds as a dominant effect; the paper measures seeds as the
  *smallest* effect (~3%) and the large ones as deterministic implementation
  choices (6-14.5 points). Acting on the annotation would have sent a reader to add
  seeds and measure nothing.
- one said "56 scenarios across 8+ disciplines"; the paper says 53 and exactly 8,
  and only 3 of the 53 were quantitatively evaluated.
- one said "48,000 simulated failure scenarios"; it is 300 base cases under ~160
  conditions, with the taxonomy induced from 170 hand-coded traces.

A fourth sent a worker to the wrong paper entirely - which became that lane's
second-best finding.

## Accepted (7 amendments)

**Family A - the damage floor is false where the deliverable is the text.**
Three independent sightings, verified disjoint on authors, institutions and
benchmark lineage, with the earliest predating the others so it cannot be a relay.
Landed as a bounding of `prompt-safety`'s own ranking, not a deletion of it:
capability is the last fence *when the payoff is an action*; where the deliverable
is the payload, the second half is least privilege on the **read** side. The
strongest support is internal - the subject already calls a secret recalled into
prose "the attack proper", two sections above the ranking that ignores it.

- `prompt-safety.md` - golden path, the read-side half of the last fence
- `techniques/payoff-removal.md` - a fourth payoff class, **persuasive**: a prose
  channel that works to lower its reader's chance of rejecting it. The inert
  assignment rests on the reader noticing the text has gone strange, which holds
  only while the text is not trying to look normal.
- `techniques/untrusted-span-fencing.md` - a second residual, structurally unlike
  the first: harm that is a property of a *pair* of spans, where each is
  individually unobjectionable. Every operation in the subject is per-span, so the
  whole remedy ladder runs clean and buys nothing. Not an inventory gap - the
  inventory names retrieved memory explicitly. A remedy gap, which is worse.

**Family B - the corpus's degradation triggers test shape, not truth.**
Substantially revised mid-run (see below). What survived: the tool/transport lane
has no trigger for a response that parses, validates and is wrong, and no document
states the cross-bundle boundary.

- `mcp-tools/techniques/untrusted-result-handling.md` - the premise selects one
  direction; every mechanism lowers a result's weight and none raises it. The
  excluded case is the honest tool contradicting the model's prior, where the prior
  wins by default. The literature disagrees on which side wins, and that
  disagreement is the finding: the tiebreaker is not conservative, it is
  unpredictable.
- `model-routing/techniques/failover-horizon.md` - a seventh form of unusable
  success the six enumerated forms cannot reach, plus the only portable instrument
  (agreement across repeated draws, canonicalized) and its honest price (n x tokens,
  n x latency). Came from the *baseline column of a paper whose thesis failed*.

**Held for a sibling, landed when the board cleared:**

- `fleet-orchestration/techniques/coordination-failure-triage.md` - corrects a
  sentence we publish. An agent judge labels the observable effect at ~0.86-0.90 F1
  and the root cause at ~0.45-0.57 on the same artifacts. The bulk pass is
  automatable on the symptom axis only, and the cause axis routes the fix.
- `eval-harness/techniques/failure-attribution.md` - the funnel's tells are written
  from inside a run that executed, so owners preventing the run from *starting* fall
  through to Model and get the most expensive response for problems no model can
  fix. Symmetric to the eighth owner's own argument, run backwards.

## Already covered (11) - and twice we are ahead of the published field

- verdict cardinality: a published state-of-the-art grounding check runs binary
  supported/not-supported, penalizing *unstated* and *contradicted* identically.
  `failure-not-empty-success` and our three-valued discipline are ahead.
- trajectory vocabulary: `worker-trajectory-anatomy` (1,794 annotated trajectories,
  63,000+ steps, plus an independent 20,574-session field corpus) is better
  evidenced than either wave-2 paper offering one.
- benchmark admitted on the outcome it reports -> `unaided-baseline-screening`
- windowed drop detection -> `windowed-score-drop-alerting` (ours relative, theirs
  absolute; ours is better)
- composite metric over a fixed denominator -> `renormalize-over-present`
- schema drift at the seam -> `untrusted-result-handling`
- aggregate blame before acting on one failure -> `coordination-failure-triage`
- block taxonomy -> `agent-chaining`
- self-reported confidence is uncalibrated -> `confidence-weighted-blend`
- similarity matching rejected for claim binding -> `citation-required-per-claim`
- causal provenance is not blame -> `chain-identity-and-rollup`

## Corrected mid-run - a premise this run got wrong

Wave 1 concluded the corpus "owns nothing that scores a trajectory" and "has no
material on agentic workflow selection". **Both were false, and the verification
that confirmed them was invalid.** The check was a grep for `ReAct` and
`Plan-and-Execute` over `knowledge/` - scaffold proper nouns, which
`check-bundles.mjs` *forbids* in upper-layer documents. A proper-noun grep over a
purity-gated corpus is guaranteed to return empty; it measures the gate, not the
coverage. A manufactured total empty, which Phase 4 already warns is more dangerous
than a near-empty.

Two wave-2 lanes caught it independently. `worker-trajectory-anatomy` is exactly
the missing thing and is better evidenced than either paper proposing one;
`assertion-vs-judgment` already names correct-shape-but-false; and the full
groundedness build exists in eight techniques under
`civic-intelligence/accountability-method/llm-forensic-gating/`.

**Root cause, and the run's most valuable output: `research-map` matches slugs.**
Director test, in-run: `research-map "evidence conditioned faithfulness"
"groundedness verification"` returns six subjects and `llm-forensic-gating` is not
among them. An eight-technique build that directly owns the concept is invisible to
the instrument that decides prior art. Every "we have no material on X" this corpus
has drawn from that instrument is suspect.

## Leads (9)

1. **`research-map` cannot see a concept filed under an unrelated slug.** Owed work,
   not a lead waiting on the world. Proposed: a `use_when`/prose pass (`--deep`
   exists and was not enough here), or an embedding index beside the slug index.
2. **Blame attribution for a step in a failed multi-step run** - nothing in
   `agent-chaining` or `fleet-orchestration` assigns it; four near-misses each
   decline the job. Counter-refutation in hand: forced total ordering is noise at
   fleet size, because ~42% of failures are specification defects and the brief is
   not a step. Return: a second source ranking components under a fixed
   representation with the judge ablated.
3. **`hibernation-and-resume` states "warm context is the asset" unqualified** - no
   discriminator for when carried context is the liability. Return: a second
   independent sighting that a persisting session's context degrades its output.
4. **The mid-run health verdict on a persistent fleet member** - alive, responsive,
   inside every guard, getting worse. `cycle-and-depth-guards` says out loud that
   its convergence check is unowned.
5. **No fault-injection subject anywhere in `operations/`.** XL. Return: an SRE
   first-party account, or a platform's own fault-injection docs.
6. **Tool description/schema as an attacker-controlled span** - our inventory names
   tool *results*; the manifest reaches the model first and is never fenced.
   `failure-attribution` treats the contract as a distinct artifact but asks only
   whether it is wrong, never whether it is hostile.
7. **A reported n of executions is not a denominator of subjects.** Clustering
   invalidates the swing-width argument; `minimum-sample-floors`' four stated
   exceptions do not include it, and the corpus holds the idea in the *recruiting*
   bundle only. The run's strongest new-technique candidate; not landed (scope).
8. **A rising inter-rater kappa is protocol drift, not reliability.** Observed
   0.000 -> 1.000 monotonic with annotation order, headline reported as ~0.99.
9. **The Family B base rate is structurally unobtainable from bug-report corpora.**
   Nobody files a ticket saying the agent gave them a well-formatted answer they
   believed. Two corpora over the same technology reported *inverted* symptom
   distributions because the reporting channel decides what gets filed. Return: an
   instrumented trace corpus with per-step ground truth, or our own.

## Wave-3 references, ranked and unread

- ~~`2604.23588` FinGround - atomic claim verification against **table cells**, with a
  detection base rate (43% of computational errors).~~ **READ IN WAVE 3, AND THE NUMBER
  ABOVE IS INVERTED.** The paper's sentence is that existing detectors *miss* 43% of
  computational errors; it is the miss rate of generic detectors, not a catch rate of
  domain-specific ones - and it is n=200 on a claim type that is 13.8% of its taxonomy.
  This lead was written from a wave-2 worker's second-hand impression and the sign
  flipped in one hop. **A reference's headline number does not survive a relay; the run
  that lands it must re-read the sentence containing it.**
- `2603.04663` VeNRA - deterministic fact ledgers; retrieve variables, not prose.
- `2605.25338` CausalFlow - causal attribution and counterfactual repair for agent
  failures; the natural counterpart to `failure-attribution`. Not in this index.
- `2603.16475` Breaking the Chain - faithfulness to intermediate structures.

## Wave 3 - the ranking was aimed at our enumerations, not at topics

Wave 2's lesson was that the landings came from hunting our own completeness claims
rather than from what the papers contained. Wave 3 applied it: instead of ranking
references by subject, it ranked **our** stated enumerations and matched references to
them. `agent-memory` - the registry's highest-attention subject, freed when the board
emptied from nine siblings to two - carries five, including a stated assumptions
section naming the very architecture two of the papers implement.

**8 of 8 lanes returned worth-a-slot, the run's best hit rate**, and the aiming
produced two independent three-way convergences.

### Convergence one: `baseline-ladder` is under-specified in three ways

Three papers, three distinct gaps, none of which is about the papers' own subjects:

- **The standard promises a ladder it never delivers.** § "What this standard assumes"
  says that where memory behaviour moves into weights, enforcement moves to "reward
  design, held-out evaluation, and an explicit ladder of baselines". Verified: all four
  rungs are frozen-reader architectures, and a grep of that file for
  learned/trained/weights/policy returns zero. The rung that was missing is *the same
  system with the learned decision pinned* - and the substitution routinely made
  instead is a comparison against rival systems, which answers a different question.
- **The predicate enumeration omits the elaboration regime**, which is the largest
  uncontrolled term available: same evidence, same consumer, one instruction to reason
  step by step moved a result 21.8 points - further than any architecture comparison
  the technique discusses - with a token control ruling out generation volume.
- **A stage ablation measures its operating regime, not the stage.** One paper's
  "forgetting is worth nothing" result was run on a store that never filled; its own
  capacity appendix shows delete rates rising once capped.

Landed as three amendments. The ladder also gained a **ceiling arm** it lacked, with
the caution that a ceiling is a diagnostic and not a bound - a staged process was
measured above one even with elaboration held equal, because a minimal-sufficient
evidence set is not a maximally-helpful one.

### Convergence two: `deterministic-backbone` gains three

- **Enforced declarations are backbone-grade; honored ones are not.** The technique
  said "prefer structural evidence over declared evidence", drawn too wide from an
  example of an *unenforced* declaration. An annotation a container consumes cannot lie
  without breaking the program; a runtime-resolved subscription is perfectly structural
  and invisible to any parser. The cut is whether something executes the declaration.
- **A tolerance band is a detection hole exactly its own width.** A tolerant comparator
  satisfies all three of the technique's stated properties and is blind where a wrong
  number is most plausible: one verifier holding near-perfect recall in general fell to
  roughly seven in ten on discrepancies within a few percent.
- **A stored backbone is admitted, not computed.** Where the rows were proposed by a
  model, determinism is manufactured at the door. Bind the value *and* bind the key -
  a figure can be quoted perfectly and filed under the wrong metric, and value-binding
  alone passes it. One ledger gating both rejected ~30% of model-proposed rows.

### The best single result, and it argues for us

The standard's own boundary statement **over-concedes**. Its "Relocated" bullet claims
tiering the budget moves into weights under a learned architecture. In the reference
implementation of that architecture the tier partition stayed a design-time constant,
and it out-ablates every learned operation. The strongest available argument for the
three-layer design came from a paper built to replace it. Banked as a lead rather than
landed (scope), with the paired finding that provenance is the *training signal* that
architecture is missing, not merely the audit record it owes - the paper's own
limitation section names per-entry credit assignment as its open problem, which is the
same missing edge approached from the optimization side.

### A number this run got wrong, and fixed

Lead 9 of wave 2 recorded a "43% detection base rate". Wave 3 read the paper: the
sentence says existing detectors *miss* 43% of computational errors - a miss rate of
generic detectors, not a catch rate of domain-specific ones, on n=200 across a claim
type that is 13.8% of its taxonomy. It reached the note from a worker's second-hand
impression and the sign flipped in one hop. Corrected in place. **A headline number
does not survive a relay; the run that lands it must re-read the sentence containing
it.**

### A fourth wrong annotation

"Don't Retrieve, Navigate" appears zero times in its paper, which spends a section
disowning the framing ("a complementary primitive rather than a universal
replacement"). Running total: 4 of 24 annotations materially wrong.

### The instrument fix - the finding that outgrew the source

Wave 2 established that `research-map` matches slugs and is blind to a concept filed
under an unrelated name. Wave 3 measured it twice more: `claim-verification-and-provenance`
(six techniques, forged 2026-08-30) also surfaced only by hand. **Fourteen techniques
across two `civic-intelligence/accountability-method` subjects own claim verification
completely, and the `llm-agent` lane has been independently re-deriving them from
finance-ML papers.**

`scripts/research-map.mjs` now takes `--prose`, which reads document bodies and scores
the term against the text. Measured before and after on the query that failed:
`llm-forensic-gating` went from absent to second, and on "atomic claim verification"
both civic builds now rank first and second. Weighting had to be corrected once - a
subject sharing the single word "verification" initially outranked a subject whose
prose carried the whole concept.

**Its honest limit**: it helps where vocabulary overlaps and not where it does not.
"evidence conditioned faithfulness" still misses both builds, because those words are
not in those documents. A prose pass raises the floor; it is not a semantic index.

### Wave 3 leads - LANDED in a follow-up pass

The agent-memory cluster produced roughly a dozen more amendment candidates, all in
free subjects, all with anchors: the Relocated-bullet correction and the provenance
inversion above; a harmful delivery must not read as a use (a delivery counter cannot
tell an item that helped from one that hurt, and the corpus's bound is calibrated for
the *useless* case); the recall budget is a ceiling rather than a target (ranking plus
greedy packing structurally cannot leave it unspent, and reordering alone reproduced
the baseline to three decimals); packing assumes items are substitutes where a
composing task makes them complements (one absent required item cost 28.7 points with
no partial compensation); routing-grade and assertion-grade distillation have different
correctness bars; a compiled access structure over a store is stale by construction
rather than by failure; downstream accuracy is not a coverage detector (a model
extractor dropped ~a third of its source files while its accuracy score barely moved);
a validated citation is not a verified one; and "absent from the store" is a fourth
flavour of absence whose next action is neither none, nor re-run, nor fix-the-instrument.

**All fifteen landed** in a follow-up pass across ten files, after the board showed
every target clear. Two of them then applied against a live store with paired arms,
and the pairing is the run's cleanest measurement:

- **74 evidence rows whose citations resolve. Referential integrity - what the
  pipeline runs - passes 74 of 74. The read-back the amendment prescribes passes 14
  and fails 60.** The shipped schema has carried a `verified_at` column on that table
  the whole time and **0 of 104 rows have ever had it set**: the store was built with
  somewhere to record the check and the check has never run. Honest bound on the 60 -
  they are unconfirmable against current source, which collapses paraphrase with
  drift-since-recording, and the measurement cannot separate them. That is itself the
  finding: **the read-back is a write-time instrument**, so deferring it converts a
  checkable claim into an unresolvable one at no visible moment.
- **693 memory nodes against 14 edges** - 20 nodes (2.9%) participate in any relation,
  so 673 are reachable from exactly one place, and of 29 contexts one holds 555. Nobody
  designed it; it falls out of writing nodes with a context id and adding the edge
  table afterwards, which is the ordinary way a store acquires single-home assignment.

Thirteen remain unapplied for one structural reason recorded once rather than thirteen
times: they govern how a number or a derived artifact is produced, and no managed
project builds the artifact each governs - no memory comparison, no structural
extractor, no tolerant comparator, no compiled navigation surface, no per-claim
citation regime.

## Untriaged (358)

Ranked, unread, recorded with class, score band and map hit in the companion file.
Nobody verified them. They are not declines.
