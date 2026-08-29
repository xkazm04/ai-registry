---
layer: application
type: application
subject: french
technique: plural-and-agreement
stack: spec
source: unicode-org/cldr@48.2
status: forged
verified_on: 2026-08-29
---

# FR-ZERO and FR-MANY against the published CLDR rule set (CLDR 48.2)

## The pin

Publisher: Unicode, Inc. Document: Common Locale Data Repository, release **48.2**
(2026-03-17 — the newest release directory carrying data; `49/` holds only a README and the
only 49 tags on the source repo are alphas). Artifact: `cldr-common-48.2.zip` from
`https://unicode.org/Public/cldr/48.2/`, retrieved **2026-08-29**, SHA-512
`de8660f5371e0fcf…4791fa62`; cited files inside are `common/supplemental/{plurals,ordinals,
pluralRanges}.xml`, `common/main/fr.xml`, `common/rbnf/fr.xml`. Normative prose:
**UTS #35 (LDML) Part 3: Numbers**, version 48.2,
`https://www.unicode.org/reports/tr35/tr35-numbers.html`, sections *Explicit 0 and 1
rules*, *Operands*, *Relations* and *Plural Ranges*, same date. Re-checker's note: the
release's `hashes/SHASUM512.txt` gives `cldr-common-48.2.zip` a digest it also gives to two
jars, while the served file hashes to the digest listed for `core.zip` — the manifest row
is wrong, not the download.

## FR-ZERO is confirmed — and `one` is an interval, not two values

`plurals.xml` line 118 opens `locales="fr"` with exactly three rules: `one` = `i = 0,1`
(119), `many` (120), `other` (121, empty condition). Zero is singular: confirmed, with no
region escape — CLDR keys plural rules on the language subtag and no `fr_*` entry exists
in any of the three supplemental files. The sharpening is in the operand.

`i` is the **integer digits**, so `i = 0,1` selects `one` for every value whose integer
part is 0 or 1 — 0,5 and 1,5 and 1,999 included. The spec says so twice: its *Relations*
table glosses `i = 1` as covering "1.1, 1.99999, … but no greater", and its *Explicit 0
and 1 rules* section uses French as its worked example of a `one` case that "covers 0.0
through 1.99". The `@decimal` samples agree from both sides: `one` lists `0.0~1.5`,
`other` starts at `2.0`.

FR-ZERO says the category covers "0 and 1". True of the integers, misleading about the
branch: **`one` is the half-open interval [0, 2)**, so the `one` branch text must read
correctly beside a fractional numeral. Two audit signatures follow, neither in the
technique. A `one` branch that spells the number out or assumes exactly-one — *Un poste*,
*Il reste une minute* — renders *1,5 poste* wrong the first time a rating, an average or a
price reaches the string; where the count can be fractional, the `one` branch keeps the
placeholder and stays number-agnostic. And the `=1` exact-match signature the technique
already names is worse than it looks: it misses not only 0 but every non-integer below 2.

## Executed evidence

`harness.py` (worker scratch) implements the UTS #35 operands `n i v w f t c` (compact
exponent applied first, per *Operands*) plus a parser for the rule grammar, then
classifies CLDR's own `@integer`/`@decimal` sample sets. No plural library is used.

| run | n | agree | disagree |
| --- | --- | --- | --- |
| `fr` cardinal rules vs published samples | 85 | 85 | 0 |
| `fr` ordinal rules vs published samples | 22 | 22 | 0 |
| control: always-`one` / always-`other`, cardinal | 85 | 18 / 54 | **67 / 31** |
| control: always-`one` / always-`other`, ordinal | 22 | 1 / 21 | **21 / 1** |
| control: `one` iff the count is exactly 0 or 1 | 85 | 58 | **27** |
| control: the `en` rule set on the `fr` samples | 85 | 55 | **30** |

Every degenerate control fails, so the harness can fail. The fractional claim, measured:
over the 200 two-decimal values in [0,00 – 1,99] CLDR selects `one` for all 200, while an
exact-value implementation disagrees on **198** and the English rule set on **200**; all 20
one-decimal values in [0,0 – 1,9] select `one`. Integer sweep 0–2 000 000: `one` 2, `many`
2, `other` 1 999 997.

## Ordinals: French has a `one`, the technique has no rule

`ordinals.xml` line 26 puts `fr` in a block whose rules are `one` = `n = 1` (27) and
`other` (28). French ordinals **do** select, by a *different* rule than the cardinals, and
the two disagree at two places a reviewer will meet: **0** is `one` as a cardinal, `other`
as an ordinal (the ordinal rule's own `@integer` samples list 0 under `other`), and **1,5**
likewise, because the ordinal rule tests `n`, the whole value, where the cardinal tests `i`.

The technique is silent on ordinals — a gap rather than a defect, but a consequential one,
because ordinal selection is exactly where FR-AGREE bites and cannot help. CLDR's own
worked minimal pair for `fr` (`common/main/fr.xml` lines 6442–6443) is feminine: `one`
carries the *re* abbreviation, `other` carries *e*, and no category in the plural
machinery distinguishes either from the masculine *er*. The gender is carried outside —
`common/rbnf/fr.xml` gives French four ordinal rulesets (lines 379, 382, 389, 392),
masculine and feminine each with a plural variant, and the caller picks one. So a
`selectordinal` block for French has **two** branches and cannot express *1er* vs *1re*:
the gender is a per-string decision, and a shared ordinal component that hardcodes one of
them is a defect wherever the referent's gender varies.

## FR-MANY is confirmed, and it is a property of the rendering

Rule 120 — written with `e`, the deprecated synonym for the compact exponent `c` — parses
as `(e = 0 and i ≠ 0 and i % 1000000 = 0 and v = 0) or (e ∉ 0..5)`; `and` binds tighter
than `or`, per a spec note using this rule as its example. Both halves of FR-MANY hold,
as does the provenance: release 37's `fr` block had only `one`/`other`; `many` is new in 38.

What the technique's trigger implies but does not state: **`many` is selected by the
formatted representation, not by the magnitude.** Measured with the compiled rules —
`1000000` → `many`, but `1000000.0` → `other` (one visible fraction digit breaks `v = 0`),
and `1500000` → `other` while the same quantity rendered compactly, `1.5c6`, → `many`.
Turning compact notation on or off therefore changes which branch renders: a `many` branch
must be tested through the formatter the surface uses, not by feeding it a large value.

## Plural ranges: the technique is silent, and so, mostly, is CLDR

`pluralRanges.xml` line 112 gives `locales="fr pt"` three rows: `one+one → one`,
`one+other → other`, `other+other → other`. A range like *2 à 5 postes* selects from a
**(start, end) pair**, not from the end value alone — but for French the two coincide,
provably: the spec's *Plural Ranges* section fixes the default for an absent pair as the
**end** category, all three published rows already equal their end, and the other six
pairs over French's own three categories are absent, so all nine resolve to the end.
**For `fr`, and only as a derived result, a range takes its end value's category.**

The gap is what is unwritten. The block's own comment names the category set *one, many,
other*, yet none of the six `many` pairs has a row — three (`one+many`, `many+many`,
`other+many`) are reachable under the spec's presumption that start < end, and they are
exactly the compact-notation ranges (*1 à 5 M de messages*) FR-MANY sends people to write.
Their result is the default, not a verified value, and the spec distinguishes the two.
Nothing the technique says is contradicted; a French range implementation that reuses the
end category is correct today, but by coincidence of the defaults, and portable nowhere.

## What the standard does not confirm

CLDR assigns categories; it says nothing about morphology or agreement, so FR-AGREE and
FR-PLURAL are untested here. One boundary it does supply for FR-ZERO's exception: the
spec's *Explicit 0 and 1 rules* define `count="0"`/`count="1"` cases that take precedence
over `one`, and French uses one (`common/main/fr.xml` line 4747, the long compact pattern
for 1000) — so "guard 0 so it never displays" has a standard-sanctioned form.
