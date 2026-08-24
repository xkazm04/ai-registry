---
layer: technique
type: technique
subject: japanese
technique: register-and-politeness
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing sentence endings for Japanese UI text, reviewing register consistency across a catalog, deciding whether a string is a label or a sentence]
---

# Register and politeness

Japanese register is decided per text category, not per string. The procedure
is: classify the string first (sentence text or label text), then apply that
category's ending convention mechanically. Almost every register defect in a
real catalog is a category misclassification — a label treated as a sentence
or a sentence treated as a label — not a wrong judgment about politeness.

## JA-DESU-MASU · polite style for sentence text

**Trigger:** any full sentence that addresses or informs the user — body copy,
descriptions, error text, toasts, empty states, confirmations, hints.

**Rule:** end in 敬体 (です・ます style), every sentence, no exceptions within
the category. Do not mix in 常体 (だ・である) endings; a single casual だ。 in
a polite corpus is a register break the reader feels immediately, the way an
English reader feels a sudden "gonna" in legal text.

**Source:** the major vendors' published Japanese style guides all specify
です・ます for software UI addressed to the user; the JTF style guide's first
instruction is to pick one style per document and never mix — for product UI
the picked style is です・ます by industry-wide convention.

**Exception:** none inside product UI sentence text. Reference documentation,
release-note prose, and log/diagnostic lines may legitimately use である style,
but that is a different document contract, decided at the document level —
never string by string.

## JA-TAIGENDOME · noun or dictionary form for labels and headings

**Trigger:** button labels, menu items, tab names, column headers, section
headings, chip and badge text — anything that names an action or a place
rather than speaking to the user.

**Rule:** use 体言止め (end on the noun) or the bare dictionary-form verb —
保存, 閉じる, 設定, キャンセル — with no polite ending and no terminal
punctuation. 保存します on a button is wrong the way "I will save" on an
English button would be; 保存してください on a button is wrong the way
"Please save" would be as its entire label.

**Source:** vendor style guides distinguish UI-item text from message text and
reserve polite endings for the latter; the convention is universal across
shipped Japanese software.

**Exception:** a heading that is genuinely a full question or promise
(onboarding screens often headline with one) keeps sentence grammar and
therefore です・ます. The test is whether the text has a predicate addressed to
the reader, not where it appears on screen.

## JA-NO-IMPERATIVE · requests, never commands

**Trigger:** sentence text that asks the user to do something.

**Rule:** use the て-form request 〜してください (or the softer 〜してみて
ください where the product's voice allows), never the plain imperative
(〜しろ, 〜せよ) and never the blunt 〜すること. The plain imperative directed
at a user reads as barked orders; in a decade of mainstream Japanese software
it appears only in games speaking in character.

**Nuance in the other direction:** not every English "please" needs ください,
and not every ください needs a preceding どうぞ. The politeness lives in the
verb form itself; stacking English courtesy words on top produces the
over-polite wobble that is its own translationese marker (see the
de-anglicization technique's JA-PLEASE).

## Choosing temperature within です・ます

The register decision above is fixed; what a product actually chooses is
temperature inside 敬体:

- A **professional or B2B tool** stays declarative: state, cause, next action.
  Hedges (〜かもしれません), emphatic particles (〜ですよ), and exclamation
  marks are out.
- A **consumer product** may soften: 〜しましょう invitations, an occasional
  exclamation in celebratory moments. The endings are unchanged — only the
  connective tissue warms up.
- **Error text** in both stays blame-free and agent-less: Japanese error
  convention states the failure as a situation (保存できませんでした), not as
  an accusation with a subject — which the pronoun-omission rules make natural
  rather than evasive.

Full honorific keigo (尊敬語 beyond the conventional set phrases, 謙譲語 like
〜いたします outside fixed formulas) is reserved for commerce and account
communication where the product speaks as a company to a customer — receipts,
billing mail, service apologies. Inside the working UI it reads as distance,
not respect.

## When not to apply this technique

Do not enforce register on strings the user authored (their own content
echoed back), on quoted material, or on proper names. And do not "fix" a
deliberate, documented house choice of a warmer or cooler voice by citing this
technique — register conventions here are the industry default; a product may
overrule a default when the overruling is recorded where its own rules live,
and an auditor cites the house rule from that point on.
