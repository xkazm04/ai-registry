---
layer: application
type: application
subject: ability-authoring-to-engine
technique: server-derived-codegen-report
stack: node
status: forged
---

# Deriving `confirmed | failed` from four rungs, not from the agent's word

When the PoF ARPG project dispatches its `generate-gas-effects` agent task — write the
GameplayEffect and GameplayAbility classes into the UE5 project, build the module, run the
seeder — the run reports back through a callback. `src/lib/ability/codegen-report.ts`
turns that callback into the record, and its opening comment states the whole doctrine:

> The payload arrives as raw LLM JSON, so nothing here trusts it: every field is
> type-checked, and the terminal `status` is DERIVED from the evidence (files written +
> build + seed + DT rows) rather than read from a self-declared "success" the model could
> simply assert. A run that skipped the seeder is `failed` with a reason, no matter what it
> claims.

## The ladder, as fields

`CodegenReport` (`src/lib/ability/spec.ts:40`) stores the rungs separately rather than
collapsing them: `filesWritten: string[]`, `buildOk: boolean`, `seedRan: boolean`,
`dataTableRows: number | null`, `missingTags: string[]`, an optional `reason`, and
`reportedAt`. The field comment on `status` reads *"Server-derived, never taken from the
model's word"*, and the interface's own docstring names why the record exists at all:
*"This is the ONE record that makes the 'exports C++' claim checkable — a dispatch alone
proves nothing."*

Note what the ladder covers. Files written is the structural rung. `buildOk` is the compile
rung. `seedRan` and `dataTableRows` are the wiring rung — whether the generated classes
actually appear in the DataTable the runtime reads. An artifact that satisfies the first
two and none of the third is compile-clean and absent from the game.

`missingTags` — *"tags referenced but not declared"* — rides along in the same record, so
the vocabulary damage a run caused is attached to the run that caused it instead of being
rediscovered later by the tag audit.

## The derivation

`parseCodegenReport` collects shortfalls and lets the count decide:

```js
if (files.data.length === 0) shortfalls.push('no files were written');
if (!build.data)             shortfalls.push('the PoF module did not build');
if (!seed.data)              shortfalls.push('the DT_GeneratedAbilities seeder did not run');
if (rows === null)           shortfalls.push('no DataTable row count was reported');
else if (rows === 0)         shortfalls.push('the seeder saved 0 rows');
const confirmed = shortfalls.length === 0;
```

Two details are worth transplanting whole. First, `rows === null` and `rows === 0` are
different branches with different sentences: *no row count was reported* is a missing
measurement, *the seeder saved 0 rows* is a measured failure. Both block confirmation, but
they send an engineer to different places, and a schema that had typed `dataTableRows` as
`number` with a zero default would have destroyed the distinction at parse time.

Second, failure always carries a reason. Where the agent supplied one it is trimmed and
kept; where it did not, the derived reason is synthesised from the shortfall list —
`Codegen incomplete — the PoF module did not build; the seeder saved 0 rows.` No path
produces a `failed` with an empty explanation.

The module is pure and takes an injectable `now()` so `reportedAt` is stable under test.
`src/app/api/ability-spec/codegen/route.ts:37` is the only entry point: parse, then
`setCodegenReport` persists it onto the spec row.

**The deviation, and the standard does not move.** The *status* is derived, but the rungs it
derives from are still the agent's booleans: `buildOk` is whatever the callback sent, not
the build's exit code read by the receiver. Type-checking a claim is not observing the
thing. The honest version reads the build result and the DataTable row count from the
project itself and keeps the agent's booleans as a labelled self-reported column beside
them — at which point a disagreement between the two becomes the pipeline's most valuable
signal, rather than being unrepresentable.

## Provenance beside the output

`SpecProvenance` (`spec.ts:22`) stores what produced an adopted forge output: `className`,
`displayName`, `damageType`, the raw generated `headerCode` and `cppCode` (*"stored for
audit, not written to the project"*), and — the load-bearing field — `prompt`, *"the
natural-language prompt that produced the forge output"*. Storing the resolved text rather
than a template version is what keeps the record readable after the prompt file changes,
which it does continuously.

## The starter spec marks its unknowns

`deriveDefaultSpec` (`spec.ts:108`) seeds a spec so the editors are never empty: one
element-themed instant effect applying `Health −damage` and carrying the cooldown, plus the
two standard activation blocks (`State.Dead`, `State.Stunned`). It is a scaffold, and it is
careful about it — `magnitude` is `-damage` only `if (ability.damage)`, otherwise `0`, and
`grantedTags` is empty rather than guessed. The same instinct appears in the codegen
contract: an unknown attribute becomes a `// TODO: unknown attribute` comment, and a
missing mana cost becomes `// TODO: mana cost`, never a plausible number that a later
reader would mistake for a designer's decision.
