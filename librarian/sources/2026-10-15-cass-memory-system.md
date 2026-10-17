---
source: https://github.com/Dicklesworthstone/cass_memory_system
kind: repository
url: https://github.com/Dicklesworthstone/cass_memory_system
title: "Procedural memory for coding agents, distilled from session history, read with its stricter successor"
author: Jeffrey Emanuel (first-party practitioner; series DLE, round R5)
commit: 12d2033273da83b81824b7cb71aa5e959b45393f
commit_date: 2026-10-14
evidence_trees: "eidetic_engine_cli 1679e0fa40c1fd969a26f1cb82143f391c0fb30d (the stricter successor, read for its procedural-memory core only)"
words: 15,190 landing (ingest) / about 54,000 in-tree markdown in the first tree and about 723,000 in the second; about 6,500 and about 30,000 read whole or by section, plus about 4,000 lines of code; 1 fetch of 3
extracted: 23 (19 design entries across two trees, 4 claim rows; the cm reader's 10 claims folded into them)
accepted: 4
declined: 0
leads: 4
already_covered: 9
untriaged: 6
dispatched: 0
applied: 1
shipped: 2
run_id: dle-r5-1015
siblings: 2
series: librarian/handoffs/2026-10-14-dicklesworthstone-series.md (round DLE-005, memory lane)
rescan_when: "the first tree stops applying the session verdict to every shown rule id, or makes the proven class require evidence other than accumulated helpful marks; or the successor's weight tuner gains an exploration slot or propensity weights, or its posterior gains a time discount; or 8 weeks elapse (2026-12-10)"
---

# Procedural memory from session history - intake 2026-10-15 (series round DLE-005)

**Class:** first-party practitioner account in repository form, read as a system. Two
trees by one author: `cass_memory_system` (a Bun CLI, "cm": session transcripts are
distilled into a playbook of rules that carry helpful/harmful feedback, decay and a
maturity ladder) and its stricter successor `eidetic_engine_cli` (a Rust CLI, "ee", 93
decision records, the model moved outside the process). The landing page is 15,190 words
and was used as an index only; everything below comes from the clones. Expected yield
for this class, said before triage: claims about what the author built and measured,
n=1, and a memory number that is a lead until it is re-run here.

**Run conditions.** Memory lane (`--memory`): every mechanism was priced against the
memory-year ladder before the corpus. Declared focus from the last scorecard row: check
each premise a builder brief states against its record before dispatch; and from the
row before it, open the named neighbour for every likely-catch row before banking it.
Both were applied (see "Corrections and catches"). Two siblings were live on the board
at the start (`dle-002-1015` on concurrent-vcs, concurrency-guards and fleet
orchestration; `dle-004-1015` on the session archive); `dle-r10-1015` joined mid-run.
None held agent-memory.

## License and what this run did not do

Both trees carry MIT with a rider restricting use by or for two named AI companies; the
operator ruled full intake with mitigations on 2026-10-14. Obeyed here: no verbatim code
or prose of the author's in any tracked file beyond `path:line` anchors with quotes of at
most ten words; clones at `C:/t/dle-r5-1015/` deleted at run end; no task rows or
patches on either clone (intake's source-tree task row is skipped); nothing pushed or
filed upstream. The arm-A attribution rule in the personas instrument is restated from
scratch, not copied. The source's trauma guard (a command and commit blocklist) is the
safety ring the operator excluded; its two findings are recorded as out of scope, not
triaged.

## Design record

Anchors are relative to a directory holding the clones under `cm/` and `ee/`; every one
below was verified with `node scripts/check-anchors.mjs <note> --root C:/t/dle-r5-1015`
before this note was written (the readers' full records held 91/91 and 125/125). Two
systems, grouped by tree.

### System cm - the first tree

**cm-D1. A model proposes typed deltas; code applies them.**
- forces: a model re-summarizing the whole rule set loses accumulated detail; the plan
  makes "no wholesale rewrite" its governing constraint.
- buys: every change traces to one logged delta.
- rejects: whole-playbook rewriting by a model.
- where: `cm/docs/planning/PLAN_FOR_CASS_MEMORY_SYSTEM.md:54 "No LLM rewriting of playbook to prevent collapse"`; `cm/src/validate.ts:204 "Non-add delta type:"`
- stage: reflection to curation. corpus: `consolidation` (one validation door) - catch,
  with a gap the golden path already names as "the silent second writer": only add
  deltas are validated, so a model's replace can rewrite a rule's text while it keeps
  its feedback history (`cm/src/curate.ts:775 "bullet.content = delta.newContent;"`).

**cm-D2. Birth gate: an evidence count first, a model only for the ambiguous band.**
- forces: a validator that judged only corroboration rejected every novel lesson.
- buys: model spend limited; novel lessons enter as drafts.
- rejects: sending every proposal to the model; the plan's join to diary outcomes
  (the code counts regex hits over search snippets instead).
- where: `cm/src/validate.ts:138 "if (successCount >= 5 && failureCount === 0) {"`; `cm/src/validate.ts:286 "so an uncorroborated novel lesson would be REJECTED rather"`
- stage: curation. corpus: `memory-governance` / `pending-beliefs-live-apart` - catch.

**cm-D3. Score recomputed from a timestamped event log: decay, 4x harm, maturity.**
- forces: a rule that helped long ago must not rank forever.
- buys: scores and maturity re-derivable; a scrub can remove a session's events.
- rejects: plain counters (kept only for old readers).
- where: `cm/src/scoring.ts:80 "const rawScore = decayedHelpful - harmfulMultiplier * decayedHarmful;"`; `cm/src/types.ts:309 "minHelpfulForProven: z.number().default(10),"`
- stage: scoring. corpus: `memory-value-model` (pure derivation, half-life) - catch. The
  constants (90 days, 4x, 0.3) carry no derivation, and the README states 25% where the
  code says 0.3 (`cm/README.md:1433 "Harmful ratio >25% OR explicit deprecation"`).

**cm-D4. Relevance decides retrieval; feedback reorders inside a band of about 10%.**
- forces: generic process rules shown on every task collected helpful marks and crowded
  out the specific rule a query needed.
- buys: no number of marks lets a weakly relevant rule outrank a strongly relevant one.
- rejects: relevance multiplied by the raw score (reconstructed in the benchmark).
- where: `cm/src/commands/context.ts:559 "finalScore: relevanceScore * getFeedbackMultiplier(b, config),"`; `cm/test/context-retrieval-benchmark.test.ts:56 "because it is shown on every task (#89)."`
- stage: retrieval. corpus: `memory-value-model` (the bounded usage term, value after
  relevance) - catch for the ranking. The fix sits downstream of cm-D5.

**cm-D5. One session verdict onto every shown rule id; blame gated, credit not.**
- forces: blanket grading made one error in a mixed session mark dozens of rules
  harmful.
- buys: weak incidental negatives abstain.
- rejects: symmetric blanket grading.
- where: `cm/src/outcome.ts:131 "const AUTO_GRADE_BLAST_RADIUS = 8;"`; `cm/src/outcome.ts:229 "if (helpfulFinal >= harmfulFinal) {"`
- stage: feedback. corpus: **NONE**. Nearest neighbour `memory-value-model`, whose
  "signed signal replaces an unsigned count" clause is written for a per-item
  with-and-without probe and does not model a run's verdict copied onto its delivered
  set; the golden path names the selected set as the credit edge a learned store needs
  and stops there.

**cm-D6. The memory refuses to learn from its own model calls.**
- forces: the store's own reflector and validator transcripts were captured as agent
  sessions and graded as real work.
- buys: an id appearing only in a store-authored prompt earns nothing.
- where: `cm/CHANGELOG.md:125 "no longer learns from cm's own LLM calls"`; `cm/src/orchestrator.ts:555 "prompts must still be unable to award themselves helpful counts."`
- stage: capture and feedback. corpus: `memory-governance` (the evidence's author is
  stamped at capture from its channel) - catch; folded into the new technique as one of
  its exposure channels.

**cm-D7. Dedup reinforces instead of adding; opposite directives never merge.**
- forces: word overlap merged a negated rule into its positive (0.857); embeddings score
  opposites 0.88-0.98, so no threshold separates them.
- where: `cm/src/curate.ts:37 "if (directivesDisagree(newClauses, meta.clauses)) continue;"`; `cm/CHANGELOG.md:42 "(Jaccard 0.857), crediting the opposite advice"`
- stage: curation. corpus: `consolidation` ("test contradiction and supersedence before
  duplicate") - catch. The guard is absent from the sibling block filter (`cm/src/playbook.ts:480 "if (unionSize > 0 && intersectionSize / unionSize > 0.85) {"`),
  which is the amendment landed below.

**cm-D8. Negative knowledge two ways: a harmful rule is inverted into a retrievable
"avoid" rule; catastrophic patterns become hard blocks.**
- forces: a deleted harmful rule is re-proposed months later and the failure forgotten.
- where: `cm/src/curate.ts:864 "decayedHarmful > decayedHelpful * 2"`; `cm/.beads/issues.jsonl:31 "someone proposes the same rule again"`
- stage: forgetting. corpus: partial (`rejected-revision-leaves-its-evidence`,
  `decay-and-forgetting`'s forward-facing bar). A feedback mechanism, so in this lane a
  lead (below). The hard-block half is the excluded safety ring.

**cm-D9. Capture keeps head, tail, and the corrections from the dropped middle.**
- forces: a fixed head-and-tail cut dropped exactly the turns where the agent was
  corrected.
- where: `cm/src/utils.ts:1915 "if (isUser && (isCorrection || isError)) priority = 3;"`; `cm/src/types.ts:488 "plain text scan with no extra LLM call."`
- stage: capture. corpus: `episodic-capture` (the exact words of a correction) - partial;
  untriaged below.

### System ee - the successor

**ee-D1. A rule starts at bounded confidence; generic advice fails an executable
specificity score.**
- where: `ee/docs/adr/0006-procedural-memory-requires-evidence.md:15 "Procedural memory requires evidence. New rules start with bounded confidence"`; `ee/docs/adr/0010-curation-specificity.md:40 "cheaper than admitting durable procedural noise"`
- stage: curation. corpus: partial (nothing in `consolidation` states a birth bar
  against generic items). Untriaged below.

**ee-D2. Propose, validate, apply for every mutation.**
- where: `ee/docs/adr/0014-propose-validate-apply-curation.md:18 "All memory mutations go through a three-phase curation queue"`
- corpus: `memory-governance`, `pending-beliefs-live-apart` - catch.

**ee-D3. The model sits outside the process; results become pending candidates only,
and high-risk kinds pass through an advisory stage first.**
- where: `ee/docs/adr/0044-no-llm-reflection-handshake.md:42 "They do not create memories"`; `ee/docs/adr/0045-high-risk-reflection-routing.md:172 "confidence is not trust evidence in ee."`
- corpus: `memory-governance` - catch.

**ee-D4. Helpfulness as a Beta posterior; trust-class moves read interval bounds with
hysteresis and a minimum-evidence gate.**
- forces: trust-class flicker near a threshold; two helpful events weighed like two
  thousand.
- where: `ee/docs/adr/0032-bayesian-memory-posteriors.md:18 "Trust-class flicker."`; `ee/docs/adr/0032-bayesian-memory-posteriors.md:26 "Sample-size blindness."`
- stage: scoring. corpus: **NONE** (no hysteresis or interval gate in `agent-memory`;
  the nearest is an alerting subject's flap control). A feedback-consuming mechanism the
  harness cannot exercise: lead (below). Its own defect: the posterior never discounts
  old evidence while the tuning lane does (`ee/src/core/bayes.rs:50 "DEFAULT_HARMFUL_WEIGHT: f64 = 2.5"` is also the unexplained drop from cm's 4).

**ee-D5. Age decay scaled by graph position.**
- where: `ee/docs/adr/0035-structural-decay-policy.md:48 "can age up to 3x faster"`
- corpus: `decay-and-forgetting` (per-kind half-lives) - catch; the 3x and 0.5 constants
  are tied to no outcome.

**ee-D6. Passive outcome attribution: impressions joined to later evidence, low weight,
corroborated, capped per window, never promoting alone.**
- where: `ee/docs/adr/0055-evidence-harvester-passive-outcome-attribution.md:66 "inflate confidence that drives more selection in a runaway loop"`; `ee/src/core/outcome.rs:4034 "if corroborating_count < min_corroboration {"`
- stage: outcome attribution. corpus: **NONE** (same neighbour as cm-D5).

**ee-D7. Retrieval weights tuned offline from outcome labels, abstain floor, explicit
reversible promote.**
- where: `ee/docs/adr/0070-outcome-tuned-retrieval-weights.md:18 "changes live ranking ONLY through an explicit promote step"`; `ee/docs/adr/0070-outcome-tuned-retrieval-weights.md:60 "cannot dominate; unranked labeled memories contribute 0"`
- stage: retrieval fed by attribution. corpus: **NONE** (same neighbour). No exploration
  slot, propensity weight or independent label found (the reader searched the tuner and
  both decision records).

**ee-D8. Contradictions resolved only through the queue; a pack never carries both
sides.**
- where: `ee/docs/adr/0058-contradiction-operationalization.md:34 "Never auto-supersede."`
- corpus: `consolidation` - catch.

**ee-D9. Memory debt: deterministic rot detectors with executable repairs, plus
demand-driven gaps from search misses.**
- where: `ee/docs/adr/0071-memory-debt-and-demand-driven-gaps.md:89 "is the evidence the whole memory system works."`
- corpus: `coverage-instrumentation`, `gap-directed-elicitation` - catch; the debt trend
  is true by construction (repairs lower the detectors that define the score).

**ee-D10. A drifted code anchor gets a flag, not a lower rank.**
- where: `ee/docs/adr/0082-stale-anchor-flag-not-penalize.md:28 "rank hides the most relevant memory at the worst moment."`
- corpus: `recall-injection` (label recalled material) - catch; the reversal rests on the
  owner's judgement while the tree's own tuning lane could have priced it.

### Routing count (written before triage)

- **Per system:** cm NONE 1 (D5); ee NONE 3 (D4, D6, D7). ee clears three, against an
  **existing** home: all three sit at one stage (outcome feedback) of `agent-memory`, and
  their nearest neighbour is `memory-value-model`. v2.2: a system at three or more with
  an existing home is a technique set inside that subject, not a forge.
- **Across systems:** four entries (cm-D5, ee-D4, ee-D6, ee-D7) share one home-if-new,
  which would fire the XL trigger - but the home is not new. The fluxer precedent holds:
  a high count over ground the corpus owns says the corpus was right about where the
  material lives. Two trees by one author are also one observation, not two.
- **Memory lane:** a feedback mechanism cannot be expressed on the four-call contract
  (outcomes are drawn at generation, recall may not feed back). So ee-D4 and cm-D8 are
  leads until the harness is closed-loop; cm-D5, ee-D6 and ee-D7 land as one technique
  because their shared claim is about **measurement validity**, and that was measured
  here on recorded contexts rather than as an arm.
- **Decision:** no forge handoff. One technique and three amendments in `agent-memory`.

## The memory-lane read

- **Which arm is this?** None on the ladder. cm and ee are procedural-rule stores
  distilled from transcripts and ranked by relevance with a feedback tiebreak; the
  closest rung is the two-tier pipeline (0.86), whose procedural tier is the one the
  series found ungoverned. Neither tree publishes an end-to-end memory accuracy.
- **Published numbers, each a lead.** cm: a retrieval benchmark of 31 author-written
  rules and 22 queries with planted helpful counts, keyword path only, values printed at
  test time and published nowhere (self-against-self); a dedup calibration (7 of 15
  rewordings, 0 of 14 false merges) whose labelled set is not in the tree. ee: an nDCG@10
  of 0.82 that is a constant in a snapshot file over a fixture that could not execute
  until its seed values were remapped (declared, not computed); and one real-data pass
  (2026-10-01) that refuted its own presence-based acceptance criteria - 0 of 10 session
  proposals usable. That last one is the most honest number in either tree, and it
  refutes the tree.
- **Open questions the lane carries.** Neither tree answers any of the four. The new
  technique adds a fifth the lane did not have: a feedback-driven arm cannot be ranked
  on this harness at all.

## Triage (Phase 5, v2.5 scored)

Upper-layer rows scored; currency and leads under the corroboration table. Read column:
real gap / partial / likely catch / thin. Every likely-catch row had its neighbour
opened (declared focus).

| # | Row | Shape | Home | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A run's verdict copied onto the delivered set measures exposure (cm-D5, ee-D6, ee-D7) | technique | agent-memory | real gap | 4/0/2 | accept (new technique; refutes the golden path's unqualified credit edge; corroborated by code read in both trees, an in-run experiment, and the counterfactual learning-to-rank literature, fetched) |
| 2 | memory-value-model: the shared verdict is not the signed signal | amendment | agent-memory/memory-value-model | real gap | 2/0/1 | accept (boundary; +1 refutes a reading the clause permits) |
| 3 | Golden path: the credit edge is the substrate, not the estimator | amendment | agent-memory | real gap | 2/0/1 | accept (append; existing sentences stay true) |
| 4 | A value-keyed bar also bars the item's negation | amendment | agent-memory/decay-and-forgetting | partial, promoted | 2/0/1 | accept (boundary +1, convergence +1: an independent tree hits the failure the section predicts from the other side; promoting question "does the section say value-matching fails toward the opposite?" answered no by reading it) |
| 5 | Interval-bound trust transitions with hysteresis (ee-D4) | technique | agent-memory | real gap | 2/2/2 | lead (memory lane: not expressible on the contract; the tree's own verification is self-against-self) |
| 6 | Harmful rule inverted into a retrievable warning (cm-D8, ee's proposal form) | technique | agent-memory | partial | 2/2/2 | lead (memory lane) |
| 7 | Executable specificity bar against generic rules at birth (ee-D1) | amendment | agent-memory/consolidation | partial | 1/2/1 | untriaged |
| 8 | Capture keeps corrections from the dropped middle (cm-D9) | amendment | agent-memory/episodic-capture | partial | 1/0/1 | untriaged |
| 9 | Store's own model calls captured as sessions (cm-D6) | amendment | agent-memory/memory-governance | likely catch | 1/0/1 | folded into row 1's exposure channels |
| 10 | Posterior that never forgets beside a tuner that does (ee-D4 note) | amendment | agent-memory/memory-value-model | partial | 1/1/1 | untriaged |
| 11 | Debt trend true by construction (ee-D9) | catch | quality-gates (vacuous by evaluation) | likely catch | - | already covered |
| 12 | Presence criteria refuted by the real-data pass (ee measurement) | catch | count-carries-predicate | likely catch | - | already covered |

`auto=4/2/0` (rows 1-4 accepted, rows 7-8 and 10 untriaged, rows 5-6 leads under the
lane rule), `fp=0` (no accepted row died at Phase 6; row 1's first prescription failed
its floor in Phase 7.5 and the technique was rewritten to the measurement before
landing, which is a correction, not a false positive).

## Accepted (landed)

- **Technique `agent-memory/exposure-is-not-credit`** (new). A run's verdict copied onto
  every delivered item is signed per run and unsigned per item; guards on blame do not
  repair the unit; credit flows only through a contrast, deliberate use, or a propensity
  weight; blame through use misfires (the 18 rows that failed the floor); silence is
  neutral and is most of the store; offline tuning on shown items learns its own
  teacher; three quieter exposure channels; derived signals never promote alone; and a
  zero-model check. Placement: `agent-memory` techniques, bidirectional with the golden
  path.
- **Amendment `memory-value-model`**: the look-alike that is not a signed signal.
- **Amendment `agent-memory` golden path**: the credit edge is the substrate, not the
  estimator.
- **Amendment `decay-and-forgetting`**: a value-keyed bar fails toward the negation too.
- **Applications:** `bun--exposure-is-not-credit--practitioner-memory` (source tree,
  structural: the ranking fix downstream of its cause, the successor tuning on what it
  showed) and `python--exposure-is-not-credit--personas` (the A/B).

## Applied (Phase 7.5)

| Technique | Project | Mode | Verdict | Read |
| --- | --- | --- | --- | --- |
| exposure-is-not-credit | personas (memory-year harness) | experiment | not-better | Seam chosen to falsify: the service arm's recorded contexts, already relevance-selected, the best case for a session verdict. Arm A (the source's rule) tracked exposure 0.82/0.81 and support 0.06/0.05, 25 of 36 and 23 of 33 proven items never carried an answer. Arm C (symmetric blame) worse. Arm B (use credit) top-25 0.92/0.96 against 0.36/0.32, floor failed (7/11 useful below neutral vs 0, tolerance 2). Arm D (post hoc) held the floor; next test, not this one's answer. Instrument personas `d9343ca762`, row `c3cc02dcd0`. |

The amendments carry no separate apply rows: rows 2 and 3 are the same claim at a
different altitude and share row 1's experiment; row 4's seam is a store that matches
forgotten items on text, and none in the fleet does today (the personas forget path was
not opened in this run), so it is **unapplied**, return condition "when a fleet store
blocks re-derivation by text match".

## Method rows (our own method; the operator's bar is a measured A/B)

- **K7 (from R1): rejections carry a retry condition.** Measured on the sources: the
  first tree has none (one condition in 778 task records, about a refactor); the
  successor states one in 6 of 18 sampled decision records and enforces a calendar
  deadline on deferrals with a lint. Our lessons and decline ledger carry none. Not
  landed; banked as backlog row `dle-k7-retry-condition-on-rejections` with an A/B
  sketch, per the charter's form.

## Peer study (personas brain against both trees)

Dispatched to one worker and written in the project's own tree as a comparison study
(no direction proposals, per the series ruling), committed in personas as `bc24fccb89`:
**34 points - 1 adopt, 6 adapt, 20 keep ours, 7 different forces**, 113 anchors held
across both roots. The one adopt: the always-on rule lane must say so when its query
fails (today a failure becomes an empty list and every conduct rule drops out of the
turn silently). The tree corrected five seeded points, among them a third rule writer
(the sync inbox, whose provenance is the incoming delta, not a checked episode) and a
harness blind spot: the harness never refreshes a rule's last-used time, so decay keyed
on it would look healthy in a replay while production refreshes the always-on six every
turn. Tests to initiate, ranked: the always-on key against an exposure-free merit key on
a frozen store (coverage, no judge); the exposure check re-run on the personas brain's own
recorded rule contexts; decay on last-used time with and without production-like
touches.
Facts that shaped it, verified in the personas tree by the director before dispatch: the
always-on procedural lane picks six rules by importance then recency while every
nightly-written rule shares one importance (the degeneration `recall-injection` already
names), rules never decay (the step decay selects facts only), no outcome feedback
reaches rules at all, and the harness draws task outcomes at generation.

## Leads

- **Interval-bound trust transitions (ee-D4).** Return when the memory-year world draws
  task outcomes from what was recalled, so a feedback stream exists to gate; or when a
  fleet store grows trust classes moved by feedback.
- **Inversion of a harmful rule into a retrievable warning (cm-D8).** Same return
  condition; the successor's move from in-place rewrite to proposal is the shape to
  test.
- **Use credit without blame, pre-registered on a second store (arm D).** Return when a
  second arm's per-probe contexts are recorded (the Athena arm records counts, not
  items).
- **A closed-loop memory-year world.** Recorded in the harness backlog (`c3cc02dcd0`).
  Return condition: the operator or a harness round takes it up.

## Already covered (catches)

cm-D1 (`consolidation`'s one door; the unvalidated replace is the golden path's "silent
second writer"), cm-D2 (`memory-governance`), cm-D3 (`memory-value-model`), cm-D4
(`memory-value-model`'s bound), cm-D7 (`consolidation`, contradiction before duplicate),
ee-D2 and ee-D3 (`memory-governance`), ee-D5 (`decay-and-forgetting`), ee-D8
(`consolidation`), ee-D9 (`coverage-instrumentation`; the trend is vacuous by
evaluation), ee-D10 (`recall-injection`). Nine rows; cm-D6 folded into the technique.

## Untriaged (nobody verified these; they carry no judgment)

| Row | Anchor | Why not landed |
| --- | --- | --- |
| Executable specificity bar against generic rules at birth | `ee/docs/adr/0010-curation-specificity.md:25 "computes an explicit weighted sum with default threshold"` | rests on the tree's prose; its own real-data pass found junk proposals at confidence 0.85 anyway |
| Capture keeps corrections from the dropped middle | `cm/src/utils.ts:1959 "const headPart = truncateHead(text, Math.floor(maxChars * 0.6), true);"` | boundary case, GAIN 1 |
| A posterior that never forgets beside a tuner that discounts | `ee/src/core/bayes.rs:50 "DEFAULT_HARMFUL_WEIGHT: f64 = 2.5"` | boundary case of one-model-two-callers, GAIN 1 |
| A recovery branch out of an absorbing state is dead code | `cm/src/commands/undo.ts:374 "If it was auto-deprecated and now looks healthy, restore it"` | not memory-specific; a test-coverage claim |
| A proposer shown popularity counts proposes in their light | `cm/src/reflect.ts:43 "output +="` | folded as a sentence in the technique; no measurement of the effect |
| Quota-driven extraction by category | `cm/src/gap-analysis.ts:4 "Analyzes the playbook to identify underrepresented categories"` | GAIN 1, unmeasured |

## Directions

None, by the series ruling (no Phase 7.6 directions for personas). `directions=n/a`.

## The charter's two questions

- **Is the memory system what he uses instead of indexing his negative-results ledger,
  and is its retrieval measured?** No to both. The first tree ingests transcripts and
  hand-added rules only, and its own operating file still sends agents to an external
  rules file first. The successor has a global lane, anti-pattern candidates, journal
  distillation and incident cards, none of them measured for retrieval, and it keeps its
  own negative results in unindexed decision records and audit files - the same pattern.
  Its repository's own agents do not use it.
- **Do rejected ideas carry a retry condition?** The first tree: no field, deprecation is
  absorbing, and the one automatic return path cannot fire. The successor: 6 of 18
  sampled decisions state one, 3 vaguely, 9 not; deferrals carry a calendar deadline a
  lint enforces (a time trigger, not an evidence trigger). See method row K7.

## Corrections and catches about the source class

- **Brief premises checked before dispatch (declared focus).** Five premises in the
  study worker's brief were re-opened in the personas tree first; all held. The peer
  reader's own report carried four mis-prefixed anchors (relative to the harness
  directory), caught by the anchor check before any of them was cited.
- **The run's own draft was wrong twice and the data caught both.** The first ground
  truth left procedure and fix probes out, which made the source's procedure records
  look useless; extending it moved arm A's top-10 precision from 0.2 to 0.6 and the
  conclusion survived. Then the application said every item blamed through use was a
  two-value record; reading the 18 rows showed 5, and both documents were corrected
  before landing.
- **A successor fixes symptoms one layer further out.** Both trees answered the visible
  failure of the attribution unit (a ranking crowded by generic rules; a blame flood) and
  kept the unit. A source that implements a good idea badly hands over the boundary, and
  here the boundary is the technique.
- **Sibling sweep in personas.** The personas ledger commit `c3cc02dcd0` also carries a
  `dle-002-1015` row that sibling appended to `.ai/applied.jsonl` between this run's
  status check and its write. The row is intact and in HEAD; history was not rewritten.
  The cause is staging a whole shared file instead of only this run's hunk.
