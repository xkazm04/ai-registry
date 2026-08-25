---
layer: application
type: application
subject: vietnamese
technique: diacritics-and-typography
stack: process
status: forged
verified_on: 2026-08-24
---

# Typography audit of a real vi catalog — Personas

How VI-PUNCT and VI-NFC play out against a living 19k-key consumer catalog:
the Personas app (`C:\Users\kazda\kiro\personas`), whose Vietnamese style guide
`docs/i18n/style-vi.md` was written from a line-by-line sample of
`src/i18n/locales/vi.json` and quantifies exactly the defects the technique
predicts.

## The keyboard-artifact defects are the most frequent — measured, not sampled

The style guide's scan of `vi.json` found **463 literal `...` against 209 correct
`…`** — most ellipses in the shipped file are wrong, in precisely the direction
VI-PUNCT predicts for text typed on English keyboard layouts (`"Đang tải..."`
instead of `"Đang tải…"`). The same failure mode produced double-hyphen em
dashes: `error_boundary_subtitle` shipped `"Đừng lo -- dữ liệu của bạn vẫn an
toàn"`, while correctly typeset strings elsewhere in the same file already use
`—`. The process lesson: because both defects are byte-greppable, the audit
reported *counts*, which turned "tighten typography" from taste into a scoped,
verifiable work item — and revealed that the wrong form was the majority, so a
reviewer sampling a few strings would have inferred the wrong house convention.

## Quotes: the catalog decided the rule

Vietnamese has no enforced curly-quote convention, so VI-PUNCT defers to catalog
coherence. The scan found **zero** curly-quote glyphs in `vi.json` — every quoted
string uses straight `"`. The style guide therefore codified straight quotes as
the rule, explicitly so that no future translator introduces `“ ”` as the file's
lone typographically-fancy string. This is the count-before-enforce move: the
authority here *is* the measured catalog.

## NFC as a stated storage invariant

`style-vi.md` pins the normalization rule the technique demands: `vi.json` is NFC
throughout, and the guide warns that mixing NFD into it "breaks string-equality
checks, `grep`, and diffing even when the text looks identical on screen." It
also states the diacritics floor in incident form: `"Duong"` for `"Dương"` is
"not an abbreviation, it's a different, wrong word" — the VI-DIACRITIC rationale,
derived independently by the product's own guide.

## Coverage caveat that shaped the audit

Roughly a quarter of `vi.json`'s values were still raw English at audit time. The
guide's authors excluded those from voice evidence — untranslated fallbacks prove
nothing about Vietnamese conventions — which is the localization bundle's
coverage law applied at evidence-gathering time: key parity proved nothing;
values were checked.
