---
layer: application
type: application
subject: indonesian
technique: quantity-and-plurality
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# Spec — one plural category is not one branch

ID-CLDR-OTHER is right about the data and wrong about what the message-format
standard does with it. Indonesian really is a single-category locale, in
cardinals *and* ordinals. But "exactly one branch, `other`" is, in the current
standard, an invalid message — and the stray `one` branch it warns about is
inert, not a defect.

**Pin.** Unicode Consortium, **CLDR release-48-2** (2026-03-17, latest
non-prerelease tag), `common/supplemental/plurals.xml` (26 048 B, sha256
`d701d8b4…d727d`), `ordinals.xml` (10 751 B, sha256 `129bf4aa…9880a`) and
`supplementalMetadata.xml`, retrieved 2026-08-29 from
`raw.githubusercontent.com/unicode-org/cldr/release-48-2/`, licence
`Unicode-3.0`; both plural files are byte-identical to `release-48`
(2025-10-29), so this is CLDR 48's answer, not a point release's. Standard:
**UTS #35 (LDML) Part 9: MessageFormat, version 48.2**, stable,
`https://www.unicode.org/reports/tr35/tr35-messageFormat.html`, retrieved
2026-08-29 (321 613 B, sha256 `afb7131c…19ad`). Reference implementation:
**ICU4J 78.3** (`com.ibm.icu:icu4j:78.3`, Maven Central, sha256
`e962c175…edb25`), reporting `CLDR 48.0.0.0` at runtime.

**Harness.** (1) A dependency-free Python 3.12 evaluator of the LDML
plural-rule grammar (operands `n i v w f t c/e`, `=`, `!=`, `%`, ranges,
`and`/`or`) run over **every** `@integer`/`@decimal` sample CLDR publishes in
both files: **3 863 samples, 65 rulesets, 0 mismatches**. Negative control:
swapping it for a constant `other` fails **1 794 of the same 3 863** — Czech
(47 samples, 4 categories) and Arabic (112, 6) are in the set, so a
trivially-`other` implementation cannot pass. (2) Java 22 + ICU4J 78.3 over
fixture messages in both message-format generations.

## Confirmed: `id` is other-only — but the ordinal caveat is not vacuous

`plurals.xml` line 16 puts `id` in the file's first ruleset, commented `1:
other` (line 14): 35 locales, one unconditioned `<pluralRule count="other">`.
`ordinals.xml` line 16 puts `id` in *its* first ruleset, also `1: other`, 68
locales, likewise unconditioned. Harness: `id` cardinal 43/43 samples →
`other`, ordinal 21/21 → `other`; ICU4J agrees at runtime, with
`PluralRules.forLocale(id).getKeywords()` and the same call under
`PluralType.ORDINAL` both returning `[other]`.

The technique's parenthetical — *distinguish cardinals from ordinals* — is
confirmed, and confirmed as **necessary**, not a formality: the two files are
independent, 18 locales here have more ordinal categories than cardinal ones,
and one of them, **Lao (`lo`), sits in the same 35-locale cardinal ruleset as
`id`** while carrying `one`/`other` ordinals. Membership in the other-only
cardinal cohort predicts nothing about ordinals; Czech runs the other way
(one/few/many/other cardinal, other-only ordinal).

## The sharp finding: the mandatory branch is `*`, and it is not `other`

Part 9's *Matcher* section lists four data-model errors a valid message must
avoid; the governing one is **Missing Fallback Variant** — at least one variant
must have all its keys equal to the catch-all key `*`. `other` is an ordinary
literal key: it matches when rule selection returns the keyword `other`, but it
does **not** satisfy the fallback requirement. Against ICU4J:

```
.input {$count :number}
.match $count
one   {{ONE-BRANCH {$count}}}
other {{OTHER-BRANCH {$count}}}
→ IllegalArgumentException at build time:
  "There must be one variant with all the keys being '*'"
```

A *single*-branch Indonesian message keyed `other` fails identically; the
correct minimal `id` message is `* {{…}}`, which formatted cleanly at every
count tested. Older ICU MessageFormat (the `{count, plural, …}` generation)
inverts the vocabulary: there the mandatory keyword *is* `other`, and omitting
it throws `Missing 'other' keyword in plural pattern`. Both demand a catch-all
and disagree on its spelling; the technique states only the older one.

## Refuted: a stray `one` branch is inert, in both generations

"Dead weight at best and a skeleton defect at worst" has no support in the
standard. *Rule Selection* states outright that the rules for a given locale
might not produce all of the keywords, and no error class covers an unreachable
key — the four data-model errors are variant-key count, missing fallback,
missing selector annotation, duplicate variant. A `one` variant in an `id`
message violates none. Measured:

| generation | message | locale | counts 0,1,2,5,11,100 |
| --- | --- | --- | --- |
| MF2 | `one {{…}}` + `* {{…}}` | `id` | `*` branch, 6/6 |
| MF2 | same | `cs` (control) | `one` at 1, `*` otherwise |
| MF1 | `one {…} other {…}` | `id` | `other` branch, 6/6 |
| MF1 | same | `cs` (control) | `one` at 1, `other` at 3 |

The stray branch never renders and never errors: dead weight and a reviewer
trap, and the rule should say that and stop. Read against
[the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable),
keeping it is even the *conservative* move — dropping a branch the source
carried changes the syntax-keyword set, which is what a strict skeleton
comparator exists to flag. Neither choice is a runtime defect.

**Exact-value keys survive a one-category locale.** Rule selection ranks an
exact key above a rule-matched keyword above `*`, so
`{count, plural, =1 {EXACT-1} other {OTHER-BRANCH #}}` for `id` returned
`EXACT-1` at 1 and `OTHER-BRANCH 2` at 2. One plural category does **not** mean
one wording: copy that genuinely wants a count-1 phrasing (`Hapus berkas ini` vs
`Hapus {count} berkas`) has a sanctioned way to get it that invents no
grammatical contrast — a mechanism the technique conflates with the `one`
category.

## The legacy `in` code: aliased, dangerous only outside CLDR

CLDR carries `<languageAlias type="in" replacement="id" reason="deprecated"/>`
(`supplementalMetadata.xml` line 57) *and* lists `in` beside `id` in both plural
rulesets, so selection is identical either way — MF2 with locale `in` gave the
`*` branch, and `ULocale.canonicalize("in")` returns `id`. The hazard is one
layer up, in catalog lookup: on JDK 22 `new Locale("in").getLanguage()` returns
`id`, but with `-Djava.locale.useOldISOCodes=true` — the *default* before JDK 17
— `new Locale("id").getLanguage()` returns **`in`**, so a resource path built
from `getLanguage()` looks for `in/` and misses an `id/` catalog. Grep a catalog
for an `in` directory as a stale-runtime signal; the rules are right regardless.

**Could not verify.** Whether any shipping i18n runtime lints an unreachable
variant key (ICU does not; third-party linters are out of scope for class B).
Terms read before fetching — data under Unicode-3.0, reports for internal use —
so spec clauses above are paraphrased, quotation limited to two error strings.
