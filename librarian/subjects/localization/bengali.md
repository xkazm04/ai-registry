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

## 2026-09-10 — re-review after the compression revert

Read all ten owned documents at their restored bytes. Primary sources fetched and read
this session: CLDR `release-48-2` `common/supplemental/plurals.xml` and
`ordinals.xml`. Nothing was executed — the from-scratch normalization harness recorded
in the spec application was not re-run, and no shaping engine was driven.

**Retraction of the 2026-09-10 external-reconcile record below.** It describes the
compressed documents, which were reverted; its digest no longer matches. Its
per-document `reverify` verdicts are withdrawn. One line in it is right and is
promoted to a finding below: the pinned Unicode chapter does permit ZWNJ, and the
technique still says it has no role.

**The pattern in this subject is unlanded work, not wrong work.** The spec application
dated 2026-08-29 recorded five results. Two of them landed in the technique — the
khanda ta paragraph and the NFC-never-NFKC paragraph, both visibly present in
BN-NUKTA. The other three never did, and each leaves a rule asserting something its
own counterpart disproved.

**Finding 1 — BN-ZWJ still says ZWNJ has no role; the locale data lists it.** The rule
reads *ZWNJ (U+200C) has no established role in Bengali UI text — its presence is
almost always paste debris to strip*, and the golden path says *ZWNJ is essentially
unused*. `spec--bengali-script-and-numerals` records the partial refutation:
`bn.xml`'s `exemplarCharacters type="auxiliary"` lists **both** `‌` and `‍`,
and the standard's own prose permits a ZWNJ before ya-phalaa after a non-ra consonant
as legal input-method output. Stripping it is a defensible house policy; it is not a
fact about Bengali, and the rule as written licenses a sweep that removes correct
characters.

**Finding 2 — BN-DIGITS hands identifiers to the formatter that produces the defect it
forbids.** The rule says of a placeholder-bound number: *the runtime's own formatter
decides that script — never hardcode either script into a value destined for a
placeholder*. But `bn.xml`'s `defaultNumberingSystem` is `beng`, so a port or a version
routed through the locale formatter renders ৮০৮০ — which the same rule's previous
sentence calls a defect. The application states the correction: identifiers must
**bypass** the locale formatter or pin `-u-nu-latn`. That sentence is not in the rule.

**Finding 3 — the grouping claim is false for percent, in the same file it cites.**
BN-DIGITS says grouping follows the lakh/crore pattern *which locale-aware formatters
produce for bn*. The application found `bn.xml` writing `numberSystem="beng"`
percentFormat as `#,##0%` — Western three-digit grouping — while the `latn` block in
the same file carries `#,##,##0%`. So bn's own default system groups percentages
Western above 99999%. The application calls it an upstream bug candidate; either way
the technique's universal is not true as stated.

**Finding 4 — BN-LATINSUFFIX's trigger is over-broad by a counted margin.** The rule
triggers on a Bengali suffix adjacent to *a Latin character or closing brace*. The
application counted 28 occurrences across 22 distinct `bn.xml` patterns that
concatenate bare after a brace — narrow units and ordinals — precisely because a
numeric placeholder resolves to Bengali script and there is no script collision. The
rule is about Latin-script *content*, not about the brace.

**Verified and left alone.** `plurals.xml` gives `bn` the block whose `one` rule is
**`i = 0 or n = 1`** with samples `@integer 0, 1`, so BN-PLURALONE's zero-inclusion is
exact. `ordinals.xml` gives `bn` five ordinal categories — `one` for n = 1,5,7,8,9,10;
`two` for 2,3; `few` for 4; `many` for 6; `other` — so the technique's *richer
five-way CLDR split* is exact too. BN-NUKTA's composition-exclusion and khanda ta
paragraphs match the application in full.

**Not resolved.** Neither Microsoft Bangla style guide nor Mozilla's bn-BD guide was
retrieved; BN-APNI, BN-DARI and BN-LOAN cite them. The 8% length ratio and the
Bangla Academy / Paschimbanga Bangla Akademi divergence claims rest on the subject's
own field work.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/bengali",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:67761819d7497ace",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at restored bytes, and each technique cross-read against the subject's own 2026-08-29 spec application to separate landed corrections from recorded ones that never landed. CLDR release-48-2 plurals.xml and ordinals.xml fetched and read this session. No software executed: the from-scratch NFC/NFD/NFKC/NFKD implementation, its 20034-row conformance run and the twelve example-string checks were not re-run, no CLDR XML beyond the two supplemental files was re-fetched, and no shaping engine or font was driven. The two process applications are 2026-08-24 field records of one repo and were assessed as records. Both Microsoft Bangla guides and the Mozilla bn-BD guide were not retrieved.",
  "counterexamples": [
    "A product that follows BN-DIGITS literally and lets the locale formatter render a port number gets Bengali digits, which the same rule calls a defect two sentences earlier - the rule contains its own counterexample.",
    "An audit that strips every U+200C per BN-ZWJ deletes a character the locale's own auxiliary exemplar set lists and that the standard permits before ya-phalaa after a non-ra consonant.",
    "A percentage above 99999 in bn's default numbering system groups Western, contradicting BN-DIGITS' claim that locale-aware formatters produce the lakh/crore pattern for bn.",
    "BN-PLURALONE governs cardinals; a surface rendering an ordinal through plural categories meets five CLDR categories the technique mentions in one parenthesis and supplies no wording for, while its advice to rephrase is not available inside a fixed source skeleton."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established the bn cardinal block verbatim: one is i = 0 or n = 1 with integer samples 0 and 1, other is the fallback. This confirms BN-PLURALONE's zero-inclusion exactly. It establishes nothing about classifiers, which are grammar the file does not model."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established bn's five ordinal categories and their exact membership - one for 1,5,7,8,9,10; two for 2,3; few for 4; many for 6; other otherwise - confirming the technique's five-way aside. It does not establish that UI copy should avoid ordinals, which is craft advice."
    }
  ],
  "documents": {
    "bengali.md": {
      "disposition": "clarify",
      "reason": "Repeats ZWNJ is essentially unused, which the subject's own spec application partially refutes from the locale's auxiliary exemplar set and the standard's prose. Its plural, classifier, zero-copula and script statements are otherwise exact and re-verified."
    },
    "techniques/bengali-script-and-numerals.md": {
      "disposition": "clarify",
      "reason": "Carries two landed corrections - khanda ta as a fourth split encoding normalization cannot repair, and NFC never NFKC - and three that were recorded and never landed: BN-ZWJ still calls ZWNJ roleless, BN-DIGITS still routes identifiers through a formatter whose bn default is Bengali digits, and its lakh/crore grouping universal is false for the percent pattern in the very file it cites. BN-LATINSUFFIX's or-closing-brace trigger is over-broad by a counted 28 occurrences."
    },
    "techniques/classifiers-and-quantity.md": {
      "disposition": "keep",
      "reason": "Both CLDR claims re-verified verbatim this session, cardinal and ordinal. The classifier inventory, the definiteness second job, the glue rule with its skeleton boundary, the unit exception and the doubled-marking rule are each stated with their limits."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "BN-ZEROCOP is the strongest rule here because it states the reviewer's discipline symmetrically - do not flag a correct verbless equational sentence - and bounds itself to the present tense with the past, future and negated forms named. BN-SOV, BN-LIGHTVERB and BN-FULLCLAUSE all carry latitude notes."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "BN-NOGENDER earns its identifier exactly as argued - a citable absence that stops a cross-Indic fan-out from inventing findings - and BN-APNI and BN-NOPLEASE are bounded by recorded-house-ruling and by-surface exceptions. The style-guide citations were not retrieved."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Four buckets with the default named, the part-of-speech split held rather than harmonized, the false-friend posture that verifies a native rendering's primary sense, and the two-Bengals rule that types the defect as mixing rather than as choosing. No claim here overreaches its evidence."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "Treats the measured 8% ratio as a floor and says why - two-dimensional ink - rather than as a budget, and closes with the rule that no length finding may cost a classifier or a formal ending. BN-WRAP names exactly what must not split."
    },
    "applications/process--classifiers-and-quantity.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 record whose most useful move is the parenthetical correcting its own source repo - the repo's fix hardcodes a Bengali one where a count-carrying form is safer under zero-inclusion. Not re-verified against personas."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "The counted realization of the loanword policy, with the false friend outvoted by a 226-to-30 majority and the section-local spelling majority that shows why canon must be recorded rather than re-derived. Historical, not re-run."
    },
    "applications/spec--bengali-script-and-numerals.md": {
      "disposition": "keep",
      "reason": "The document that supplies every finding above: composition exclusions confirmed, khanda ta identified as the fourth split encoding, the identifier-formatter trap, the percent grouping bug candidate, the counted brace over-trigger and the ZWNJ partial refutation. Its oracle discipline - refusing the interpreter's own two-versions-old tables - is exemplary. Not re-executed."
    }
  }
}
```
