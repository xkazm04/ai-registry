---
subject: korean
domain: localization
last_touched: 2026-08-29
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
