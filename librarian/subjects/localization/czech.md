---
subject: czech
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# czech

First touch. External-reconcile wave 2, class B. Second source for a technique that
already had a `process` application.

**Pin.** `unicode-org/cldr@release-48-2` (supplemental files byte-identical to
`release-48`, so no finding depends on the maintenance tag) + UTS #35 Part 3.
File: `spec--plural-and-count-agreement.md`. **Fate: `many` confirmed, ranges refuted.**

## Sightings

- **`many` is the visible-fraction category — and the technique's prose already says so.**
  The rule is `v != 0`. The residue is that the technique's **summary table** contradicts
  its own prose four lines later, with a `When` cell reading "any non-integer" — a
  value-based claim the rule does not make. `many` is not "non-integer", it is
  *rendered with at least one fraction digit*: `1000000,0` is `many`, `1000000` is
  `other`, and `other` carries **no `@decimal` samples at all**.
- **The control that proves it is the plausible one.** Reading `many` as a large-quantity
  category fails 42 of 47 — an obvious miss. Reading it as "any non-integer" fails on
  exactly the **eight integer-valued decimals** (0.0, 1.0, 10.0 … 1000000.0), which is
  the demonstration. A Czech `many` string must read beside *1,0* as well as *1,5*, which
  rules out any wording presuming a fraction.
- **Branch reachability is set by formatter precision, not by data.** With
  `minimumFractionDigits: 2`, **9 of 9** probe counts select `many` and `one`/`few`
  become unreachable. A currency or measure surface needs `many` even when every
  underlying count is a whole number.
- **Compact notation splits one quantity across two categories.** `cs.xml` long compact
  carries all four forms for 1000000; the reference implementation renders 1500000 as
  *1,5 milionu* (the `many` pattern) while `select()` returns `other`. A Czech string
  pairing a compact number with its own plural block disagrees with the number beside it.
- **Ranges: refuted.** The `cs pl sk` group has 14 rows and **0 overrides** — every
  result equals its end. **Verified by the director.** Not a file-wide artifact: 11 of
  22 groups in the same document *do* carry overrides. The value of the cs table is that
  end-only was *verified*, not assumed.
- Ordinals: single-category `other`, confirmed. Caveat added — invariance is in the
  category set, so the `selectordinal` construct still exists and deleting it is a
  skeleton break.

**2026-08-29 (cycle) - LANDED.** The summary table's `many` row now reads "rendered
with a fraction digit" instead of "any non-integer", with the reachability consequence
(fixed-decimal formatting makes `many` the only live branch) and the compact-notation
split. New rule `CS-RANGE` carries the range mechanism, with Czech as the verified
end-decides case. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. The summary table's `many` row: "any non-integer" → "rendered with a visible fraction
   digit (`v != 0`)". The prose is right; the table is not.
2. "`many` when non-integers are possible" → "`many` whenever the formatter can emit a
   fraction digit".
3. A ranges sentence — for `cs` the rule is "the end value's branch", **verified**.

## Cross-subject proposals

- **The range family, sighting 2** — and the one that corrected its framing. From
  [[arabic]] alone the claim would have been "range tables override the default"; `cs`
  disproves that. The transferable rule is the mechanism: a written row may **confirm or
  override**, so counting rows tells you nothing.
- **"Plural category is a property of the rendered representation, not the quantity"** —
  pairs with [[russian]] (`v = 0` guards) and [[french]]/[[spanish]] (compact notation).

## Could not verify

The technique's Czech **grammar** claim (`many` takes the genitive singular, *1,5 dne*)
is outside the CLDR pin and was deliberately left untouched rather than restated as
spec-backed. The apparent tension between §Operands (compact `1.2c6` has `v=0` after the
c-shift) and §Compact Number Formats (pattern `count` chosen from N′) is described as two
different selections, which is what the reference implementation does; no spec sentence
reconciling them was found, and no spec defect is claimed.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/czech",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:dece50b935d6004f",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "je nastaven and nastaví se do not describe the same tense or event.",
    "ve městě {city} with city=Praha does not automatically supply standard locative Praze.",
    "2 nových zpráv remains wrong just because the message system offers only one/other."
  ],
  "sources": [
    {
      "path": "knowledge/localization/european/czech",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://prirucka.ujc.cas.cz/?id=165",
      "scope": "Primary Czech Language Institute guidance explicitly recognizes both short and long dashes."
    }
  ],
  "documents": {
    "czech.md": {
      "disposition": "reverify",
      "reason": "Czech inflection matters but rendering, embedded RTL and font coverage still need QA. Register, anti-bookish and no-em-dash claims overgeneralize a product guide. many depends on visible fractional representation, not noninteger value. Gender-neutral strategies and noun-case agreement need context; fixed expansion and no-abbreviation claims are unsupported universals."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "clarify",
      "reason": "Repaired categorical passive/genitive limits and rewrites changing tense, agency, causation or source meaning. Short passive is standard Czech; grammatical style candidates are not automatically major defects."
    },
    "techniques/gender-neutral-forms.md": {
      "disposition": "clarify",
      "reason": "Repaired head noun as automatic case fix, tense-changing neutralization and binary slash as universal neutral standard. Grammatical gender is not identical to personal identity; preserve aspect/time and support an appropriate unknown path."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired knowingly wrong two-slot fallback, neuter prefix assumed universally invariant and categories substituted for case grammar. Precision options and full phrase scope determine agreement."
    },
    "techniques/register-and-address.md": {
      "disposition": "reverify",
      "reason": "Formal address can be appropriate without being universal; tykani and first-person assistant voice can be deliberate. Explicit pronouns and vase with subject ownership can be contrastive. Regex ti can match demonstrative plural, and greeting comma/nominative name policy needs actual syntactic context. Bookish substitution table cannot be globally mechanical."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Borrowing and per-sense decisions are useful; raw-spelling loans can decline. Pipeline majority/gender needs evidence. Diacritic-folded stems can merge distinct words and should only nominate candidates. Same Czech word can serve disambiguated senses; frequency and reviewer count do not override meaning. Agreement mismatch does not audit clean under grammar."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "Repaired em dash impossibility, comma rules as regex certainty and universal quote deletion. Preserve syntax/literals and distinguish house style from Czech orthographic possibility."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "reverify",
      "reason": "Infinitive controls are a common convention, not every button/tab. Imperfective actions can intentionally set recurring behavior. First-person voice and Probiha are product choices; neuter status does not automatically solve agreement when attached to a noun. Wrapping, abbreviations and expansion budgets need product/render evidence."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Historical kp audit retained, not rerun. Rule IDs aid traceability but do not validate rewrites or justify default major severity. Funnel can be established domain metaphor and noun replacement may change meaning. Counts show frequency, not a language-wide dash ban. Published absolute fleet paths remain cleanup items."
    },
    "applications/process--plural-and-count-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical two-catalog findings retained, not rerun. Passing formatted strings to numeric selector is a concrete contract defect. Two-slot genitive fallback remains wrong at 2-4; neutral label framing is available. Snapshot minimum count is not a durable runtime guarantee. Absolute evidence paths remain cleanup items."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR/ICU probes retained, not rerun. Visible fraction rules are useful but require same selector precision as displayed formatting. Finite grid does not prove all category pairs unattainable; source text still quotes prior technique wording. Compact unit noun category and outer counted noun need not agree because they describe different quantities. CLDR categories do not certify Czech morphology."
    }
  }
}
```

## 2026-09-10 — re-review after the compression revert

Read all eleven owned documents at their restored bytes. Two primary sources were
fetched and read this session: CLDR `release-48-2` `common/supplemental/plurals.xml`
and `ordinals.xml` (raw, from the same tag the subject's spec application pins), and
the Czech Language Institute's Internetová jazyková příručka entry on the pomlčka
(`prirucka.ujc.cas.cz/?id=165`). Nothing was executed — no harness was re-run, no
consuming repo re-inspected.

**Retraction of the 2026-09-10 external-reconcile record below.** That entry reports
four documents as *repaired*. Those repairs were part of the 2026-09-09 compression
pass and were reverted on 2026-09-10; the documents it describes no longer exist, and
its `digest` no longer matches the tree. Several of its findings were also over-reach:
CS-PASS already carries the two exceptions it demands (status chip, elliptical
headline), and CS-FORMAL already carries the scope limits it asks for. Two of its
findings survive verification and are carried forward below (the `many` row, the
em-dash absolutism); one more is small and real (the register sweep token list). The
rest of its per-document `reverify` verdicts are withdrawn as unsupported by the
restored text.

**Finding 1 — the golden path still carries the reading its own spec application
refuted.** `czech.md`'s plural table gives `many` the `When` value *any non-integer*.
`plurals.xml` at the pinned tag gives cs `many` the condition `v != 0` with
`@decimal 0.0~1.5, 10.0, 100.0 … 1000000.0` — a property of the rendered
representation, not of the quantity, so `1000000,0` is `many` and `1000000` is
`other`. The technique was corrected to *rendered with a fraction digit*; the golden
path was not, and the golden path is what a first reader reads. The same table's
`one` and `few` rows say *integer 1* and *integers 2–4* without the `v = 0` operand
that makes them true.

**Finding 2 — CS-DASH is stated as a fact about Czech and is a fact about one vendor
guide.** The rule closes: *what is never legitimate is U+2014 in Czech text*, and the
golden path repeats *the em dash is not a Czech character*. The Internetová jazyková
příručka — which this same technique cites as one of its three authorities — says:
*Vedle krátké pomlčky (–) se v textu někdy používá také pomlčka dlouhá (—)*, and
recommends only that a document hold one form consistently. Microsoft §4.1.11 does
ban it, and a house may. What the language does not do is forbid it. The bundle
already has the right shape for this elsewhere (DE-DASH's recorded-ruling exception,
JA-LATIN-BOUNDARY's house constant); CS-DASH should be stated the same way, with the
frequency-diff detection move kept intact, because that move is about *copied*
punctuation and survives either ruling.

**Finding 3 — a mechanical sweep list with a token that cannot be swept.** The
register technique's drift gate reads *sweep for `tvůj/tvoje/tvi/ti`*. Bare `ti`
matches the dative clitic and the demonstrative (*ti, kteří…*) in perfectly clean
vykání text, and `tvi` is not a Czech form (*tví* is). A substring gate on that list
manufactures findings in a catalog with no register drift at all.

**Verified and left alone.** cs ordinals are a single `other` category
(`ordinals.xml`, 68-locale block) — the technique's caveat that the *category set*,
not the syntax, is invariant is the correct statement and the golden path's *ordinal
selectors are never needed* is the loose one. The `spec--plural-and-count-agreement`
application's cardinal claims re-check exactly against the tag it pins. CS-RANGE's
14-row / 0-override count was not re-fetched this session and is carried on that
application's record.

**Not resolved.** ČSN 01 6910 is cited by the typography technique and is not
publicly readable; the NBSP and date-spacing rules rest on it plus MS §4.1.16. The
Czech morphology claims (genitive singular under `many`, neuter singular verb at 5+)
are outside every pinned source and remain unbacked by anything but standard grammar.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/czech",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:70bd206e21f2b90a",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes. Two primary sources fetched and read this session (CLDR release-48-2 plurals.xml and ordinals.xml; UJC Internetova jazykova prirucka id=165). No software executed: no plural harness re-run, no ICU probe, no consuming-repo working tree re-inspected. The two process applications are historical field records dated 2026-08-24 and were assessed as records, not re-verified against kp or personas.",
  "counterexamples": [
    "A currency surface formatted with minimumFractionDigits 2 selects many for every count, so the one and few branches are dead code - the golden path table's any non-integer reading gives a reader no way to predict that.",
    "A Czech house that follows the Language Institute and uses the long dash consistently is reported defective by CS-DASH as written, with no recorded-ruling escape the rest of the bundle grants everywhere else.",
    "The register drift gate's bare ti token matches the dative clitic and the demonstrative in a catalog with zero tykani, so the gate reports drift where none exists.",
    "The subject is silent on what a plural block does when the counted noun is itself a placeholder, which is the case CS-AGREE's tail rule cannot reach."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established the cs block verbatim: one is i = 1 and v = 0, few is i = 2..4 and v = 0, many is v != 0 with integer-valued decimal samples, other is the empty fallback. Confirms the technique's rendered-with-a-fraction-digit wording and refutes the golden path's any non-integer cell. It does not establish any Czech morphology - CLDR assigns categories, not cases."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that cs sits in the single-rule other block, so the ordinal category set is a singleton. It does not establish that a selectordinal construct may be deleted - that is a format-skeleton question the file says nothing about."
    },
    {
      "url": "https://prirucka.ujc.cas.cz/?id=165",
      "result": "Established that the Czech Language Institute recognises a long dash alongside the short one and asks only for consistency within a document. It does not establish that the long dash is preferred, nor does it overturn a product's own house ban - it removes the claim that the character is not Czech."
    }
  ],
  "documents": {
    "czech.md": {
      "disposition": "clarify",
      "reason": "The plural table's many row still reads any non-integer, the reading this subject's own spec application refuted and the technique corrected; the one and few rows omit the v = 0 operand. The em dash sentence asserts as a fact about Czech what the Language Institute contradicts. Ordinal selectors are never needed overstates the technique's own caveat."
    },
    "techniques/plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Cardinal categories and the visible-fraction framing re-verified verbatim against CLDR release-48-2. CS-RANGE, CS-NUM, CS-AGREE, the escape hatch and the two-slot workarounds are internally consistent and bounded. The 14-row cs range count is carried from the spec application, not re-fetched."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "CS-DASH's closing absolute - never legitimate in Czech text - is contradicted by the Language Institute guidance the same technique cites. Restate it as a house constant with the vendor guide as the default, keeping the cross-locale dash-count detection move, which is about copied punctuation and holds under either ruling. CSN 01 6910 remains unreadable."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "The mechanical drift gate lists bare ti, which matches the dative clitic and the demonstrative in clean vykani text, and tvi, which is not a Czech form. Everything else - the two axes, the bookish table with its three scope limits, the svuj rule, the greeting-frame fallback - is sound and bounded."
    },
    "techniques/gender-neutral-forms.md": {
      "disposition": "keep",
      "reason": "Preference order, the head-noun move covering both gender and case government, the plural-generic-masculine boundary, and CS-GENDER-2P are each stated with their limits. No claim here rests on an unverified source."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "Three tiers per sense, the loanword-gender pin, one-concept and its inverse, and the count-before-enforcing discipline are all decision machinery rather than testable assertions. The false-friend list is checkable and correct as read."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Every rule carries trigger, rule, source and - where over-application was found - an exception. CS-PASS already excludes status chips and elliptical headlines, so the earlier claim that it bans standard Czech short passives does not hold against the restored text."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "keep",
      "reason": "The surface table, the CS-PROG three-way split with its recorded collision, the chip convention and the no-abbreviation rule are conventions stated as conventions. The +10-20% figure is a budget heuristic, presented as one."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "A correctly dated 2026-08-24 field record of one repo's loop, whose value is the mechanism - anchorless findings mint rules, house overrules are recorded as rejected rows. Not re-verified against kp this session. Absolute machine paths remain a cosmetic cleanup item, not a correctness one."
    },
    "applications/process--plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Two catalogs exercising opposite tooling; the NaN format-contract incident and the two-slot workarounds are the transplantable content and are consistent with the technique. Historical, not re-run."
    },
    "applications/spec--plural-and-count-agreement.md": {
      "disposition": "keep",
      "reason": "Its cardinal and ordinal claims re-check exactly against the tag it pins, fetched this session. Its controls, reachability probe and compact-notation split are declared as executed evidence with their harness named; none of that was re-executed and none of it needs to be for the categories to hold."
    }
  }
}
```
