---
layer: application
type: application
subject: catalog-pipeline-authoring
technique: step-archetype-taxonomy
stack: process
status: forged
verified_on: 2026-08-20
---

# The row-authoring recipe in PoF (`docs/catalog/AUTHORING.md`)

PoF is an ARPG built in Unreal Engine 5 whose content is authored through a "catalog
pipeline" chassis: 32 self-registering pipelines in `src/lib/catalog/pipelines/`, ~344
steps total, all rendered by one generic step renderer. `docs/catalog/AUTHORING.md` is
the hand-written recipe a CLI session follows to add a new content class. It is the
methodology realization of the taxonomy technique.

## The closed vocabulary as declared

`src/lib/catalog/stepSpec.ts:37`:

```ts
export type ArchetypeId =
  | 'brief' | 'schema' | 'balance' | 'gallery' | 'rules' | 'checklist' | 'manifest' | 'graph' | 'custom';
```

Nine members, one escape hatch. `AUTHORING.md` states what the archetype drives: "It
drives both the generic `ArchetypeStep` View AND which **canon** categories inject
(brief→game; schema/rules/balance→project+game; gallery→art+game; checklist/manifest→
project; graph→game+project)." So the kind is not a tag — it selects the domain context
injected into the Produce prompt. `docs/catalog/PIPELINE_REVIEW.md` holds the ~22 named
step archetypes and the recommended sequence per row; `ArchetypeId` is the smaller set
those sequences render through.

## Corrective language per kind, not per step

`src/components/layout-lab/steps/shared/genericFixCopy.ts:17` authors exactly nine
`{ noun, act }` blocks — one per archetype — and states the sizing argument verbatim:

> Why per archetype rather than per step: the archetype IS the deliverable contract (a
> `balance` step owes a number inside a band; a `gallery` step owes a selected
> candidate), and it is the largest unit that can carry a real, specific instruction
> WITHOUT inventing catalog content. These 9 authored blocks cover all ~344 steps;
> hand-writing 344 bespoke ones would mean inventing target values no checker stated.

That is step 3 of the technique's procedure — "give each member a corrective sentence" —
realized as a table, and it is the sharpest evidence that the nine members are real
members: each one has a distinct, non-inventing instruction.

## Text-eligible kinds are declared, not inferred

`src/components/layout-lab/labProduceMode.ts:24`:

```ts
export const CLI_ELIGIBLE_ARCHETYPES: readonly ArchetypeId[] = ['brief', 'graph', 'rules'];
```

with the rationale inline: generative galleries, UE packaging and balance math "are
produced by other engines (Leonardo/Tripo, the gate drain, deterministic code), so
routing them through a text CLI would overclaim." Three of nine kinds are text
deliverables; the rest are barred from the text-author path by declaration.

## The identifier is the filename because identifiers are persistence keys

`AUTHORING.md` step 2: create `src/lib/catalog/pipelines/<catalogId>.ts` — "**The
filename IS the catalogId**, so a catalog id in `pipeline_artifacts` (or a /status cell)
leads straight to the file that declares it". Pinned by
`src/__tests__/catalog/pipeline-filename-parity.test.ts`, with the tie-break stated
explicitly: "If the two ever disagree, rename the **file** — catalog ids are persisted
in the database and must never change." Step 1 warns that a wrong id registers the
pipeline but renders nothing, because it will not match the catalog's seeded entities.

Each pipeline file opens with a compressed design brief for its content class. Read
`items.ts:21` (affix→gameplay-effect law, `requiredLevel ≈ ilvl − (5..15)`, base weapon
DPS formula), `bestiary.ts:15` (difficulty from rarity + modifiers, never stat
inflation; ability links to real spellbook ids), `materials.ts:16` ("reuse over
re-author" — every surface is an instance over one master, three required maps),
`vfx.ts:13` (3 LOD tiers, peak GPU ≤ ~0.48 ms of a 0.8 ms per-class budget — 60%
consumed, 40% headroom), `character-pipeline.ts:16` (the concept→gate→image-to-3D→gate→
rig→import→wire→convert workflow, "Gates are the moat: EVERY generative step is
verified by close-up renders BEFORE the next credit spend").

## Capability-vs-adoption drift, measured

`docs/catalog/E2E-COVERAGE.md` names the failure the technique's adoption rule targets:
"the shared `ChartPanel` shipped four variants but the fleet declared exactly one chart;
the keyed-manifest table silently soft-failed; the histogram variant was never used.
Each such gap was a dead capability nothing guarded." The fleet spec linter
(`src/__tests__/catalog/pipeline-spec-linter.test.ts`) now checks declared variants
against `SUPPORTED_CHART_VARIANTS` (`stepSpec.ts:56`), turning the next such gap into a
red `npm run validate`.

## The retired member and its post-mortem

`stepSpec.ts:137` marks `StepSpec.copy` **RETIRED — do not author**, enforced by linter
rule (l). The reasoning is the signature argument: `copy` is handed only the artifact
`data`, never the graded `AcceptanceResult`, so authored copy "structurally cannot name
the checker's status or its own `reason`, while the derived fallback always does".
Authoring it "either makes a step's banner strictly LESS honest than the fallback it
replaces, or duplicates the checker's cause-derivation in a second place that can drift".
Zero of the registered steps ever used it.

The contrast that makes the rule a rule sits ten lines below, at `stepSpec.ts:190`:
`defaultDirection` is **KEPT** at the same zero uses, "and the distinction is the
signature: this is a plain string a step author writes deliberately, not a callback that
must reason about a verdict it cannot see." With the explicit warning: "Do not mass-author
placeholder directions to 'adopt' it — a fabricated house instruction is worse than the
derived one."

## Packaging exemption, in the recipe

`AUTHORING.md` step 5b — "Packaging: own a step, or declare the exemption — there is no
third state" — names both live exemptions: `player-movement` writes its assets straight
into the Content tree from the editor thread; `character-pipeline` is a cross-project
workflow recipe. Both carry a prose reason on `registerCatalogPipeline`
(`character-pipeline.ts:34`, `player-movement.ts:23`), and
`src/__tests__/catalog/packaging-coverage.test.ts` fails any pipeline with neither.
`character-pipeline`'s reason ends with the revisit condition: "Revisit if this catalog
ever lands assets in the PoF Content tree."
