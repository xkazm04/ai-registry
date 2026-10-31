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


## 2026-10-31 - architecture re-review (digest moved)

The subject went stale on two mechanical commits since the 2026-09-10 record: the
privacy fix that made the two process applications' style-guide paths repo-relative,
and the `counterpart: external` front-matter line on the spec application. Neither
changes a claim. I re-read all ten documents anyway and re-judged them.

**Retraction of part of the 2026-09-10 keep.** That record graded
`techniques/devanagari-and-numerals.md` keep and praised HI-NUKTA's normalization
sentence. The sentence's parenthetical is wrong: it says "NFC keeps क़-class
precomposed points". Unicode's `CompositionExclusions.txt` lists U+0958..U+095F (QA
through YYA) as composition exclusions, so NFC *decomposes* them to base + U+093C and
never recomposes them. The earlier 2026-09-10 `reverify` record had already named this
counterexample; the later keep record overrode it without addressing it. The rule
(normalize consistently, audit byte-level) stands; the parenthetical inverts which
form NFC yields.

**Closed: the gap the last record left open.** I fetched `grammaticalFeatures.xml`
and `common/main/hi.xml` at `release-48-2`. `targets="nominal" locales="hi pa"`
declares case `nominative oblique` and gender `masculine feminine`; `hi.xml` carries
exactly 321 `case="oblique"` occurrences; and the `few` ordinal minimal pair reads
`{0} दाहिना मोड़ लें.` with no suffix while one/two/many/other carry ला/रा/ठा/वां.
The spec application's gender half and HI-PLURAL's "4था cannot be lifted from the
data" are now checked, not assumed.

One small golden-path clarify: "Devanagari is left-to-right; no bidi handling
applies" is true of Hindi text and false of a Hindi string interpolating an Urdu or
Arabic user value, which still needs bidi isolation.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/hindi",
  "date": "2026-10-31",
  "baseline": "362ef003a",
  "digest": "sha256-b2:9ab3a14eb6e46f28",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at current bytes; diff since the 2026-09-10 baseline is two mechanical commits (repo-relative paths, counterpart flag). CLDR release-48-2 grammaticalFeatures.xml and common/main/hi.xml fetched and read for the hi entries; Unicode CompositionExclusions.txt read; NFC behaviour of U+0958/U+095B/U+095E additionally checked with a standard-library Unicode normalizer. Not evaluated: the OS-vendor and browser-vendor Hindi style guides the register, danda and digit rules cite; the private product tree the two process applications cite (historical field records, not re-run); any rendering or shaping witness; maturity or verified_on refresh.",
  "counterexamples": [
    "U+0958 (QA) under NFC becomes U+0915 U+093C, so a pipeline that 'keeps precomposed points under NFC' does not exist; HI-NUKTA's parenthetical predicts the opposite of what a normalizer emits.",
    "A Hindi string interpolating an Urdu user name ({name} ने टिप्पणी की) contains RTL text, so the golden path's 'no bidi handling applies' fails at the placeholder even though Devanagari itself is LTR.",
    "HI-OBLIQUE treats proper names as safe because they do not visibly decline, but an -आ-final place or organisation name used as a common noun (कलकत्ता -> कलकत्ते में in colloquial usage) is the case the rule's quoting frame was built for and is offered only for {item}."
  ],
  "sources": [
    {
      "url": "https://www.unicode.org/Public/UCD/latest/ucd/CompositionExclusions.txt",
      "result": "Lists '0958 # DEVANAGARI LETTER QA' through '095F # DEVANAGARI LETTER YYA' under the note 'Many precomposed characters using a nukta diacritic in the Devanagari ... script'. Refutes HI-NUKTA's 'NFC keeps ka-class precomposed points'; NFC yields base + U+093C."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/grammaticalFeatures.xml",
      "result": "Line 92: '<grammaticalFeatures targets=\"nominal\" locales=\"hi pa\">' with '<grammaticalCase values=\"nominative oblique\"/>' and '<grammaticalGender values=\"masculine feminine\"/>'. Confirms the spec application's case/gender inventory and HI-PLURAL's case-axis sentence."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/main/hi.xml",
      "result": "582,873 bytes, matching the spec application's pin. 321 occurrences of case=\"oblique\". Lines 7833-7837: ordinalMinimalPairs few = '{0} दाहिना मोड़ लें.' (no suffix), many = '{0}ठा ...', one = '{0}ला ...', other = '{0}वां ...', two = '{0}रा ...'. Confirms the suffix-less few pair and the 4था finding."
    }
  ],
  "documents": {
    "hindi.md": {
      "disposition": "clarify",
      "reason": "Framing, Hinglish dial, zero/sub-1 plural rule and five-ordinal pointer are all correct. One change owed: 'Devanagari is left-to-right; no bidi handling applies' should say Hindi text needs no bidi reordering but interpolated user values (Urdu, Arabic names) still need bidi isolation."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "HI-SOV, HI-POSTPOS, HI-LIGHTVERB and HI-CALQUE are trigger-first with legitimate-use exceptions (right dislocation, compound postpositions as units, settled native verbs). Unchanged since the 2026-09-10 keep and the reasoning holds."
    },
    "techniques/devanagari-and-numerals.md": {
      "disposition": "clarify",
      "reason": "HI-NUKTA's parenthetical 'NFC keeps ka-class precomposed points; most pipelines emit base+combining' is inverted: U+0958..U+095F are composition exclusions, so NFC always yields base + U+093C. Rewrite to: 'NFC and NFD both yield base + U+093C for the eight nukta letters (they are composition exclusions); a precomposed form survives only in un-normalized input, so normalize before comparing'. Danda, conjunct, digit and nasal-mark rules keep."
    },
    "techniques/gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Re-verified today: the oblique case axis (grammaticalFeatures.xml hi pa) and the suffix-less few minimal pair in hi.xml both read exactly as the technique states, on top of the cardinal/ordinal checks of 2026-09-10. The proper-name counterexample is a boundary worth a reviewer's eye, not a defect in the rule as scoped."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "HI-AAP's recorded-ruling exception, HI-TUM-TU's greppable token list, HI-HONPLUR's possessive-agrees-with-possessed rule and HI-IMPER's one-imperative-register-per-surface are each bounded and auditable. Vendor-guide citations not retrieved."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Four term classes, corpus-first boundary rulings, transliterate-by-default because reversible, and the per-part-of-speech TERMSPLIT are sound and consistent with the golden path."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "Asymmetric length profile, an ordered trim ladder ending in a never-trim list, single-glyph ellipsis and one-quote-convention rules. The ±20% browser-vendor budget is attributed, not asserted."
    },
    "applications/process--devanagari-and-numerals.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 field record; the only change since review is the repo-relative style-guide path. Its settled-versus-drifting contrast and the cooked-ICU incident remain the useful lesson. Counts not re-run against the private tree."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Dated field record instantiating the four term classes with counts; only the path changed. Not re-run against the private tree."
    },
    "applications/spec--gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Every data claim is now checked: cardinal and ordinal rules (2026-09-10), and today grammaticalFeatures.xml, the 321 oblique patterns, the 582,873-byte hi.xml and the suffix-less few pair. The harness was not re-run. Its 'golden path is silent on ordinals' finding is historical; the golden path has since gained the ordinal paragraph."
    }
  }
}
```

## 2026-10-31 - clarify items applied

Both owed clarifies are made. The golden path now separates Hindi text (strong L, no reordering)
from an interpolated RTL value (still isolated). HI-NUKTA now says what a normalizer actually
emits for U+0958-U+095F, and is scoped to those eight letters because U+0929/U+0931/U+0934 are
not exclusions. No other document changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/hindi",
  "date": "2026-10-31",
  "baseline": "3f7e1dfbc",
  "digest": "sha256-b2:64434173e617b525",
  "disposition": "keep",
  "coverage": "Clarify-apply pass over the two clarify items of the earlier 2026-10-31 record; only hindi.md and techniques/devanagari-and-numerals.md changed. Primary sources re-opened this run: Unicode CompositionExclusions.txt, DerivedBidiClass.txt and UAX #9 section 2.4; NFC/NFD of U+0958, U+095B, U+095E and U+0929 checked with a standard-library Unicode normalizer. The other eight documents were not re-read beyond confirming they are byte-unchanged; their dispositions carry forward. Not evaluated: vendor style guides, the private product tree, any rendering witness, maturity or verified_on refresh.",
  "counterexamples": [
    "U+0929, U+0931 and U+0934 (NNNA, RRA, LLLA) are precomposed nukta letters that are NOT composition exclusions, so NFC keeps them precomposed; the applied HI-NUKTA text is therefore scoped to the eight letters U+0958-U+095F, not to every nukta form.",
    "A Hindi string interpolating an Urdu user name still needs bidi isolation at the placeholder; the golden path now says so, but a renderer that ignores isolate characters will still misorder neutrals around the value.",
    "HI-OBLIQUE's proper-name boundary (an -आ-final name used as a common noun) remains a reviewer judgement, carried from the earlier record."
  ],
  "sources": [
    {
      "url": "https://www.unicode.org/Public/UCD/latest/ucd/CompositionExclusions.txt",
      "result": "Re-read 2026-10-31: lists '0958 # DEVANAGARI LETTER QA' through '095F # DEVANAGARI LETTER YYA'. A normalizer gives U+0958 -> U+0915 U+093C, U+095B -> U+091C U+093C, U+095E -> U+092B U+093C under both NFC and NFD, while U+0929 stays precomposed under NFC. Supports the applied HI-NUKTA wording."
    },
    {
      "url": "https://www.unicode.org/Public/UCD/latest/ucd/extracted/DerivedBidiClass.txt",
      "result": "'0904..0939 ; L # Lo [54] DEVANAGARI LETTER SHORT A..DEVANAGARI LETTER HA': Devanagari letters are strong L, so Hindi text needs no reordering."
    },
    {
      "url": "https://www.unicode.org/reports/tr9/",
      "result": "Section 2.4 Explicit Directional Isolates: 'The following characters signal that a piece of text is to be treated as directionally isolated from its surroundings ... an isolate has the effect of a neutral like U+FFFC OBJECT REPLACEMENT CHARACTER'. Supports the applied golden-path sentence that an interpolated RTL value needs isolation."
    }
  ],
  "documents": {
    "hindi.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Devanagari is left-to-right; no bidi handling applies' -> Hindi text needs no bidi reordering, but an interpolated user value (an Urdu or Arabic name) is still right-to-left and still needs bidi isolation at the placeholder. Rest of the golden path carried as kept."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "HI-SOV, HI-POSTPOS, HI-LIGHTVERB and HI-CALQUE are trigger-first with legitimate-use exceptions (right dislocation, compound postpositions as units, settled native verbs). Unchanged since the 2026-09-10 keep and the reasoning holds."
    },
    "techniques/devanagari-and-numerals.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: HI-NUKTA's inverted parenthetical ('NFC keeps ka-class precomposed points') replaced with: encode base + U+093C; NFC and NFD both yield that for the eight nukta letters U+0958-U+095F (composition exclusions); a precomposed form survives only in un-normalized input; normalize before comparing. Danda, conjunct, digit and nasal-mark rules unchanged."
    },
    "techniques/gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Re-verified today: the oblique case axis (grammaticalFeatures.xml hi pa) and the suffix-less few minimal pair in hi.xml both read exactly as the technique states, on top of the cardinal/ordinal checks of 2026-09-10. The proper-name counterexample is a boundary worth a reviewer's eye, not a defect in the rule as scoped."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "HI-AAP's recorded-ruling exception, HI-TUM-TU's greppable token list, HI-HONPLUR's possessive-agrees-with-possessed rule and HI-IMPER's one-imperative-register-per-surface are each bounded and auditable. Vendor-guide citations not retrieved."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Four term classes, corpus-first boundary rulings, transliterate-by-default because reversible, and the per-part-of-speech TERMSPLIT are sound and consistent with the golden path."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "Asymmetric length profile, an ordered trim ladder ending in a never-trim list, single-glyph ellipsis and one-quote-convention rules. The ±20% browser-vendor budget is attributed, not asserted."
    },
    "applications/process--devanagari-and-numerals.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 field record; the only change since review is the repo-relative style-guide path. Its settled-versus-drifting contrast and the cooked-ICU incident remain the useful lesson. Counts not re-run against the private tree."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Dated field record instantiating the four term classes with counts; only the path changed. Not re-run against the private tree."
    },
    "applications/spec--gender-and-agreement.md": {
      "disposition": "keep",
      "reason": "Every data claim is now checked: cardinal and ordinal rules (2026-09-10), and today grammaticalFeatures.xml, the 321 oblique patterns, the 582,873-byte hi.xml and the suffix-less few pair. The harness was not re-run. Its 'golden path is silent on ordinals' finding is historical; the golden path has since gained the ordinal paragraph."
    }
  }
}
```
