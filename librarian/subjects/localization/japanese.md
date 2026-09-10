---
subject: japanese
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# japanese

First touch. External-reconcile wave 1, class B.

**Pin.** UAX #11 rev 44 + UAX #14 rev 55 + `EastAsianWidth`, `LineBreak` and
`LineBreakTest` at Unicode 17.0.0. File: `spec--character-width-and-typography.md`.
**Fate: confirmed on line breaking, sharpened in three places, one sub-claim refuted,
width half not conformance-testable.**

## The harness is the strongest in the wave

A from-scratch UAX #14 default algorithm — LB1 through LB31 including LB9 clustering,
LB15a–d, the LB25 numeric back-scan, LB28a, LB30's East-Asian exclusion, LB30a/b —
scoring **19338 / 19338** on the standard's own conformance file, 648/648 on the
Japanese-class subset. Written independently of the `korean` worker, which produced the
identical 19338/19338 figure on its own implementation.

## Sightings

- **Kinsoku confirmed exactly**: 。、）」 are CL (LB13), ！？ are EX, and 「『（ are OP
  (LB14). Nine fixtures, nine agreements. Breaking between kana and kanji is otherwise
  free (LB31), as the technique says.
- **The kinsoku rules live in the *tailorable* half.** LB13/LB14 sit in §6.2, and
  conformance clause UAX14-C1 permits tailoring them on one condition — the tailoring
  **must be disclosed**. The technique's "these rules are public and standardized" is
  true, but the standard's demand is disclosure of a deviation, not obedience.
- **Small kana and the chōonpu are a documented product choice, not an absolute.**
  ゃゅょっ and ー are `Line_Break=CJ` (*Conditional Japanese Starter*). LB1 defaults
  CJ → NS (strict), but §5.1 says CJ → ID gives normal breaking, "the behavior typically
  used for books and documents". Measured: `キゃト` — no break before ゃ by default,
  **break** under CJ → ID. Ten fixtures, five flips. The technique states the strict end
  of a two-valued choice the standard deliberately leaves open.
- **Refuted:** "a long Latin token (a URL, an identifier) is the one thing that CANNOT
  break freely." `確認https://a.example/b-c_d?x=1確認` has **four** interior break
  opportunities (after `//`, after the path `/`, after the `-` — LB21 protects only the
  position *before* a hyphen — and after `?`), while `確認LongIdentifierName確認` has
  **zero** (LB28). The unbreakable object is an unpunctuated Latin run, not a URL. The
  inverse: `12/34` welds shut via LB25, so a date-shaped path never breaks while `v2/api`
  does.
- **The wave dash is a kinsoku decision, not only a mojibake trap.** 〜 U+301C is NS
  (`ea=W`), ～ U+FF5E is ID (`ea=F`): the first forbids a break before it, the second
  permits breaks both sides.
- **： is missing from the kinsoku list.** U+FF1A is NS, so LB21 forbids a break before
  it just as firmly as ！？.
- **The Ambiguous trap fires here too**, in JA-REAL-GLYPHS: `…`, `—` and `―` are all
  `ea=A`, and the curly quotes the technique bans as "full-width" are A, not F. Plus the
  same §4.1 relational-vocabulary point the `chinese` worker found independently.
- **Conflation absent**: nothing budgets columns from width classes; the sibling
  `ui-conventions-and-length` budgets in *ems*, the unit UAX #11 §1 itself uses.

**2026-08-29 — LANDED (two-sighting families, with [[chinese]] and [[korean]]).**
The relational-vocabulary caution landed in the opening; the Ambiguous-width caution
and the wave-dash line-break consequence in JA-REAL-GLYPHS; the small-kana
strict-vs-normal ruling, the added `：`, and the URL-vs-identifier disproof in
JA-KINSOKU. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. JA-KINSOKU: reword the small-kana/chōonpu clause as a recorded product choice
   (strict vs normal), and note the standard requires the deviation be disclosed.
2. JA-KINSOKU: add ： to the no-line-start set.
3. JA-KINSOKU: narrow "URL or identifier" to "an unpunctuated Latin run".
4. JA-REAL-GLYPHS: `…` and the dashes are context-width; add the wave dash's line-break
   consequence to the mojibake caution.
5. Soften the opening "different code points" to an identity claim.
6. Coverage gap: half-width katakana (`ea=H`, and CJ) is named nowhere.

## Cross-subject proposals

- **Two-sighting family with [[chinese]]**: the Ambiguous-width trap on prescribed
  glyphs, and the §4.1 relational-vocabulary point. Both found independently, neither
  worker aware of the other. Ready to land as technique edits in both.
- **"Tailorable rule + mandatory disclosure"** converges with [[korean]]'s finding that
  the Korean space tailoring is opt-in. Two sightings; a law candidate near
  [[the-authority-is-a-hypothesis]] at four.

## Could not verify

UAX #11 ships no conformance artifact, so every width statement is a property-file
classification, not an executed test. No rendering engine was measured — only the
standard's default algorithm and its one named tailoring. JTF and JLReq, which the
technique cites as sources, were out of scope.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/japanese",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d915e20f5270b78b",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 5 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A valid ICU plural message still parses for ja and can select other; exact =0 wording remains useful.",
    "At least one is an input constraint, not removable politeness.",
    "A no-break-before rule alone cannot guarantee an entire numeric range stays on one line."
  ],
  "sources": [
    {
      "path": "knowledge/localization/east-asian/japanese",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "japanese.md": {
      "disposition": "reverify",
      "reason": "Golden path confuses runtime format support with Japanese plural categories; valid ICU does not become raw braces because locale is other-only. Counter, pronoun, register and width judgments are contextual, and grammar defects are not mostly identity checks."
    },
    "techniques/character-width-and-typography.md": {
      "disposition": "clarify",
      "reason": "Repaired universal punctuation/Latin width rules, ambiguous property dictates glyph width, wave dash keeps entire range together and manual breaks always wrong. Pin renderer and tailored line-break policy."
    },
    "techniques/counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Repaired plural syntax defect on sight, exactly-once placeholder rule, no count-specific messages and dropping at-least-one semantics. Counters are construction-dependent."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "clarify",
      "reason": "Repaired passive implies adversity, pronoun context always recoverable, quotes neutralize arbitrary phrase grammar and non-past state automatically completed-action error. Preserve modality and actor."
    },
    "techniques/register-and-politeness.md": {
      "disposition": "clarify",
      "reason": "Repaired all full UI sentences require one register, professional uncertainty hedges forbidden and labels cannot be polite. Missing certainty must not become false certainty."
    },
    "techniques/terminology-and-katakana-loanwords.md": {
      "disposition": "reverify",
      "reason": "Things-versus-processes is explicitly heuristic, but catalog frequency does not guarantee correctness. Katakana senses vary by domain, brands can have localized forms and acronym spacing is not universal. JIS historical chōonpu provenance and current edition applicability remain source verification work."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Repaired universal glyph ratio/minimum font/label budget, no Japanese abbreviations, URLs always unbreakable and manual line breaks always invalid. Scope actual rendered fit."
    },
    "applications/process--counting-and-quantity.md": {
      "disposition": "reverify",
      "reason": "Historical Personas incidents retained, not rerun. Unsupported ICU is the concrete runtime issue, not the Japanese locale. Counterless model repair conflicts with absolute counter rule; source placeholder occurs twice so exactly-once rule also conflicts. Absolute checkout paths remain cleanup work."
    },
    "applications/process--register-and-politeness.md": {
      "disposition": "reverify",
      "reason": "Historical register counts retained, not recounted. Zero da-period cannot prove absence of all plain-style endings or establish language-wide policy. Forty label examples support a house pattern rather than universal grammar; absolute fleet root remains cleanup work."
    },
    "applications/spec--character-width-and-typography.md": {
      "disposition": "reverify",
      "reason": "Historical 19338-case line-break harness retained, not rerun. UAX property and default/tailoring classifications are distinct from actual renderer behavior or Japanese editorial quality. A forbidden break before wave dash does not prevent a break after it; one URL fixture does not cover all URLs."
    }
  }
}
```
