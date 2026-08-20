---
layer: application
type: application
subject: design-canon-as-executable-law
technique: canon-as-single-source-of-thresholds
stack: process
status: forged
---

# The canon corpus and its scoping, in the PoF catalog pipeline

PoF (an Unreal-engine ARPG whose content is authored through an LLM-driven catalog
pipeline) keeps its entire design canon as one exported array of rule objects, and every
threshold enforced anywhere in the project is read out of it.

## The corpus

`src/lib/catalog/canon/canon-seed.ts:3` exports `CANON_SEED: ProjectRule[]` — sixty-odd
rules at the time of writing, added in dated waves (`Wave 1 (2026-05-26): Quests /
Character / Vendor / VFX / Input / Tutorial`, `Wave 2: factions + dialog-trees`, and so
on). The entry shape is defined at `src/lib/catalog/canon/types.ts`:

```ts
export type RuleCategory = 'art' | 'game' | 'project';

export interface ProjectRule {
  id: string;
  category: RuleCategory;
  /** 'global' (applies everywhere) or a specific catalogId. */
  scope: string;
  title: string;
  body: string;
  refs?: string[];
  updatedAt?: string;
}
```

Three fields carry the weight:

- **`id`** is what every violation cites. `proj-economy`, `arpg-resists`,
  `arpg-defenses`, `arpg-leveling`, `proj-balance` are the five ids the balance linter
  resolves; each appears verbatim in the `lawId` field of every violation it emits.
- **`scope`** is either `'global'` or a catalog id — `scope: 'currencies'` on
  `proj-economy`, `scope: 'status-effects'` on `arpg-ailments`, `scope: 'items'` on
  `arpg-item-level`. This is what makes a sixty-rule corpus usable: a status-effect step
  is not handed the vendor margin law.
- **`body`** carries the numbers in prose, and nowhere else. `proj-balance`'s body is
  literally `'Tier power target ≈ 100 (±10%). Price/power ratio 0.8–1.2×. Document any
  intentional outlier.'` There is no `threshold:` field beside it. Every consumer of
  100, 10, 0.8 and 1.2 parses that sentence.

`refs` points back at the long-form document — `refs: ['docs/catalog/ARPG-LAWS.md#3']` on
the damage-model rule — so the seed entry is the operative law and the document is the
essay behind it, not a second copy of the numbers.

## Sanctioned exceptions live in the rule body

`vendor-laws` is the clearest instance of a rule that states its own exception rather than
leaving the checker to discover it:

> The 30% margin target (±20% band → 24–36%) applies to PRE-DISCOUNT list prices … The
> faction reputation discount (per faction-rep-model: linear 0–20% off repTier, no custom
> curves) is a SANCTIONED exception applied AFTER margin — the post-discount effective
> margin may legitimately fall below the band and that is not a violation.

The exception, its basis (pre-discount), its ordering (after margin), and the cross-rule
it derives from are all in the sentence a designer reads. A checker written against this
needs no special case; a checker written against a bare "margin sits in 24–36%" would
have grown one, in code, invisibly.

## Scoping at authoring time

The corollary of L4 — that the rule an artifact will be graded by is visible to whoever
authors the number — is implemented as a two-line function at
`src/lib/catalog/contractPrompt.ts:213`:

```ts
export function canonCategoriesForStep(spec: StepSpec): RuleCategory[] | undefined {
  return isContentInvariant(spec.accept) ? undefined : ARCHETYPE_CANON[spec.archetype];
}
```

The comment above it states the reasoning exactly:

> A step whose checker is a CONTENT INVARIANT (`isContentInvariant` — a wrong NUMBER fails
> it) is graded against real thresholds, so it gets the FULL in-scope canon (`undefined` =
> no category filter) instead of only its archetype's slice: the threshold it will be
> measured by — tier power ≈100 ±10%, resists capped at 75%, faucet/sink within ±15% —
> must be visible in the prompt that authors the number. Shape-only steps keep the
> narrower `ARCHETYPE_CANON` slice (no token cost added).

This is the marking from `shape-check-vs-content-invariant` doing double duty: the same
predicate that decides what a result may claim decides what context the producing step
receives.

The archetype-to-category map is at `src/lib/catalog/canon/archetypeCanon.ts:3`:

```ts
export const ARCHETYPE_CANON: Record<string, RuleCategory[]> = {
  brief: ['game'],
  schema: ['project', 'game'],
  rules: ['project', 'game'],
  balance: ['project', 'game'],
  gallery: ['art', 'game'],
  checklist: ['project'],
  manifest: ['project'],
  graph: ['game', 'project'],
};
```

Two properties worth copying. First, its header states that it is **shared by the UI
`ArchetypeStep` (client) and the headless recipe builder (`src/lib/catalog/recipe.ts`,
server) so the prompt context is IDENTICAL whether a step is driven from the `/layout` lab
or the pof-mcp layer** — one mapping, two surfaces, no divergence between what the
interactive tool shows an author and what the batch runner shows a model. Second, an
archetype absent from the record yields `undefined`, which the caller treats as *no
category filter* — the unknown case fails toward the **full** canon rather than an empty
slice. The safe direction costs tokens; the unsafe one would author a new content type
with no rules in front of it.

## The one deviation

The standard says one parse layer, imported everywhere. PoF has two independent
extractions over the same rule bodies: `readCanonThresholds` in
`src/lib/balance/canon-conformance.ts:53` and the module-load block at
`src/lib/catalog/acceptance/invariants.ts:20`. Both read `proj-balance`, `proj-economy`
and `arpg-leveling`, with different patterns — the first uses literal decimal shapes
(`/(\d+\.\d+)\s*[–-]\s*\d+\.\d+\s*×/`), the second uses non-digit runs
(`/Price\/power ratio\D*([\d.]+)\D+?([\d.]+)/`). The source is single; the *reading* of it
is not, and the two readers already differ in robustness — a rewording that swaps the
en-dash would break one and not the other. The standard is unchanged: extract once, export
named constants, and let the second consumer import them.
