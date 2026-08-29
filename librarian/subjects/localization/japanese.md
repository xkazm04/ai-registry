---
subject: japanese
domain: localization
last_touched: 2026-08-29
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
