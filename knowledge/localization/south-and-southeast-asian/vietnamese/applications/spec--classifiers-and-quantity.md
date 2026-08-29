---
layer: application
type: application
subject: vietnamese
technique: classifiers-and-quantity
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# VI-PLURAL-OTHER against CLDR's own plural data — a split verdict, and an expiry date

The technique opens on a data claim: locale `vi` has "one plural category, `other`,
for both cardinals and ordinals". Read against the published CLDR supplemental data,
that sentence is **half true and dated**. Cardinals: true today, and scheduled to stop
being true. Ordinals: false, and false since 2012.

## Pins

All files fetched 2026-08-29 from `raw.githubusercontent.com/unicode-org/cldr`.

| pin | what | sha256 (prefix) |
| --- | --- | --- |
| `release-48-2` (CLDR 48.2, head `11299982335b`, 2026-03-15) — **latest released** | `common/supplemental/plurals.xml` | `d701d8b4…` |
| same | `common/supplemental/ordinals.xml` | `129bf4aa…` |
| `release-49-alpha1` (prerelease, 2026-08-26) and `main` — byte-identical | `plurals.xml` | `69a30c57…` |
| `main` | `common/main/vi.xml` | `ef90f48b…` |
| Unicode UTS #35 Part 3: Numbers, v48.2, §Language_Plural_Rules → Plural rules syntax (Operands, Samples), §Plural_Ranges | `unicode.org/reports/tr35/tr35-numbers.html` | `43aed410…` |

`release-48` and `release-48-2` carry byte-identical plurals/ordinals, so the point
release does not move the answer. Releases 40–47 were also fetched and checked.

## Cardinals: the technique is right, until CLDR 49

In CLDR 48.2 `vi` sits in the single-category group
`bm bo dz hnj id ig ii in ja jbo jv jw kde kea km ko lkt lo ms my nqo osa root sah ses sg su th to tpi vi wo yo yue zh`,
whose only rule is `count="other"` with an empty condition. Identical in every release
back to 40. **VI-PLURAL-OTHER's cardinal half is confirmed for every shipped CLDR.**

On `main` and in both CLDR 49 alphas, `vi` has been *moved* into the two-category group
`am as bn doi fa gu hi kn kok kok_Latn pcm tg vi zu`, whose singular rule is
`one: i = 0 or n = 1`. The move is commit `069851d38244` (2026-04-12), PR #5569,
ticket **CLDR-14273**, landed *after* the 48.2 head — so it ships in CLDR 49, which as
of today exists only as `release-49-alpha1`. The same commit moves `vi` in
`pluralRanges.xml` out of the other-only range group into the `af an bg en … ur vi`
group (`one–other → other`, `other–one → other`).

So the director's pre-check of `main` was accurate about `main`, and the technique is
accurate about released data. Both were true; the disagreement was a pin, not a fact.

## Ordinals: the claim has never been true

`vi` has carried an ordinal `one` category since **CLDR 21** (2012), where the group was
`fil fr ms ro vi`; from CLDR 24 onward it is the stable pair `one: n = 1` / `other`,
and in 48.2 the group is `bal fil fr ga hy lo mo ms ro tl vi`. There is no release in
which `vi` ordinals had a single category. **The "and ordinals" half of the claim is
refuted outright** — a decade-old error, not a currency lapse.

Vietnamese grammar explains it and the technique already knows the reason without
connecting it: its own closing section names `nhất` as the irregular for 1st. `thứ nhất`,
not `*thứ một` — the ordinal `one` branch exists to hold that suppletion, and CLDR 48.2
carries no locale-level `ordinalMinimalPairs ordinal="one"` for `vi` to exercise it
(only `other`: `Theo lối rẽ thứ {0} bên phải.`). `main` adds the missing one.

## What a `one` branch actually contains in Vietnamese

The commit answers this directly, and it is the finding worth keeping. It adds two
`pluralMinimalPairs` to `common/main/vi.xml`; on `main` today they read:

- `one` — Bạn có {0} mặt hàng trong giỏ hàng; bạn có muốn mua **nó**?
- `other` — Bạn có {0} mặt hàng trong giỏ hàng; bạn có muốn mua **chúng**?

The counted noun `mặt hàng` is **identical in both branches**. The only difference is
the anaphoric pronoun downstream of the count: `nó` (it) versus `chúng` (them). This is
not plural morphology arriving in Vietnamese — the technique's linguistic claim survives
intact. It is a *sentence-level* agreement the plural selector was never used to carry
here, and it only bites in strings long enough to refer back to the thing counted.

Two consequences for a `vi` catalog, both actionable before CLDR 49 ships:

1. **A `one` branch is not "the same text twice."** VI-PLURAL-OTHER's prohibition on
   replicating the source's one/other split with identical text is right for short
   count strings ("{count} tệp") and *wrong* for any string with a back-reference —
   there the branches differ by exactly one pronoun. The technique's advice should
   split on that test, not on the presence of a plural block.
2. **`one` includes zero.** `i = 0 or n = 1` means a count of 0, and every fraction in
   `0.0~1.0`, selects the singular branch. A vi `one` string must read correctly at 0.
   Combined with (1): "bạn có muốn mua nó?" at a count of 0 is wrong copy, so the
   zero case wants an explicit `=0` branch rather than being left to `one` — the same
   trap the bengali subject already documents for `bn`.

## Executed evidence

Harness `plrun.py` (scratch `C:/tmp/rec/w-vietnamese/`): a from-scratch UTS #35
plural-rule evaluator (operands `n i v w f t c e`, `mod`, integer ranges, `and`/`or`,
negation) driven **against CLDR's own `@integer`/`@decimal` sample sets**, with ranges
expanded per §Samples ("start ≤ v ≤ end … same number of decimal places"). Each sample
must be classified into the category that declared it.

Real implementation, 10 runs, **n = 414 samples, 414 pass, 0 fail**:

| run | n | result |
| --- | --- | --- |
| `vi` cardinals 48.2 (`other` only) | 43 | pass |
| `vi` cardinals 49-alpha1 (`one`/`other`) | 61 | pass |
| `vi` ordinals 48.2 / r40 / main | 22 each | pass |
| controls `bn` 61, `en` 44, `ru` 71 (one/few/many/other), `cy` 68 (six categories) | 244 | pass |

Degenerate implementations fail, so the pass is not free: always-`one` scores 0/43 on
`vi` 48.2 and 18/61 on 49-alpha1; always-`other` scores 43/61 on 49-alpha1 (it misses
exactly the 18 zero-and-fraction samples the new `one` rule claims) and 21/22 on `vi`
ordinals, failing only on the integer 1 — which is precisely the one-sample gap a
catalog built on "vi has no plural categories" has been shipping all along.

`cy` at six categories and `ru` at four rule out an evaluator that only understands
two-way splits.

## Could not verify

The CLDR-14273 rationale itself: the ticket lives on the Unicode Jira and the PR body
carries only the ticket ID, so *why* the committee added the category is inferred from
the minimal pairs the commit ships, not read from a stated argument. The `one` sample
set is also declared with `…`, i.e. infinite — the harness tests the published finite
samples, not the whole domain.
