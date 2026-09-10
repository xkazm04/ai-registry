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
