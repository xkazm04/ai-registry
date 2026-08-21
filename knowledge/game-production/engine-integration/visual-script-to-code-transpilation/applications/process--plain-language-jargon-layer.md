---
layer: application
type: application
subject: visual-script-to-code-transpilation
technique: plain-language-jargon-layer
stack: process
status: forged
verified_on: 2026-08-20
---

# A two-layer glossary shipped inside a transpiler UI

The same app's transpiler view (`src/components/modules/game-systems/blueprint-transpiler/`)
puts its explanation layer in three source files, split by role rather than by topic.

## The two layers, as files

**`src/lib/blueprint-jargon.ts` (419 lines)** — the base dictionary: `UPROPERTY` /
`UFUNCTION` specifiers, core macros, `K2Node_*` node kinds, diff conflict levels. The
entry shape is exactly the two fields the technique asks for:

```ts
export interface JargonEntry {
  term: string;          // raw term as it appears in code or labels
  plain: string;         // one-line, jargon-free description of what it does
  whyItMatters?: string; // optional one-line hook for the Explain panel
}
```

**`src/lib/blueprint-glossary.ts` (179 lines)** — layers on the *raw engine tokens* that
appear verbatim in exports and in the diff UI but are absent from the base dictionary:
`CPF_*` property flags, `EGPD_*` pin directions, three-letter diff codes
(ADD/DEL/MOD/MOV/REN), diff scope tokens. Its header states the single-source rule
explicitly: consumers (`TermChip`, diff change cards, the warnings list) all look terms
up through one `lookupTerm`.

The audience split falls out of the content: `UPROPERTY` specifiers and `CPF_*` flags
are the designer's layer (code-side terms surfaced to a non-engineer), `K2Node_*`
entries are the engineer's layer (graph vocabulary surfaced to someone who does not
author graphs).

## Consequence, not expansion

Every entry states an effect:

```ts
CPF_Net:      { plain: 'Replicated — the server keeps this value in sync on every client.',
                whyItMatters: 'Without it, multiplayer clients would see a stale value.' }
CPF_RepNotify:{ plain: 'Replicated AND calls an OnRep_ handler whenever the value changes.' }
Transient:    { plain: 'Never saved to disk — runtime-only state.' }
EditAnywhere: { plain: 'Designers can tweak this value in the editor on every instance.',
                whyItMatters: 'Lets non-coders tune values without touching C++.' }
K2Node_Timeline: { plain: 'A Blueprint timeline — drives values over time (animation curves, fades).' }
```

Not one entry expands an acronym. `CPF_Edit`'s `whyItMatters` goes further and names the
*downstream mapping* — "maps to the EditAnywhere/EditDefaultsOnly specifiers on the
generated UPROPERTY" — which is the consequence for a reader of the generated code
rather than for a reader of the graph.

## Narration derived from structure, not from text

`src/lib/blueprint-explainer.ts:1-11` states the rule that this application contributes
back to the technique:

> The explanations are derived directly from the typed result structure (NOT scraped
> from generated text), so they stay accurate whenever the transpiler output changes —
> same source of truth as the code itself.

`explainTranspile` and the `SemanticChange` explainers consume `TranspileResult` and
`SemanticDiffResult` objects and emit `PlainExplanation { what, whyItMatters }` per
section — the same two fields as a glossary entry, so a diff card and a term chip read
identically. The parse side supplies the raw material: `parseVariable`
(`src/lib/blueprint-parser.ts:206-222`) turns `PropertyFlags` into typed booleans
(`isExposedToEditor`, `isReplicated`, `isRepNotify`) that both the emitter and the
explainer read, rather than each re-interpreting the flag strings.

## Where it falls short

Coverage of uncovered terms is not measured: a term appearing in output with no entry
renders as a plain string, not as a counted gap. The technique's rule stands — an
unwritten entry must read as missing rather than as unnecessary — and this
implementation does not yet meet it.
