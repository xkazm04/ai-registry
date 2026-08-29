---
layer: application
type: application
subject: bengali
technique: bengali-script-and-numerals
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec — the technique read against CLDR locale data and the Unicode character database

Two pinned counterparts, both Unicode Consortium publications, retrieved 2026-08-29.
**CLDR 48.2** (tag `release-48-2`, published 2026-03-17, tag object
`fc1fd058cc6f50544a450a3b15a4bba0e0c1e653`): `common/main/{bn,bn_IN,bn_BD,root}.xml`,
`common/supplemental/numberingSystems.xml`, resolved values cross-checked against
`unicode-org/cldr-json@48.2.0` `cldr-numbers-full/main/bn/numbers.json`. **Unicode
17.0.0**: `UnicodeData.txt`, `CompositionExclusions.txt`, `NormalizationTest.txt`,
`Scripts.txt`, `ScriptExtensions.txt`, core spec ch.12 §12.2. All carry
`SPDX-License-Identifier: Unicode-3.0`; only cited files were fetched. Verdict:
**confirmed**, with four sharpenings and one partial refutation.

## BN-DIGITS — the standard takes the technique's side, then goes further

`bn.xml` `//ldml/numbers/defaultNumberingSystem` (L6140) is **`beng`**;
`otherNumberingSystems/native` (L6141–6143) is also `beng`, with no `traditional` or
`finance`; `numberingSystems.xml` (L18) defines `beng` as `type="numeric"` over
`০১২৩৪৫৬৭৮৯`. `bn_IN.xml` and `bn_BD.xml` declare no numbers element at all: **no BD/IN
split exists**. That settles the technique's recorded disagreement in its favour.

**Sharpening.** The technique leaves placeholder-bound numbers to "the runtime's own
formatter" — but that formatter's *default answer is Bengali digits*, so an identifier
(port, version, IP) routed through it comes out `৮০৮০`, the defect BN-DIGITS forbids.
Identifiers must **bypass** the locale formatter or pin `-u-nu-latn`.

**Grouping, worked by hand.** `decimalFormats` for `beng` (L6174–6179) carries the
inheritance marker, resolving via `root.xml`'s
`<alias source="locale" path="../decimalFormats[@numberSystem='latn']"/>` to bn's own
latn pattern `#,##,##0.###` (L6182–6186). Applied with `beng` digits: 100000 → `১,০০,০০০`;
1000000 → `১০,০০,০০০` (byte-identical to the technique's example); 10000000 →
`১,০০,০০,০০০`. Currency `#,##,##0.00¤` is likewise Indic.

**Upstream bug candidate.** `percentFormats` breaks that inside one file:
`numberSystem="beng"` is written out explicitly as `#,##0%` (L6270–6276) — Western
three-digit grouping — while `numberSystem="latn"` in the same file is `#,##,##0%`
(L6277–6283), so bn's *default* system groups percentages wrongly above 99999%. Small
blast radius, but "grouping follows the lakh/crore pattern, which locale-aware formatters
produce for bn" is false for percent here, and it looks reportable to CLDR.

## BN-NUKTA — confirmed exactly, then bounded

`UnicodeData.txt` gives U+09DC RRA → `09A1 09BC`, U+09DD RHA → `09A2 09BC`, U+09DF YYA
→ `09AF 09BC` (canonical), and `CompositionExclusions.txt` L50–52 lists all three, so
**NFC produces the decomposed sequence** — verified below, not asserted. CLDR agrees
independently: `exemplarCharacters` (L1286) spells them as those same clusters and
U+09DC/09DD/09DF appear in no exemplar set.

**Sharpest finding: NFC is necessary and not sufficient.** §12.2 records a *fourth*
Bengali split encoding normalization cannot repair — khanda ta, spelled
`<U+09A4, U+09CD, U+200D>` before Unicode 4.1 and as the single U+09CE now.
U+09CE has **no** decomposition, so the two are unequal under all four forms
(`NFC/NFD/NFKC/NFKD: 09CE vs 09A4 09CD 200D — equal=False`). An NFC-idempotence check,
the technique's trigger, catches ড়/ঢ়/য় and misses ৎ — which is in bn's main exemplar
set (L1286) and live. Audits need a separate literal rule for khanda ta.

**Sharpening: NFC yes, NFKC never.** U+2026 carries a *compatibility* decomposition
`<compat> 002E 002E 002E`, so a pipeline that "normalizes" with NFKC rewrites `…` into
`...` — turning BN-ELLIPSIS's correct form into the drift it forbids, at the same write
path BN-NUKTA tells you to normalize at. NFC leaves danda, ZWJ, nukta and digits alone.

## BN-ZWJ — confirmed verbatim by the standard's own prose

§12.2 "Interaction of Repha and Ya-phalaa": for the ambiguous `ra + hasant + ya`
combination the standard "adopts the convention of placing the character U+200D ZERO
WIDTH JOINER immediately after the ra to obtain the ya-phalaa", and "the repha form is
rendered when no ZWJ is present" — the technique's ordering (র + ZWJ + ্ + য) and its
rationale, from the publisher, with an English loanword as the worked example.

**Two boundary corrections.** (1) The same clause adds that when the cluster's first
character is *not* ra, "a ZWJ is not necessary but can be present", because input methods
may bind ya-phalaa to `<ZWJ, hasant, ya>` — so a ZWJ before ্য after a non-ra consonant
is legal input, not debris. (2) `exemplarCharacters type="auxiliary"` (L1287) lists
**both** `\u200C` and `\u200D`, so "ZWNJ has no established role in Bengali UI text" is
contradicted by the locale data — **partial refutation**; stripping ZWNJ may stand as
house policy, not as a fact about the language.

## BN-DARI and BN-ELLIPSIS — confirmed, plus one missing detail

U+0964 is `Script=Common` (`Scripts.txt` L99) with `Script_Extensions` including `Beng`
(`ScriptExtensions.txt` L83): the "DEVANAGARI DANDA" name misleads, the property does
not. bn's punctuation exemplars (L1291) contain `।`, `…`, `?` and `!` and no
Bengali-specific question or exclamation glyph — "reuse the Latin `?`" is the standard's
position too. New detail: bn overrides root's `{0}…` to **`{0} …`** with a U+0020
(L1294–1296; `word-*` inherits) — *truncation* only, not progressive "loading…" copy. So
half of BN-ELLIPSIS sharpens: a bn truncation affordance written `টেক্সট…` diverges
from the locale's own pattern.

## BN-LATINSUFFIX — the trigger is over-broad, counted

The technique triggers on a Bengali suffix adjacent to a Latin character **or closing
brace**. The brace half fails in `bn.xml`: one pattern hyphenates
(`dateTimeFormat type="relative"`, L2164, `{1} {0}-এ`) and **28 occurrences across 22
distinct patterns concatenate bare** — narrow units (`{0}শতাংশ`, `{0}মিনিট`) and ordinals
(`{0}র্থ`, `{0}ম`, `{0}তম`). Reason: with `beng` as default a numeric placeholder renders
as Bengali script, so no collision and no hyphen. The rule is about **Latin-script
content**, not the brace.

## Executed evidence

Harness `norm.py`: a from-scratch NFC/NFD/NFKC/NFKD built **only** from the pinned
Unicode 17.0.0 `UnicodeData.txt` (decompositions, combining classes, Hangul) and
`CompositionExclusions.txt` — the local Python's `unicodedata` is UCD 15.0.0 and was
deliberately not the oracle. Conformance against the publisher's artifact, then the
technique's own example strings lifted verbatim from its bytes (n=12):

```
Unicode 17.0.0 NormalizationTest.txt  ALL rows           n=20034  fails=0
Unicode 17.0.0 NormalizationTest.txt  Bengali-block rows n=13     fails=0
letter    precomposed  NFC(pre)    base+nukta  NFC-equal  raw-equal
ড় U+09DC  09DC         09A1 09BC   09A1 09BC   True       False
ঢ় U+09DD  09DD         09A2 09BC   09A2 09BC   True       False
য় U+09DF  09DF         09AF 09BC   09AF 09BC   True       False
দাঁড়ান   09A6 09BE 0981 09A1 09BC 09BE 09A8   NFC-stable
র‍্যাম    09B0 200D 09CD 09AF 09BE 09AE        NFC-stable; ZWJ survives NFC and NFD
          without the ZWJ: 09B0 09CD 09AF 09BE 09AE — NOT normalization-equal
```

The technique file is itself NFC-idempotent (6500 chars, `NFC(T) == T`) and contains no
U+09DC/09DD/09DF: it already ships the spelling it prescribes. Artifacts, harness and
full log: `C:/tmp/rec/w-bengali/` (`EVIDENCE.md`).
