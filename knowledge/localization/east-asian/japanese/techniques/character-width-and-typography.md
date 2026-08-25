---
layer: technique
type: technique
subject: japanese
technique: character-width-and-typography
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [auditing Japanese strings for width and punctuation defects, setting a house convention for Japanese-Latin boundaries, checking line-breaking behavior for a Japanese layout]
---

# Character width and typography

Full-width and half-width characters are different code points, so nearly every
rule in this technique is mechanically checkable: a reviewer can find these
defects by character class alone, without reading for meaning. That makes this
technique the cheapest, highest-yield audit pass Japanese has — run it first.

## JA-FULLWIDTH-PUNCT · Japanese prose takes full-width punctuation

**Trigger:** punctuation authored inside Japanese text.

**Rule:** use the full-width forms — 。 、 （ ） ： ！ ？ — never the
half-width ASCII . , ( ) : ! ? inside a Japanese sentence. Half-width
punctuation embedded in Japanese prose is the classic artifact of translating
through an English-first pipeline.

**Source:** JTF style guide (punctuation tables); every major vendor guide
agrees on 。 and 、 for prose. The JTF permits half-width . and , in specific
technical-document conventions — that is a document-level choice, and mixing
the two conventions in one catalog is the actual defect.

**Exception:** punctuation that is part of a machine-readable token
(a placeholder, a version number, a URL, a code literal) keeps its half-width
form untouched — it belongs to the skeleton, not the prose.

## JA-HALFWIDTH-LATIN · Latin and digits are half-width

**Trigger:** embedded English words, acronyms, numerals, unit symbols,
placeholders.

**Rule:** always half-width (API, CPU, 3, %, {count}) — never the full-width
look-alikes（ＡＰＩ, ３）. Full-width Latin is a legacy of CJK text fields and
reads as broken in modern software. Also preserve the term's own casing
exactly; Japanese has no case, so the Latin term's published casing is the
only casing authority.

**Source:** JTF style guide (alphanumerics are half-width); consistent across
vendor guides.

## JA-NO-WORD-SPACE · no spaces inside Japanese

**Trigger:** any space between two Japanese characters.

**Rule:** Japanese does not separate words with spaces. A space between
Japanese words is a defect (usually a machine pass echoing English
tokenization). Spacing for visual grouping is the renderer's job, not the
string's.

**Exception:** a deliberate space as a list/chip separator inside one string,
and the space that a house Latin-boundary convention mandates (next rule).

## JA-LATIN-BOUNDARY · the Japanese–Latin seam is a house constant

**Trigger:** a Japanese run meeting a half-width Latin/numeral run —
`APIを確認` vs `API を確認`.

**Rule:** the public authorities disagree here: the JTF style guide says no
space between full-width and half-width characters; several vendor traditions
and much of Japanese technical publishing insert a half-width space for
legibility. Therefore: **decide once per product, record the ruling, and
enforce it as a constant.** The per-string defect is not either choice — it is
inconsistency with the recorded choice. Per
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis),
when the shipped catalog is coherent one way, that way wins and the ruling is
written down.

**Universal sub-rule:** no space between a Latin acronym and a katakana word
it compounds with — APIキー, MCPサーバー — because that is one word, not a
boundary between runs.

## JA-KAGI-QUOTES · 「」 for quotation and UI references

**Trigger:** quoting a UI label, a name, or speech inside a Japanese sentence.

**Rule:** use kagi brackets — 「保存」をクリックします — never ASCII "..."
and never full-width curly quotes. Nested quotation uses 『』. This doubles as
the standard way to mark a UI element name in instructions, a role English
gives to bold or Title Case.

## JA-REAL-GLYPHS · typographic glyphs, not typewriter substitutes

**Trigger:** ellipsis or dash authored in Japanese text.

**Rule:** real ellipsis … (U+2026), never three ASCII periods; a real dash
(— U+2014, or the traditional doubled ―― in literary contexts), never `--`.
ASCII substitutes arrive with machine passes and then get copied forward as
house style by accident — treat existing ones as debt to fix opportunistically
and never introduce new ones.

**Caution:** the wave dash ～ is conventional in Japanese for ranges
(10～20件) but is a notorious encoding-mojibake trap across platforms (two
near-identical code points, U+301C and U+FF5E, with a long history of
round-trip corruption); a catalog that ships it should pick one code point
deliberately or use から instead.

## JA-KINSOKU · line breaking is rule-driven, and layout must honor it

**Trigger:** reviewing a Japanese layout, or writing strings for narrow
containers.

**Rule:** because Japanese has no word spaces, lines may break between almost
any two characters — except where 禁則処理 forbids it: closing punctuation
（。、）」！？, small kana（ゃゅょっ）and the chōonpu ー must not start a line;
opening brackets（「『（）must not end one. These rules are public and
standardized in the W3C's Requirements for Japanese Text Layout (JLReq),
which is the citable authority when a rendering stack must be configured.

**What the localizer owes the layout:** this is mostly the renderer's job
(CSS `line-break`/`word-break`, a platform text engine), but the string author
must (a) never insert manual line breaks to "help" wrapping — they become
mid-word breaks at every other width; (b) know that a long Latin token
embedded in Japanese (a URL, an identifier) is the one thing that CANNOT break
freely and will overflow a narrow container long before the Japanese does; and
(c) flag a rendering stack that breaks lines before 。 or after 「 as a layout
bug with this rule as the anchor, not as a translation defect.

## When not to apply this technique

Inside code literals, placeholders, and do-not-translate tokens, the source's
characters are the law — width-normalizing a placeholder name into full-width
is a skeleton break, the worst defect this bundle knows. And do not apply
Japanese punctuation rules to embedded foreign-language sentences quoted
whole; they keep their own typography.
