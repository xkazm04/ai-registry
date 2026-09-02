---
layer: application
type: application
subject: gameplay-runtime-patterns
technique: allocation-discipline-in-the-hot-path
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# A profiling triage engine that ranks per-step cost, and a transpiler that derives the per-step opt-in

Read against a Next.js game-development assistant (`pof`) at commit `9aa31407`, running on
Node 24, which drives Unreal Engine 5.8 through generated C++ and headless Python. Two
places in that tree realize parts of this technique, and the pair is instructive because one
of them derives its numbers from a real profile and the other synthesizes them, and both
land in the same ranked list.

## The per-step opt-in, derived rather than defaulted

`src/lib/blueprint-cpp-codegen.ts:346-348` emits the constructor of a transpiled class and
decides its per-step participation from the graph it is porting:

```ts
const tickField = isComponent ? 'PrimaryComponentTick' : 'PrimaryActorTick';
const ticks = overrides.some((o) => o.override.name === 'Tick' || o.override.name === 'TickComponent');
sourceLines.push(`\t${tickField}.bCanEverTick = ${ticks ? 'true' : 'false'};`);
```

This is the technique's cheapest rule in three lines. The per-step slot is *false unless the
source graph contains a per-step override* — the force is read out of the input and the
absence of the force leaves the no-cost shape in place. The comment above it (line 344)
records the adjacent engine trap: a component's tick field is named differently from an
actor's, and naming the wrong one is a compile error rather than a silent one. The rule
generalizes past this codebase: wherever a platform lets a participant declare that it runs
every step, derive the declaration and never inherit a template's default, because the cost
scales with the content and nothing in the build will report it.

## The triage engine: measured tick cost, ranked

`src/lib/profiling/triage-engine.ts` (440 lines) consumes a `ProfilingSession` and returns
ranked findings with fix prompts. `analyzeTickFrequencies` (line 58) is measurement-driven
in the way this technique asks for:

- **A materiality floor, stated.** Line 66: `if (actor.totalTickMs < 0.1) continue;` — a
  contributor under a tenth of a millisecond is not reported. The floor is a number with a
  unit, and it keeps the finding list actionable rather than exhaustive.
- **Savings derived from the profile.** Line 75 computes
  `actor.totalTickMs * (1 - suggestedHz / actor.tickFrequencyHz)` — the saving is a function
  of the *measured* per-step cost and the proposed frequency, not a constant.
- **Priority from the saving, not from the category.** Line 78 buckets `critical` above
  1 ms, `high` above 0.3 ms.
- **The fix prompt carries the measurement.** Line 84 embeds the saving and the instance
  count in the text handed to the code author, so the author receives the budget rather than
  a bare instruction — a limit that shapes the output rather than merely capping it.

## Pooling candidacy, and three deviations

`analyzePoolingCandidates` (line 357) is where the same file falls short of the standard, in
three ways worth recording because each is easy to reproduce elsewhere.

**Candidacy is a name test, not a churn test.** Lines 360-367 select actors by
`instanceCount > 10` and a `className.includes(...)` match against `Projectile`, `VFX`,
`DamageNumber`, `WorldItem`. Instance count is a proxy for population, not for churn, and a
class-name substring is a proxy for both. A heavily-churned class named something else is
never proposed; a `Projectile` subclass spawned once per level and never destroyed is. The
technique's entry condition is create-and-destroy frequency at step rate with a boundable
population, and the session type carries no create/destroy rate to test it against — so the
check is the closest available proxy rather than the condition itself.

**The saving is synthesized and shares a field with measured ones.** Line 376 is
`estimatedSavingsMs: round2(actor.instanceCount * 0.02)` — a per-instance constant, not a
profile reading. Line 41 then sorts every finding by `estimatedSavingsMs` descending, so a
figure invented from a constant is ranked directly against a figure derived from
`totalTickMs`. Nothing in `PerformanceFinding` distinguishes the two. Thirty instances
produce a confident `0.6 ms` that no instrument observed, and it can outrank a measured
0.4 ms. The standard stands: a measured saving and an estimated one are different epistemic
objects and must be separately labelled if they are to share a ranking.

**The reset obligation is absent from the fix prompt.** Line 378 instructs the author to
build a pool that "hides and disables tick on return, shows and enables on acquire", naming
the visibility, collision and tick calls and the auto-grow policy — but never says
*reinitialise the instance's own state on acquire*. That omission is precisely the ghost
this technique names: a recycled projectile that still holds its previous owner, or an effect
that resumes mid-timeline. The prompt is otherwise good — it states a ceiling
(`Math.min(instanceCount * 2, 100)`) and a growth policy, which is more than most pooling
guidance does — so a single added clause would close it.

## The gap this pair exposes

Both of these fire *after* the code exists: the transpiler derives one switch, and the triage
engine reports on a profile taken from a running build. Nothing in the tree's generation-time
briefing constrains runtime shape. The engine-trap corpus at
`src/lib/knowledge/ue-gotchas.ts` (508 lines) is entirely platform behaviour — import paths,
material pin names, headless-mode inertness — with a single entry touching per-step cost
(capping effect-system instances, noting that hidden systems still consume the step). The
prompt builder at `src/lib/prompts/prompt-builder.ts:167` exposes a `withBestPractices`
slot and twelve recipes fill it (`src/lib/catalog/recipe.ts:136-491`), but every pack is an
*agreement* constraint — which base class to extend, which tags are mandatory, which content
path to write to, which authoring mode to use. `GAS_BEST_PRACTICES` (line 136) is seven such
rules and not one of them concerns runtime shape or per-step cost. Several module prompts go
further and *prescribe* a notification mechanism by name without stating a force —
`src/lib/prompts/menu-flow.ts:108` asks for four named delegates on screen changes, and
`src/lib/prompts/level-design.ts:280` for four more on zone transitions. That is the brief's
vocabulary choosing the architecture, which is the failure this subject names.

The one place the tree does apply a generation-time budget is file size:
`.claude/rules/catalog-pipeline.md:19` caps generated files at 200 lines and requires a split
above it. That is the right instinct applied to the wrong axis — it bounds how much code
arrives, not what shape it takes, and a 200-line unnecessary event queue passes it.
