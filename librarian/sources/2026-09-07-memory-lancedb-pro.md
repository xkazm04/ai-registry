---
source: github:CortexReach/memory-lancedb-pro
kind: vendor repository (agent-memory plugin; single-maintainer, npm-published)
url: https://github.com/CortexReach/memory-lancedb-pro
title: "memory-lancedb-pro — LanceDB memory plugin with hybrid retrieval, admission control, reflection and lifecycle"
author: win4r
commit: 1a683cf5baba8537842f661d07bc5925b761efaf (2026-08-29)
words: 5727 landing (README) / ~16,868 English in-tree markdown / 41,186 lines TypeScript
extracted: 13
accepted: 3
declined: 0
leads: 3
already_covered: 3
untriaged: 6
dispatched: 0
applied: 3
shipped: 0
run_id: memlancedb
siblings: 3 live at claim (gbrain, unstorage, lago) — gbrain held agent-memory, the same subject
rescan_when: >
  `runRecallLifecycle` (index.ts:3103) gains a caller, or is deleted — either
  resolves the run's central finding and changes what the tree witnesses; or
  `noise-prototypes.ts` gains a removal/re-test path or persistence (today it
  has exactly two mutators and an in-memory array); or `admissionControl.enabled`
  or `dreaming.enabled` ships defaulting true, which would invert the
  governance-polarity reading; or 8 weeks elapse (2026-11-02)
---

# memory-lancedb-pro

**Class: vendor repository, mined from a clone.** Expected yield for the class
is design decisions plus reusable engineering, not quotable claims — and this
tree paid out in a specific way: the operating documents are dense and
**stale**, and the yield came from the code.

`docs/memory_architecture_analysis.md` (2,278 words, dated 2026-03-09) is a
genuinely first-party architecture document over an August tree. Five whole
subsystems that now exist — admission control (1,259 lines), the dreaming
engine (935), the reflection pipeline (~2,000 across nine files), grounding
registers, preference slots — appear in it nowhere. Worse for a run that trusts
it: **its two most specific claims about the lifecycle are both wrong about the
code as it stands**, and one of them is wrong in the direction that flatters.
The design read had to be done against the tree.

The memory lane applied (`references/memory-lane.md` read before Phase 3). This
source's design most resembles the ladder's two-tier arm; nothing here beats a
row on that table, and one finding below answers a lane open question
negatively.

## The tree's dominant mode: mechanisms with no callers

Not one finding — the shape of the tree. Six governance and instrumentation
mechanisms are implemented, correct, unit-tested, and called by nothing:

| mechanism | anchor | non-definition refs |
| --- | --- | --- |
| `runRecallLifecycle` | `index.ts:3103` | 0 |
| `recordAccessAndMaybeTransition` | `src/retriever.ts:1763` | 0 |
| `applyLifecycleBoost` | `src/retriever.ts:1741` | 0 |
| `getStaleMemories` | `src/decay-engine.ts:231` | 0 |
| `createUserScope` | `src/scopes.ts:469` | 0 |
| `buildAdmissionStats` (whole 332-line module) | `src/admission-stats.ts:263` | 0 |

Plus: `AccessTracker` is never constructed (375 lines reachable only from 19
test mocks); `loadReflectionMappedRowsFromEntries` has no production caller and
the repo's own findings note says so; the query expander never runs on the
auto-recall path because expansion is gated to `manual`/`cli`; `formatAtDepth`'s
sanitize hook — the one function whose comment claims to prevent prompt
injection from stored memories — is called only from tests.

The instrument was calibrated before use: `fuseResults` and `applySearchBoost`
in the same tree return 4 references each, so a zero is a reading. Two apparent
hits on `getStaleMemories` were opened and resolved to an interface declaration
and its implementation.

## Design record

Six entries; `corpus:` counted per system (v2.2), both clauses.

```
decision:  Retirement is a metadata flag (invalidated_at + superseded_by), never
           a delete; the read path filters with excludeInactive.
forces:    A delete would be right if history had no consumer; it has one —
           memory_fact_query with includeHistory (src/tools.ts:419).
buys:      A failed invalidation degrades to two live rows, never to data loss.
rejects:   Hard delete-on-replace (src/tools.ts:1426, src/store.ts:1882).
where:     src/smart-metadata.ts:285-291; src/tools.ts:1636-1648
stage:     replacement commit
corpus:    consolidation (supersedence, contradiction as data) — MODELS IT
```
```
decision:  Tier maintenance moved off the recall path to an offline sweep.
forces:    The write-back is delete+readd on LanceDB (src/retriever.ts:1761),
           so riding recall pays it per result.
buys:      Recall latency independent of tier bookkeeping.
rejects:   Both recall-path versions — left in the tree uncalled, not deleted.
where:     src/dreaming-engine.ts:707-732; index.ts:6564-6567
stage:     offline consolidation
corpus:    decay-and-forgetting — MODELS the hazard, NOT this boundary (see A2)
```
```
decision:  The noise bank learns only from a definitive zero-candidate answer —
           never a call failure, a malformed shape, an empty input, or a batch
           the pipeline's own filters emptied.
forces:    Learning a policy-emptied batch teaches the filter that its own
           verdicts are evidence about the world (src/smart-extractor.ts:743).
buys:      An empty result is not a signal until its cause is typed.
rejects:   Learning on any empty candidate list.
where:     src/smart-extractor.ts:177-183, :730-756
stage:     post-extraction feedback write
corpus:    NONE — nearest neighbour episodic-capture, which states two door
           filters and no learned third. HOME IF NEW: agent-memory
```
```
decision:  A strong exact lexical hit (bm25 >= 0.75) gets a fusion floor and
           full protection from the reranker.
forces:    Cross-encoders are unstable on symbolic and mixed-language queries
           (src/retriever.ts:1567), which is what a memory store is asked.
buys:      An exact-token query returns the row holding that token.
rejects:   Textbook RRF — no 1/(k+rank) term exists (README:421 says so).
where:     src/retriever.ts:1353-1363, :1564-1576
stage:     fusion and rerank
corpus:    hybrid-lane-fusion + relevance-floors — MODEL the lane, NOT the
           substitute path's score space (see A3)
```
```
decision:  Reflection mapped rows are gated against the REAL session transcript,
           never against the distillate they were parsed from.
forces:    "Grounding the candidates against their own source text would let a
           hallucinated distillate line appear self-grounded"
           (src/reflection-mapped-admission.ts:145-149).
buys:      The support score measures what it claims to measure.
rejects:   Passing reflectionText as conversationText (index.ts:6068-6071).
where:     src/reflection-mapped-admission.ts:141-149; index.ts:6068
stage:     reflection burst admission
corpus:    consolidation — "a validated citation is not a verified one" MODELS
           it; this is an independent second implementation
```
```
decision:  Access reinforcement is gated to manual recall only, so auto-recall
           cannot strengthen what it retrieved.
forces:    An automatic read on every turn would reinforce whatever it
           delivered (CHANGELOG 1.1.0-beta.2).
buys:      The usage term counts occasions a human asked, not deliveries.
rejects:   Counting every read.
where:     CHANGELOG.md 1.0.26 / 1.1.0-beta.2
stage:     post-recall feedback
corpus:    probe-without-write-back — MODELS it exactly ("default new machine
           callers to suppressed"). Independent convergence, catch.
```

**Routing count.** Per system: retrieval 1 NONE, write-path 1 NONE, lifecycle 0
NONE, reflection 0. Max 1 per system. Shared `HOME IF NEW`: agent-memory 1,
retrieval 0 — no cluster reaches 3. **Neither v2.2 clause fires: no forge
handoff, no XL spec.** The tree is forge-shaped by size (41k LOC, ~190 test
files) and intake-shaped by corpus coverage: `agent-memory` already carries 18
techniques that model most of this system's forces, which is exactly the
condition under which a system yields boundary cases rather than subjects.

## Triage table

Declared focus (round 32, taken from the highest-numbered block per that
round's own rule — the file's last block is round 27): (1) grep every focus
block, take the highest — done, and it changed which focus applied; (2) add the
route table to the Phase 2b sweep. Item 2 applied and paid: `openclaw.plugin.json`
(92KB) is this tree's route table, and reading its config schema before the
README is what produced the governance-polarity measurement in A2.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | A filter that trains on its own null results | agent-memory (episodic-capture) | new-technique | real gap | 4/0/2 | **accept** |
| 2 | K | amendment | M | The governance test must enter through the door | agent-memory/decay-and-forgetting | corrects-claim | real gap | 3/0/2 | **accept** |
| 3 | K | amendment | M | A substitute path is a different score space | retrieval/relevance-floors | corrects-claim | real gap | 3/0/2 | **accept** |
| 4 | K | amendment | M | Compaction crosses the ownership boundary | agent-memory/rollup-compaction | new-technique | partial | 2/1/2 | untriaged |
| 5 | K | amendment | S | The fence's sentinel is forgeable | prompt-safety/untrusted-span-fencing | corrects-claim | partial | 2/1/1 | untriaged |
| 6 | K | amendment | S | A false skip has no spelling | retrieval/retrieval-triggering | new-technique | partial | 2/1/1 | untriaged |
| 7 | K | lead | S | Scope-crossing supersedence invalidates across scopes | agent-memory/consolidation | none | real gap | — | lead |
| 8 | K | lead | S | Multi-tenant in shape, single-tenant in fact | agent-memory/owner-and-counterpart-scope | none | real gap | — | lead |
| 9 | K | lead | S | The unsure→constructed axiom is never priced | agent-memory/episodic-capture | none | partial | — | lead |
| 10 | — | catch | — | Access reinforcement gated to manual recall | probe-without-write-back | none | likely catch | — | **catch** |
| 11 | — | catch | — | Supersede keeps the old row readable | consolidation | none | likely catch | — | **catch** |
| 12 | — | catch | — | Gate the distillate against the original source | consolidation | none | likely catch | — | **catch** |
| 13 | K | amendment | S | The 6→5 category projection | agent-memory | none | likely catch | — | untriaged (see below) |

`auto=3/0/0`, `fp=0`. No veto fired: no target category is at `MAX_CHILD_DIRS`
(both landings are techniques inside existing subjects), all three accepted rows
rest on code the director opened, and none is a law.

**Promoting questions executed on the three `partial` rows that scored closest.**
Row 4: *does rollup-compaction state an ownership precondition on its cluster?*
Opened it — the word `scope` appears once, about proposal identifiers, not about
membership. So the gap is real and row 4 is a genuine `new-technique`; it stays
untriaged for budget, not for doubt. Row 5: *does untrusted-span-fencing
distinguish the fence from the marker inside it?* Not opened — deferred with the
row. Row 6: *does retrieval-triggering cover a skip that is invisible to the
stats?* It covers skip-vs-empty as records (`:66`, "a bare boolean is not") and
demands both directions be measured (`:123`) — so this tree violates a rule the
corpus already states, making row 6 a catch-with-a-defect rather than a gap.
Downgraded on that read.

**Row 13 is a catch, corrected mid-run.** The 6→5 storage mapping is
non-invertible (`profile` and `cases` both land on `fact`), which looked like a
consumer-facing defect. It is not: the semantic register is stamped into
`metadata.memory_category` at every write site, and the read path checks the
stamp *first* (`src/memory-categories.ts:214-222`), falling back to the legacy
table only when absent. Only unstamped legacy rows degrade, through a
first-person-pronoun regex under 200 characters
(`src/smart-metadata.ts:179-184`). The tree solved this correctly; the run's
first reading was wrong.

## Accepted, with what changed

**A1 — new technique `agent-memory/self-trained-capture-filter`.** The screen
that runs in front of an expensive LLM distiller and learns from its silence.
Five rules: type the null before training on it (the source does this
exemplarily, with a five-arm discriminated union); give the loop an exit,
because the screen runs upstream of the only oracle that could correct it (the
source has none — two mutators, FIFO at 200, in-memory, so its retention policy
is "until the plugin reloads"); keep the add bar at or below the match bar (the
source runs match 0.82 and add 0.90, so the bank grows with vectors it already
covers); learn the same object you match against (it learns a 300-char
concatenated batch tail and matches individual 9–300-char messages); and record
the screen rate beside a sampling lane's disagreement rate, since a rising
screen rate is what both a well-tuned and a runaway filter look like.

**A2 — amendment to `decay-and-forgetting`: the test has to enter through the
door.** The technique already names the dead-caller failure and prescribes a
test. This tree *has* that test — `test/smart-memory-lifecycle.mjs:88-100`
constructs the engine, calls `scoreAll`/`evaluateAll`, asserts correct
transitions — and it is satisfied by dead code. A test that constructs the
governor proves the governor works; only a test that enters through the
system's own door proves it runs. The remedy came from the fleet, not the
source: `personas` names it in the test itself
(`every_delete_door_records_the_owed_cleanup`), asserts the recorded obligation
rather than the asynchronous effect, and stands in plain tables for its
feature-gated vector tables so the door test still runs in the build where the
real mechanism is compiled out. The amendment closes on defaults, because that
is where this lands: five governance mechanisms opt-in against four ingestion
paths opt-out, with `captureAssistant` the honest counter-example.

**A3 — amendment to `relevance-floors`: a substitute path is a different score
space.** `scoreLexicalHit` = `min(0.95, 0.72 + queryLen*0.02)`, so every
substring hit with a ≥2-char query scores ≥0.76 — above the 0.75 bar that grants
a fusion floor *and* full rerank protection. The lane is labeled degraded; the
thresholds run upstream of the consumer and never read the label. The rule was
then **revised by the apply step**: "emit no score" is ambiguous about what the
combining step does with a missing value, and `personas` answers it better by
composing the optional term multiplicatively around one, so absence is the
identity and a partially embedded corpus ranks exactly as the value-only path.

## Catches

- **Access reinforcement gated to manual recall.** `probe-without-write-back`
  already says "default new machine callers to suppressed, and let a caller
  argue its way into counting". This tree reached the same rule independently
  and states the same reason. Convergence, not a gap.
- **Supersede keeps the old row.** `consolidation` requires contradiction
  preserved as lineage; the tree does it with `invalidated_at` +
  `superseded_by` and a test asserting both rows survive.
- **Gate the distillate against the original.** `consolidation`'s "a validated
  citation is not a verified one", implemented with the reason in a code
  comment.

## Leads

- **Scope-crossing supersedence.** Auto-capture resolves and invalidates with
  the *accessible* scope set while writing the replacement to the agent's own
  scope (`src/smart-extractor.ts:3303`, `:3386`; `index.ts:4739`), so a capture
  can retire a row in a scope it does not write to — leaving that scope with a
  dead row and no active replacement. Guaranteed reachable once a team scope is
  configured (`src/clawteam-scope.ts:52-62`, whose own comment names the
  asymmetry). *Return condition:* a second source shows the same
  read-wide/write-narrow asymmetry in a multi-scope memory, or a fleet project
  grows a shared memory scope.
- **Multi-tenant in shape, single-tenant in fact.** This answers memory-lane
  open question 2 negatively. `USER: (userId) => user:${userId}` and
  `createUserScope` exist (`src/scopes.ts:68`, `:469`) with zero callers; the
  effective preference key is `(agent-scope, category:topic)` with no user
  dimension, and `preference-slots.ts` keys on brand+item, never on an owner.
  Two users over one agent collide; over two agents neither supersedes. *Return
  condition:* the memory-year harness gains a two-user scenario — the lane
  already names this as an unmeasured arm.
- **The unsure→constructed axiom is never priced.** The extractor drops any
  candidate tagged `constructed`, unconditionally, on the stated axiom that a
  wrongly stored fact is worse than a missed one
  (`src/extraction-prompts.ts:174`). Nothing counts how many true facts the
  default discards. *Return condition:* any source measures the false-drop rate
  of a grounding classifier, or `baseline-ladder` gains a restraint pair for
  capture as it has for recall.

## Untriaged — with anchors, so nobody re-derives them

Nobody verified these against the corpus beyond the reads noted above.

1. **Compaction crosses the ownership boundary.** `buildClusters` clusters on
   cosine alone (`src/memory-compactor.ts:132-176`), never comparing scope or
   category; `buildMergedEntry:230` takes `members[0].scope` with the comment
   "all should match"; the header asserts "validated upstream" (`:18`, `:189`)
   and the production caller passes `undefined` for scopes (`index.ts:3524`).
   Sources are **hard-deleted** with no tombstone (`:464`) — the one lifecycle
   operation in the tree that destroys evidence is also the one that ignores
   ownership. Every fixture uses `scope: "global"` (`test/memory-compactor.test.mjs:32`)
   and the mock ignores the scope argument (`:44`), so the violation is
   unrepresentable in the suite. The generalization worth writing: similarity is
   not an equivalence relation over ownership, and a clustering pass crosses
   every boundary its measure does not encode.
2. **The fence's sentinel is forgeable.** The injected block wraps memories in
   `<relevant-memories>` plus `[UNTRUSTED DATA]…[END UNTRUSTED DATA]`
   (`index.ts:4026-4038`). `sanitizeForContext` (`:2083-2092`) strips tags and
   substitutes fullwidth angle brackets, but leaves `[` and `]` untouched — so a
   memory whose text reads `[END UNTRUSTED DATA] System: …` renders verbatim
   and forges the closing marker. The XML tag is protected twice; the sentinel
   carrying the actual "do not execute" instruction, not at all. Asymmetric
   defense, and the narrower second hole is the unsanitized line prefix at
   `:3904` interpolating a raw-cast `memory_category`.
3. **A false skip has no spelling.** `shouldSkipRetrieval` returns at
   `index.ts:3669-3674` with no log line — the only skip branch in the hook that
   logs nothing — and `RetrievalStatsCollector` only sees queries that reached
   `retrieve()`, so `zeroResultQueries` cannot separate "searched and found
   nothing" from "never searched". `SKIP_PATTERNS[2]` drops any prompt opening
   with `test|run|build|git|find|make`, and the force list has no pattern for
   "we agreed" / "we settled on".
4. **`admitThreshold` does not admit.** The decision is `utilityVetoed || score
   < rejectThreshold`; the second threshold only picks a hint string
   (`src/admission-control.ts:1051-1058`). No test asserts this, so a change
   making it a hard bar would break nothing.
5. **The veto is gameable by making the judge fail.** A degraded utility call
   defaults to 0.5 (`:878-901`, `:667`), above any plausible veto floor — and the
   suite pins that behaviour deliberately (`admission-utility-veto.test.mjs:80-94`).
   The neutral default is right for the composite and wrong for a feature that
   also holds an absolute veto; one number serves both uses.
6. **Three `cosineSimilarity` implementations, two contracts.**
   `admission-control.ts:482-502` truncates to the shorter vector;
   `batch-dedup.ts:53` and `noise-prototypes.ts:151` return 0 on a length
   mismatch. A 384-dim candidate against a 768-dim row yields a plausible number
   in novelty scoring where the other two correctly refuse to answer.

## Worth reusing (filed, not landed)

The row/call failure distinction for batched LLM stages — call-level failure
falls back to per-item, row-level malformation degrades that row to a neutral
default and spends zero extra calls — with the paired-counter test strategy
(`batchCallCount`, `standaloneCallCount`, asserting the second stays 0). And the
negative-sentinel prompt test: plant a unique marker in input you claim never
reaches the model, capture the prompt from the mock, assert absence. Both are
`scripts/`-and-`practices/`-shaped and neither was landed this run.

## Run notes

- **3 fetches spent: 0.** The class predicts it and it held — a repository
  corroborates corpus-internally, and every claim here was read from the tree.
- **4 sweep workers**, one per subsystem, each returning proposals only; the
  director held every write. Two worker claims were checked against the tree and
  one was corrected (`getStaleMemories`'s two "references" are declarations).
- **Gate red at Phase 9 on a file this run does not own:**
  `backend-platform/data-layer/data-access/applications/node--capability-declared-in-the-type.md`
  carries `verified_against: node@lts`, which the checker rejects. That
  directory is held by the live `unstorage` run. Named, not fixed.
- **The architecture document is the trap this note exists to record.** A
  first-party design doc six months stale over an actively developed tree is
  more dangerous than no document: it is dense, specific, correct-sounding, and
  its two sharpest lifecycle claims are both false against the code. A design
  read that trusts it lands amendments against a system that no longer exists.
