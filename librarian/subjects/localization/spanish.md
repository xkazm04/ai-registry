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
## 2026-09-10 — architecture re-review after the compression revert

Read all ten documents at reverted bytes: the golden path, six techniques, two process
applications and the CLDR spec application. The 2026-09-10 record above graded the
subject against documents the revert removed, and I retract that grading. This subject
produced the two sharpest findings of my group, and neither was visible from the text —
both required going to the data.

**A dated provenance claim that is wrong.** `spanish.md` says "Since CLDR 42 Spanish
also has a `many` category", and the spec application labels its C1 control "the
pre-CLDR-42 pipeline". I read `common/supplemental/plurals.xml` at `release-41` and at
`release-40`: the `es` block already carries `one`/`many`/`other`, with the `many` rule
byte-for-byte the one the documents quote, at both tags. So the category predates
CLDR 42 by at least two releases. I could not cleanly read the `es` block at
`release-38` — two extraction attempts returned a neighbouring block — so I cannot name
the introducing release; what I can say is that 42 is not it. The rule itself is
unaffected; the version stamp is the sort of thing a reader cites onward, so it should
be corrected or dropped rather than left specific-and-wrong.

**An inference with a dated expiry.** ES-ORDINAL states that "Spanish ordinals have a
single CLDR category" and draws a conclusion from it: "Because ordinals have one
category, none of this is selectable by a plural block. Gender and apocopation are
decided by the referent, which the format system cannot see." At the pinned release
that is exactly right — I re-read `ordinals.xml` at `release-48-2` and `es` sits in the
sixty-eight-locale `other`-only group. On `main`, it does not. `es` now has a block of
its own: `one` at `n % 10 = 1,3 and n % 100 != 11`, plus `other`. I checked that twice,
once by asking for the `es` block and once by asking which block carries that rule
text, and it is `es` alone. That `one` set is precisely the apocopated series the rule
itself already documents from the spell-out rulesets — *1.er*, *3.er*, *21.er*, with 11
excluded — so when CLDR 49 ships, the apocopated masculine becomes exactly what an
ordinal selector selects, and the rule's inference inverts. CLDR 49 is still
prerelease (`release-49-alpha2`, 2026-09-03; the newest non-prerelease tag remains
48.2), so nothing in the corpus is wrong today. This is a re-verify trigger with a
name attached, not a correction.

Everything else I could check held, including the subject's most counter-intuitive
claim. `pluralRanges.xml` gives `ca es` three rows — `one+other → other`,
`other+one → other`, `other+other → other` — and the middle one is a genuine override
of the spec's end-value default, so ES-PLURAL-RANGE's "a range ending at exactly 1 is
plural, *0–1 archivos*" is a published fact and not a guess. The cardinal rule is
`one: n = 1` (value, not integer part, so trailing zeros cannot move a count out of
`one` and every non-integral count is `other`), with `many` and `other`. I read data
files; I did not execute anything, and the application's harness was not re-run.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/spanish",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:bdddc1bff1c2f77e",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at reverted bytes. CLDR plurals.xml read for the es block at release-40, release-41 and main; ordinals.xml at release-48-2 and main; pluralRanges.xml at release-48-2; the GitHub release list for CLDR 49's status - all read, not executed. Not evaluated: rbnf/es.xml, which carries the gendered-abbreviation and paired-cardinal-ruleset claims; grammaticalFeatures.xml; RAE orthography and the Fundeu guidance the typography and gender rules cite; the Personas tree the two process applications cite; maturity or verified_on refresh.",
  "counterexamples": [
    "ES-GENDER-PLACEHOLDER's ladder assumes a fixed head noun can absorb the gender, but a string whose placeholder IS the head ('{item} no disponible' as a bare status pill, no room for 'Elemento') has only rung 4, and the rule presents rung 1 as resolving most cases.",
    "ES-PLURAL-RANGE's override is stated for the end value, but the es table has no (one, one) row at all - so a 1-1 range falls back to the default rather than to a published result, and the rule's 'read the rows' advice does not say what to do when the row a UI actually renders is absent.",
    "ES-REGIONAL's neutral tactics work noun by noun and are silent on the verb-morphology cell that is not neutralizable: a one-Spanish catalog with an imperative addressed to a plural audience must choose ustedes forms, which ES-USTEDES covers, but nothing covers a voseo-market build's interaction with the recorded singular register."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-41/common/supplemental/plurals.xml",
      "result": "Established that the es block already carries one/many/other at CLDR 41, with the many rule identical to the one the documents quote; the same block appears at release-40. This refutes the 'Since CLDR 42' provenance in spanish.md and the 'pre-CLDR-42 pipeline' label on the spec application's C1 control. It did not establish which release introduced many for es - an attempt to read release-38 returned a neighbouring block twice and was abandoned."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/ordinals.xml",
      "result": "Established that on the CLDR 49 development branch es has left the other-only group and carries its own block: one at 'n % 10 = 1,3 and n % 100 != 11' plus other - confirmed twice, once by locale and once by rule text, which returned es as the only block with that rule. That category set is the apocopated 1.er/3.er series, so ES-ORDINAL's inference that apocopation is unselectable inverts at CLDR 49. It did not establish a release date for 49."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that at the pinned release es sits in the sixty-eight-locale single-other ordinal group, so ES-ORDINAL and the spec application are correct as of their pin and the finding above is a currency trigger rather than an error. It did not establish anything about the gendered abbreviations, which live in rbnf/es.xml."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that the ca es group publishes three rows - one+other -> other, other+one -> other, other+other -> other - and that the middle row genuinely overrides the spec's end-value default. Confirms ES-PLURAL-RANGE's '0-1 archivos' claim from the data. It also shows the table has no (one, one) row, which neither the rule nor the application mentions."
    },
    {
      "url": "https://api.github.com/repos/unicode-org/cldr/releases",
      "result": "Established that the newest CLDR tags are release-49-alpha2 (2026-09-03) and alpha1/alpha0, all prerelease, so release-48-2 remains the newest citable edition and the subject's pins are current. It did not establish when 49 will ship, which is what would date the ES-ORDINAL re-verify."
    }
  ],
  "documents": {
    "spanish.md": {
      "disposition": "clarify",
      "reason": "Two dated claims. 'Since CLDR 42 Spanish also has a many category' is wrong - the es block carries many at release-41 and release-40, verified today. And 'Ordinals have a single category' is true at the pinned 48.2 but already false on CLDR main, where es carries one at n % 10 = 1,3 excluding 11. Everything else - the which-Spanish decision, the neutral-by-construction lexicon, the pro-drop and register-neutral-infinitive facts, the zero-takes-other rule, the inverted-punctuation and no-space-before-punctuation contrast with French - is accurate."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "The false-friend table is correct pair by pair, including the two asymmetries it flags explicitly (aplicar is fine for settings and wrong for jobs; soportar has crept into jargon and is still ruled a calque). ES-GERUND's decision rule - names a thing, use a noun; reports a process running now, keep the gerund - is the whole rule in one line, and ES-SE-PASSIVE's note that se drags number agreement onto the patient is the detail the English source never shows."
    },
    "techniques/plural-and-gender-agreement.md": {
      "disposition": "reverify",
      "reason": "ES-ORDINAL's premise - a single CLDR ordinal category - and the inference it draws from it (apocopation and gender are not selectable by a plural block) hold at the pinned release-48-2 but are already superseded on CLDR main, where es carries one at n % 10 = 1,3 excluding 11: exactly the apocopated 1.er/3.er set the rule describes from the spell-out data. Re-verify when CLDR 49 leaves prerelease. Everything else was re-verified correct today: ES-PLURAL-CLDR's n = 1 and zero-is-plural, ES-PLURAL-MANY's rendering-not-magnitude sharpening, and ES-PLURAL-RANGE's genuine (other, one) override."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "ES-REGISTER, ES-VOS, ES-USTEDES, ES-PRODROP and ES-REGISTER-MIX form a complete cover of the second-person system, and ES-USTEDES correctly identifies the one cell where neutrality has a single right answer rather than a choice. The audit corollary - detect register from verb endings, possessives and object pronouns, not from searching for the pronouns a correct catalog barely contains - is the operationally useful half."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "ES-LOAN's ordered questions, the never-mint-an-unrecorded-loanword clause, and ES-REGIONAL's table with its hypernym tactic and its one hard ban are all sound. ES-TERM-ONE's forgotten half - a rendering, once assigned, is reserved against reuse for a neighbouring concept - is the part that actually prevents collapse, and ES-FALSE-EQUIV's negative space stops each new translator re-deriving the same rejected neighbour."
    },
    "techniques/typography-and-punctuation.md": {
      "disposition": "keep",
      "reason": "ES-INVERT's craft half - the mark opens the question, not the sentence, so it goes mid-sentence with lowercase continuing - is the part English authors have no instinct for and it is stated first. ES-NUMBERS is right that four-digit integers group nothing and that grouping starts at five digits, and right to make the regional separator split the argument for never hardcoding a formatted number. ES-QUOTES separates serialization from typography cleanly."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "ES-CASE's subtle half - a capitalized common noun after a quantifier claims to be a brand, so casing is meaning - turns a style rule into a typed error. ES-INFINITIVE's three-way split with its named fourth wrong option, ES-LENGTH's ordered tactics beginning with the free win from de-anglicization, and ES-A11Y-EXPANSION as the compensating half of every shortening are all correct and correctly sequenced."
    },
    "applications/process--register-and-address.md": {
      "disposition": "keep",
      "reason": "A recorded usted ruling with the three parts the technique asks for - the choice, the audience reasoning, the provenance - plus the conversion table that turns it into a lookup. The upward lesson is the specific one: without the 'new keys never match drifted neighbours' clause, a register migration never converges because drifted sections recruit faster than touch-fixes retire. Not re-verified against the tree."
    },
    "applications/process--typography-and-punctuation.md": {
      "disposition": "keep",
      "reason": "Every anchor documented against a live shipped violation, which is what makes the rules credible rather than obvious. The hardcoded Peninsular thousands separator in a LatAm-leaning catalog is the sharpest instance - hardcoding picked a region and picked the wrong one - and the recorded negative space (no space before inverted marks, contrasted with French) stops a reviewer importing another locale's rules. Not re-verified against the tree."
    },
    "applications/spec--plural-and-gender-agreement.md": {
      "disposition": "reverify",
      "reason": "Two dated items. Its C1 control is labelled 'the pre-CLDR-42 pipeline', but es carries many at release-41 and release-40 - verified today - so the version stamp is wrong. And its ES-ORDINAL section confirms the single-category finding against release-48-2, which is correct at that pin and already superseded on CLDR main. Its other findings read back correctly from the data: the n = 1 equality and its every-non-integral-count-is-other consequence, the many rule's two disjuncts and the same-quantity-different-category demonstration, and the (other, one) range override. The harness was not re-executed."
    }
  }
}
```

