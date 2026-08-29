---
layer: application
type: application
subject: russian
technique: gender-and-aspect
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec — Russian gender as CLDR publishes it, and the half it does not

RU-GENDER and RU-PARTICIPLE treat gender agreement as craft to route around. Part of it is
published data — and one part the technique never mentions: **the numeral itself inflects
for the gender and case of what it counts.** RU-ASPECT has no counterpart at all.

## The pin, the honesty note, the harness

Unicode CLDR **48.2**, tag `release-48-2` — newest non-prerelease; `main` carries 49-alpha
and disagrees on live data. Fetched **2026-08-29** from `raw.githubusercontent.com/
unicode-org/cldr/release-48-2/`: `common/rbnf/ru.xml` (sha256 `e42ce05a22cc3b9c…`,
192 742 B), `common/supplemental/grammaticalFeatures.xml` (`5dbab16f4b42a46c…`) and
`common/main/ru.xml` (`a90f5d3e76d18e00…`). Artifacts: `C:/tmp/rec/w-russian2/`.

**No conformance test ships for this.** `common/testData/` holds seven directories, **none
for RBNF**, and the rulesets carry no `@integer`/`@decimal` samples. Executable rule text,
**no publisher fixture**: everything marked *executed* is a reimplementation and could be
wrong. Finding 3 is file fact; Finding 2's map is a differential, so engine bugs cancel.

`C:/tmp/rec/w-russian2/rbnf.py` (CPython 3.12, no library) implements the descriptors
(`-x`, `x.x`, integer bases) and substitutions (`>>`, `<<`, `=%r=`, `<%r<`, `>%r>`,
`=#,##0=`, `[…]` omission, `$(cardinal,…)$`) of UTS #35 Part 3 §Rule-Based Number
Formatting; integers only. **Validation:** the rule table parsed from the file's CDATA
encoding (**119 rulesets, 1380 rules**) matches its *second, redundant*
`<ruleset>/<rbnfrule>` encoding with **0 row-count differences**;
`digits-ordinal-masculine`(1) renders `1-й`, matching the `ordinalMinimalPairs` frame
«{0}-й перекресток» in `main/ru.xml` (L8528); full sweep **n=198 792, 0 failures**.

## Finding 1 — 3 genders confirmed, 8 case labels but 6 real cases

`grammaticalFeatures.xml` L213–216 declares `ru` `targets="nominal"`: gender **masculine
feminine neuter** — exactly RU-GENDER's «он / она / оно» — and case **nominative genitive
dative accusative instrumental prepositional vocative locative** (L215 narrows units to
six). Cardinals cross **4 genders × 8 case labels = 32 rulesets** (plus 32 ordinal, 32
digits-ordinal): the crossing is **complete**. But two labels are aliases —
`spellout-cardinal-masculine-locative` (L593) is `= …-prepositional` and `…-ablative`
(L700) is `= …-instrumental`. **Executed:** locative≡prepositional and
ablative≡instrumental over 4 genders × 10 013 values, **n=80 104 comparisons, 0
mismatches**. Six cases wearing eight names; `vocative` has none. Two absences:
**animacy is not declared for `ru`** — `pl` (L221) and `hr sr` declare `animate
inanimate`, `ru` does not — so the accusative cardinals are the inanimate paradigm
(1 → «один», 2 → «два», as the nominative) and cannot count people, who need «одного»,
«двух»; and neuter is no oblique gender, `…-neuter-genitive` (L189), `-dative` and
`-instrumental` being one-line masculine aliases.

## Finding 2 — gender changes the numeral at two positions, and nowhere else

The four nominative cardinals (L22, L63, L87, L112) are not four tables: neuter states
`1: одно` then delegates from 2, feminine `1: одна  2: две` from 3, plural `1: одни
2: две`. Every word from 3 up is shared. **Executed** over 0..10000 per case (n=10001):

| case | values differing by gender | forms at 1 | at 2 |
|---|---|---|---|
| nominative | 1800 | один / одно / одна / одни | два / два / две / две |
| accusative | 1800 | один / одно / одну / одни | два / два / две / две |
| genitive | 900 | одного / одного / одной / одних | двух (all) |
| dative | 900 | одному / одному / одной / одним | двум (all) |
| instrumental | 900 | одним / одним / одной / одними | двумя (all) |

The predicate — *gender shows iff the last digit is 1 or 2 and the value is not a teen*
(oblique: iff the last digit is 1) — scored **0 mismatches in five of six cases**; the
sixth is Finding 3. So **82% of integers spell out identically in all four genders**.

**The corollary a UI can act on:** with a units digit of 0 gender never surfaces, because
a multiplier agrees with its own counting noun, not the counted thing — `1000:` in every
ruleset formats the quotient through `%spellout-cardinal-feminine…` (тысяча is feminine),
`1000000:` through the masculine. **Executed:** eight round values from 1000 to 21 000 000
each give **1 form across all four genders** («две тысячи», «двадцать одна тысяча»).

**Controls** (feminine nominative as reference, n=10001 each):

| control — a plausible wrong implementation | wrong | first offenders |
|---|---|---|
| C1 gender applied only when the whole number is 1 or 2 | **1798 (18.0%)** | 21, 22, 31, 32 |
| C2 target gender pushed into the thousands multiplier | **2800 (28.0%)** | 200, 201, 202 |
| C3 units digit 1/2, teen guard dropped | **0 (0.0%)** | — |

C2 is the natural bug — thread a `gender` parameter through the recursion and you get
«двасти» for 200 and «два тысячи» for 2000, wrong on 28% of a four-digit range. C3
**passed**: the `i % 100 != 11` guard the sibling `spec--plural-and-count-agreement`
measured as load-bearing (400/10001 wrong when dropped) is *unnecessary* here — 11 and 12
have no gendered forms. Same guard, opposite verdict, settled by execution.

## Finding 3 — two data defects, one of them found by the predicate test

The prepositional showed **2700** gender-differing values, not 900. The cause is in the
file: `%spellout-cardinal-masculine-prepositional` (L474) carries `20: двадцать[ >>];` and
`30: тридцать[ >>];` at **L497–498** — *nominative* forms — while its own 40–90 rows are
oblique and all three sibling genders spell those rows «двадцати», «тридцати». It renders
«двадцать одном» where the feminine gives «двадцати одной», and propagates to its alias
`…-masculine-locative`. **Executed:** the tens rows of all 24 gender×case cardinal
rulesets were compared; only this one leaves the case — **2000 of 10000 integers (tens
digit 2 or 3) are affected**. Second, `%digits-ordinal-plural` (L2940) emits `=#,##0=`
plus **U+0065 LATIN SMALL LETTER E** (L2942), as does `…-plural-accusative` (L2978),
while sibling `%digits-ordinal-neuter` (L2934) uses **U+0435 CYRILLIC SMALL LETTER IE**
(L2936) and all 28 other suffixes in the family are Cyrillic: the published plural
numeric ordinal is `5-e`, a homoglyph of `5-е` — a Latin island in Cyrillic that breaks
search, collation and spell-check. Both defects are unchanged on `main` on 2026-08-29 and
present in `release-46` and `release-36`: not 48 regressions, both worth an upstream ticket.

## Finding 4 — aspect: not conformance-testable, and that is the finding

All **38** `grammaticalFeatures` entries declare `targets="nominal"`. Grep-scoped over the
three pinned files, `aspect|perfective|imperfective|<verb` returns **0 hits in each**; of
20 files in `common/supplemental/` only `grammaticalFeatures.xml` concerns grammar. CLDR
models nouns, so RU-ASPECT's perfective/imperfective mapping — «Сохранить» vs
«Сохранение…» — has **no counterpart artifact and cannot be conformance-tested**; it stays
craft. RU-GENDER and RU-PARTICIPLE differ: `main/ru.xml` L8537–8539 ships the three
agreement frames («этот / эта / это {0}»), L8529–8536 one per case, and 154 units
carry an explicit `<gender>` (108 masculine, 43 feminine, 3 neuter) — where the noun set
is closed, gender is a **lookup**, not a routing problem.

## What transfers

1. **Gender is a units-digit phenomenon** — probe 1, 2, 21, 22 and a value ending in 0.
2. **Never thread the sentence's gender through the number**: each multiplier fixes its
   own agreement, and C2 is what a formatter that overrides it produces.
3. **Eight case names, six cases, no animacy** — enumerating CLDR's declared values
   over-builds by two and still cannot count people in the accusative (Finding 1).
