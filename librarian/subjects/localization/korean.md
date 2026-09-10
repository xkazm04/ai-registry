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
