---
subject: image-to-3d-input-gating
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# image-to-3d-input-gating

First touch by `/intake`: 2026-09-07, a 3D-AI creature build-walkthrough
([[../../sources/2026-09-07-3d-ai-creature-workflow]]). Five of the source's eleven
candidates were catches inside this subject and its neighbours - the pose rule in
particular says the source's own hardest-won lesson better than the source does. What
survived is one mechanism the subject did not own.

## State

6 -> 7 techniques, 0 -> 1 applications. A sibling session was concurrently adding
`scene-partition-is-the-gated-unit` to the same golden path. Only this run's hunk was
committed here - theirs was uncommitted at the time and lands under their own name. The
two are genuinely adjacent rather than duplicative - that one cuts a *frame* into regions the
gate can score, this one cuts a *subject* into parts a generator can reconstruct.

Landed:

- `techniques/part-cut-planning.md` - the split decision itself, which no subject owned.
  The corpus held every consequence of a part split (budget division consumes the part
  count, finishing assembles whatever arrives) and nothing that chose the boundaries. The
  technique makes the plan an artifact authored before the first generation, justifies
  each boundary against one of four downstream consumers - silhouette, binding,
  multiplicity, entanglement - and makes the plan the single authority for the part count.
- `applications/node--part-cut-planning.md` - `applied: simulation`,
  `ab_verdict: better`, `proof: structural-only`.

## Why it homed here

The split is performed on the reference, before any geometry exists, so it is this
subject's stage. It is also this subject's characteristic *move*: `canonical-pose-rule`
exists because a rig assumes a rest pose - a downstream constraint pulled forward into the
reference. Part cut planning is the same move on a second axis, which is the argument for
the placement over the budgeting subject next door.

## What the consumer tree showed

In the one fleet project that declares this domain, the word "part" has exactly one
meaning and it is a **defect**: an over-budget part count is a critique finding code, and
the finishing stage is declared to resolve it by joining everything back into one object.
Parts are what the generator did to the asset, never what the pipeline asked for. Nobody
designed that; it is the missing stage showing up as a vocabulary.

## Owed

The application's verdict is a prediction with a named falsifier - whether planned
per-part commissioning costs the same or more credit per accepted asset - and that number
is measurable from job stores the project already keeps. Return when a part-list artifact
exists on the image side.

---

Second touch the same day, by a concurrent `/intake` run
([[../../sources/2026-09-07-rodin-worldgen]], a second-hand practitioner review of a
scene-generation release). The two runs were inside this golden path simultaneously and
neither board check saw the other: this run claimed the subject as
`game-production/sourcing-economics/image-to-3d-input-gating`, the other as
`game-production/asset-production/sourcing-economics/image-to-3d-input-gating`, and
`run-board check` compares subject strings. Both hunks survive; each landed under its own
name. The note above reads the two techniques correctly and the reading is worth keeping:
one cuts a **subject** into parts a generator can reconstruct, the other cuts a **frame**
into regions a gate can score.

Landed by the second run:

- `techniques/scene-partition-is-the-gated-unit.md` — the rubric this subject already named
  and declined. `single-subject-plain-background` closes with "Environment or scene
  reconstruction, where the whole frame is the subject and isolation is meaningless.
  Different problem, different rubric", and the capability arrived: one busy frame in,
  several meshes plus a background out. That declared absence is why the landing is a
  technique and not an amendment — a mechanism the subject names and does not carry.

  The load-bearing half is **not** per-region scoring. It is that neither gate in this
  subject's own design can see a missing object: the input gate scores regions that exist,
  the output gate grades meshes that came back, and an object no region selected produces
  neither, fails nothing, and is absent from a result whose every verdict is green — L12
  (`an-instrument-proves-it-had-input`) exactly. So area resolves to one of three states,
  region / backdrop / **residue**, residue is reported rather than implied, and the frame
  verdict is the **minimum** over regions plus a separate coverage line, never an average,
  because an average has no term for a thing that is missing.

  Two rules came from reading the subject rather than the source: **occlusion is this
  lane's frame-edge hard fail** — the same missing-volume evidence, unrecoverable by crop
  or re-extraction, and structurally impossible in the isolation rubric because an isolated
  subject cannot have it — and a region is **re-gated when it crosses the backdrop
  boundary**, because a verdict is bound to the content it judged and the two sides have
  different criteria.

- `applications/node--scene-partition-is-the-gated-unit.md` — `code` / `better` /
  `ab-paired`, and an honest half-case: the consumer generates one asset per submit and its
  input gate hard-codes "exactly one subject" into a prompt string, so only the residue rule
  had a seam. Measured in a packaging collector that already implemented the idea
  independently. A first arm chosen to falsify **refuted the hypothesis** — drifting the
  extension list was caught by 5 tests — and that failure produced the right arm: four real
  artifacts in unenumerated formats gave a byte-identical report and an all-green suite,
  because per-case coverage cannot reach a format nobody enumerated.

## State

7 -> 8 techniques, 1 -> 2 applications after both runs. Unplanned cross-run convergence
worth recording: the residue finding shares a root with
`conformance-checking/derived-expectation-needs-an-evidence-floor`, landed the same day from
an unrelated repository source by a third run.

Still open here, banked with anchors in the source note rather than landed: whether a
semantic layer added to an asset (physics, articulation) narrows its interchange set to the
one container whose schema can carry it — real, and its only clean home is outside
`game-production`.

## Architecture review - 2026-09-10

Read and assessed all 14 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/image-to-3d-input-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:157fba5a031e5fb0",
  "disposition": "reverify",
  "coverage": "All 14 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Pose tolerance is model-, rig- and task-specific. A requested back view should not fail a front-view criterion; reposing can create a usable reference when inferred content is declared and checked.",
    "A four-image ceiling and last-image behavior need a bound provider contract. Multi-view consistency can depend on calibrated views rather than identical framing; losing required coverage is not automatically repaired by falling back to one image.",
    "Rigid parts can share one weighted mesh, and seams can sometimes be planned across deformation regions. Evaluate downstream costs and multiplicity instead of treating late cuts as universally impossible."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/sourcing-economics/image-to-3d-input-gating/image-to-3d-input-gating.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "image-to-3d-input-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify universal model behavior, frontal-pose rules, reference ordering and the conflation of judge absence with spend permission. The score protocol is repaired; historical fail-open implementations remain explicit reverify work."
    },
    "techniques/canonical-pose-rule.md": {
      "disposition": "reverify",
      "reason": "Pose tolerance is model-, rig- and task-specific. A requested back view should not fail a front-view criterion; reposing can create a usable reference when inferred content is declared and checked."
    },
    "techniques/multi-view-master-reference.md": {
      "disposition": "reverify",
      "reason": "A four-image ceiling and last-image behavior need a bound provider contract. Multi-view consistency can depend on calibrated views rather than identical framing; losing required coverage is not automatically repaired by falling back to one image."
    },
    "techniques/part-cut-planning.md": {
      "disposition": "reverify",
      "reason": "Rigid parts can share one weighted mesh, and seams can sometimes be planned across deformation regions. Evaluate downstream costs and multiplicity instead of treating late cuts as universally impossible."
    },
    "techniques/reference-role-tagging.md": {
      "disposition": "reverify",
      "reason": "Role labels do not guarantee a model follows them. Compile roles into a supported API contract and check ordering, cardinality and conflicts; one image may legitimately inform several attributes."
    },
    "techniques/scene-partition-is-the-gated-unit.md": {
      "disposition": "reverify",
      "reason": "Overlapping or disconnected masks and occluded objects need more than a simple pixel partition. Missing required geometry cannot silently become backdrop; a zero-output attempt ran and failed, rather than proving no work occurred."
    },
    "techniques/score-defect-verdict-protocol.md": {
      "disposition": "clarify",
      "reason": "Repaired full response validation, identity binding and independent operational/content/spend states. A mandatory unavailable gate remains an unmet prerequisite unless an applicable authorized exception permits proceeding."
    },
    "techniques/single-subject-plain-background.md": {
      "disposition": "reverify",
      "reason": "Segmentation failure can be repaired by an independently checked matte; edge contact is not always clipping. Verify alpha support and distinguish generation risk from certain failure."
    },
    "techniques/text-is-never-geometry.md": {
      "disposition": "reverify",
      "reason": "Never across all models and future versions is unsupported. Explicit generated lettering can be tested against task requirements; overlays and decals have their own readability limits and reference-text roles."
    },
    "applications/node--part-cut-planning.md": {
      "disposition": "reverify",
      "reason": "The historical part-plan comparison was structural and its economic benefit remains a prediction. A @types/node version is not a runtime Node version witness; do not upgrade it to executed generation evidence. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--reference-role-tagging.md": {
      "disposition": "reverify",
      "reason": "The historical role-ordering implementation was not rerun. A video-reference example does not establish 3D-provider behavior, and published machine-specific roots should be removed. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--scene-partition-is-the-gated-unit.md": {
      "disposition": "reverify",
      "reason": "The historical packaging residue test was not rerun. Extension heuristics observe only their declared formats and can misclassify files; green enumerated tests do not prove complete scene coverage. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--single-subject-plain-background.md": {
      "disposition": "reverify",
      "reason": "The historical fail-open inputGateRefusal behavior violates a mandatory-gate spend prerequisite. Reinspect the consumer before claiming the repaired protocol is implemented; machine-specific roots also need removal. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--score-defect-verdict-protocol.md": {
      "disposition": "reverify",
      "reason": "The historical judge protocol was not rerun. A free-form verdict sentence and regex/clamped score do not establish complete schema validity; bind image versus clip evaluation and remove machine-specific roots. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all fourteen owned documents in full at the current bytes, plus the two prior
librarian entries above. The 2026-09-10 record immediately preceding this one was written
against documents that no longer exist; twelve of its fourteen decisions were `reverify`,
and re-reading the restored text does not support most of them. They are retracted
individually below rather than deleted.

**Retracted.** (1) `canonical-pose-rule` was marked reverify because "a requested back view
should not fail a front-view criterion". The decision rule already reads *turned more than
roughly fifteen degrees off frontal, **and no additional view is supplied**, fail*, and the
closing section exempts captured subjects with full multi-view coverage. The objection was
answered in the document. (2) `multi-view-master-reference` was marked reverify for needing
"a bound provider contract" behind a four-image ceiling. The document states three or four
as *the practical ceiling for generated assets* with a stated mechanism — each extra view
is another chance for the set to disagree — not as a provider limit. (3)
`node--single-subject-plain-background` was marked reverify on the grounds that its
`inputGateRefusal` behaviour "violates a mandatory-gate spend prerequisite". It does not:
`if (!outcome.ran || outcome.verdict !== 'fail') return null` is precisely the rule
`score-defect-verdict-protocol` states — an unavailable gate has measured nothing and
therefore cannot condemn — and the same route stamps the artifact *submitted ungated*. The
prior finding read the union backwards. (4) The blanket reverify across the applications
was justified by "the historical implementation was not rerun". Not re-running a consumer
checkout is a limit on this review, not a defect in the document; every one of these
applications carries an explicit `verified_on` and states its own deviations. Their dates
stand unrefreshed and their dispositions are `keep`.

**Findings that would justify a content change.** Two, both small and both real.

`applications/process--score-defect-verdict-protocol.md` describes the enforcement function
as refusing "only on `verdict !== 'fail'`, so a 5 or 6 generates". That quotes the *guard*
condition — the branch that returns no refusal — as though it were the refusal condition,
so the sentence says the opposite of the behaviour it goes on to describe correctly. The
sibling application quotes the same function's body and reaches the right reading, and the
two cite it at `input-gate.ts:141` and `:142`. One of the two line anchors has drifted.

The golden path states the assembly rule as fact — "later references are read as
refinements of earlier ones and **the last to speak on a property wins**" — while
`reference-role-tagging`, which owns the rule, hedges it to "tends to win". The whole
ordering argument, including the counter-intuitive master-last placement, rests on that
one model behaviour, and it is provider-dependent: an API that attends over all references
jointly has no "last". The technique's modality is the defensible one and the golden path
should not be stronger than the technique it delegates to.

`text-is-never-geometry` opens with a universal — "guaranteed to come back as noise, at any
budget, from any model" — which is stronger than anything measured. It is left as `keep`
rather than `clarify` because the document's own decision rule closes the gap in the same
breath: *never accept "the model has improved on text" without a measurement on your own
asset class*. The claim is bounded by its own falsifier, which is the corpus's standard.

**What I could not verify.** No consumer checkout was opened, no generation was run, no
provider behaviour was measured, and no vision judge was executed. The four Node/process
applications describe code in a tree this review did not read; their claims are recorded as
historical witnesses at their stated dates. What would settle them is re-reading
`src/lib/visual-gen/` and `src/lib/catalog/packaging/collect.ts` in the consuming repo at a
pinned commit and re-running the paired collector arm.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/image-to-3d-input-gating",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:507623277514832d",
  "disposition": "keep",
  "coverage": "All 14 owned documents read in full at current bytes, plus both prior librarian entries. Internal consistency, boundary conditions and the golden-path-to-technique delegation were assessed. Explicitly not evaluated: any consumer checkout, any executed generation, provider behaviour, judge latency or cost figures, and the historical measurements recorded in the four applications, whose verified_on dates are left untouched.",
  "counterexamples": [
    "Scene mode where two adjacent regions come back fused as one mesh: every declared inventory item resolved to a region, so the coverage check passes, and the three-state model (region / backdrop / residue) is about frame area and has no term for two regions returning one asset.",
    "A provider whose API attends over all supplied references jointly rather than sequentially: the assembly-order rule has no 'last to speak', and nothing in the subject lets a caller detect from outside which regime they are in.",
    "A generator that synthesises its own extra views after submission: multi-view-master-reference tells the caller never to gate a synthesised view as an independent observation, but the caller never sees these and has no gate to withhold."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/asset-production/sourcing-economics/image-to-3d-input-gating",
      "result": "Every owned document read as primary evidence for internal consistency and for the two inconsistencies recorded above. Established nothing about the external consumer code the applications cite, and nothing about current provider behaviour."
    }
  ],
  "documents": {
    "image-to-3d-input-gating.md": {
      "disposition": "clarify",
      "reason": "States the reference-assembly rule ('the last to speak on a property wins') more strongly than reference-role-tagging, which owns it and hedges to 'tends to win'. The master-last ordering rests entirely on that provider-dependent behaviour; the golden path should not exceed the technique's own modality. Everything else read clean, including the five criteria, the derived-severity argument and the three honest states."
    },
    "techniques/canonical-pose-rule.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The off-frontal rule is already conditioned on no additional view being supplied, non-rigged assets collapse to the silhouette rule, and captured multi-view subjects are exempted in 'when not to use this'. Face criteria are stated as specific reconstruction failures with a stated remedy."
    },
    "techniques/multi-view-master-reference.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. Three-to-four views is stated as a practical ceiling for generated assets with a mechanism (each added view is another chance for the set to disagree), not as a provider contract. Synthesised views are correctly refused the status of independent observation, and the set-level consistency criteria are each tied to a distinct reconstruction failure."
    },
    "techniques/part-cut-planning.md": {
      "disposition": "keep",
      "reason": "The four consumers (silhouette, binding, multiplicity, entanglement) each name a concrete downstream cost, and the multiplicity rule correctly separates distinct-part count from instance count. 'Re-cutting after generation is a regeneration, not a repair' is the load-bearing claim and it follows from the boundaries being inherited by the reconstruction."
    },
    "techniques/reference-role-tagging.md": {
      "disposition": "keep",
      "reason": "The colour/material split is argued from a stated mechanism (a lit reference teaches the model that a highlight is a colour), the role set is closed and declared, and the rule that a role must be rendered into the request text rather than tracked as metadata is the part most implementations miss."
    },
    "techniques/scene-partition-is-the-gated-unit.md": {
      "disposition": "keep",
      "reason": "The residue state and the minimum-not-average frame verdict are correct and well argued: an average has no term for a missing object. Bounded by the counterexample recorded above, which the document does not cover — two regions returning one fused mesh passes coverage."
    },
    "techniques/score-defect-verdict-protocol.md": {
      "disposition": "keep",
      "reason": "The three honest states, the closed defect vocabulary, the middle band and the rule that only a produced verdict may refuse a spend are internally consistent and each carry their reason. The re-basing rule (re-base thresholds in the same breath as the score) is the specific guard the sibling application later violates."
    },
    "techniques/single-subject-plain-background.md": {
      "disposition": "keep",
      "reason": "Six ordered steps each cheap enough to make the next unnecessary, a stated hard fail with its reason (nothing downstream restores truncated volume), and the distinction between 'plain' and 'simple'/'dark' that the naive reading collapses. The scene exemption correctly hands off to the partition rubric."
    },
    "techniques/text-is-never-geometry.md": {
      "disposition": "keep",
      "reason": "Opens with a universal stronger than anything measured ('at any budget, from any model'), but bounds it in its own decision rules: never accept a claimed improvement without a measurement on your own asset class. Claim plus stated falsifier is the corpus standard, so keep rather than clarify."
    },
    "applications/node--part-cut-planning.md": {
      "disposition": "keep",
      "reason": "Honest about its own status: applied: simulation, proof: structural-only, with case 3 explicitly predicting no difference and the falsifier named. The @types/node pin is stated as the witness for the runtime version and labelled as such rather than as an executed runtime. verified_on 2026-09-07 stands unrefreshed."
    },
    "applications/node--reference-role-tagging.md": {
      "disposition": "keep",
      "reason": "Records its own deviation (the style role bundles lighting and material, so the colour/material split lives in prose rather than in the vocabulary) and its own seam (the roles are shaped by a video flow, so the transplantable part is the shape, not the names). verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/node--scene-partition-is-the-gated-unit.md": {
      "disposition": "keep",
      "reason": "The strongest evidence in the subject: a paired measurement whose first arm refuted the hypothesis, and that refutation is what made the right arm legible. Correctly bounds its own claim to 'a reference I saw' rather than 'a reference I expected', and names the partition rules as untested for want of a partition. verified_on 2026-09-07 stands unrefreshed."
    },
    "applications/node--single-subject-plain-background.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The refusal function's early return on a non-running gate is the technique's own rule, not a fail-open violation, and both non-running states stamp the artifact submitted ungated. The zero-callers incident is the subject's canonical evidence for compiling-is-not-wiring. verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/process--score-defect-verdict-protocol.md": {
      "disposition": "clarify",
      "reason": "Describes the enforcement function as refusing 'only on verdict !== \"fail\"' — that is the guard that returns no refusal, quoted as if it were the refusal condition, so the sentence inverts the behaviour the rest of the paragraph describes correctly. The same function is cited here at input-gate.ts:141 and at :142 in the sibling application; one anchor has drifted. Both deviations it records (open defect vocabulary, middle band spends) are correctly held to the standard."
    }
  }
}
```
