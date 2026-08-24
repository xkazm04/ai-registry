---
layer: technique
type: technique
subject: japanese
technique: terminology-and-katakana-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding how a new term renders in Japanese, setting or auditing a chōonpu convention, catching katakana false friends in a translated catalog]
---

# Terminology and katakana loanwords

Katakana borrowing is unbounded — any English term *can* be transliterated —
so Japanese terminology work is not about whether a rendering exists but about
choosing among several defensible ones and then never re-litigating. Every
rule here funnels into the same discipline: the decision is made once, per
term, recorded in the consuming product's termbase, and the audit cites the
row ([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)).
This technique teaches how to make each decision well; the decisions
themselves live downstairs.

## JA-THING-PROCESS · katakana for things, kanji for processes and judgments

**Trigger:** a new domain term with no termbase row.

**Rule (heuristic, not law):** a term naming a **thing** the user sees and
manipulates — a surface, a feature, an object in the product's world — borrows
well as katakana, because practitioners already say it in katakana aloud and a
forced native coinage reads as quaint. A term naming a **process, state, or
judgment** — something evaluated, decided, or undergone — translates better as
a native kanji compound, because a considered compound reads as precise where
a transliteration reads as hasty, and because this is exactly where katakana
false friends (below) concentrate. Apply the split, make the call, write the
row; the next translator inherits a decision instead of a guess.

**Why heuristic:** real corpora carry settled exceptions in both directions —
an English word left fully untranslated because it functions as a proper name,
a state word rendered in katakana because usage had already fossilized. A
shipped, coherent corpus outranks the heuristic
([the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis));
the heuristic decides *new* terms, and each exception is honored once
recorded.

## JA-FALSE-FRIEND · a katakana borrowing keeps its Japanese sense, not its English one

**Trigger:** a katakana rendering of an English word that is polysemous in
English, or whose katakana form already has an established narrower sense in
Japanese.

**Rule:** transliteration imports the *word*, not the *sense* — the katakana
form means what Japanese usage says it means. The classic shape: English
"promote" (advance a thing through stages) borrowed as プロモート, which in
Japanese near-exclusively means marketing promotion — so "promote the draft"
reads as "advertise the draft". The fix is a native compound carrying the
intended sense（昇格）. Other recurring traps: クレーム means complaint, not
claim; マンション means condominium, not mansion; リストラ means layoffs, not
restructuring generally; テンション means excitement, not tension. When a
borrowing is proposed, check the katakana form's established Japanese sense,
not the English word's; every false-friend finding is worth a permanent
termbase row with the wrong form recorded as forbidden.

## JA-CHOONPU · the long-vowel mark follows one convention, catalog-wide

**Trigger:** a katakana term ending in English -er, -or, -ar, -y —
サーバー/サーバ, ユーザー/ユーザ, コンピューター/コンピュータ.

**Rule:** two published authorities disagree. The JIS technical-writing
tradition (JIS Z 8301's notation annex) omits the final chōonpu on words of
three or more mora — サーバ, ユーザ — and older engineering corpora follow
it. The 1991 Cabinet Notification（内閣告示・外来語の表記）writes the long
vowel out — サーバー, ユーザー — and the major OS vendors publicly converged
on it (one announced the switch in 2008, and current vendor style guides
specify the written-out form). **Default for new work: the written-out form**,
because it matches what today's users read everywhere else. But the real rule
is: pick one convention, record it, and enforce it mechanically — a catalog
mixing サーバ and サーバー is defective under either authority, and an
existing coherent corpus keeps its convention rather than being churned to
the other.

**Sub-rules that survive either convention:** word-*internal* long vowels are
never dropped（データ, never デタ）; the JTF style guide instructs not to
omit word-final chōonpu in general prose; and a term's settled rendering in
the termbase overrides the convention for that term alone when recorded.

## JA-KATAKANA-COMPOUND · long compounds get a deliberate separator policy

**Trigger:** a katakana compound of three or more elements —
アクセスコントロールリスト and friends.

**Rule:** Japanese has three ways to join loanword compounds: solid
（アクセストークン）, middle-dot separated（アクセス・トークン）, or
half-width-space separated. The JTF style guide permits the middle dot or a
half-width space for long compounds; solid is the norm for two-element terms.
The decision is per-term and recorded — the defect is the same compound
appearing joined two ways. Two hard sub-rules: the separator middle dot is
the full-width 中黒 ・, never the half-width interpunct a source string may
use as a *format token* (that one is skeleton and stays byte-identical); and
a Latin acronym compounds solid with its katakana head（APIキー）, never
with an inserted space or dot.

## Working the termbase relationship

This technique produces termbase rows; it does not own them. The operational
loop: (1) meet an unknown term → apply JA-THING-PROCESS, check
JA-FALSE-FRIEND, apply the house chōonpu convention → (2) write the row with
the rendering, the counter it takes when counted, and any forbidden variants →
(3) from then on, audit against the row, not against this technique. Two
adjacent-concept hazards deserve explicit rows whenever they appear: near-
synonym English pairs that must stay distinct in Japanese (a product's
"review" and "approval", "capability" and "skill" — one settled word each,
never merged), and one English word carrying two senses that Japanese must
split into two renderings resolved by context. Both are exactly the drift
that independent translators are guaranteed to introduce, so both get counted
and consolidated, not hoped against.

## When not to apply this technique

Proper names, brands, and user-authored content are not terminology — they
pass through untouched, casing and all. And do not apply the chōonpu
convention to native Japanese words or to established non-English borrowings
with fossilized spellings; the convention governs the productive frontier,
not the dictionary.
