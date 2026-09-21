---
domain: game-production
subject: gameplay-runtime-patterns
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# gameplay-runtime-patterns

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/gameplay-runtime-patterns",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a99bcb39c2452dd4",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "A measured worst frame is not a worst-case guarantee. Separate immutable setup from per-use reset and handle late callbacks, generation identity, cache invalidation and scratch-buffer ownership. Profile-derived savings remain estimates until measured.",
    "Data-driven behavior does not require exactly one runtime class. Schema validation, required versus optional defaults and composition order still matter; data may encode behavior without eliminating all useful types.",
    "Pattern forces are not an exhaustive vocabulary. Planned performance requirements and costly single queries can justify a pattern; removal should follow dependency review, not the disappearance of one measured symptom."
  ],
  "sources": [
    {
      "url": "https://gameprogrammingpatterns.com/event-queue.html",
      "scope": "Original-author search evidence on event queues; direct open failed. Used as supporting context only; the known-receiver/deferred-execution counterexample is explicit in the repaired technique."
    }
  ],
  "documents": {
    "gameplay-runtime-patterns.md": {
      "disposition": "reverify",
      "reason": "Reverify single-force pattern selection, universal pooling thresholds, event timing versus receiver coupling and deterministic-replay claims. The event technique is repaired; related golden-path claims still need reconciliation."
    },
    "techniques/allocation-discipline-in-the-hot-path.md": {
      "disposition": "reverify",
      "reason": "A measured worst frame is not a worst-case guarantee. Separate immutable setup from per-use reset and handle late callbacks, generation identity, cache invalidation and scratch-buffer ownership. Profile-derived savings remain estimates until measured."
    },
    "techniques/data-driven-type-objects-over-subclass-growth.md": {
      "disposition": "reverify",
      "reason": "Data-driven behavior does not require exactly one runtime class. Schema validation, required versus optional defaults and composition order still matter; data may encode behavior without eliminating all useful types."
    },
    "techniques/event-dispatch-versus-direct-call.md": {
      "disposition": "clarify",
      "reason": "Repaired selection around independent timing and coupling requirements, including queued commands to a known receiver, synchronous subscription, ownership and explicit overload handling."
    },
    "techniques/pattern-selection-by-force-present.md": {
      "disposition": "reverify",
      "reason": "Pattern forces are not an exhaustive vocabulary. Planned performance requirements and costly single queries can justify a pattern; removal should follow dependency review, not the disappearance of one measured symptom."
    },
    "techniques/spatial-partitioning-threshold.md": {
      "disposition": "reverify",
      "reason": "Spatial indexes can accelerate a single linear scan as well as all-pairs work. Dense overlap can still require quadratic output, so changing tree type cannot guarantee the claimed bound; benchmark actual workload and hardware."
    },
    "techniques/update-order-and-frame-coherence.md": {
      "disposition": "reverify",
      "reason": "Double buffering does not make all side effects commutative. Specify deterministic reductions, random streams, thread and floating-point behavior, mutation semantics and backlog policy; two matching runs are bounded evidence."
    },
    "applications/node--allocation-discipline-in-the-hot-path.md": {
      "disposition": "reverify",
      "reason": "Historical tick measurements were not rerun. An empty own override can inherit base-class work; identify the measured scope and distinguish estimated eliminated cost from observed savings. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--pattern-selection-by-force-present.md": {
      "disposition": "reverify",
      "reason": "Historical force inventory was not rerun. A shorter justification list is not evidence of correct pattern selection; inspect supported workload and removal dependencies. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Read the golden path, all six techniques and both applications at their reverted bytes,
then re-opened the primary source both applications cite — the pof checkout at HEAD
`d823bffe` — and ran one web search against the subject's only appeal to external
evidence. I read source and search results; I built nothing and ran no profile.

**The subject is in good shape and I keep most of it.** The organising idea — a pattern
is a purchase, indirection is the currency, name the force or emit the boring shape — is
carried consistently from the golden path into `pattern-selection-by-force-present`'s
seven-entry inventory, and the inventory's most important property is that it can return
*nothing is needed* as a success. The two-directional review rule (over-structure costs
comprehension permanently, under-structure costs correctness intermittently, run both in
one pass) is stated in both places and is the sentence that stops the codebase
oscillating. `event-dispatch-versus-direct-call`'s compression — decoupling in space is a
subscription, decoupling in time is a queue, neither is a synonym for good design — is the
sharpest formulation in the subject. `update-order-and-frame-coherence` and
`data-driven-type-objects-over-subclass-growth` each state their costs as concretely as
their benefits, which is what makes them decidable rather than advisory.

**The one finding that would justify a content change is a citation, not a claim.** Both
the golden path and `spatial-partitioning-threshold` rest a quantitative boundary on an
appeal to unnamed literature: "published broad-phase benchmarks put the useful boundary
for the naive approach in the region of a few hundred rather than in the thousands", and
"benchmarks on populations in the tens of thousands report speedups of two to three orders
of magnitude". No benchmark is named, no `sources` block exists on either document, and a
web search for a published broad-phase crossover figure did not resolve which body of work
is meant. What the search did return is directionally consistent — practitioner write-ups
put naive pairwise testing's comfortable range below roughly a hundred to a few hundred
participants, and note that a hundred entities already implies about five thousand
comparisons — and the Broadmark framework exists as a benchmarking harness for exactly
this comparison, but none of it establishes the specific boundary the documents attribute
to "published benchmarks". The technique does hedge correctly one paragraph later ("treat
those figures as an order-of-magnitude guide to where to start measuring, never as the
decision itself"), and every decision rule in it routes back to measurement, so this is a
provenance gap rather than a wrong number. Either name the benchmark or drop the appeal
and keep the hedge; an uncited "published benchmarks" is the kind of authority this corpus
otherwise refuses to grant itself.

**A stale figure in the node application.** `node--allocation-discipline-in-the-hot-path.md`
characterises the engine-trap corpus as `src/lib/knowledge/ue-gotchas.ts` (508 lines). At
pof HEAD that file is 606 lines. Every other citation in the document is exact at HEAD and
I checked them individually: `blueprint-cpp-codegen.ts:346-348` still derives
`bCanEverTick` from whether the ported graph carries a per-step override, with the
component-versus-actor tick-field comment on the line above; `triage-engine.ts:66` still
carries `if (actor.totalTickMs < 0.1) continue;` as a stated materiality floor;
`analyzePoolingCandidates` at `:357` still selects on `instanceCount > 10` plus a
class-name substring; and `:376` still writes `estimatedSavingsMs: round2(actor.instanceCount
* 0.02)` into the same field that `:41` sorts every finding by, so a per-instance constant
still ranks against a profile reading with nothing distinguishing them. That third
deviation is the most valuable thing in the document and it is still live.

**A boundary the subject leaves silent.** The whole subject is written for a shape decided
once, from a brief, by an author with a cost model for indirection. It has no guidance for
the case where the force appears *after* the shape was chosen — the population that grew
from forty to four thousand because a designer added spawners, the audience that became
varying when a second consumer shipped. `pattern-selection-by-force-present` says the
inventory is retaken when the brief changes and that an element whose force disappeared
should be removed, but says nothing about the reverse direction, which is the more common
one in a live codebase and the one where the cost of acting late is highest. Below the bar
for a rewrite; worth a sentence.

**Not evaluated.** No profile was taken, no frame budget measured, no pool exercised, no
partition benchmarked, and no generated artifact graded against a force inventory. The
`process--pattern-selection-by-force-present` application describes a briefing shape rather
than citing a checkout, so nothing in it was independently verifiable and nothing in it is
asserted as measured — which is itself correct, since the document is explicit that a
justification list is self-reported and evidence of intent only.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/gameplay-runtime-patterns",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:82a03a59ee64e6bd",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read in full at their reverted bytes. The node application's citations were re-resolved by reading pof at HEAD d823bffe: blueprint-cpp-codegen.ts, profiling/triage-engine.ts and knowledge/ue-gotchas.ts. One web search run against the subject's only external quantitative claim. Not evaluated: any profile, frame budget, pool, or acceleration structure; no code was built or executed; the process application cites no checkout and was assessed as a design description.",
  "counterexamples": [
    "A system whose population grows from forty to four thousand after ship acquires the adjacency force the original inventory correctly recorded as absent; the subject tells you to remove an element whose force disappeared and says nothing about the reverse, which is the commoner and costlier direction.",
    "A single participant querying against everything — one player against the world — is linear, not quadratic, and needs no partition; spatial-partitioning-threshold names this case, so it is a stated boundary rather than a gap.",
    "A pool whose acquire path resets every field it owns still produces a ghost if a field is added to the pooled type and not to the reset; the technique treats the incomplete reset as a correctness defect, which is the right register, but nothing in the subject makes exhaustiveness checkable rather than reviewable."
  ],
  "sources": [
    {"url": "https://kirbysayshi.com/broad-phase-bng/broad-phase-collision-detection-using-spatial-partitioning.html", "result": "Read (not executed). Directionally supports the claim that exhaustive pairwise testing is comfortable only at low participant counts and that a hundred entities already implies roughly five thousand comparisons. Does not establish the specific 'few hundred rather than thousands' boundary the documents attribute to published benchmarks, and is a practitioner write-up rather than a benchmark paper."},
    {"url": "https://ppgia-unifor.github.io/Broadmark/", "result": "Located as a published broad-phase benchmarking framework covering brute force, sweep-and-prune and grid variants. Establishes that such benchmarks exist; does not itself supply the crossover figure the subject cites, and I did not run it or read its result tables."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/profiling/triage-engine.ts", "result": "Read at pof HEAD d823bffe. Confirmed the materiality floor at :66, the pooling candidacy test at :357-361, the synthesized per-instance saving at :376, and the single sort key at :41 — so all three deviations the application records are still live. Did not run the engine or supply it a profiling session."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/knowledge/ue-gotchas.ts", "result": "Read at pof HEAD. The file is 606 lines, not the 508 the application states. Establishes only the size; the corpus's content was assessed under the engine-pitfall-corpus subject."}
  ],
  "documents": {
    "gameplay-runtime-patterns.md": {"disposition": "reverify", "reason": "Everything except one sentence is sound and well seamed against visual-script transpilation, the engine-trap corpus and ability authoring. The exception is the uncited appeal to 'published broad-phase benchmarks' for the naive-testing boundary, which a search did not resolve; either the benchmark is named or the appeal goes and the hedge stays."},
    "techniques/allocation-discipline-in-the-hot-path.md": {"disposition": "keep", "reason": "The budget is stated as arithmetic against a named frame interval, the tail rather than the mean is the grading basis, and the measured-versus-estimated separation and the materiality floor are both decision rules. The reset obligation is named as a correctness defect rather than untidiness."},
    "techniques/data-driven-type-objects-over-subclass-growth.md": {"disposition": "keep", "reason": "The crossing test asks where the difference lives rather than how large it is, the three conduct shapes are ordered by cost, and the load-time schema check is correctly identified as what replaces the compiler. The 'a field meaning run this special case is a subclass in disguise' rule is the finding the technique exists for."},
    "techniques/event-dispatch-versus-direct-call.md": {"disposition": "keep", "reason": "Three tiers with what each buys and costs, two ordered questions with a stop-at-the-first-no rule, and the three wiring obligations that produce a well-formed program doing nothing. Re-entrancy through synchronous dispatch and the self-contained queued record are both correctly stated."},
    "techniques/pattern-selection-by-force-present.md": {"disposition": "keep", "reason": "The seven-entry inventory, the one-force-per-shape mapping and the rule that a procedure which cannot return 'nothing is needed' will always find something. Silent only on a force that appears after the shape was chosen, which is a gap worth a sentence rather than a defect."},
    "techniques/spatial-partitioning-threshold.md": {"disposition": "reverify", "reason": "Two quantitative claims are attributed to 'published broad-phase benchmarks' with no benchmark named and no sources block; a web search found directionally consistent practitioner material and a benchmarking framework, but nothing establishing the stated boundary or the two-to-three-orders-of-magnitude figure. The document's own hedge and its measurement-first procedure keep the guidance safe, so this is a provenance gap."},
    "techniques/update-order-and-frame-coherence.md": {"disposition": "keep", "reason": "Phases with one writer per quantity, deferred structural mutation, the read/write copy with its one-step-stale price stated, the cached-value obligation routed through a setter, the two clocks with the spiral-of-death cap, and determinism proven by running twice and diffing rather than by inspection."},
    "applications/node--allocation-discipline-in-the-hot-path.md": {"disposition": "clarify", "reason": "One stale fact: ue-gotchas.ts is characterised as 508 lines and is 606 at pof HEAD. Every other citation was re-resolved and is exact, including the three pooling deviations, which are still live in the tree. Fix the line count; nothing else needs to move."},
    "applications/process--pattern-selection-by-force-present.md": {"disposition": "keep", "reason": "Cites no checkout and claims no measurement, which is correct for what it is: where the inventory sits in a composed prompt, what the answered block looks like, and what the acceptance step does with the returned justification list. It is explicit that the list is self-reported and evidence of intent only."}
  }
}
```
