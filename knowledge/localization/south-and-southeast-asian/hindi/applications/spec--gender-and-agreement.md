---
layer: application
type: application
subject: hindi
technique: gender-and-agreement
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Gender and agreement against the Unicode CLDR supplemental data

## The pin

Publisher **Unicode Consortium**, repository `unicode-org/cldr`, tag
**`release-48-2`** (CLDR 48.2, published 2026-03-17 — the newest tag marked as a
release; 49 exists only as `release-49-alpha1`, and alpha data is not citable).
Retrieved 2026-08-29 from `raw.githubusercontent.com/unicode-org/cldr/release-48-2/`,
sha256 prefixes: `common/supplemental/` — `plurals.xml` `d701d8b461afd2ba`,
`ordinals.xml` `129bf4aa6f41d479`, `pluralRanges.xml` `42c82db9baaa8667`,
`grammaticalFeatures.xml` `5dbab16f4b42a46c`; plus `common/main/hi.xml`
(582,873 bytes). Rules interpreted per UTS #35 (LDML), which the files name.

## What the released data actually carries for `hi`

- **Cardinal** (`plurals.xml`, the block whose `locales` list contains `hi`):
  `one` at `i = 0 or n = 1`, `other` otherwise. Two categories.
- **Ordinal** (`ordinals.xml`, block `locales="gu hi"`): **five** categories —
  `one` at `n = 1`, `two` at `n = 2,3`, `few` at `n = 4`, `many` at `n = 6`,
  `other` for the rest. 5 is *not* singled out; 6 is.
- **Plural ranges** (`pluralRanges.xml`, block of 10 locales incl. `hi`): three
  rows — one+one→one, one+other→other, other+other→other.
- **Grammatical features** (`grammaticalFeatures.xml`, `targets="nominal"`,
  `locales="hi pa"`): `grammaticalCase` values *nominative oblique*;
  `grammaticalGender` values *masculine feminine*. Hindi **is** present — the
  absence this application was sent to look for is not there.

## Executed evidence

Harness: `hi_plural_check.py`, ~100 lines of Python 3.12 with no i18n library —
the operands (`n i v w f t`) and both rule expressions are transcribed from UTS
#35 and evaluated against CLDR's own `@integer`/`@decimal` sample sets, ranges
expanded at the last decimal place. Run 2026-08-29.

| classifier | n | agreement | categories emitted |
| --- | --- | --- | --- |
| cardinal, published rule | 61 | 61/61 (100%) | one, other |
| cardinal, CONTROL always-`other` | 61 | 43/61 (70.5%) | other |
| cardinal, CONTROL naive English (`one` iff n=1) | 61 | 45/61 (73.8%) | one, other |
| ordinal, published rule | 26 | 26/26 (100%) | one, two, few, many, other |
| ordinal, CONTROL always-`other` | 26 | 21/26 (80.8%) | other |

Both controls fail where expected. Always-`other` misses every ordinal category
sample (`1`, `2`, `3`, `4`, `6`) yet still scores 81% — a degenerate classifier
looks *almost right* on accuracy, so category coverage is the acceptance signal.
The naive English cardinal misses 16 samples, all of them values with `i = 0`.

A second run enumerated all 45,451 ordered pairs `start ≤ end` over 0.0–30.0
step 0.1 and observed exactly three category pairs: (one,one), (one,other),
(other,other). CLDR's three-row `hi` range table is therefore complete, not
truncated — (other,one) is arithmetically unreachable for an ascending range.

## Findings against the technique

**The technique already carries the ordinal set; the golden path does not.**
`techniques/gender-and-agreement.md` L106–108 states the five-way ordinal split
and its exemplars, and forbids string-appending वाँ. `hindi.md` L109–115 covers
cardinals and the zero rule and is **silent on ordinals and on ranges**. The
hint's premise — that the technique might treat ordinals as out of scope — is
**refuted**; its substance (five categories, `many` at 6) is **confirmed** by the
released data, exemplar for exemplar: one→ला, two→रा, many→ठा, other→वां match
`hi.xml`'s own `ordinalMinimalPairs`. The set looks arbitrary because it is a
suffix inventory, not a numeric pattern: पहला, दूसरा/तीसरा, चौथा and छठा are
suppletive and each needs its own suffix, while -वाँ is regular from 5 onward —
which is why 6 earns a category and 5 does not.

**Sharpest finding — CLDR's own Hindi `few` minimal pair carries no ordinal
suffix.** In `hi.xml` L7833–7837 the five `ordinalMinimalPairs` read `{0}ला …`,
`{0}रा …`, `{0}ठा …`, `{0}वां …` — and `few` reads `{0} दाहिना…`, i.e. U+0020
and no suffix at all where चौथा's -था belongs. The separator differs too (`one`
and `few` use a space, the other three U+00A0), which reads like an unfinished
entry rather than a linguistic claim. It is not a regression: identical in
`release-47`, `release-48-2` and `release-49-alpha1`. A minimal pair that does
not distinguish its category cannot serve its purpose, so this is an
**upstream-reportable data gap**, and downstream it means the technique's `4था`
exemplar is correct but **uncorroborated by CLDR** — it is the one ordinal form
a product cannot lift from the locale data. (Orthographic divergence, not a
defect: the technique writes 5वाँ with chandrabindu U+0901, CLDR writes वां with
anusvara U+0902.)

**Zero, and the fractions below it — a sharpening.** HI-PLURAL's "0 and 1 both
take the one form" is confirmed by the `one` sample set (`@integer 0, 1`). But
the same clause's "Fractions fall to other (1.5 घंटे)" is only half true: the
rule's first disjunct is on `i`, not `n`, so **every fraction with a zero
integer part is `one`** — the `one` sample set publishes `@decimal 0.0~1.0,
0.00~0.04`, and the harness returns `one` for 0.5, 0.9 and 0.04. A Hindi `one`
branch must therefore read correctly at 0, at 1, *and* at 0.5 — "0.5 घंटा", not
just the empty state. That is a stricter authoring constraint than the technique
currently states.

**Gender: partly testable, and the boundary is real.** `grammaticalFeatures.xml`
corroborates the *inventory* behind HI-AGREE and HI-OBLIQUE — two genders, and a
nominative/oblique case system with no third case. Two things go further than
expected. First, `hi.xml` L7838–7841 publishes `caseMinimalPairs`
(nominative/oblique) and `genderMinimalPairs` (`{0} बड़ी है` / `{0} बड़ा है`) —
a published agreement frame a catalog audit can diff against. Second, `hi`
carries **321 `case="oblique"` unit patterns** with real content, crossed with
`count` (`{0} दिनों`, `{0} घंटों`, `{0} महीनों`). So HI-OBLIQUE's claim that the
-ों oblique plural is "a third form no CLDR category names" is **true of the
plural categories and misleading overall**: CLDR names it on a second, orthogonal
axis, and ships the forms. Where a runtime exposes that axis the translator does
not have to smuggle the oblique inside a plural branch. What remains **not
conformance-testable** is the rest of HI-AGREE and HI-LOANGENDER — ergative ने
agreement, loanword gender assignment, participle concord in product prose. CLDR
declares these features only for its *own* nominal inventory (the file's stated
purpose is inflected unit names) and publishes no Hindi lexicon gender, no
validator and no procedure over arbitrary strings; stretching unit data to cover
that half would be an overreach.

**Ranges: passed over.** `hi` has a table and both technique and golden path are
silent on ranges — a real gap, but three rows and one unreachable pair is too
small a surface to bind an application to.

## Fates

Ordinals **confirmed** in data, hint **refuted** as to the technique's silence ·
zero-rule **confirmed and sharpened** (sub-1 fractions) · oblique-axis claim
**sharpened** · gender agreement **not conformance-testable** beyond the declared
inventory and the minimal pairs · ranges **passed over**.
