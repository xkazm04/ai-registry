---
layer: application
type: application
subject: russian
technique: plural-and-count-agreement
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec — the `ru` plural rules as CLDR actually publishes them

RU-PLURAL's table is derived from the CLDR plural rules. This reads them back against it,
executes them, and reports where the prose is faithful and where it loses the mechanism.

## The pin

Unicode CLDR **48.2**, git tag `release-48-2`, published 2026-03-17 — the newest
non-prerelease tag; `main` carries 49-alpha and is not citable. Fetched 2026-08-29 from
`raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/`:
`plurals.xml` (sha256 `d701d8b461afd2ba…`), `ordinals.xml` (`129bf4aa6f41d479…`),
`pluralRanges.xml` (`42c82db9baaa8667…`). Spec: UTS #35 Part 3, Numbers, at
`www.unicode.org/reports/tr35/tr35-78/tr35-numbers.html` (`43aed410d67e349c…`) — the
revision whose masthead reads Version 48.2, so spec and data editions match. Sections are
cited by anchor name; UTS #35 does not number them. The `ru` rules as published:

```
one    v = 0 and i % 10 = 1 and i % 100 != 11
few    v = 0 and i % 10 = 2..4 and i % 100 != 12..14
many   v = 0 and i % 10 = 0 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 11..14
other  (no condition — residue; @decimal samples only, no @integer samples)
```

## Harness

No third-party library: the operands `n i v w f t c e`, the relations and the
`and`-binds-tighter-than-`or` precedence were implemented from **§Language Plural Rules →
Operands / Relations**, then the rule strings parsed out of `plurals.xml` and run
(`C:/tmp/rec/w-russian/ru_plural.py`, CPython 3.12, `Decimal`). **Validation first:** the
engine reproduces all **13 rows** of the spec's own *Plural Operand Examples* table
(`1.20050c3 → n=1200.5 i=1200 v=2 w=1 f=50 t=5 c=3`) — n=13, 13 pass, 0 fail.
**Conformance:** every value in CLDR's `@integer`/`@decimal` samples for all four `ru`
rules, ranges expanded — **n=71, 71 pass, 0 fail**.

## Finding 1 — the `v = 0` guard is the mechanism RU-FRACTION states but never names

Every non-`other` rule is guarded by `v = 0`, the count of **visible fraction digits**.
`other` is therefore not "the fractions category" by grammatical accident — it is
*defined* as the visible-fraction residue, and `plurals.xml` closes the loop by giving it
`@decimal` samples and **no `@integer` samples at all**; §Samples states that a missing
sample indicator means no value of that class can satisfy the rule.

Executed over integers 0..10000 (**n=10001**): one 900, few 2700, many 6401, **other 0**,
**0 multi-matches**. RU-PLURAL's "total over the integers" is confirmed, and disjoint too.

**The sharpening: `v` is a property of the display, not of the value.**

| source | 1 | 2 | 5 | 11 | 21 | 102 |
|---|---|---|---|---|---|---|
| `N` | one | few | many | many | one | few |
| `N.0` / `N.00` | other | other | other | other | other | other |

`2,0` is not a fraction and still selects `other`. Any surface formatted to a fixed
decimal place — a rating, an average, a «2,0 ГБ» readout, a percentage with one decimal —
puts **every** count into `other` whatever its magnitude: of one-decimal values
0.0..1000.0, **n=10001, 10001 (100%) select `other`**. RU-FRACTION says "fractions select
`other`"; the rule is wider than that word, and in such a string the `other` branch is
not an edge case, it is the only branch that ever renders.

**Control — the plausible wrong implementation.** A hand-rolled selector doing
RU-PLURAL's prose table as integer modulo on `|n|`, no `v` check (`split.py`):

| probe class | n | disagreements with CLDR |
|---|---|---|
| integers 0..1000 | 1001 | **0 (0.0%)** |
| one-decimal 0.0..1000.0 | 10001 | **10001 (100.0%)** |

It routes those 10001 decimals to many/one/few (6401/900/2700) where CLDR routes all to
`other`: `2,5 → few`, `21,5 → one`. The control is correct on exactly the inputs a
developer would test with and wrong on every input they would not — which is how this
defect ships. **Second control**, `v` guard kept, teen guard dropped: **400 of 10001**
integers wrong, first offenders 11, 12, 13, 14, 111, 112, 113, 114 — the shorthand "ends
in 1, not 11" is `i % 100 != 11`, so **111 is `many`, not `one`**.

## Finding 2 — plural ranges: the hint's premise does not survive the file

`pluralRanges.xml` does give `ru` (group `be lt ru uk`) a complete **16-row** table. But
**0 of the 16 rows override the spec default** — every row's `result` equals its `end`.
§Plural Ranges says the default for an absent pair is `end`, and that a pair appears in
the data where that result **has been verified** for the language. The `ru` table is a
verification record, not an override set. Nor is it the corpus's richest: `ar` has 23
rows, `cy` 20, `ga` 17, `ru` ties `sl` at 16; `ka` is what an override looks like
(`one×other → one`) and `ru` has none. The live hazard is selecting from the **start**:

| range | start cat | end cat | result | Russian |
|---|---|---|---|---|
| 2–5 | few | many | **many** | «2–5 файл**ов**» |
| 1–4 | one | few | few | «1–4 файл**а**» |
| 21–24 | one | few | few | «21–24 файл**а**» |
| 5–21 | many | one | **one** | «5–21 файл» |

A range *ending* at 21 takes the nominative singular — the shape a reviewer is likeliest
to "correct" on sight. The technique never mentions ranges; that is a real gap, but the
rule to add is "the end value decides, and it can be singular", not "consult a table".

## Finding 3 — ordinals: `ru` has no ordinal machinery to get wrong

`ordinals.xml` places `ru` in the **single-category** bucket: one rule, `other`, matching
everything (n=21 samples, 21 pass). Russian ordinals inflect heavily for gender, case and
number, but none of that is *count*-driven, so CLDR exposes no selector. Nothing the
technique says is contradicted; it means an ordinal string has no branch to fill, and its
agreement questions belong to `gender-and-aspect`.

## Finding 4 — compact decimals settle the ambiguity RU-FRACTION leaves open

RU-FRACTION warns that an abbreviated value («тыс.») can make category and display
disagree, and leaves it to the auditor. §Operands decides it: where a compact exponent `c`
is present, `n i f t v w` are computed **after** shifting the decimal point by `c`. Executed:
`12.3c3 → i=12300, v=0 → many`; `1.2c6 → many`; `1.20050c3 → v=2 → other`. So «12,3 тыс.»
selects **many** despite the visible comma — operands come from the shifted value, not glyphs.

## What transfers

1. **Test the `other` branch with a decimal, not a large number** — a `ru` suite that
   probes only integers certifies a selector with no `v` check.
2. **Fixed-decimal formatting collapses the category system** — settle the number format
   before writing branches; one decimal place makes three of the four dead.
3. **For ranges, read the end value** — for `ru` the table is confirmed identity-on-end,
   so the simple rule is the correct one, and start-value intuition is the defect.
