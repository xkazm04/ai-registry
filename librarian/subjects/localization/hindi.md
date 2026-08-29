---
subject: hindi
domain: localization
last_touched: 2026-08-29
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
