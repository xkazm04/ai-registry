---
subject: french
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# french

First touch. External-reconcile wave 2, class B.

**Pin.** `unicode-org/cldr@48.2` + UTS #35 Part 3 (self-declares 48.2, so no spec/data
skew) + `common/rbnf/fr.xml`. File: `spec--plural-and-agreement.md`.
**Fate: confirmed**, three new sub-claims and one documented gap. FR-ZERO and FR-MANY
both hold exactly as written — no refutation was manufactured.

## Sightings

- **`one` is the half-open interval [0, 2), not "0 and 1".** The rule is `i = 0,1` on
  the *integer-digits* operand, so 0,5 → `one`, 1,5 → `one`, 1,999 → `one`, 2,0 →
  `other`. **Verified by the director.** The spec says this twice and one of them uses
  French as its worked example. The technique's "0 and 1" is true of the integers and
  misleading about the branch. New audit signature: a `one` branch that spells the
  number out or assumes exactly-one (*Un poste*, *Il reste une minute*) renders **1,5
  poste** wrong the first time a rating or an average reaches it — and the `=1`
  signature the technique already names is worse than documented, missing 0 *and* every
  non-integer below 2.
- **Ordinals are a real gap, and the technique is silent.** `fr` has an ordinal `one`
  (`n = 1`) which **disagrees with the cardinal rule at 0** — 0 is `one` as a cardinal
  and `other` as an ordinal, because the ordinal tests `n` where the cardinal tests `i`.
  Worse: CLDR's own `ordinalMinimalPairs` for `fr` are **feminine** (`{0}re` / `{0}e`,
  verified by the director), and nothing in the plural machinery distinguishes masculine
  *1er* from feminine *1re* — that gender lives in RBNF's four ordinal rulesets. **A
  `selectordinal` block for French has two branches and cannot express 1er vs 1re.**
- **`many` is selected by the formatted representation, not the magnitude.**
  `1000000` → `many`, `1000000.0` → `other` (one visible fraction digit breaks `v=0`),
  `1500000` → `other` but the same quantity compact (`1.5c6`) → `many`. A `many` branch
  cannot be tested by feeding the counter a big number — only through the formatter the
  surface uses.
- **Ranges:** `fr pt` has three rows, **0 overrides**, and **every `many` pair is
  absent** — including the compact ranges FR-MANY tells people to write. Verified by the
  director. So "a range takes its end value's category" happens to hold for `fr`, but as
  a coincidence of the defaults, portable to no other locale.
- Provenance check: `many` first appears for `fr` at CLDR release-38, so the technique's
  "since v38" is correct.

## Executed evidence

Own operand implementation and rule-grammar parser, no plural library. Cardinal 85/85,
ordinal 22/22, 0 disagreements. Six degenerate controls, all failing: over the 200
two-decimal values in [0,00–1,99] CLDR selects `one` for all 200 while an exact-value
implementation disagrees on **198** and the English rule set on **200**.

**2026-08-29 (cycle) - LANDED.** FR-ZERO restated as the half-open interval [0, 2)
with the fractional-branch requirement; FR-MANY gained the rendering-not-magnitude
clause. Two new rules: `FR-ORDINAL` (two categories, 0 differs from the cardinal, and
the gender is not selectable) and `FR-RANGE` (under-covered table, every many pair
absent). The golden path was left alone this cycle - it carries the same understatement
and is banked. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. Restate FR-ZERO's rule as the interval [0, 2), with the fractional-numeral branch
   requirement.
2. Add an FR-ORDINAL rule: two branches, 0 is `other`, and er/re is **not selectable**
   through the plural machinery.
3. FR-MANY: state that the category follows the rendering, not the magnitude.
4. Golden path `french.md` repeats "one covers 0 AND 1" and inherits the understatement.

## Cross-subject proposals

- **The range family, sighting 5.** Its phrasing of the transferable rule is the best of
  the wave and the one to land: *range selection is a pair lookup with an end-value
  default, and reusing the end value's category is a per-locale coincidence, never a
  design.* It adds a second failure mode the others did not — a table that
  **under-covers its own locale's category set**.
- **"A plural category can be a property of the rendering, not the value"** — pairs with
  [[spanish]] (plain vs compact) and [[czech]] (`v != 0`). Three sightings.

## Upstream, second independent sighting

The CLDR 48.2 `SHASUM512.txt` digest mismatch first reported by [[arabic]] was
**independently reproduced here** — this worker computed the same `de8660f5…` for the
served zip against the manifest's `4dd00bed…`, which the manifest also assigns to two
jars. Two independent computations agree; the manifest rows are wrong, not the downloads.

## Could not verify

FR-AGREE and FR-PLURAL (acronym plurals, the *(s)* form, unknown-gender policy) are
morphology and untested by this counterpart. Whether French usage prefers the singular at
1,5 was not adjudicated — the standard assigns the category, the technique owns the grammar.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/french",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d4510d277dc8c4db",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "1 000 000 messages is grammatical without de even though the plain cardinal selector can return many.",
    "A policy using narrow space before ? and word space before : is deliberate French typography, not inconsistent mixing.",
    "Les Français uses a capital nationality noun, unlike the adjective français."
  ],
  "sources": [
    {
      "path": "knowledge/localization/european/french",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8392388/tiret-cadratin",
      "scope": "Primary OQLF entry identifies em dash as French punctuation; does not establish every France product convention."
    }
  ],
  "documents": {
    "french.md": {
      "disposition": "reverify",
      "reason": "Typography does not universally outrank mistranslation. Vous, dash avoidance, script/region assumptions and expansion ratios are product defaults, not language-wide requirements. many does not mean a plain digit count automatically needs de. Latin text can embed RTL, and market distinctions extend beyond France/Canada."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Nominal headings are a valid preference, not the only grammatical form. Selon can report a source without alternatives; noun appositions such as fichier exemple can be legitimate. Fronted adverbials and adjective placement are contextual. Dangling participle and placeholder preposition checks are useful, but rewriting must preserve referent and meaning."
    },
    "techniques/plural-and-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired many as automatic de before a digit count, blanket participle agreement, ordinal gender limitation of whole message system and neutral recasts changing the event. Exact-number branches can coexist with category branches."
    },
    "techniques/register-and-address.md": {
      "disposition": "reverify",
      "reason": "Vous is a useful default but tu is not inherently invalid in professional or security copy. On, il faut, c est and impossible de are normal French constructions; replacing them with nous can invent agency. Requerir/demander and necessiter/devoir are not interchangeable syntactic substitutions. Button imperative statement conflicts with ordinary infinitive labels."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Cognates correctly need not be untranslated, but they can have synonyms and belong in a termbase. English did not borrow every shared word directly from French. Borrowing and gender require usage/sense evidence; identifiant may not cover every credential. Closed never-translate list must permit approved localized brand/plan names. Legal terminology not refreshed."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "Repaired em dash as non-French, different space widths as inconsistent and meaning-free sweep claim. Scope by market and message syntax; preserve valid quotation and technical exceptions."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired nationality nouns always lowercase, wrapped button automatically text bug, immutable exact-label grammar and hardcoded examples always defect. Meaning, layout and accessible action labels determine severity."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Historical Personas/kp term decisions retained, not reread externally. Product choices do not prove universal gender or naming rules. Open decisions can be resolved with authorized evidence; historical half-sweep refusals are not current permission requirements. Published absolute checkout path remains cleanup work."
    },
    "applications/process--typography-and-spacing.md": {
      "disposition": "reverify",
      "reason": "Historical typography counts retained, not recounted. Equal source dash counts do not prove copied language; narrow and word spaces may be deliberately assigned to different punctuation. Documented scope controls migration, but incremental correctness is not inherently worse than consistent error. Absolute fleet roots remain cleanup work."
    },
    "applications/spec--plural-and-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR harness retained, not rerun. Category evidence does not certify morphology; plain 1000000 messages does not require de. Plural selector alone lacks gender, but nested select/message arguments can supply it. Default range data is a specified result rather than merely coincidence; release latestness/hash discrepancy claims remain historical."
    }
  }
}
```
## 2026-09-10 — architecture re-review after the compression revert

Read all ten documents at reverted bytes: the golden path, six techniques, two process
applications and the CLDR spec application. The 2026-09-10 record above graded the
subject `reverify` against documents the revert removed; I retract that grading. The
plural half of this subject is the best-sourced material in the bundle and I could
re-verify it directly.

Checked against the primary source, not intuition. I read the `fr` blocks in
`common/supplemental/plurals.xml`, `ordinals.xml` and `pluralRanges.xml` at
`unicode-org/cldr@main` and, for provenance, at `release-38`. Every load-bearing claim
held. The cardinal rule is `i = 0..1`, three categories with `many` present — so
FR-ZERO's "zero is singular" and the spec application's sharpening to the half-open
interval [0, 2) are both right, and the `@decimal` samples (`one` at `0.0~1.5`,
`other` beginning at `2.0`) close it from the other side. `many` is already present in
the `fr` block at `release-38`, which corroborates the application's "new in 38"
provenance. The ordinal rule is `one` at `n = 1`, a *different* test from the
cardinal's `i`, so FR-ORDINAL's "0 is `one` as a cardinal and `other` as an ordinal" is
exactly right. The range table for `fr pt` is three rows — `one+one`, `one+other`,
`other+other` — none deviating from the end-value default and every `many` pair absent,
precisely as FR-RANGE says. I read the data files; I did not execute ICU or the
application's own harness.

Two findings, both in text rather than in doctrine. First,
`techniques/plural-and-agreement.md` opens FR-ZERO with two consecutive `**Trigger**`
lines, the first a strict subset of the second ("...can reach 0" / "...can reach 0, or
carry a decimal"). It is the visible seam of the decimal sharpening being landed on top
of the original rule, and it makes the first rule in the subject's hardest technique
read as an editing accident. Second, FR-DASH in `techniques/typography-and-spacing.md`
is headed "The em dash is not French punctuation" and its cited authority is the
Microsoft French style guide. That is a vendor house style, and the rule's own body
concedes the en dash it prescribes instead is "a stylistic minority" and that a house
may ban dashes outright. French typographic tradition uses the *tiret* — the em dash —
for incises, which is why the sibling process application has to record kp's ban as a
*house overruling its authority*. The rule's UI verdict is defensible and well
operationalized; the headline states a per-house ruling as a fact about the language.
I did not fetch the Imprimerie nationale's Lexique this run, so I am reporting the
mismatch between the claim's scope and the source the document itself names, not a
contradiction I read in a competing authority.

What I did not resolve. Both FR-RANGE and its Spanish counterpart assert that "roughly
half the published groups carry at least one override" in `pluralRanges.xml`. I read
six groups today, not the file's full inventory, so that proportion is unverified. It
is used only as a caution against generalizing, so nothing rests on it, but it is a
number in the corpus that no source I read establishes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/french",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:37de266c4bda40ea",
  "disposition": "keep",
  "coverage": "All 10 owned documents read in full at reverted bytes. CLDR plurals.xml, ordinals.xml and pluralRanges.xml read for the fr blocks at main and (for many's provenance) at release-38 - read, not executed. Not evaluated: the kp and Personas trees the two process applications cite; the Microsoft French style guide and the Imprimerie nationale Lexique; the 'roughly half the published groups' proportion; any runtime witness; maturity or verified_on refresh.",
  "counterexamples": [
    "FR-ZERO's exception ('a counter guarded so 0 never displays') has no companion for the decimal half: a surface that guards zero but can still render 1,5 keeps the exact bug the sharpening describes, and the exception as written reads like it clears the rule.",
    "FR-AGREE's restructuring licence assumes the agreeing word is inside the same key; the technique says so, but the golden path's summary of it does not, and a reviewer working from the golden path alone would try to fix a cross-key agreement break locally.",
    "FR-COGNATE routes identical-to-source strings into three classes but is silent on the fourth real case - a French string identical to English because the source string is itself a code identifier or an enum value, which is neither cognate, loanword, nor untranslated value."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/plurals.xml",
      "result": "Established that fr carries one (i = 0..1), many and other, with @decimal samples one 0.0~1.5 and other from 2.0. Confirms FR-ZERO, the spec application's [0, 2) interval sharpening, and FR-MANY's existence. It did not establish the de-attachment grammar the many category tracks, which is not a CLDR field."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/ordinals.xml",
      "result": "Established that the fr ordinal rule is one at n = 1 plus other - a different operand from the cardinal's i. Confirms FR-ORDINAL's claim that 0 and 1,5 select differently as cardinal and as ordinal. It did not establish the gendered 1er/1re limit, which the document sources to rbnf and to the published minimal pairs, neither of which I read."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that the fr pt group publishes exactly three rows (one+one, one+other, other+other), none deviating from the end-value default, with every many pair absent. Confirms FR-RANGE end to end. It did not establish the file-wide 'roughly half the published groups carry an override' proportion the rule also asserts."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-38/common/supplemental/plurals.xml",
      "result": "Established that the fr block already carries one/many/other at release-38, corroborating the spec application's provenance claim that many is new in 38 for French. It did not establish that 38 is the introducing release rather than an earlier one."
    }
  ],
  "documents": {
    "french.md": {
      "disposition": "keep",
      "reason": "The typography-first triage, the tu/vous ruling, the plural summary (one covers 0 and 1; many exists for the millions) and the fr-CA separation are all correct and correctly ranked. The 'what is absent' passage - heavy nominalization is not a smell in French - is the entry that most repays being in a golden path, because it is the rule a reviewer imports damage from."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "FR-NOUN, FR-ANACOLUTHON, FR-SELON, FR-FRAGMENT and FR-NOUNADJUNCT each name a construction with a trigger and a rebuild, and the calqued-geometry family is honestly labelled as a family rather than promoted to anchors it has not earned. The orientation warning that opens the technique is what stops cross-language rule sharing, and it is placed before any rule."
    },
    "techniques/plural-and-agreement.md": {
      "disposition": "clarify",
      "reason": "FR-ZERO carries two consecutive **Trigger** lines, the first a strict subset of the second - the unremoved seam of the decimal sharpening. Substance re-verified correct against CLDR today (i = 0..1, many present, ordinal on n, three range rows with no override); the defect is that the subject's hardest technique opens with a duplicated line."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "FR-VOUS, FR-IMPERSONAL and FR-FORMAL are each greppable, and FR-IMPERSONAL's exception for temporal il y a is exactly the false-positive guard a mechanical probe needs. The Impossible-de blast-radius note correctly makes the count precede the sweep rather than the ruling."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "FR-COGNATE is the strongest rule in the subject - it converts the largest pile an identical-to-source audit produces in French into a routing decision rather than a translation finding, and it says plainly that identity with the source is evidence and never proof. FR-ONE-WORD, FR-LOANGENDER, the derived-forms rule and the AI/IA archetype are all recorded-ruling shaped rather than prescriptive."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "FR-DASH is headed 'The em dash is not French punctuation' on the authority of one vendor's house style, while its own body concedes the en dash it prescribes is a stylistic minority and that a house may ban both. French typographic tradition uses the tiret for incises, which is why the sibling process application must record kp's ban as a house overruling its authority. The UI verdict is fine; the headline states a house ruling as a fact about the language. FR-APOS, FR-SPACE, FR-UNIT, FR-ELLIPSIS and FR-ACCENT are unaffected."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "FR-CASING with its enum-mirroring exception, FR-LENGTH with the rendered-review rule that the multiplier alone decides nothing, and FR-CTA's element-type table are all decidable at the string level. The date-range idiom note (du 11 au 17 aout cannot be produced by wrapping a preformatted range) is a genuinely non-obvious constraint stated in the right place."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Two catalogs showing the two halves of the technique - a decisive termbase and an honest open-decision register - with five reviewers independently declining the same tempting fix recorded as the register working rather than failing. That is the observation the technique cannot state for itself. Not re-verified against the trees; verified_on stands unchanged."
    },
    "applications/process--typography-and-spacing.md": {
      "disposition": "keep",
      "reason": "Two products making different house calls on the same rule, both recorded, with the FR-UNIT minting incident quoted from the review log that produced it. The counted non-compliance figures are what make 'normalize to U+202F' a decision rather than an opinion, and the document says so. Not re-verified against the trees; verified_on stands unchanged."
    },
    "applications/spec--plural-and-agreement.md": {
      "disposition": "keep",
      "reason": "Re-verified today against CLDR: fr's three cardinal categories with one at i = 0..1, the ordinal's n = 1 test, the three-row range table with no override and every many pair absent, and many's presence already at release-38. The half-open-interval sharpening and the 'many follows the rendering, not the magnitude' finding both read back correctly from the published rules. Its harness was not re-executed and the 48.2 hash-manifest note was not re-checked."
    }
  }
}
```

