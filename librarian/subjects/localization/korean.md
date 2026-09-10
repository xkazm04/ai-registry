---
subject: korean
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# korean

First touch. External-reconcile wave 1, class B.

**Pin.** UAX #14 rev 55 + `LineBreak-17.0.0.txt` + `LineBreakTest-17.0.0.txt`.
File: `spec--spacing-and-typography.md`. **Fate: confirmed, sharpened**, with two
sub-claims recorded as *not conformance-testable*.

## Sightings

- Harness: LB1–LB31 implemented from the annex text, **19338 / 19338** on the standard's
  own conformance data, Hangul subset **2677 / 2677**, no tailoring in the conformance
  run. (The `japanese` worker reached the same 19338/19338 independently.)
- **The default is syllable-break, not space-break.** Precomposed syllables are H2/H3
  and jamo are JL/JV/JT; LB26 forbids breaking inside a block, LB27 makes the block
  behave as ID, and nothing forbids a break *between* blocks. §5.1 says so outright: the
  default supports Korean documents *not* using space-based breaking, and space-based
  documents require tailoring Hangul and jamo to **AL**. Measured: `파일을 저장했습니다`
  breaks at every syllable by default, only at the space under the tailoring. KO-WIDTH's
  "space-break vs syllable-break is a layout setting" is right but **backwards in
  emphasis** — the setting a layout gets for free ignores 띄어쓰기 entirely.
- **Brace placeholders orphan the particle.** In the space tailoring: `철수님이`,
  `Slack이`, `(name)이` and `%s이` all hold, but **`{name}|이` breaks**. `}` is U+007D
  class **CL**, not CP — LB13 forbids a break *before* it and nothing forbids one
  *after*, so LB30's parenthesis exemption never reaches the particle. Every
  ICU-MessageFormat / i18next placeholder can wrap with the Korean particle alone on the
  next line, in the exact syntax KO-SPACING's own example uses. Invisible in default mode
  because everything breaks there.
- **Three anchors stated as orthographic taste have measurable wrapping consequences**:
  full-width `（）` and corner brackets `「」` are East Asian OP/CP and so excluded from
  LB30 (break where the half-width forms bind); curly `”` is Pf and excluded from LB19's
  `[QU − Pf] ×` (breaks where straight `"` binds); and normalizing `--` → `—` **adds** a
  break opportunity before the dash (`—` is B2; LB17 binds only B2–B2), letting a line
  start with a dash. Keep the normalization, know the cost.
- **The authority boundary, kept exact.** Word spacing, particle attachment and
  dependent-noun spacing are 한글 맞춤법 — a national orthography rule the character
  standard encodes nowhere. UAX #14 assigns no property distinguishing a particle from a
  stem. The Unicode-side claim is only that two conformant modes exist and one makes the
  orthography's spaces the sole break points.

**2026-08-29 — LANDED (two-sighting family, with [[japanese]]).** KO-WIDTH now
states that the standard's default is syllable-break and that space-only wrapping is
an opt-in the layout must make and record. The brace-placeholder finding was NOT
landed here — it is proposed for `particles-and-interpolation` and stays banked at
one sighting. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. KO-WIDTH's line-wrap sentence → "the default breaks between syllables; space-only
   wrapping is an opt-in the layout must make."
2. KO-PUNCT / KO-QUOTES / KO-DASH: add the wrapping consequence to each, including the
   em-dash cost.

## Cross-subject proposals

- **`korean/particles-and-interpolation` should carry the brace-placeholder finding** —
  it is a placeholder-syntax fact, not a typography one, and that technique owns particle
  attachment around placeholders. Candidate anchor: prefer a non-brace placeholder
  syntax, or a word joiner, when the layout uses the Korean space tailoring. **Director's
  placement call.**
- **"The punctuation glyph you choose is a line-break class, not only a look"** — pairs
  with [[chinese]] and [[japanese]] on the width axis; same shape, different property.
- **"Tailorable rule + mandatory disclosure"** — second sighting with [[japanese]].

## Not conformance-testable

KO-COMPOUND (solid vs spaced compounds) has no Unicode surface at all and is correctly
left to the termbase. KO-ELLIPSIS's single-glyph ruling is convention — both `중…` (LB22)
and `중...` (LB15d) are protected in both modes.

## Could not verify

Whether any production renderer applies the Korean tailoring is outside the annex's
scope; nothing was measured on a live stack, so the class of a production defect — bad
string versus unconfigured layout — still needs a runtime witness.

## 2026-08-29 - wave 3 (spell-out rulesets, the brief's banked lead)

**Pin.** `unicode-org/cldr@release-48-2`, spell-out rulesets. File:
`spec--counting-and-quantity.md`. **Fate: confirmed, and it grew two refutations.**

- **KO-PLURAL-OTHER is wrong at 2 and 3.** It says idiomatic ordinals prefer the
  independent stems. The count ruleset is the special form at 1 and **delegates to the
  attributive ruleset from 2 up** - so those ordinals take attributive forms, not
  independent ones. **Verified by the director** against the ruleset text.
- **The alternation is conditioned on the following morpheme, not a lookup table.** The
  two ordinal series take different stems and differ at **21 of 99** values over 1-99,
  with a private ruleset existing solely to restore the independent form in the hundreds
  residue. A flat stem table - which the technique's sentence invites - is wrong on all 21.
- **KO-NUM-UNIT's "always assume Sino-Korean readings" is refuted** for the very counter
  the technique names: the ruleset *named* for Sino-Korean is native below 50, and CLDR
  never maps a counter to a numeral system - it ships both paths for the same counter.
- Confirmed: the attributive ruleset exists as a third cardinal spell-out, and the
  technique's own examples already use it without ever naming it.

**Evidence class, stated honestly:** no ruleset conformance test exists, so the oracle was
the publisher's reference implementation - **6030/6030 identical** across six rulesets -
and the document says that is what it is. Three degenerate controls, each a mistake a
careful reader could make, scored 5795, 879 and 5533.

**A near-non-falsifiable check, reported as such.** Korean's single plural category means
three *wrong* rules still score 42/43, 41/43 and 40/43 on its own sample set, while the
same harness scores Korean's rule 22/71 against Russian's samples. The harness
discriminates; the sample set cannot.

**Leads.** The native base-10 rule carries a space inside its optional part while base 20
does not, so 9 of 99 native cardinals spell with an internal space - reproduced by the
reference implementation, so it is the data, not the interpreter. Possible upstream item;
not filed. The technique's noun-first preference has no CLDR counterpart (CLDR ships
numeral-first) and should be marked a house convention.

**2026-08-29 (cycle 3) - LANDED.** KO-PLURAL-OTHER's ordinal sentence corrected (the
attributive stems from 2 up, not the independent ones). KO-NUM-UNIT lost "and
Sino-Korean readings" and gained the reason it is not a property of the counter. New
anchored rule **KO-ATTRIBUTIVE**, which the subject needed anyway - the pre-counter
series is the hard part of Korean counting and previously appeared only implicitly
inside examples, with the 21-of-99 divergence stated so nobody builds the flat table.
The base-10 spacing lead stays banked.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/korean",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:025e5e8c7a94486f",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Quotation marks around a value do not determine whether its spoken ending takes wa or gwa.",
    "Unit nouns may remain spaced after digits; attachment is permitted, not compulsory under orthography.",
    "A rendered name replaces {name}; a break after the literal closing brace does not prove the production name-particle pair breaks."
  ],
  "sources": [
    {
      "path": "knowledge/localization/east-asian/korean",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.korean.go.kr/front/mcfaq/mcfaqView.do?mcfaq_seq=5851",
      "scope": "Primary National Institute FAQ confirms numeric unit spacing and permitted attachment."
    }
  ],
  "documents": {
    "korean.md": {
      "disposition": "reverify",
      "reason": "Golden path treats one product register mix and counter conventions as universal, other-only category as format defect, LTR as no bidi and digit display as removing pronunciation concerns. Latin and numerical values still need spoken-form-aware particles."
    },
    "techniques/counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Repaired exact-other syntax assumes format generation, deul not plural suffix, counters always necessary, closed spacing mandatory and digits eliminate reading concerns. Preserve ordinal distinctions and actual number representation."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Clause fusion and nominalization counts are editorial candidates, not grammar tests. Deletion of ownership or agent can alter meaning, and 에 의해 is not inherently defective. Quotation and voice exceptions defeat no-false-positive please grep. Anchor absence is not proof a string is clean."
    },
    "techniques/particles-and-interpolation.md": {
      "disposition": "clarify",
      "reason": "Repaired quote avoids particle alternation, half-of-values failure claim, always dual form and algorithm cannot handle digits/Latin. Typed values, pronunciation metadata and normalization can support deterministic selection."
    },
    "techniques/register-and-honorifics.md": {
      "disposition": "clarify",
      "reason": "Repaired exactly two permitted registers, formal command always dated, every button noun and second-person ban. Honorific subject and humble benefactive are distinct."
    },
    "techniques/spacing-and-typography.md": {
      "disposition": "clarify",
      "reason": "Repaired English-identical spacing after all punctuation, compulsory closed units, fixed width ratio and space-only wrap required for correct UI. Use actual rendered substitutions rather than literal placeholder syntax."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "Things/actions binary overstates domain usage; native terms can correctly denote objects and loans can form actions. Standard spellings and product names need contextual exceptions. Developer audience does not always choose international loans, and privacy is not always equivalent to personal information."
    },
    "applications/process--particles-and-interpolation.md": {
      "disposition": "reverify",
      "reason": "Historical Personas cases retained, not rerun. The quoted query followed by wa still needs alternation; quotation is not avoidance. Slack example proves one counterexample but no half-time frequency estimate. Known value constraints can justify a single particle; absolute fleet root remains cleanup work."
    },
    "applications/process--register-and-honorifics.md": {
      "disposition": "reverify",
      "reason": "Historical counts retained, not recounted. These establish a product policy rather than a universal two-register rule or formal-command prohibition. Published absolute checkout path remains cleanup work."
    },
    "applications/spec--counting-and-quantity.md": {
      "disposition": "reverify",
      "reason": "Historical CLDR/ICU spellout harness retained, not rerun. Runtime agreement is not proof all lexical forms are normative. Claimed wrong classifiers both match and score below 43/43 is internally contradictory. Spaced numeral-unit forms remain permitted despite data examples. Mixed ordinal series needs construction-specific review."
    },
    "applications/spec--spacing-and-typography.md": {
      "disposition": "reverify",
      "reason": "Historical line-break harness retained, not rerun. Correct UI does not require only space breaks, and permitting syllable breaks does not ignore spaces. Literal brace-host fixture is not ordinary formatted output: interpolation removes braces. Real substituted values and renderer need evidence before declaring orphaned-particle defects."
    }
  }
}
```
## 2026-09-10 — architecture re-review after the compression revert

Read all eleven documents at reverted bytes: the golden path, six techniques, two
process applications and the two spec applications (CLDR RBNF, and UAX #14). The
2026-09-10 record above was written against the compressed rewrite and is retracted as
a grading; its individual doubts about the line-breaking application in particular
(that permitting syllable breaks does not ignore spaces, that a brace host is not
ordinary output) misread a document that is careful about exactly those distinctions.

One real finding, and it took the primary source to see. Both
`techniques/counting-and-quantity.md` (KO-ATTRIBUTIVE) and
`applications/spec--counting-and-quantity.md` state that Korean's two ordinal stem
series — the one before 째 and the one before 번째 — "differ at 21 of 99 values", and
both gloss that set as "{2} plus every n ending in 3 or 4 from 13 up". That gloss
enumerates nineteen values, not twenty-one. I fetched `common/rbnf/ko.xml` at
`release-48-2` and read the rulesets: `%%spellout-ordinal-native-smaller` gives 한, 두,
셋, 넷 at 1–4, while `%spellout-ordinal-native-count` routes from 2 upward through
`%spellout-cardinal-native-attributive`, which gives 한, 두, 세, 네. So 3 and 4
themselves disagree (셋째 against 세 번째, 넷째 against 네 번째) and are missing from the
parenthetical. The count of 21 is correct; the enumeration that is supposed to explain
it is not, and read literally it licenses the flat 셋→세 substitution the rule exists to
ban at exactly the two lowest values a catalog will meet. Twelve and twenty-two do
agree, which is why the twos contribute only one member — that part of the gloss is
right and worth keeping.

Everything else checkable checked out. `plurals.xml`, `ordinals.xml` and
`pluralRanges.xml` at both `release-48-2` and `main` put `ko` in the single-`other`
cardinal group, the single-`other` ordinal group, and the `other+other` range group, so
KO-PLURAL-OTHER holds in cardinals and ordinals alike and has no pending change on the
CLDR 49 branch. The particle alternation table is correct in every row, including the
ㄹ-final wrinkle on (으)로 and the fixed 을(를) ordering. I read data files; I did not run
ICU4J, and neither spec application's harness was re-executed.

A second, softer finding I am recording as unresolved rather than as an error.
KO-TRANSLIT lists the National Institute's loanword spellings correctly — 워크플로, 윈도,
팔로, 콘텐츠, 메시지, 애플리케이션, 디렉터리, 릴리스, 라이선스, 서비스 are all the standard
forms — but labels the clauses behind them wrongly. The rule that produces 워크플로 and
윈도 is the standard's diphthong clause (the sequence written 오, not 오우), not a rule
about "long-vowel doubling"; and the 된소리 prohibition it calls "no *initial* doubled
consonants" is stated in the standard for plosives generally rather than for word-initial
position. I could not confirm the clause numbering today: `kornorms.korean.go.kr` did
not resolve. So the outputs are right, the mechanism labels look wrong to me, and the
source that would settle it was unreachable — which is `reverify` work, not a correction
I am entitled to assert.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/korean",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:d5b9041a7deb5c77",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at reverted bytes. CLDR rbnf/ko.xml, plurals.xml, ordinals.xml and pluralRanges.xml read at release-48-2 and (for the supplemental files) main - read, not executed. Not evaluated: UAX #14 and its conformance data, which the line-breaking application pins; the National Institute's loanword orthography, whose site did not resolve; the Personas tree the two process applications cite; ICU4J or any reference implementation; maturity or verified_on refresh.",
  "counterexamples": [
    "KO-PARTICLE-DUAL's inventory covers five particles, but a placeholder followed by the vocative or by a coordinating -(이)랑 gets no dual form, and the technique's 'a few minor particles rarely reach UI strings' dismissal is the only thing standing where a rule would go.",
    "KO-NOUNFORM's chrome/message split has no answer for a button whose label is a short question ('Save?'), which is neither a bare noun nor a full utterance; the exception it does carry is about hero CTAs, not about interrogative controls.",
    "KO-ZERO routes zero to an absence phrasing, but a range or a delta that can be zero ('0 changes since') is neither a count nor an absence, and no rule covers it."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/rbnf/ko.xml",
      "result": "Established that %spellout-cardinal-native-attributive gives 한/두/세/네 at 1-4, that %%spellout-ordinal-native-smaller gives 한/두/셋/넷, and that %spellout-ordinal-native-count delegates to the attributive from 2 up. This makes 3 and 4 genuine disagreements between the two stem series, which is what the '{2} plus n ending in 3 or 4 from 13 up' gloss omits. It did not establish the 46-of-99 native-vs-attributive figure or the 100-percent ICU4J agreement the application reports."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/ordinals.xml",
      "result": "Established that ko sits in the single-other ordinal group on the CLDR 49 development branch as well as at 48.2, so KO-PLURAL-OTHER's ordinal half has no pending change. It did not establish anything about the spell-out machinery, which the same subject correctly says is where Korean's quantity work actually lives."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/pluralRanges.xml",
      "result": "Established that ko sits in an eleven-locale group publishing a single other+other -> other row, corroborating the counting application's range claim. It did not establish anything about counters, which have no surface in this file."
    },
    {
      "url": "https://kornorms.korean.go.kr/regltn/regltnView.do?regltn_code=0003",
      "result": "Did not resolve (DNS failure), so the National Institute's loanword-orthography clauses could not be read. Nothing was established; KO-TRANSLIT's clause labels remain unverified, which is why that document is graded reverify rather than clarify."
    }
  ],
  "documents": {
    "korean.md": {
      "disposition": "keep",
      "reason": "The four load-bearing facts are correctly ordered and each is right: register is carried by verb endings with no neutral option, particles alternate on the previous word's final sound, CLDR gives Korean one category while counters do the real work, and the lexicon is three-stratum with a citable authority. The framing that Korean punishes the CJK mental model hardest - spaces, half-width punctuation, alphabet not logography - is the correction a localizer most needs before any rule."
    },
    "techniques/counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "KO-ATTRIBUTIVE's parenthetical set - the twos, and every number ending in three or four from thirteen up - enumerates nineteen values against its own stated 21, because it omits 3 and 4 themselves. Verified against rbnf/ko.xml at release-48-2: the 째 series gives 셋/넷 where the 번째 series gives 세/네, so 3 and 4 are disagreements. Read literally the gloss licenses exactly the flat substitution the rule bans, at the two lowest values a catalog meets. The rest of the technique - KO-PLURAL-OTHER, KO-DEUL, KO-COUNTER, KO-NUM-UNIT, KO-ZERO - is sound and KO-PLURAL-OTHER was re-verified today."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Five anchored constructions, each with the calqued and the Korean form shown, and a closing gate that makes a rewrite legal only when a finding names the anchor. The KO-CALQUE-PASSIVE distinction between the native -doeda family and the calqued -e uihae agentive is the one that most reliably separates review from taste, and it is stated with the right direction of error."
    },
    "techniques/particles-and-interpolation.md": {
      "disposition": "keep",
      "reason": "The alternation table is correct in every row, the (eu)ro wrinkle for l-final hosts is noted and then correctly subsumed by the dual form, and the fixed consonant-form-outside ordering is stated as greppable convention. KO-PARTICLE-RUNTIME's limit - that runtime selection still misfires on Latin-script values because the final sound follows the Korean reading - is the part a stack decision usually misses."
    },
    "techniques/register-and-honorifics.md": {
      "disposition": "keep",
      "reason": "The two-register mix dispatched by sentence function, the noun-form rule for chrome with its found-by-over-application CTA exception, the 당신 ban with its long-form residue, and the honorific-points-at-the-user rule are each bounded and each auditable. The authority-versus-usage handling of -십시오 (record the choice once, cite the record) is the right posture for a live divergence."
    },
    "techniques/spacing-and-typography.md": {
      "disposition": "keep",
      "reason": "KO-PUNCT's insistence that full-width CJK punctuation is not Korean orthography earns its explicit statement, and KO-WIDTH now carries the line-break finding in the correct direction - syllable-break is the default and space-based wrapping is the opt-in. KO-COMPOUND is honest that the official orthography underdetermines it and routes to the termbase instead of inventing a rule."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "reverify",
      "reason": "KO-TRANSLIT's spellings are the standard forms, but the clause labels behind them look wrong: the rule producing 워크플로 and 윈도 is the standard's diphthong clause, not a prohibition on 'long-vowel doubling', and the 된소리 prohibition is stated for plosives generally rather than for initial position. The National Institute's site did not resolve today, so the clause text could not be read and this stays unresolved rather than becoming a correction. KO-LOANWORD-SPLIT, KO-KONGLISH and KO-UNTRANSLATED are unaffected."
    },
    "applications/process--particles-and-interpolation.md": {
      "disposition": "keep",
      "reason": "A dated field record of the five dual forms shipped in a real catalog, with the guide's own counterexample and the length-pressure interaction (the particle is dropped first) that doubles as an avoidance move. The what-stayed-downstairs section correctly separates the product's placeholder names from the alternation table, which is the same for every product. Not re-verified against the tree."
    },
    "applications/process--register-and-honorifics.md": {
      "disposition": "keep",
      "reason": "Register settled by counting a shipped catalog rather than by citing a style authority, with the zero -십시오 count doing the work of resolving an authority-versus-usage divergence. That is the method the technique teaches, demonstrated at the scale where it is actually decidable. Not re-verified against the tree."
    },
    "applications/spec--counting-and-quantity.md": {
      "disposition": "clarify",
      "reason": "Carries the same nineteen-for-twenty-one enumeration as the technique it corrects, in the very passage that establishes the alternation is conditioned rather than tabular. Its underlying ruleset facts read back correctly from rbnf/ko.xml at release-48-2 today, and its sharpest contributions - that a single plural category is not 'no quantity machinery', and that ko's own plural samples cannot discriminate a wrong rule - are unaffected."
    },
    "applications/spec--spacing-and-typography.md": {
      "disposition": "keep",
      "reason": "The finding that matters - the published default classes Hangul as ID so breaking between syllable blocks is permitted, and space-based wrapping is a named tailoring - is stated in the correct direction and its consequence for a ragged-margin UI catalog is drawn without overreaching. The brace-host orphan (a closing brace is CL, not CP, so LB30's exemption never reaches the particle) is a real defect class named against the placeholder syntax the subject's own examples use. The annex and its conformance data were not re-read this run."
    }
  }
}
```

