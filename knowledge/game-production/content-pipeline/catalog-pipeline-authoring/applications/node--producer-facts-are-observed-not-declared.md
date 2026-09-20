---
layer: application
type: application
subject: catalog-pipeline-authoring
technique: producer-facts-are-observed-not-declared
stack: node
status: forged
verified_on: 2026-09-20
verified_against: node@24
---

# Three producer facts in PoF's step catalog

PoF's catalog registers 344 `produce:` step bodies across 33 pipeline files under
`src/lib/catalog/pipelines/` (re-counted 2026-09-20). Three separate changes in
September 2026 hit the same wall from three directions, and the technique is what
they have in common.

| Fact about a producer | Cheap answer | What PoF observes instead |
|---|---|---|
| does this body read the operator's direction? | `StepSpec.readsDirection` on all 344 specs | arity probe of `spec.produce` |
| which engine made this artifact? | `data._provenance.engine` from the poster | stamped server-side by the route that dispatched |
| which engine makes this step? | `inferEngine` guessing from the label | `StepSpec.engine` where the code reads unambiguously |

## 1. The arity probe (`cb0b2f09`, 2026-09-04)

`src/lib/catalog/stepSpec.ts` ends with three lines that replace a 344-row
authoring campaign:

```ts
export function readsDirection(spec: Pick<StepSpec, 'produce' | 'readsDirection'>): boolean {
  if (typeof spec.readsDirection === 'boolean') return spec.readsDirection;
  return spec.produce.length >= 2;
}
```

The header states the direction of derivation as the reason for the design: "The
default is an ARITY PROBE of the body itself, deliberately: the alternative — a flag
on all 344 specs — is a claim ABOUT the body that can rot out of step with it, and
the probe reads the code."

The override `StepSpec.readsDirection` exists only for the probe's blind spot — a
body taking `(entity, ...args)`, a defaulted parameter, or `arguments` — and its own
doc comment closes the loop: "This is a claim about code the linter cannot see; do
not author it to silence a warning."

**The withheld button.** `src/components/layout-lab/steps/ArchetypeStep.tsx`
classifies the offered corrective run as a pure function before rendering it:

```ts
export function fixEffectOf(input: { isGallery; produced; readsDir; liveDispatch }): FixEffect {
  if (input.isGallery) return 'reroll';
  if (!input.produced) return 'first-produce';
  if (input.liveDispatch) return 'live-produce';
  return input.readsDir ? 'first-produce' : 'no-op';
}
```

Only `no-op` loses the control; the cases that do work (never-produced, gallery
re-roll, live dispatch) are pinned by `ArchetypeStepFixNoop.test.tsx`. In its place
`noopFixSuggestion` says what *would* change the step — turn on live produce where
the archetype is CLI-eligible, otherwise author the body to read its `direction` —
and still prints the derived direction, "as an input to carry elsewhere, not as an
imminent action". Before the change the button was offered on every non-deferred
step, and on an already-produced static step it re-wrote byte-identical data while
the banner previewed the corrective direction verbatim.

**The ratchet.** `src/__tests__/catalog/pipeline-spec-linter.test.ts` rule (p)
carries `DIRECTION_BLIND_CEILING` per archetype with a reason on every entry —
brief 34, rules 126, gallery 47, checklist 61, manifest 35, balance 16, schema 14,
graph 6, custom 5 = 344, the whole fleet — plus a second test asserting no ceiling
is slack. The count may only fall, and wiring direction into the 344 bodies was an
explicit non-goal of the change that declared it.

## 2. The engine stamp and its trust boundary (`7c7b7872`, 2026-09-04)

`data._provenance` had been designed, typed, documented and read by the Evidence
modal, and never written: the commit re-measured 805 of 817 rows carrying
`engine:'unknown'` and the other 12 carrying no stamp at all.

`src/lib/provenance.ts` states the allow-list and the reason:

```ts
export const CLIENT_DECLARABLE_ENGINES = ['Code'] as const;
```

with the header — "`Code` is the only honest one: it says 'a deterministic produce
body in this app wrote this', which is a claim about the caller itself and costs
nothing to fake because it asserts no external work. Everything else — `Claude`,
`Leonardo`, `Tripo`, `ElevenLabs` — is an attestation that a paid/remote engine RAN,
and only the server that ran it may make it."

`resolvePersistedEngine` is the four-state resolution, pure and total: a `declared`
value inside the allow-list is taken; a `claimed` value found in the submitted
`data._provenance` is taken if it is in the allow-list; a claim **equal to what the
server already recorded on that row** is kept (the lab re-POSTs what
`POST /api/one-shot/step` persisted after a live CLI produce, and "a DIFFERENT claim
never launders through a prior record"); anything else becomes `UNKNOWN_ENGINE`.

The refuse/downgrade asymmetry is deliberate and visible in the two files:
`src/lib/catalog/artifact-validation.ts` makes the top-level field
`engine: z.enum(CLIENT_DECLARABLE_ENGINES).optional()`, so an explicit `Claude` is a
400 naming the field, while the same claim smuggled inside `data._provenance` is
downgraded to `unknown` by the route
(`src/app/api/pipeline-artifacts/route.ts`) rather than rejecting the artifact.

The stamping side: `POST /api/one-shot/step` stamps `Claude` with the model and
effort **it already resolved two lines earlier** — `claudeProvenance` in
`src/lib/model-policy.ts` accepts an already-resolved choice rather than
re-deriving one, "so the stamp records the model that actually ran; an unpinned
dispatch omits model/effort rather than inventing a pin".

Two supporting rules land in the same change. `UNKNOWN_ENGINE` is documented as "a
STATED absence, not a producer", and `src/components/status/EvidenceModal.tsx`
renders it through the shared `describeProducer` as "producer: not recorded", never
as a producer named unknown. And a test pins `_provenance` inside the content hash's
volatile keys, so stamping or changing an engine leaves `stepContentHash`
byte-identical — the stamp can neither move a verdict nor trip the drift banner.
Existing rows are deliberately **not** backfilled: they genuinely are unknown.

## 3. Measuring the guesser before the campaign (`9bdc466d`, 2026-09-05)

Phase 2 of the engine-attribution campaign was framed as a question rather than a
work item — "is `inferEngine` wrong often enough to be worth 300+ judgement calls?"
— and `docs/catalog/AUTHORING.md` carries the measurement table it answered with,
over all 344 registered steps:

| Engine source on /status | Before | After |
|---|---|---|
| `audited` (a `StepFact.trueEngine` exists) | 335 | 321 |
| `authored` (spec declares it, no fact) | 3 | 8 |
| `authored-demotion` (spec claims LESS than the audit) | 0 | 14 |
| **`inferred` (a heuristic guess is what the map shows)** | **6** | **1** |
| authored `StepSpec.engine` (any source) | 129 | 189 |

Both numbers the technique asks for are there. **Decided cells:** the heuristic wins
6 of 344, because 338 carry an audit fact that `resolveEngine`
(`src/lib/status/statusModel.ts`) ranks above it. **Agreement where something
stronger exists:** 11 right, 30 wrong — 27%, against a stated 95% bar for an
inferred label to be trustworthy; 21 of the misses are `Test Gate` steps guessed
`UE Runtime`, 3 are gallery steps guessed `Tripo` against an audited `Leonardo`.

The fall-through settled it first: on all 6 inferred cells `inferEngine` returned
its explicit unknown (`Unaudited`), so no cell on `/status` had ever displayed a
guessed engine name. The doc's conclusion is the campaign closing itself — "a
fleet-wide 300-step authoring campaign is NOT warranted by the heuristic — its blast
radius is one step".

What the pass authored instead was the population where the code reads
unambiguously, with the evidence in a comment beside every field: the `Test Gate`
steps (all one shape — `produce()` returns an author-typed checklist and `accept` is
`entityRuntimeDeferred(...)`, so nothing has run), every `UE Packaging` step
(`isPackagingStep` matches the label and `verifyPackagingAll` rebuilds from siblings
and grades from disk), and 7 read individually. `StepSpec.engine` went 129 → 189,
and **189 is what the pipeline files carry today** (re-counted 2026-09-20).

Where the authored value contradicted the audit, the disagreement was recorded
rather than resolved: `resolveEngine`'s one-way self-demotion took
`authored-demotion` from 0 to 14 — 14 cells had been credited as LLM work for typed
prose — and all 23 disagreements are listed in `ENGINE_ATTRIBUTION_DISPUTES` with
shared quoted evidence. One step, `character-pipeline / Face Gate 2D`, stays
unauthored and unaudited by a deliberate call, and is now the only heuristic-decided
cell.

## What this cost

Three changes, no migrations, and the per-item authoring campaign that each one
looked like at the start was avoided in all three: 344 flag decisions replaced by a
three-line probe, 817 rows left honestly unknown rather than backfilled, and a
300-step labelling pass closed by a measurement that took one session.
