---
domain: game-production
subject: generated-mesh-acceptance
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# generated-mesh-acceptance

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generated-mesh-acceptance",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b05b1682e79d9d01",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Defect codes need stable meaning, but one defect can have several valid remedies depending on stage and cost. Unknown measurements are not an unrecognized-code fallback pass, and repeated reroll failure does not establish impossibility.",
    "The all-components fallback is not always more conservative: six tiny floaters may exceed a floater limit of four while seven total components satisfy a part limit of eight. Validate complete histograms or report bounds and ambiguity; face share is not semantic identity.",
    "Stage-specific acceptance requirements may legitimately differ. Exact-weld component counts do not prove a monotonic rejection-rate upper bound under all partition thresholds. One paired result cannot establish universal retopology invariance."
  ],
  "sources": [
    {
      "url": "https://docs.blender.org/manual/en/3.1/animation/shape_keys/introduction.html",
      "scope": "Official manual search evidence describes facial shape keys and vertex groups. Supports a counterexample to universal disconnected-shell requirements; no local rig execution. Latest-manual direct open failed."
    }
  ],
  "documents": {
    "generated-mesh-acceptance.md": {
      "disposition": "reverify",
      "reason": "Reverify shell-count facial readiness, topology rejection rules, shipping versus intermediate budgets and probabilistic repair claims. The facial technique is repaired; histogram ambiguity and stage rules remain unresolved."
    },
    "techniques/defect-code-taxonomy-not-prose.md": {
      "disposition": "reverify",
      "reason": "Defect codes need stable meaning, but one defect can have several valid remedies depending on stage and cost. Unknown measurements are not an unrecognized-code fallback pass, and repeated reroll failure does not establish impossibility."
    },
    "techniques/face-rig-shell-readiness.md": {
      "disposition": "clarify",
      "reason": "Repaired the universal four-shell prerequisite. Connected meshes can support facial deformation; readiness now follows named rig requirements, semantic regions and exercised poses."
    },
    "techniques/floater-vs-part-face-share-rule.md": {
      "disposition": "reverify",
      "reason": "The all-components fallback is not always more conservative: six tiny floaters may exceed a floater limit of four while seven total components satisfy a part limit of eight. Validate complete histograms or report bounds and ambiguity; face share is not semantic identity."
    },
    "techniques/stage-declared-grading.md": {
      "disposition": "reverify",
      "reason": "Stage-specific acceptance requirements may legitimately differ. Exact-weld component counts do not prove a monotonic rejection-rate upper bound under all partition thresholds. One paired result cannot establish universal retopology invariance."
    },
    "techniques/structural-scorecard.md": {
      "disposition": "reverify",
      "reason": "A planar quad can validly have zero extent on one axis and few vertices. Required shipping budgets can hard-fail even when a finishing step might repair them. Distinguish missing histogram evidence and unmeasured criteria from a high score."
    },
    "techniques/unmeasured-is-not-pass.md": {
      "disposition": "reverify",
      "reason": "A missing flag plus numeric zero is not type-level exclusion of a false pass. Missing evidence has no guaranteed worst-case direction. Retained historical assets can be remeasured with a new timestamp; never invent an old measurement."
    },
    "applications/node--structural-scorecard.md": {
      "disposition": "reverify",
      "reason": "The historical scorecard and 19.2% result were not rerun. Recheck truncated histogram fallback, planar geometry, four-shell inference and the unsupported rejection-rate upper bound. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--stage-declared-grading.md": {
      "disposition": "reverify",
      "reason": "The historical stage pair was not rerun. Joining objects does not necessarily weld disconnected components; a declared finishing remedy is not evidence that the defect was resolved. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all nine documents at 44c89965. This is the strongest-evidenced subject in my
group - it reasons from a real 52-file corpus run and a before/after decimation pair
rather than from doctrine - and every figure I could re-derive is correct: 61 + 314 =
375 components; 10/52 = 19.2%; one warn under `100 - 50f - 15w` gives the 85 the
application quotes; two fails give the 0/100 the four production rolls returned. The
findings below are all internal consistency, not arithmetic.

**The default part budget rejects the character the subject's own argument
describes.** The load-bearing section is "an assembled asset is not a shattered one",
and it enumerates what a correct production character is made of: head, lashes,
brows, layered eyes, an interior mouth carrying teeth and tongue, body, hands, hair,
cape, accessories. That is ten named shells at the most conservative reading, and
more once "layered eyes", "hands" and "accessories" are counted honestly.
`structural-scorecard.md` then offers "a part budget of 8 and a speck tolerance of 4"
as "sane starting points for characters", and the application's `DEFAULT_THRESHOLDS`
carries `maxComponentsFail: 8`. Substantial parts over the class part budget is a
**fail**. So the default configuration fails the exact asset the subject spends its
central section defending, by the exact mechanism ("a gate that fails on too many
connected components rejects correct characters") it identifies as the naive error.
The face-share rule fixed the conflation between debris and parts; it did not fix the
part budget, and the recommended number was never re-derived from the enumeration.
This is the one finding I would act on first.

The same tension shows up against `face-rig-shell-readiness`, which needs at least
four substantial shells for the face regions alone. A rig-ready head plus a body,
hands, hair and accessories is over eight before anything has gone wrong.

**Two techniques give opposite instructions about grading world scale.**
`structural-scorecard.md` step 6 says to grade the two request-relative properties
"only when those requests exist", naming world size as one of them.
`unmeasured-is-not-pass.md` step 5 says the opposite and explains why: "Grade the
always-gradeable properties even without a request... generators normalise output to
a unit box, so a card that stays silent lets a hero-sized asset pass at a fraction of
its intended size." The golden path sides with the second, and so does the
implementation - the application records that scale is graded at `:284-287` even
without a request, with the incident attached ("without this a 1 m hero passed clean
next to a 1.8 m Mannequin"). Three of four documents agree; step 6 is the outlier and
is the one a reader implementing the scorecard will follow.

**The mis-tiered flag never fires on the corpus that motivated it.** The remedy
partition puts `floaters` in neither the finish-resolves nor the reroll-resolves
list, by design and correctly - decimation multiplies specks. `misTiered` is true only
when a raw mesh is condemned solely by finish-resolvable codes, with no unaddressed
fail. The re-measurement found all ten of the ten failures were `floaters`, which is
always unaddressed. Face-count and budget-over are warns and can never drive a fail
at all. So on the 52-file corpus the flag is false for every mesh, and the only path
to a true reading is a fail on parts-over-budget or components-over-budget alone. The
technique is still right - declaring the stage is correct independent of the flag -
but the narrative ("this is why this module states the tier") is supported by the
substance of the old claim and not by the mechanism the module actually computes. Say
what the flag has fired on, or say that it has not.

**"Determined by the stage, not the draw" rests on four rolls of one prompt.**
`defect-code-taxonomy-not-prose.md` derives its re-roll list from that observation and
states it as a general property. Four rolls of a single prompt against one provider
establishes it for that prompt; the subject elsewhere is scrupulous about attaching a
basis to every number, and this one is asked to carry a routing decision that spends
or saves money on every rejection. The conclusion is probably right and cheap to widen
- the same corpus run that produced the 52-file distribution could report re-roll
variance across prompts.

Minor and consistent: the 375/61/314/36% figures carry no provider, date or asset
identity anywhere they appear.

One check did resolve outward. The process application declares the bias direction of
its re-derivation - exact-position welding finds more components than trimesh's
tolerance welding, making the fail rate an upper bound - and trimesh's own
documentation bears that out: `split()` separates by face connectivity, and
`merge_vertices()` groups vertices by position rounded to a `digits_vertex`
precision. Exact welding merges strictly fewer vertices, so it can only find more
components. The stated bound holds. I read the documentation; I loaded no mesh.

I verified the adjacency corollary by hand rather than in a mesh tool, and it holds:
under an operator selecting faces whose every edge has more than two face users, a box
enclosed in a box and merely joined has every inner-box edge at exactly two users and
selects zero, while two cubes welded across a shared wall give that wall's edges three
users each and select one. The conclusion the technique draws - a zero result means
"no welded interior found", never "nothing is hidden" - follows.

What I checked and found sound: the fail/warn test stated as a question about
downstream remedy rather than about severity; the truncated-histogram branches and
the invariant that neither can manufacture a pass; the three not-measured
representations and the derived-split flag; the refusal to fold readiness into the
health score; the insistence that the stage assessment can read a verdict and never
produce one.

Both applications remain `reverify`. They cite a PoF checkout by file and line at
`verified_on` 2026-08-20 and 2026-08-30 with no commit pinned; no module was run, no
mesh graded, no corpus re-derived here.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generated-mesh-acceptance",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:4e19f6fc7b7115d9",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at 44c89965 and cross-read for internal consistency. Every quantitative claim re-derived: 61+314=375, 10/52=19.2%, the score formula against the quoted 85 and 0/100 verdicts, the speck floor's max(8, 0.5% of total). The adjacency corollary derived by hand from the operator's definition, and trimesh's split/merge_vertices semantics read from its documentation to check the re-measurement's stated bias direction. Explicitly NOT evaluated: any PoF checkout, any mesh file, the trimesh extractor, the 52-file corpus, any decimation pass, or the four production rolls.",
  "counterexamples": [
    "The subject's own enumeration of a correct production character - head, lashes, brows, layered eyes, interior mouth with teeth and tongue, body, hands, hair, cape, accessories - is at least ten shells, while the recommended default part budget is 8 and substantial parts over the budget is a fail. The default configuration fails the defended case.",
    "A face-rig-ready head needs at least four substantial shells for the face regions alone; add a body, hands, hair and accessories and the same asset is over the eight-part budget without any defect.",
    "structural-scorecard step 6 grades world size only when a size was requested; unmeasured-is-not-pass step 5, the golden path and the implementation all grade it always, on the strength of a recorded incident.",
    "On the 52-file corpus the mis-tiered flag is false for every mesh: all ten failures were floaters, which is deliberately in neither remedy list, and the only fail-capable finish-resolvable codes are parts-over-budget and components-over-budget.",
    "Four rolls of one prompt cannot establish that a defect class is determined by the stage rather than the draw for every prompt and provider, yet the re-roll list - which decides whether a rejection costs another generation - is built on it.",
    "A speck floor of max(8 faces, 0.5% of total) means that on a 1.5M-face raw mesh a 7,500-face component is a speck, so a genuinely small but real part on a dense mesh is classified as debris and routed to the class the pipeline has no automatic answer for."
  ],
  "sources": [
    {
      "url": "https://trimesh.org/trimesh.base.html",
      "result": "Confirms the process application's stated bias direction. trimesh's split() separates a mesh by face connectivity, and merge_vertices() groups duplicate vertices by position rounded to a digits_vertex precision - a tolerance, not exact equality. A re-derivation welding on exact position therefore merges strictly fewer vertices and finds at least as many components, so the 19.2% fail rate is genuinely an upper bound as claimed. It did NOT establish what digits setting the production extractor used, nor anything about the 52 files themselves; no mesh was loaded and no code was run."
    }
  ],
  "documents": {
    "generated-mesh-acceptance.md": {
      "disposition": "keep",
      "reason": "Accurate throughout: the structural-is-never-sufficient framing, the assembled-versus-shattered distinction, the re-measurement narrative and every figure it quotes. It sides correctly with grading scale always. The part-budget contradiction is downstream of it, in the technique's recommended default."
    },
    "techniques/structural-scorecard.md": {
      "disposition": "clarify",
      "reason": "Two things. Step 6 grades world size only on request, contradicting the golden path, unmeasured-is-not-pass and the implementation. And 'a part budget of 8... for characters' fails the ten-shell character the subject defends; re-derive the default from the enumeration or say which classes the 8 is for."
    },
    "techniques/floater-vs-part-face-share-rule.md": {
      "disposition": "keep",
      "reason": "The share-over-count move, the max(absolute, share) floor, the truncation branches and their neither-can-manufacture-a-pass invariant, and the adjacency corollary all hold - the last verified by hand against the operator's definition. The strongest single technique in my group."
    },
    "techniques/defect-code-taxonomy-not-prose.md": {
      "disposition": "clarify",
      "reason": "The taxonomy-by-remedy rule and the membership-must-be-measured discipline are excellent, but the re-roll list's justification is four rolls of one prompt stated as a general property. Attach the basis, or widen the observation over the corpus that already exists."
    },
    "techniques/stage-declared-grading.md": {
      "disposition": "clarify",
      "reason": "Sound in every rule, including the hard rule that assessment may not soften a verdict. What it should add is what its own corpus shows: with floaters unaddressed by construction and density unable to fail, the mis-tiered flag fired on none of the 52. A flag with no observed positive is worth saying so about."
    },
    "techniques/unmeasured-is-not-pass.md": {
      "disposition": "keep",
      "reason": "The three states, the absent-not-defaulted rule, the three-valued readiness, the derived-split flag and the do-not-backfill rule are precise and internally consistent, and step 5 is the correct side of the world-scale disagreement."
    },
    "techniques/face-rig-shell-readiness.md": {
      "disposition": "keep",
      "reason": "The separation of health from fitness-for-a-job is right and well argued, the three outcomes include unmeasured properly, and the refusal to fall back to a raw count is exactly the trap it names. Its four-shell minimum interacts badly with the eight-part budget, but the fault is in that budget."
    },
    "applications/node--structural-scorecard.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-30, no commit pinned, module not executed. Its check ordering, threshold constants and truncation asymmetry are quoted rather than run; the DEFAULT_THRESHOLDS part budget of 8 is where the character contradiction lands in practice."
    },
    "applications/process--stage-declared-grading.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-20; the 52-file corpus run, the four production rolls and the before/after decimation pair are the subject's best evidence and none of them was reproduced here. The re-measurement protocol, including its stated bias direction, is the transferable part and is well recorded."
    }
  }
}
```
