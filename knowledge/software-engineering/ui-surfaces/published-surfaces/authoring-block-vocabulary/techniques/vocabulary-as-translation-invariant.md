---
layer: technique
type: technique
subject: authoring-block-vocabulary
technique: vocabulary-as-translation-invariant
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [an authored corpus is copied per locale rather than keyed into a catalog, writing instructions for whoever translates long-form bodies, a translated page renders fewer blocks than its source]
---

# Vocabulary as translation invariant

A long-form authored corpus is not translated the way an interface is. An
interface is a catalog of short strings under stable keys, and the structure
lives in the code around them. A body of prose with structure *inside* it gets
translated as a **whole document, copied per locale** — the same fences, the
same directives, the same item order, with different sentences in between.

That makes the block vocabulary the invariant skeleton shared by every locale
copy, and it is what turns "translate this corpus" from a rewrite into a
substitution. It only works if the invariance is stated, instructed, and
checked.

## The taxonomy is written down before anyone translates

Whoever does the translating — a person, a service, a model — gets an explicit
two-column instruction: what is prose and must change, what is a token and must
survive byte-for-byte. Vague guidance ("keep the formatting") is not an
instruction; it is a hope.

**Never translated, and enumerate them by name rather than by category:**

- **Directive names and their fence markers.** The opener and closer are literal.
- **Field separators** inside a block's line grammar.
- **Enum labels** in payloads. They are identifiers spelled in a natural
  language and the renderer resolves their display text per locale; a translated
  label is an item the parser cannot see. (The general principle that a
  machine-consumed string is a token wearing user-facing clothes belongs to
  [token-label-separation](../../../../client-architecture/i18n/techniques/token-label-separation.md);
  what this technique adds is that in an authored corpus those tokens sit inside
  the prose, where a translator's hand naturally falls.)
- **Identifiers and anchors** — section ids, slugs, cross-references, image
  names. These are addresses; a translated anchor breaks every deep link into
  that locale.
- **Interpolation placeholders and code spans.** Code is quoted material, not
  writing.

**Always translated:** the sentences, the headings, the alt text, the item text
after the separator — everything whose audience is a reader.

**Decided explicitly, because it is the one genuinely ambiguous class:**
brand names, product nouns and technical terms that some locales localize and
others keep. Leaving this to per-translator judgment produces a corpus where the
same term appears three ways in one language. Put the decision in a glossary,
per locale, and the glossary travels with the instruction.

## Structure is not the translator's to change

The invariance is stronger than "do not touch the tokens". The **shape** of the
document is fixed: the same blocks in the same order, the same number of items
in each, the same headings in the same nesting. A translator who merges two
steps because the target language reads better has silently made two documents
that no longer correspond, and every later edit to the source has to be applied
twice, by hand, forever.

Prose length is the one dimension that must be free. Translated sentences run
routinely half again the length of their source, so the grammar has to tolerate
reflowing — which is what continuation lines are for
([per-block-line-grammar](./per-block-line-grammar.md)) — without changing the
item count. A grammar that ties one item to exactly one physical line is a
grammar that forces translators to either overflow or restructure, and they will
restructure.

## The source is the authority; the copies own only prose

Every locale copy derives its structure from the source body. This is the same
rule that governs any closed vocabulary with multiple materializations, applied
to N documents instead of two code paths
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the copies are not independent documents that happen to look alike, they are
prose variants of one structural document. A structural edit lands in the source
and propagates; it never originates in a translation.

Two practical consequences. Adding a block to the source makes every locale
*stale in a specific, nameable way* rather than merely "out of date" — the
missing block is identifiable by structural comparison, so re-translation can be
scoped to it. And a locale that is missing entirely should fall back to the
source language body, whole, rather than to a partially translated hybrid: a
document that switches languages mid-page reads as broken in a way a
consistently untranslated one does not.

## The gate parses the bodies

The check that makes all of this real is mechanical and cheap: **parse the source
body and each locale body with the same parser, and compare their block
structure** — the sequence of directive names, the item count per block, the
enum label in each item position, the set of anchors. Prose differs; nothing
else may.

It has to read the bodies themselves. A pipeline that gates on a diff summary, a
character-count ratio, or the translator's own report of what it did is
inspecting a proxy, and a proxy check passes precisely when the proxy has
diverged from the artifact
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The parse is the only
observation that sees what will actually render.

The proxy hides in a second, quieter place too: **how the bodies are pulled out
of whatever holds them.** A staleness check that fingerprints each source body
and compares against the fingerprint recorded at translation time is exactly the
right instrument — and it is worthless over a body the extractor truncated,
because every edit past the truncation point leaves the fingerprint unchanged
and the translation permanently, invisibly fresh. Whatever lifts bodies out of
their container is part of the gate, and it gets the same scrutiny as the
comparison it feeds.

What the comparison catches, in rough order of how often it fires: a translated
enum label; a fence marker that lost a character; an item merged or split; an
anchor helpfully localized; a whole block dropped because the translator did not
recognize it as content. Each of those is otherwise invisible until a reader in
that locale sees a page with a hole in it — and readers in a locale nobody on
the team speaks do not file reports.

## This technique does not exist for an open vocabulary

Worth stating flatly, because it is the cost line in the open-versus-closed
decision. If content can embed arbitrary components, there is no fixed set of
tokens to protect, no structural comparison to run, and no instruction short of
"understand this code" to give a translator. Translation of an open corpus is a
task for someone who reads the codebase, which means it is not a task that
scales to a dozen languages. Choosing the open form is choosing to be
effectively monolingual, and it is worth choosing on purpose rather than
discovering.
