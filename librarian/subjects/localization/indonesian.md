---
subject: indonesian
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# indonesian

First touch. External-reconcile wave 1, class B.

**Pin.** `unicode-org/cldr@release-48-2` + UTS #35 Part 9 (MessageFormat) + ICU4J 78.3.
File: `spec--quantity-and-plurality.md`.
**Fate: confirmed on the data, refuted on the consequence.**

## Sightings

- `id` is genuinely single-category `other`, **cardinals and ordinals both** (43 + 21
  samples). Corpus-wide harness: 3,863 samples over 65 rulesets, 0 mismatches, with a
  constant-`other` negative control failing 1,794 of the same set.
- **The mandatory branch is `*`, not `other`.** UTS #35 Part 9 requires at least one
  variant whose keys are all the catch-all `*`; `other` is an ordinary literal key. So
  the technique's "exactly one branch, `other`" is a message that will not build —
  ICU4J rejects it at construction. The older `{count, plural, …}` generation inverts
  the vocabulary, and the technique states only that older spelling as if it were the rule.
- **"Skeleton defect at worst" is not defensible.** None of the four data-model errors
  covers an unreachable key; a stray `one` in an `id` message is inert. Read against
  [[format-skeleton-is-inviolable]], *keeping* it is the conservative move — dropping a
  branch the source carried is what changes the syntax-keyword set. Dead weight, not a defect.
- **The ordinal caveat is necessary, not vacuous** — which is the opposite of what the
  dispatch expected. Lao sits in the **same** 35-locale cardinal ruleset as `id` and
  carries `one`/`other` ordinals. Cohort membership predicts nothing.
- Exact keys (`=1`) outrank rule keywords and survive a one-category locale: one plural
  category does not mean one wording, a mechanism the technique conflates with the
  `one` category.
- Legacy `in`/`id`: CLDR aliases it, but on a JDK with `useOldISOCodes=true`,
  `new Locale("id").getLanguage()` returns `in`, and a resource path built from it misses
  an `id/` catalog. Measured both ways.

**2026-08-29 — LANDED (measured disproof).** The catch-all correction (`*` vs
`other`, generation-specific) and the removal of "skeleton defect at worst" landed in
`techniques/quantity-and-plurality.md` and in the golden path's plurality paragraph.
The exact-key escape hatch and the Lao ordinal counter-example landed with them.
Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. ID-CLDR-OTHER: make the branch sentence generation-aware — the target carries exactly
   one *catch-all* branch, spelled `*` in the current standard and `other` in the older one.
2. Drop "skeleton defect at worst"; recommend removal on translation-cost grounds only,
   and note that dropping a source branch is the move a skeleton comparator can flag.
   **The same sentence appears in the golden path** and needs the same fix.
3. Add the exact-key escape hatch.
4. Keep the ordinal parenthetical but strengthen it, with Lao as the in-cohort
   counter-example.

## Cross-subject proposals

- **The catch-all is mandatory and its spelling is generation-specific** — 1 sighting,
  and locale-independent. Applies to every plural-carrying subject in the bundle
  (`arabic`, `czech`, `russian`, `french`, `spanish`, `hindi`, `japanese`, `korean`,
  `vietnamese`, `bengali`, `chinese`). A second worker hitting it makes it a technique
  edit at two; a possible law candidate under `format-skeleton-is-inviolable`.

## Could not verify

Whether any shipping i18n runtime *lints* an unreachable variant key. ICU does not, and
a third-party linter is class-A evidence about that linter, not class-B about the standard.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/indonesian",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:61dd8525de73a4d4",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "EYD explicitly capitalizes words in book and article titles, with function-word exceptions.",
    "Dua kupu-kupu counts a lexical reduplicated noun; a blanket quantity-plus-repetition grep misfires.",
    "Di- marks voice, not completion; a passive can describe an ongoing action."
  ],
  "sources": [
    {
      "path": "knowledge/localization/south-and-southeast-asian/indonesian",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-kapital/",
      "scope": "Primary EYD title-capitalization rule."
    },
    {
      "url": "https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-vokal/",
      "scope": "Primary EYD allows optional e-pepet diacritic."
    }
  ],
  "documents": {
    "indonesian.md": {
      "disposition": "reverify",
      "reason": "Indonesian can be ungrammatical and register extends beyond one pronoun. Title capitalization and optional diacritics exist in EYD. Borrowed verbs are not limited to klik, reduplication is not always plural and LTR can embed RTL. Message format generation must be pinned rather than called current universally."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "clarify",
      "reason": "Repaired passive/active semantic changes, all oleh Anda invalid, three yang automatically defective and embedded location question requires berada. Anchor matches remain candidates."
    },
    "techniques/quantity-and-plurality.md": {
      "disposition": "clarify",
      "reason": "Repaired exactly one branch despite exact selectors, no-false-positive reduplication grep and classifier forbidden in count messages. Separate lexical repetition from redundant plural marking."
    },
    "techniques/register-and-address.md": {
      "disposition": "reverify",
      "reason": "Anda capitalization useful, but register also depends on vocabulary, titles and politeness. Regional pronouns can be written intentionally; kamu possessives need not always cliticize. Kami/kita refers to actual participants, not professional versus consumer audience. Imperative and severity prescriptions require surface context."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "clarify",
      "reason": "Repaired klik sole borrowed verb, dictionary forms never used elsewhere and all raw English is laziness. Keep unit/brand localization exceptions and audience evidence."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired title case does not exist, me-/di- encode progress/completion, no diacritics and bidi, and no-two-verb rule contradicted by its example. Measure actual layout."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Historical Personas term counts retained, not recounted. Zero borrowed verbs contradicts absorbed ekspor/impor usage; a recorded product choice does not establish all market usage. Distinct senses and approved variants justify different labels."
    },
    "applications/process--ui-conventions-and-length.md": {
      "disposition": "reverify",
      "reason": "Historical character ratio and glyph counts retained, not runtime fit or current catalog verification. Simpan and pindah are two verbs despite the no-two-verbs label. Frequency cannot settle grammar; documented corrective minority example shows why."
    },
    "applications/spec--quantity-and-plurality.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR/ICU harness retained, not rerun. MF1 and MF2 coexist, so current versus older is not a migration mandate. The displayed MF2 number-selector unreachable branch result is scoped to that selector and locale; custom selectors and lint policy can differ. Exact-value examples correctly refute exactly one wording."
    }
  }
}
```
## 2026-09-10 — architecture re-review after the compression revert

Read all nine documents at reverted bytes: the golden path, five techniques, two
process applications and the CLDR/MessageFormat spec application. The 2026-09-10
record above graded the subject `reverify` against documents the revert removed, and I
retract that grading. I found no content defect.

Checked against the primary source. `id` sits in the thirty-five-locale single-`other`
cardinal group in `common/supplemental/plurals.xml` and in the sixty-eight-locale
single-`other` ordinal group in `ordinals.xml`, at `release-48-2` and unchanged on
`main`; `pluralRanges.xml` gives it an eleven-locale group with one `other+other` row.
So ID-CLDR-OTHER holds in both cardinals and ordinals and has no pending change on the
CLDR 49 branch. The technique's caveat — check the ordinal file rather than inferring
it from the cardinal cohort, because Lao shares Indonesian's cardinal ruleset and
carries a two-category ordinal rule — is corroborated by what I read: `lo` is absent
from the `other`-only ordinal group that `id` belongs to, so it necessarily has its
own block. I read data; I did not run ICU4J or the application's harness.

The subject's most consequential claim is not about CLDR at all, and I want to record
why I am leaving it as `keep` without an independent check. The spec application finds
that ID-CLDR-OTHER's "exactly one branch, `other`" is invalid under the current
MessageFormat standard, where the mandatory variant is the catch-all `*` and `other` is
an ordinary literal key — and that the stray `one` branch the technique warns about is
inert rather than defective, because no error class covers an unreachable key. Both
halves are sourced to UTS #35 Part 9 plus a build-time exception from ICU4J, and the
technique has already been rewritten to carry them (it now says the catch-all's
spelling depends on which generation the stack speaks, and that dropping a branch is
the move a strict skeleton comparator notices). I did not read Part 9 or run ICU4J
this run. The finding is internally coherent, it inverts the intuition in the direction
that costs the corpus something to say, and the technique's own text was corrected to
match — none of which is verification, and I am saying so rather than letting the CLDR
half stand in for it.

Two smaller things I checked and found right. The technique's exact-value escape hatch
— `=1` outranks rule keywords and works in a one-category locale, so "you have one
item" copy stays available without inventing a grammatical contrast — is consistent
with how rule selection is specified and with the application's measured fixture, and
it is the distinction most likely to be conflated with the `one` category. And the
golden path's orthography note (EYD, currently its fifth edition, successor to the
guideline published as PUEBI) matches what I know of Badan Bahasa's 2022 revision;
I did not fetch the standard.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/indonesian",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:2e67410d0dfee334",
  "disposition": "keep",
  "coverage": "All 9 owned documents read in full at reverted bytes. CLDR plurals.xml, ordinals.xml and pluralRanges.xml read for the id blocks at release-48-2 and main - read, not executed. Not evaluated: UTS #35 Part 9 (MessageFormat) and ICU4J, which carry the spec application's catch-all and inert-branch findings; supplementalMetadata.xml and the JDK locale-code behaviour the same document reports; KBBI and the EYD orthography the terminology and casing rules cite; the Personas tree the two process applications cite; maturity or verified_on refresh.",
  "counterexamples": [
    "ID-NO-REDUP-QUANT bans reduplication after a quantifier, but says nothing about a reduplicated form that is lexicalised rather than plural - 'kata-kata kunci' as a settled term after a count placeholder would be flagged by the rule's own grep with no exception to cite.",
    "ID-VERB-SLOT maps affixes to slots, but a control whose label is a noun in English and an action in the interface ('Export') has to be routed by slot first, and the rule gives no test for deciding which slot a segmented-control item is.",
    "ID-REGISTER audits the pronoun and the clitic, and is silent on the third carrier: a kamu-register product's imperatives are identical to an Anda-register product's, so a catalog that has drifted in every sentence but no pronoun passes the grep the technique prescribes."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/plurals.xml",
      "result": "Established that id (and its deprecated alias in) sits in the single-other cardinal group on the CLDR 49 development branch as well as at 48.2, so ID-CLDR-OTHER's cardinal half has no pending change. It did not establish anything about message-format branch requirements, which are a different standard."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that id and in are in the sixty-eight-locale single-other ordinal group, confirming ID-CLDR-OTHER's ordinal half, and that lo is NOT in that group - which corroborates the technique's Lao counterexample, since Lao shares id's cardinal ruleset and must therefore carry a separate ordinal block. It did not establish lo's ordinal categories directly."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that id sits in an eleven-locale group with a single other+other -> other row, so ranges add no branch for Indonesian. It did not establish anything the techniques claim, since neither mentions ranges - which is defensible for a one-category locale."
    }
  ],
  "documents": {
    "indonesian.md": {
      "disposition": "keep",
      "reason": "Names the locale's real failure mode in its first paragraph - because the grammar refuses so little, a bad translation is never ungrammatical, merely foreign - and every later section follows from it. The register-is-one-pronoun observation, the affix-per-slot craft surface, the numeral-blocks-reduplication rule, the passive trap running in both directions, and the three loanword routes are each accurate and each pointed at the technique that owns them."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "ID-PASSIVE's decision rule (who the sentence is about wins) resolves a trap that is genuinely bidirectional, and the agent-focus passive note - 'berkas yang Anda pilih', never 'dipilih oleh Anda' - is the form MT reliably fumbles. ID-DIMANA's three ordered repairs, ID-YANG-CHAIN's two-is-review three-is-defect threshold with its explicit do-not-ration clause, and ID-ADALAH's graduation from style to grammar before an adjective predicate are all well bounded."
    },
    "techniques/quantity-and-plurality.md": {
      "disposition": "keep",
      "reason": "Re-verified today: id is single-other for cardinals and ordinals at release-48-2 and on main, and the Lao caveat is corroborated by lo's absence from id's ordinal group. The technique now states the catch-all's spelling as generation-dependent rather than fixed, and correctly says a stray branch is inert while dropping one is what a skeleton comparator flags. ID-NO-REDUP-QUANT's placeholder clause - a {count} is a numeral even though the translator never sees its value - is the rule's highest-yield sentence."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "ID-ANDA's capitalization rule, ID-REGISTER's binds-the-whole-pronoun-family clause (audit the clitics, not just the pronouns), ID-IMP-DROP's insistence that dropping the pronoun IS the formal imperative, and ID-FIRST-PERSON's kami/kita split are each correct and each greppable. The tone-matching failure mode named explicitly - warmth lives in word choice, not in the pronoun - is the right diagnosis of how kamu leaks into an Anda catalog."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Three routes rather than two is the correct decomposition, and ID-KBBI-CURRENT's ordered rules handle the authority-versus-usage split without pretending either side wins automatically. ID-VERB-NATIVE's single systemic exception (klik, fully naturalised, with the explicit instruction not to substitute a purist phrase) is stated as an exception rather than smuggled in, and the drift pairs distinguish wrong-sense from mere split."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "ID-SENTENCE-CASE explains why token-for-token translation produces the error (the model copies the source's capitalization instead of re-deriving the target's), which is what makes the grep worth running. ID-VERB-SLOT's four slots and its careful note that transitive suffixes stay while only me- marks the non-imperative is the detail a purist trim would break. ID-LENGTH gives a distribution rather than an average and says the average is a planning number, not a per-string verdict."
    },
    "applications/process--terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "The deployment split - borrowed for the section name, native penerapan for the act - is the instructive case, because it is one English word legitimately taking two Indonesian renderings on the strength of a written ruling rather than drift. The drift pairs settled by occurrence count, including a three-way split scheduled for consolidation, show the technique's mechanical signal and judgement ruling in the right order. Not re-verified against the tree."
    },
    "applications/process--ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "The ellipsis ruling is the lesson: the majority pattern in the shipped file was declared wrong, and the document draws the right conclusion - a count settles the convention only when the catalog is coherent, and an incoherent one needs an authority-backed ruling. The measured +11% expansion with the predicted asymmetry, and drift named as debt rather than precedent, are both what make the file durable. Not re-verified against the tree."
    },
    "applications/spec--quantity-and-plurality.md": {
      "disposition": "keep",
      "reason": "Its CLDR half was re-verified today - id single-other in cardinals and ordinals, the Lao caveat corroborated, ranges a single row. Its sharper half, that the mandatory variant under the current message-format standard is the catch-all * rather than other and that a stray one branch is inert rather than defective, rests on UTS #35 Part 9 and ICU4J, neither of which I read or ran; the technique has already been corrected to match it. I am not disputing it and I am not claiming to have checked it."
    }
  }
}
```

