---
layer: technique
type: technique
subject: chinese
technique: measure-words-and-quantity
status: forged
laws: [format-skeleton-is-inviolable, one-concept-one-rendering]
shared_with: []
use_when: [translating strings with interpolated counts, wording plural-variant key families for zh, choosing classifiers for a product's countable nouns]
---

# Measure words and quantity

Chinese has no plural morphology and a mandatory classifier system — the exact
inverse of a European language's quantity mechanics. Both halves generate
catalog defects: the missing-plural half tempts translators to invent variant
wording the language does not have, and the classifier half is where a bare
interpolated count turns into broken Chinese. CLDR is the citable authority
for the first half; the classifier rules are grammar, citable by identifier.

## ZH-CLASSIFIER · a counted noun requires its measure word

**Trigger:** a numeral or `{count}` placeholder directly quantifying a noun.
**Rule:** number + classifier + noun, always: 3 个连接器, {count} 条消息 —
never the bare calque {count} 连接器, which reads as broken Chinese, not as a
minor style slip. The classifier goes between the count and the noun; with
the recommended CJK-Latin spacing convention that is `{count} 个连接器`
(space before the classifier because the placeholder resolves to a numeral,
none after it).
**Exceptions that earn their absence:** measure-word-free counting is correct
for nouns that are themselves units or take zero classifier — 3 天, 5 次
(次 is itself the classifier), calendar/time expressions, and headline-style
stat tiles where the noun is a label rather than a sentence (见 ZH-STAT in
spirit: a dashboard tile "连接器" with a large numeral above it needs no
classifier because nothing is being counted *in a sentence*).

## ZH-CLASSIFIER-FAMILY · one classifier per noun family, recorded

**Trigger:** choosing which classifier a product noun takes.
**Rule:** the classifier is a per-noun decision made once and recorded, like
any termbase row, because two translators will otherwise split (3 个任务 vs
3 项任务 are both defensible — which is exactly why the product must pick
one). The workable default mapping for product UI:
- 个 — the generic classifier: users, items, agents, connectors, most
  countable things. When in doubt, 个 is correct-but-plain; a wrong specific
  classifier is worse than a plain 个.
- 项 — tasks, settings, findings, fields: itemized things needing attention.
- 条 — messages, records, log lines, rules: long/linear things.
- 位 — people, when the register is respectful (3 位成员); pairs naturally
  with a 您-register product.
- 次 — occurrences: retries, calls, runs.
- 份 — documents, copies, reports.
- 张 — flat things: cards, images, tickets.
**Audit:** classifier drift is greppable per noun (search the noun, inspect
the preceding character) and is a one-concept-one-rendering finding.

## ZH-PLURAL-OTHER · plural variants are worded identically

**Trigger:** a plural-variant key family (`_one`/`_other` or a
message-format plural block) being translated into Chinese.
**Rule:** CLDR gives Chinese exactly one cardinal plural category, `other`
(ordinals likewise). Every variant the key family forces you to fill gets
**identical** Chinese wording, differing only in what the caller substitutes
into the placeholder. Do not invent a distinct "singular" wording (一个连接器
in `_one`, {count} 个连接器 in `_other`) — the language does not make the
distinction and the invented one breaks the moment the source adds a variant.
**The literal-digit exception:** when the source's `_one` string hardcodes
the literal digit ("1 new message") instead of the placeholder, mirror it
with the literal half-width digit 1 — not the word 一 — in that variant only.
The variant structure is the source's contract; Chinese follows it without
adding conventions of its own.
**Message-format note:** in a plural-syntax block, Chinese fills only the
`other` branch (plus any explicit `=0`/`=1` branches the source carries);
the syntax keywords themselves are skeleton and stay untouched.

## The placeholder incident this technique exists to prevent

The worst quantity-string failure observed in a real 11.5k-key catalog was
not a wrong classifier but a *transliterated placeholder*: the source
`{personas} personas` was rendered with the placeholder name itself
translated inside the braces, so the runtime's exact-match lookup failed and
the raw braces shipped to screen. Quantity strings concentrate this risk
because they are placeholder-dense. The rule is the bundle's first law
applied locally: the words around the braces move; the braces and everything
inside them do not — and the classifier is added *outside* the placeholder
(`{count} 个…`), never by editing the placeholder.

## When not to use this technique

Do not force classifiers into label-only contexts (menu items, column
headers, tab names) where nothing is counted — 消息, not 条消息. And do not
"repair" a source defect locally: a source string that concatenates its count
grammatically ("You have" + `{count}` + "items") cannot be fixed by clever
Chinese word order alone; it is a source defect to record and surface, since
Chinese needs the classifier adjacent to a noun the fragment may not contain.
