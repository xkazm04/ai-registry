---
subject: russian
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# russian

First touch. External-reconcile wave 2, class B. Second source for a technique that
already had a `process` application.

**Pin.** `unicode-org/cldr@release-48-2` + UTS #35 Part 3 revision **tr35-78**, resolved
by fetching revisions 76–79 and reading mastheads until one declared 48.2 — so spec and
data editions match rather than merely coexisting. File: `spec--plural-and-count-agreement.md`.
**Fate: fractional consequence confirmed and sharpened; ranges refuted on all three
sub-claims, two of them errors in the director's own prompt.**

## Sightings

- **The `v = 0` guard is the mechanism RU-FRACTION states but never names.** Every
  non-`other` rule carries it, and `plurals.xml` closes the loop by giving `other`
  `@decimal` samples and **no `@integer` samples at all**.
- **The sharpening: `v` is a property of the display, not the value.** `2,0` is not a
  fraction and still selects `other`. Any surface formatted to a fixed decimal place —
  a rating, an average, a «2,0 ГБ» readout — puts **every** count into `other` whatever
  its magnitude: of one-decimal values 0.0–1000.0, **10001 of 10001 (100%) select
  `other`**. In such a string the `other` branch is not an edge case, it is the only
  branch that ever renders.
- **The control is the finding.** A hand-rolled selector doing RU-PLURAL's prose table as
  integer modulo with no `v` check disagrees with CLDR on **0 of 1001 integers (0.0%)**
  and **10001 of 10001 one-decimal values (100%)**. *Correct on exactly the inputs a
  developer would test with, wrong on every input they would not* — which is how the
  defect ships.
- **111 is `many`, not `one`.** The shorthand "ends in 1, not 11" is `i % 100 != 11`;
  a second control dropping the teen guard is wrong on 400 of 10001 integers, first
  offenders 11, 12, 13, 14, 111, 112, 113, 114.
- **Compact notation settles an ambiguity the technique left to the auditor.** §Operands'
  `c`-shift means `12.3c3 → i = 12300, v = 0 → many`, so «12,3 тыс.» is `many` despite
  the visible comma.
- Ordinals: single-category `other`. Confirmed negative — nothing contradicted, and there
  is no ordinal branch to fill.

## Where the director's prompt was wrong

Both caught by the worker and **verified by the director**:

1. The prompt called the `ru` range table "the richest in the corpus". It is not —
   `ar` 23 rows, `cy` 20, `ga` 17, and `ru` **ties** `sl` at 16.
2. The prompt's worked example was backwards. `(few, many) → many`, so 2–5 is
   **«2–5 файлов»**, not «2–5 файла».

The table has 16 rows and **0 overrides**; §Plural Ranges says a pair is included where
the result *has been verified*, so it is a verification record, not an override set.

**2026-08-29 (cycle) - LANDED.** RU-PLURAL's condition cells now read as last-TWO-digit
exclusions with 111 as a worked counter-example. RU-FRACTION now names the visible-
fraction-digit mechanism, the 2,0-selects-other consequence, and the compact-notation
re-convergence that replaced its open "audit the pair together" caveat. New rule
`RU-PLURAL-RANGE`. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. RU-FRACTION: name the `v = 0` guard and say `v` counts **visible** fraction digits —
   the table row "other | fractions" should read "any value **displayed** with a fraction
   digit". Add the consequence: under fixed-decimal formatting `other` is the only live
   branch.
2. RU-PLURAL: "ends in 1, not 11" → `i % 100 != 11`; **111 is `many`**.
3. A ranges sub-rule (absent today): the end value decides, and it can be `one`
   (5–21 → `one` → «5–21 файл»).
4. RU-FRACTION's «тыс.» caveat now has a spec answer; replace "audit the pair together"
   with the `c`-shift rule.

## Cross-subject proposals

- **The range family, sighting 4.** Its contribution is the *reading*: a row is a
  verified default, not necessarily a deviation, so **a run that only counts rows will
  misread agreement as override**.
- **"`v` is a property of the display, not the value"** — second sighting with [[czech]],
  whose `many` *is* `v != 0`. Two mechanisms, one claim. Ready to land in both.
- The category-vs-case distinction (CLDR names categories and says nothing about genitive
  singular/plural) is a general purity point for every plural technique in the bundle.

## Method note

The harness validated itself **before** any `ru` claim, by reproducing all 13 rows of the
spec's own *Plural Operand Examples* table. A final re-open pass re-derived 34 checks
from the artifacts against the shipped text. No reference implementation was used, and
deliberately: per the brief, an ICU run is class-A evidence about ICU, not class-B about
the standard — the oracle is the standard's own sample sets plus its own operand table.

## Could not verify

The technique's **grammatical** claims (few = genitive singular, many = genitive plural,
«1,5 файла») are not conformance-testable against CLDR and were left untouched.
`pluralRanges.xml` self-identifies as generated, which supports but does not prove the
"verified default" reading; the normative statement is the §Plural Ranges clause cited.

## 2026-08-29 - wave 3 (spell-out rulesets and grammatical features)

**Pin.** `unicode-org/cldr@release-48-2`. File: `spec--gender-and-aspect.md`.
**Fate: confirmed and extended; the aspect half not conformance-testable.**

- **Gender changes the Russian numeral at exactly two positions and nowhere else** - the
  units-1 and units-2 slots, teens excluded. Measured per case over 0..10000: nominative
  and accusative differ across genders on 1800 values, the three oblique cases on 900, so
  **82% of integers spell identically in all four genders**. With a units digit of 0
  gender never surfaces at all, because a multiplier agrees with its own counting noun.
- **The technique's gender half is entirely verbs and participles** and omits the numeral
  altogether. That is the gap this application fills.
- Case: `grammaticalFeatures` declares 8 values, the rulesets realize 6 - two are aliases,
  one has no ruleset. **`ru` declares no animacy** while siblings in the same file do, so
  the accusative cardinals are the inanimate paradigm and cannot count people.
- Aspect is **not conformance-testable**: every grammatical-feature entry targets nominals,
  and a grep for verb and aspect terms is empty across all three pinned files.

**A control that PASSED, and why that is the finding.** Dropping the teen guard produced
**0 errors** here - the same guard the sibling plural application measured as load-bearing
at 400/10001, because 11 and 12 have no gendered forms. *Same-looking guard, opposite
verdict.* Worth carrying: a guard's necessity is a property of the rule it sits in, not of
the language.

**Two upstream defects, both verified by the director and both still current.**
- The masculine prepositional ruleset has **nominative** forms at 20 and 30 while its own
  40-90 rows and all three sibling genders are oblique. Affects 2000 of 10000 integers and
  propagates to its alias. Present in far older releases - long-standing, not a regression.
- Two digits-ordinal rulesets emit **U+0065 LATIN SMALL LETTER E** where the sibling neuter
  ruleset uses U+0435 Cyrillic and all 28 other suffixes are Cyrillic - a homoglyph island.

**Evidence class:** neither B1 nor B2 - executable rule text with no publisher fixture at
all. Stated in the document's third paragraph. Validation came from a cross-encoding check
(the file encodes its rules twice; both parsed to the same 1380 rows) and a published
minimal-pair frame, not from an oracle.

**Cross-subject:** the harness is locale-agnostic and parses any language's spell-out
rulesets - the brief's best unconsumed lead is now consumed once and proven executable.
`main/ru.xml` also carries explicit grammatical gender on 154 units, a ready fixture for
the loanword-gender rule that two terminology techniques state.

**2026-08-29 (cycle 3) - LANDED.** New anchored rule **RU-NUMERAL-GENDER** - the
spelled numeral agrees at the units-one and units-two positions only, teens excluded,
so ~82% of integers spell identically in all four genders; agreement is with the
governed noun, not the subject; and the accusative forms are the inanimate paradigm
and cannot count people. Landed as one half of a two-sighting family with [[spanish]].
The two upstream defects stay recorded and unfiled.
