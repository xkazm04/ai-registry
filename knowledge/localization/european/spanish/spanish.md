---
layer: golden-path
type: golden-path
subject: spanish
status: forged
use_when: [localizing a product into Spanish, auditing or bulk-translating a Spanish catalog, deciding register or regional variant for a Spanish release, reviewing Spanish strings flagged as sounding translated]
techniques:
  - register-and-address
  - plural-and-gender-agreement
  - de-anglicization-constructions
  - typography-and-punctuation
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# Spanish (es)

Spanish looks like the easy locale — Latin script, left-to-right, a plural system
close to English, half a billion speakers producing training data for every machine
translator. That surface ease is exactly why Spanish catalogs rot: nothing *fails*
when the translation is mediocre, so mediocrity ships. The craft of Spanish
localization is almost entirely about decisions the source language never forces you
to make — which Spanish, which register, which gender — plus the discipline of
undoing English patterns that Spanish renders fluently but wrongly.

## The first decision is which Spanish

Before a single string is translated, the product decides what "es" means. The major
published authorities ship *four* Spanish variants — Neutral, Spain, Mexico, and US —
and that split is the honest shape of the problem: Peninsular and Latin American
Spanish differ in everyday vocabulary (*ordenador*/*computadora*, *fichero*/
*archivo*, *móvil*/*celular*, *coger* — harmless in Spain, obscene in much of Latin
America), in number formatting, and at the edges in verb morphology.

Most products ship **one** Spanish, and the correct default for one-Spanish products
is **neutral international Spanish**: the register and lexicon that reads as normal
educated Spanish everywhere and as marked nowhere. Neutral Spanish is not a natural
dialect — nobody speaks it — it is an engineered compromise, and it is built by
rule, not by instinct: prefer the pan-Hispanic word where one exists (*archivo*,
*equipo*, *contraseña*), avoid words that are regionally exclusive or regionally
offensive, avoid *vosotros* (Spain-only) and *voseo* (River Plate), and keep verb
forms that every region parses. The one place neutrality genuinely cannot be
engineered away is second-person plural — *vosotros guardáis* vs *ustedes guardan* —
where neutral Spanish always takes *ustedes*, because Spain understands it and Latin
America does not understand the reverse. See terminology-and-loanwords for the
lexical mechanics.

The decision is recorded once, in the consuming product's own artifacts, and every
later string is audited against it. A catalog that mixes *ordenador* in one section
with *computadora* in another has not chosen badly — it has failed to choose.

## Register: a three-way system collapsed to one recorded choice

Spanish addresses "you" three ways: **tú** (informal singular, universal), **usted**
(formal singular, universal), and **vos** (informal singular, Argentina/Uruguay and
pockets of Central America, with its own verb forms: *guardá*, *elegí*). A product
ships exactly one, and the choice is a *voice* decision, not a grammar one: consumer
products increasingly ship *tú* (the direction the major vendors' own consumer
voice has moved), professional and operator tools still overwhelmingly ship
*usted*, and *vos* is only ever correct for a deliberately Argentine product.

Two facts make Spanish register more forgiving than German or French, and both are
load-bearing for length budgets. First, Spanish is radically **pro-drop**: the verb
ending carries the register (*guarde* is already formal, *guarda* already informal),
so the pronoun itself almost never appears — writing *usted* into a string to "mark"
formality is a defect, not diligence. Second, the **bare infinitive on action
controls is register-neutral**: *Guardar*, *Cancelar*, *Eliminar* commit to neither
tú nor usted, which means a catalog's buttons survive a register change untouched
and only conjugated sentences need auditing. See register-and-address and
ui-conventions-and-length.

The classic Spanish register failure is not the wrong choice but **drift**: sections
translated by different hands in different years, half *tú*, half *usted*. Mixed
register inside one product is a defect in both directions at once, and it hides,
because every individual string is correct.

## Gender agreement is the tax on every string

Every Spanish noun is masculine or feminine, and articles, adjectives, and
participles agree: *el archivo guardado*, *la plantilla guardada*. English, which
inflects nothing, lets developers build strings — *"{item} deleted"* — that Spanish
cannot translate correctly for both genders at once. This is the deepest structural
problem in Spanish localization because it is invisible in the source and unfixable
by the translator alone: the honest resolutions are recasting the sentence so
agreement never fires (*"Se eliminó: {item}"*), pushing gender into the message
format's selection syntax, or filing the string as a source defect. Guessing
masculine and shipping is the common resolution, and it is a typed error.

The related decision is gender for the *user* — an unknown referent. The language
academy's position is that the grammatical masculine covers mixed and unknown
reference; inclusive alternatives (*-x*, *-@*, *-e*) are not sanctioned by any
standards authority and break screen readers, so UI copy achieves inclusiveness by
**recasting**: epicene nouns, articles dropped, second person used directly. See
plural-and-gender-agreement.

## Plurals: two categories, and a third that ambushes big numbers

Spanish cardinals split CLDR-style into **one** (n = 1) and **other** — crucially,
**zero takes other**: *0 archivos*, never *0 archivo*. Since CLDR 42 Spanish also
has a **many** category for large compact numbers (millions and beyond), reflecting
that Spanish says *1 millón **de** usuarios* — the number becomes a noun taking
*de*, and a plural pipeline that hardcodes two categories renders it wrong. Ordinals
have a single category, and get abbreviated with gendered superscripts (*1.º*,
*1.ª*), never English *1st*. See plural-and-gender-agreement.

## What makes a Spanish string smell translated

The tells are consistent enough to enumerate, and every one of them is an anchored
rule in de-anglicization-constructions:

- **False friends** — *actual*, *aplicar*, *soportar*, *librería*, *suceso*,
  *salvar*, *remover*, *asumir*, *eventualmente* — each fluent, each meaning the
  wrong thing. Machine translation makes these less often than it used to; tired
  humans make them constantly.
- **English Title Case** imported into multi-word labels. Spanish uses sentence
  case for everything below a proper noun, and days, months, and language names are
  lowercase (*lunes*, *enero*, *español*).
- **Possessive overuse** (*"Guarde sus cambios en su carpeta"*) where Spanish uses
  the article, and **subject pronouns inserted** where pro-drop drops them.
- **The -ing calque**: English gerund headings translated as Spanish gerunds
  (*"Administrando usuarios"*) where Spanish wants a noun (*"Administración de
  usuarios"*); the Spanish gerund is for genuinely in-progress states
  (*"Guardando…"*) and little else.
- **Agentless passives** (*"El archivo fue eliminado"*) where Spanish reaches for
  the reflexive *se* (*"Se eliminó el archivo"*).

## Typography a reviewer can check mechanically

Spanish is the only major language with **opening punctuation**: *¿* and *¡* open
every direct question and exclamation, including ones that begin mid-sentence — and
their absence is a hard error, not a style choice, per the language academy. UI
strings that are full interrogative sentences (*"¿Guardar los cambios?"*,
*"¿Olvidó su contraseña?"*) need them; elliptical labels that merely end in a
question mark by convention do not become questions and should usually be recast.
Guillemets *«»* are the academy's first-level quotation mark (Latin American
practice accepts curly *“”*; a product picks one and records it); the ellipsis is
the single glyph *…*; numbers format regionally (decimal comma in Spain and most of
South America, decimal point in Mexico and Central America) which is precisely why
a literal formatted number inside a translated string is a source defect, not copy.
Unlike French, Spanish wants **no space** before any punctuation — no non-breaking
space rules to enforce, one entire failure class absent. See
typography-and-punctuation.

## What a layout engineer must know

Latin script, LTR, no shaping, no ZWJ/ZWNJ concerns. Spanish runs **15–25% longer
than English** for UI prose and worse for single nouns (*review* → *revisión*;
*workflow* → *flujo de trabajo*, 2.4×), so every column, chip, and button is a
truncation risk, and the mitigation is lexical (shorter synonym, bare infinitive,
established loanword) before it is typographic. Diacritics are not decoration:
*año*/*ano* differ by one tilde and the second is anatomy — a pipeline that strips
or mangles non-ASCII (*á é í ó ú ü ñ ¿ ¡*) corrupts meaning, not just polish. All
of it is ordinary UTF-8; the historical "charset" excuses are dead. See
ui-conventions-and-length.

## How to work

Order of operations for a new Spanish catalog, and the audit order for an existing
one: variant and register first (they gate every string), then terminology (one
concept, one rendering, recorded), then the string-level passes — agreement,
constructions, typography — which are mechanical once the decisions above exist.
Every rule in this subject's techniques carries a stable `ES-*` identifier so a
review finding can cite the rule it rests on; a Spanish defect that no rule covers
is a prompt to mint the next anchor, not a judgment call to argue about.
