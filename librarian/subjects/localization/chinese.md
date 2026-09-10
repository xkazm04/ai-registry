---
subject: chinese
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# chinese

First touch. External-reconcile wave 1, class B.

**Pin.** UAX #11 *East Asian Width* rev 44 + `EastAsianWidth-17.0.0.txt` (Unicode 17.0.0,
2025-07-24). File: `spec--character-width-and-typography.md`.
**Fate: refuted in part, confirmed in part.**

## Sightings

- **Of the 46 distinct characters the technique names, 7 carry `East_Asian_Width=A`, and
  all 7 are glyphs it *prescribes* — not one glyph it bans is unsettled.** The A-class
  prescriptions are ZH-QUOTES' Simplified curly quotes `“”‘’` (4/4), ZH-ELLIPSIS' `…`,
  and ZH-DASH' `—` (plus the rival `―`). §4 ED6 makes an A character's width dependent on
  context and §5 resolves it **narrow** when context is unreliable.
- **The asymmetry nobody states.** ZH-QUOTES presents `“…”` and `「…」` as a neutral
  Simplified/Traditional variant choice. Under the property they are not neutral: the
  corner brackets are **W** (4/4, settled), the curly quotes are **A** (4/4, unsettled).
  **A zh-Hant catalog written to this rule is width-determinate; a zh-Hans one is not** —
  and the technique's own recorded `「保存」` exception buys determinism as an unclaimed
  side effect (`点击「保存」` is 6/6 W, no split).
- Confirmed with n: ZH-FULLWIDTH 16/16, ZH-ENUM 2/2, ZH-HALFWIDTH-NUM 12/12.
- **An EAW-based ZH-PANGU linter misses the boundaries that matter.** Over 8 probe
  strings the W/F-abutting-Na/H detector finds the boundary in 5 and returns empty for
  the 3 where an A glyph sits on it. §4.2 supplies the tailoring the technique lacks:
  ambiguous quotation marks resolve wide when they enclose and are adjacent to a wide
  character, narrow otherwise.
- **Vocabulary is loose but not wrong.** §4.1 makes "fullwidth"/"halfwidth" *relational*
  properties of a compatibility **pair**, not unitary labels: `。` and `、` are W not F,
  ASCII is Na not H, and the true H counterpart of `。` is `｡` U+FF61. Right glyphs,
  loose labels.
- The property is not exotic: 1,271 non-private-use code points carry A (138,739 with
  the PUA planes, which §6.1 defaults to A).
- **Hypothesis declined.** The dispatch suggested a column-count conflation; the worker
  checked, found the technique never claims one, and recorded that instead of
  manufacturing it. §2's terminal-emulator caveat is noted as a *reader's* risk.

**2026-08-29 — LANDED (two-sighting family, with [[japanese]]).** New rule
`ZH-WIDTH-UNDECIDED` carries the Ambiguous-width finding, the zh-Hans/zh-Hant
determinism asymmetry, the ZH-PANGU resolution step and the uncovered `·`. The
relational fullwidth/halfwidth vocabulary landed in the opening. Original record
below stands.

## Technique-edit candidates (banked for the cycle)

1. ZH-QUOTES: the Simplified/Traditional choice also decides width determinism.
2. ZH-ELLIPSIS / ZH-DASH: flag `…` and `——` as A-class; a plain-text length budget
   cannot assume their width.
3. ZH-PANGU: add §4.2's resolution rule as the concrete implementation step.
4. One sentence on the relational vocabulary.
5. Gap: `·` U+00B7 (间隔号) is also A and appears in no rule.

## Cross-subject proposals

- `korean/spacing-and-typography` carries a `use_when` about full-width versus half-width
  punctuation — **and the korean worker independently confirmed the same exposure**. See
  the run note: this is a two-sighting family.
- **Law candidate, held:** *a glyph rule that prescribes a character whose rendered width
  the character does not determine is an incomplete rule.* Generalizes past CJK to
  `arabic/script-and-typography` and `vietnamese/diacritics-and-typography`. Two sightings
  now (zh + ja); four opens the law conversation.
- `East_Asian_Width` is a mechanical, versioned anchor for typography findings, which
  serves [[every-finding-cites-an-anchor]] better than a national standard can.

## Could not verify

The "full-width punctuation carries its own visual spacing" claim and clreq's quarter-em
recommendation: **not conformance-testable** against this standard — §2 says the annex
does not provide rules for font design or line layout. They need the layout-requirements
document as a separate counterpart. GB/T 15834 is paywalled and was not fetched, so the
technique's citation of it stays unreviewed.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/chinese",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:9df55d4ea15867e7",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A Chinese exact-zero message can say 暂无消息 while positive counts use {count} 条消息 despite CLDR having only other.",
    "A Wide punctuation property does not fix its pixel advance across fonts and layout.",
    "Removing 随时 from the pronoun-heavy example drops the source's anytime meaning."
  ],
  "sources": [
    {
      "path": "knowledge/localization/east-asian/chinese",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.unicode.org/reports/tr11/",
      "scope": "Primary scope and definitions distinguish inherent width class from font/layout advance and terminal tailoring."
    }
  ],
  "documents": {
    "chinese.md": {
      "disposition": "reverify",
      "reason": "Chinese grammar is not absent and MT is not nearly guaranteed grammatical. Men plural marking exists in restricted constructions; CLDR other does not prove no number distinctions. Register is broader than pronouns, RTL embeddings can occur, and Hans/Hant are scripts rather than uniquely specified markets. 软件/軟體 is a lexical difference, not just glyph conversion."
    },
    "techniques/character-width-and-typography.md": {
      "disposition": "clarify",
      "reason": "Repaired EAW as pixel determinism, Hant as wholly determinate, ASCII-only currency and spaces as only way to achieve visual spacing. Scope punctuation and quote policy by market and preserve literals."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Relational 的 may change referent; 触发器的条件 need not mean generic trigger condition. Modern 被 is not restricted to unfortunate events. 如果…的话 and repeated pronouns can be idiomatic and meaningful; the sample removes anytime. Half translation may be a defect but no comparative UX measurement supports worse than full fallback."
    },
    "techniques/measure-words-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Repaired no plural morphology and identical variant mandate. CLDR other is selector behavior, while exact-number branches and lexical count phrasing can differ. Classifiers depend on construction and referent."
    },
    "techniques/register-and-address.md": {
      "disposition": "reverify",
      "reason": "Record address policy, but register also includes vocabulary, phrasing and context. B2B does not mandate nin; a pronoun census does not justify replacing quotations or machine-addressed text. Please on controls and pronoun repetition are contextual style findings, not universal grammar errors."
    },
    "techniques/terminology-and-variants.md": {
      "disposition": "reverify",
      "reason": "Regional terminology needs separate review but script tags alone do not encode mainland/Taiwan/Hong Kong markets. Conversion tools can include phrase dictionaries, although they do not replace review. Product names can have approved Chinese forms; native translation and borrowing depend on audience, and distinct senses can share a word when context disambiguates."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired fixed width ratios and character ceilings as language facts, deleting particles before checking meaning and banning emphasis because Han is caseless. Measure fit and preserve action clarity."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Historical Personas incidents retained, not rerun. Placeholder renaming is concrete, but pronoun compression removes anytime and trigger noun recast may change reference. Double ellipsis is standard in some Chinese prose, not automatically residue. Absolute machine-specific path remains a publication cleanup item."
    },
    "applications/process--terminology-and-variants.md": {
      "disposition": "reverify",
      "reason": "Historical product counts retained, not recounted. Majority agent rendering is explicitly wrong by the guide, showing frequency alone cannot establish correctness. Token is used for two senses, contradicting universal one-word-per-concept inverse. Product persona terminology is a house choice; absolute path remains a cleanup item."
    },
    "applications/spec--character-width-and-typography.md": {
      "disposition": "reverify",
      "reason": "Historical UAX harness retained, not rerun. Primary annex confirms font/layout determines actual advance width and EAW needs tailoring. Wide corner brackets do not make an entire Hant catalog width-determinate, and property-based spacing detection ignores script/phrase context. File latest alias, hashes and full classification census not refreshed."
    }
  }
}
```

## 2026-09-10 — re-review after the compression revert

Read all ten owned documents at their restored bytes. Primary sources fetched and read
this session: CLDR `release-48-2` `common/supplemental/plurals.xml` and
`ordinals.xml`, and W3C *Requirements for Chinese Text Layout* (clreq) §2.1.3.
Nothing was executed — the `EastAsianWidth` classification harness recorded in the
spec application was not re-run.

**Retraction of the 2026-09-10 external-reconcile record below.** It describes the
compressed documents, which were reverted; its digest no longer matches. Its
per-document `reverify` verdicts are withdrawn. Its objection that *wide corner
brackets do not make an entire Hant catalog width-determinate* is fair as a matter of
wording, but the technique's claim is scoped to the glyphs this technique prescribes,
and it says so; it is not the overreach the entry implies.

**Finding 1 — one bundle carries two unsourced and mutually inconsistent glyph-width
ratios.** `chinese.md` and ZH-LENGTH both say a Han glyph renders at *roughly
1.5–1.75× the width of a Latin letter*. The Japanese sibling's JA-WIDTH-BUDGET says a
full-width CJK glyph is *roughly twice the width of an average Latin letter*. These
measure the same thing, neither cites anything, and a layout engineer reading both
subjects — which is the normal case in a fleet shipping ja and zh together — gets two
budgets. The honest fix is one sourced statement, or one statement that says the ratio
is font-dependent and gives the range with that caveat, in both places.

**Finding 2 — the golden path keeps the vocabulary the technique's own opening
retracts.** `chinese.md` says *Each Han character is a full-width glyph*. The
technique now opens with the correction: fullwidth and halfwidth are **relational**
properties of a compatibility pair, and 。、 are Wide, not Fullwidth. Minor, but it is
the sentence a reader meets first.

**Finding 3 — ZH-CLASSIFIER prescribes a space whose own justification does not
always hold.** The rule gives `{count} 个连接器` and explains the space as *before the
classifier because the placeholder resolves to a numeral*. Under ZH-PANGU the space
exists to mark a Han/Latin boundary. A `{count}` that resolves to a spelled Chinese
numeral, or to a Chinese-digit-formatted value, has no such boundary and the space is
then wrong by ZH-PANGU's own sub-rules. The rule bakes a Latin-digit assumption into a
space it presents as unconditional.

**Verified and left alone.** `zh` has exactly one cardinal category and one ordinal
category — `plurals.xml` puts it in the 34-locale `other`-only block, `ordinals.xml`
in the 68-locale one — so ZH-PLURAL-OTHER's source line is exact in both halves.
clreq §2.1.3 reads *Use a spacing of no more than one-quarter of the width of a Han
character between Han characters and Western letters or European numerals*, so
ZH-PANGU's *up to a quarter em* is an accurate paraphrase (a Han character is one em).
ZH-WIDTH-UNDECIDED, the relational-vocabulary caution and the `·` gap note are all
present as the reconcile wave left them.

**Not resolved.** GB/T 15834 is cited by three rules (ZH-FULLWIDTH, ZH-QUOTES,
ZH-ELLIPSIS) and was not retrieved; the Simplified curly-quote and six-dot-ellipsis
prescriptions rest on it. clreq's 避头尾 section was reachable only by heading in the
fetch, so the specific prohibited-character lists in ZH-LINEBREAK were not confirmed
against it. The Hans/Hant vocabulary table is uncontroversial but was not checked
against either Microsoft variant guide.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/chinese",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:0c68d2977bb25063",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at restored bytes, and the two width claims cross-read against the Japanese sibling subject. CLDR release-48-2 plurals.xml and ordinals.xml and W3C clreq section 2.1.3 fetched and read this session. No software executed: the EastAsianWidth parser, its 48 rule-character classifications, the nine-string sample and the eight-string spacing probe were not re-run, and no CJK renderer or font was driven. The two process applications are 2026-08-24 field records of one repo and were assessed as records. GB/T 15834, the clreq prohibition-rule lists and both Microsoft variant style guides were not retrieved.",
  "counterexamples": [
    "ZH-CLASSIFIER's prescribed space before the classifier is justified by a Han/Latin boundary that does not exist when the count renders as a spelled or Chinese-digit numeral, so the rule and ZH-PANGU's sub-rules disagree on that string.",
    "ZH-LENGTH's heuristic - suspect a Chinese string longer than half the English character count - fires on every string dominated by a do-not-translate Latin token, which ZH-CODE-SWITCH explicitly licenses.",
    "ZH-VARIANT and ZH-REGION-REGISTER between them cover mainland, Taiwan and Hong Kong; Singapore is Simplified with its own lexical divergences and is named nowhere, so a zh-SG surface falls through both rules.",
    "A fleet shipping ja and zh reads two unsourced and different ratios for the same glyph-versus-Latin width measurement, one in each subject, with no way to tell which budget to size a shared component against."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established that zh sits in the block whose only rule is count=other with an empty condition, so Chinese cardinals have exactly one category. It establishes nothing about measure words, which are grammar the file does not model."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that zh is in the 68-locale other-only ordinal block, confirming the second half of ZH-PLURAL-OTHER's source line."
    },
    {
      "url": "https://www.w3.org/TR/clreq/",
      "result": "Established section 2.1.3's wording - no more than one-quarter of the width of a Han character between Han characters and Western letters or European numerals - confirming ZH-PANGU's quarter-em paraphrase. It did not establish the prohibition-character lists in ZH-LINEBREAK: section 6.1.1 was reachable only by heading in this fetch, so those lists remain unverified."
    }
  ],
  "documents": {
    "chinese.md": {
      "disposition": "clarify",
      "reason": "Keeps the per-character full-width framing the technique's own opening caution retracts as relational, and states an unsourced 1.5 to 1.75 times glyph ratio that contradicts the Japanese sibling's unsourced roughly twice for the same measurement. Its plural, casing, register and Hans/Hant framing are correct and were re-verified where a source exists."
    },
    "techniques/character-width-and-typography.md": {
      "disposition": "keep",
      "reason": "Carries the landed corrections in full - the relational-vocabulary caution, ZH-WIDTH-UNDECIDED with its variant asymmetry and its consequence for a width-derived spacing linter, and the uncovered separator note. ZH-PANGU's quarter-em citation re-verified against clreq this session. GB/T 15834 remains unread, which is the one open citation."
    },
    "techniques/measure-words-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Both CLDR claims re-verified verbatim this session. The classifier inventory, the recorded-per-noun discipline and the literal-digit exception are sound. The prescribed space before the classifier is justified by a Han/Latin boundary that a Chinese-numeral count does not create, so the rule contradicts ZH-PANGU's sub-rules on that case."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Each rule states its trigger narrowly and carries the reversion boundary that over-application found - the adjectival versus relational de distinction, the adversative test for bei, the legitimate Latin islands. The closing ban on scripted rewriting is the right guard for a rule set this greppable."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "Register located precisely in three places, the recorded-ruling framing for a split the authorities genuinely disagree on, and the marketing-surface exception stated as a boundary that must itself be recorded. The 428-to-81 count is what makes the audit citable."
    },
    "techniques/terminology-and-variants.md": {
      "disposition": "keep",
      "reason": "The Hans/Hant split correctly framed as terminology wearing script's clothes, with the budget rule that follows from it; the collision classes and the part-of-speech split sub-rule are the transplantable content. The vocabulary table was not checked against a primary variant guide, but nothing in the rules turns on any single row."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "The two failure directions, the compression order and the no-manual-breaks rule are sound and well bounded. ZH-LENGTH's 1.5 to 1.75 times ratio is unsourced and inconsistent with the Japanese sibling subject's figure for the same measurement; the slot budgets it derives are correctly labelled defaults."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 record keyed to real catalog pitfalls, whose most useful content is the two-tier severity that lets a bulk audit fix the render-breaking placeholder defect before any style finding. Not re-verified against the repo."
    },
    "applications/process--terminology-and-variants.md": {
      "disposition": "keep",
      "reason": "The four-rendering drift of a central product noun, with counts, is the evidence that makes ZH-TERM-COLLISION's settle-before-translating rule a measured claim rather than advice. Historical, not re-run."
    },
    "applications/spec--character-width-and-typography.md": {
      "disposition": "keep",
      "reason": "Pins the annex and the data file, states its harness and its n, finds the exposure entirely on the prescribed side rather than the rejected one, and closes with an explicit warning against reading width class as a column count. It is the record that produced ZH-WIDTH-UNDECIDED. Not re-executed."
    }
  }
}
```
