---
layer: golden-path
type: golden-path
subject: chinese
status: forged
use_when: [localizing a product into Chinese, auditing or bulk-translating a zh catalog, deciding Simplified vs Traditional scope for a release, reviewing Chinese strings that smell machine-translated]
techniques:
  - register-and-address
  - character-width-and-typography
  - measure-words-and-quantity
  - de-anglicization-constructions
  - terminology-and-variants
  - ui-conventions-and-length
---

# Chinese

Chinese is the locale where almost everything a translator worries about in
European languages — case, gender, agreement, plural forms, declension — simply
does not exist, and where that absence is precisely the trap. Because nothing
*inflects*, nothing *breaks visibly* when a translation is wrong: a
machine-translated Chinese string is nearly always grammatical. The defects
live one level up, in choices English never forces you to make — which "you"
the product uses, which measure word a counted noun takes, whether punctuation
is full-width, whether Simplified and Traditional are treated as two scripts or
as what they really are, two diverging terminologies. A reviewer trained on
European locales looks for broken agreement and finds none; a reviewer trained
on Chinese looks for these choices made inconsistently, and finds them
everywhere.

The worked variant here is Simplified Chinese (`zh`, `zh-Hans`, mainland
register); Traditional (`zh-Hant`, Taiwan and Hong Kong registers) appears
throughout as the divergence to plan for, because the single most expensive
misunderstanding in Chinese localization is treating Hant as a character-set
conversion of Hans. See terminology-and-variants.

## What the language removes, and what it demands instead

**No plural morphology.** Nouns and verbs are invariant for number. CLDR
assigns Chinese exactly one cardinal plural category — `other` — and one
ordinal category, also `other`. Every plural-variant key family in a catalog
therefore carries identical Chinese wording across variants; a "singular"
Chinese string that differs from its "plural" sibling is an invented
distinction the language does not have. What the language demands *instead* of
plural agreement is the classifier system: a counted noun requires a measure
word (个, 项, 条, 位…), chosen per noun and held consistent, and an
interpolated `{count}` placeholder needs that classifier after it or the
string reads as broken Chinese. The effort European languages spend on plural
forms, Chinese spends on classifiers. See measure-words-and-quantity.

**No case, so no casing.** Chinese script has no letter case; every source-
language convention built on capitalization — Title Case headings, sentence
case, ALL-CAPS emphasis — has no Chinese rendering and must not be imitated by
other means. The residual casing rules concern the Latin islands inside
Chinese sentences: product names, acronyms, and code identifiers keep their
source casing byte-exact. See ui-conventions-and-length.

**No conjugation, so register is pure pronoun choice.** The formal/informal
distinction that conjugates every verb in French or German reduces in Chinese
to a single decision — 您 versus 你 — plus the politeness particle 请 and the
discipline of dropping pronouns where context carries them. That makes
register cheap to get right and cheap to get wrong at scale: one inconsistent
translator does not produce subtle agreement errors, they produce a product
that visibly switches how it addresses the user between two adjacent screens.
See register-and-address.

## The script facts a layout engineer must know

Chinese is written left-to-right in modern digital products, with no bidi
concerns, no joining behavior, no ZWNJ class of gotchas — that entire budget
is spent elsewhere. Text has **no inter-word spaces**: line breaking is
permitted between almost any two characters, subject to prohibition rules
(避头尾) that forbid closing punctuation at a line head and opening punctuation
at a line end. A layout that word-wraps only at spaces will render Chinese as
one unbreakable run; a layout that breaks anywhere without the prohibition
rules will orphan a comma at the start of a line. W3C's Requirements for
Chinese Text Layout (clreq) is the citable authority for all of this,
including the spacing between Han and Latin runs that products must settle as
policy (see character-width-and-typography).

Each Han character is a full-width glyph, rendering at roughly 1.5–1.75× the
width of a Latin letter — but Chinese text is so much denser than English
(a 15-character English label routinely becomes 4–5 characters) that the net
effect is the opposite of German: strings shrink. The real length risks are a
compound noun overflowing a narrow slot despite the shrinkage, and —
the subtler one — translators padding strings back out with particles because
the space is there. See ui-conventions-and-length.

## What makes a Chinese string smell translated

Machine translation and inexperienced translators produce Chinese that is
grammatical, complete, and unmistakably foreign. The tells are specific enough
to enumerate and audit:

- **的-chains**: English possessives and of-constructions transliterated into
  stacked 的 where idiomatic Chinese compounds directly (触发器的条件 for
  触发条件).
- **被-passives**: English passive voice rendered mechanically with 被, which
  in Chinese carries adversative color and is far rarer than English passive.
- **Pronoun stacking**: a subject pronoun at every clause because English
  requires one, where Chinese drops it after first mention.
- **Translationese connectives**: every "and"/"if"/"when" rendered with its
  dictionary connective, producing scaffolding Chinese prose does not use.
- **Half-width residue**: ASCII commas, periods, and `...` surviving from the
  source inside Chinese sentences.
- **Code-switching**: individual English words left inline mid-sentence — a
  half-translated string reads as broken, not bilingual, and is worse than a
  clean fallback to the source language.

These are the audit surface of de-anglicization-constructions and
character-width-and-typography; each carries a citable rule identifier so a
finding is a defect with an anchor, not a taste objection.

## Simplified versus Traditional is a terminology split, not a font switch

The character-set difference (软件 vs 軟體 as glyph shapes) is the smallest
part of the Hans/Hant divergence and the only part a converter can do. The
larger part is that the mainland, Taiwan, and Hong Kong developed their
technical vocabularies separately: the *word* for software, network, server,
memory, default, print is different across the strait, not just its glyphs.
A Traditional catalog produced by script-converting a Simplified one is
instantly recognizable to a Taiwan user as mainland text in Traditional
clothing. Treat zh-Hans and zh-Hant as two locales sharing a grammar, each
with its own termbase, punctuation conventions (quote glyphs differ), and
register expectations. See terminology-and-variants.

## How a product chooses within the register system

There is no single correct Chinese register; there is a correct *decision
procedure*. A professional or B2B product addresses the user as 您 throughout;
a consumer product with a deliberately warm voice may choose 你, and major
published style authorities have moved in both directions — which is exactly
why the choice is a per-product ruling to record once, not a per-string
judgment. What is never correct is mixing: 您 on the settings screen and 你 in
the error toast is a visible defect in a way no European register slip is,
because the pronoun is the *entire* register system. The audit is mechanical
(grep both pronouns, count, enforce the recorded choice); the initial ruling
is judgment. See register-and-address.

## Working the language at catalog scale

Because Chinese defects are choices-made-inconsistently rather than grammar
errors, catalog-scale work is dominated by counting: count both pronouns
before ruling on register, count each candidate rendering before settling a
term, count classifier usage per noun family before standardizing. A style
authority's row — including this subject's own rules — is a hypothesis until
counted against the catalog it is about to govern. And because every rule here
is cheap to state and cheap to check, Chinese is the locale where typed,
anchor-citing audit findings work best: nearly every real defect class has a
rule identifier a reviewer can cite, and a finding that cannot cite one
deserves suspicion before the string does.

The cross-cutting invariants — skeleton preservation, source-locale
authority, anchored findings, one-concept-one-rendering —
are in [the bundle laws](../../_laws.md) and are assumed throughout.
