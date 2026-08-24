---
layer: golden-path
type: golden-path
subject: german
status: forged
use_when: [translating or auditing a German catalog, deciding register and address for a German product, reviewing German strings that read translated, budgeting UI layout for German text expansion]
techniques:
  - register-and-address
  - capitalization-and-compounds
  - length-and-compression
  - de-anglicization-constructions
  - typography-and-spacing
  - terminology-and-loanwords
---

# German (de)

German is the deceptive locale. It shares an alphabet, a plural system and half
a technical vocabulary with English, so a translation pipeline that survives
German-looking output is easy to build — and the output is recognisably
translated German for reasons no spell-checker flags. The failures cluster in
exactly the places English gives no hint: an address system English lost
centuries ago, a casing rule English never had, sentence mechanics that punish
word-for-word transfer, and a length expansion that breaks layouts which
English fit with room to spare. A localizer who knows Romance languages is not
prepared for German; the problems are different in kind.

The craft splits into six concerns, each carrying anchored rules an audit can
cite by identifier: register and address (the Sie/du decision and the
plain-vocabulary discipline), capitalization and compounds (noun casing, ß, and
how words fuse), length and compression (German runs longest of the major
European locales), de-anglicization constructions (the syntactic tells that
expose a translation), typography and spacing (quotes, dashes, spaces — German
has opinions on all three), and terminology and loanwords (German tech
vocabulary is saturated with English, and the border needs governing, not
guessing).

## The register system, and how a product chooses

German grammaticalizes social distance. Every second-person sentence commits to
formal **Sie** (with **Ihr/Ihre**, verb in the formal plural) or informal
**du** (with **dein/deine**), and the commitment propagates: pronoun,
possessive, imperative form and reflexive all change together, so a register
slip is never one word — it is a sentence that visibly belongs to the other
product. There is no neutral option and no way to write around the choice for
long; "translate it politely" is not a spec.

The decision rule that holds across products: **B2B, professional and
operator-facing tools take Sie**; consumer social, gaming and youth-market
products may take du; and the choice is made once, recorded, and enforced as a
typed error — never left to each translator's ear. The predictable failure is
tone-tracking: a translator hits a warm, chatty source string and reflexively
reaches for du because the *tone* feels informal. Register in German is a
product-level contract, not a per-string mood; the warmth goes in the wording,
the pronoun stays what the contract says. Every real German catalog audit finds
this drift in conversational surfaces — onboarding, companion copy, empty
states — and nowhere else.

Register has a second axis English collapses: formality of *vocabulary* is
independent of formality of *address*. Siezen does not require
Behördendeutsch. The strongest B2B German is formal in address and plain in
word choice — and the bureaucratic register (chained -ung nominalizations,
mittels, seitens, hinsichtlich) is the loudest way German UI copy goes wrong
even with every pronoun correct.

## What makes a string smell translated

Translated German is usually grammatical. The tells are structural, and they
are auditable because each has a name and an anchor:

- **English prepositions under German verbs** — the sentence parses and still
  is not German, because German verbs govern their own prepositions and
  particles.
- **Nominal style** — English gerund chains rendered as -ung noun stacks where
  a German writer would conjugate a verb.
- **Hyphens doing the work of syntax** — English noun stacks stapled together
  in English order instead of being resolved by compounding or reordering.
- **Pleonasm** — an English intensifier translated onto a German noun that
  already contains the meaning, because German compounds are semantically
  dense.
- **Word-class anglicisms** — an English loan used with English grammar:
  undeclined, unpluralized, ungendered. German's own norm is the opposite: a
  borrowed word keeps its spelling and surrenders its grammar.
- **Collocation calques** — adjective-noun pairs transferred from English that
  German pairs differently; the adjective is right, the noun is right, the
  combination is foreign.

None of these is caught by checking meaning. All of them are caught by a
reviewer holding the construction rules in de-anglicization-constructions and
terminology-and-loanwords — which is why those rules carry identifiers: a
finding that cites `DE-CALQUE-PREP` is a defect, and the same sentence flagged
as "reads translated" is taste
([every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor)).

## Plurals and grammar facts a message system must know

German's CLDR cardinal categories are **one / other** — the same two as
English, with the same boundary (exactly 1, including 1.0 contexts by the same
rule English uses). A German catalog therefore keeps the source's plural branch
structure unchanged and translates inside the branches. This is a genuine
simplification — no Slavic few/many machinery — and a genuine trap: because the
branches match one-to-one, careless pipelines copy the English branch *bodies*
along with the structure, shipping English verb fragments inside German plural
syntax. Audit the branch contents, not just the branch set. CLDR's ordinal rule
for German is a single category: ordinals are written digit-plus-period
(1., 2., 3.), so no ordinal branching is ever needed.

Grammatical gender (der/die/das) is arbitrary, load-bearing, and extends to
loanwords: every noun a product introduces, borrowed or not, needs exactly one
gender decided once and recorded, because articles, adjective endings and
pronouns all inflect on it. Case morphology (four cases) means placeholder
substitution is riskier than in English: a name dropped into a slot may need a
different article or ending depending on the sentence frame, so frames are
written to keep placeholders in case-neutral positions where possible.

Word order: verb-second in main clauses, verb-final in subordinate clauses.
Translations that preserve English clause order produce legal-but-foreign
German; moving material — including placeholders — to where German wants it is
required, not permitted
([the format skeleton is inviolable](../../_laws.md#format-skeleton-is-inviolable)
governs the placeholder *names*, never their positions).

## What a layout engineer must know

German is Latin-script, left-to-right, no bidi, no shaping, no width-variant
punctuation — and it is still the locale most likely to break a layout, because
it runs **20–35% longer than English** for the same meaning and concentrates
the extra length in single unbreakable tokens: compounds. A 25-character
compound does not wrap; it overflows. Buttons, tabs, chips, table headers and
badges are where German fails first, and the fix hierarchy is craft, not
truncation — see length-and-compression. Reserve expansion room in any
container sized on English, and test line-break behaviour with real compounds,
not with lorem text. German also capitalizes roughly every other word (all
nouns), which makes German UI text visually heavier than English at the same
point size; that is correct, not a casing bug to "fix".

## Variants a product must decide about

The `de` locale conventionally serves Germany, Austria and Switzerland
together, and for UI-length text this mostly works — but three fault lines are
real. Swiss German orthography uses **ss** everywhere ß appears in Germany and
Austria; a catalog shipped as `de` uses ß per the standard rules, and only a
deliberate `de-CH` variant folds it. Currency and number formatting differ
(Switzerland's decimal and grouping conventions are not Germany's), which is
one more reason formatting stays in runtime locale machinery and never in
string values. And a scattering of vocabulary is regionally marked —
Austrian-leaning verbs and nouns read stilted to a German audience and vice
versa; when a reviewer flags a word as regional, the ruling is a termbase
decision for the product's primary market, not a correctness call.

## The boundary

This subject owns what German demands of any product: the register mechanics,
the orthography, the constructions, the typography, the loanword grammar.
It does not own any product's choices *within* that space: which register a
given product chose, its termbase rows, its tone exemplars, or a house ruling
that overrules a published authority (a house may ban a punctuation mark the
language allows — legitimate exactly when the ruling is recorded where the
rule lives,
[the authority is a hypothesis](../../_laws.md#the-authority-is-a-hypothesis)).
Those artifacts live with the product. What travels is the rule set and its
identifiers, so that every product's audits cite the same anchors.
