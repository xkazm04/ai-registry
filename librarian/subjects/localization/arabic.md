---
subject: arabic
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# arabic

First touch. External-reconcile wave 1, class B.

**Pin.** `unicode-org/cldr@48.2` (released 2026-03-17) + UTS #35 Part 3: Numbers.
File: `spec--plural-and-count-agreement.md`. **Fate: confirmed**, three sharpenings.

## Sightings

- **AR-PLURAL-SIX matches CLDR condition for condition** — six categories, same
  `n % 100` modulus, no residue. 112 cardinal samples + 21 ordinal, 0 disagreements;
  a 0..10000 sweep partitions with 0 double matches.
- **A fractional count is never `few` or `many`.** UTS #35 range semantics enumerate
  integers — the spec's own worked table gives `3.5 = 2..4, 15` → false — so anything
  with a decimal part lands in `other`. 18,000 fractional values tested, 0 exceptions.
  A hand-rolled selector using float modulo routes 3.5 to the plural-noun branch.
  **This is the one that bites**, wherever counts can be ratings, averages or prices.
- **Ordinals are a singleton for `ar`** — a 68-locale block whose only category is
  `other`. A six-branch `selectordinal` is dead code in five branches; 9,703 of the
  first 10,001 integers route to a category the ordinal rule never selects.
- **Plural ranges: the technique is silent** — 23 published rows, five of them
  overriding the spec's end-category default. `one + two → other`: a 1–2 range does
  **not** take the dual. A gap, not a defect.
- Sublocales cannot differ — CLDR keys plural rules on the language subtag, and all 28
  `ar_*` locales inherit. `ars` shares cardinals but carries no range row of its own.

**2026-08-29 — NOTHING LANDED, deliberately.** All four candidates are single
sightings and none is a measured disproof: the technique's sentences are incomplete,
not false. The integrality trap is the one worth landing first when a second plural
subject sights it. Banked, not forgotten.

**2026-08-29 (cycle 2) - LANDED.** Two new anchored rules. `AR-PLURAL-INTEGER`
carries the integrality finding (a fractional count is never few or many), now a
three-sighting family with [[russian]] and [[czech]]. `AR-PLURAL-RANGE` carries the
range mechanism at five sightings, including the caution that a table's presence and
size say nothing - Arabic is the override-heavy case, and three siblings are not.
The 2026-08-29 NOTHING-LANDED note below was correct when written, at one sighting.

## Technique-edit candidates (banked for the cycle)

1. AR-PLURAL-SIX: add the integrality clause.
2. AR-PLURAL-SIX / AR-COUNT-NOUN: scope the six-category claim to **cardinals**; state
   that ordinal agreement has to be carried lexically because the format cannot select it.
3. A range rule (AR-PLURAL-RANGE) or a paragraph — ranges select from a separate table.
4. AR-PLURAL-FREEZE now has numbers: a one/other runtime mis-serves 9,702 of the first
   10,001 integers, and the singular is the right single bet at 9,199.

## Cross-subject proposals

- **Range selection is a separate table from category selection** — 1 sighting. Cheap
  second sightings at `russian`, `czech`, `french`, `spanish`. Two makes it a technique
  edit; four opens a law conversation under `format-skeleton-is-inviolable`.
- The ordinal-singleton block covers `cs de es ja ko ru zh` — "your locale probably has
  exactly one ordinal category" is a bundle-wide fact, not an Arabic one.

## Not confirmed by the counterpart

The morphology claims — that `two` is the dual, `few` takes the plural noun and `many`
the singular. CLDR assigns categories and says nothing about word forms. The application
states this rather than implying the standard confirmed it.

## Upstream, unreported

CLDR 48.2's own `hashes/SHASUM512.txt` lists a digest for `cldr-common-48.2.zip` that
does not match the served file — it is the digest of the byte-identical `core.zip`.
Anyone verifying the documented download by its documented checksum fails. One inference
short of airtight; a 33 MB jar fetch would close it.

## 2026-08-29 - wave 3 (numbering systems)

**Pin.** `unicode-org/cldr@release-48-2`, all 29 `ar`-family locale files plus root and
the numbering-system data. File: `spec--script-and-typography.md`.
**Fate: reconnaissance confirmed on all four structural points; the technique refuted.**

**The counted split, verified independently by the director:** 21 of 29 files declare
`arab`; **zero declare `latn`**; 7 carry the inheritance marker (`ar`, `ar_AE`, `ar_DZ`,
`ar_EH`, `ar_LY`, `ar_MA`, `ar_TN`); `ar_001` declares nothing. Resolved: 21 arab, 8 latn.

Both of AR-NUMERALS' named regional claims are backwards:

- it says "including the Gulf" - but **`ar_AE` resolves to `latn`**;
- it says "the Maghreb locales on Western digits" - but **`ar_MR` declares `arab`**;
- and "default" is the wrong frame entirely: base `ar` carries the inheritance marker and
  resolves to Western digits from root, with `arab` declared as its *native* system. The
  practical harm is direct - a product shipping plain `ar`, which is the tag products
  actually ship, gets Western digits.

**Two more refutations.** The guillemet rule: CLDR's `ar` delimiters are the reversed
curly quotes, and **zero of 29 files carry guillemets** in any delimiter element - so that
is a house typographic choice, not a data-backed rule. And the tatweel denylist: U+0640 is
in `ar`'s auxiliary exemplar set and lives in real values (the Hijri era abbreviation, the
article before a placeholder) - **the technique file's own prose contains one, so its own
audit rule fires on it.** All three verified by the director.

**Upstream bug candidate - the counterpart violates the technique's own rule.** CLDR's
litre-per-100-km unit patterns hardcode the Arabic-Indic hundred while their placeholder
renders in the *resolved* system, so plain `ar` produces a string carrying two digit
systems at once. Authored when `ar` meant Arabic-Indic and never revisited.

**Evidence class:** B3, property data - no test file covers numbering-system resolution or
locale inheritance. The document says so; the resolver was hand-built and cross-checked
against the publisher's own generated corpus (28/28 agree), with a degenerate control that
fails loudly when the inheritance marker is read as a literal.

**Cross-subject:** third sighting of declare-versus-inherit (`bn` declares, `fa` declares,
`ar` inherits). The general hazard deserves a line in the bundle's shared method: **any
subject quoting a CLDR per-locale "default" can misread the inheritance marker as a value.**

**2026-08-29 (cycle 3) - LANDED.** AR-NUMERALS' first bullet replaced with the
declare-versus-inherit statement and the counted split, including that base `ar`
resolves to Western digits and that the Gulf/Maghreb shorthand fails in both
directions. AR-PUNCT's guillemet line demoted to a recorded house choice with the
standard's actual delimiters named. AR-NO-KASHIDA's audit note rewritten by function
rather than by code point, with the observation that the old rule fires on this
technique's own prose. The extended-digit scoping note landed with it.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/arabic",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:58528af0594c0b5e",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "العناصر: {count} remains a grammatical neutral count frame without six agreeing noun forms.",
    "A short Latin label followed by a number can require isolation despite its length.",
    "An inherited defaultNumberingSystem is still a default, not evidence that CLDR has no default."
  ],
  "sources": [
    {
      "path": "knowledge/localization/right-to-left/arabic",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.w3.org/International/articles/inline-bidi-markup/",
      "scope": "Primary inline direction/isolation guidance including short phrases and unknown runtime direction."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/main/ar.xml",
      "scope": "Pinned numbering-system and percent-symbol fields inspected; no full locale census rerun."
    }
  ],
  "documents": {
    "arabic.md": {
      "disposition": "reverify",
      "reason": "MSA is a useful broad-market default, not the only legitimate Arabic product register. RTL rendering is not the only locale needing visual QA. Six categories concern cardinals, not ordinals, and neutral count frames can be grammatical without six strings. Length estimates, universal article/button rules and numeral regional shorthand require product evidence."
    },
    "techniques/bidirectional-text-and-interpolation.md": {
      "disposition": "clarify",
      "reason": "Repaired isolation based on string length, punctuation always on the left and categorical absence of concatenation remedies. Preserve logical text and placeholder syntax, use structural direction and inspect controls; short values can still need isolation."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "SVO and VSO are both legitimate Arabic and information structure matters. Recasting the warning adds a leaving condition absent from the source. Idafa definiteness can come from proper nouns or pronominal suffixes, not only final article. Removing can from an ability statement may change meaning; prescribed passive and politeness choices need product context."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired one/other intrinsically ungrammatical, least-wrong singular recommendation and cardinal categories treated as complete morphology. Neutral frames are legitimate; decimal, ordinal and range selection follow the actual formatter."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "Repaired MSA and masculine address as universal mandates and UI article rule as mechanically decisive. Define audience and product register, allow deliberate localized address strategies and distinguish style drift from context-sensitive grammar."
    },
    "techniques/script-and-typography.md": {
      "disposition": "clarify",
      "reason": "Repaired default-denial terminology, blanket control removal and digit-only percent rules. Pinned CLDR defaultNumberingSystem exists explicitly; inheritance is how a default resolves. Runtime version, region and options matter, and exemplar inventory is not a prose whitelist."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Native terminology preference can be sensible but transliteration is not proof of MT. Approved brands may have Arabic forms and correct English plurals in quoted identifiers are not fake Arabic morphology. Termbase senses and inflection matter; catalog frequency is evidence of convention, not proof of correctness."
    },
    "applications/process--bidirectional-text-and-interpolation.md": {
      "disposition": "reverify",
      "reason": "Historical Personas bidi guide retained, not rerun or rendered. Published machine-specific checkout path violates repository guidance and needs source-context migration without inventing a location. Placeholder mismatch is concrete; ASCII-only matching is not a universal engine requirement. No-ZWNJ and short-placeholder assumptions are overbroad."
    },
    "applications/process--register-and-address.md": {
      "disposition": "reverify",
      "reason": "Historical Personas register counts retained, not recounted. Product choice does not prove universal software convention; one-word/length targets need rendering. Persona and agent distinction follows this termbase and context. Published absolute checkout root remains a migration item."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "reverify",
      "reason": "Pinned CLDR harness retained, not rerun. Category selection does not prove morphology or that singular is least harmful over real traffic; uniform 0..10000 is not a usage distribution. Cardinal/ordinal/range separation is useful; kok_Latn is script-qualified, not region-qualified. Release latestness, archive mismatch and full sublocale census remain historical."
    },
    "applications/spec--script-and-typography.md": {
      "disposition": "reverify",
      "reason": "Pinned CLDR findings retained, no harness rerun. Primary ar XML confirms inherited default and native arab plus directional marks in percent symbols. This contradicts saying CLDR has no default. Inventories do not forbid every unlisted character; mixed numeral contexts can be intentional and ZWNJ must not be removed solely by locale. Full 29-file census, hashes and runtime rendering not refreshed."
    }
  }
}
```

## 2026-09-10 — re-review after the compression revert

Read all eleven owned documents at their restored bytes. Two primary artifacts were
fetched and read this session: CLDR `release-48-2`
`common/supplemental/plurals.xml` and `common/supplemental/pluralRanges.xml`, the same
tag the subject's two spec applications pin. Nothing was executed — the 112-sample
harness, the 29-file resolver and the rendering probe recorded in those applications
were not re-run.

**Retraction of the 2026-09-10 external-reconcile record below.** It describes
documents the compression pass rewrote and the 2026-09-10 revert removed; its digest
no longer matches the tree. Its per-document `reverify` verdicts are withdrawn. One of
its lines is also wrong on the merits and worth naming: it says the `ar` XML
*contradicts saying CLDR has no default*. The technique does not say CLDR has no
default — it says CLDR expresses no per-locale *default numbering system* as a value
for `ar`, which carries the inheritance marker `↑↑↑` and resolves through root to
`latn`. That is the finding the spec application established, and it stands.

**Finding 1 — the golden path still carries the sentence its own spec application
refuted.** `arabic.md` reads: *CLDR defaults most `ar` locales to Arabic-Indic digits
with the Maghreb on Western*. `spec--script-and-typography` opens by declaring
**AR-NUMERALS refuted as written** and gives the counted resolution: 21 of 29 files
declare `arab`, zero declare `latn`, seven carry the marker, and base `ar` is one of
the seven — so the tag products actually ship resolves to Western digits from the
standard. The named regional shorthand fails in both directions (`ar_AE` resolves
`latn`; `ar_MR` declares `arab`). The technique was rewritten to say all of this; the
golden path was not, so the two halves of the subject now give a product opposite
instructions on the one genuinely per-market decision the subject names.

**Finding 2 — the plural claims re-verify exactly, including the counterintuitive
one.** `plurals.xml` gives `locales="ar ars"` six rules with the conditions
AR-PLURAL-SIX prints. `pluralRanges.xml` gives `locales="ar"` twenty-three rows, and
exactly five of them differ from their end category: `zero+one → zero`,
`zero+two → zero`, `one+two → other`, `other+one → other`, `other+two → other`. The
technique's headline row is right, and — worth stating because it is the kind of
thing a re-reader gets wrong — `many + few → few` is *not* one of the five: its result
equals its end. The spec application describes it correctly as the modulus reappearing
rather than as an override, and the technique's *five of them override* count is
exact. The claim I could **not** confirm is *the largest published (23 rows)*; that is
a comparison across the whole file and I did not count the other groups.

**Finding 3 — a small gap the technique itself names and does not close.** The spec
application records that `ars` shares `ar`'s cardinal block but has no `pluralRanges`
row, so range selection for Najdi falls back to the spec default rather than to the
verified table. AR-PLURAL-RANGE presents the table as *Arabic's*, without that
boundary.

**Verified and left alone.** AR-NO-KASHIDA now states the tatweel rule by function
with the era-abbreviation and definite-article-before-placeholder exceptions, which is
the correct shape. AR-PUNCT's quotation paragraph correctly refuses to cite the
standard for guillemets. The bidi technique makes no claim a data file could settle;
its content is the isolate/mark decision rule and the rendered-pass checklist, both of
which are craft stated as craft.

**Not resolved.** UAX #9 was not fetched, so the isolate-versus-mark behaviour claims
rest on the technique's own reading. Neither Microsoft's nor Mozilla's Arabic style
guide was retrieved; AR-MSA and AR-IMPER cite them jointly, and the claim that both
open with the MSA rule is unchecked this session.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/arabic",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:0e23cd9477709d99",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes. Two primary CLDR files fetched and read this session at the tag the subject pins. No software executed: the plural harness, the 29-file numbering-system resolver, the cldr-json oracle cross-check and the unit-pattern rendering probe recorded in the spec applications were not re-run, and no Arabic renderer was driven. The two process applications are 2026-08-24 field records of one repo and were assessed as records. UAX #9 and the vendor style guides were not retrieved.",
  "counterexamples": [
    "A product shipping the plain ar tag and following the golden path pins Arabic-Indic digits, while the same subject's technique and spec application show CLDR resolving that exact tag to Western digits - the subject contradicts itself on its own headline per-market decision.",
    "AR-PLURAL-RANGE's verified table is keyed to ar; ars shares the cardinal rules and has no range row at all, so a Najdi surface gets the spec default and the rule never says so.",
    "The plural-range domain presumes start strictly less than end and no negatives; a UI rendering a countdown span or a negative delta is outside every rule the subject states.",
    "AR-BIDI-ISOLATE decides by whether a value can carry internal mixed direction, which the catalog author cannot know for a placeholder fed by a third-party API - the decision rule has no answer for an unknown-provenance value that is usually a single token."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established the ar block verbatim - six rules, conditions n = 0, n = 1, n = 2, n % 100 = 3..10, n % 100 = 11..99, and the empty fallback - matching AR-PLURAL-SIX condition for condition. It establishes nothing about Arabic morphology: that two is the dual and that few takes the plural noun while many takes the singular are grammar claims the file cannot carry, as the spec application already says."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established the ar table at 23 rows and confirmed that exactly five differ from the end-value default, including one + two resolving to other. It also establishes that many + few equals its end and is therefore not an override. It did not establish that this is the largest published table - that comparison was not made."
    }
  ],
  "documents": {
    "arabic.md": {
      "disposition": "clarify",
      "reason": "Retains the numeral sentence the subject's own spec application declares refuted - CLDR defaults most ar locales to Arabic-Indic with the Maghreb on Western - after the technique was rewritten to the counted declare-versus-inherit finding. A reader who starts at the golden path, as intended, gets the disproved answer."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Six categories and the five range overrides re-verified verbatim against the pinned CLDR files. The integer-only sharpening, the freeze escalation with ranked mitigations, and the reverse-polarity note are correct and bounded. Only the largest published aside is unverified, and nothing rests on it."
    },
    "techniques/script-and-typography.md": {
      "disposition": "keep",
      "reason": "Carries the corrected AR-NUMERALS with the declare-versus-inherit mechanism and the cite-the-locale-not-the-region rule, the refusal to cite the standard for guillemets, and the tatweel rule restated by function with its enumerated exceptions. This is the document the reconcile wave fixed and it holds."
    },
    "techniques/bidirectional-text-and-interpolation.md": {
      "disposition": "keep",
      "reason": "The isolate-versus-mark decision rule, the never-pre-mirror rule, the concatenation escalation and the rendered-pass checklist are craft stated as craft, each with the over-application it was calibrated against. UAX 9 was not re-read, but no claim here turns on a clause the annex would settle differently."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "Diglossia, the masdar-on-controls corollary with the definite-article signal, the impersonal status frames, and three ranked gender-neutrality postures with the paired form ruled out for UI. The vendor-guide citation behind AR-MSA was not retrieved this session."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "VSO stated with its own anti-rule - the technique is never keep English order out of caution, not always verb-first - plus the idafa constraints and three ranked agentless devices with the over-extension of tam named. Nothing asserted here is source-testable and nothing is overstated."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Three paths decided per term, the never-mint-a-transliteration sub-rule, frozen-identifier behaviour, and the compound split with its two failure modes. The Arabized bucket is correctly gated on settled usage rather than on purism."
    },
    "applications/process--bidirectional-text-and-interpolation.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 field record of one 14-locale catalog; the mirror incident, the restraint around the mark, and the placeholder-rename skeleton break are the transplantable content. Not re-verified against the repo."
    },
    "applications/process--register-and-address.md": {
      "disposition": "keep",
      "reason": "Records that the register and masdar rules were read out of a counted corpus rather than imposed, and the persona-versus-agent one-concept drift. Historical, dated, not re-run."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Its category conditions and its five-override range table re-check exactly against the pinned files fetched this session. Its census numbers, the 112-sample conformance run and the ordinal dead-branch count are declared executed evidence with the harness named; none was re-executed and the standing claims do not depend on that."
    },
    "applications/spec--script-and-typography.md": {
      "disposition": "keep",
      "reason": "The document that refuted AR-NUMERALS as written and supplied the corrected mechanism, with its resolver, oracle cross-check and degenerate control declared. It is also the record that makes the golden path's surviving sentence a finding rather than a matter of taste. Not re-executed."
    }
  }
}
```
