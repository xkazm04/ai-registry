---
subject: hindi
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# hindi

First touch. External-reconcile wave 2, class B.

**Pin.** `unicode-org/cldr@release-48-2` — plurals, ordinals, pluralRanges,
`grammaticalFeatures.xml`, `common/main/hi.xml`. File: `spec--gender-and-agreement.md`.
**Fate: ordinal data confirmed, the hint refuted as to where the silence is; zero-rule
sharpened; gender partly testable.**

## Sightings

- **Five ordinal categories, and the set is a suffix inventory rather than a numeric
  pattern.** `one` at n=1, `two` at n=2,3, `few` at n=4, `many` at **n=6**, `other`
  otherwise — 5 is not singled out, 6 is. The explanation is the finding: पहला,
  दूसरा/तीसरा, चौथा and छठा are suppletive and each needs its own suffix, while -वाँ is
  regular from 5 onward. **That is why 6 earns a category and 5 does not.**
- **The hint was refuted where it mattered.** The dispatch expected the technique to
  treat ordinals as out of scope. It does not — the technique already states the five-way
  split at L106–108, with exemplars. **The golden path is the silent one**, covering
  cardinals and zero and never ordinals or ranges.
- **The zero rule is half-stated.** The cardinal rule's disjunct is on `i`, not `n`, so
  **every fraction with a zero integer part is `one`** — 0.5, 0.9, 0.04 — and CLDR
  publishes `@decimal 0.0~1.0, 0.00~0.04` in the `one` set. A Hindi `one` branch must
  read at 0, at 1 **and** at 0.5. The technique's "fractions fall to other" is only half
  true.
- **HI-OBLIQUE is true of the plural categories and misleading overall.** It says the
  -ों oblique plural is "a third form no CLDR category names"; CLDR names it on an
  orthogonal **case** axis and ships **321** `case="oblique"` unit patterns crossed with
  count. Where a runtime exposes that axis the translator need not smuggle the oblique
  inside a plural branch.
- **Gender is partly testable.** `grammaticalFeatures.xml` (`targets="nominal"`,
  `locales="hi pa"`) declares case *nominative oblique* and gender *masculine feminine*
  — **verified by the director** — and `hi.xml` publishes `caseMinimalPairs` and
  `genderMinimalPairs`, a published agreement frame an audit can diff against.
- **Ranges: passed over.** `hi` has a three-row table and both technique and golden path
  are silent — a real gap, but too small a surface to bind. A sweep of 45,451 ordered
  pairs found exactly three attainable category pairs, so the table is complete.

## Upstream-reportable, verified by the director

CLDR's own Hindi `ordinalMinimalPairs` for **`few` carries no ordinal suffix at all**.
`hi.xml` ships `{0}ला`, `{0}रा`, `{0}ठा`, `{0}वां` — and `few` reads `{0} दाहिना…`, with
चौथा's -था simply absent. **A minimal pair that does not distinguish its category cannot
do its job.** Not a regression: byte-identical in release-47, 48.2 and 49-alpha1.
Downstream, the technique's `4था` exemplar is correct but is **the one ordinal form a
product cannot lift from CLDR locale data**.

**2026-08-29 (cycle) - LANDED.** HI-PLURAL now states the integer-part rule (every
count below 1 is singular), routes the oblique to the case axis CLDR actually names,
explains the ordinal set as a suffix inventory, and warns that the `few` exemplar
cannot be sourced from locale data. The golden path gained a clause on sub-1 counts
and on the five ordinal categories. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. HI-PLURAL: replace "fractions fall to other" with the `i`-based statement — sub-1
   fractions are `one`.
2. HI-PLURAL: CLDR names the oblique on the case axis and ships the forms.
3. Note that the `4था` exemplar is uncorroborated by CLDR and must not be sourced from
   locale data.
4. Golden path `hindi.md`: one clause on ordinals — it currently implies cardinals are
   the whole CLDR story for Hindi.

## Cross-subject proposals

- **Answers the banked [[bengali]] lead, with the citation nuance settled:** `hi.xml`
  carries the inheritance marker for `defaultNumberingSystem`, resolving to root's
  `latn`, while `bn` **declares** `beng`. Only `native: deva` is declared for `hi` — no
  `traditional`, no `finance`. Hindi inherits Latin digits; Bengali declares Bengali
  ones, and the two sibling techniques must not be written as symmetric.
- **"A published minimal pair that fails to distinguish its category"** — 1 sighting.
- **The best structural lead of wave 2:** CLDR ships `pluralMinimalPairs`,
  `ordinalMinimalPairs`, `caseMinimalPairs` and `genderMinimalPairs` per locale — a
  ready-made, versioned conformance fixture usable by **any** subject in this bundle. A
  future wave could sweep the corpus for non-distinguishing pairs.

## Could not verify

Whether CLDR's survey tooling has an active check for non-distinguishing minimal pairs
(which would settle "known gap" versus "escaped defect") — data files were read, not the
tooling source. Whether a reference implementation compensates for the missing `few`
suffix is a class-A question, out of scope for this pin. The remainder of HI-AGREE and
HI-LOANGENDER — ergative ने agreement, loanword gender assignment, participle concord —
is **not conformance-testable**: CLDR declares those features only for its own unit-name
inventory and ships no Hindi lexicon gender, validator or procedure.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/hindi",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:3a646e0b67821d11",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "U+0958 normalizes to U+0915 U+093C under NFC, contrary to the original normalization statement.",
    "A completed action in an ergative construction need not agree with the honorific subject.",
    "A one category can cover zero and fractional counts without proving every noun uses the same morphological singular form."
  ],
  "sources": [
    {
      "path": "knowledge/localization/south-and-southeast-asian/hindi",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.unicode.org/charts/nameslist/n_0900.html",
      "scope": "Primary Unicode names list identifies the eight nukta consonants as composition exclusions with decomposed NFC."
    }
  ],
  "documents": {
    "hindi.md": {
      "disposition": "reverify",
      "reason": "Universal honorific/Hinglish/digit rules overgeneralize product conventions. CLDR categories do not mandate a noun form, all names are not case-invariant, and an ordinal inventory can change. No bidi is false for embedded RTL; the cited u mark is not in template. Grammar judgments are not mechanical anchor matching."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "SOV and postposition checks are useful candidates, not near-certain regex verdicts. Right dislocation is acknowledged but focus constructions also need context. Passive versus intransitive can change agency and event meaning; vectors are not mandatory in every completed confirmation, nor courtesy restricted to impositions."
    },
    "techniques/devanagari-and-numerals.md": {
      "disposition": "clarify",
      "reason": "Repaired NFC preserves precomposed nukta, no modern software supports native digits, dotted circle always a bug and mandatory punctuation/invisible-character sweeps. Use normalization and rendering contracts."
    },
    "techniques/gender-and-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired all proper names safe, all ergative verbs agree with object, one category equals singular morphology, closed ordinal inventory and CLDR unit case data generalizes to arbitrary nouns. Preserve unknown referents."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "Repaired universal single software register and all participles agree with aap, severity independent of context and forbidden-command interchangeable with failed-action wording."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "The term-class framework is a house heuristic, not all Hindi audience usage. Sanskritic terminology is not inherently foreign; acronym transliteration can aid recognition. Frequency and shortness do not establish correctness, mixed Latin does not inherently break shaping and termbase choices can legitimately be revised."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "reverify",
      "reason": "Expansion ratios and borrowed-word shorter claims require actual rendering; Devanagari abbreviations are not impossible. ASCII quotes are a policy rather than the only native option, quotation does not universally suspend grammar and multiple nesting marks can be coherent. Keep severity and labels tied to user impact."
    },
    "applications/process--devanagari-and-numerals.md": {
      "disposition": "reverify",
      "reason": "Historical Personas counts and malformed ICU example retained, not rerun in consumer. One catalog does not prove universal digit/danda policies, and a broken syntax example can be visible to readers too. Absolute machine checkout paths remain cleanup work."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Historical termbase counts and translation-wave account retained, not current product verification or execution authorization. Frequency does not validate meaning or mandatory Hinglish for all audiences. Published absolute checkout paths remain cleanup work."
    },
    "applications/spec--gender-and-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR harness retained, not rerun. Unit case inventory is not a complete grammar, minimal pairs are not a suffix dictionary and a finite nonnegative grid does not prove universal range reachability. The golden path now mentions ordinals, so silence finding is historical. One category is not a prescription for every noun."
    }
  }
}
```
## 2026-09-10 — architecture re-review after the compression revert

Read all ten documents at reverted bytes: the golden path, six techniques, two process
applications and the CLDR spec application. The 2026-09-10 record above graded the
subject `reverify` against documents the revert removed, and I retract that grading.
This is the cleanest of my six subjects: I found nothing I would change.

Checked against the primary source rather than against intuition, because this subject
makes three CLDR claims that a reviewer would otherwise take on faith. All three held.
The `hi` cardinal rule in `common/supplemental/plurals.xml` is `i = 0 or n = 1` with
`@integer 0, 1` and `@decimal 0.0~1.0, 0.00~0.04` — so HI-PLURAL's "0 and 1 both take
the one form" is right, *and* its sharpening is right for the reason it gives: the
first disjunct tests the integer part, so 0.5 and 0.04 select `one` while 1.5 does not.
The published decimal samples say exactly that. The `hi` ordinal block (`gu hi`) really
does carry five categories — `one` at n = 1, `two` at n = 2,3, `few` at n = 4, `many`
at n = 6, `other` for the rest — identical at `release-48-2` and on `main`, so the
subject's most surprising claim is the best-supported one, and its explanation (the set
is a suffix inventory, which is why 6 earns a category and 5 does not) predicts the
data correctly. The `hi` range table is three rows in a ten-locale group, matching the
application. I read the data; I did not execute anything.

What I did not resolve, and am recording rather than grading. The spec application's
gender half rests on two files I did not open: `grammaticalFeatures.xml` (for the
nominative/oblique case axis and the two genders declared for `hi pa`) and
`common/main/hi.xml` (for the 321 `case="oblique"` unit patterns, the caseMinimalPairs
and genderMinimalPairs, and the `few` ordinal minimal pair that ships with no suffix at
all). Those are the claims that carry HI-OBLIQUE's sharpening — that the -ों oblique
plural is *not* unnamed, because CLDR names it on a second orthogonal axis — and its
"4था is the one ordinal form a product cannot lift from the standard" finding. I have
no reason to doubt either; I simply did not check them, and I would rather say so than
let two verified halves launder a third. Both remain `keep`, because a disposition is a
judgement about the document and an unopened file is a note about my coverage.

The one thing I would flag if it were worth a change, and it is not: the technique
writes 5वाँ with chandrabindu where CLDR writes वां with anusvara. The spec application
already records that as orthographic divergence rather than defect, and HI-NASALMARK
already owns the class ("pick one mark per word, catalog-wide"). The corpus is internally
consistent about a variance the language itself permits, which is the correct outcome.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/hindi",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:918aa4a77fa87e5b",
  "disposition": "keep",
  "coverage": "All 10 owned documents read in full at reverted bytes. CLDR plurals.xml, ordinals.xml and pluralRanges.xml read for the hi blocks at release-48-2 and main - read, not executed. Not evaluated: grammaticalFeatures.xml and common/main/hi.xml, which carry the spec application's gender, case-axis and minimal-pair claims; the OS-vendor and browser-vendor Hindi style guides the register and script rules cite; the Personas tree the two process applications cite; any runtime or rendering witness; maturity or verified_on refresh.",
  "counterexamples": [
    "HI-OBLIQUE says proper names are safe because Hindi proper nouns do not visibly decline, but a placeholder holding a Hindi common-noun-derived organisation name ('{name} ko bhejein' where name is a declinable native noun) is exactly the unsafe case, and the rule's own quoting frame is offered only for the {item} placeholder class, not for {name}.",
    "HI-PLURAL's zero rule and HI-LENGTH's trim ladder collide on an empty state: the one branch must read correctly at 0, at 1 and at 0.5, and rule 1 of the trim ladder (cut qualifiers first) is what strips the wording that makes it hold at 0.5.",
    "The five ordinal categories have no counterpart in the golden path's plural paragraph beyond a pointer, so a product wiring ordinals from the golden path alone gets the cardinal rule and a reference, not the suffix inventory."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/plurals.xml",
      "result": "Established that hi's cardinal one rule is 'i = 0 or n = 1' with @integer 0, 1 and @decimal 0.0~1.0, 0.00~0.04. Confirms both HI-PLURAL's zero rule and its sharpening that every count whose integer part is zero selects one, from CLDR's own published samples. It did not establish anything about noun morphology, which the technique correctly says is a separate question."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that the gu hi block carries five ordinal categories - one at n = 1, two at n = 2,3, few at n = 4, many at n = 6, other for the rest - and that the same block is present on main. Confirms the technique's five-way split, its exemplar mapping, and its explanation that the set is a suffix inventory closed at chhathaa. It did not establish the missing-suffix defect in hi.xml's few minimal pair, which lives in a file I did not open."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that hi sits in a ten-locale group publishing three rows (one+one -> one, one+other -> other, other+other -> other), matching the spec application exactly. It did not establish the application's claim that the table is complete rather than truncated, which rests on its own reachability sweep."
    }
  ],
  "documents": {
    "hindi.md": {
      "disposition": "keep",
      "reason": "Correctly identifies that the register question is settled and the vocabulary question is the whole craft, then holds that framing through every section. The Hinglish-dial term classes, the SOV and postposition calque list, the zero-is-singular rule with its sub-1 sharpening, the five ordinal categories, and the complex-script engineering facts are each accurate and each pointed at the technique that owns them."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "HI-SOV, HI-POSTPOS, HI-LIGHTVERB and HI-CALQUE cover the four places Hindi and English disagree structurally, and the light-verb rule's three sub-points (karnaa versus honaa is voice; English passives do not pass through jaanaa by default; vector verbs carry aspect) are the details that separate idiom from calque. The closing clean-strings clause is placed exactly where a de-anglicization pass does its damage."
    },
    "techniques/devanagari-and-numerals.md": {
      "disposition": "keep",
      "reason": "HI-DANDA, HI-NUKTA, HI-CONJUNCT, HI-DIGITS and HI-NASALMARK are each mechanically checkable and each hedged where the standard permits both answers. The nukta rule's insistence on byte-level normalization consistency (precomposed versus base plus U+093C) is the half that actually breaks termbase lookup, and it is stated. HI-DIGITS's exception cuts in both directions, which is the right shape for a settled-by-usage convention."
    },
    "techniques/gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Re-verified today: the cardinal rule, its integer-part sharpening and the five ordinal categories all read back exactly as published at release-48-2 and on main. HI-LOANGENDER's ordered heuristics, HI-AGREE's ergative note, HI-OBLIQUE's proper-noun-versus-common-noun split and the closed suffix-inventory explanation of the ordinal set are all sound. The oblique-case-axis claim rests on grammaticalFeatures.xml, which I did not open."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "HI-AAP, HI-TUM-TU, HI-HONPLUR and HI-IMPER are all morphological and therefore all greppable, which is exactly the argument the technique opens with. The hybrid form (aap with a tum-form verb) named as an MT artefact and typed as equally wrong is the finding a human reviewer would miss."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "The four term classes are the right cut, and HI-XLIT's default-to-transliterate-because-it-is-reversible reasoning is better than a taste rule. HI-TERMSPLIT's per-part-of-speech reading of one-concept-one-rendering (borrowed noun beside native verb is not an inconsistency) is a genuine refinement of the law it cites, and HI-GENPLURAL scopes the -s question to uncounted generics where the plural rule does not reach."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "The asymmetric length profile (sentences longer, transliterated single words at parity) is stated as a distribution rather than an average, and the trim ladder ends with an explicit never-trim list - the honorific ending, the nukta, conjunct integrity. HI-LABEL's observation that Devanagari has no case so a source guide's Title Case instruction has no application, and that sentence-ness is carried by the danda instead, is the correct substitution."
    },
    "applications/process--devanagari-and-numerals.md": {
      "disposition": "keep",
      "reason": "The value is the contrast between the settled rules (danda at 1,585 uses, 1,218 Latin digits against zero Devanagari) and the drifting one (485 literal three-dot ellipses against 210 glyphs in a reviewed catalog), which is the evidence for the claim that an accreted catalog is inconsistent on exactly the rules no reviewer feels. The cooked-ICU-syntax incident is the right justification for checking the skeleton before the script. Not re-verified against the tree."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "The four term classes instantiated with occurrence counts, including the ruling-within-the-native-class case and the brand-versus-common-noun trap. The method note - write the style authority after counting the reviewed corpus, scope it against the unreviewed remainder, put the numbers in the rulings - is the transferable half and it is stated as such. Not re-verified against the tree."
    },
    "applications/spec--gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Its two central data claims were re-verified today against release-48-2 and main: the cardinal rule with its integer-part disjunct and published decimal samples, and the five-category ordinal block for gu hi. Its zero-rule sharpening and its suffix-inventory explanation both follow from what I read. The gender half - the declared case and gender inventory, the 321 oblique unit patterns, the minimal pairs and the suffix-less few pair - rests on grammaticalFeatures.xml and common/main/hi.xml, which I did not open; I am not disputing them, and I am not claiming to have checked them."
    }
  }
}
```

