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
