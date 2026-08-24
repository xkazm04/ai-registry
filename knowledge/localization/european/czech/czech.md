---
layer: golden-path
type: golden-path
subject: czech
status: forged
use_when: [translating or reviewing a product surface into Czech, auditing a Czech catalog for translated-sounding strings, designing plural or gender handling for a cs locale, setting register and typography policy for Czech]
techniques:
  - register-and-address
  - ui-conventions-and-length
  - plural-and-count-agreement
  - gender-neutral-forms
  - de-anglicization-constructions
  - typography-and-spacing
  - terminology-and-loanwords
---

# Czech (cs)

Czech is a heavily inflected West Slavic language written in Latin script with
diacritics, left-to-right, spoken by ~10.7 million people almost all in one
country. Nothing about its rendering pipeline is exotic — no shaping, no
bidirectionality, no CJK line breaking — which is exactly why teams underestimate
it. The difficulty is grammatical: seven cases, three genders plus an animacy
split, verb aspect, four CLDR plural categories, and agreement that reaches
across every placeholder boundary an i18n system draws. A Czech string is almost
never wrong because a glyph failed to render; it is wrong because a word two
tokens away from the interpolation didn't change shape.

The published authority most products anchor on is the Microsoft Czech
Localization Style Guide (the `ces-cze` guide on Microsoft's globalization
reference); Mozilla's Czech l10n guide is the other credible public authority.
They *contradict each other on register* — Mozilla reaches for bookish relative
pronouns to vary prose; Microsoft rules them out as too formal. Both are native
and both are right for their own product. The load-bearing decision is therefore
not "which rules" but "which authority is the house authority" — pick one,
record the choice where the rules live, and never mix the two guides row by row.
A product may overrule its chosen authority on a specific row; that is
legitimate exactly when the overruling is written down as a ruling with the
rule, so no later reviewer re-litigates it.

## The register system, and how a product chooses within it

Czech has two live address registers: **vykání** (formal, second person plural
verb forms, possessive *váš*) and **tykání** (informal singular, *tvůj*).
There is no neutral escape between them — every imperative, every possessive,
every participle agreeing with "you" commits to one. The near-universal product
call is vykání: B2B tools always, and consumer products in almost every case,
because Czech tykání from a stranger — including a machine — reads presumptuous
rather than friendly, unlike the casual second person of English or the du-wave
in some German consumer apps. A brand that genuinely wants tykání must want it
everywhere; a catalog that mixes registers is defective regardless of which one
is "right", and mixed register is precisely what accretes when translators work
sections independently.

Orthogonal to address is **vocabulary register**, and this is the axis teams
get wrong. Czech has a bookish written stratum (*avšak, již, nelze, pouze,
jenž*) that translators reach for under the impression that formal address
demands formal words. It does not: the modern UI standard is formal *address*
with plain *vocabulary* — vykání carried by everyday words. Below standard
Czech sits **obecná čeština**, the colloquial substrate (*co* as a relative,
*-ej* endings), which is out of bounds even in playful copy. The register
window for a product UI is narrow: plain standard Czech, spoken-natural word
choice, formal address. Both walls of that window need enforcement, because a
rule that only pushes bookish words down does nothing to push colloquial forms
back up.

## What makes a Czech string smell translated

Grammatical, glossary-compliant, correctly formal — and still visibly
translated. The tells are structural, and they recur so reliably they can be
enumerated as anchored rules (see de-anglicization-constructions):

- **Noun piles.** English builds meaning by stacking nouns; Czech builds it by
  conjugating. Three chained genitives is the signature of translation.
- **The short passive participle** (*je nastaven*) where a reflexive (*nastaví
  se*) or long adjective is the living form.
- **Possessives everywhere.** English determiners (*your settings*) calqued as
  *vaše* when Czech would say nothing at all.
- **An explicit subject pronoun.** Czech is pro-drop; *Vy máte…* instead of
  *Máte…* reads like a dubbed film.
- **Anthropomorphized software.** The product *wants*, *thinks*, *is looking
  for* — English marketing voice that Czech renders as factual or impersonal.
- **English prepositions worn by Czech nouns**, and English word order kept out
  of caution in a language whose word order carries information structure.

None of these has an anchor in a termbase, so an audit that requires findings
to cite rules reports them clean — unless the construction rules themselves
carry stable identifiers. That is the design center of this subject: every
recurring construction failure is a named rule (`CS-NOM`, `CS-PASS`, …) that a
finding can cite, which is what separates a reportable defect from taste.

## Plurals: four CLDR categories, and the one everyone forgets

Czech cardinals have four CLDR plural categories, and the boundaries are not
what an English- or even Russian-trained intuition expects:

| Category | Rule (CLDR) | Examples |
|---|---|---|
| `one` | integer 1 | 1 den |
| `few` | integers 2–4 | 2 dny, 4 dny |
| `many` | any non-integer | 1,5 dne; 0,5 dne |
| `other` | 0 and integers 5+ | 0 dní, 5 dní, 100 dní |

The trap is `many`: in Czech it is **not** a large-number category (as in
Russian) — it is the *decimal* category, taking the genitive singular. A
catalog that only ever counts whole things can omit it; a catalog with rates,
averages, or file sizes cannot. The second trap is that `one`/`few` require
`v = 0`: "1,0" is `many`, not `one`. Ordinals collapse to a single category
(*15.* works for every number), so ordinal selectors are never needed.

Grammatically the three integer forms differ in **case**, not just suffix: 2–4
take nominative plural, 5+ force the counted noun into genitive plural and the
verb into neuter singular (*pět kandidátů čekalo*). Agreement radiates outward
from the number — verbs, adjectives, and quantifiers all change with the
count, which is why a plural-aware message format is necessary but not
sufficient: material left *outside* the plural branches must be count-invariant
or the `one` rendering breaks. See plural-and-count-agreement.

## Gender is everywhere, including where the source has none

Czech has masculine (animate/inanimate split), feminine, and neuter, and gender
agreement marks past-tense verbs, adjectives, and participles. Three
consequences no English source ever hints at: any string about a person of
unknown gender must be engineered (slash forms, impersonal neuter, or
recasting — never a silent masculine default); any adjective or participle
next to a placeholder must agree with whatever fills it, so placeholders in
agreeing positions need a gender-fixing head noun; and every loanword must be
assigned a grammatical gender before it can appear in a sentence at all. See
gender-neutral-forms and terminology-and-loanwords.

## Script, layout, and formats — what an engineer must know

- **Script:** Latin with diacritics (á č ď é ě í ň ó ř š ť ú ů ý ž). Any font
  covering Latin Extended-A suffices; *ř* and *ů* are the glyphs cheap font
  subsets miss. Diacritics are semantic (*byt/být/bít* differ), never
  decorative, and stripping them is a defect even in ALL-CAPS text.
- **Collation:** *ch* is a distinct letter sorted after *h*; č, ř, š, ž sort
  after their base letters. Locale-aware collation is mandatory for any
  user-visible sorted list; codepoint order visibly misfiles Czech names.
- **Casing:** sentence case throughout the UI. Czech capitalizes far less than
  English — no Title Case, no capitalized common nouns — so mechanical
  preservation of English capitalization is itself a defect class.
- **Numbers:** decimal **comma** (0,5), thousands separated by a space —
  no-break in rendered text (38 553). Percent: *space* before % when nominal
  (60 %), closed up when adjectival (60% sleva).
- **Date and time:** day-month-year with periods *and spaces* — 24. 8. 2026;
  24-hour clock. Currency symbol follows the amount with a no-break space
  (240 Kč).
- **Length:** Czech has no articles and drops pronouns, so plain sentences run
  near English length; noun phrases with case endings and the genitive-plural
  forms run +10–20%. There is no accepted UI abbreviation convention — plan
  layout for the longer form rather than abbreviating. See
  ui-conventions-and-length.
- **Typography:** Czech quotation marks open low and close high („…“); the em
  dash is not a
  Czech character; a number never wraps away from its unit. These are
  mechanically checkable and belong in automated gates. See
  typography-and-spacing.

## How the techniques divide the language

Register-and-address owns who the product speaks to and in which stratum.
Ui-conventions-and-length owns the form of controls, labels, and progress
states, and the space budget. Plural-and-count-agreement owns everything a
live number touches. Gender-neutral-forms owns unknown-person agreement and
placeholder gender. De-anglicization-constructions carries the largest anchor
set: the sentence-shape rules that separate grammatical Czech from native
Czech. Typography-and-spacing owns glyphs, spaces, and commas.
Terminology-and-loanwords owns the borrow/naturalize/translate decision, the
gender of loans, and the one-concept-one-word discipline.

What this subject deliberately does not own: any product's termbase (what
*this* product calls a workspace), its voice exemplars, its format contract,
and its recorded rulings where the house overruled the authority. Those are
consuming-repo artifacts; this subject teaches the mechanisms they instantiate.
