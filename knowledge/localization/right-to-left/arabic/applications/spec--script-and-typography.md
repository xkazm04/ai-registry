---
layer: application
type: application
subject: arabic
technique: script-and-typography
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec — the technique read against CLDR's Arabic locale data

**Pin.** Unicode, Inc., Common Locale Data Repository at released tag **`release-48-2`**
(published 2026-03-17; tag object `fc1fd058cc6f50544a450a3b15a4bba0e0c1e653` → commit
`11299982335beb974c1c63c45265184e759c0f41`), retrieved **2026-08-29** from
`https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/`: `common/main/ar.xml`, all 28
`ar_*.xml`, `root.xml`, `common/supplemental/{numberingSystems,supplementalData,supplementalMetadata}.xml`,
`common/bcp47/number.xml`, `common/testData/`, all `SPDX-License-Identifier: Unicode-3.0`;
resolutions cross-checked against `unicode-org/cldr-json@48.2.0`. Verdict: **AR-NUMERALS
refuted as written**; AR-PUNCT confirmed on its mechanical core, refuted on quotation;
AR-NO-KASHIDA partially refuted; AR-TASHKIL passed over — the counterpart holds nothing there.

## AR-NUMERALS — "default" is the wrong word, and the map is not the one described

The technique says CLDR "defaults most `ar` locales (including the Gulf and Egypt) to
Arabic-Indic digits, with the Maghreb locales on Western digits." CLDR expresses no such
per-locale default; it expresses a **declare-versus-inherit** split over a Latin root.

- `root.xml` L3479 declares `latn`, and L3480–3482 `otherNumberingSystems/native` = `latn`.
- `ar.xml` L6099 carries **`↑↑↑`**, the inheritance marker — not a value — so base `ar`
  resolves to **`latn`**; L6100 pins `<defaultNumberingSystem alt="latn">latn</…>`, and
  L6101–6103 declare `native` = **`arab`** and nothing else: no `traditional`, no
  `finance`, in `ar` or in any region locale.
- `supplementalMetadata.xml` L1883 lists **`ar_001`** under `defaultContent`, so
  world-Arabic *is* `ar`; `ar_001.xml` is an identity stub with no cldr-json entry. And
  `supplementalData.xml` L5331–5341 `<parentLocales>` has **no `ar_*` row**, so every
  region locale inherits by truncation to `ar`, then `root`.

CLDR therefore encodes the technique's own two-way distinction under different names:
`latn` is `ar`'s **resolved default**, `arab` its **native** system, reachable as
`ar-u-nu-arab` (`bcp47/number.xml` L15). A product shipping the tag products actually ship
— plain `ar` — gets Western digits *from CLDR*, the opposite of what the sentence implies.

**Counted split, n = 29 files.** 21 declare `arab`; 7 declare the marker (`ar` L6099,
`ar_AE` L50, `ar_DZ` L84, `ar_EH` L15, `ar_LY` L55, `ar_MA` L112, `ar_TN` L84); 1 declares
nothing (`ar_001`). **Zero declare `latn`** — grep for `<defaultNumberingSystem>latn</`
over the 29 files returns no match. Resolved: **21 `arab`, 8 `latn`**. Two named claims
fail on that table. **"Including the Gulf" is false for the UAE:** `ar_AE` L50 is `↑↑↑` →
`latn`, a deliberate inheritance vote in a file carrying six other overrides, while the
other five Gulf locales declare `arab` (`SA` L1378, `KW`/`BH`/`QA`/`OM` L15) and Egypt
(L20) is confirmed. **"The Maghreb on Western digits" is false for Mauritania:** `ar_MR`
L114 declares `arab`, though `DZ`, `MA`, `TN`, `LY`, `EH` do inherit `latn` — right shape,
wrong membership.

## The counterpart breaks the technique's rule, and the rule catches it

"One digit system per string" holds inside CLDR’s literal text: of 15 430 element values in
the 29 files, exactly **one** mixes both digit sets, and it is the character inventory
`exemplarCharacters type="numbers"` (`ar.xml` L1286), not prose. But the litre-per-100-km
unit patterns (`ar.xml` L9331–9337, L11427, L13414–13420; `ar_SA.xml` L3244–3246) hardcode
`arab` digits, and **14 of them also carry a `{0}` placeholder** that renders in the
*resolved* system — so `ar`/`ar_AE`/`ar_MA` yield a mixed string where `ar_EG`/`ar_SA` do not.
The data was authored when `ar` meant Arabic-Indic digits and was never revisited when the
default resolved Latin: **upstream bug candidate**, and a live demonstration that
AR-NUMERALS' mechanical check earns its keep.

## AR-PUNCT — core confirmed, quotation refuted, percent sharpened

`ar.xml` L1288 `exemplarCharacters type="punctuation"` is
`[\- ‐‑ – — ، ؛ \: ! ؟ . … ' " « » ( ) \[ \]]`: it carries `،`, `؛`, `؟`, single-glyph `…`
and em dash `—`, and **no Latin `,` and no Latin `?`** — CLDR's own inventory backs the
technique's highest-volume anchor, and root's `{0}…` (`root.xml` L50) is inherited unchanged.

**Refuted: guillemets are not the locale's quotation marks.** `ar.xml` L1324–1325 set
`quotationStart` = `”` U+201D and `quotationEnd` = `“` U+201C — the curly pair, reversed
from root (L87–88) so the opening mark lands on the right in RTL order; L1326–1327 give
`’`/`‘`. A grep across all 29 files finds **no** `«`/`»` in any delimiter element;
guillemets appear only in the inventory above. Prescribing `« »` is a legitimate house
ruling; it is not the standard's position, and the technique presents it as one.

**Percent.** Order confirmed for both systems: `percentFormat` is `#,##0%` under `arab`
(`root.xml` L4492) and `latn` (L4583) — number then sign, never sign-first. The glyphs are
not bare: `ar.xml` L6136 sets the `latn` `percentSign` to `U+200E % U+200E` and L6137–6138
LRM-prefix plus/minus, while root's `arab` block (L3490–3500) gives `percentSign`
`U+066A U+061C`, decimal `U+066B`, group `U+066C`, list `U+061B`. Pairing confirmed — but a
byte-exact check against a plain `%` will report false diffs against CLDR output. And
`numberingSystems.xml` separates `arab` (L13, U+0660–U+0669) from `arabext` (L14,
U+06F0–U+06F9, Persian/Urdu), whose 4/5/6 are near-lookalikes; **0** of the 29 files contain
U+06F0–U+06F9, so scope Eastern-digit checks to U+0660–U+0669 and flag `arabext` separately,
as foreign-source contamination rather than a digit choice.

## AR-NO-KASHIDA — partially refuted by the locale's own data

`ar.xml` L1284 `exemplarCharacters type="auxiliary"` opens with `ـ` **U+0640 TATWEEL** and
lists `\u200C`, `\u200D`, `\u200E`, `\u200F`. Tatweel is not merely inventoried: it occurs
in two live values — L2540 `<era type="0">هـ</era>`, the standard Hijri era abbreviation,
and L8905's ordinal minimal pair `اتجه إلى المنعطف الـ {0} يمينًا.`, where the article `الـ`
carries a tatweel precisely because the next token is a non-joining placeholder. **The
technique's own prose contains that same `الـ` once** (its "Casing analog" section), so
"U+0640 in Arabic values is near-always a defect" would fire on the standard's era
abbreviation and on the technique file itself. The rule survives as *no tatweel for
emphasis, justification or padding*, not as a bare codepoint denylist. The ZWNJ half fares
better — U+200C occurs in **0** values across the 29 files (only as the escape text `\u200C`
in L1284) — "a ZWNJ is copied cargo" is unrefuted, but it is listed as an auxiliary
character of the language: strip it as house policy, not as a fact about Arabic.

## Executed evidence, and what it is not

**No conformance test exists for what was run.** `common/testData/` at this tag holds
`localeIdentifiers/`, `datetime/`, `messageFormat/`, `personNameTest/`, `segmentation/`,
`transforms/` and `units/` — nothing covering numbering-system resolution or locale-data
inheritance. This is **class B3, property data**: what follows is classification plus a
hand-built resolver checked against a publisher-generated corpus, not a suite that passed.

Harness `resolve.py` (scratch `C:/tmp/rec/w-arabic2/`) reads only the pinned XML: each
locale's own `<defaultNumberingSystem>` (ignoring `alt=`), `↑↑↑` meaning "walk to the
parent", parent by truncation (justified by the empty `parentLocales` grep). Over **n = 29**
files it produced the 21/8 split and eight inheritance chains, each ending
`ar → root:latn@3479`. **Oracle cross-check** (`crosscheck.py`) against cldr-json 48.2.0's
resolved values: **n = 28, 28 agree, 0 disagree** — `ar-001` has no cldr-json directory,
itself confirming it is `ar`'s default-content twin. **Controls**, same resolver unchanged
on locales fixed elsewhere: `bn` → `beng` (`bn.xml` L6140, the line a sibling worker cites),
`fa` → `arabext` (L6204), `en` → `latn` by inheritance, `root` → `latn` — 4/4 pass.
**Degenerate control:** rerun treating `↑↑↑` as a literal value; `ar` and `ar_AE` return the
string `↑↑↑` instead of `latn` while `ar_EG` still returns `arab` — the marker handling is
load-bearing, and a resolver that dropped it fails loudly rather than quietly.
**Rendering** (`render.py`, `ar.xml` L9332 pattern, value 9.5, digits and separators from
`numberingSystems.xml` L13/L58 and `root.xml` L3491/L3602): `ar`, `ar_AE`, `ar_MA` →
`9.5 لتر لكل ١٠٠ كيلومتر` (mixed); `ar_EG`, `ar_SA` → `٩٫٥ لتر لكل ١٠٠ كيلومتر` (uniform).
