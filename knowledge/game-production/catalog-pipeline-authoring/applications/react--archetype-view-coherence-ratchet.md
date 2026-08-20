---
layer: application
type: application
subject: catalog-pipeline-authoring
technique: archetype-view-coherence-ratchet
stack: react
status: forged
---

# `ARCHETYPE_VIEW_KINDS` — a ratchet derived from 344 live steps

PoF's catalog chassis is a Next.js/React lab surface (`/layout`) whose generic
`ArchetypeStep` renderer draws every step from a declarative `ViewDescriptor`. Nothing
structurally tied a step's `archetype` to the view kind it declared until
`src/lib/catalog/stepSpec.ts:81` introduced the coherence map.

## The declaration

```ts
export const ARCHETYPE_VIEW_KINDS: Record<ArchetypeId, readonly ViewKind[]> = {
  brief: ['prose'],
  schema: ['table'],
  balance: ['chart'],
  gallery: ['gallery'],
  rules: ['table', 'manifest'],
  checklist: ['checklist'],
  manifest: ['manifest'],
  graph: ['graph'],
  custom: ['manifest'],
};
```

The doc comment states the derivation directly: "DERIVED BY MEASUREMENT, not invented:
this is exactly the set of (archetype, view.kind) pairs the 344 registered steps use."

## Phase 1 — measure

The measurement produced the table the technique predicts. Seven of nine archetypes map
to exactly one view kind. One is genuinely two-shaped, and the map says so with the
counts inline: "`rules` is the one genuinely two-shaped archetype: 115 steps render a
row/record table, 11 render a manifest list (an enumeration of wired assets rather than
a rule grid)." And four steps diverged — 4 out of 344, ≈1.2%, squarely inside the
affordable zone.

## Phase 2 — correct, not grandfather

All four divergences were corrected, so the map shipped with **no exception list at
all**. Each was resolved by the payload-and-checker test rather than by the rendering
the author happened to pick:

- `character-pipeline`'s "Face Gate 2D" / "Face Gate 3D" were `checklist` + `table`;
  their `gate` payload is a flat record graded by `fieldsPopulated`, "which is the
  `schema` cohort's shape (11 other schema steps render exactly that), not a
  checklist's array."
- `codex` "Lore Body" was `schema` + `prose`, and `combat-map` "Ambient / Audio" was
  `rules` + `prose`; both write a single prose string graded by `minLength` — "the
  `brief` contract, which all 32 brief steps share."

The comment records the alternative that was rejected: the steps "were corrected to the
cohort whose payload shape and checker they already matched, rather than widening an
archetype to cover a one-off."

`custom` shows the escape-hatch rule applied: "`custom` is the bespoke escape hatch, but
all 5 of its steps are audio manifests today. A future custom step in another shape must
add its kind here — deliberately, with a reason — rather than the escape hatch silently
accepting anything."

## Phase 3 — ratchet

"This is a RATCHET. Widening an entry is a deliberate act: add the kind here together
with a one-line reason, so a new shape is a recorded decision rather than silent drift.
Never widen it merely to make a failing step pass."

Enforcement is rule (a2) of the fleet spec linter
(`src/__tests__/catalog/pipeline-spec-linter.test.ts`), a pure vitest walker with no dev
server that runs inside `npm run validate`. It reads the same constant the renderer
reads — `SUPPORTED_VIEW_KINDS` and `SUPPORTED_CHART_VARIANTS` at `stepSpec.ts:74`/`:56`
are documented as "the single source of truth" — so map, check and renderer cannot
disagree. Every failure names catalog / step / field.

## The field-coherence rules the same linter carries

`docs/catalog/AUTHORING.md` §2b — "Field coherence — Produce, View and Accept must name
the SAME fields (linted)" — is the triad rule enforced by execution rather than parsing:
the linter "discovers the fields a checker reads by running `accept()` over a recording
Proxy of the produce stub". It then enforces:

- every accept-field is written by `produce()` — except where the stub verdict is
  `deferred` (an L3/L4 gate legitimately reads what a live runner writes later);
- every `view.field` is written by `produce()` — except python-bridge steps whose fields
  arrive in the module's return envelope;
- **"the displayed data is the graded data"** — `accept` must read `view.field` itself,
  or grade a datum inside `data[view.field]`. `withinPercent` accepts a dot-path
  (`withinPercent('gpuBudget.gpuMs', …)`) so a balance step grades the exact bar it
  charts "instead of a duplicated top-level scalar".

The gallery-projection trap is pinned separately: a gallery step's `view.field` is the
selection field and "must never be the produced candidate ARRAY: selecting would
overwrite that array with a numeric index while acceptance graded a field no selection
ever touched (`character-pipeline`'s Concept 2D / 3D Generation / Icon 2D Art carried
exactly this bug; regression locked by
`src/__tests__/catalog/pipeline-gallery-projection.test.ts`)."

Two further linter rules extend the ratchet idea to other near-universals: rule (k) —
every `balance` step must compose ≥1 content invariant, because "a shape-only balance
step can never fail on a wrong number" — and rule 3 of the linter, "**Balance ⇒ chart**",
so a balance step cannot regress to a number-grid table. Rule (j) hollows out a step's
`wiringContract` and fails any step that still passes; all 137 existing contracts are
composed.
