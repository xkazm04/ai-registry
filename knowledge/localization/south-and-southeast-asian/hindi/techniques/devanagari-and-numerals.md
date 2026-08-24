---
layer: technique
type: technique
subject: hindi
technique: devanagari-and-numerals
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [reviewing Devanagari text for script correctness, deciding danda versus period or Latin versus Devanagari digits, debugging rendering or truncation of Hindi strings]
---

# Devanagari and numerals

Devanagari is a complex script with a short list of mechanical correctness rules
— nukta, conjuncts, danda, digits — that a reviewer without Hindi can still
audit once they are anchored, and that a machine pass gets wrong in
characteristic ways. The theme across all of them: modern Hindi software
convention deviates from what a literary style manual would say (Latin digits,
pragmatic ZWNJ avoidance), and the deviations are settled, not open.

## HI-DANDA · sentence-final danda, Latin period for everything else

**Trigger:** any string containing a full sentence; any period character in a
Hindi value.

**Rule:** a complete Hindi sentence ends in the danda ।(U+0964), not the Latin
period: चिंता न करें। not चिंता न करें. The Latin period keeps its technical jobs:
abbreviations, decimal points, version numbers, and anything inside code, URLs,
or email addresses. All other punctuation is the ordinary half-width Latin set —
comma, question mark, exclamation, parentheses, colon — Devanagari never adopted
distinct forms for these, and full-width variants are a CJK convention that has
no place here.

**Source:** the published OS-vendor and browser-vendor Hindi guides both
prescribe the danda (पूर्णविराम) as the sentence terminator.

**Exception:** fragments are not sentences — labels, column headers, and menu
items take no terminator at all, danda or otherwise. And a sentence whose final
token is Latin-script material (an URL, a code literal) still takes the danda
after it; do not switch terminator because the last word switched script.

## HI-NUKTA · nukta consonants are spelled with the nukta

**Trigger:** loanwords and Perso-Arabic-derived vocabulary containing the sounds
z, f, q, ġ, x — ज़्यादा, फ़ाइल, क़ानून, ज़रूरी, वर्कफ़्लो.

**Rule:** write the nukta forms where the word has them: ज़ (za) not ज, फ़ (fa)
not फ, and क़/ग़/ख़ where the etymological spelling is established. Casual typing
routinely drops the nukta (फाइल, जरूरी) and readers cope, which is exactly why a
catalog drifts: half the strings get फ़ाइल and half get फाइल, and the same word
now fails a search and a termbase match. The rule to enforce is **consistency
with the nukta present** — it is the dictionary spelling, both major vendor
guides use it, and it round-trips transliteration cleanly. Encode it as the base
consonant + combining nukta (U+093C) or the precomposed character consistently —
pick the form your toolchain normalizes to (NFC keeps क़-class precomposed
points; most pipelines emit base+combining) and audit byte-level consistency, or
string equality and glossary lookups silently fail on visually identical text.

**Exception:** words so fully nativized that the nukta-less spelling is the
dictionary headform stay nukta-less; the termbase records the spelling per word
and the audit checks against the termbase, not against a blanket rule.

## HI-CONJUNCT · clusters are single units; ZWNJ is a last resort

**Trigger:** conjunct-heavy words rendering oddly; a request to "fix" a
conjunct's appearance; truncation logic near Devanagari text.

**Rule:** consonant clusters (क्त, स्थ, द्ध, क्ष, त्र, ज्ञ) are formed by virama and
shaped by the font — the text layer never simulates a conjunct with spacing,
hyphens, or a visible halant where the standard spelling wants a joined form.
Prefer the standard spelling of a word over inserting ZWNJ (U+200C) to force a
particular visual; a shipped catalog can be entirely ZWNJ-free, and every
invisible character added is a future string-matching defect. When a specific
word genuinely requires ZWNJ for its correct form, use the real U+200C code
point, once, recorded in the termbase — never a visible substitute. For
engineers: any truncation or wrapping must respect grapheme-cluster boundaries;
cutting between a consonant and its matra or inside a conjunct produces
corrupted text, not a shorter string, and a dotted circle (◌) anywhere in the UI
means a cluster was broken or a font is missing — a bug, not a style issue.

## HI-DIGITS · International (Latin) digits, not Devanagari digits

**Trigger:** any number in a Hindi string; a locale-formatting layer offering
native-digit output.

**Rule:** modern Hindi software uses the International digits 0-9, never the
Devanagari digits ०-९. This is the settled answer, not a taste call: the
published vendor style guides prescribe international numerals explicitly, and
shipped professional catalogs show thousands of Latin-digit occurrences against
zero Devanagari-digit occurrences. Configure the formatting layer accordingly —
CLDR's default numbering system for the locale is already Latin (`latn`), but a
pipeline that "helpfully" switches to native digits (`deva`) ships a string no
modern product uses. Digit *grouping*, however, is the Indian system: 1,00,000
(lakh) not 100,000 — take it from the locale's number formatter rather than
hand-formatting, and never hardcode Western grouping into a translated string.

**Source:** vendor style guides ("use the International form of Indian
numerals"); CLDR locale data for the default numbering system.

**Exception:** deviate to Devanagari digits only for deliberately literary or
ceremonial surfaces (a Panchang-style date display, decorative headings in a
cultural product) — and then as a recorded, surface-scoped ruling
([the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis)
cuts both ways: if a product's shipped corpus has settled on Latin digits, a
reviewer restoring ०-९ "for authenticity" is creating drift, not fixing it).

## HI-NASALMARK · one nasalization mark per word, catalog-wide

> **Trigger** — an -एँ/-एं honorific imperative or nasalized verb form
> (*हटाएँ/हटाएं*, *दिखाएं/दिखाएँ* for the same verb).
> **Rule** — pick one mark — candrabindu ँ or anusvara ं — per word and
> hold it everywhere. Both are readable; the mix is what reads unedited.
> Record the house pick in the termbase the first time it is made.
> **Provenance** — harvested 2026-08 from a cross-locale review wave; the
> nukta rule covers loanword consonants, not vowel nasalization on native
> verb endings.

## When not to use this

These rules govern Devanagari mechanics, not vocabulary — whether a word should
be transliterated at all belongs to terminology-and-loanwords, and how numerals
interact with plural categories belongs to gender-and-agreement. Do not apply
the danda rule to other Devanagari-script languages by reflex: Marathi shares
the script and most conventions, but each locale's terminator and digit
conventions are its own ruling.
