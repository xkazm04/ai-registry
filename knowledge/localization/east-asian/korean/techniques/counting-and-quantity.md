---
layer: technique
type: technique
subject: korean
technique: counting-and-quantity
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [translating count and quantity strings into Korean, reviewing plural-format blocks for the ko locale, choosing counters for a termbase]
---

# Counting and quantity

Korean encodes quantity through **counters** (classifiers), not through
grammatical number. The CLDR plural rules for Korean define a single
category — `other` — for both cardinals and ordinals: every count from zero
to a billion selects the same translated form. This makes the plural
machinery trivially easy and the noun phrase around the number genuinely
hard; localizers routinely get the effort backwards.

## KO-PLURAL-OTHER · one plural branch, and only one

**Rule.** A message-format plural block for ko carries exactly the `other`
branch (plus `=0`/`=1` overrides only when the *product* wants different
copy for those counts, e.g. an empty-state rewording — a copy decision, not
grammar). Translating an English `one`/`other` pair into two identical
Korean branches is harmless noise; translating them into two *different*
Korean forms by "matching the English" invents a distinction the language
lacks and doubles maintenance. Ordinals likewise: 번째 attaches to any
number uniformly (1번째, 3번째), with one CLDR category — but **the spelled
forms are not 첫/둘/셋**. Only *first* uses its own word (첫 번째); from two
upward the ordinal takes the **attributive** stems, so it is 두 번째 and
세 번째, never 둘 번째 or 셋 번째. See KO-ATTRIBUTIVE.

Audit signal: a ko plural block whose branches differ in more than an
explicit-count copy override is a defect to collapse.

## KO-DEUL · 들 is pragmatic, not a plural suffix

**Rule.** Do not append 들 wherever English has a plural -s. 들 is optional,
carries a distributive/individuating nuance, and attaches most naturally to
human nouns (사용자들); with a numeral and counter present it is redundant
and wrong-footed (`3개 파일들` is a defect; `3개 파일` or `파일 3개`).
Mechanical 들-insertion is one of the most reliable markers of unreviewed
machine translation. Default: no 들; permit it only where a human-referent
plural reads bare without it.

## KO-COUNTER · a number needs a counter between it and its noun

**Rule.** A bare numeral cannot modify a noun: "3 files" is not `3 파일`.
The counter mediates, in one of two grammatical shapes:

- **Numeral-first**: `{count}개 파일` — compact, common in running text.
- **Noun-first**: `파일 {count}개` — the tighter, list-native shape;
  preferred for dashboards, badges, and rows ("항목 12개", "댓글 3개").

Core UI counters, worth fixing in the termbase so independent translators
do not split them:

| Counter | Counts | Example |
|---|---|---|
| 개 | generic objects, the safe default | 항목 3개 |
| 명 | people | 참여자 5명 (분 honors them: 손님 두 분) |
| 건 | cases, transactions, incidents | 오류 2건 |
| 회 / 번 | occurrences, attempts | 3회 재시도 |
| 일 / 시간 / 분 / 초 | durations | 3일 전, 5분 후 |
| 장 | flat things (pages, photos) | 사진 4장 |
| 대 | machines, vehicles, devices | 기기 2대 |

Choosing between near-synonymous counters (건 vs 개 for "events") is a
one-concept-one-rendering decision: settle it per noun in the termbase.

## KO-NUM-UNIT · attachment and spacing around numerals

**Rule.** With Arabic numerals, the counter attaches **directly, no space**:
3개, 5명, 10건. (Standard orthography's baseline spaces unit nouns — 세 개 —
but explicitly permits closing up with numerals; UI convention has settled
firmly on closed.) The noun on the other side keeps its normal space:
`3개 파일`, `파일 3개`. Percent and currency attach as in the source
contract (`{pct}%`, `₩{amount}` — the won sign precedes). Native-Korean
number words belong to prose and honorific people-counting, not to
interpolated UI counts; with `{count}` assume **Arabic numerals**, which is
the part that matters for a catalog.

**Do not extend that to "and Sino-Korean readings."** Which reading a spelled
counter takes is not a property of the counter, and the standard does not map
one to the other: it publishes both a native and a Sino-Korean path for the
same counter, and the ruleset *named* for Sino-Korean is in fact the native
one below fifty. The reading is a phrasing decision the catalog makes, not a
fact to assume — and it only arises at all when the numeral is spelled out.

## KO-ATTRIBUTIVE · the pre-counter forms are a third series, not a shortening

**Rule.** Korean's native numerals have an independent series (하나, 둘, 셋,
넷 … 스물) and a distinct **attributive** series used immediately before a
counter (한, 두, 세, 네 … 스무). The attributive is the form a counted phrase
actually takes — 손님 두 분, 세 개 — so a technique or termbase listing
"native numerals" with a mixed set has already made the error.

**And the alternation is conditioned on what follows, not on a lookup table.**
The two ordinal series diverge: the 째 series keeps 둘째 and 셋째, while 번째
takes 두 and 세. Over 1–99 the two disagree at **21 values** — the twos, and
every number ending in three or four from thirteen up — and the divergence
survives into the hundreds, where 백둘째 stands against 백두 번째. A flat
하나→한 / 둘→두 / 셋→세 substitution table is wrong on all 21.

**Trigger.** Any spelled-out Korean numeral before a counter or an ordinal
suffix; any tooling that "normalises" native numerals.
**Exception.** None for the attributive itself. Which *series* a given phrase
wants is a phrasing decision (see KO-NUM-UNIT); which *form* within the series
is not — that one is grammar.

## KO-ZERO · zero counts read better as absence

**Rule.** `0개 항목` is grammatical but robotic; Korean idiom states absence:
`항목 없음` (label) / `항목이 없습니다` (sentence). Where the format contract
supports an explicit-zero branch, use it for the absence phrasing; where it
does not, that is a source-string design gap to report upstream — per-locale
workarounds (hardcoding "없음" into the `other` branch behind a conditional
reading) hide the defect from the other locales that want the same branch.

## When not to apply

Formatted numbers themselves — grouping separators, decimal marks, date and
time patterns — are CLDR data the formatting layer owns; a translator
hand-writing 1,000 or a date pattern inside a string value is bypassing the
contract. This technique governs the words around the number, not the
number's own rendering.
