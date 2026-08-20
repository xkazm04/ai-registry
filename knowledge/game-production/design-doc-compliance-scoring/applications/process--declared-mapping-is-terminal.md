---
layer: application
type: application
subject: design-doc-compliance-scoring
technique: declared-mapping-is-terminal
stack: process
status: forged
---

# Declaring the checklist → feature relation as a maintained table

## The measurement that forced the change

The comment above `CHECKLIST_FEATURE_MAP` in `src/lib/feature-definitions.ts:505` records two
defects in the previous substring-guess approach, both measured on the real database
(2026-08-18):

- **Coverage.** "Only 88 of the 216 registry checklist items the audit can see matched
  anything at all, so the `checklist-vs-scan` and `code-ahead` gap categories were dark for
  59% of the design surface." The item `ac-1` "Character foundation package" — six C++
  classes in one item — matched nothing.
- **Arity.** `features.find` returns one row, "so an item covering six features could only
  ever be evidenced by one of them."

## The declaration, and where it lives

The relation is declared in `src/lib/feature-definitions.ts`, beside the
`MODULE_FEATURE_DEFINITIONS` registry (`:169`) that already models `dependsOn` edges — one
registry, one authority. It is keyed **module → item id → feature names**, not by a flat item
id, because checklist ids are not globally unique: `ai-1`…`ai-7` exist in both
`arpg-inventory` and `ai-behavior`, and a flat map would silently cross-wire them. Cross-module
references are refused outright: the audit compares one module's checklist against that
module's own scanned rows.

Three declared states, all honest:

- **a list of names** — this item is evidenced by exactly these feature rows;
- **`[]`** — nothing in the feature matrix can evidence this item (verification/tuning items
  such as "Test full save/load cycle"). Real entries: `'import-preset': []` with the note
  "the ImportConfig lives in component state — no preset save/load exists";
  `'rig-retarget': []` — "no UE5 IK Rig / IK Retargeter codegen exists". Mapping these to a
  plausible-looking feature is the exact false positive the table removes;
- **absent** — not mapped yet; the audit falls back to the heuristic and flags the item.

Names must match `MODULE_FEATURE_DEFINITIONS[moduleId]` exactly, pinned by
`src/__tests__/lib/evaluator/gdd-compliance-mapping.test.ts` — so a renamed feature fails the
suite rather than degrading into a dangling entry.

## How the audit consumes it

`resolveChecklistItem` at `src/lib/gdd-compliance.ts:19` (header comment) and `:76`
(implementation) returns a three-state `ChecklistResolution`:

- `mapped` resolves to **every** named row, so the six-class package item is graded against
  all six;
- `heuristic` wraps the legacy 20-character both-directions substring guess
  (`heuristicMatch`, `:68`) — the gap carries `matchSource: 'heuristic'` and `provenanceNote`
  (`:104`) appends "Relation GUESSED by the label-substring fallback … verify before acting";
- `unmapped` produces no cross-check finding, and the item lands in `unmappedItems`.

Arity is respected in both directions at `src/lib/gdd-compliance.ts:159` and `:184`: a
design-ahead gap fires if *any* mapped row is missing and reports "N of M features missing",
while a code-ahead gap requires `res.features.every(...)` to be done — "one implemented row
out of six is not an item the user forgot to tick, it is an item still in progress."

`dangling` names are counted, but suppressed when `features.length === 0` — a module with no
scan would report every mapped name as dangling, "which says nothing beyond 'nobody scanned
it'", already reported as an `unmeasured` gap.

## Publishing the mapping's own coverage

`ChecklistMappingStats` (`emptyMappingStats`, `:90`) tracks `itemsTotal`, `mapped`,
`noFeatureEvidence`, `multiFeature`, `heuristic`, `unmapped` and `danglingMappings`;
`mergeMappingStats` rolls them to the project scope and the report publishes them as
`checklistMapping` (`src/lib/gdd-compliance.ts:696`) so "an audit reporting few checklist gaps
is read against how many items were even in scope."

## Deviation not lowered

The 20-character substring fallback is retained indefinitely rather than being driven to zero.
The standard treats a heuristic as a migration budget whose count must fall each cycle; the
engine publishes the count but sets no target and no ratchet. The standard stays as written.
