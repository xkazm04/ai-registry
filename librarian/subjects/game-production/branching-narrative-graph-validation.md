---
domain: game-production
subject: branching-narrative-graph-validation
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# branching-narrative-graph-validation

## Architecture review - 2026-09-10

Read all nine documents. Corrected state analysis, completion and choice
semantics, localization cost and revision scope. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/branching-narrative-graph-validation",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:486ccc4d1075ec3f",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Two branches may each assign before a join without one individual write dominating the read.",
    "A single nonterminal node with a self-loop can be a closed trap.",
    "Different dialogue choices can meaningfully converge without explicit variable writes.",
    "A forward walk can establish structural ending reachability without a reverse walk.",
    "Shared localized prose is not purchased once per possible path."
  ],
  "sources": [
    {
      "url": "https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md",
      "scope": "Official choice/gather examples support expressive convergence without mandatory explicit variable writes; no local runtime or schema verification."
    }
  ],
  "documents": {
    "branching-narrative-graph-validation.md": {
      "disposition": "clarify",
      "reason": "Define model-relative proofs, meaningful convergence and state-aware completeness."
    },
    "techniques/reachability-and-orphan-detection.md": {
      "disposition": "clarify",
      "reason": "Distinguish structural overapproximation, feasible states and actionable witness types."
    },
    "techniques/state-variable-declaration-contract.md": {
      "disposition": "clarify",
      "reason": "Correct definite-assignment and ownership rules; pin contracts independently of generated candidates."
    },
    "techniques/dead-end-versus-authored-ending.md": {
      "disposition": "clarify",
      "reason": "Include self-loops, legitimate suspension and distinct existential/liveness properties."
    },
    "techniques/false-choice-and-convergence-audit.md": {
      "disposition": "clarify",
      "reason": "Audit observable promises instead of equating no explicit writes with false choice."
    },
    "techniques/node-text-budget-and-localization-surface.md": {
      "disposition": "clarify",
      "reason": "Separate unique localization cost from path counts and use explicit billing and text metrics."
    },
    "techniques/graph-revision-diffing.md": {
      "disposition": "clarify",
      "reason": "Broaden semantic diffs to ordering, embedded text behavior, dependencies and save compatibility."
    },
    "applications/node--reachability-and-orphan-detection.md": {
      "disposition": "reverify",
      "reason": "Reverify historical checker contracts; distinguish ending reachability from completion from all nodes."
    },
    "applications/process--state-variable-declaration-contract.md": {
      "disposition": "reverify",
      "reason": "Reverify generation/validation authority and repair protocol; remove mandatory-write doctrine."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all nine owned documents in full at the current bytes. Two of them — both
applications — carry an in-document `Review boundary - 2026-09-10` section that survived
the revert as the salvaged half of the earlier pass (commit `10c12da`). Those sections are
evaluated here as content rather than treated as residue, and one of them contains the
sharpest finding in the subject.

**The backward walk is not a second source of evidence about ending attainability.** Both
the golden path ("Reachability runs in two directions and teams only ever build one") and
`reachability-and-orphan-detection` ("The three walks") present the backward walk from
declared endings as the walk that "gets skipped" and that "finds the defect with the worst
player-facing consequence". Under one and the same edge-traversability predicate, an ending
connects backwards to an entry exactly when it is marked by the forward walk from that
entry. The two walks compute the same predicate by different routes. What the backward
direction genuinely adds is the *third* walk — co-reachability over all nodes, a node a
player can reach from which no ending is reachable — which forward-only validation really
does miss, and which both documents also describe. So the second walk's contribution is
classification and a witness path (an unreached ending reported as *unattainable* rather
than lumped in with orphans, which the technique rightly insists on), not detection. As
written, both documents credit it with finding something forward-only cannot see. That is
one paragraph's worth of repair in each and it does not disturb any decision rule.

The consequence lands directly on `applications/node--reachability-and-orphan-detection.md`,
which lists as a deviation: *"There is no backward walk. Neither co-reachability nor ending
attainability is computed."* For the checker it describes, ending attainability **is**
computed — the forward walk fails on any unmarked node, and a declared terminal is a node —
it is simply reported under the wrong name. The document's own appended review boundary
already says this ("Forward traversal already shows whether each ending is structurally
reachable; absence of a backward pass does not erase that information"), and that correction
is sound. The body above it still carries the original claim, so the file now states both.
The repair is to the body, not to the boundary note.

**The generated-scene prompt clause is stricter than the sibling technique.** The process
application's Stage 2 injects four clauses into the authoring prompt, the third being
*"every option must write at least one variable that some later node reads"*.
`false-choice-and-convergence-audit` — which owns that criterion — carves out two cases:
an option pair declared as a **tonal variant** is exempt from signature comparison, and a
**hub** whose options are topic selections is excluded entirely. As a gate criterion with
those exemptions the rule is right; as an unconditional prompt clause it instructs the
generator never to produce the craft the technique protects. The application's own review
boundary reaches the same conclusion by citing inkle's writing guide on gathers; the corpus's
own technique is the stronger argument for it and is available without leaving the tree.

**Retracted.** The preceding record marked all seven non-application documents `clarify`
with reasons that mostly restate the documents' own qualifications back at them —
`dead-end-versus-authored-ending` was told to "include self-loops" and already treats a
strongly connected component with no outbound traversable edge as a dead end, of which a
self-loop is the size-one case only if the component rule is read to include it, which is
the one genuine gap there and is smaller than the reason implied. `graph-revision-diffing`
and `node-text-budget-and-localization-surface` were marked clarify for not covering
material they explicitly scope out. Those dispositions are withdrawn.

**What I could not verify.** No consuming checkout was opened, so `graphCheckers.ts`, the
three pipelines and the quest generator are historical witnesses at `verified_on`
2026-09-02 against commit `9aa31407`; the ink documentation cited in the appended review
boundary was not re-fetched in this pass. Nothing here was executed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/branching-narrative-graph-validation",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:03bf7bbf234eb858",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at current bytes, including the two in-document review-boundary sections retained from the salvaged half of the 2026-09-09 pass. Graph-theoretic claims were checked against each other. Explicitly not evaluated: the consuming checkout at commit 9aa31407, any validator execution, any runtime traversal, the ink documentation cited in an appended boundary note, and the localization cost figures. No verification date refreshed.",
  "counterexamples": [
    "Two options whose consequence is carried by a content tag a later node's presentation logic reads, rather than by a declared state variable: the effect signature is computed over declared variables only, so the audit reports a false choice where a real one exists — and the mirrored-pair exemption is the wrong escape, because this branch is not tonal.",
    "A read of external state owned by another scene: the state contract declares it an external input and exempts it from reaching-write analysis, so a genuinely undefined external read is unreportable by construction — the document says as much, which makes it a bounded blind spot rather than a defect.",
    "A single node with a self-loop and no other traversable exit: it is a trap the player cannot leave, and the cyclic rule is stated for 'a component of size greater than one', so the smallest case falls between the structural rule (the node has an outgoing edge) and the cyclic rule.",
    "A graph regenerated wholesale with new node identities: the diff's cosmetic/topological/state-contract classification has nothing to attach to, which the technique addresses by comparing properties instead — but every standing translation, recording and verdict is destroyed with no way to say which of them would still have been valid."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/content-pipeline/branching-narrative-graph-validation",
      "result": "All nine documents read as primary evidence. Established the equivalence between the ending-attainability backward walk and the forward walk's marking, and the mismatch between the process application's prompt clause and the false-choice technique's exemptions. Established nothing about the consuming checkout's checker, which both applications describe."
    },
    {
      "url": "local: knowledge/game-production/content-pipeline/branching-narrative-graph-validation/applications/node--reachability-and-orphan-detection.md#review-boundary",
      "result": "The appended 2026-09-10 boundary note's central correction is confirmed independently here: forward traversal already establishes structural ending reachability, and the missing reverse pass concerns co-reachability. It does not resolve the body text above it, which still claims ending attainability is uncomputed."
    }
  ],
  "documents": {
    "branching-narrative-graph-validation.md": {
      "disposition": "clarify",
      "reason": "The 'reachability runs in two directions' section credits the backward walk from declared endings with answering a question forward-only validation cannot: under one traversability predicate the two compute the same set. The genuinely additive direction is the co-reachability walk, which the same section also describes. Repair the framing; the two-altitude structural/state distinction, the softlock definition over (node, state) pairs and the machine-authorship argument are all sound and load-bearing."
    },
    "techniques/dead-end-versus-authored-ending.md": {
      "disposition": "keep",
      "reason": "Declaring the ending set rather than inferring it converts an aesthetic question into an exact set difference in both directions, and the leaky-ending half is the direction most implementations omit. The guarded dead end and its report-the-state discipline are the subject's real content. One small gap, recorded as a counterexample rather than charged: the cyclic rule is stated for components of size greater than one, leaving the self-loop trap between rules."
    },
    "techniques/false-choice-and-convergence-audit.md": {
      "disposition": "keep",
      "reason": "The three-part effect signature with each part's false verdict named, the separation of write-only choices from false choices because the fix has a different owner, and the declared tonal-variant exemption are all precise. 'When the false-choice count is zero on a first run over a large generated corpus, distrust the audit' is the instrument-asserting-itself move applied to the audit's own normalisation."
    },
    "techniques/graph-revision-diffing.md": {
      "disposition": "keep",
      "reason": "Retracts the prior clarify. Identity-first, the three cost classes with what each invalidates, metadata excluded from the comparison, and mark-stale-rather-than-delete are each argued from a stated downstream cost. The regenerated-graph case is handled by comparing properties instead of content, which is the right answer to the hard case."
    },
    "techniques/node-text-budget-and-localization-surface.md": {
      "disposition": "keep",
      "reason": "Retracts the prior clarify. The document already separates the per-line budget from the whole-graph surface, states that a unit's cost is dominated by existing rather than by length, and requires the basis (options counted or not, conditional variants counted separately, voiced fraction, expansion assumption). Cost per branch multiplied by reachability is the number that changes decisions, and it says so."
    },
    "techniques/reachability-and-orphan-detection.md": {
      "disposition": "clarify",
      "reason": "'The three walks' presents the backward walk from declared endings as independent evidence; it recomputes the forward walk's predicate by another route. Its real contribution — reporting an unreached ending under its own name rather than as an orphan, with a witness path — is exactly what the document's own 'must be reported under different names' rule asks for, and is the framing to keep. The conservative false-negative bias, the declared-entry requirement and the assert-the-instrument section are all sound."
    },
    "techniques/state-variable-declaration-contract.md": {
      "disposition": "keep",
      "reason": "Six declaration fields each earning a specific check, definite assignment identified as failing at the join, and the singleton-name check as the highest-yield ten lines in the family. The owning-writer field is correctly identified as the one teams omit and the one that pays. External inputs are scoped out explicitly rather than silently."
    },
    "applications/node--reachability-and-orphan-detection.md": {
      "disposition": "clarify",
      "reason": "The body states 'neither co-reachability nor ending attainability is computed'; for a checker that fails on any node unmarked by the forward walk, an unreachable declared terminal is caught, under the wrong name. The file's own appended review boundary already corrects this and the correction is confirmed here; the body has not been reconciled with it, so the document now asserts both. The other three deviations — nodes[0] as the entry, undeclared terminals invisible, guards as prose — are accurate and well evidenced. verified_on 2026-09-02 stands unrefreshed."
    },
    "applications/process--state-variable-declaration-contract.md": {
      "disposition": "clarify",
      "reason": "Stage 2 clause 3 injects 'every option must write at least one variable that some later node reads' into the authoring prompt with no exemption, while false-choice-and-convergence-audit exempts declared tonal variants and excludes hubs. As a gate criterion with those carve-outs the rule is right; as an unconditional instruction to a generator it forbids craft the sibling technique protects. The ordering argument that is the document's whole point — declare, inject, check, repair, and never grade quality before the mechanical checks pass — is sound and is the reason this is clarify rather than anything heavier. verified_on 2026-09-02 stands unrefreshed."
    }
  }
}
```
