---
layer: technique
type: technique
subject: german
technique: typography-and-spacing
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [auditing punctuation and spacing in a German catalog, fixing quotes dashes or ellipses in German strings, spacing numbers units and percent signs]
---

# Typography and spacing

German typography differs from English at the glyph level — different quote
marks, a different dash, mandatory spaces English omits — and every difference
is mechanically auditable, which makes this the highest-yield cheap pass over
a German catalog: the rules are unambiguous, the violations are countable, and
most fixes are safe to apply in bulk. The one discipline the bulk pass needs:
these are exactly the rules a house most often deliberately overrules, so
check for a recorded house ruling before enforcing the default
([the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)).

## DE-DASH · The Gedankenstrich is a spaced en dash

> **Trigger** — any dash used as punctuation in German prose.
> **Rule** — German's thought-dash is the **en dash – (U+2013) with a space
> on both sides**. The em dash — (U+2014), spaced or unspaced, is an English
> device. Unspaced en dash serves ranges (*3–5 Tage*, *Mo.–Fr.*) and the
> spaced hyphen serves nothing (a bare " - " as punctuation is a typo in both
> languages).
> **Source** — the vendor style guide's dashes section names the en dash as
> the German Gedankenstrich and files the em dash under English usage;
> standard German typographic practice agrees.
> **Exception** — houses overrule here more than anywhere: one real product
> bans dash-as-punctuation entirely (recasting with full stops, colons and
> comma pairs, keeping – only in ranges); another standardized on the spaced
> em dash because its shipped catalog already carried hundreds of them. Both
> are legitimate *recorded* rulings. Absent a ruling, the spaced en dash is
> the German default — and an audit that finds the em dash count of a German
> page tracking its English source one-for-one has found copied punctuation,
> not a ruling.

## DE-QUOTES · German quotes are „low-high"

> **Trigger** — any quotation marks in German strings.
> **Rule** — opening **„** (U+201E, on the baseline), closing **“** (U+201C,
> at cap height): „Beispiel“. Straight ASCII quotes are unlocalized source
> punctuation; guillemets belong to other locales (French style) and to a
> deliberate Swiss variant (»…« or «…» conventions differ) — never mix
> systems in one catalog. Nested quotes use the single low-high pair
> (‚…‘).
> **Source** — standard German orthography and every vendor guide for
> German.
> **Exception** — none for direction; the recurring *defect* is asymmetric
> pairs from copy-paste — a correct „ opener closed with a straight " —
> which survives visual review because one glyph looks right. Audit pairs,
> not glyphs.

## DE-ELLIPSIS · One character, and it earns its space

> **Trigger** — trailing or inline ellipsis.
> **Rule** — the single character **…** (U+2026), never three periods.
> Attached directly to a truncated word or a trailing-off UI label
> (*Laden…*, *Wird ausgeführt…*); separated by a space when standing for
> omitted words in prose.
> **Source** — vendor guide punctuation section; standard practice.
> **Exception** — none. Real catalogs measured before cleanup have run
> two-to-one literal `...` against real `…`; the fix is safe in bulk.

## DE-NBSP · Non-breaking space between number and what it measures

> **Trigger** — a number followed by a unit, symbol, or currency: 50 %,
> 15 GB, 45 min, 240 €, 10 Min.
> **Rule** — German writes a space there (the widely applied convention for
> German business writing, DIN 5008, specifies it — including before **%**,
> where English writes none), and in UI strings that space must be
> **non-breaking** (U+00A0) so the value never wraps away from its unit. The
> same applies inside abbreviations (*z. B.*, *d. h.*) and between an
> ordinal-numbered item and its noun where a break would orphan the digit.
> **Source** — DIN 5008 spacing conventions; the vendor guide's symbols and
> non-breaking-space section.
> **Exception** — degree-plus-scale (*25 °C*: space before °C) versus bare
> degree (*45°*: closed); and a house may adopt the narrow no-break space
> (U+202F) before % and units for finer typography — a recorded refinement,
> not a conflict.

The percent rule is the most commonly half-applied convention in real German
catalogs — measured splits run roughly half spaced, half unspaced, because
each translator defaulted differently. It is also the clean case study in
sweep discipline: a two-key fix inside a thirteen-key split deepens the
inconsistency, so the spacing convention is decided once and swept once,
catalog-wide.

## What German does NOT need

Worth stating, because generic localization checklists waste review passes
here: no bidi controls, no RTL marks, no full-width punctuation, no
zero-width joiners, no shaping concerns. German's script-level needs are the
umlauts (ä ö ü Ä Ö Ü), ß/ẞ, correctly typed quotes/dashes/ellipsis, and the
non-breaking spaces above — all of it plain Latin-1/Unicode text with no
layout-engine implications. Decimal comma and dot-grouped thousands
(1.234,56 €) are real and locale-defining, but they live in runtime number
formatting, never hardcoded into string values.

## When not to use this

Do not run the bulk fixes inside placeholders, code spans, or message-format
syntax — a quote or brace inside the machine-readable skeleton is not
punctuation and must not be "corrected". And do not enforce the DE-DASH
default against a product with a recorded dash ruling; the finding there is
"string violates the house ruling", citing the ruling, not this rule.
