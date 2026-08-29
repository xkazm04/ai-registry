---
layer: golden-path
type: golden-path
subject: vietnamese
status: forged
use_when: [localizing a product into Vietnamese, auditing or reviewing a Vietnamese catalog, deciding register or terminology policy for vi, sizing layout and length budgets for Vietnamese strings]
techniques:
  - register-and-address
  - diacritics-and-typography
  - classifiers-and-quantity
  - de-anglicization-constructions
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# Vietnamese (vi)

Vietnamese looks deceptively easy to a localization program manager: Latin script,
left-to-right, no case declension, no verb conjugation, no plural forms — and a
cardinal plural rule so simple it invites closing the file. Every one of those
absences is where the real work hides, and the plural rule is the first trap: it is
a statement about *cardinals on the release you ship*, it has never been true of
ordinals, and it is not a statement about the language having only one category. The grammar Vietnamese does not spend on morphology it
spends on **choices**: which person-word to call the user, which of two passive
markers to pick (one of them means the event was *bad for you*), which classifier a
counted noun takes, and which of three vocabulary strata — Sino-Vietnamese, native,
or English loan — a technical term should come from. None of these choices exists in
the English source string, so none of them can be made by transfer; each is a
decision the localizer makes fresh, and an unmade decision ships as a smell.

The published authority for the software register is Microsoft's Vietnamese
localization style guide (vi-VN); the plural facts are CLDR's. Both are cited
throughout as provenance because an audit needs an authority behind an anchor, not
because either is beyond correction — a coherent catalog that deliberately overrules
a guide row wins, provided the ruling is written down where the rule lives.

## The person-reference system, and why software settles on bạn

Vietnamese has no neutral pronoun system. Everyday person-reference is done with
**kinship terms** — anh (older brother), chị (older sister), em (younger sibling),
cô, chú, bác, ông, bà — and every one of them asserts the relative age, gender, and
status of both parties. There is no way to say "you" with a kinship term without
claiming to know who the user is. The informal pronouns (mày, cậu) claim intimacy;
the honorific quý khách ("valued customer") claims a vendor–customer service
relationship and sounds like a bank teller inside product UI.

Software addressed to a single unknown operator therefore converges on **bạn** —
literally "friend", grammatically a neutral, respectful-but-direct second person that
asserts nothing about age or gender. Microsoft's guide uses bạn throughout its own
examples and explicitly instructs rewriting gendered generic references (anh, chị,
ông, bà…) into bạn or a role noun (người dùng, "the user"). This is the single most
load-bearing register decision in a Vietnamese catalog, and it is a *decision*: it
must be recorded once and enforced, because translators arriving from marketing or
support prose will reach for anh/chị reflexively.

Two corollaries complete the system. Commands and button labels **drop the pronoun
entirely** — bare imperative Lưu, Hủy, Xóa is the idiomatic register, and padding it
("Bạn hãy lưu") reads as a children's textbook. And the product refers to itself as
**chúng tôi** ("we", excluding the listener) in prose that has an author — never tôi,
which would give the software a single first-person persona it cannot sustain. See
register-and-address.

## Diacritics are the orthography, not decoration

Vietnamese writes six tones and three extra vowel qualities with stacked diacritics;
a syllable stripped of them is not an abbreviation of the word — it is a different
word or no word. ASCII folding is therefore never a fallback: not in a truncated
label, not in a generated identifier shown to users, not "temporarily". The two
engineering-facing invariants: the catalog is stored **NFC-normalized** (mixed
normalization forms break equality checks, search, and diffs while looking identical
on screen), and the catalog picks **one tone-mark placement style** — the old
aesthetic style (hòa, khỏe) or the new phonemic style (hoà, khoẻ) — and holds it,
because the two spellings of one word are distinct code-point sequences that split
search and translation-memory matches. See diacritics-and-typography.

## Number without plurals: classifiers, and a plural rule with two asterisks

Vietnamese nouns have no plural form: whatever the count, the noun inside a plural
block is unchanged — 1 tệp, 5 tệp. The *category* story is less tidy than that fact
suggests. CLDR has long given vi a single cardinal category, `other`, but **CLDR 49
adds a singular one** (`i = 0 or n = 1`, which puts zero in it), and **the ordinal
file has never been single-category** — vi has carried an ordinal singular for over a
decade to hold the suppletive *thứ nhất*. So a vi plural block is not automatically
one branch; a second branch, where the release provides one, carries agreement
*downstream* of the count — singular versus plural anaphora, *nó* against *chúng* —
never inflection of the counted noun. See classifiers-and-quantity. What English spends on plural agreement
Vietnamese spends on **classifiers**: a counted noun normally takes a small measure
word between the numeral and the noun — cái (general/inanimate), chiếc (single
manufactured item), con (animate, plus a few idiomatic inanimates), quyển/cuốn
(bound volumes), tờ (sheets), bức (flat rectangular things). "3 dogs" is 3 con chó,
not 3 chó. An interpolated `{count}` string must be written with the classifier the
noun actually takes, which means the translator must know what the placeholder
counts — a source defect to surface, not to guess around. The plural markers các and
những exist but are *not* plural agreement: they mark definite or contrastive
plurality when no numeral is present, and stacking them onto a counted noun (5 các
tệp) is a transfer error. See classifiers-and-quantity.

## What makes a Vietnamese string smell translated

The tell-tale constructions are all English structure wearing Vietnamese words:

- **Frozen English word order.** Vietnamese noun phrases are head-first — the head
  noun leads and every modifier follows (Internet Accounts → Tài khoản Internet).
  A compound translated in source order is the fastest smell there is.
- **Copula overuse.** Vietnamese adjectives are stative verbs; they take no là.
  "This file is important" is Tệp này quan trọng — inserting là marks the writer as
  translating.
- **The wrong passive.** Vietnamese has two passive markers with opposite affect:
  **được** (the subject benefits or the event is neutral-positive) and **bị** (the
  event is adverse to the subject). "Your file was saved" with bị says the save
  *happened to* the file, against its interest. A status string with the wrong
  marker changes valence — this is the highest-severity construction error in the
  language, because it inverts what the product is telling the user.
- **Pronoun-heavy calques.** English demands a subject in every clause; Vietnamese
  drops recoverable subjects and possessives. A string that renders every "you",
  "your", and "it" reads bureaucratic. Likewise the tense calque: đã/đang/sẽ are
  optional aspect adverbs, not conjugation, and marking every English past tense
  with đã produces prose no Vietnamese writer would ship.

See de-anglicization-constructions.

## Three vocabulary strata, one termbase decision per concept

Every technical term in Vietnamese chooses among **Sino-Vietnamese** (Chinese-derived
compounds — the formal, productive stratum that built most of the modern technical
lexicon: quản trị, xác thực, triển khai), **native vocabulary** (shorter, warmer,
sometimes too concrete for abstractions), and the **English loan** kept as-is (API,
cache, workflow — Microsoft's guide sanctions borrowing when a translation would be
ambiguous, unfamiliar, or unwieldy). The stratum choice sets register: an all-Sino
string reads like a government circular, an all-loan string reads like a developer
chat. The craft is choosing per concept, once, and recording it — because two
translators will otherwise pick different strata for the same concept and both will
be defensible. Sense-splitting matters more than in English: one settled word must
not silently absorb a second concept, and near-synonym drift (two Sino compounds
sharing a syllable) is the characteristic failure. See terminology-and-loanwords.

## Casing, length, and the layout facts

Vietnamese capitalizes the first letter of a sentence and proper nouns — nothing
else. There is no Title Case; mirroring an English source's capitals ("Chọn Tất Cả")
is a defect Microsoft's guide calls out with tables of counter-examples. Proper-noun
convention has its own wrinkle: multi-syllable proper names capitalize each syllable
(Việt Nam, Hà Nội), while institutional compound names capitalize the first element
of the compound.

Length behaves unlike any European locale: Vietnamese is **monosyllabic-morpheme**
writing, so every word is one or more short, space-separated syllables. Descriptive
compound nouns run long in syllable count (credential → thông tin xác thực, roughly
+90% characters) while imperative verbs come out *shorter* than English (Save → Lưu,
Delete → Xóa). Budget asymmetrically. The layout hazard is that the spaces inside a
multi-syllable word are invisible to naive line-wrapping: quản trị viên is one word
in three tokens, and a break after quản trị mid-word reads as broken, not wrapped.
Truncation and abbreviation are both worse than in English — dropping syllables or
diacritics manufactures nonwords, and initialisms users have never seen do not
decode. See ui-conventions-and-length.

## What this subject does not own

Which rendering a given product picks for its own concepts, its exemplar strings,
its do-not-translate brand list, and any house ruling that overrules an authority
row are the consuming repo's artifacts — this subject teaches the mechanisms those
artifacts instantiate (the borrow-vs-translate test, the one-concept-one-rendering
discipline, the recorded-overruling rule) and stops there. The audit workflow that
cites these anchors, and the catalog mechanics it runs over, belong to the skills
lane; every rule here is written to be citable by identifier from a typed finding,
per [every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor).
