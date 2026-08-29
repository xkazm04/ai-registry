---
layer: application
type: application
subject: korean
technique: spacing-and-typography
stack: spec
source: unicode/uax14@17.0.0
status: forged
verified_on: 2026-08-29
---

# The line-breaking standard, read against the spacing anchors

Korean is the one CJK-adjacent script with real inter-word spacing, so the
character standard has to take a position on whether that spacing governs
wrapping. It does — and the position is the opposite of what KO-WIDTH's
"space-break vs. syllable-break is a layout setting" implies about defaults.
Reading the standard also turns three anchors the technique states as
orthographic taste (KO-PUNCT, KO-QUOTES, KO-DASH) into rules with measurable
wrapping consequences.

## The pin

- Unicode Standard Annex #14, *Unicode Line Breaking Algorithm*, revision 55,
  Unicode 17.0.0 — `https://www.unicode.org/reports/tr14/`, retrieved
  2026-08-29.
- `LineBreak-17.0.0.txt` (dated 2025-07-29), from
  `https://www.unicode.org/Public/UCD/latest/ucd/LineBreak.txt`, retrieved
  2026-08-29, sha256 `e6a18fa91f8f6a6f8e534b1d3f128c21ada45bfe152eb6b1bcc5e15fd8ac92e6`.
- `LineBreakTest-17.0.0.txt` (dated 2025-07-24), from
  `.../ucd/auxiliary/LineBreakTest.txt`, retrieved 2026-08-29, sha256
  `e69884e0dde6a8724873f885d68c52dc14518abf9ae4ca9e2283b8773db3b752`.
- Supporting property files for the harness, same retrieval date:
  `UnicodeData.txt` (`2e1efc1d…96470c`), `EastAsianWidth.txt` (`ea7ce50f…170a33`),
  `emoji/emoji-data.txt` (`2cb2bb94…07b72b`).

## The harness

Rules LB1–LB31 of §6.1–§6.2 implemented from the annex text, then scored
against the standard's own conformance data: **19338/19338 test lines pass
(100%)**, of which the Hangul-relevant subset — every line containing a
character of class H2, H3, JL, JV or JT — is **2677/2677**. Scope stated
plainly: the whole published rule set is implemented, including the parts
Korean never exercises (Brahmic LB28a, regional indicators, emoji); no
tailoring is applied in the conformance run, as the test file requires.
The same engine then evaluates Korean fixtures in two modes. Those fixtures
are derived, not conformance data — they are trustworthy only because the
engine that produces them scores 100% on the published cases.

## The default is syllable-break, and space-break is a named tailoring

Precomposed Hangul syllables carry class H2 (LV) or H3 (LVT); conjoining
jamo carry JL/JV/JT (`LineBreak.txt`: U+AC00 → H2, U+AC01 → H3, U+1100 → JL,
U+1161 → JV, U+11A8 → JT). LB26 forbids breaking *inside* a syllable block;
LB27 then makes the block behave as class ID. Nothing forbids a break
*between* two blocks, so LB31 permits one. The annex says so outright in the
H2 and JL descriptions (§5.1): the default class is ID, which supports Korean
documents *not* using space-based line breaking, and space-based documents
require tailoring Hangul and jamo to class AL.

Run under the published default, `파일을 저장했습니다` breaks at every
syllable: `파|일|을 |저|장|했|습|니|다`. Under the tailoring the annex names
(H2/H3/JL/JV/JT and ID → AL) it breaks only at the space:
`파일을 |저장했습니다`.

So KO-WIDTH's sentence is **confirmed but backwards in emphasis**: it is a
layout setting, and the setting a layout gets for free is the one that
ignores 띄어쓰기 entirely. §3.1 and §8 record why both modes are real —
justified Korean uses character breaking (more opportunities, better
justification), ragged-margin Korean uses spaces (§8.2, Example 3). A Korean
UI catalog is ragged-margin text; its wrapping is correct only if the layout
opted in.

## Where Unicode's authority stops

The technique cites 한글 맞춤법 for KO-SPACING. That boundary is exact and
worth keeping exact: word spacing, particle attachment and dependent-noun
spacing are a national orthography rule, and the character standard encodes
none of them. UAX #14 assigns no property that distinguishes a particle from
a stem, and its *default* deliberately declines to treat the orthographic
space as privileged. The Unicode-side claim is only this: there exist two
conformant modes, and one of them makes the orthography's spaces the sole
break points. KO-COMPOUND (solid vs. spaced compounds) has no Unicode
surface at all — **not conformance-testable**, and correctly left to the
termbase.

## The punctuation anchors are wrapping rules, not only taste

Evaluated in the space-based tailoring — the mode a Korean UI should be in —
each of these choices is the difference between one unbreakable run and two.

| technique's rule | conforming form | the other form | why |
| --- | --- | --- | --- |
| KO-PUNCT half-width parens | `설정(고급)` holds | `설정｜（고급）` breaks | LB30 excludes East Asian OP/CP |
| KO-QUOTES straight quotes | `설정"고급"항목` holds | `설정｜「고급」｜항목` breaks | corner brackets are East Asian OP/CP |
| KO-QUOTES, curly variant | — | `“고급”｜항목` breaks | LB19's `[QU − Pf] ×` exempts Pf quotes |
| KO-DASH em dash | ASCII `설정--｜고급` (no break before) | `설정｜—｜고급` | `—` is class B2; LB17 binds only B2–B2 |

The em-dash row is the uncomfortable one: normalizing `--` to `—` is right
typographically and **adds** a break opportunity before the dash, so a line
can now start with a dash. The technique should keep the normalization and
know the cost.

KO-ELLIPSIS is safe either way: LB22 (`× IN`) protects `중…` and LB15d
(`× IS`) protects `중...`, in both modes. The single-glyph ruling is
convention, not breakage — **not conformance-testable**, and honestly so.

## Brace placeholders orphan the particle

KO-SPACING says the particle glues to a placeholder exactly as it glues to
Hangul. Orthographically yes; for wrapping, no. In the space-based tailoring:

- `철수님이 |오셨어요` — Hangul host holds (LB28, AL × AL)
- `Slack이 |오셨어요` — Latin host holds (LB28)
- `(name)이 |오셨어요` — parenthesis host holds (LB30, CP × AL)
- `%s이 |오셨어요` — printf host holds (LB24, PO × AL)
- `{name}|이 |오셨어요` — **brace host breaks**

`}` is U+007D, class **CL**, not CP; LB13 forbids a break *before* it and no
rule forbids one *after* it, so LB30's parenthesis exemption never reaches
the particle. Every ICU-MessageFormat and i18next-style key can therefore
wrap with the Korean particle alone on the next line, in the one placeholder
syntax the technique's own examples use (`{name}이(가) 연결되었습니다`).
This is a real defect class the anchors do not name, and it is invisible in
the default mode because everything breaks there anyway.

## What could not be settled here

Whether a given renderer applies the Korean tailoring is outside the annex
(the annex only names it), so the class of a production defect — bad string
vs. unconfigured layout — still needs a runtime witness; none was measured.
