---
layer: application
type: application
subject: korean
technique: counting-and-quantity
stack: spec
source: unicode-org/cldr@release-48-2
status: forged
verified_on: 2026-08-29
---

# The locale-data spell-out rulesets, read against the counting anchors

The technique treats Korean quantity as "one plural branch, and the hard part is the counter".
The locale-data consortium agrees so completely that it puts **no** counting machinery in the
plural file and eighteen rulesets of it in the number-spelling file. Reading those confirms four
anchors and refutes two sentences — both about the thing the technique never names: the
**attributive** native numeral, the form a counter takes.

## The pin

Common Locale Data Repository, release **48.2** (tag `release-48-2`, tagged 2026-03-16,
commit `11299982335beb974c1c63c45265184e759c0f41`). Not `main`: the survey tree
disagrees with released data. Fetched from `raw.githubusercontent.com` at that commit,
retrieved 2026-08-29 — `common/rbnf/ko.xml` (sha256 `8014a5b6…5445d147`), `common/main/ko.xml`
(`d2f0deac…07edde56`), supplemental `plurals.xml` (`d701d8b4…c69d727d`), `ordinals.xml`
(`129bf4aa…fb49880`), `pluralRanges.xml` (`42c82db9…cef5dc0f`), `grammaticalFeatures.xml`
(`5dbab16f…891528107`). Rules are cited by ruleset and rule base from the canonical
`<rbnfRules>` CDATA block, not the deprecated `<ruleset>` elements the same file still
carries; line numbers are for the released `common/rbnf/ko.xml`.

## Does a conformance test ship? No — and here is what was used instead

**No ruleset-output test file exists.** `common/testData/` at this release holds seven
directories (datetime, localeIdentifiers, messageFormat, personNameTest, segmentation,
transforms, units), none for number spelling, and the rulesets carry no sample sets of their
own. The *plural* data is a different class: `ko`'s cardinal and ordinal rules each ship
`@integer`/`@decimal` samples, so that claim is testable against published cases.

So an interpreter for the published rule syntax was written from the rule text — numeric bases,
radix-10 divisors, `<<`/`>>` quotient and remainder substitutions, named `<%rs<`/`>%rs>`/`=%rs=`
substitutions, `[optional]` brackets omitted on an exact multiple — integers only (`-x` and
`x.x` descriptors parsed, not exercised). It was scored against the consortium's own reference
implementation, ICU4J 78.3 (`icu4j-78.3.jar`, sha256 `e962c175…9e0edb25`, Maven Central,
retrieved 2026-08-29), over **6 public rulesets × (0…1000 plus five larger values) = 6030
cases: 6030/6030 identical** — which also shows the rule text at 48.2 and the data ICU 78.3
embeds do not differ here. Three degenerate controls, each a mistake a careful reader could
make, over the same 6030 cases:

| control | what it gets wrong | agreement |
| --- | --- | --- |
| A: route `번째` through `spellout-cardinal-native`, not the attributive ruleset | the finding below | 5795/6030 |
| B: divisor = the rule's base value, not the highest power of ten ≤ it | compound numbers | 879/6030 |
| C: `[optional]` text always emitted | exact multiples (`십영`) | 5533/6030 |

## The attributive ruleset, and the two sentences it refutes

`ko.xml` ships three cardinal spell-outs: `%spellout-cardinal-sinokorean` (line 24: 일, 이,
삼), `%spellout-cardinal-native` (line 82: 하나, 둘, 셋), and
`%spellout-cardinal-native-attributive` (line 49: **한, 두, 세, 네**, with 스무 at base 20
against 스물 at base 21). Over 1–99 the native and attributive rulesets differ at **46 of
99** values.

KO-NUM-UNIT names native numerals as `(하나, 둘, 세…)` — a list that silently mixes the two
paradigms, since 세 is the attributive of 셋, not a member of the 하나/둘 series. The
alternation is never stated, and in a technique about counting that is a gap: **the attributive
is the form a counter actually takes** — the technique's own 손님 두 분 and 세 개 both use it.

KO-PLURAL-OTHER goes further and gets it wrong: it says idiomatic ordinals "prefer 첫/둘/셋
stems: 첫 번째". `%spellout-ordinal-native-count` (line 174) is `=…-count-smaller= 번째`, and
that private ruleset (line 178) is 첫 at 1 and **delegates to the attributive ruleset from 2
up**. Reference-implementation output: 1 → 첫 번째, 2 → **두** 번째, 3 → **세** 번째, 13 →
열세 번째, 23 → 스물세 번째. 둘 번째 and 셋 번째 are what control A produces; they are not
the data's answer.

**And the alternation is conditioned on what follows, not on a fixed table.** The 째 series
keeps a different stem set: `%spellout-ordinal-native` (line 208) runs through `-priv` (line
212: 첫, **둘**) into `-smaller` (line 217: 한, 두, **셋**, **넷**). So 둘째/셋째/넷째 but
두 번째/세 번째/네 번째 — 하나 and 둘 alternate before both morphemes, 셋 and 넷 only before
번째. Over 1–99 the two stem series differ at **21 of 99** values ({2} plus every n ending in
3 or 4 from 13 up), and a private `-smaller-x02` ruleset (line 248) exists solely to restore
둘 in the hundreds residue: 102 → 백둘째 but 백두 번째. A flat 하나→한 / 둘→두 / 셋→세 /
넷→네 lookup table — what the technique's sentence invites — is wrong on all 21.

## "Always Sino-Korean" is refuted for the counter the technique names

KO-NUM-UNIT ends: with `{count}`, always assume Arabic numerals and Sino-Korean readings.
The Arabic-numeral half is confirmed below; the Sino-Korean half is not. `ko.xml` ships
**two** ordinal-count rulesets for the *same* counter 번째, and the one named for
Sino-Korean is native below 50: `%%spellout-ordinal-sinokorean-count-smaller` (line 131) is
한, 두, 세, 네 … 마흔, switching to the Sino ruleset only at base 50 (line 147). Measured
over 1–99, `spellout-ordinal-sinokorean-count` and `spellout-ordinal-native-count` are
**identical for 1–49 and differ at all 50 values from 50 up**: 3 → 세 번째 in both; 50 →
오십 번째 against 쉰 번째. The data encodes the boundary as a *magnitude* threshold inside
one counter and leaves the native/Sino choice to the caller — it never maps a counter to a
system. "Always Sino" would render 3번째 as 삼 번째, which no ruleset here produces. A second magnitude
fact runs the other way: standalone native cardinals stop at 99 (`%spellout-cardinal-native`
base 100 delegates wholly to Sino) while the attributive keeps native residues to 10^18.

## Confirmed: one category, and closed attachment

- **KO-PLURAL-OTHER holds in the data.** `ko` sits in the one-category cardinal and ordinal
  groups; `pluralRanges.xml` gives it other+other→other; `grammaticalFeatures.xml` lists it
  in a group with no nominal features. In `main/ko.xml`, **929 of 929** count-qualified
  elements are `count="other"` — `count="one|two|few|many|zero"` returns zero hits.
- **But the plural samples cannot catch a wrong rule.** Classifying `ko`'s own published samples
  (cardinal n=43, ordinal n=21) with the published rule scores 43/43 and 21/21 — and so do three
  wrong rules, at 42/43, 41/43 and 40/43. The same harness scores the `ko` rule at 22/71 on
  Russian's samples and 42/112 on Arabic's, so it discriminates; `ko`'s sample set cannot. **A
  single plural category is not "no quantity machinery"** — the machinery moved into eleven
  public rulesets, none of them testable from the plural file.
- **KO-NUM-UNIT's attachment rule is confirmed twice over.** Shipped `ko` patterns close the
  counter onto the digits and space the next word: `{0}일` (`main/ko.xml` line 9391, short unit
  length), `{0}일 전` / `{0}일 후` (lines 4012, 4009), `{0}개월` (line 9381). And `%digits-ordinal`
  (line 510) is `=#,##0=번째` — **no space** with digits, against the spelled-out 두 번째 **with**
  one: exactly the numeral-vs-word split the technique asserts.
- **KO-COUNTER's numeral-first shape ships, with the technique's own example.** `main/ko.xml`
  line 9271, unit `concentr-item`: `{0}개 항목` — 개 as the generic counter, before the noun
  항목. The noun-first shape (항목 3개) the technique prefers for dashboards has no
  counterpart here; that preference is house convention, not data.

## Not conformance-testable, and not verified

The counter inventory beyond durations (개 outside `concentr-item`, and 명, 건, 장, 대) has no
surface here — 명/건/장/대 appear in no `unitPattern` — so the termbase rulings the technique
asks for cannot be checked. KO-DEUL and KO-ZERO likewise: the corpus is locale data, not
message copy. One quirk, a lead not a finding: `%spellout-cardinal-native` base 10 is
`열[ >>]`, a space inside the optional part, so 11–19 spell as 열 하나 … 열 아홉 while the
same ruleset's base 20 (`스물[>>]`) gives 스물하나 — 9 of 99 native cardinals carry an
internal space, the rest none. ICU4J 78.3 reproduces it, so it is the data, not the reading.
