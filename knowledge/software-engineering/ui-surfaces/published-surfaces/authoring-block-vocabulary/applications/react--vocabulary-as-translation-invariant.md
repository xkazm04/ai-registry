---
layer: application
type: application
subject: authoring-block-vocabulary
technique: vocabulary-as-translation-invariant
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Thirteen locales, 988 body pairs, zero broken fences

`personas-web` carries a 116-topic guide corpus hand-translated into thirteen
languages (`src/data/guide/locales/{ar,bn,cs,de,es,fr,hi,id,ja,ko,ru,vi,zh}/`).
Each locale is a full copy of the English bodies — same directive fences, same
item order, different prose — which is the arrangement the technique describes,
at a scale that makes the claim measurable rather than aspirational.

## What a locale body actually looks like

`src/data/guide/locales/cs/content/getting-started.ts:9-15` — Czech prose
wrapped around untranslated structure:

```ts
:::steps
1. **Stáhni instalátor** — vyber správný soubor pro svůj OS (NSIS \`.exe\` na Windows, …)
2. **Spusť instalátor** — poklepej na Windows, přetáhni do Applications na macOS, …
```

The fence name, the ordinal markers, the emphasis markers, the em-dash
separator and the backticked code spans are byte-identical to the English
source; only the sentences moved. That is the entire mechanism.

## The taxonomy that makes it possible

`scripts/i18n/translate-guide-subagent-prompt.md:111-167` is the instruction
handed to each translating subagent, and it is the strongest single artifact
behind this technique — an explicit two-column contract rather than "preserve
the formatting". `### DO translate` (`:113-121`) names prose inside every
directive by name; `### DO NOT translate` (`:123-167`) enumerates, in order:

- the eleven `:::…:::` fence names plus the bare closing `:::` (`:126-130`);
- `---` separators inside `:::compare:::` and `:::usecases:::`, and `===`
  inside `:::usecases:::` (`:131-132`) — the structural separators of the
  per-block grammars, listed individually;
- the `[recommended]` badge marker, verbatim (`:133`);
- emphasis markers, link URLs, ordinal markers, table pipes (`:136-142`);
- everything inside backticks, brand names, ~40 enumerated technical terms and
  the trigger-type labels — with the sharpest line in the document at
  `:163-167`: keep a capability label verbatim *when it is a label*, translate
  it *when it appears as prose*;
- topic ids, as identifiers that are "never translate, never change" (`:155-157`).

`:165-167` also carries the one concession the technique calls for —
locale-specific punctuation is explicitly allowed (Japanese 「」, the Arabic
comma), because that is prose, not structure.

## The measurement

Extracting every English topic body and each locale's copy of it, and comparing
the sequence of `:::` directive lines:

- **1,508** (locale, topic) body pairs exist where both sides carry the topic.
- **988** of those the repo's own drift detector reports as up to date; **988 of
  988 — 100%** have a byte-identical directive sequence. Thirteen independent
  hand translations, and not one fence name localized, dropped or reordered.
- The remaining **520** pairs are drift-flagged (English edited after
  translation); **390** still match structurally, and the 130 that do not are
  English-side additions — `:::cli`, `:::tabs`, `:::keys`, `:::cards` and
  `:::callout-stack` appear in `src/data/guide/content/` and in no locale at all.

The predicate matters: "identical directive sequence" means the ordered list of
`^:::name` lines per body, compared as a string, over bodies extracted by a
line-based scan of the content modules.

## Gaps against the standard (reported, standard kept)

**No structural gate exists.** `scripts/i18n/check-guide-translations.mjs`
compares a SHA-1 of each English body against the hash recorded in
`locales/<lang>/_meta.json` — a freshness check, not a structure check — and
`scripts/guide-i18n-audit.mjs` diffs topic-id key sets. Neither parses a locale
body. The 100% above is therefore a fact about how well the prompt worked on the
last run, not an invariant the build maintains: a future translation that
localizes `[tip]` or eats a `:::` would ship green. The prompt's own
`## Verification before returning` (`:195-211`) asks the translator to confirm
file shape and topic-id parity — the translator checking its own homework, which
is the proxy the technique warns about.

**The freshness gate reads a truncated body.** Both scripts extract bodies with
`/"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g` over the module text. A body
containing an escaped code span that ends just before a comma closes the match
early. Measured over `src/data/guide/content/*.ts`: **11 of 116 English bodies
(9%) are truncated**, and the worst — `creating-a-new-agent` in
`agents-prompts.ts`, which contains ``\`Create Agent\`,`` in its first paragraph
— is hashed over **110 of its 1,751 characters**, leaving 94% of the body
invisible to the drift detector. Every English edit past that point leaves
thirteen translations marked permanently fresh. The instrument that lifts bodies
out of the container is part of the gate, and here it is the part that fails.

**Directive names are English words.** `tip`, `steps`, `warning` read as prose
to a translator, which is precisely why the do-not-translate list has to
enumerate them one by one; a vocabulary of token-shaped names would need less
instruction to survive.
