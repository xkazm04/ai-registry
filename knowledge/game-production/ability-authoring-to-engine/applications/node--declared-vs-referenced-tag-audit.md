---
layer: application
type: application
subject: ability-authoring-to-engine
technique: declared-vs-referenced-tag-audit
stack: node
status: forged
---

# A Jaccard index over three tag sets, with the blind spot made visible

`src/lib/ability/tag-audit.ts` in the PoF ARPG project scores gameplay-tag hygiene as the
agreement between the tags declared in UE5 C++ source and the tags referenced by authored
content. It is ~120 lines, pure, and it demonstrates most of the technique — including the
two guards teams usually leave out.

## The three sets and the score

`computeTagAudit(parsedTags, authoredRules, appAuthoredTags)` builds:

```
matched    = declared ∩ referenced   (defined and used)
undeclared = referenced \ declared   (used but never defined — a bug)
orphaned   = declared \ referenced   (defined but never used — dead tag)
score      = round( matched / (matched + undeclared + orphaned) × 100 )
```

That is the Jaccard index of the two sets scaled to 0–100. The file's own comment states
the stance plainly: *"Both discrepancy kinds weigh equally — a missing definition and a
dead declaration each cost one slot in the union."* The score is fully explainable because
`TagAuditBreakdown` returns the three sorted name lists alongside the number, so every lost
point maps to a named tag rather than to a mood.

`declaredCount` and `referencedCount` are returned as distinct post-dedupe cardinalities —
the sizes are not recoverable from the score, and a reviewer's first question is always
"out of how many".

## The three sources, and why the third one exists separately

The referenced set is assembled from **two** authoring surfaces, and the split is
deliberate. `authoredRules` comes from the UE5 C++ ability rules that the source parser
extracts (ability / cooldown / activation-owned / activation-blocked tag references).
`appAuthoredTags` comes from `specTagReferences()` in the same file, which walks every
`EnrichedAbilitySpec` and collects each tag rule's `sourceTag` and `targetTag` plus every
effect's `grantedTags`.

App tags join the referenced set — *"an app tag with no C++ declaration is a real
undeclared-tag bug"* — and are also returned separately as `appReferenced`. The doc comment
on that field is the upward lesson in one sentence:

> Empty when the audit was computed from UE source alone — which is exactly the blind spot
> this field exists to make visible.

Without the attribution, an audit that silently lost one of its reference sources would
*improve*: fewer references, fewer undeclared tags, higher score. A metric that goes up
when a data source disappears is worse than no metric. The fix is not a bigger number, it
is a field whose emptiness is legible.

## Normalisation before comparison

`toTagSet()` runs every raw string through `toDottedTag` from
`src/lib/ability/tag-dialect.ts` — trim, drop empties, collapse to the dotted dialect —
before any set operation. The comment notes it is *"tolerant of raw parser output AND of
app-authored tags that still carry the forge's C++ underscore spelling"*, which is the
concrete reason the audit needs a dialect at all: the forge's `OUTPUT_SCHEMA` emits
`Ability_<Name>` and `State_<…>` while specs, spellbook data and this audit all speak
`Ability.Name`. Adopted rows would otherwise match nothing and the audit would report a
total hygiene collapse that is entirely a spelling artifact.

## The vacuous perfect score, and where the guard lives

```js
const union = matched.length + undeclared.length + orphaned.length;
const score = union === 0 ? 100 : Math.round((matched.length / union) * 100);
```

Two empty sets score 100 by vacuous truth. The module knows this and says so in its header:
*"the UI gates the 'no live source parsed' case separately (see `TagAuditSection`) and never
calls this with an empty declared set to imply a real audit."*

**The deviation, and the standard does not move.** The guard is real but it lives in the
caller. That holds for exactly as long as there is one caller; the second consumer — a gate,
a report, a test — gets a perfect score for a measurement that did not happen, and there is
nothing in the returned `TagAuditBreakdown` that distinguishes it from a genuinely clean
corpus. The function that performs the division is where the unmeasured state should be
produced: return it as its own value, and make it unplottable beside a real score.

## Purity as a design choice

The header closes with: *"This module is pure — no I/O, no React — so it is unit-testable
and can run on either side of the UE5 source-parse seam."* The sets are order-independent
and duplicates collapse, so the same number comes out in a test, in the editor panel, and
in a pipeline check. An audit whose value depends on where it ran is not an audit.
