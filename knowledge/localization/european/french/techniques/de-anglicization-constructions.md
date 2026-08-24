---
layer: technique
type: technique
subject: french
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing French strings that read translated, rebuilding English sentence shapes into French ones, deciding whether a construction finding is a defect or taste]
---

# De-anglicization constructions

The rules a glossary cannot hold: how the sentence is built. A string can pass
terminology, typography and grammar checks and still read translated, because
English sentence architecture leaks through — and "reads translated" is taste
until the specific construction is named. Each rule here names one, so a review
can type the finding.

## The orientation warning: French wants nouns

Before any rule, the calibration that prevents imported damage. Languages that
prefer finite verbs treat English noun piles as a defect to unstack. **French
is the mirror image**: it prefers noun forms *more* often than English does —
*Utilisation de X* is the style guide's own model for "How to use X", and
*Gestion des accès* beats *Gérer les accès* as a section title. A reviewer
carrying another language's unstack-the-nouns rule into French will rewrite
correct strings into wrong ones. Construction rule sets are per-language
artifacts; sharing them across languages is itself the defect.

## FR-NOUN · Prefer the nominal form

> **Trigger** — an English gerund or infinitive heading ("Managing X",
> "How to configure Y") translated as a French infinitive clause.
> **Rule** — render headings, titles and section labels nominally: *Utilisation
> de X*, *Configuration de Y*, *Gestion des accès*. The infinitive survives as
> the imperative-analog on action controls, not as prose structure.
> **Source** — Microsoft French style guide §4.1.10 (nouns), which states the
> noun-preference outright.
> **Exception** — buttons and menu commands keep the verb (*Enregistrer*,
> *Comparer*) — the boundary between a title (nominal) and a control (verbal)
> is the deciding question, and it belongs to the interface-conventions
> technique when the element type is ambiguous.

## FR-ANACOLUTHON · Give the participle a subject

> **Trigger** — English "Once installed, the user will…", "When enabled, you
> can…" — a fronted participle whose implied subject is not the clause's
> subject.
> **Rule** — standard French treats the dangling participle as a grammar
> mistake, not a style blemish. Introduce the subject explicitly (*Une fois
> l'application installée, vous…*) or rebuild as a subordinate clause (*Quand
> cette option est activée, vous…*).
> **Source** — Microsoft French style guide §4.1.17 (syntax, anacoluthon).

## FR-SELON · *Selon* promises a choice

> **Trigger** — English "according to / depending on X, you can…".
> **Rule** — a French sentence opening with *selon* leads the reader to expect
> at least two alternatives to follow. When there is only one outcome, rebuild
> with *si*: *Si vous disposez des droits nécessaires, vous pourrez accéder à
> ces fichiers* — not *Selon vos droits, vous pouvez accéder à ces fichiers*.
> **Source** — Microsoft French style guide §4.1.17 (syntax).
> **Exception** — when the sentence genuinely enumerates alternatives, *selon*
> is exactly right; the rule bans the single-outcome calque, not the word.

## FR-FRAGMENT · A label must parse

> **Trigger** — an English clipped phrase — a bare prepositional phrase, a
> participle with no head, an elliptical idiom — carried into French as a
> standalone label, pill or chip.
> **Rule** — French UI fragments need a syntactic head to name their thing.
> English "near miss" is a noun phrase and names something; a bare *de peu* is
> a prepositional phrase naming nothing until a verb rescues it — *manqué de
> peu* parses. Recast the fragment so it reads as a noun phrase or a completed
> participle phrase.
> **Source** — minted from field review: bare-fragment labels kept surfacing as
> "reads translated" with no citable rule, and per
> [every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
> the recurring unanchored defect gets its anchor.
> **Exception** — established elliptical conventions stand: *Tous* on a filter,
> *En cours* as a status. The test is whether French UI convention has already
> conventionalized the ellipsis, not whether a fuller form is imaginable.

## Calqued geometry: order and connectors

Not every shape-leak has its own ID; these recur enough to check as a family,
and a finding cites the family:

- **Fronted adverbials** copied from English ("Alongside them, …" → *À côté
  d'eux, …*) — grammatical, but French prose prefers integrating the connector
  (*En complément…*) or dropping it.
- **Superlative position**: English fronts it ("Longest pause after…"); prose
  French wants *la pause la plus longue*. Article-less superlative labels are
  established in dashboard-French (*plus longue série*), so this is a defect in
  prose and a convention in stat labels — surface decides.
- **Adjective order**: the adjective usually follows the noun (*décision
  finale*); a preposed adjective on an English pattern reads off unless the
  adjective is one of the small preposed set (*grand, petit, nouveau, dernier…*).
- **Preposition-per-placeholder**: a fixed French preposition welded to a
  free-text placeholder (*travailler dans {location}*) breaks the moment the
  placeholder's referent varies (*dans Prague* / *à France* — both wrong,
  because cities take *à* and most country names take *en/au*). No single
  preposition is safe; recast so the placeholder sits in apposition or behind a
  labeling colon (*Lieu de travail : {location}*).
- **Passive of intransitive-with-à verbs**: English passivizes freely
  ("answered by evidence"); French verbs governing *à* cannot passivize
  (*répondue par des preuves* is ungrammatical). Rebuild with an active or a
  supporting phrase (*avec des preuves à l'appui*).

## When not to apply this

These rules govern prose the product authors. Do not rebuild quoted material,
and do not apply prose standards to telegraphic surfaces that French UI
convention has already settled (status pills, stat labels) — the fragment and
superlative exceptions above exist because dashboard-French is a real register,
not broken prose. And when a construction finding has no anchor here and no
family above, it is taste: queue it for a native call rather than rewriting a
clean-compiling string on instinct.
