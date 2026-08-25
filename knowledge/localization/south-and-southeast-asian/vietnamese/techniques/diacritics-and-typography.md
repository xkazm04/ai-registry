---
layer: technique
type: technique
subject: vietnamese
technique: diacritics-and-typography
status: forged
laws: [format-skeleton-is-inviolable, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Vietnamese text for orthography and punctuation defects, setting normalization and encoding policy for a vi catalog, adjudicating tone-mark placement variants]
---

# Diacritics & typography

Vietnamese orthography stacks up to two diacritics per vowel: a quality mark (â, ê,
ô, ă, ơ, ư, đ) and one of five tone marks. The stack is the word. Everything in this
technique follows from taking that literally: there is no "plain" fallback spelling,
and two visually identical strings can be different byte sequences in three separate
ways (folding, normalization form, tone-mark placement style) — each of which needs
its own rule because each breaks a different downstream system.

## VI-DIACRITIC · full diacritics always, no ASCII folding

**Trigger:** any Vietnamese text, including the shortest badge, a truncated label, a
generated identifier shown to users, an SMS-length constraint.
**Rule:** never strip diacritics. Duong is not an abbreviation of Dương — it is a
different string that collides with other names and words; tam can be any of tám
(eight), tấm, tâm (heart/center), tằm… Folding does not shorten a string by one
visible character and it destroys meaning wholesale. When a channel genuinely
cannot carry non-ASCII (a legacy protocol field), that is an engineering
constraint to surface as a source/platform defect, not a translation style to
adopt.
**Exception:** none in user-visible text. Diacritics-folded *matching* (for search,
term-consolidation scans) is a tool-side convenience and never a storage format.

## VI-NFC · the catalog is NFC-normalized

**Trigger:** any write into a Vietnamese catalog; any diff, grep, or
string-equality check over one.
**Rule:** store precomposed NFC (ế as one code point), never NFD (e + circumflex +
tone as combining marks) and never a mixture. Mixed forms render identically but
fail equality, split search hits, break translation-memory matches, and produce
phantom diffs. Vietnamese is a worst case for this because so many code points
have both forms and because macOS file APIs and some input methods emit NFD.
Enforce mechanically at the write path — a human reviewer cannot see the defect
by definition.

## VI-TONE-STYLE · one tone-mark placement style per catalog

**Trigger:** syllables with the glide clusters oa, oe, uy and no final consonant —
hòa/hoà, khỏe/khoẻ, thúy/thuý.
**Rule:** both placements are attested and readable: the "old style" centers the
mark aesthetically (hòa, khỏe — the majority convention in print and the common
default of popular input methods), the "new style" puts it on the phonemic main
vowel (hoà, khoẻ — the convention of the education ministry's orthography).
Neither is wrong; a catalog that mixes them is, because hòa and hoà are distinct
code-point sequences that split search, sorting, and TM matches exactly like a
normalization mix. Pick one — old style is the pragmatic default because input
methods produce it — record the choice, and audit it mechanically (the affected
cluster set is small and greppable).
**Exception:** in both styles, a vowel already carrying a quality diacritic takes
the tone mark on it regardless of position (thuyền, not thùyen) — that part is
not a style choice.

## VI-PUNCT · punctuation is Latin-standard with Vietnamese numbers

**Trigger:** any punctuation or number formatting in a vi string.
**Rule:**
- No space before `. , ? ! : ;` — one space after. Vietnamese, unlike French,
  inserts nothing before the tall marks. (Microsoft Vietnamese style guide,
  punctuation section.)
- Ellipsis is the single glyph `…`, em dash is `—`. Three periods and double
  hyphens are keyboard-layout artifacts, and because most vi text is typed on
  English layouts they are the most *frequent* mechanical defect in real
  catalogs — audit them by count, not by sampling.
- Quotation marks: straight double quotes are the established digital convention;
  Vietnamese has no enforced guillemet or low-quote tradition. Do not introduce
  curly quotes into a catalog that does not already use them —
  [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
  cuts both ways: a lone typographically-fancy string is drift too.
- Numbers: decimal **comma**, thousands **period** (1.526,75), per the Microsoft
  guide — the exact inverse of the English source. A number that arrives inside a
  placeholder is formatted by the platform's locale data and is not the
  translator's to touch ([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable));
  a number hardcoded in the source string with English formatting is a source
  defect to surface.
- No comma before và / hoặc in enumerations — the Oxford comma is an English
  convention with no Vietnamese counterpart.

## What this technique does not cover

Where line breaks may fall and how syllable-spaced words interact with wrapping is
a layout concern, owned by ui-conventions-and-length. This technique owns what the
bytes are; that one owns where they may be severed.
