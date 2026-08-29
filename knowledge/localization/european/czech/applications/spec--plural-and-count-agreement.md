---
layer: application
type: application
subject: czech
technique: plural-and-count-agreement
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec · The published cs plural rules, read against the technique

## The pin

Unicode CLDR **release-48-2** — tag object `fc1fd058cc6f`, commit `11299982335b`,
tagged 2026-03-16 — the newest non-prerelease at retrieval. Fetched 2026-08-29 from
`https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/{plurals,ordinals,pluralRanges}.xml`,
sha256 `d701d8b461afd2ba`, `129bf4aa6f41d479`, `42c82db9baaa8667`; `common/main/cs.xml`
sha256 `151aa6e1d2e24c75`. All three supplemental files are byte-identical to
release-48 (`cmp`, 2026-08-29), so nothing below rests on a maintenance release.
Normative prose: UTS #35 Part 3: Numbers, **version 48.2**,
`https://www.unicode.org/reports/tr35/tr35-numbers.html`, sections *Operands*,
*Plural Ranges*, *Compact Number Formats*, retrieved 2026-08-29. Artifacts and
harnesses in `C:/tmp/rec/w-czech/`. Not `main`, which carries unreleased data.

## What the published rule says

`plurals.xml:162-167` gives cs one rule block, shared with sk:

| category | condition | published samples |
|---|---|---|
| `one` | `i = 1 and v = 0` | @integer 1 |
| `few` | `i = 2..4 and v = 0` | @integer 2~4 |
| `many` | `v != 0` | @decimal 0.0~1.5, 10.0, 100.0, … 1000000.0 |
| `other` | (empty — the fallback) | @integer 0, 5~19, 100, … 1000000 |

`v` is defined as "the number of visible fraction digits in N, with trailing zeros"
(§Operands). So cs `many` is not a magnitude category **and it is not the set of
non-integer values either** — it is the set of numbers *rendered with at least one
fraction digit*. Membership is a property of the representation, not the quantity.
The sample sets say so without help: `many` holds 1.0, 10.0 and 1000000.0, and
`other` carries **no @decimal samples at all**. `1000000,0` is `many`; `1000000` is
`other`; nothing decimal is ever `one` or `few`.

The technique states the shape correctly ("`many` is the **decimal** category, not a
large-number category", and "1,0 selects `many`"), so the trap it was sent to test
was already sprung. Its summary table is where the imprecision sits: the `When`
cell reads "any non-integer", which is the value-based reading the rule does not
make, and the two statements sit four lines apart.

## Executed evidence

`cs_plural.py` transcribes the four expressions against the §Operands definitions
(`n i v w f t c e`), expands CLDR's own sample lists (`a~b` stepped by 10^-v) and
scores each implementation against the category the file assigns. Python 3.12.

| implementation | n | fails |
|---|---|---|
| the published cs rule, transcribed | 47 | **0** |
| CONTROL A — `many` read as large quantity (`v = 0 and i >= 5`) | 47 | 42 |
| CONTROL B — `many` read as "any non-integer" (`n != floor(n)`) | 47 | 8 |
| the published cs ordinal rule (`other` only) | 21 | **0** |

Control A is the mis-transfer the keyword invites, and it is not a near miss: it
loses all 22 `many` decimals and 20 of the 21 `other` integers. Control B is the
one a careful reader would ship — it agrees on 0,5 and 1,5 and on every integer —
and it fails on exactly the eight integer-valued decimals in the sample set
(0.0, 1.0, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0). A Czech `many`
string must therefore read correctly beside *1,0* as well as beside *1,5*, which
rules out any wording that presumes a fraction ("*a půl*", "*něco přes*").

Cross-check against the publisher's own reference implementation (ICU 78.2 /
CLDR 48.0, via Node 24.14.0, `icu_check.js`): 17 cardinal literals, 0 mismatches;
ordinal categories over {1,2,3,4,5,7,11,15,21,101} = {`other`}.

The operational consequence, executed: with `minimumFractionDigits: 2`, **9 of 9**
probe counts (0,1,2,3,4,5,19,100,1000000) select `many`; `one` and `few` become
unreachable. Whether a Czech branch is reachable is decided by the formatter's
precision settings, not by the data — so the technique's "`many` when non-integers
are possible" is better stated as "`many` whenever the formatter can emit a
fraction digit", and a currency or measure surface needs `many` even if every
underlying count is a whole number.

## Plural ranges — measured, and the expected answer does not hold

`pluralRanges.xml:149-164` gives cs (grouped with pl and sk) 14 `(start, end) ->
result` rows. §Plural Ranges: where no row exists the default result is the **end**
category, and rows are written into the data where the result has been verified.

Measured with `cs_ranges.py`: **0 of the 14 rows override the default.** Every row's
result equals its end category, so the table and a plain end-only selector disagree
on nothing. The two absent pairs are `(one,one)` and `(few,one)`; a brute-force
search over a 14-literal grid finds no start<end witness for either, so the table is
complete over every attainable pair. This is a fact about cs and not about the file:
11 of the 22 locale groups in the same document carry at least one override. ICU's
`selectRange` agrees with all 14 rows (n=14, 0 mismatches).

Read the right way round, the value of the table is that it is *verified*, not that
it is surprising: for cs a range takes the end value's branch — *1–5* → `other`,
*2–4* → `few`, *1–1,5* → `many`, *0,5–1* → `one`. That last row is the one that
looks like a bug and is not, and it is only reachable at all because `many` is
representation-defined. The technique does not mention ranges anywhere.

## Ordinals

`ordinals.xml:16-18` places cs in a 68-locale group whose sole rule is `other`
(@integer 0~15, 100 … 1000000). The technique's "ordinals need no selector at all"
is the published position, with one caveat it omits: the invariance is in the
*category set*, so a cs `selectordinal` legitimately has one branch — deleting the
construct outright is a skeleton break, not a simplification.

## Compact notation moves the same quantity to another category

§Compact Number Formats selects the compact pattern's `count` from N', the value
after division by the pattern's magnitude and after precision is applied — the spec
flags this explicitly ("may [make a difference] for other locales"). `cs.xml` long
compact carries all four forms for 1000000: `one` *0 milion*, `few` *0 miliony*,
`many` *0 milionu*, `other` *0 milionů*. Executed: ICU renders 1000000 as
*1 milion*, 2000000 as *2 miliony*, 1500000 as *1,5 milionu* — while
`PluralRules('cs').select()` on those same quantities returns `other` for all three.
One quantity, two categories, both correct. A Czech string that pairs a compact
number with its own plural block will disagree with the number beside it.

## Fates

`many`-is-fractional: **confirmed**, and already in the technique's prose — the
summary table's "any non-integer" is the residue. Ranges: **refuted** — the cs group
overrides nothing, the end-only shortcut is conformant, and the finding is that this
was verified rather than assumed. Ordinals: **confirmed**.
