---
layer: golden-path
type: golden-path
subject: french
status: forged
use_when: [translating or reviewing a product catalog into French, auditing French strings for typography and construction errors, deciding register and terminology policy for a French locale, budgeting layout for French text expansion]
techniques:
  - register-and-address
  - typography-and-spacing
  - plural-and-agreement
  - de-anglicization-constructions
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# French (fr)

French is the locale where the mechanical layer betrays a translation before the
words do. A French reader spots a straight apostrophe, a missing space before a
question mark, or an em dash in prose faster than they spot a mistranslated verb
— the typography is codified, the codification is taught in school, and getting
it wrong reads not as foreign but as careless. That inverts the usual triage:
in most languages the first audit pass hunts meaning errors; in French the first
pass is typographic, it is largely mechanical, and it clears the noise so the
construction-level review can see.

The second thing French demands is respect for its own rhetoric. French is not
a language you reach by relaxing English word order and swapping vocabulary; it
has a preferred sentence architecture — nominal, connected, subject-explicit —
and English habits (dangling participles, "depending on X" openers, bare noun
piles used as labels, dashes doing the work of syntax) each collide with a named
French rule. This subject carries those rules as citable anchors (`FR-*`), so a
review can type its findings instead of arguing taste.

## The register system, and how a product chooses

French grammatically encodes formality in the second person: *tu* (informal
singular) versus *vous* (formal, and also the plural). For product interfaces
the decision is close to settled: **vous, always** — B2B, developer tools,
professional software, legal and transactional surfaces, all without exception.
*Tu* is a deliberate brand posture reserved for consumer products courting a
young audience, and even brands that market in *tu* usually fall back to *vous*
on payment, legal and account-security surfaces. The costly failure is not
choosing wrong but **mixing**: a single *ton compte* inside a *vous* product
reads as a different person suddenly speaking. Because the choice inflects
verbs, possessives and object pronouns, it cannot be retrofitted by
find-and-replace; it is the first line of the locale contract, decided before
the first string. The Microsoft French (France) style guide — the most commonly
adopted public authority for French software — assumes *vous* throughout and
additionally bans a family of impersonal and over-formal constructions
(`FR-IMPERSONAL`, `FR-FORMAL`): French formality lives in the address system,
not in stiff vocabulary.

## What makes a French string smell translated

Ranked by how reliably a native reader flinches:

1. **Typewriter typography.** Straight apostrophes, `"` quotes instead of
   guillemets, no space before `; : ! ?`, three periods for an ellipsis, em
   dashes as prose punctuation. Each is anchored (`FR-APOS`, `FR-SPACE`,
   `FR-DASH`, `FR-ELLIPSIS`) and each is mechanically sweepable — which is why
   an English-pipeline origin is so visible: the defects arrive in bulk.
2. **English Title Case.** French capitalizes the first word and proper nouns,
   nothing else — languages, days, months and job titles are lowercase. A
   catalog full of `Créer Un Persona`-shaped labels announces its source
   language in every menu.
3. **Calqued sentence shape.** A participle with no subject ("Une fois
   installé, vous…" — `FR-ANACOLUTHON`), *selon* promising alternatives that
   never come (`FR-SELON`), a fronted adverbial copied from English, a
   superlative in English position. Grammatical French, foreign rhythm.
4. **Bare fragments doing a label's job.** English tolerates noun phrases and
   clipped prepositional phrases as UI labels; French wants the fragment to
   parse — a pill reading *de peu* names nothing until a verb rescues it
   (`FR-FRAGMENT`).
5. **Unpinned franglais.** Not loanwords as such — French tech speech borrows
   freely — but *inconsistent* borrowing: the same concept rendered natively in
   one namespace and as a loanword in the next, or a borrowed noun whose gender
   drifts string to string (`FR-ONE-WORD`, `FR-LOANGENDER`).

The counter-intuitive entry on this list is what is **absent**: heavy
nominalization is NOT a smell in French. Where several Slavic languages read
stacked nouns as bureaucratic and want finite verbs, French prefers the noun
form more often than English does — *Utilisation de X* for "How to use X" is
the style guide's own model. A reviewer carrying another language's
unstack-the-nouns instinct into French will damage correct strings; this is the
standing proof that construction rules are per-language artifacts, never shared
(`FR-NOUN`).

## Plurals: the CLDR categories, and the trap at zero

French cardinals use three CLDR categories, and two of them are traps for
anyone arriving from English:

- **`one` covers 0 AND 1.** *0 poste, 1 poste, 2 postes* — zero is singular in
  French. A catalog that reuses English's two-way split with zero falling into
  the plural branch renders *0 postes*, wrong, in every counter that can reach
  zero (`FR-ZERO`).
- **`many` exists, for the millions.** Since CLDR 38, round millions and above
  (and compact-notation numbers) take `many`, because French binds the noun
  through *de*: *1 million de messages, 2 millions de messages*. A two-branch
  message renders *2 millions messages* the day a counter crosses a million —
  rare, silent, and worth a third branch wherever large counts are plausible
  (`FR-MANY`).

Beneath the categories sits agreement: adjectives and past participles agree in
gender and number with their noun, and the agreement does not stop at the
plural-block boundary. The classic incident shape is a verb or pronoun outside
the plural block staying plural while the `one` branch renders a singular noun
— *1 poste … n'ont pas passé* — a bug no source-language reviewer can see
(`FR-AGREE`). The unknown-referent problem (a person of unknown gender behind
*candidat retenu*) has no free solution in French; it has three costed ones —
generic masculine, the parenthesized *(e)* the style guides tolerate only under
space pressure, or a neutral recast — and the choice is a per-product policy to
record once, not a per-string improvisation.

## Script and layout facts an engineer must know

Latin script, left-to-right, no shaping or bidi concerns. The costs are
elsewhere:

- **Expansion.** French runs roughly 15–25% longer than English on average, and
  further on legally precise or compound phrasing. Chips, tabs, table headers
  and buttons are where it bites; the fix is shorter French, never a smaller
  font (`FR-LENGTH`).
- **Non-breaking spaces are load-bearing.** The space before `; : ! ?` and
  inside `« »` must not break — a line starting with a lone `?` is the visible
  failure. The character choice (narrow U+202F versus word U+00A0) is a house
  decision; that it is non-breaking is not (`FR-SPACE`, `FR-UNIT`).
- **Accents survive capitalization.** *État*, *Événement*: uppercase letters
  keep their accents in modern professional French — a case-folding pipeline
  that strips them ships misspellings.
- **Numbers and dates are runtime artifacts.** Space-grouped thousands,
  trailing currency (*1 234,56 €*), comma decimals: never hardcoded into a
  string, always produced by the formatting layer from the locale, with the
  placeholder left intact.

## Regional variants

`fr` unqualified conventionally means France French, and this subject is
written to it. Canadian French (`fr-CA`) is a genuinely separate target with
its own authority (the OQLF), a stronger institutional resistance to English
loanwords — *courriel* where France writes *e-mail*, *clavardage* for chat —
and different typographic detail (notably no space before `; ! ?`, only before
`:`). Belgian and Swiss French are close enough to France French for one
catalog; Canadian is not, and "we'll adjust it later" underestimates how many
strings the loanword posture alone touches. Choose the market before choosing
the words.

## How the techniques divide the ground

Address and tone is [register-and-address](techniques/register-and-address.md);
the mechanical layer is
[typography-and-spacing](techniques/typography-and-spacing.md); the counting
and agreement machinery is
[plural-and-agreement](techniques/plural-and-agreement.md); the sentence-shape
rules that separate French from translated English are
[de-anglicization-constructions](techniques/de-anglicization-constructions.md);
the borrowing policy and its consistency discipline is
[terminology-and-loanwords](techniques/terminology-and-loanwords.md); and the
interface-specific conventions — casing, labels, length — are
[ui-conventions-and-length](techniques/ui-conventions-and-length.md).

Two habits govern all six. Every rule here carries an identifier, because
[every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor)
is what turns a French review from taste into an audit — and when a real defect
has no anchor yet, the move is to mint one, not to fix the string quietly. And
where a catalog is split between two defensible renderings — the native word
and the loanword, the impersonal and the personal error message — the repair is
one recorded decision followed by one complete sweep, because
[one concept gets one rendering](../../_laws.md#one-concept-one-rendering) and a
half-sweep is worse than the split it was meant to heal: it converts a
consistent imperfection into an inconsistency no rule can adjudicate.
