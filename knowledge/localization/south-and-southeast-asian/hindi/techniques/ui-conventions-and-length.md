---
layer: technique
type: technique
subject: hindi
technique: ui-conventions-and-length
status: forged
laws: [clean-strings-stay-untouched]
shared_with: []
use_when: [writing Hindi button labels and headers, fitting Hindi into length-constrained surfaces, reviewing typography conventions like ellipsis and quotes in a catalog]
---

# UI conventions and length

Hindi's UI-surface conventions are where a translator's sentence craft meets a
layout engineer's pixel budget. The length story is asymmetric — full sentences
run noticeably longer than English, single-word labels run equal or shorter —
and the conventions below exist so that fitting a string never degrades its
register or its script correctness: the trims come from qualifiers and
postposition chains, never from the honorific morphology or the nukta.

## HI-LABEL · buttons are honorific verb phrases, not noun titles

**Trigger:** writing or reviewing button, menu, and command labels; a label
shipped as a gerund or noun phrase.

**Rule:** an action label is the shortest correct -ें imperative: सहेजें, हटाएँ,
भेजें, रद्द करें, जारी रखें. Not the infinitive-as-title (सहेजना), not a noun
phrase (सहेजने का विकल्प), not the English-shaped bare stem. Non-action labels
(tabs, section headers) are bare nouns or noun phrases with no terminator:
सेटिंग्स, अवलोकन. Devanagari has no letter case, so "Title Case the label" from a
source style guide has no Hindi application — do not simulate it by casing
embedded Latin words up, and do not build title-ish noun compounds to imitate
the English label register. Sentence-ness is carried by punctuation instead: a
full sentence ends in।, a fragment ends in nothing.

**Exception:** where the platform's own convention for a slot is nominal (a
settings tree of noun labels), follow the slot's grammar — the rule picks the
form class per slot, not one class for all slots.

## HI-LENGTH · trim qualifiers and chains, never morphology

**Trigger:** a Hindi string overflowing its surface; a length budget set from
the English source; a translator abbreviating to fit.

**Rule:** budget for asymmetric expansion — flowing text commonly runs 15-25%
longer than English (postposition chains and conjunct width; a published
browser-vendor guide budgets ±20% at the string level), while transliterated
single-word labels are typically 1:1 in syllables and often narrower than a
native compound. The trim ladder when a string overflows, in order:

1. **Cut qualifiers first** — परिवर्तन सहेजें → सहेजें when context carries the
   object.
2. **Choose the shorter settled synonym** — where the termbase offers one (जारी
   रखें beating आगे बढ़ें for a Continue slot is a typical recorded ruling).
3. **Prefer the transliterated noun over a native compound** — a borrow is
   reliably shorter than compounding native words ({count} अलर्ट beats {count}
   चेतावनी सूचनाएं).
4. **Drop the postposition chain in headers** — a narrow column says स्कोर, not
   प्राप्त स्कोर की मात्रा; the bare noun is the abbreviation, because Devanagari
   has no productive initialism convention for running vocabulary.

What never trims: the honorific -ें (a root imperative is a register defect, not
an abbreviation), the nukta, and conjunct integrity — and truncation by the
layout engine must fall on grapheme-cluster boundaries with the real … glyph,
or it corrupts the cluster it cuts.

**Exception:** when a shipped shorter string already exists for the exact slot,
reuse it rather than minting a new trim — a fitted catalog converges on one
short form per action ([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
extends to not re-deriving what a prior pass already fitted).

## HI-ELLIPSIS · the single glyph, in both jobs

**Trigger:** truncation indicators; "loading…" strings; menu items that open
dialogs; three literal periods anywhere in a value.

**Rule:** the ellipsis is the one-character … (U+2026), never three periods.
Both of its UI jobs apply in Hindi as in English: marking a label that opens
further UI (सहेजें…) and marking ongoing action (लोड हो रहा है…). Shipped
corpora that grew by accretion are reliably inconsistent here — hundreds of ...
beside hundreds of … in the same file is the observed norm, and the rule for new
strings is absolute regardless of what the neighboring key does: existing drift
never justifies new drift. An in-progress string plus … takes no danda; the
ellipsis terminates it.

## HI-QUOTES · straight double quotes, one convention per catalog

**Trigger:** quoting a filename, a user-entered value, or a placeholder that
takes arbitrary values; curly quotes or guillemets appearing in a batch.

**Rule:** Hindi has no native quotation glyph; the working convention in
software catalogs is ASCII straight double quotes ("…"), which double as the
oblique-suspension frame around common-noun placeholders (see the agreement
rules). Whichever mark a catalog uses, use exactly one: a reviewer's locale
habit importing curly " " or « » into a straight-quote catalog creates the same
searchability split as a spelling variant. Do not quote Latin embeds merely for
being Latin — quoting marks *mention* (this exact value), not script.

**Exception:** a product typography system that mandates curly quotes across
all locales may extend to Hindi — as a recorded catalog-wide ruling applied by
tooling, never as per-string choice.

## When not to use this

Length tactics do not override terminology rulings: trimming into a different
word for a settled concept is a termbase change, and it goes through the
termbase, not through one overflowing button. And none of this governs layout
engineering itself — line-height for Devanagari's taller vertical metrics, font
fallback, and cluster-safe truncation are the layout system's obligations; this
technique gives the translator's half of the contract.
