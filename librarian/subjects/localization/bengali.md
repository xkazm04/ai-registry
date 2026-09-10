---
subject: bengali
domain: localization
last_touched: 2026-09-10
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

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/bengali",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:eea7485b45c51471",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "The Unicode Bangla section explicitly uses ZWNJ to block a ligature or expose hasant.",
    "{count}টি is prescribed in the classifier chapter and falsely caught by the other chapter's closing-brace suffix trigger.",
    "A port formatted with Latin digits can still acquire grouping and stop being the original identifier."
  ],
  "sources": [
    {
      "path": "knowledge/localization/south-and-southeast-asian/bengali",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-12/",
      "scope": "Primary Bangla shaping, ZWNJ and khanda-ta sections inspected; historical conformance harness not rerun."
    }
  ],
  "documents": {
    "bengali.md": {
      "disposition": "reverify",
      "reason": "Useful register, classifier and script concerns are overstated as mechanically decidable universals. Measures already refute bare number never adjacent to noun. Hindi does not require gender in every verb. Bengali one is a selector category, not proof of grammatical singular; rendering and region-specific terminology need evidence."
    },
    "techniques/bengali-script-and-numerals.md": {
      "disposition": "clarify",
      "reason": "Repaired blanket ZWNJ/bidi removal, placeholder-as-Latin assumption, mixed digits as intrinsic grammar error and quotation uniformity. Preserve documented shaping, distinguish literal identity from numeric quantity and scope normalization."
    },
    "techniques/classifiers-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Repaired universal classifier mandate and one-category morphology claim; align suffix handling with the runtime value rather than a closing brace. Units, neutral labels and definite constructions need contextual review."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "SOV and zero copula are useful defaults but not permutation rules. A confirmation recast must preserve question versus command and permission versus ability. No results found need not mean no results exist. Missing termbase row does not prove a Latin token untranslated; grammatical review is not reduced to a regex anchor."
    },
    "techniques/register-and-address.md": {
      "disposition": "reverify",
      "reason": "Formal apni is a defensible product default, not every software audience. Honorific morphology cannot be reliably recognized by an un/ুন suffix alone, as যান already shows. Neutral action nouns can avoid direct register. Lexical gender can be meaningful; do not erase it categorically. Please and quoted speaker shifts need context."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Product loanword policy is useful but generic technical nouns need not always transliterate. Sense overlap is not universally forbidden, similar words are not automatically confusing, and frequency does not prove a false friend. Regional audiences and orthographic variants need language review rather than majority vote alone."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired character ratio as width floor, always wider/taller, wrap automatically bug and shortest label losing accessible context. Preserve meaningful labels, grapheme shaping and actual responsive measurements."
    },
    "applications/process--classifiers-and-quantity.md": {
      "disposition": "reverify",
      "reason": "Historical Personas guide retained, not recounted. Published machine-specific root is a cleanup item. Hardcoded ১ loses count argument and is wrong for zero/fractional one selection unless a proven contract prevents those inputs. Latin-digit classifier is a house-policy mismatch, not inherently broken Bengali."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Historical Personas frequencies retained, not recounted. Corpus majority records convention, not native acceptability or region-neutrality. Similar execution/edit spellings need contextual usability evidence. Machine-specific absolute evidence path remains unsuitable for published content."
    },
    "applications/spec--bengali-script-and-numerals.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR/UCD harness retained, not rerun. Primary Unicode chapter explicitly permits ZWNJ for glyph selection and visible hasant, stronger than exemplar inventory alone. Pinning Latin numbering does not make number formatting safe for ports or versions because grouping/precision still apply. Percent pattern difference is an upstream candidate, not established universal error; normalization does not validate spelling."
    }
  }
}
```
