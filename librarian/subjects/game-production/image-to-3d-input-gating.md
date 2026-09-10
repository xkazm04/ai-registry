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
