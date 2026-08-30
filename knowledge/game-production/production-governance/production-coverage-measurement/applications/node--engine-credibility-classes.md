---
layer: application
type: application
subject: production-coverage-measurement
technique: engine-credibility-classes
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Producer credibility classes in the PoF status model

`src/lib/status/statusModel.ts` implements the class ladder for a ~344-step production
map across all catalogs. It is a pure module — JSON imports and function arguments only —
so the whole grading path is testable without a database.

## The class set and the trusted predicate

`EngineClass` (`statusModel.ts:156`) enumerates ten classes: `llm`, `gen2d`, `gen3d`,
`audio`, `runtime`, `tooling`, `code`, `hand-authored`, `human`, `unaudited`.
`TRUSTED_CLASSES` (`:243`) names the ones whose L0–L2 pass stands without a gate, and
`isTrustedClass` (`:247`) is the single predicate over it — the comment is explicit that
no caller re-states the membership. `ENGINE_CLASS_NOTE` (`:261`) carries the published
one-sentence note per class, rendered beside the engine name on `StatusCell` and in
`EvidenceModal`. The comment names the bug it fixes: the trusted/ungated split had always
existed, but "a demoted cell just came back a different colour with no statement of what
it lost or why".

The grade cascade consumes it at `statusModel.ts:628` (`deriveCell`), in one line:

```ts
else if (counts.pass > 0) grade = TRUSTED_CLASSES.has(engineClass(engine)) ? 'trusted' : 'ungated';
```

## The `code` / `hand-authored` split — the byte-identity probe, measured

The technique's falsifiability axis is realized as a split recorded in the module header
(`:172`, measured 2026-08-20). `Code` had been mapped to the trusted class on the
reasoning that code scales to quality without a gate, but it was carrying two meanings:

1. code that **derives** the artifact or its verdict from something outside its own source
   — the packaging verifier rebuilds a package from sibling artifacts and grades it
   against files on disk;
2. a `produce()` body that **returns literals**.

The probe that settled it: **106 of the 110 code-class steps emit a byte-identical
artifact for two different entities**, and the remaining 4 interpolate only the entity's
name into otherwise fixed prose. The audit's own notes concede it — "hand-authored
constants", "hand-picked constants engineered to land exactly at 1.0", "a hardcoded stub,
not a measured shader-compile output". `HAND_AUTHORED_ENGINE` (`:204`) is therefore
deliberately absent from `TRUSTED_CLASSES`, with the note stating that a pass proves the
author self-consistent, not the values right.

The module also records why it is not called `Human`: `human` **is** trusted, for human
*selection* — a person looked at real candidates and chose one, "which is a judgment act
with an artifact under it". Who wrote it is not the axis; whether anything verified it is.

## Unknown earns nothing, at two seams

`engineClass` (`:423`) ends `?? 'unaudited'`, and the comment records the prior defect
verbatim: the old `?? 'llm'` "put every unrecognised string into `TRUSTED_CLASSES`, so
uncertainty was biased toward the highest credibility bucket". Its blast radius was larger
than the same bug one seam down, because it also caught **audited** engines whose spelling
had drifted from the map — a measured 95 audited steps presented as trusted LLM work
(`:228`, measured 2026-08-18). Adding a new engine now requires an explicit table entry,
"which is the point".

`inferEngine` (`:306`) carries the same fix at the resolution seam: `StepSpec.engine` is
authored on 12 of ~344 steps, so a heuristic speaks for the rest, and its unmatched case
returns `UNAUDITED_ENGINE` (`:171`) — a real name, so the cell can *say* the engine is
unknown, rather than a guess at a real engine.

## The placeholder-pass state

`MEDIA_DELIVERABLES` (`:154`) plus the `unpowered` derivation in `deriveCell` gives the
technique's "hollow" case a concrete rule: a pass counts as unpowered when the audited
`trueEngine` is `None`, or when the deliverable is a media class (`2d-art`, `3d-mesh`,
`audio`, `vfx-particles`, `animation`) with `generatorWired` false. That is the
checker passing on hand-typed placeholder data, and `readiness.ts` maps it to R1 with the
rationale "the checker passed on placeholder data — nothing in the stack can actually
produce this".

## Fixtures excluded by rule

`isSyntheticEntity` (`:285`) drops entities created by the headless test harness and the
MCP smoke check, which POST into the same database as real content. The comment states
the aggregation hazard directly: a cell is `attention` if *any* of its entities fails, so
one stub verdict reds out a step whose real content is shippable.
