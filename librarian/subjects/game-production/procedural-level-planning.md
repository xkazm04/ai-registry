---
domain: game-production
subject: procedural-level-planning
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# procedural-level-planning

## Architecture review - 2026-09-10

Read and assessed all 14 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/procedural-level-planning",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:0b7277eb6d4bcf22",
  "disposition": "reverify",
  "coverage": "All 14 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Conditional or approximate support is real when its limits are explicit. One paired fixture can remain unchanged because of thresholds; metadata-only changes do not prove semantic consumption. Normalization policy must preserve or explicitly amend intent.",
    "Define the chosen route, required rooms and unique-room versus traversal denominator. Multiple viable paths and cycles need explicit treatment. Padding still counts as optional scope even when its design value is poor.",
    "Shared algorithms can produce identical results legitimately. Declared read sets need control-flow and semantic checks; a single perturbation is insufficient. Original requests can be recovered from reliable immutable evidence."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/balance-validation/procedural-level-planning/procedural-level-planning.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "procedural-level-planning.md": {
      "disposition": "reverify",
      "reason": "Reverify binary parameter support, mandatory output changes for every input perturbation, universal scalar progression rules and deterministic-stream constraints. The gate/key proof is repaired, including a directed permanent-key counterexample."
    },
    "techniques/algorithm-parameter-support-matrix.md": {
      "disposition": "reverify",
      "reason": "Conditional or approximate support is real when its limits are explicit. One paired fixture can remain unchanged because of thresholds; metadata-only changes do not prove semantic consumption. Normalization policy must preserve or explicitly amend intent."
    },
    "techniques/critical-path-to-optional-branch-ratio.md": {
      "disposition": "reverify",
      "reason": "Define the chosen route, required rooms and unique-room versus traversal denominator. Multiple viable paths and cycles need explicit treatment. Padding still counts as optional scope even when its design value is poor."
    },
    "techniques/declare-what-each-engine-ignores.md": {
      "disposition": "reverify",
      "reason": "Shared algorithms can produce identical results legitimately. Declared read sets need control-flow and semantic checks; a single perturbation is insufficient. Original requests can be recovered from reliable immutable evidence."
    },
    "techniques/gate-and-key-solvability-proof.md": {
      "disposition": "clarify",
      "reason": "Repaired stateful directed reachability, reversible-closure assumptions, consumable-key over-approximation, distinct goal/return/softlock properties and bounded-search reporting."
    },
    "techniques/landmark-and-sightline-legibility.md": {
      "disposition": "reverify",
      "reason": "Landmark and visible-option counts are heuristics conditioned on camera, occlusion and player position. Inside-room landmarks and maps can be valid; correlated visual cues are not automatically independent channels."
    },
    "techniques/pacing-linter-rules.md": {
      "disposition": "reverify",
      "reason": "A BFS visitation order is not a traversable pacing arc. Unknown fields require uncertainty rather than confirmed fatigue. Safe-room adjacency must respect direction and gate access; difficulty thresholds need units."
    },
    "techniques/safe-room-and-boss-placement.md": {
      "disposition": "reverify",
      "reason": "Largest and farthest candidates can conflict with arena or access requirements. Rest before a boss needs a legal pre-boss route; save services and after-boss rewards are design choices rather than universal placement defects."
    },
    "techniques/seed-determinism-contract.md": {
      "disposition": "reverify",
      "reason": "Deterministic named random substreams can preserve results across draw-order changes. Version compatibility may be deliberately maintained; a randomly chosen seed is reproducible once recorded with the full relevant configuration."
    },
    "techniques/zone-progression-linting.md": {
      "disposition": "reverify",
      "reason": "All nodes having inbound edges does not imply reachability from a declared start. For fixed bands, next-floor minus previous-floor is at least next-floor minus previous-ceiling, contrary to the stated understatement. Band edges do not establish actual player level."
    },
    "applications/node--declare-what-each-engine-ignores.md": {
      "disposition": "reverify",
      "reason": "The historical paired-input test cannot establish full parameter consumption or impossibility of drift. Integer-seed conversion needs an explicit signed/unsigned contract; remove machine-specific roots from published evidence on reconciliation. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--gate-and-key-solvability-proof.md": {
      "disposition": "reverify",
      "reason": "The displayed graph DFS is not an inventory-state proof. Global permanent-key closure can combine mutually unreachable states; recheck directed traversal and consumption in the consumer. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--pacing-linter-rules.md": {
      "disposition": "reverify",
      "reason": "Multi-root BFS can admit disconnected roots and compare nonadjacent rooms as one arc. Directional boss access and numeric zero versus missing difficulty need distinct checks. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--safe-room-and-boss-placement.md": {
      "disposition": "reverify",
      "reason": "The historical prompt asks for deterministic placement but does not enforce execution. RANDOM resolved once and stored can reproduce; float difficulty units need reconciliation with the integer threshold examples. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Read all fourteen owned documents at their reverted bytes, then went to the primary
source the four applications are written against: the Path of Fire tooling checkout at
`C:\Users\kazda\kiro\pof`, HEAD `d823bffe` (2026-09-09). I read that source; I did not
build it, run its test suites, or execute any generator. Every claim below that cites a
pof file is a reading of the file at that commit.

**Retractions.** The 2026-09-10 record above marked nine of these fourteen documents
`reverify` on grounds that do not survive contact with the current text, and I retract
those specific inferences. The support-matrix technique already carries a
`derived-after-the-fact` state and already requires the achieved value beside the
requested one, so "conditional or approximate support is real when its limits are
explicit" is a restatement of what the document says rather than a finding against it.
The branch-ratio technique already fixes its denominator ("optional rooms per critical
room"), already computes the critical path on the gated graph, and already refuses to
grade an unmarked objective. The seed contract already requires an unsupplied seed to be
generated and shown. Zone linting already runs reachability from the start (step 2) and
already rules that a self-loop does not confer reachability, so "all nodes having inbound
edges does not imply reachability" is answered in the document. I keep all four.

**One prior finding survives and I confirm it.** `zone-progression-linting` says the gap
that matters is the next zone's floor minus this zone's ceiling, then says "Comparing
midpoints or comparing floors both understate the gap for wide bands". The direction is
inverted. Since a zone's floor is at or below its ceiling, `nextFloor − thisFloor ≥
nextFloor − thisCeiling`, and the midpoint difference exceeds it by half the sum of the
two band widths. Both alternatives *overstate* the gap, and the practical consequence is
the opposite of the one the document warns about: they manufacture false walls on wide
bands rather than hiding real ones. The rule and the threshold are right; one word is
wrong, and it is the word that tells a reader why the basis matters.

**A new finding, from the consumer.** `declare-what-each-engine-ignores` asserts an
absolute in its procedure: "Every cross-generator pair answers no, with the structural
reason; that the answer is always no is the point." The tree it was forged from now
contains a counterexample it wrote itself. `procgen-spec.ts` at HEAD declares four
engines, not three, and the fourth — `grid-replay` — reads *zero* spec fields because it
consumes the browser preview's exported cells rather than regenerating from the seed.
`layoutAgreement()` (`:184`) special-cases the pair and returns `agree: true`, with the
reason that the layout data is identical by construction and the runtime placement is
unverified. That is a real class the technique does not have: an engine that replays
another's *output* agrees exactly, and it is precisely the case where a shared request
type invites no false assumption at all, because the request is not what was shared. The
technique needs the boundary — engines that regenerate from the spec never agree; an
engine that consumes another's output is a different relation — and its warning survives
intact for the class it was written about.

**A gap rather than an error.** `seed-determinism-contract` treats draw-order coupling as
inherent, and its remedy is a discipline ("new passes append rather than interleave where
that is achievable"). The standard structural answer — deriving a per-pass substream from
the run seed and a pass identifier, so inserting a pass shifts nothing downstream — is
absent, and it is stronger than the discipline because it does not decay. The four terms
and the version-bump rule are correct as written.

**Application drift, measured against pof HEAD.** Three of the four applications have
moved under their citations. `node--gate-and-key-solvability-proof.md` is the largest:
witnessed at pof `9aa31407` it recorded that no `requires`/`unlockedBy` field existed, no
inventory closure, no cycle detection, no unwinnable verdict, and closed by naming the
smallest change that would land the subject. At HEAD every part of that change exists —
`RoomConnection.requires`, `RoomNode.grants`, `runClosure()` as a documented fixed point
whose comment states the cycle argument verbatim, a `ReachabilityLedger` carrying
`proven`, `levels`, `gatesResidual`, `keysHeld` and, notably, `undeclaredGates` for
connections whose `condition` is prose with nothing a checker can resolve. The technique's
"a gate whose condition is free text is a comment" rule is now implemented in the tree it
was extracted from. The document is honest about its own commit and is not wrong; it is
superseded, and it is the one that most repays re-reconciliation.
`node--declare-what-each-engine-ignores.md` says three engines and seven spec fields;
HEAD has four and eight (`ensureConnected` was added), so "browser preview reads five of
seven" and "the codegen path reads all seven" are both stale — though the finding it
exists to record, that `ProcgenSpec` carries no generator version, still holds exactly.
`node--pacing-linter-rules.md` has drifted by roughly two hundred lines and the result now
carries a reachability ledger; its stated shortfall — no per-rule evaluated/unevaluated
state — still holds, as a search for `unevaluated` over the file returns nothing.
`process--safe-room-and-boss-placement.md` holds up: the seed line still degrades to
`FMath::Rand()` at `level-design.ts:415` while the best-practice block at `:464` forbids
exactly that call, and `hashSeed()` still falls back to `DEFAULT_PREVIEW_SEED = 1337`.

**What I did not evaluate.** No generator was run, no level was generated, no seed was
replayed across a version bump, and no threshold in the pacing rules was measured against
played levels. The perceptual half of `landmark-and-sightline-legibility` — whether two
silhouettes read as different — is unmeasurable from here by construction, and the
technique says so itself, which is why I keep it rather than marking it unresolved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/procedural-level-planning",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f519280ac89d6719",
  "disposition": "clarify",
  "coverage": "All 14 owned documents read in full at their reverted bytes. The four applications were re-read against their cited primary source, the pof checkout at HEAD d823bffe (2026-09-09), by reading procgen-spec.ts, algo-params.ts, pacing-linter.ts, types/level-design.ts, prompts/level-design.ts and frandom-stream.ts. No build, no test run, no generator execution, no seed replay, no engine session, no playtest, no threshold measurement against played levels. The perceptual rung of landmark legibility is explicitly not evaluated.",
  "counterexamples": [
    "An engine that replays another engine's exported output rather than regenerating from the spec agrees with it exactly, which falsifies declare-what-each-engine-ignores' claim that every cross-generator pair answers no; pof's grid-replay engine reads zero spec fields and layoutAgreement() returns true for the browser-preview/grid-replay pair by construction.",
    "Zone bands wide enough to overlap: comparing floors or midpoints yields a LARGER number than floor-minus-ceiling, so those alternatives raise false walls rather than concealing real ones, contrary to the sentence in zone-progression-linting.",
    "A generator that draws each pass from a substream derived from (seed, pass-name) can insert a pass anywhere without shifting any other pass's draws, so seed-determinism-contract's append-don't-interleave discipline is not the only available answer to draw-order coupling.",
    "A key that is provably reachable at the end of an unmarked branch in a room the sightline check already flagged as indistinguishable is solvable and unfindable; the closure passes it and the subject is explicit that findability sits a rung above, so this is a stated silence rather than a defect."
  ],
  "sources": [
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/level-design/procgen-spec.ts", "result": "Read at pof HEAD d823bffe. Established four engines in PROCGEN_ENGINES (:99) and eight ProcgenSpecFields including ensureConnected, and that layoutAgreement() (:184) returns agree:true for the browser-preview/grid-replay pair. Did not establish anything about runtime behaviour; the file itself flags UE placement as unverified. Confirms ProcgenSpec still carries no generator version field."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/level-design/pacing-linter.ts", "result": "Read at pof HEAD. Established that a gate-and-key fixed-point closure, key levels, residual-gate reporting, undeclared-prose-gate reporting and a proven flag now exist, superseding the application's recorded absence at commit 9aa31407. Did not establish that the closure is correct on any fixture — no test was run. A search for 'unevaluated' returns nothing, so the per-rule evaluated-state shortfall still stands."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/prompts/level-design.ts", "result": "Read at pof HEAD. Confirmed the unseeded-fallback contradiction the application records: line 415 instructs FMath::Rand() for a blank seed, line 464 forbids FMath::Rand. Line numbers have drifted from the application's citations. Did not run the prompt or observe generated output."}
  ],
  "documents": {
    "procedural-level-planning.md": {"disposition": "keep", "reason": "The golden path's five sections each hand off to a technique that carries the rule, the seams to encounter pacing, balance simulation and downstream scene derivation are named, and the naive-reading list is falsifiable rather than rhetorical. It repeats the cross-generator absolute only by implication, so the correction belongs on the technique."},
    "techniques/algorithm-parameter-support-matrix.md": {"disposition": "keep", "reason": "Retracts the prior reverify. The document already carries the three-state classification (consumed / derived-after-the-fact / not applicable), already forbids calling an approximation consumed, and already requires achieved beside requested. The differential check it prescribes exists in the consumer as procgen-params-honest.test.ts and asserts both directions."},
    "techniques/critical-path-to-optional-branch-ratio.md": {"disposition": "keep", "reason": "Retracts the prior reverify. The denominator is stated (optional rooms per critical room), the path is computed on the gated graph with the basis recorded, the objective must be marked before measuring, and the padding rule already says a branch counts only when its terminus holds something the critical path does not."},
    "techniques/declare-what-each-engine-ignores.md": {"disposition": "clarify", "reason": "The procedure's absolute — 'every cross-generator pair answers no ... that the answer is always no is the point' — is falsified by the consumer's own grid-replay engine, which agrees with the browser preview exactly because it replays exported cells instead of regenerating. The technique needs the distinction between regenerating engines (never agree) and replay engines (agree by construction); everything else in the document holds."},
    "techniques/gate-and-key-solvability-proof.md": {"disposition": "keep", "reason": "The closure, the key-level ordering, the cycle-as-fixed-point argument, the consumable-key non-monotonicity caveat and the prose-gate rule are all correct and are now independently implemented in the consumer, which is the strongest evidence available short of running it."},
    "techniques/landmark-and-sightline-legibility.md": {"disposition": "keep", "reason": "The geometric/perceptual split is stated as two rungs with the weaker one governing the claim, and every quantity carries eye height, field of view and lighting state as its basis. The prior reverify's objection — that landmark counts are heuristics conditioned on camera and occlusion — is the document's own position."},
    "techniques/pacing-linter-rules.md": {"disposition": "keep", "reason": "The five rules each pair a signature with a consequence, unknown room kinds continue rather than break a combat run, boss adjacency is explicitly bidirectional, and rules that cannot evaluate must report as unevaluated. The prior claim that a BFS order is not a traversable arc is addressed: resolveArc prefers the document's declared difficultyArc and falls back only as best effort."},
    "techniques/safe-room-and-boss-placement.md": {"disposition": "keep", "reason": "Farthest is defined in traversal steps with the unit stated, roles are data rather than names, conflicts must be reported rather than silently relaxed, and the non-linear case is excluded by name in 'when not to use this'."},
    "techniques/seed-determinism-contract.md": {"disposition": "clarify", "reason": "Draw-order coupling is presented as inherent, remedied only by a convention ('new passes append rather than interleave'). Per-pass substreams derived from the run seed and a pass identifier remove the coupling structurally and belong beside the convention. The four terms, the restart clause and the version-bump rule are correct."},
    "techniques/zone-progression-linting.md": {"disposition": "clarify", "reason": "'Comparing midpoints or comparing floors both understate the gap for wide bands' is arithmetically inverted. With floor <= ceiling, nextFloor-thisFloor >= nextFloor-thisCeiling, and the midpoint comparison is larger still; both alternatives overstate the gap and produce false walls. The prescribed basis and the threshold are right."},
    "applications/node--declare-what-each-engine-ignores.md": {"disposition": "reverify", "reason": "Stale against its own consumer at HEAD: PROCGEN_ENGINES now declares four engines and PROCGEN_SPEC_FIELDS eight, so 'three engines', 'five of seven' and 'all seven' are all wrong now, and every cited line number has moved. The finding it exists to carry — no generator version on the spec — was re-read and still holds."},
    "applications/node--gate-and-key-solvability-proof.md": {"disposition": "reverify", "reason": "Superseded by its consumer. Witnessed at 9aa31407 as a tree with gates declared and never resolved; at HEAD the full closure, key levels, residual-gate reporting and an undeclared-prose-gate list exist in pacing-linter.ts. The document remains a correct account of the past and should be re-reconciled rather than kept as current evidence."},
    "applications/node--pacing-linter-rules.md": {"disposition": "reverify", "reason": "Line citations have drifted by roughly two hundred lines and the result type now carries a ReachabilityLedger the document does not mention. Its stated shortfall stands — no token 'unevaluated' appears anywhere in the file — so the standard is unchanged and only the witness needs refreshing."},
    "applications/process--safe-room-and-boss-placement.md": {"disposition": "keep", "reason": "Re-read against pof HEAD and every load-bearing claim survives: the placement numbers are still in the brief, the seed line still degrades to FMath::Rand() while the best-practice block forbids it, and hashSeed still falls back to a shown constant. Only line numbers moved."}
  }
}
```
