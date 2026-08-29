---
layer: application
type: application
subject: japanese
technique: character-width-and-typography
stack: spec
source: unicode/uax11+uax14@17.0.0
status: forged
verified_on: 2026-08-29
---

# Reconciled against the Unicode width and line-breaking annexes

## The pin

Unicode 17.0.0, retrieved 2026-08-29 from `unicode.org`.

| artifact | header version / date | sha256 (first 16) |
| --- | --- | --- |
| `UCD/latest/ucd/EastAsianWidth.txt` | 17.0.0, 2025-07-24 | `ea7ce50f3444a050` |
| `UCD/latest/ucd/LineBreak.txt` | 17.0.0, 2025-07-29 | `e6a18fa91f8f6a6f` |
| `UCD/latest/ucd/auxiliary/LineBreakTest.txt` | 17.0.0, 2025-07-24 | `e69884e0dde6a872` |
| UAX #11 *East Asian Width*, rev 44 | `reports/tr11/tr11-44.html` | `a82167102910152a` |
| UAX #14 *Unicode Line Breaking Algorithm*, rev 55 | `reports/tr14/tr14-55.html` | `dfa75adac235aaaf` |

## The harness

A from-scratch implementation of the UAX #14 default algorithm — LB1 through
LB31, including LB9 combining-sequence clustering, the LB15a–d quotation and
decimal-mark rules, the LB25 numeric back-scan, LB28a Brahmic syllables, LB30's
East-Asian exclusion, and LB30a regional-indicator parity — driven by the three
pinned data files plus `DerivedGeneralCategory.txt` and `emoji-data.txt` at the
same version. It resolves LB1 in two modes: the annex default (CJ → NS) and the
tailoring the annex itself names (CJ → ID).

**Conformance run: 19338 / 19338 cases pass, 0 fail** against the standard's own
`LineBreakTest.txt`. Restricted to cases whose every code point carries an
original class the technique's claims depend on (ID, CJ, CL, CP, OP, EX, NS, AL,
NU, IS, QU, BA): **648 / 648 pass**. Every verdict below is that validated
implementation's output on a Japanese fixture, not a reading of the prose.

## Confirmed

**The kinsoku prohibitions the technique names are exactly the standard's.**
`保存。確認` yields no break before 。, and the same for 、）」 (all
`Line_Break=CL`, rule LB13 `× CL`) and ！？ (`EX`, LB13 `× EX`). `確認「保存`
yields no break after 「, and the same for 『（ (`OP`, LB14 `OP SP* ×`). Six
closing marks and three openers, nine fixtures, nine agreements.

**Breaking between kana and kanji is otherwise free.** `ひらがなカタカナ漢字`
admits a break at all nine interior positions (`ID`, LB31 `ALL ÷`). The
technique's "lines may break between almost any two characters" holds.

**The wave-dash pair is real.** 〜 U+301C and ～ U+FF5E are distinct code points
with distinct properties in both files.

## Sharpened

**The kinsoku rules are in the *tailorable* half of the annex.** LB13 and LB14
sit in §6.2 *Tailorable Line Breaking Rules* (the non-tailorable set ends at
LB12). Conformance clause UAX14-C1 permits a process to tailor them, subject to
one condition: the tailoring **must be disclosed**. The technique's "these rules
are public and standardized" is true, but the standard's requirement is
disclosure of the deviation, not obedience — the same shape as JA-LATIN-BOUNDARY
and as the law this technique already carries.

**Small kana and the chōonpu are a documented product choice, not a rule.**
ゃゅょっ and ー all carry `Line_Break=CJ`, *Conditional Japanese Starter*. LB1
resolves CJ → NS by default, which is what the technique states; but §5.1's
description of the class says plainly that treating CJ as NS gives strict
breaking and treating it as ID gives normal breaking — "the behavior typically
used for books and documents". Measured: `キゃト` gives no break before ゃ under
the default and **a break before ゃ** under the CJ → ID tailoring; same for
ゅょっー, ten fixtures, five flips. So the technique states as an absolute the
strict end of a two-valued choice the standard deliberately leaves open. This is
a JA-LATIN-BOUNDARY-shaped decision — decide once, record the ruling — not a
defect to file against a renderer.

**The wave-dash choice changes line breaking, not just encoding.** 〜 U+301C is
`NS` (and `ea=W`); ～ U+FF5E is `ID` (and `ea=F`). Measured on `10〜20件` vs
`10～20件`: U+301C forbids a break before the dash (LB21 `× NS`), U+FF5E permits
breaks on both sides. The technique frames the pair purely as a mojibake trap;
picking one is also a kinsoku decision.

**： is a kinsoku character the technique's list omits.** ！？ are `EX`, but ：
U+FF1A is `NS`, so LB21 `× NS` forbids a break before it just as firmly. The
kinsoku rule lists 。、）」！？ and stops.

## Refuted

**"A URL is the one thing that CANNOT break freely" is false for URLs, true for
identifiers.** Measured on `確認https://a.example/b-c_d?x=1確認`: the default
algorithm offers **four** interior break opportunities — after `//`, after the
path `/`, after the `-` (LB21 protects the position *before* a hyphen, not after
it), and after the `?`. By contrast `確認LongIdentifierName確認` offers **zero**
(LB28 `AL × AL` throughout). The unbreakable object is an unpunctuated Latin
run, not a URL.

The interesting inverse: `12/34` is entirely unbreakable (LB25 `NU (SY|IS)* ×
NU`), so a numeric path segment following a digit — `.../2026/08/29/...` —
welds shut, while `v2/api` breaks after the solidus. §8 of the annex flags this
as the case URL-heavy text may want to tailor.

## Not conformance-testable, and one non-defect

**The width half of the technique cannot be executed** — UAX #11 ships no
conformance artifact, only the property file. What the property file *does*
show, classified against the pinned `EastAsianWidth.txt`:

- The technique's opening premise ("full-width and half-width characters are
  different code points") is a **relational** claim in the standard's terms, not
  a per-character one. §4.1 states that fullwidth and halfwidth are properties of
  a *pair* of characters, and that a character not explicitly marked as either is
  neither. 。、「」 are `ea=W`, not `ea=F`; their halfwidth partners are the
  separate U+FF61/FF64/FF62/FF63 (`ea=H`), not ASCII. （）：！？ are genuinely
  `ea=F`.
- **Three of the glyphs the technique prescribes are `Ambiguous`.** … U+2026,
  — U+2014 and ― U+2015 all carry `ea=A`, whose width §4.2 makes dependent on
  context — font, language tag, source encoding — and unresolvable from the code
  point. ― is `Line_Break=AI` on top of that, resolved by criteria the annex
  places outside its own scope. The curly quotes the technique bans as
  "full-width" are also `ea=A`, not `F`. So the rules are mechanically checkable
  as *identity* checks, which is what the technique actually uses them for; they
  are not checkable as *width* checks, which the framing sentence claims.
- **The column-count conflation is absent here.** Nothing in this technique
  budgets string length in columns from width classes. The sibling technique
  budgets "in ems", the unit §1 of UAX #11 itself uses. Worth recording because
  §2 warns that the property is not an off-the-shelf solution for terminal
  emulators without per-case tailoring.
- Half-width katakana (`ea=H`; ｧ..ｰ are also CJ) is named nowhere in the
  technique; both annexes give it first-class treatment.
