---
layer: application
type: application
subject: arabic
technique: plural-and-count-agreement
stack: spec
source: unicode-org/cldr@48.2
status: forged
verified_on: 2026-08-29
---

# AR-PLURAL-SIX against the published CLDR rule set (CLDR 48.2)

## The pin

Publisher: Unicode, Inc. Document: Common Locale Data Repository, release **48.2**
(released 2026-03-17; the newest release directory carrying data — `49/` exists but
holds only a README). Artifact: `cldr-common-48.2.zip` from
`https://unicode.org/Public/cldr/48.2/`, retrieved **2026-08-29**, SHA-512
`de8660f5371e0fcf…4791fa62`. Cited files inside it: `common/supplemental/plurals.xml`,
`ordinals.xml`, `pluralRanges.xml`. Normative prose: **UTS #35 (LDML) Part 3: Numbers**,
version 48.2, `https://www.unicode.org/reports/tr35/tr35-numbers.html`, sections
*Language Plural Rules* (anchor `Language_Plural_Rules`, subsection *Relations*) and
*Plural Ranges* (anchor `Plural_Ranges`), same retrieval date. Note for a re-checker: the
release's own `hashes/SHASUM512.txt` lists a hash for `cldr-common-48.2.zip` that does not
match the file it serves — the digest above is the one it actually hashes to, and the one
the manifest attributes to the byte-identical `core.zip`.

## AR-PLURAL-SIX is confirmed, condition by condition

`plurals.xml` lines 241–248 give one block, `locales="ar ars"`, with exactly six
`pluralRule` elements and these conditions: `n = 0` (zero, 242), `n = 1` (one, 243),
`n = 2` (two, 244), `n % 100 = 3..10` (few, 245), `n % 100 = 11..99` (many, 246), and an
empty condition for other (247). That is the technique's table with no residue: same six
categories, same conditions, same modulus, in the same order.

**Executed evidence.** CLDR ships its own conformance data inside each rule as `@integer`
and `@decimal` sample sets. `harness.py` (worker scratch) parses the block, compiles the
published expressions per the spec's *Relations* rules, expands the sample ranges, and
classifies each sample. **n = 112 samples (58 integer, 54 decimal); 112 agree, 0
disagree.** Two further sweeps by the same compiled rules: over the integers 0..10000, no
value matches more than one non-`other` condition (the set partitions), and the
technique's table as written in the markdown selects the same category as CLDR for all
10,001 (0 mismatches).

The census of that sweep is itself useful: `many` takes **8,900** of the first 10,001
integers, `few` 800, `other` 298, and zero/one/two one each. The technique's claim that
`many` "flips back to the singular" therefore governs 89% of the count range, not an edge.

## Sharpening: a fractional count is never few or many

The spec's *Relations* subsection states that a range `a..b` is equivalent to listing the
**integers** between a and b, and its own worked table gives `3.5 = 2..4, 15` → false.
Because `ar` uses only the operand `n` (the absolute source value, decimals included), the
consequence is total: any count with a fractional part falls out of both range conditions
and lands in `other`. Verified with the compiled rules over the 18,000 values `x.1`–`x.9`
for x in 0..1999: **0** select anything but `other`. CLDR's own `@decimal` samples say the
same from the other side — `few` lists only `3.0 … 1003.0`, while `other` carries
`0.1~0.9, 1.1~1.7, 10.1`.

The technique's table reads "n % 100 in 3–10", which a hand implementation in a language
with float modulo will happily satisfy at 3.5 and emit the plural-noun branch. The rule
to add where counts can be fractional (ratings, averages, measurements, prices): **only
0, 1 and 2 exactly, and integers, ever leave `other`** — everything with a decimal part is
`other`, and the `other` string must therefore read correctly with a fractional numeral.

## Ordinals are a separate file, and for `ar` they are a singleton

`ordinals.xml` line 16 puts `ar` in a 68-locale block whose only rule (line 17) is
`count="other"` with an empty condition. Arabic has **one** ordinal plural category. Its
21 published samples all classify as `other` under the same harness (21/21).

This is where the subject's claims need a boundary they do not currently carry.
AR-PLURAL-SIX is a statement about **cardinals only**; AR-COUNT-NOUN names "ordinal
phrases" in the same breath as classical agreement without saying that CLDR offers no
ordinal machinery to hang it on. Concretely: a `selectordinal` block written with six `ar`
branches is dead code in five of them — of the integers 0..10000, **9,703** would be
routed by the cardinal table to a category the ordinal rule never selects. Ordinal
agreement in Arabic has to be carried lexically inside the string; the format cannot
select it.

## Plural ranges: the technique is silent, and one row is counterintuitive

`pluralRanges.xml` lines 228–252 give `locales="ar"` its own 23-row table mapping a
(start, end) category pair to the category a range like "2–5 items" must use. Per the
spec's *Plural Ranges* section, a pair absent from the data defaults to the **end**
category, and five of the 23 published rows exist precisely because they override that
default:

| start + end | result | default would have been |
|---|---|---|
| zero + one | zero | one |
| zero + two | zero | two |
| **one + two** | **other** | two |
| other + one | other | one |
| other + two | other | two |

`one + two → other` (line 234) is the one to write down: a range spanning 1 to 2 does
**not** take the dual, even though its end value alone would. A translator applying
AR-PLURAL-SIX to "1–2 items" reaches for كتابان and is wrong. Line 244, `many + few →
few`, is the modulo showing up again — 15–103 starts in `many` and ends in `few`.

The technique does not mention plural ranges at all. That is a gap, not a defect: nothing
it says is contradicted. The spec also fixes the domain — the data presumes start is
strictly less than end and no value is negative; anything else is undefined.

## Sublocales: none of them can differ

CLDR keys plural rules on the **language** subtag. Neither `plurals.xml`, `ordinals.xml`
nor `pluralRanges.xml` carries a single region-qualified Arabic entry (the only
region-qualified entries anywhere in the three files are `pt_PT` and `kok_Latn`). Release
48.2 ships `ar.xml` plus **28** `ar_*` region locales (`ar_EG`, `ar_MA`, `ar_SA`, …); every
one of them inherits the block above, and no region can be given a different rule without
a change upstream. One asymmetry worth knowing: `ars` (Najdi) shares the **cardinal** rules
(line 241) but has no `pluralRanges` row of its own, so range selection for it falls back
to the spec default rather than to `ar`'s verified table.

## What the standard does not confirm

CLDR assigns categories; it says nothing about morphology. The technique's load-bearing
grammar claims — that `two` is the dual, that `few` takes the plural noun and `many` the
singular — are not testable here and are not confirmed by this document. What the standard
does corroborate is AR-PLURAL-FREEZE's structure: a runtime offering only one/other maps
**9,702** of the first 10,001 integers to a category CLDR distinguishes and it cannot
express. It also supplies a number the technique's ranked mitigations lacked — if exactly
one noun form must serve, the singular is the right bet, because one + many + other
account for 9,199 of those 10,001 values.
