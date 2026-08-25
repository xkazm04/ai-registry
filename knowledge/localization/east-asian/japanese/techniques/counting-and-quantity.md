---
layer: technique
type: technique
subject: japanese
technique: counting-and-quantity
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [translating strings with counts or plural branches into Japanese, choosing a counter word for a quantified noun, auditing Japanese strings for plural-machinery leakage]
---

# Counting and quantity

Japanese nouns do not inflect for number. That single fact deletes an entire
category of English grammar — and the defects in this technique are all the
same defect: some piece of English's plural machinery surviving into a
language that has no socket for it.

## JA-PLURAL-OTHER · one form covers every count

**Trigger:** a source string with plural branches, or any temptation to write
"different Japanese for 1 vs many".

**Rule:** CLDR assigns Japanese exactly one plural category, `other`, for both
cardinals and ordinals. Every plural branch in the source collapses into a
single Japanese string that is correct for 0, 1, and 1000 alike. Write that
one string with the number visible（{count} 件のレビュー）and stop — there is
nothing to branch on.

**Source:** CLDR language plural rules (Japanese: cardinal `other`, ordinal
`other`).

**Two failure modes, opposite directions:**
- *Machinery leaks in:* the translator copies the source's plural syntax
  literally, and because Japanese needs no branches, the syntax is never
  exercised as syntax — it renders as raw braces on screen. Any literal
  plural-selection syntax inside a Japanese value is a defect on sight.
- *Information leaks out:* a translator "simplifying" the branched source may
  drop the count placeholder entirely. The skeleton law forbids it — every
  placeholder in the source appears in the target, exactly once, exactly
  spelled ([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).

## JA-NO-PLURAL-S · no English plural morphology on Japanese nouns

**Trigger:** an -s, -es, or "(s)" attached to a katakana or kanji noun.

**Rule:** ペルソナs, アイテムs, and the hedging 件(s) are not Japanese forms
at all — they are English morphology glued to a language that has none.
Delete the suffix; the noun alone is already number-neutral. The "(s)" hedge
common in English UI ("file(s)") simply disappears in Japanese: ファイル
covers both.

**The severe variant:** the plural suffix migrating *into a placeholder name*
({items} becoming {アイテムs}) is not a style defect but a runtime break —
the lookup key no longer exists. Mark it critical under the skeleton law, not
under this rule.

## JA-COUNTER · numbers count through counter words

**Trigger:** a numeral quantifying a noun.

**Rule:** Japanese quantities take a counter word (助数詞) matched to what is
counted; a bare numeral-plus-noun（3 ペルソナ）is a calque of English
bare-plural grammar and reads machine-made. The two canonical shapes:

- `名詞 {n} 助数詞` — ペルソナ {count} 体, レビュー {count} 件 — natural for
  status lines and stat readouts;
- `{n} 助数詞の名詞` — {count} 件のレビュー — natural inside sentences.

Choosing the counter is a per-concept termbase decision, made once. The safe
workhorses for software UI: **件** (matters/records — the general-purpose
counter for items, requests, results, errors), **個** (discrete objects,
informal-neutral), **人/名** (people; 名 is the politer, roster-flavored
form), **台** (machines and devices), **回** (occurrences/runs), **枚**
(flat things — pages, cards, images), **行** (lines), **通** (letters and messages).
When nothing fits and the noun is abstract, 件 is the least-wrong default; a
wrong-but-plausible counter (counting people with 個) is a worse defect than
a bland 件, because it reads as ignorance rather than caution.

**Exception — when a counter is correctly absent:** units that are themselves
measures（3 GB, 50%, 12ms）take no counter; the unit is the counter. Table
cells and chips that show a bare number under a labeled column header are
also fine — the header carries the classification the counter would have.

## Quantity phrasing that does not survive translation

Three English quantity habits need active rewriting, not word-for-word
carriage:

- **"No items" / zero states:** Japanese does not negate the noun; it states
  absence — 項目はありません, まだレビューがありません. A literal 0 件 is
  acceptable in dense dashboards but reads cold in empty states.
- **"One or more" / "at least one":** legalistic English hedging; Japanese UI
  says 1 件以上 in genuinely numeric contexts and otherwise drops the hedge.
- **Ordinal phrasing:** Japanese builds ordinals with 番目（3 番目）— there is
  no -st/-nd/-rd/-th selection to localize, and ordinal-suffix placeholders
  from the source（{n}{suffix}）should be flagged as a source defect: the
  suffix slot is meaningless in Japanese and the string cannot be translated
  cleanly around it.

## When not to apply this technique

Do not add counters to numbers that are identifiers rather than quantities
(version 3, ポート 8080, error 404) — nothing is being counted. And do not
rewrite a source string's plural branches *in the source*: the collapse
happens in the Japanese value only; the source catalog's branching stays,
because a dozen other locales still need it.
