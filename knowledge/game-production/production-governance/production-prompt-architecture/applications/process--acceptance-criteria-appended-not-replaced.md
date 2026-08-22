---
layer: application
type: application
subject: production-prompt-architecture
technique: acceptance-criteria-appended-not-replaced
stack: process
status: forged
verified_on: 2026-08-20
---

# Getting the wiring contract and the authored criteria into the produce prompt

Source: `src/lib/catalog/contractPrompt.ts` and `src/lib/prompts/prompt-builder.ts` in the
PoF repo. The pipeline drives Claude Code through catalog steps that produce Unreal Engine
artifacts, then grades them with an acceptance checker.

## The gap that was closed

`contractPrompt.ts:9` states it plainly:

> The fleet authored 137+ `wiringContract` blocks and a pile of per-step `criteria` objects
> inside the pipelines' produce bodies. Until this module they were read by exactly ONE
> consumer — the acceptance checker (`wiringCheckers.ts`) — so every produce prompt asked a
> CLI to author an artifact WITHOUT telling it the contract the artifact would then be
> graded against.

One authored source, one reader, and the reader was the grader. The producer was being
measured against a written standard it had never seen — the exact failure the technique
exists to prevent.

## Injection only, and shared by three drive paths

The extraction is deliberately powerless (`contractPrompt.ts:26`): *"It is INJECTION ONLY.
Nothing here re-derives, re-validates or grades a contract — no acceptance verdict can move
because of this file."* That is the non-authoritative property stated as a design rule in the
module that could most easily have violated it.

Three consumers share it so the prompt is identical wherever a step is driven —
`ArchetypeStep.buildPrompt` (the ~330 generic lab steps), `recipeBuilder` in `recipe.ts`
(headless four-phase recipes), and `stepRecipe` in `headless.ts` (the MCP/API path). The
sibling routing table `src/lib/catalog/canon/archetypeCanon.ts:3` follows the same rule for
which canon categories prefix each archetype's produce prompt (`brief: ['game']`,
`gallery: ['art','game']`, `schema: ['project','game']`), and says so: *"Edit here, not in
either consumer."*

## The bar, stated to the producer

`CONTRACT_RULE` (`contractPrompt.ts:136`) hands the producer the checker's rejection rules
rather than an aspiration:

> Reproduce these four wiring fields on the artifact you write (`wiringContract`). The L2
> checker rejects a placeholder ("TBD"/"TODO"/"n/a"), any claim under `MIN_PROSE` (12) characters,
> and a `verification` line that names no acceptance tier (L0–L4). Name the REAL registration
> + trigger site.

`stepContractBlock()` heads the block `# ACCEPTANCE CONTRACT FOR THIS STEP (you are graded
against it)` and renders each undeclared field as `(undeclared — name it)` rather than as a
blank — a gap phrased as an instruction.

## Caps and honest elision

`MAX_CLAIM_CHARS = 220`, `MAX_STEP_CONTRACT_CHARS = 2400`, `MAX_CATALOG_CONTRACT_ROWS = 24`,
`MAX_CRITERIA_LINES = 12`, `MAX_WALK_DEPTH = 4`. Whole blocks are kept while they fit and the
remainder is reported in the prompt: `_(N further contract block(s) omitted — prompt size
cap.)_`. The caps are *"asserted by `src/__tests__/lib/catalog/contractPrompt.test.ts`
against the LIVE registry, so a newly authored contract can never quietly blow up every
prompt in the app."*

## The append incident

`PromptBuilder.addSuccessCriteria()` (`prompt-builder.ts:219`) exists because the set
operation silently ate a baseline. Its own comment is the incident report:

> `withSuccessCriteria` REPLACES the section, which silently dropped criteria a shared
> builder had already seeded (the catalog recipes seed each step with the pipeline's authored
> acceptance criteria, then the `verify` phase adds its own functional-test line). Use this
> whenever you are adding to, not defining, the section.

## Deviation worth naming

`addSuccessCriteria` implements append by splitting the already-rendered section back into
lines and stripping the `^\d+\.\s*` numbering before re-rendering. It works, and it is the
fragile form the technique warns against: the criteria should stay a list of items until
render, so that composition never depends on parsing output. The standard does not lower —
round-tripping rendered text is how the next silent drop will happen.
