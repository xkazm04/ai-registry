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

## 2026-09-10 — re-review after the compression revert

Read all ten owned documents at their restored bytes. Primary sources fetched and read
this session: CLDR `release-48-2` `common/supplemental/plurals.xml` and
`ordinals.xml`. Nothing was executed — the 19,338-case UAX #14 conformance harness
recorded in the spec application was not re-run, and no renderer was driven.

**Retraction of the 2026-09-10 external-reconcile record below.** It describes the
compressed documents, which were reverted; its digest no longer matches. Its
per-document `reverify` verdicts are withdrawn. Its one substantive line — that a
forbidden break *before* the wave dash does not prevent a break *after* it — is
already what the technique says (U+301C is non-starting; U+FF5E permits breaks on both
sides), so it is not a finding against the restored text.

**Finding 1 — the golden path states the width premise the technique's own opening
caution retracts.** `japanese.md` says the width of every character matters *once as
an encoding question (full-width vs half-width code points are different characters)*.
The technique now opens by saying the opposite: in the Unicode width property
fullwidth and halfwidth are **relational** — properties of a compatibility pair — so
。、「」 are Wide, not Fullwidth, and their genuine halfwidth partners are ｡､｢｣, not
ASCII. The rules survive as identity checks either way, which is why this is a
clarify and not a defect; but the golden path is the entry point and it teaches the
retracted framing.

**Finding 2 — half-width katakana is named nowhere, and the spec application says so.**
`spec--character-width-and-typography` closes with it: *half-width katakana (`ea=H`;
ｧ..ｰ are also CJ) is named nowhere in the technique; both annexes give it first-class
treatment*. That observation was recorded and never landed. It is a live class in real
Japanese catalogs — legacy POS and telecom data, and user input — and it is exactly
the kind of identity check JA-HALFWIDTH-LATIN's neighbours are built for. The gap is
in the technique, not in the application.

**Finding 3 — two instructions collide on ordinal-suffix placeholders and neither
yields.** `counting-and-quantity` says an ordinal-suffix placeholder `{n}{suffix}`
*should be flagged as a source defect: the suffix slot is meaningless in Japanese and
the string cannot be translated cleanly around it*. The skeleton law it carries says
every placeholder in the source appears in the target, exactly once. A translator
holding a live `{suffix}` today is told both that the string cannot be translated
cleanly and that the placeholder must be preserved, with no stated precedence and no
interim rendering. (CLDR confirms the premise: `ja` has one ordinal category,
`other`.)

**Verified and left alone.** `ja` is a single `other` category for cardinals and one
for ordinals — `plurals.xml` puts it in the 34-locale `other`-only block,
`ordinals.xml` in the 68-locale one. JA-PLURAL-OTHER's source line is exact. The
kinsoku, CJ-tailoring and URL-breaking corrections from the reconcile wave are all
present in the technique, including the `：` addition and the disclosure-not-obedience
framing of UAX14-C1.

**Not resolved.** JIS Z 8301's notation annex is cited by JA-CHOONPU as one of the two
disagreeing authorities and is a paid standard I could not read; the same rule's *one
announced the switch in 2008* is an unnamed vendor and was not checked. The JTF style
guide's punctuation and spacing tables, cited by three rules, were likewise not
retrieved. None of these is doubtful, but none was verified this session.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/japanese",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:25fed1d7e31269bf",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at restored bytes. CLDR release-48-2 plurals.xml and ordinals.xml fetched and read this session. No software executed: the UAX 14 line-break implementation and its 19338-case conformance run, the CJ tailoring fixtures and the URL break probe were not re-run, and no Japanese renderer or font stack was driven. The two process applications are 2026-08-24 field records of one repo and were assessed as records. JIS Z 8301, the JTF style guide and the vendor style guides were not retrieved.",
  "counterexamples": [
    "A source string carrying an ordinal-suffix placeholder puts the counting technique's flag-it-as-a-source-defect instruction against the skeleton law's keep-every-placeholder rule, and the subject states no precedence and no interim rendering.",
    "A catalog inheriting half-width katakana from legacy data or user input hits a class no rule in the width technique names, even though its own spec application flags the omission.",
    "JA-COUNTER's per-concept counter ruling has no answer for a placeholder whose value class the runtime chooses - a count that may arrive as a range or as a word rather than a bare number, which the same technique elsewhere calls a source defect without saying what to ship meanwhile.",
    "JA-LABEL-LENGTH's 2-5 character norm and JA-NO-ABBREV together have no resolution for a concept whose only correct rendering is six or more characters in a fixed-width slot: the technique escalates upstream, which is not available to a translator finishing a batch."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established that ja sits in the block whose only rule is count=other with an empty condition, so Japanese cardinals have exactly one category. It establishes nothing about counter words - the classifier system is grammar the file does not model."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that ja is in the 68-locale other-only ordinal block, confirming the technique's cardinal-and-ordinal source line. It does not establish that an ordinal-suffix placeholder may be dropped."
    }
  ],
  "documents": {
    "japanese.md": {
      "disposition": "clarify",
      "reason": "Teaches the per-character full-width versus half-width framing that the technique's own opening caution now retracts as relational, and that the spec application classifies as a conformance error in vocabulary. The plural and kinsoku statements are correct; the width premise is the entry point a reader carries into the technique."
    },
    "techniques/character-width-and-typography.md": {
      "disposition": "clarify",
      "reason": "Carries every landed correction - the relational-vocabulary caution, the Ambiguous-width caveat, the CJ tailoring as a recorded choice, the colon added to kinsoku, and the URL-breaks-where-identifiers-do-not reversal. The one recorded finding that never landed is half-width katakana, which no rule here names."
    },
    "techniques/counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "The single-category source line re-verified against CLDR, and the two opposite failure modes are well drawn. The ordinal-suffix instruction collides with the skeleton law the same document carries, with no precedence stated - a translator holding such a string is given two incompatible orders."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Each rule is trigger-first with a legitimate-use exception and an explicit ban on bulk pattern-match rewriting. JA-PARTICLE-PLACEHOLDER's three failure modes and the apposition escape are the strongest content in the subject."
    },
    "techniques/register-and-politeness.md": {
      "disposition": "keep",
      "reason": "Register decided per text category rather than per string, with the label-versus-sentence test stated as a predicate test rather than a screen-position one. The temperature axis and the keigo ceiling are bounded. Vendor-guide citations not retrieved."
    },
    "techniques/terminology-and-katakana-loanwords.md": {
      "disposition": "reverify",
      "reason": "Substance is sound - the thing-versus-process heuristic is labelled a heuristic, the false-friend list is checkable, and the choonpu rule correctly ends in pick-one-and-record. But its two named authorities are unresolved: JIS Z 8301's notation annex is a paid standard I could not read, and the 2008 vendor switch names no vendor. Confirm both or restate the rule without the specific citations."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "The wrapping, abbreviation and convention sections are sound. JA-WIDTH-BUDGET's roughly twice the width of an average Latin letter is unsourced and disagrees with the Chinese sibling's roughly 1.5 to 1.75 times for the same class of glyph; one bundle should not carry two unsourced ratios for the same measurement."
    },
    "applications/process--counting-and-quantity.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 record keyed to real catalog keys, carrying the two-severity split on one suffix and the counter-in-the-termbase-row process shape. Not re-verified against the repo."
    },
    "applications/process--register-and-politeness.md": {
      "disposition": "keep",
      "reason": "Its value is the count-before-ruling discipline - zero casual endings across roughly 14,500 lines, about 40 clean labels - which is what makes the register rule citable rather than asserted. Historical, not re-run."
    },
    "applications/spec--character-width-and-typography.md": {
      "disposition": "keep",
      "reason": "The strongest document in the subject: a full UAX 14 implementation with its conformance run declared, three sharpenings, one clean refutation, and an honest statement that the width half is not conformance-testable. It is also the record that makes the half-width katakana omission and the golden path's width premise findings rather than opinions."
    }
  }
}
```

## 2026-10-31 - architecture re-review (digest moved)

Stale on two mechanical commits: repo-relative style-guide paths in the two process
applications, and `counterpart: external` on the spec application. I re-read all ten
documents. **None of the four clarifies the 2026-09-10 record named has landed.** The
golden path's per-character width framing, the missing half-width katakana rule, the
ordinal-suffix versus skeleton-law collision, and the unsourced 2x width ratio are all
still in place, word for word. They carry forward below, sharpened where new evidence
allows.

**Resolved: the terminology technique's reverify.** The 2008 vendor switch is
Microsoft. It was announced 2008-07-25 and is reported as moving to the 1991 Cabinet
Notification's written-out long vowel (ブラウザ to ブラウザー, サーバ to サーバー). The
JIS Z 8301 rule (omit the final chōonpu on words of three or more morae, keep it on two
or fewer) is consistently described in secondary sources. The current 2019 edition's
annex text was not read: JSA publishes only a preview. The technique's claims are now
corroborated enough to keep.

**Re-checked in the line-break data** (`LineBreak-18.0.0`): U+301C is NS, U+FF5E is ID,
U+FF1A is NS, and small kana and ー are CJ. Every line-break claim the typography
technique makes still holds one Unicode version later. The same file classes half-width
katakana U+FF71..FF9D as ID, U+FF67..FF6F as CJ and U+FF61 as CL. That is the material
for the half-width katakana rule the technique still lacks.

The sibling inconsistency on glyph width has grown into a bundle-level one. Japanese
says about 2x, Chinese about 1.5-1.75x, Korean about 1.5-1.8x, and none is sourced. The
fix belongs in all three, so I name it in the Japanese record and flag it for the
siblings.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/japanese",
  "date": "2026-10-31",
  "baseline": "362ef003a",
  "digest": "sha256-b2:fd6a70b4e29cd675",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at current bytes; diff since the 2026-09-10 baseline is three mechanical lines. Unicode LineBreak.txt (18.0.0) read for the code points the typography technique and spec application cite, plus half-width katakana. Microsoft's 2008 chōonpu announcement located through contemporaneous press. JIS Z 8301 corroborated only through secondary descriptions (paid standard; JSA preview not read). Not evaluated: the UAX 14 harness and its conformance run (not re-run); any Japanese renderer; the JTF and vendor style guides; the private product tree the process applications cite; maturity or verified_on refresh.",
  "counterexamples": [
    "Half-width katakana ｱﾌﾟﾘ in a catalog passes every rule in character-width-and-typography (it is not ASCII punctuation, not full-width Latin, not a space), yet it is the legacy-form defect a Japanese reviewer would flag first; LineBreak.txt classes it ID/CJ so it also wraps differently from the full-width form.",
    "A source string 'Ranked {n}{suffix}' leaves a translator two incompatible orders: JA-PLURAL-OTHER/skeleton law says every placeholder appears exactly once, while the ordinal paragraph says the suffix slot is meaningless and the string cannot be translated cleanly. Nothing says which wins.",
    "In a proportional UI font a CJK glyph is about 1 em while average Latin lowercase runs about 0.5-0.6 em, so 'about 2x' and 'about 1.5-1.75x' can both be right for different fonts. Three sibling subjects asserting three unsourced ratios turn a font property into a language property."
  ],
  "sources": [
    {
      "url": "https://www.unicode.org/Public/UCD/latest/ucd/LineBreak.txt",
      "result": "Header LineBreak-18.0.0. Lines read: '301C ; NS # Pd WAVE DASH', 'FF5E ; ID # Sm FULLWIDTH TILDE', 'FF1A..FF1B ; NS', '3083 ; CJ', '30FC ; CJ', 'FF61 ; CL # HALFWIDTH IDEOGRAPHIC FULL STOP', 'FF67..FF6F ; CJ # HALFWIDTH KATAKANA LETTER SMALL A..SMALL TU', 'FF71..FF9D ; ID # HALFWIDTH KATAKANA LETTER A..N'. Confirms JA-REAL-GLYPHS and JA-KINSOKU at one version past the pin, and supplies the classes for the missing half-width katakana rule."
    },
    {
      "url": "https://atmarkit.itmedia.co.jp/news/200807/25/microsoft.html",
      "result": "Contemporaneous report (2008-07-25) that Microsoft would change the final long-vowel notation of katakana loanwords to follow the 1991 Cabinet Notification, e.g. ブラウザ to ブラウザー and サーバ to サーバー (about 313-314 terms). Resolves the unnamed 2008 vendor switch in JA-CHOONPU."
    },
    {
      "url": "https://webdesk.jsa.or.jp/preview/pre_jis_z_08301_000_000_2019_j_ed10_ch.pdf",
      "result": "Not read: a preview of a paid standard. Secondary descriptions consistently state JIS Z 8301's rule of omitting the final chōonpu on words of three or more morae. Corroborates JA-CHOONPU's description, but the current annex wording is not verified."
    }
  ],
  "documents": {
    "japanese.md": {
      "disposition": "clarify",
      "reason": "Carried from 2026-09-10, not landed. (1) The width paragraph frames full-width and half-width as per-character labels ('full-width vs half-width code points are different characters'). The technique's own opening caution and UAX 11 treat them as relational: 。、「」 are Wide, not Fullwidth, and their halfwidth partners are U+FF61..FF64. Restate as an identity check on specific code points. (2) '~2x the width of Latin letters' should become 'roughly 1.5-2x depending on font; measure the rendered width', aligned with the Chinese and Korean siblings."
    },
    "techniques/character-width-and-typography.md": {
      "disposition": "clarify",
      "reason": "Every landed correction holds, and today's LineBreak 18.0 read re-confirms the NS/ID/CJ claims. Carried, not landed: add a JA-HALFWIDTH-KANA rule. Half-width katakana (U+FF65..FF9F) in Japanese prose is a defect on sight. Normalize it to full-width (NFKC does this), except in fixed legacy interfaces. Note that it wraps under different classes (ID/CJ, CL for ｡)."
    },
    "techniques/counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Carried, not landed. The ordinal paragraph says to flag a {n}{suffix} source as a source defect 'and the string cannot be translated cleanly', and the same document makes every placeholder mandatory. State the precedence: keep {suffix} in the value per the skeleton law, positioned where it renders harmlessly (or render 番目 and leave {suffix} at the end if the stack resolves it to empty), and file the source defect upstream."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Trigger-first rules with legitimate-use exceptions and an explicit ban on bulk pattern rewriting. JA-PARTICLE-PLACEHOLDER's apposition escape remains the strongest content in the subject."
    },
    "techniques/register-and-politeness.md": {
      "disposition": "keep",
      "reason": "Register by text category with a predicate test for labels versus sentences, a bounded keigo ceiling and a recorded-house-ruling exit. Vendor guides not retrieved."
    },
    "techniques/terminology-and-katakana-loanwords.md": {
      "disposition": "keep",
      "reason": "Prior reverify resolved. The 2008 switch is Microsoft's 2008-07-25 move to the Cabinet Notification's written-out form, as stated. JIS Z 8301's three-or-more-morae omission rule is consistently described in secondary sources. The heuristic is labelled a heuristic and the chōonpu rule ends in pick-one-and-record. Residual: the 2019 JIS annex wording was not read. Optionally name the vendor and date so the claim is checkable."
    },
    "techniques/ui-conventions-and-length.md": {
      "disposition": "clarify",
      "reason": "Carried, not landed. JA-WIDTH-BUDGET's 'roughly twice the width of an average Latin letter' is unsourced. It disagrees with chinese (1.5-1.75x) and korean (1.5-1.8x) for the same class of full-square glyph. Replace it with a font-dependent range plus the existing 'budget in ems of rendered text' instruction, and align all three siblings in one change."
    },
    "applications/process--counting-and-quantity.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 incident record keyed to real catalog keys. Only the path changed. The two-severity split on one suffix is the lesson. Not re-run."
    },
    "applications/process--register-and-politeness.md": {
      "disposition": "keep",
      "reason": "Dated field record of count-before-ruling (zero だ。 in about 14,500 lines, about 40 clean labels). Only the path changed. Not re-run."
    },
    "applications/spec--character-width-and-typography.md": {
      "disposition": "keep",
      "reason": "Its line-break classes re-read correctly in LineBreak 18.0 today (301C NS, FF5E ID, FF1A NS, small kana and ー CJ). It is the record that names the half-width katakana omission. The harness was not re-run."
    }
  }
}
```
