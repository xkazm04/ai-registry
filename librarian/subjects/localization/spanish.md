---
subject: spanish
domain: localization
last_touched: 2026-09-10
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

**2026-08-29 (cycle 3) - LANDED.** New anchored rule **ES-NUMERAL-GENDER**, the other
half of the two-sighting family with [[russian]]: the spelled numeral agrees at a
closed set of positions (one, the units-one series, the hundreds from two hundred up)
and **stops agreeing past a million**, because the counting word becomes a masculine
noun governing its own count. That ties the gender rule to ES-PLURAL-MANY as one
phenomenon seen twice, which is what the wave-2 worker meant by "gender and many turn
out to be one fact".

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/spanish",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f05a96fe7aac49a1",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 5 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "FundéuRAE permits some consequential gerunds; a blanket ban on any posterior event overstates the rule.",
    "Voseo exists beyond Argentina, with regional pronoun and verb combinations.",
    "Archivos: {count} can preserve count meaning when a runtime lacks required plural slots.",
    "Replacing a visible borrowed label with an unrelated Spanish accessible name can defeat label-in-name."
  ],
  "sources": [
    {
      "path": "knowledge/localization/european/spanish",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.fundeu.es/recomendacion/el-gerundio/",
      "scope": "Primary FundéuRAE guidance allows specified immediate or logically consequential uses of posterior gerunds."
    },
    {
      "url": "https://www.rae.es/dpd/voseo",
      "scope": "Primary pan-Hispanic voseo entry establishes regional variation, not an Argentina-only voice."
    },
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html",
      "scope": "Primary W3C explanation requires visible label text in accessible names for relevant controls."
    }
  ],
  "documents": {
    "spanish.md": {
      "disposition": "reverify",
      "reason": "Golden path overstates exactly four variants, regionally unmarked neutral Spanish, voseo only Argentine and usted for professional products. Many is not automatically de after every representation; screen-reader behavior cannot be inferred from an inclusive suffix. Spanish needs quantity spacing and can embed RTL."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "clarify",
      "reason": "Repaired false-friend table as exhaustive sense bans, gerund only ongoing and all posteriority condemned. Preserve argument, agency, ownership and legitimate regional/technical senses."
    },
    "techniques/plural-and-gender-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired two-category contradiction, unrescuable frozen count, many automatically inserts de, gender stops above million and selector cannot carry gender. Recasts retain number and unknown referents; accessibility claims require testing."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "Repaired voseo only Argentine, pronoun/verb mixture always error, one neutral dialect unmarked everywhere and pronoun hits directly prove register drift. Scope migration by actual grammatical role."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Wrong-but-consistent is not superior to accurate terminology, and inherited absence of a loan is not a ban on introducing it. Hypernyms can lose mobile/computer specificity, gender/plural rules need lexical usage, brand forms can localize and developer jargon can be valid. Fix-on-touch versus coordinated migration is task-specific."
    },
    "techniques/typography-and-punctuation.md": {
      "disposition": "clarify",
      "reason": "Repaired no literal formatted numbers, no punctuation spacing, ellipsis codepoint determines line-break and lowercase after ellipsis always. Preserve opening question marks with role-specific exceptions and declared typography."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired fixed 140-percent rejection, wrapping worse than meaning error, imperatives on buttons intrinsically wrong and accessible gloss replaces visible label. Actual layout and label-in-name determine outcome."
    },
    "applications/process--register-and-address.md": {
      "disposition": "reverify",
      "reason": "Historical Personas register policy retained, not consumer reread or new authorization requirement. Te-necesita to le-necesita is not a universal register-only substitution; grammatical role, referent and dialect matter. Source paths/catalog names are historical and absolute fleet roots remain cleanup work."
    },
    "applications/process--typography-and-punctuation.md": {
      "disposition": "reverify",
      "reason": "Historical glyph/count example retained, not rerun. The count phrase also has a frozen singular defect; monitorear alone does not prove a specific regional number format. Static examples can be valid, Spanish percent spacing is real and mixed-direction content can need bidi. Absolute checkout path remains cleanup work."
    },
    "applications/spec--plural-and-gender-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR harness retained, not rerun. Category rules do not provide de morphology or certify all spelled forms. Gender remainder does not simply cease above a million, and ordinal other does not prevent an independent gender select. Finite-grid exclusivity and pinned data version claims remain historical."
    }
  }
}
```
