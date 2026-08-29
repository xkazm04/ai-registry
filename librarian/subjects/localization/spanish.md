---
subject: spanish
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# spanish

First touch. External-reconcile wave 2, class B.

**Pin.** `unicode-org/cldr@release-48-2` — plurals, ordinals, pluralRanges, plus
`common/rbnf/es.xml`, `grammaticalFeatures.xml`, and the spec text **from the pinned tree
itself** (`docs/ldml/tr35-numbers.md`), so spec and data are version-matched by
construction. File: `spec--plural-and-gender-agreement.md`.
**Fate: ES-PLURAL-CLDR confirmed; ES-PLURAL-MANY confirmed as a category but refuted as
stated; ranges new; ordinals confirmed with two omissions; gender mostly not
conformance-testable.**

## Sightings

- **`many` fires on the representation, not the magnitude.** The rule parses as
  `(c=0 ∧ i≠0 ∧ i%1000000=0 ∧ v=0) ∨ (c∉0..5)`. **Verified by the director:**
  `2000000` plain → `many`; `2500000` plain → **`other`**; `2.5c6` (the same quantity,
  compact) → `many`; `1000000.0` → `other`, because one visible fraction digit kills the
  first disjunct. The technique's "compact large numbers (10⁶ and up)" is **half the
  rule** and conflates two conditions — `many` fires for plain round millions with no
  compact formatting anywhere.
- **And the grammar explains it.** `rbnf/es.xml` shows the rule tracks whether the
  *spelled* numeral ends in *millón/millones* — `1000000: un millón[ >>]`,
  `2000000: <…< millones[ >>]` — which is exactly when the noun attaches with *de*. So
  the technique's own example *"2,5 millones de descargas"* is right for the compact form
  and **wrong applied to `2.500.000 descargas`**, which spells as *dos millones
  quinientos mil* and takes no *de*.
- **`one` is equality with 1, not "rounds to 1".** Every non-integral count is `other`
  (0,5 and 1,5 both), so any string that can take a decimal count needs an `other` branch
  that reads with a fraction in front of it. A branch written for "two or more" breaks.
- **Ranges: `ca es` has three rows and one genuine override** — `(other, one) → other`.
  **Verified by the director.** A range ending at exactly 1 is plural: *0–1 archivos*,
  not *0–1 archivo*. A UI that pluralizes a range on its end number is wrong for `es` on
  exactly the common "0–1 results" shape.
- **Ordinals: single category, confirmed** — but CLDR carries two forms the technique
  lacks: the plural abbreviations `.ᵒˢ`/`.ᵃˢ`, and the **apocopated masculine adjective**
  (`ᵉʳ` at 1 and 3) → *el 1.er intento*, not *1.º intento*.

## Where the director's prompt was wrong

The prompt asserted that "CLDR's plural data says nothing about gender". True of
`plurals.xml`, false of CLDR as a counterpart: `grammaticalFeatures.xml` declares `es`
gender for nominal targets, and **`rbnf/es.xml` ships paired cardinal rulesets differing
at exactly three places** — `1` (*un/una*), `21` (*veintiún/veintiuna*) and the hundreds
`200`–`900` (*doscientos/doscientas*). **The numeral itself agrees with the counted
noun**, which the technique never says. And the feminine ruleset reverts to masculine at
`2000000: <%spellout-cardinal-masculine< millones`, so agreement stops tracking the noun
past a million — *gender and `many` turn out to be one fact.*

**2026-08-29 (cycle) - LANDED.** ES-PLURAL-MANY rewritten around the two-disjunct rule
with the measured table - the same quantity changes category with notation, and the
spelled-numeral grammar that explains why. ES-ORDINAL gained the plural abbreviations
and the apocopated masculine. New rule `ES-PLURAL-RANGE` with the (other, one) override.
Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. ES-PLURAL-MANY: replace "compact numbers 10⁶ and up" with the two-disjunct rule, and
   state that the same quantity changes category with notation.
2. ES-PLURAL-CLDR: add the fractional consequence.
3. A ranges sentence, with the `(other, one)` override called out.
4. ES-ORDINAL: add the plural abbreviations and the apocopated `1.er`.
5. A gender clause: the spelled numeral agrees, and stops agreeing past a million.

## Cross-subject proposals

- **The range family, sighting 3** — and the sighting that supplies an *override* where
  [[czech]] and [[russian]] have none.
- **"Notation, not magnitude"** — second sighting with [[czech]]'s compact split, third
  with [[french]]. Any locale whose `many` keys on the compact exponent (`ca es fr it pt`)
  has the same plain-vs-compact behaviour.
- **`common/rbnf/<lang>.xml` is an unused counterpart surface for this bundle** —
  gendered and cased spellout rulesets plus digit-ordinal patterns are conformance-grade
  evidence for gender and ordinal claims that `plurals.xml` cannot support. The single
  best structural lead of the wave.
- `grammaticalFeatures.xml` carries per-locale gender/case/definiteness inventories,
  directly relevant to case-heavy subjects.

## Could not verify

The technique's "since CLDR 42" provenance for `many` — the category was verified present
in 48.2, not that 42 introduced it (cheap to close by diffing release-41 against
release-42). CLDR 49 is in alpha and `es` data could move; recheck at release, not before.
Whether real runtimes expose the range table at all is a class-A question about
implementations and a good second counterpart for this technique.
