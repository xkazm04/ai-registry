---
layer: application
type: application
subject: bengali
technique: classifiers-and-quantity
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — classifiers and quantity in a live 14-locale catalog

How the classifier and plural anchors play out in a real consumer catalog: the
Personas app, whose Bengali catalog (`src/i18n/locales/bn.json`, ~19k keys
across 14 locales) was about 75% shipped, human-reviewed Bengali at the
2026-07-10 sweep documented in `C:\Users\kazda\kiro\personas\docs\i18n\style-bn.md`.
That style guide's counts are the evidence base cited below.

## The classifier as the top pitfall — with a shipped counter-example

The style guide's Pitfalls list opens with the missing classifier as "the
single most obvious 'this was machine-translated' tell" (BN-CLASSIFIER), and
the corpus supplies both directions:

- Correct, dominant: `{count}টি` / `৩টি পার্সোনা` — classifier glued to number
  or placeholder, no space (BN-CLGLUE).
- Shipped bug, quarantined by the guide rather than copied: the gallery string
  `"গ্যালারিতে 1টি নতুন সম্পদ"` — Latin `1` fused to Bengali `টি`, the exact
  mixed-script token BN-CLGLUE forbids; the guide rules it must read `১টি`.

The glue rule interacts with the format contract: the placeholder name inside
`{count}` is untouched skeleton; only the classifier outside the brace is
Bengali text. Personas' i18n check tooling validates placeholder parity
per-locale, so a translator who "helpfully" renamed `{count}` would be caught
mechanically — the classifier position never trips it.

## Plural categories as separate keys, and the `_one` contradiction

Personas uses suffixed plural keys (`_one`/`_other`), not ICU syntax — the
stack-level realization of CLDR's two Bengali cardinal categories
(BN-PLURALONE). The style guide documents a real shipped contradiction in a
`_one` key, `channel_new_messages_one`: `"{count}টি নতুন বার্তাগুলো"` — the
plural suffix গুলো stacked onto a count that is 0 or 1 by category definition.
The corrected form, `"১টি নতুন বার্তা"`, drops the suffix and keeps the
classifier — BN-PLSUFFIX applied verbatim, before this bundle existed to name
it. (Note the correction hardcodes ১; under BN-PLURALONE's zero-inclusion a
count-carrying `{count}টি` form is the safer default unless the key is known
never to render 0.)

## Working the anchors in a bulk pass

The repo's translator fleet (40 agents closing the remaining ~25% gap) works
against the style guide as its authority, which maps onto this bundle as:

1. Before drafting, read the pitfalls — classifier (BN-CLASSIFIER), plural
   suffix in `_one` (BN-PLSUFFIX), digit script per quantity (BN-DIGITS,
   BN-CLGLUE).
2. On touching any string with a count, verify: classifier present, glued,
   single-script; `_one` value singular; `_other` value carrying `{count}`.
3. Findings cite the guide's section (now: the BN- anchor) — untyped "sounds
   off" feedback was already inadmissible in that workflow.

The upward lesson this repo taught the subject: the guide's own examples ship
unit quantities without classifiers (`"গত ২৪ ঘণ্টায়"`, `"এজেন্ট ২+ মিনিট ধরে"`)
right next to its classifier mandate — the unit exception was implicit in the
corpus and easy for a rule-following bulk pass to over-apply, so BN-CLASSIFIER
now states it explicitly rather than leaving it to be rediscovered per catalog.
