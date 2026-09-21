---
subject: russian
domain: localization
last_touched: 2026-09-10
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

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/russian",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cd0fe0e674fea36a",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "С пятью файлами uses instrumental agreement, not the genitive plural dictated by the old category table.",
    "A questionnaire can use Вы without naming its respondent.",
    "A label such as Файлы: {count} avoids noun government; merely replacing the noun by a verb does not guarantee agreement."
  ],
  "sources": [
    {
      "path": "knowledge/localization/european/russian",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://gramota.ru/biblioteka/spravochniki/pismovnik/kak-pisat-vy-i-vash-s-propisnoy-ili-so-strochnoy-bukvy",
      "scope": "Primary editorial guidance includes capitalized Vy in questionnaires, beyond correspondence to a named person."
    }
  ],
  "documents": {
    "russian.md": {
      "disposition": "reverify",
      "reason": "Cyrillic is not caseless, LTR does not remove bidi/font concerns and expansion ratios are not universal. Not every verb has an aspect pair; category-to-case mapping depends on syntax. Formal address and lexical slang policies are product choices, and uppercase Vy also occurs in questionnaires."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Head-noun quotation can protect entity titles but not arbitrary noun phrases, personal names or geographic names universally. Colon form can change a question into a label. Dropping for/possessive can change beneficiary or ownership; vashi after imperative is not universally a calque. Genitive-count thresholds are editorial candidates."
    },
    "techniques/gender-and-aspect.md": {
      "disposition": "clarify",
      "reason": "Repaired every verb has paired aspects, ty has no neutral escape, masculine head noun always controls named-person predicate and blanket numeral gender positions across cases. Preserve semantic event and unknown referents."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired arithmetic fully determines noun form, frozen verb removes all agreement, missing v guard in table and compact/range examples universally determine prose. Selector and formatter must share representation."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "Repaired explicit Vy imperative broken, uppercase only named correspondence and informal register confined to youth. Scope controls and audience policy."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Formal pronouns do not dictate a slang ban; current domain usage needs fresh evidence per disputed term. Native word can also be wrong sense. Latin brands can have authorized Cyrillic forms and quotes serve grammatical purposes. One English word can have senses and Russian term variants without destroying recognition."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "Repaired all quotes guillemets despite nested exception, en dash unused, all-caps foreign and mechanical punctuation sweeps. Distinguish syntax and typographic convention."
    },
    "applications/process--plural-and-count-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical Personas two-slot call-site observations retained, not rerun. Genitive plural is not correct at all 5+ values, e.g. 21, and verb-next-to-count still requires context and agreement. Runtime gap can be repaired in authorized shared work; old refusal is not current permission requirement. Absolute fleet root remains cleanup work."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Historical termbase incidents retained, not recounted. Term choice depends on concept, not source token alone when legacy names differ. Counted house voice does not prove all professional usage, and fix-on-touch versus coordinated bulk is scope-dependent. Absolute fleet root remains cleanup work."
    },
    "applications/spec--gender-and-aspect.md": {
      "disposition": "reverify",
      "reason": "Historical custom RBNF harness retained, not rerun. Differential comparison does not guarantee engine bugs cancel; row counts do not validate all output. Nominative gender pattern does not generalize to oblique forms. No animacy field does not establish all people-counting impossible, and ordinal plural is not a fourth grammatical gender."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR harness retained, not rerun. Display digits affect category only through actual selector operands; separate formatter/selector can diverge. Range categories do not certify any complete Russian case frame. Other-only ordinal selection does not mean no lexical ordinal machinery or no other select branches."
    }
  }
}
```
## 2026-09-10 — architecture re-review after the compression revert

Read all eleven documents at their reverted bytes: the golden path, six techniques,
two process applications and two spec applications. The 2026-09-10 record above was
written against documents that no longer exist, and it graded ten of eleven `reverify`
on the strength of hedges it could not resolve. I retract that blanket grading. Most
of what it listed as unresolved is either grammar that no conformance artifact can
settle — which the documents themselves already say — or was resolvable, and I
resolved it today.

What I checked against the primary source rather than against intuition. I fetched
`common/supplemental/plurals.xml` and `pluralRanges.xml` from `unicode-org/cldr`
(release-48-2, the tag the spec applications pin, plus `main` as a currency probe) and
read the `ru` blocks. The published `ru` cardinal rules are exactly the four the
technique states, each non-`other` rule guarded by `v = 0`, and `other` carries
`@decimal` samples and no `@integer` samples — so RU-FRACTION's "`v` counts *visible*
fraction digits, and «2,0» selects `other`" is the mechanism, confirmed. The range
table is 16 rows over `be lt ru uk` and every row's result equals its `end`, including
`many × one → one`, so RU-PLURAL-RANGE's «5–21 файл» is a published fact and not an
inference. I read the data; I did not run ICU or any reference implementation, and the
spec applications' own harnesses were not re-executed.

Two findings, both editorial rather than substantive. First, in
`techniques/plural-and-count-agreement.md` the `other | fractions | genitive singular
| 1,5 файла` row sits *below* the "read the exclusions as last two digits" paragraph
instead of inside the table it belongs to. In Markdown that is a stray one-row table,
not a fourth row, so the rule that most needs to be read as part of the four-category
set is the one that falls out of it — and it lands after an "Exception: none. The
rules are total over the integers" sentence that is about the other three. The
content is right; the placement defeats it. Second, `russian.md` opens by calling
Cyrillic "caseless in the typographic sense that matters". Cyrillic is bicameral, and
"caseless" is Unicode's term for genuinely uncased scripts; the parenthetical rescues
the sentence, but the same subject later builds two rules (RU-CASING's sentence-case
mandate and its all-caps ban) that only exist because Cyrillic has case.

I carry forward one narrowing from the reverted record because I believe it, while
noting I did not re-fetch its source this run: `russian.md` and RU-VYCAP both scope
the politeness capital «Вы» to "personal correspondence addressed to one identified
individual", and the Russian orthographic authorities also admit it in questionnaires
and official forms addressed to a single respondent who is never named. The UI ruling
(lowercase throughout software text) is unaffected; the stated scope is narrower than
its authority.

What I could not resolve. `applications/spec--gender-and-aspect.md` reports two
upstream CLDR data defects — nominative forms at 20 and 30 inside
`%spellout-cardinal-masculine-prepositional`, and a Latin `e` homoglyph in two
digits-ordinal rulesets — as current and unfiled. I did not re-read `common/rbnf/ru.xml`
or re-run its 1380-row harness, so whether they are still current at 48.2 and on `main`
is open. That is the one document I grade `reverify`, and it is the evidence that is
unresolved, not the reasoning.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/russian",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:9ec11ad6bb8dd8cb",
  "disposition": "keep",
  "coverage": "All 11 owned documents read in full at reverted bytes. CLDR release-48-2 and main plurals.xml and pluralRanges.xml read for the ru blocks (read, not executed). Not evaluated: the RBNF spell-out rulesets and the two upstream defects the gender application reports; the Personas tree the two process applications cite; any runtime or consumer witness; maturity or verified_on refresh.",
  "counterexamples": [
    "RU-FROZEN's rephrasing idioms do not cover a string whose count and noun are both interpolated («{count} {unit}») - no rewrite can make an unknown noun agree, and the technique routes that only to the defect register.",
    "RU-CASEGOV's head-noun insulation assumes a natural generic noun exists; for a value that is itself a category name («Udalit' razdel «Nastroyki»?») the head noun and the value collide semantically.",
    "The subject is silent on Russian's instrumental government after «s» («s pyat'yu faylami»), where the count governs neither genitive singular nor genitive plural - the four-category table says nothing about oblique count phrases."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that the ru group (be lt ru uk) publishes 16 rows and that every row's result equals its end value, including many+one -> one. This confirms RU-PLURAL-RANGE's «5-21 fayl» and its 'verified default, not an override set' reading. It did not establish the grammatical claims the rule hangs on the categories (nominative singular after a range ending in one)."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/plurals.xml",
      "result": "Established that the ru cardinal rules are unchanged on the CLDR 49 development branch: one/few/many each guarded by v = 0, other carrying @decimal samples only. Confirms RU-PLURAL's table and RU-FRACTION's visible-fraction-digit mechanism, and confirms no pending currency change for ru. It did not establish anything about the RBNF spell-out data, which lives in a different file."
    },
    {
      "url": "https://api.github.com/repos/unicode-org/cldr/releases",
      "result": "Established that CLDR 49 is still prerelease (release-49-alpha2, 2026-09-03), so release-48-2 remains the newest citable edition and the spec applications' pins are current. It did not establish a date for CLDR 49's release."
    }
  ],
  "documents": {
    "russian.md": {
      "disposition": "clarify",
      "reason": "Calls Cyrillic 'caseless in the typographic sense that matters'; Cyrillic is bicameral and 'caseless' is Unicode's term for uncased scripts, and the subject's own RU-CASING rules depend on case existing. Separately, the politeness-capital scope ('only in personal correspondence addressed to one identified person') is narrower than the orthographic authority, which also admits capitalized Vy in questionnaires addressed to an unnamed single respondent. Both are wording, not doctrine: the UI rulings are unaffected."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "RU-CASEGOV, RU-PREP, RU-POSS and RU-NOUNCHAIN each name a construction, a detection cue and a replacement, and each carries a real exception that bounds it. The conditional-on-the-value framing of the interpolation failure is the load-bearing insight and is correct. No claim here is conformance-testable and none is overstated."
    },
    "techniques/gender-and-aspect.md": {
      "disposition": "keep",
      "reason": "RU-ASPECT, RU-GENDER, RU-PARTICIPLE and RU-NUMERAL-GENDER are internally consistent and each is bounded by an exception the sibling application supports. RU-NUMERAL-GENDER's 'two positions only, teens excluded' and 'agreement is with the immediately governed noun' are the parts a formatter gets wrong, and they are stated correctly."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "clarify",
      "reason": "The `other | fractions` row is orphaned below the last-two-digits paragraph, outside the four-category table, so it renders as a separate stray table and falls after an 'Exception: none, the rules are total over the integers' sentence that governs only the other three. Content re-verified correct against CLDR release-48-2 today; the defect is placement."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "RU-VYCAP scopes the politeness capital to 'personal correspondence addressed to one identified individual'. The orthographic authorities also admit it in questionnaires and official forms addressed to a single unnamed respondent. The rule's verdict for UI (lowercase, no exception) stands; its statement of the authority does not. Everything else in RU-VY and RU-VERBFORM holds."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "The three-bucket policy, the corpus test that separates buckets 1 and 2, RU-LATIN's do-not-translate class and RU-COMPOUND's hyphen pattern are all stated as per-term recorded rulings rather than as policy slogans, which is the correct shape for a moving frontier. The error-asymmetry note (over-native reads stiff, over-slang reads unprofessional) is the useful default."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "keep",
      "reason": "RU-QUOTES (guillemets, nested lowered quotes), RU-DASH (spaced em dash, hyphen in-word, en dash effectively unused, ranges on the em dash without spaces), RU-ELLIPSIS, RU-YO's disambiguation clause and RU-NBSP's scoped application all match Russian editorial standard as I know it, and each is hedged where the standard genuinely underdetermines. The RU-NBSP note that this is weaker than the French rule is the right calibration."
    },
    "applications/process--plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "A dated field record of a two-slot runtime verified from call sites rather than key suffixes, with the escalate-don't-patch ruling. Its transferable lesson (trust call sites over key shape) is the part that generalizes and it is stated as such. Not re-verified against the Personas tree; the verified_on date stands unchanged."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Two collapse incidents and a termbase-overrules-shipped-text case, each with the reasoning recorded beside the ruling. The persona-is-a-naturalized-loanword boundary case is the honest application of the corpus test against etymology. Not recounted against the tree; the verified_on date stands unchanged."
    },
    "applications/spec--gender-and-aspect.md": {
      "disposition": "reverify",
      "reason": "The two upstream CLDR defects it reports as current and unfiled - nominative forms at 20 and 30 in %spellout-cardinal-masculine-prepositional, and a U+0065 homoglyph in two digits-ordinal rulesets - were not re-read at 48.2 or on main this run, and the document's own class note says everything marked executed is a reimplementation with no publisher fixture. The reasoning (same guard, opposite verdict; gender is a units-digit phenomenon) is sound and I am not disputing it; the evidence is unresolved."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Re-verified today against the pinned source: the four ru rules and their v = 0 guards, other's decimal-only sample set, and the 16-row identity-on-end range table all read back exactly as published. The three transferable lessons - probe other with a decimal, fixed-decimal formatting collapses the category system, read the end value for ranges - are each supported by the data I read."
    }
  }
}
```

