---
layer: technique
type: technique
subject: arabic
technique: script-and-typography
status: forged
laws: [the-authority-is-a-hypothesis, one-concept-one-rendering]
shared_with: []
use_when: [auditing punctuation and numerals in an ar catalog, setting typography rules for Arabic UI text, deciding Eastern vs Western digits for a market]
---

# Script and typography

Arabic script is cursive, caseless, and contextually shaping: every letter
takes a different glyph by position, and letters join. That deletes some
English typographic instincts outright and makes others actively destructive.
The rules below are the string-level typography an audit can enforce; font
selection and line-height belong to the design system.

## AR-PUNCT · Arabic punctuation inside Arabic prose

Inside an Arabic sentence, use the Arabic punctuation set:

- comma `،` (U+060C), never Latin `,`
- question mark `؟` (U+061F), never Latin `?`
- semicolon `؛` (U+061B)
- quotation: guillemets `« »` around Arabic content
- ellipsis: single-glyph `…`, not `...`; em dash `—`, not `--`

Latin punctuation survives only inside embedded literals that are themselves
Latin — code, URLs, identifiers, a quoted English value (straight quotes
around a Latin literal are correct: they mark code, not prose). The mixed
cases follow the content, not the sentence: an Arabic sentence quoting a Latin
token keeps straight quotes around the token, Arabic comma between clauses.
Machine translation is inconsistent here in both directions (Latin `?` kept,
or `،` forced into a code fragment), so AR-PUNCT is a high-volume audit
anchor, and it is mechanically checkable: a Latin `,` or `?` adjacent to
Arabic letters is a finding.

## AR-NUMERALS · One digit system per product-market, decided once

The genuine per-market question: Western digits `0-9` (called Western Arabic
numerals) versus Eastern Arabic-Indic digits `٠١٢٣٤٥٦٧٨٩`. The settled facts:

- CLDR defaults most `ar` locales (including the Gulf and Egypt) to
  Arabic-Indic digits, with the Maghreb locales on Western digits — that is
  the *traditional print* answer.
- Most software products override to **Western digits everywhere**, because
  their strings are dense with inherently-Latin numerics (versions, ports,
  codes) and one digit system per string is non-negotiable.

Either answer is legitimate. The rule is that the product decides **once per
market (usually once, product-wide)**, records the decision, and every string
complies; and before enforcing either default against an existing catalog,
count what the catalog actually does — a coherent catalog beats the
authority's default, per
[the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).
The recurring defect is MT "helpfully" flipping `24` to `٢٤` string by string
in a Western-digit catalog: mechanical to detect (any `٠-٩` in a Western-digit
product is a finding, and vice versa), and worth a dedicated check because it
reintroduces itself with every MT-assisted pass.

Percent stays glued Latin-style in a Western-digit product: `{pct}%`, digit
then sign — not the Arabic percent `٪` and not sign-before-number, even
though print journalism sometimes does both. In an Arabic-Indic product, `٪`
pairs with Eastern digits; the point is the pairing never mixes.

## AR-NO-KASHIDA · No letter-spacing, no kashida, no fake emphasis

Never letter-space Arabic text (the English "tracking for emphasis" habit) —
spacing breaks the joins and renders the word as disconnected letter forms,
which is not emphasis but damage. Kashida (tatweel, U+0640 — the elongation
stroke) does not belong in UI strings either: not for justification (that is a
print-typesetting technique requiring real typographic control), not for
emphasis, and never *inside catalog values*, where a stray tatweel changes the
string's bytes and breaks exact-match tooling while looking almost identical.
There is likewise no ALL-CAPS: emphasis in Arabic UI is carried by weight,
color, or phrasing. And do not import neighboring-script habits: Arabic needs
no ZWNJ discipline — that is a Persian/Urdu concern; a ZWNJ in an Arabic
string is copied cargo, remove it.

Audit note: U+0640 and U+200C in Arabic values are mechanically detectable
and near-always defects.

## AR-TASHKIL · Diacritics off by default, on by deliberate exception

UI prose is undiacritized — MSA readers read bare skeletons all day, and full
tashkil in a UI reads as a children's textbook. The deliberate exception:
**selective diacritics on a word whose bare skeleton genuinely misleads in
context** — typically technical nouns and participles where active/passive or
noun/instrument readings collide: مُشغِّل (trigger/player) vs مشغل, مُعطَّل
(disabled) vs معطل, مُفعَّل (enabled). Decision rule: add the minimum marks
that force the intended reading, only where a plausible reader would misread,
and record each diacritized term so it renders identically everywhere
([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)
covers the spelling, not just the word choice — مُشغّل and مشغّل drifting
between strings is a defect). Over-applying this rule — diacritizing ordinary
sentences "for clarity" — was the reverted extreme: it bloats strings, breaks
search/exact-match, and patronizes the reader.

## Casing analog

Arabic has no letter case, so "sentence case vs Title Case" questions
translate into different signals: the definite article الـ on nav/section
labels versus the bare masdar on controls (the rule itself lives in
register-and-address, AR-MASDAR), and Latin acronyms embedded in Arabic keep
their original casing untouched — `API`, `JSON`, never re-cased or respelled
(ownership in terminology-and-loanwords). A reviewer asked to "match the
source's casing" in Arabic should read that instruction as: preserve embedded
Latin casing exactly, and apply the article convention — nothing else exists
to case.

## When NOT to apply

Content that is itself quoted verbatim — user input echoed back, code blocks,
legal text supplied by another party — keeps its own punctuation and digits;
normalizing inside a quotation falsifies the quote. And when a rendered
defect is really a font or shaping-engine failure (disconnected letters with
no tatweel in the string), the finding goes to the platform, not the catalog.
