---
subject: bengali
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# bengali

First touch. External-reconcile wave 1, class B.

**Pin.** `unicode-org/cldr@release-48-2` (tag object `fc1fd058cc6f`) + Unicode 17.0.0
(`UnicodeData`, `CompositionExclusions`, `NormalizationTest`, `Scripts`, core spec ch.12
§12.2). File: `spec--bengali-script-and-numerals.md`.
**Fate: confirmed**, four sharpenings and one partial refutation.

## Method worth reusing

The harness built NFC/NFD/NFKC/NFKD **from the pinned UCD files**, deliberately not using
the local Python's `unicodedata` (which is UCD 15.0.0 against a 17.0.0 pin) as the oracle.
Validated on `NormalizationTest.txt`: **20,034 rows, 0 fails**; Bengali-block subset 13/13.
*Pin the data, not the runtime's copy of it* — this transfers to every normalization claim
in the bundle.

## Sightings

- **NFC is necessary and not sufficient — the sharpest finding.** BN-NUKTA is exactly
  right for ড়/ঢ়/য় (canonical decompositions, composition exclusions, so NFC yields the
  decomposed form). But §12.2 documents a **fourth** split encoding the technique misses:
  **khanda ta**, `<U+09A4, U+09CD, U+200D>` before Unicode 4.1 and the single U+09CE now.
  U+09CE has **no decomposition**, so the two spellings are unequal under **all four**
  normalization forms. The technique's stated trigger is an NFC-idempotence check, which
  catches the nukta letters and silently misses ৎ — which is in `bn`'s main exemplar set.
- **BN-DIGITS confirmed at the strongest level.** `bn` `defaultNumberingSystem` = `beng`;
  `bn_IN.xml` and `bn_BD.xml` carry no numbers element, so there is no BD/IN split. The
  technique's recorded authority disagreement is settled in its favour. *Sharpening:*
  "leave it to the runtime's formatter" is unsafe for identifiers, because the runtime's
  default answer is Bengali digits — identifiers must bypass the formatter or pin `-u-nu-latn`.
- **BN-ZWJ confirmed verbatim by the publisher's prose** — §12.2 adopts "the convention of
  placing U+200D ZERO WIDTH JOINER immediately after the ra", and its worked example is an
  English loanword: the technique's exact ordering, rationale and trigger class.
- **Partial refutation.** CLDR's `exemplarCharacters type="auxiliary"` for `bn` lists
  **both** U+200C and U+200D, so "ZWNJ has no established role in Bengali UI text" is
  contradicted by the locale data. §12.2 also makes a ZWJ before ্য after a *non-ra*
  consonant legal IME output, not debris.
- **NFKC destroys BN-ELLIPSIS.** U+2026 has compatibility decomposition `<compat> 002E
  002E 002E`, so a pipeline "normalizing" with NFKC rewrites `…` into `...` at the very
  write path BN-NUKTA tells you to normalize at.
- **BN-LATINSUFFIX's trigger is over-broad, counted**: 1 hyphenated placeholder-suffix
  pattern against **28 bare concatenations over 22 distinct patterns**. The reason is
  BN-DIGITS — with `beng` default a numeric placeholder renders in Bengali script, so
  there is no collision. The rule is about Latin-script *content*, not the closing brace.
- New detail: `bn` overrides root's `{0}…` to `{0} …` (U+0020 before the glyph) for the
  truncation patterns; `word-*` inherits. Truncation only, not progressive "loading…".

**2026-08-29 — LANDED (measured disproof of the trigger).** BN-NUKTA now carries
khanda ta as a fourth split encoding that no normalization form repairs, the
NFC-never-NFKC rule, and an extended trigger — the NFC-idempotence check cannot see
the joiner spelling. The remaining four candidates stay banked. Original record below
stands.

## Technique-edit candidates (banked for the cycle)

1. BN-NUKTA: add khanda ta as a fourth split encoding, **with an explicit note that no
   normalization form repairs it**; the NFC-idempotence trigger needs a literal companion.
2. BN-NUKTA / BN-ELLIPSIS: state **NFC, never NFKC**.
3. BN-DIGITS: identifiers must bypass the locale formatter, not merely be left to it.
4. BN-ZWJ: narrow "ZWNJ has no established role" to a house-policy claim; add the non-ra
   ZWJ exemption.
5. BN-LATINSUFFIX: drop "or closing brace" from the trigger.
6. BN-ELLIPSIS: add the truncation-pattern space.

## Cross-subject proposals

- **`hindi/devanagari-and-numerals` must not be written as symmetric with this subject.**
  `bn` **declares** `defaultNumberingSystem = beng`; `hi` carries `↑↑↑` (inherit) and
  resolves to root's **`latn`**. So Bengali UI numbers default to Bengali digits and Hindi
  UI numbers default to Latin — and one declares while the other inherits. *Director's
  note: the worker reported `hi` as literally `latn`; the file says `↑↑↑`. Substance
  right, citation nuance worth carrying.* Worth a `spec` application on `hi` in its own right.
- **All Indic subjects:** the NFKC/U+2026 hazard and "NFC does not unify every legacy
  spelling" are script-general. A second sighting makes a two-sighting family.
- `vietnamese/diacritics-and-typography` already sets normalization policy; the
  pin-the-UCD method transfers directly.

## Upstream-reportable candidate (CLDR)

In `bn.xml`, `percentFormats numberSystem="beng"` is `#,##0%` (Western 3-grouping) while
`numberSystem="latn"` in the same file is `#,##,##0%` (Indic) — decimal and currency are
Indic for both. **Verified by the director.** So `bn`'s *default* numbering system groups
percentages wrongly above 99999%, and the technique's "grouping follows lakh/crore, which
locale-aware formatters produce for bn" is false for percent in this release.

## Could not verify

No shaping engine was run, so no rendering claim (repha vs ya-phalaa visual output) was
executed — a HarfBuzz check would be class-A evidence about HarfBuzz, not class-B about
the standard. BN-DARI's "over a thousand daṛi uses" and BN-ELLIPSIS's 2:1 ratio are
catalog counts from the forged consumer and are not conformance-testable here.
