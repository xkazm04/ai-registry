---
layer: technique
type: technique
subject: chinese
technique: character-width-and-typography
status: forged
laws: [every-finding-cites-an-anchor, the-authority-is-a-hypothesis]
shared_with: []
use_when: [auditing punctuation in a zh catalog, deciding the CJK-Latin spacing convention, choosing quote glyphs for a variant]
---

# Character width and typography

Chinese punctuation is a parallel set of full-width glyphs, not the ASCII set
rendered in a CJK font. Half-width residue surviving from the English source
is the highest-volume defect class in machine-assisted Chinese catalogs, and
every rule here is mechanically greppable — which makes this technique the
cheapest large win in any zh audit. The citable authorities are the mainland
punctuation standard GB/T 15834 and W3C clreq (Requirements for Chinese Text
Layout).

One vocabulary caution first, because it decides what these rules can be checked
*against*. In the Unicode width property, "fullwidth" and "halfwidth" are
**relational** — properties of a compatibility *pair*, not labels a character
carries on its own. 。 and 、 are Wide, not Fullwidth; ASCII is Narrow, not
Halfwidth; and the true halfwidth partner of 。 is ｡ U+FF61, not a period. Every
rule below is exact as an **identity** check — this code point rather than that
one, which is how an audit actually uses them — and none of them is a width
*measurement*. The distinction is inert until something budgets length or derives
spacing from width, at which point see ZH-WIDTH-UNDECIDED.

## ZH-FULLWIDTH · sentence punctuation is full-width, with no spaces around it

**Trigger:** any punctuation inside Chinese prose.
**Rule:** Chinese sentences take the full-width set — ，。：；！？（）— never
ASCII `, . : ; ! ? ( )`. Full-width punctuation carries its own visual
spacing: never add a space before or after it. A space after a 。 or before a
（ is English muscle memory and a citable defect.
**Boundary:** punctuation inside embedded Latin/code fragments stays ASCII
(`config.json`, a CLI flag); the rule governs the Chinese sentence, not its
Latin islands.

## ZH-ENUM · the enumeration comma 、 for sibling items

**Trigger:** a list of parallel items inside one sentence.
**Rule:** siblings in an enumeration are joined by 、 (顿号), not ，:
支持文本、图片、音频三种格式. The full comma ， separates clauses; the
enumeration comma separates list members. Rendering an English "A, B, and C"
with three ， is a translation tell; so is joining the last pair with 和 *and*
a 、 at the same time — 、 replaces the serial comma structure entirely, with
和/或 optionally before the final item.

## ZH-QUOTES · quote glyphs are a variant decision

**Trigger:** quoted speech, cited titles, or highlighted terms.
**Rule:** Simplified Chinese (mainland, per GB/T 15834) quotes with curly
double quotes “…” (nested: ‘…’). Traditional Chinese (Taiwan) quotes with
corner brackets 「…」 (nested: 『…』). Straight ASCII `"…"` is reserved for
literal code/CLI content and never used in prose. The variant decides the
glyph — do not carry mainland “…” into a zh-Hant catalog or 「…」 into formal
Simplified prose.
**The recorded-exception mechanism:** a Simplified-Chinese product may adopt
「…」 for one narrow job — calling out a UI control or literal example value
inline (点击「保存」) — because corner brackets are visually unambiguous next
to curly quotes doing quotation work. That is a legitimate house convention
exactly when it is written down in the product's style artifact with the
boundary stated; unrecorded, it is drift between translators.

## ZH-WIDTH-UNDECIDED · three prescribed glyphs have no width of their own

**Trigger:** any length budget, alignment check, or CJK/Latin spacing linter that
reads character width; any plain-text surface whose rendering context is unknown.
**Rule:** the Unicode width property marks a large set of characters
**Ambiguous** — their width depends on the surrounding context rather than on the
code point, and where context cannot be established reliably they resolve
*narrow*. Three glyphs this technique prescribes sit in that set: the Simplified
curly quotes “ ” ‘ ’, the ellipsis …, and the em dash —. Everything the technique
*rejects* is settled by comparison, so the entire exposure is on the recommended
side, not the banned one.
**The variant asymmetry this creates:** ZH-QUOTES presents “…” and 「…」 as a
neutral Simplified/Traditional choice. Under the width property they are not
neutral — the corner brackets are Wide and settled, the curly quotes Ambiguous.
**A zh-Hant catalog written to that rule is width-determinate; a zh-Hans one is
not**, and the same string can occupy different space for a CJK reader and a
non-CJK one. The recorded 「…」 exception above buys width determinism as a side
effect, which is a second reason to record it.
**Consequence for ZH-PANGU:** a spacing linter that derives the Han/Latin
boundary from the width property alone silently passes every boundary where one
of these three glyphs sits — which is to say, precisely the strings this
technique's own recommendations produce. Resolve the ambiguous characters before
trusting such a check: the standard's own guidance is that ambiguous quotation
marks resolve wide when they enclose and are adjacent to a wide character, and
narrow otherwise.
**This is not a reason to change the glyphs.** The typography rules stand. What
changes is that a width-derived *check* over them needs the resolution step
first, and a plain-text length budget may not assume these three are wide.
**Uncovered by the rules above:** the separator · (间隔号) used between parts of a
transliterated foreign name is also Ambiguous, and no rule here names it.

## ZH-ELLIPSIS · one ellipsis convention, no ASCII dots

**Trigger:** any trailing-off, truncation, or loading indicator.
**Rule:** never ASCII `...`. The standard Chinese ellipsis in prose is the
six-dot …… (two U+2026); UI microcopy (加载中…, truncation) conventionally
uses a single …, and a product records which it uses where. The defect to
audit is `...`: in one real catalog ~483 raw ASCII ellipses were leftover MT
output sitting alongside a correct minority — residue, not precedent.

## ZH-PANGU · one spacing convention between Han and Latin runs, held uniformly

**Trigger:** a Latin word, acronym, brand, or numeral run adjacent to Chinese
text.
**Rule:** decide the spacing convention once and apply it to every string.
The two defensible conventions: (a) insert one half-width space on each
CJK/Latin boundary — 使用 CLDR 数据, 共 3 项 — or (b) no space, relying on the
renderer. Convention (a) is this subject's recommended default for plain-text
UI catalogs: clreq specifies visual spacing (up to a quarter em) between Han
and Western characters, and in plain text where no renderer supplies it, the
explicit space is the only way to get it. What is never acceptable is mixing —
spaced in one string, jammed in the next — because the inconsistency is
visible on a single screen.
**Sub-rules either way:** no space between Chinese and *full-width*
punctuation; no space inside a placeholder's braces; the space, when used,
goes outside quote glyphs, not inside.

## ZH-HALFWIDTH-NUM · digits and unit symbols stay half-width

**Trigger:** numbers, percentages, currency inside Chinese text.
**Rule:** European numerals, `%`, and currency symbols stay half-width ASCII
even mid-sentence — 50%, $12, 3 项 — never full-width digits （０１２） or ％.
Full-width digits are a legacy-input artifact; a single stray ％ in a catalog
of half-width ones is a bug to fix, not a precedent to count.

## ZH-DASH · the parenthetical dash is doubled and unspaced

> **Trigger** — an em-dash setting off a parenthetical clause.
> **Rule** — Chinese uses the doubled, unspaced **——**, never a single
> `—` with English-style surrounding spaces. The single-spaced-dash calque
> travels with translated copy and recurs independently across unrelated
> strings.
> **Provenance** — harvested 2026-08 from a cross-locale review wave where
> six strings carried the calque beside two correct doubled-dash instances;
> ZH-FULLWIDTH's glyph list did not enumerate the dash.

## When not to use this technique

Do not apply these rules inside do-not-translate content: code blocks, CLI
examples, JSON fragments, and identifiers keep their ASCII punctuation
byte-exact — "fixing" a comma inside a code sample is a skeleton break, the
critical class of defect, not a typography improvement. And do not hand-space
for line-breaking: breaking behavior (including the 避头尾 prohibition rules)
belongs to the layout engine, not to the string.
