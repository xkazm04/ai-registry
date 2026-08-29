---
layer: application
type: application
subject: chinese
technique: character-width-and-typography
stack: spec
source: unicode/uax11@17.0.0
status: forged
verified_on: 2026-08-29
---

# Spec — the width property behind the full-width rules

The technique's glyph rules are stated in the vocabulary of "full-width" and
"half-width" and cite GB/T 15834 and clreq. Neither of those decides what a
renderer actually does with a code point; the Unicode Character Database's
normative `East_Asian_Width` property does, and it disagrees with the
technique on a third of its own prescribed glyphs.

**Pin.** Unicode Consortium, **Unicode Standard Annex #11, *East Asian
Width*, revision 44** (Unicode 17.0.0, dated 2025-07-24),
`https://www.unicode.org/reports/tr11/`, retrieved 2026-08-29
(sha256 `a82167…4f25e`). Data file **`EastAsianWidth-17.0.0.txt`**, header
date 2025-07-24 00:12:54 GMT, from
`https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt`, retrieved
2026-08-29, 201 595 bytes / 2 721 lines, sha256
`ea7ce50f3444a050333448dffef1cadd9325af55cbb764b4a2280faf52170a33`.

**Harness.** Python 3.12.1, ~40 lines, parsing the pinned data file into 2 678
ranges and binary-searching them — no `unicodedata`, no third-party width
library, so the classification is the pinned file's and nothing else. Every
character named by every rule in the technique was classified (n = 48
rule–character pairs over 46 distinct code points), then a nine-string
realistic zh UI sample (n = 90 characters), then an eight-string
spacing-boundary probe.

## The finding: three rules prescribe characters whose width is undecided

§4 ED6 defines **Ambiguous (A)** as characters that are "sometimes wide and
sometimes narrow" and that "require additional information not contained in
the character code" to resolve. §5's display recommendation is explicit: when
the context cannot be established reliably, an A character is treated as
narrow. Of the 46 distinct characters the technique names, **7 are A — and
all 7 are glyphs it prescribes, none are glyphs it rejects**:

| rule | prescribed glyph | `East_Asian_Width` |
| --- | --- | --- |
| ZH-QUOTES (Simplified) | `“` U+201C `”` U+201D `‘` U+2018 `’` U+2019 | **A** |
| ZH-ELLIPSIS | `…` U+2026 | **A** |
| ZH-DASH | `—` U+2014 (and the rival `―` U+2015) | **A** |

Everything the technique *rejects* is settled: the ASCII marks `,.:;!?()"`
are all Na and the full-width forms `０１２％` are all F — 13 of 13. So the
technique never mistakes a form it bans; it over-claims about three of the
forms it recommends.

The consequence is concrete. A zh-Hans string built exactly as the technique
prescribes renders at two different widths for a CJK reader and a non-CJK
one, and the standard says the non-CJK one wins by default. Measured on the
sample, three of nine strings split:

```
正在加载…              cols: 9 (non-EA context) vs 10 (EA context)
点击“确定”以继续       cols: 16 vs 18
网络错误——请稍后重试   cols: 20 vs 22
```

(The doubling is this harness's own convention for exhibiting the split; see
the caveat below — the property resolves to *narrow* or *wide*, not to a
column count.)

**The asymmetry nobody states.** ZH-QUOTES presents `“…”` and `「…」` as a
neutral variant choice. Under the property they are not neutral: the
Traditional corner brackets `「」『』` are **W** (4/4, settled), the
Simplified curly quotes are **A** (4/4, unsettled). A zh-Hant catalog written
to this rule is width-determinate; a zh-Hans one is not. The technique's own
"recorded exception" — a Simplified product adopting `「保存」` for UI-control
callouts — therefore buys width determinism as a side effect it does not
claim, and the sample confirms it: `点击「保存」` is 6/6 W, no split.

## Second-order: an EAW-based spacing linter misses the boundaries that matter

ZH-PANGU's boundary can be detected mechanically from the property alone — a
W/F character abutting an Na/H one. Run over eight probe strings, the detector
finds the boundary in 5, and returns **empty** for the 3 where an A-class
glyph sits on the boundary: `点击“确定”OK`, `网络错误—retry`, `加载中…done`.
A linter built naively on this property would pass exactly the strings where
the technique's own recommended glyphs meet Latin. Any ZH-PANGU
implementation has to decide A explicitly before it can be trusted.

§4.2 offers the tailoring: ambiguous quotation marks resolve **wide when they
enclose and are adjacent to a wide character, and narrow otherwise** — which
is precisely the zh case, and is the rule a ZH-PANGU linter should encode.

## Confirmed, with its n

- **ZH-FULLWIDTH**: all 8 prescribed marks resolve wide (`，：；！？（）` are F,
  `。` is W); all 8 rejected ASCII marks are Na. 16/16.
- **ZH-ENUM**: `、` W, `，` F — both wide, so the enumeration-comma rule is a
  typographic distinction, not a width one. 2/2.
- **ZH-HALFWIDTH-NUM**: ASCII digits, `%`, `$` all Na; `０１２％` all F. 12/12.
- The property is not exotic: 1 271 non-private-use code points carry A
  (138 739 including the private-use planes, which §6.1 defaults to A).

## Where the technique's vocabulary is loose but not wrong

§4.1 states that "fullwidth" and "halfwidth" are **relational** properties of
a *pair* of characters — one explicitly encoded as a compatibility form for
DBCS round-tripping — not unitary properties like "combining". So `。` and
`、` are W, not F; ASCII is Na, not H; and the "half-width space" ZH-PANGU
inserts is U+0020 (Na), not a halfwidth compatibility form (the genuine H
counterpart of `。` is `｡` U+FF61). The rules land on the right glyphs; the
labels would fail a conformance reading. Worth one sentence in the technique,
not a rewrite.

## Not conformance-testable here

Two of the technique's claims are outside this standard's scope and were not
tested against it: that full-width punctuation "carries its own visual
spacing" (a layout assertion — §2 says the annex "does not provide rules or
specifications of how this property might be used in font design or line
layout"), and clreq's quarter-em recommendation. They need the layout
requirements document, not the width property.

**On column counting.** The technique does not conflate width class with
monospace columns — but a reader might, and §2 carries an explicit note that
the property "is not intended for use by modern terminal emulators without
appropriate tailoring on a case-by-case basis." §6.2 adds that for combining
marks the property "cannot be related to the advance width". Length budgeting
for a zh catalog may use this property as an input; it may not use it as a
column count.
