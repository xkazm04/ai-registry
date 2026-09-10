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
