---
domain: game-production
subject: regeneration-vs-repair-economics
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# regeneration-vs-repair-economics

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/regeneration-vs-repair-economics",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a33dc4e375862ffe",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 1 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "With generation cost 2, grading cost 1 and independent success probability 0.25, expected cost through success is (2+1)/0.25 = 12, not 2/0.25+1 = 9.",
    "Two repairs can reduce a defect from 100 units to 10 while retaining the same defect code; the repeated code alone does not show no progress.",
    "A defect absent from the remedy map may have an untested repair, and its absence says nothing about permission to ship."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/sourcing-economics/regeneration-vs-repair-economics",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "regeneration-vs-repair-economics.md": {
      "disposition": "reverify",
      "reason": "Reverify exactly-three branches, unknown remedy routed to shipment, finite failed rolls promoted to stage impossibility and one paired repair generalized to all inputs. Hold, discard, redesign and bounded investigation are valid outcomes. The cost technique is repaired; related golden-path claims remain."
    },
    "techniques/best-of-n-parameter-sweep.md": {
      "disposition": "reverify",
      "reason": "One-axis sweeps miss interactions; factorial or other designed searches can compare multi-axis changes. Local computation and retained artifacts cost resources. Sanitized labels can collide, and a best candidate still needs required gates. Losers from a parameter sweep are not automatically iid reroll pass-rate samples."
    },
    "techniques/bounded-refine-iteration.md": {
      "disposition": "reverify",
      "reason": "A deterministic generator can refine when its inputs change. Repeated defect codes with improving magnitude do not prove nonconvergence. Preserve best under a comparable basis and distinguish no output from ungraded output; time/cost limits need cancellation or accounting for work that continues externally."
    },
    "techniques/defect-class-to-remedy-map.md": {
      "disposition": "reverify",
      "reason": "A class can have several remedies, so local and reroll sets need not be disjoint. An absent map entry means unknown, not known ineffective. One successful pair is scoped evidence, and plausible bounded trials may establish new entries. Warn-only work can be economically justified; unknown remedy must not authorize shipping a failed artifact."
    },
    "techniques/refuse-the-fix-that-cannot-help.md": {
      "disposition": "reverify",
      "reason": "Input size limits and memory isolation can make a formerly pathological operation safe within a bounded domain; one incident does not prove permanent impossibility. Derived basenames alone do not prevent collisions or symlink escapes. A refusal needs no destructive fallback but can route to an authorized alternative; human presence does not erase resource limits."
    },
    "techniques/reroll-economics-per-credit.md": {
      "disposition": "clarify",
      "reason": "Repaired cost-per-success arithmetic to include repeated grading costs, explicit iid/retry assumptions, finite budgets, uncertainty and separation of unknown remedy from shipment eligibility. Removed unsupported market-price defaults and per-artifact expected-value dismissal."
    },
    "techniques/score-basis-must-be-stated.md": {
      "disposition": "reverify",
      "reason": "Dropping missing components changes the estimand and generally needs explicit renormalization for a partial score. A zero sentinel labeled ungraded can still be accidentally averaged; use null or tagged states. Required missing evidence still blocks acceptance, and a heterogeneous penalty sum does not establish actual defect severity."
    },
    "applications/node--defect-class-to-remedy-map.md": {
      "disposition": "reverify",
      "reason": "Historical four failures do not establish a zero reroll success probability or universal fragmentation. The 52-asset audit and reduction pair remain scoped observations; safe basenames require actual containment/identity checks. Consumer and prices not rerun; remove machine-specific root during reconciliation."
    },
    "applications/process--bounded-refine-iteration.md": {
      "disposition": "reverify",
      "reason": "Historical research summaries are not fresh checks of every paper's stopping rule. The described retry loop lacks input refinement; same primary defect can improve numerically. Optional ungated flags need explicit output states, and existing count caps do not prove in-flight spend cancellation. No consumer or paper measurements refreshed."
    }
  }
}
```

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 9 documents at current bytes, and read (not executed) the three `pof` modules the
applications cite. This supersedes the earlier 2026-09-10 record on this note, whose
digest the revert invalidated, and it retracts that record's blanket `reverify` on both
applications, because the evidence they rest on is present at source and I checked it.

In the `pof` working tree, `src/lib/visual-gen/critique-stage.ts` carries
`FINISH_RESOLVES` at line 61 and `REROLL_RESOLVES = ['empty-mesh','degenerate-bbox']` at
line 78, with the deliberate omission of `floaters` argued in the doc comment above them;
the header comment at lines 25–33 states "Every single one of those 10 fails was
`floaters`", the 16–50 floaters / 35–56 parts range across four rolls, and the
`jinx_v32_run_game.glb` pair at 46,791 faces / 17 components / 16 floaters. `assessStage`
derives the three disjoint lists at 140–142 exactly as described.
`src/lib/visual-gen/best-of-n.ts:137` is `DEFAULT_MAX_ATTEMPTS = 3`, with `failureShape`
at 151 and `ungated` as a distinct third value at 184.
`src/lib/visual-gen/finish-routing.ts:20–24` carries the `cullInterior` refusal and the
`trimesh.split()` incident that consumed 211 GB on 2026-08-18, plus the
`FINISH_OUTPUT_DIR` allow-list derivation at 40 and 67–68. Every load-bearing number in
this subject is where the applications say it is. Reading them is not running the
pipeline: no mesh was generated, graded, decimated or re-rolled this run.

**The one finding that would justify a content change is a self-contradiction in
`bounded-refine-iteration`.** Its contract says "A refinement that is derived from the
critique, not from a retry. If attempt n+1 does not change its inputs based on attempt
n's named defects, it is not a refine loop — it is a re-roll loop, and the economics
technique governs it instead." Its "when not to use this" then says: "When the generator
is deterministic. Re-running the same input returns the same output, so there is no loop
to bound." But re-running the same input is precisely what this technique defines as *not*
its loop. A deterministic generator fed amended inputs produces different output, so a
refine loop over one is exactly as unbounded as any other and needs exactly this contract.
The exclusion is a true statement about re-roll loops filed under the refine technique,
and a reader with a deterministic generator is told to skip the cap that applies to them.

A smaller boundary worth naming: two different measured sets are quoted in this subject
using one vocabulary. The golden path and `defect-class-to-remedy-map` cite four rolls at
16–50 floaters and 35–56 parts; `bounded-refine-iteration` cites three live runs at "33
floater fragments … 56 disconnected parts, then 12 … 38". The 12 sits below the 16 floor
of the other set. They are different experiments — one establishing stage-determinism, one
establishing that raw-string comparison never matches — and nothing in either document
tells a reader that, so the pair reads as an inconsistency in one measurement.

Everything else held. The regenerate-until-good critique is argued structurally (a
property of the stage, not of the draw) rather than as a budget complaint, which is what
makes the classification outrank the arithmetic. The measured before/after pair where
reduction cured its target class and multiplied the class that was actually driving
rejections is the strongest single piece of evidence in this group, and both rules the
subject draws from it are the right ones. `refuse-the-fix-that-cannot-help`'s three
refusals are genuinely different in kind, and the argument against tuning a threshold
instead of refusing ("a threshold only moves the input size at which the machine dies") is
correct as stated. `score-basis-must-be-stated`'s worked failure checks out arithmetically
and its refusal to substitute *any* constant is the right conclusion rather than an
overreach.

What I did not evaluate: no generation, no grading, no decimation, no reroll, no cost
measured. `reroll-economics-per-credit`'s market claim — that per-generation costs
"cluster in the sub-dollar range" — is an unsourced statement about a moving market and
was not checked against any provider's current pricing; it is used only to argue the
number is knowable, so nothing downstream rests on it, but it will age.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/regeneration-vs-repair-economics",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:60a55e5315340266",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read at current bytes. critique-stage.ts, best-of-n.ts and finish-routing.ts read (not executed) in the pof working tree. Not evaluated: any generation, grading, decimation or reroll; no cost or pass rate measured; the agentic-3D research docs and the provider pricing claim were not re-resolved.",
  "counterexamples": [
    "A deterministic generator fed inputs amended from a critique has a genuine refine loop, which bounded-refine-iteration's own 'when not to use' clause tells the reader it does not have.",
    "A defect that is stage-determined for the current stage and draw-determined after a pipeline change has no entry state in the map: the vocabulary comes from the acceptance gate, but the draw/stage split is a property of the pipeline the gate does not model.",
    "The map's direction (remedy to classes) makes an unaddressed class visible, but gives no reading for a class that two remedies each partially cure — the technique admits partial cures as annotated entries and the routing derives three disjoint lists, so a class in both sets cannot be represented.",
    "A sweep whose grader throws on the highest-quality candidate silently selects a worse artifact: the technique says an ungraded candidate never wins, which is correct and also means grader flakiness biases selection downward with no signal."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/visual-gen/critique-stage.ts",
      "result": "Read, not executed. Confirms FINISH_RESOLVES at line 61, REROLL_RESOLVES = ['empty-mesh','degenerate-bbox'] at 78, the deliberate omission of floaters, the 10-of-52 / all-ten-floaters measurement and the jinx_v32 before/after pair in the header comment, and assessStage's three disjoint lists at 140-142. Establishes that the application reports the tree exactly; establishes nothing about whether the measurements generalise beyond this generator."
    },
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/visual-gen/best-of-n.ts and src/lib/visual-gen/finish-routing.ts",
      "result": "Read, not executed. Confirms DEFAULT_MAX_ATTEMPTS = 3, failureShape and ungated as a distinct third value, and the cullInterior refusal with the 211 GB trimesh.split() incident dated 2026-08-18 plus the FINISH_OUTPUT_DIR allow-list derivation. Establishes nothing about the loop's behaviour on a live generator, which was not run."
    }
  ],
  "documents": {
    "regeneration-vs-repair-economics.md": {
      "disposition": "keep",
      "reason": "Three branches with the null option treated as real, the stage-versus-draw classification outranking the arithmetic, and the measured before/after pair are all argued rather than asserted; the naive-readings list is accurate."
    },
    "techniques/defect-class-to-remedy-map.md": {
      "disposition": "keep",
      "reason": "Remedy-to-classes direction with its justification, the anti-entry rule, the declared-stage requirement and the display-only mis-tier signal are correct and match the shipped assessStage."
    },
    "techniques/reroll-economics-per-credit.md": {
      "disposition": "keep",
      "reason": "Four numbers per accepted artifact, the pass-rate-from-attempts rule and the unit trap are sound; the sub-dollar market aside is unsourced but load-bearing on nothing."
    },
    "techniques/refuse-the-fix-that-cannot-help.md": {
      "disposition": "keep",
      "reason": "Three refusals genuinely different in kind; the argument against threshold-tuning a memory blow-up is correct, and the 211 GB incident and cullInterior ban are confirmed at source."
    },
    "techniques/bounded-refine-iteration.md": {
      "disposition": "clarify",
      "reason": "The deterministic-generator exclusion describes a re-roll loop, which the same document defines as not this technique; a deterministic generator fed critique-amended inputs needs this cap as much as any other."
    },
    "techniques/score-basis-must-be-stated.md": {
      "disposition": "keep",
      "reason": "The halved-score failure checks out arithmetically, the drop-never-default rule is argued against every possible constant, and the aggregate's permitted meaning is stated."
    },
    "techniques/best-of-n-parameter-sweep.md": {
      "disposition": "keep",
      "reason": "One axis at a time, production grader rather than a proxy, best-is-not-acceptable, and the negative-audit section are all specific and correct."
    },
    "applications/node--defect-class-to-remedy-map.md": {
      "disposition": "keep",
      "reason": "FINISH_RESOLVES, REROLL_RESOLVES, the deliberate floaters omission, the 10-of-52 measurement, the jinx_v32 pair, assessStage's three lists and the finish-routing refusals all confirmed verbatim at source."
    },
    "applications/process--bounded-refine-iteration.md": {
      "disposition": "reverify",
      "reason": "DEFAULT_MAX_ATTEMPTS = 3, failureShape and the distinct ungated value confirmed at source, but the two docs/research specifications it quotes for the loop doctrine were not re-read and no loop was executed."
    }
  }
}
```
