---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: deliberately-overlapping-criteria
stack: node
status: forged
verified_on: 2026-09-02
---

# Two overlapping craft instruments, one of them structurally barred from the arithmetic

PoF — a Next.js/TypeScript content pipeline for a UE5 action-RPG — grades every produced
artifact twice, from two deliberately different framings, and resolves the double-counting
problem not by merging findings but by removing one framing from the grade entirely and
proving it with a test. Citations are against commit `9aa31407` (2026-09-02).

## The two framings, and how far they overlap

The **R-axis** is a strict model-as-judge rubric. `src/lib/judge/dimensions.ts` holds
`DIMENSIONS`, a per-deliverable-class dimension list; for `'2d-art'` (lines 63–70) the keys
are `silhouette`, `valueHierarchy`, `materialRendering`, `edgeQuality`, `styleCohesion` and
`cleanliness`, each with a positively-stated `bar` string. `src/lib/judge/rubrics.ts`
assembles them into the prompt (`dimensionBlock`, lines 91–100) under a strictness contract
whose reference standard comes from `STYLE_ANCHORS` (`dimensions.ts:44–53`).

The **A-axis** is a prose craft lens, one file per craft, in `src/lib/craft/lenses/`.
`2d-art.md` carries named benchmark anchors per level, eight sourced criteria and five
capped disqualifiers. Four of its criteria sit directly on top of R-axis dimensions:
`silhouette-readability` over `silhouette`, `value-structure-focal-hierarchy` over
`valueHierarchy`, `style-dna-consistency` over `styleCohesion`, and
`rendering-discipline-no-noise` over `edgeQuality`. Its first disqualifier — garbled
embedded text — is also inside the R-axis `cleanliness` bar ("no watermark, no text, no
extra subjects, no jpeg smear").

The framings are not paraphrases. The R-axis dimension asks for a 0–100 read of the
property; the A-axis criterion asks the same property against a named shipped reference,
with a stated check ("fill the image with flat black over the background") and a named
source. Where they disagree on an asset, the disagreement is the second look the technique
is about — and each axis carries criteria the other has no category for at all
(`icon-legibility-at-size`, with its 3:1 non-text-contrast floor, exists only on the A-axis;
`materialRendering` only on the R-axis).

## Where the double counting would have happened, and what stops it

Two things stop it, and only the second is a guarantee.

**The R-axis composition is weakest-dominates, not a weighted sum.** `rubrics.ts:97–98`
instructs: "The overall score is your holistic judgment (roughly the weakest-few dimensions
dominate — a single broken dimension caps the asset)." Under a minimum-like composition, a
defect seen by two dimensions moves the total exactly as far as a defect seen by one, so
intra-axis overlap costs nothing arithmetically. This is worth stealing: much of the cost the
technique warns about is an artifact of choosing a weighted mean.

**The A-axis cannot reach the grade at all.** `src/lib/craft/craftCell.ts` states it in its
header (lines 5–7: "display-only, post-hoc: nothing here touches grading") and again at lines
54–56: "Evidence only — nothing in `src/lib/catalog/acceptance/` or `statusModel` imports this
file, so it provably cannot move an R-grade." That is the corpus rule in its strongest
available form: overlap in the interrogation, and deduplicate in the arithmetic by giving one
framing no arithmetic to be in.

The proof is a source scan, not a convention. `src/__tests__/lib/craft/craftDisplayOnly.test.ts`
walks `src/lib/catalog/acceptance`, `src/lib/status/statusModel.ts` and
`src/lib/status/readiness.ts` and fails if any file matches
`/@\/lib\/craft\/|@\/lib\/status\/craft|craft-verdicts-db/` (lines 15–47). A second case at
lines 50–55 asserts those three paths exist, so the guard cannot pass by scanning nothing —
the vacuity check that makes a structural test worth having. Two sibling suites hold the same
line for the metering and history surfaces (`craftSpendMeter.test.ts:227`,
`craftVerdictHistory.test.ts:342`).

Routing keeps the overlap honest rather than accidental: `src/lib/craft/lens-map.ts` maps each
deliverable class to exactly one lens, complete by test, and restricts catalog overrides to
`TEXT_CLASSES` so that "a lens can never be dodged by re-labelling" (header comment, lines
5–8).

## Deviations from the standard

- **Findings are never merged by identity.** Both axes emit free-text findings —
  `rubrics.ts:106` requires `findings` of "2-4 sentences citing SPECIFIC visible/textual
  deficiencies" — and neither carries a structured location within the artifact. Step 2 of the
  technique's procedure is therefore not implemented: when both axes see the same defect, a
  producer reads it twice, worded differently, with nothing marking the two as one. The
  standard stays; the cheap first move here is a location field on a finding, since dedup
  degenerates into string matching without one.
- **The dedup is achieved by exclusion, not by merging.** Barring the A-axis from grading is a
  complete answer to double counting and a partial answer to the technique: the second
  framing's findings never contribute to any grade, including where they are the only framing
  that saw the defect. That is a deliberate, argued trade in this tree — the A-axis is young
  and ungated by design — but it means an A-axis-only defect has no path to a verdict, which is
  the coverage cost of the arrangement rather than a benefit of it.
- **No pilot-based merge test.** Nothing compares the two framings' findings across a fixture
  set to distinguish designed overlap from duplication, so the four overlapping pairs are
  asserted by authoring rather than measured.
