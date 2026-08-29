---
layer: application
type: application
subject: spanish
technique: plural-and-gender-agreement
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spanish plural and gender agreement against CLDR

**Pin.** Unicode CLDR, tag `release-48-2` (CLDR 48.2, released 2026-03-17; commit
`11299982335beb974c1c63c45265184e759c0f41`) — a *released* maintenance version, not
`main`, a CLDR 49 prerelease. Fetched 2026-08-29 from
`raw.githubusercontent.com/unicode-org/cldr/release-48-2/`:
`common/supplemental/plurals.xml` (sha256 `d701d8b4…`), `ordinals.xml` (`129bf4aa…`),
`pluralRanges.xml` (`42c82db9…`), `common/rbnf/es.xml`, `grammaticalFeatures.xml`,
`docs/ldml/tr35-numbers.md` (UTS #35 Part 3: Numbers) §§ *Language Plural Rules*,
*Operands*, *Plural Ranges*. Artifacts and harness in scratch.

**Harness.** `es_plural.py`: operands (`n i v w f t c`) built from the spec's
*Plural Operand Meanings* table, including that `n,i,f,t,v,w` are computed **after**
shifting the decimal point by the compact exponent `c`; the `es` expressions
transcribed verbatim from `plurals.xml`, evaluated with the spec's precedence (`and`
binds tighter than `or`). Validated against CLDR's own `@integer`/`@decimal` sample
sets for `es`, ranges expanded: **n = 72 (one 5, many 13, other 54), 0 mismatches.**
Rule-overlap scan over n = 2,000,041 values: 0 overlaps.

## ES-PLURAL-CLDR — confirmed, with the fractional consequence the rule decides

The `one` rule for `es` is literally `n = 1`, with decimal samples `1.0, 1.00,
1.000, 1.0000`. The technique's "including 1.0" holds, for the reason worth
knowing: `n` is the absolute *value*, so trailing zeros cannot move a count out of
`one` (`v` is not consulted). Two categories and zero-is-plural: confirmed (`0`
sits in the `other` sample set). **What the technique does not say:** the rule is
equality with 1, not "rounds to 1", so **every non-integral count is `other`** —
verified `0.5 -> other`, `1.5 -> other`, and CLDR's own `other` decimals run
`0.0~0.9, 1.1~1.6`. That is correct Spanish (*1,5 puntos*) and an editorial
constraint: any string that can take a decimal count needs an `other` branch that
reads with a fraction in front of it. A branch written for "two or more" breaks.

## ES-PLURAL-MANY — the category is confirmed; "millions" is the wrong summary

The `many` rule is `e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5`,
which the spec's own precedence example parses as `(c = 0 and i != 0 and
i % 1000000 = 0 and v = 0) or (c != 0..5)`. The technique's "compact large numbers
(10⁶ and up)" is **half the rule** and conflates two conditions. Measured (probe
set, n = 21, classified by the sample-validated implementation):

| source | category | why |
| --- | --- | --- |
| `1000000`, `2000000` (plain) | **many** | first disjunct: no exponent, exact million, no visible decimals |
| `1500000`, `2500000`, `12300000` (plain) | **other** | `i % 1000000 != 0` |
| `1000000.0` (plain) | **other** | `v = 1` kills the first disjunct |
| `1c6`, `1.1c6`, `2.5c6`, `12.3c6` | **many** | second disjunct: `c >= 6` |
| `1.5c3`, `123c5` | **other** | `c` in `0..5`, and the shifted integer is not a round million |

Two sub-claims the technique should carry. First, **`many` fires for plain numbers
too**: `2.000.000` selects `many` with no compact formatting in the stack. Second,
and sharper: **the same quantity lands in different categories depending on the
notation the formatter chose** — 2,500,000 is `other` in full, `many` compact. Not
a quirk but the grammar the category carries: the numeral takes the noun
*millón/millones*, and so attaches its own noun with *de*, only when the spelled
form ends in it. `common/rbnf/es.xml` marks that boundary — `1000000: un millón[
>>]`, `2000000: <…< millones[ >>]`, remainder in an optional bracket — so
`2.500.000` spells as *dos millones quinientos mil* and takes no *de*. The
technique's *"2,5 millones de descargas"* is right for the compact form and wrong
applied to `2.500.000 descargas`.

## Plural ranges — the technique is silent, and the default is not the end value

`pluralRanges.xml` gives `ca es` its own three-row table: `(one, other) -> other`,
`(other, one) -> other`, `(other, other) -> other`. UTS #35 Part 3 *Plural Ranges*
states that when a `<start, end>` pair is absent the default result is the **end**
value. So the mechanism is a **(start, end)** lookup that falls back to the end
value only on a miss — not pluralization on the end number. The `(other, one)` row
is a genuine **override of that default**: a range ending at exactly 1 is plural in
Spanish. Measured over n = 7 range cases, 2 diverge from the naive end-value
control — `0–1` and `0,5–1` select `other` (*0–1 archivos*) where the control says
`one` (*0–1 archivo*). `many` rows are absent, so `1–1000000` and
`1000000–2000000` fall back to the end value, `many`. A UI that pluralizes a range
on its end number is wrong for `es` on exactly the common "0–1 results" shape.

## ES-ORDINAL — confirmed, and CLDR carries two forms the technique omits

`ordinals.xml` puts `es` in a 68-locale group whose only rule is `other`: single
category, confirmed. The gendered dotted abbreviations are in CLDR too, under
`OrdinalRules` in `common/rbnf/es.xml`, matching the technique exactly:
`%digits-ordinal-masculine` = `=#,##0=.º`, `%digits-ordinal-feminine` = `=#,##0=.ª`
(period before the superscript), unqualified `%digits-ordinal` delegating to
masculine. Two forms the technique should add: **plural** abbreviations `.ᵒˢ` /
`.ᵃˢ`, and the **apocopated masculine adjective** — `%%dord-mascabbrev` returns
`ᵉʳ` at 1 and 3, `º` elsewhere, i.e. *1.ᵉʳ*, *3.ᵉʳ* before a masculine noun (*el
1.er intento*, not *1.º intento*), a defect the rule misses today.

## Gender — mostly not conformance-testable, with one measurable exception

CLDR's plural data says nothing about ES-GENDER-PLACEHOLDER or ES-GENDER-UNKNOWN:
the resolution ladder and the generic-masculine policy are message-design and
editorial rules with no conformance artifact here. **Fate: not conformance-testable
against this counterpart** — recorded, not stretched. One narrow exception is
measurable. `grammaticalFeatures.xml` declares `es` (with `ca fr it pt`) as
carrying `grammaticalGender` values `masculine feminine` for nominal targets, and
`common/rbnf/es.xml` has paired cardinal rulesets differing at exactly three
places: `1` (*un*/*una*), `21` (*veintiún*/*veintiuna*), and the hundreds
`200`–`900` (*doscientos*/*doscientas*). The **number word itself agrees
with the counted noun** — *una plantilla*, *doscientas plantillas* — which the
technique never says. And the feminine ruleset reverts to the masculine multiplier
at `2000000: <%spellout-cardinal-masculine< millones`: past a million the head noun
is *millones*, so agreement stops tracking the counted noun (*dos millones de
plantillas*) — gender and the `many` category are one fact seen twice.

## Controls (each must fail, and does; probe n = 21)

- **C1, two-branch selector** (`one` if `n = 1` else `other`), the pre-CLDR-42
  pipeline: 7/21 wrong — every `many` value.
- **C2, magnitude-only `many`** (`n >= 1000000`), the technique's likely reading:
  5/21 wrong — `1500000`, `2500000`, `1000000.0` predicted `many`, really `other`.
- **C3, exponent-blind** (expand compact notation, then apply the integer test):
  3/21 wrong on `1.1c6`, `2.5c6`, `12.3c6`; the exponent does not reduce away.
- **C4, ranges by end value**: 2/7 wrong, as above.

**What this run does not establish.** The *de* attachment is not a CLDR field —
CLDR gives the category boundary, and *de* is the rule that boundary tracks. Which
compact exponent a formatter picks is decided elsewhere in the standard. And `one`
and `many` overlap for compact sources with a mantissa below 1 (`0.000001c6` hits
both): the spec's mutual-exclusivity requirement holds only over well-formed
renderings — 0 overlaps across the 2,000,041 ordinary values scanned.
