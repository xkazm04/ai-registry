---
layer: application
type: application
subject: authoring-block-vocabulary
technique: closed-directive-set
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Sixteen directives, one dispatch, one `return null`

The guide renderer in `personas-web` extends Markdown with a fenced directive
syntax (`:::name` … `:::`) and closes the set in a single function. The whole
vocabulary fits on one screen, and the closure is literally the last statement.

## The scanner drops the region, not just the block

`src/components/guide/guide-markdown/parseBlocks.tsx:125-135` is the directive
recognizer, and its structure is why an unrecognized name cannot leak:

```tsx
const customMatch = line.trimStart().match(/^:::([\w-]+)$/);
if (customMatch) {
  const innerLines: string[] = [];
  index++;
  while (index < lines.length && !lines[index].trimStart().startsWith(":::")) {
    innerLines.push(lines[index++]);
  }
  index++;
  const parsed = parseCustomBlock(customMatch[1], innerLines, `callout${key}`);
  if (parsed) emit(parsed);
  continue;
}
```

The cursor advances past the opener, the body and the closer **before** the
result is inspected, so `if (parsed) emit(parsed)` is the only decision left: a
directive nobody knows contributes nothing and its three-colon fences never
reach the paragraph branch below. The opener pattern is anchored and
name-shaped (`^:::([\w-]+)$`), so a line that merely starts with colons is not
mistaken for a fence.

## The dispatch is the vocabulary

`parseCustomBlock.tsx:20-38` is the whole set — twelve structural directives
dispatched to per-block parsers, four callout names collapsed onto one
component, and the null:

```tsx
export function parseCustomBlock(blockType: string, innerLines: string[], keyBase: string): ReactNode | null {
  if (blockType === "steps") return parseSteps(innerLines);
  …
  if (blockType === "cards") return parseCards(innerLines, keyBase);
  if (["tip", "warning", "info", "success"].includes(blockType)) { … }
  return null;
}
```

There is no registry object, no name array the scanner consults, no lookup
table: the branch list *is* the authority, and the sixteen names are reachable
only through it. Each per-block parser follows the same convention — build items,
`return items.length > 0 ? <Block …/> : null` (`:49`, `:58`, `:80`, `:98`,
`:121`, `:147`, `:157`) — so an empty parse degrades into the same drop path as
an unknown name rather than rendering an empty shell.

The corpus exercises fifteen of the sixteen names: across
`src/data/guide/content/*.ts`, `:::tip` appears 111 times, `:::steps` 20,
`:::warning` 14, `:::compare` 11, `:::info` 9, then `:::diagram` and `:::cli`
5 each, down to one use apiece of `:::tabs`, `:::keys` and `:::cards`. A
vocabulary this size is sweepable, which is what makes the retirement procedure
in the technique affordable here.

## Two escape hatches that did land

`parseFeature` (`parseCustomBlock.tsx:101-115`) accepts an appearance attribute
in the grammar:

```tsx
const match = line.match(/^\*\*(.+?)\*\*\s*(?:color=(\S+))?\s*$/);
```

`color` is passed straight through to `<FeatureHighlight color={color} />` with
no enumeration behind it, and the translator instructions
(`scripts/i18n/translate-guide-subagent-prompt.md:145-146`) already have to carry
a rule for it — *"`color=#XXXXXX` attribute on `:::feature:::` blocks — keep
verbatim"*. That is the style pass-through the technique names, in miniature:
appearance in content, now replicated into thirteen locale corpora. The
`[recommended]` flag in `:::compare` (`:70`) is the milder form — a closed,
single-valued marker rather than an open value, and correspondingly harmless.

**Gap against the standard (reported, standard kept):** nothing in the repo
counts drops. `grep -rn ":::" scripts/` returns no match — no build step parses
directive fences, so an unknown or misspelled `:::stpes` renders as absence with
no gate, no count and no author-facing report. Both halves of the drop rule are
required and only the reader-facing half is implemented; the feedback channel is
a human previewing the page.

## The callout vocabulary exists four times

`tip | warning | info | success` is declared as an array literal in the dispatch
(`parseCustomBlock.tsx:33`), as `VALID_TYPES` in
`parseCalloutStack.tsx:6`, as the keys of `CALLOUT_STYLES` in
`blocks/Callout.tsx:19-48`, and again as an alternation inside the stack's item
pattern (`parseCalloutStack.tsx:13`). Four hand-maintained materializations of a
four-member vocabulary — the exact
one-authority-per-vocabulary shape, made concrete by the fact that the same four
names are reachable from two syntactic positions (`:::tip` as a directive,
`[tip]` as an inline label). Adding a fifth kind means finding all four.

## A fifth reader of the vocabulary, outside the dispatch

`src/app/guide/[category]/[topic]/page.tsx:11-24` re-parses `:::steps` from the
raw body string to build `HowTo` structured data for crawlers — reading the
source text, never the rendered tree, and `buildHowToJsonLd` (`:26-46`) returns
`null` when the extraction is empty rather than substituting a default. Both are
exactly right. It is also a second, narrower implementation of the step grammar:
`page.tsx:20` repeats the pattern from `parseCustomBlock.tsx:43` with literal
dashes in place of the unicode escapes, and omits the continuation-line folding
that `parseSteps` performs at `:45-47` — so an emitted `HowToStep.text` can be
shorter than the prose the reader sees, a narrowing that is correct under the
technique's rule but is not stated at the extraction site.
