---
layer: application
type: application
subject: arabic
technique: bidirectional-text-and-interpolation
stack: process
status: forged
verified_on: 2026-08-24
---

# Bidi and interpolation in a real 14-locale catalog: Personas Desktop (ar)

The Personas Desktop app (`C:\Users\kazda\kiro\personas`) ships a ~19k-key
catalog in 14 locales; Arabic is its only RTL locale, and its worked style
guide — `docs/i18n/style-ar.md` — is the fleet's richest record of how this
technique's rules play out against a real `ar.json`
(`src/i18n/locales/ar.json`, ~75% shipped and voice-consistent at the time the
guide was cut).

## AR-BIDI-MIRROR, observed in the wild

`style-ar.md` Pitfall §4 documents the exact translator instinct the rule
bans: "correcting" `(` `)` to `)` `(` in the source string, producing
`)بيتا(` for "(beta)" — doubly-mirrored at render time. The guide's ruling
matches the technique verbatim: type `(بيتا)` in logical order and let the
bidi algorithm mirror. This was written from a real occurrence, not as
prophylaxis.

## AR-BIDI-MARK as the minimal intervention, and the restraint around it

The guide's "RTL embedding around Latin/placeholder runs" rule
(`style-ar.md`, Typography section) is a worked calibration of when the seam
actually needs help: for short inline placeholders like `{count}` or `{pct}`
the algorithm handles it and nothing is inserted; the RLM (U+200F) goes in
only when a preview shows Arabic punctuation attaching to the wrong side of a
*phrase-length* Latin run — a URL or version string followed by an Arabic
colon or period. That is the technique's "only where a rendered preview shows
the defect" rule, arrived at independently by the product. The guide also
carries the negative import rule: Arabic needs no ZWNJ — a habit copied from
Persian-locale guides — matching AR-NO-KASHIDA's companion note.

## The skeleton break that actually shipped

Pitfall §2 records the fleet's canonical skeleton incident, one string
stacking two defects: `monitor.subtitle` shipped as
`"{شخصيةs} شخصيةs · {attention} need attention · {running} running"` against
source `"{personas} personas · …"` — the placeholder name translated (so it
renders literally, since placeholder matching is ASCII-exact) *plus* a Latin
plural `s` stapled to an Arabic noun. The recorded fix: keep `{personas}`
byte-identical, translate only surrounding text, drop the bolted `s`. This
single incident is the citation behind both the technique's skeleton
paragraph and AR-NO-LATIN-PLURAL in the plural technique.

## The rendered-review pass in practice

The repo's review flow treats Arabic as the one locale where a string diff is
insufficient: the guide instructs checking rendered previews specifically for
punctuation-attachment around resolved placeholders, and its examples carry
realistic worst-case values (URLs, version strings) rather than friendly
short ones — the AR-BIDI-REVIEW checklist in miniature. Its shipped-legacy
notes (ASCII `...` and `--` still present in about half the old strings,
explicitly marked "legacy debt, not the standard to copy") are also a working
example of the count-before-enforcing discipline: the guide names which
corpus patterns are evidence and which are debt, so a bulk pass neither
copies the debt nor rewrites clean strings.

## What stayed downstairs

`style-ar.md` also fixes product decisions this bundle must not absorb: the
32-row termbase (شخصية vs وكيل for persona vs agent), Western-digits-always,
guillemets, the percent-glue convention. They are cited here as evidence that
the techniques' *decision frames* were exercised — each is a once-recorded
per-product ruling of exactly the shape AR-NUMERALS and the loanword rules
require.
