---
layer: application
type: application
subject: prompt-fitness-and-evolution
technique: join-judge-verdicts-to-prompt-version
stack: node
status: forged
verified_on: 2026-08-20
---

# The fitness join in a server-side artifact pipeline

Realized in the PoF codebase (`src/lib/prompt-evolution/judge-fitness.ts`), which joins the
judge fleet's verdicts back to the prompt version that produced each artifact. Before this
module existed the two halves were both present and never read together, so "did the quality
pack revision help?" had no answer at all.

## The join, concretely

```
judge_verdicts (catalogId, entityId, step)
  → pipeline_artifacts (same key)
    → data._provenance.promptVersion
```

`joinKey()` (`judge-fitness.ts:37`) composes the three-part key with a NUL separator so that
both tables key identically — the join is a map lookup on a recorded stamp, never an
inference from timestamps. `aggregateFitness()` (`:105`) is parameterised by
`bucketOf: (p: Provenance) => string | undefined`, which is what lets one implementation
serve both `computeVersionFitness` (bucket = `promptVersion`, `:73`) and
`computeVariantFitness` (bucket = `promptVariantId`, `:91`).

Artifacts with no `_provenance.promptVersion` are skipped outright (`:115-117`): produced
before the stamp existed, they belong to no known version, and guessing one attributes
someone else's score to a pack that never ran. Verdicts whose join key resolves to no version
are skipped symmetrically (`:130`).

## Unjudged is null, in the returned shape

```ts
avgScore: verdicts > 0 ? (scoreSum.get(bucket) ?? 0) / verdicts : null,
passRate: verdicts > 0 ? (passCount.get(bucket) ?? 0) / verdicts : null,
```

(`judge-fitness.ts:150-152`.) The module docstring states the rule as an honesty rule: "An
unjudged prompt is unknown, not bad, and rendering it as a zero-height bar would invent a
failure the judges never found." The returned record carries `producedArtifacts`,
`judgedArtifacts` and `verdicts` alongside the two nullable aggregates, so the denominator
travels with the mean and the UI cannot render a bar without also being able to render the
coverage.

Note `verdicts` and `judgedArtifacts` are deliberately different counts — one artifact may be
scored by several judges, so the mean is over verdicts while coverage is over distinct
artifacts. Two units, two fields, neither reused for the other.

## Fixture exclusion, placed so it cannot drift

`isSyntheticEntity(entityId)` (from `src/lib/status/statusModel.ts`) drops fixture rows on
*both* sides of the join (`:114` for artifacts, `:127` for verdicts). The placement is the
design decision: the filter lives inside `aggregateFitness`, not in the two DB-backed entry
points `getPromptVersionFitness` / `getPromptVariantFitness` (`:158`, `:163`), so a caller
feeding the pure functions by hand cannot produce a different number from the one the app
renders — one authority per quantity.

The measurement that forced this, from the module docstring, taken against the real database
on 2026-08-19: version `q1` reported 780 produced artifacts of which **342 (43.8%) were
synthetic**, while `q2` reported 7 of which 0 were. The harness only ever exercised one arm,
so the contamination was not just large but entirely one-sided — fixture volume was being
rendered as productivity on the one surface that answers whether prompts are improving.

## Stamping, and the two traps it avoids

`stampPromptVersion(data, promptVersion?, promptVariantId?)` (`:48`) merges into
`_provenance` rather than overwriting it, and:

- **An explicit version wins over the pack version currently in effect** — a replay or drain
  reports the version its artifact was really produced under, instead of relabelling history
  as the present.
- **`'static'` is not a variant.** A run using the registry/recipe prompt gets no
  `promptVariantId`; inventing one "would attribute scores to an experiment that never ran".
  Those artifacts still count toward version fitness, which is a different bucket.

## Where the contamination lived

The trap this subject warns about is documented in `src/lib/judge/rubrics.ts:25`, in the v4
rubric note: `produceDirection` put the full ~5.7k-character generation prompt *inside* the
judged payload for **240/816 artifacts**, while the rubric penalises leaked prompt tokens; a
second defect emitted sibling context as scalars only, so **314/816** steps projected empty
and the judge condemned real cross-references as invented. Measured on a 21-cell A/B, median
of 3 per arm: control **+0.4** (sd 3.1), contaminated **+16.9**, blind-siblings **+4.3**.

The response is the rule this subject asks for: `RUBRIC_VERSION` was bumped to 4 even though
"the contract TEXT is unchanged — the INPUT is", making every v3 verdict provisional until
re-judged. `newestRubricVerdicts()` (`rubrics.ts:52`) is the single supersession filter both
the acceptance bridge and the `/status` grader apply, so the two consumers cannot diverge on
which verdicts speak for a step.
