---
subject: image-to-3d-input-gating
domain: game-production
last_touched: 2026-09-07
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
