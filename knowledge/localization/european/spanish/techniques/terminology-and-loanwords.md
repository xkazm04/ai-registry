---
layer: technique
type: technique
subject: spanish
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether a term stays English or gets a Spanish word, choosing regionally neutral vocabulary, building or auditing a Spanish termbase]
---

# Terminology and loanwords

Spanish tech vocabulary lives on a moving frontier between assimilated English and
native words, and it is split regionally besides. Both problems have the same
cure: decide each term once, record the decision, and audit against the record —
a defensible wrong choice applied consistently beats a perfect choice applied
sometimes.

## ES-LOAN · the loanword decision is a rule, not a vibe

For each English term, ask in order:

1. **Is it an initialism or a proper name?** Then it stays: *API*, *JSON*, *SDK*,
   *OAuth*, *URL* — untranslated, unpluralized in form (*las API*, though *las
   APIs* is common product usage; record one), gender assigned by the underlying
   Spanish noun (*la API* ← *la interfaz*, *el SDK* ← *el kit*).
2. **Is the English word fully assimilated in Spanish developer usage?** *Token*,
   *plugin*, *backend*, *frontend*, *pipeline*, *bug* (colloquial), *commit* —
   these read more natural borrowed than calqued, in developer-facing surfaces.
   The assimilation test is empirical, not introspective: the word appears
   untranslated in the major vendors' shipped Spanish UIs and in the product's own
   existing catalog. **Never mint a loanword the record does not already carry** —
   when unsure, translate and flag, because an unrecorded borrowing is a term
   split waiting to happen.
3. **Does an established Spanish equivalent exist?** Then use it: *dashboard* →
   **panel**, *log* → **registro**, *file* → **archivo**, *password* →
   **contraseña**, *settings* → **configuración**, *feature* → **función**,
   *release* → **versión**, *bug* (professional register) → **error**. Reaching
   for the English word here out of habit is the anglicism the published Spanish
   style authorities exist to stop.

Audience shifts the frontier: an operator tool for developers borrows more; a
consumer product translates more. The frontier's *position* is a product decision;
that it is recorded and consistent is not.

## ES-LOAN-MORPHOLOGY · a borrowed word must still behave as Spanish

A loanword that stays takes Spanish grammar around it: a gender (*el token*, *el
plugin* — anglicisms default masculine unless a feminine Spanish noun underlies
them), a plural (*plugins*, *tokens* — plain *-s*), and lowercase unless it is a
brand. What a loanword never does is conjugate ad hoc: verbs are not borrowed
raw (*"deployar"*, *"commitear"* stay out of product copy even where developers
say them aloud; write *desplegar*, *confirmar los cambios* or recast). The
academy's italics convention for foreign words is editorial prose practice — UI
copy does not italicize recorded loanwords.

## ES-REGIONAL · the computadora/ordenador class — neutral by construction

A short list of everyday nouns splits cleanly by region, and a one-Spanish
product must navigate every one:

| Concept | Spain | Latin America | Neutral tactic |
|---|---|---|---|
| computer | ordenador | computadora | **equipo** (established neutral in vendor UIs) |
| file | fichero | archivo | **archivo** (Spain reads it fine) |
| mobile phone | móvil | celular | **teléfono**, or **dispositivo** where it fits |
| to click | hacer clic / pinchar | hacer clic / dar clic | **hacer clic** (never *pinchar* — regional; never *clickear*) |
| video | vídeo | video | pick per variant; **video** for LatAm-leaning neutral |
| to take/grab | coger | agarrar/tomar | **never *coger*** — obscene in much of Latin America |

The tactics generalize: prefer the word both regions read unmarked (*archivo*),
prefer the hypernym when no shared word exists (*equipo*), and hard-ban the small
set that is offensive somewhere. Verb-family choices ride along: *monitorear*
(LatAm-leaning) vs *monitorizar* (Spain) — either is defensible, mixing them in
one catalog is not; the recorded termbase picks one.

## ES-TERM-ONE · one concept, one rendering — and one rendering, one concept

Spanish's rich synonymy makes term splits effortless: *capacidad*/*habilidad*/
*función*, *conector*/*conexión*, *programación*/*horario*, *revisión*/*reseña*.
The termbase assigns each product concept exactly one Spanish rendering and —
the half that gets forgotten — reserves that rendering against reuse for a
neighboring concept: when *capacidad* is taken for one concept, a second concept
must get a different word (*habilidad*), even though either word could translate
either concept in isolation. English pairs that collapse in Spanish need an
explicit ruling too: *run* and *execution* both want *ejecución* — the record
either accepts the merge or designates a secondary word, but a translator never
improvises one mid-catalog. The consolidation pass this law implies is judgment
work: most detected "splits" are legitimate distinct senses, and a scripted
rewrite destroys them.

## ES-FALSE-EQUIV · nearby words that are not the term

The termbase's negative space — established wrong-neighbor choices worth ruling
out explicitly because translators reach for them: *certificado* for a stored
credential (that is a certificate), *contraseña* for a credential generally (too
narrow), *gatillo* for a trigger (violent register; *disparador* is the tech
term), *salvar* for save (see de-anglicization-constructions — this rule covers
the term record, that one covers the construction audit). Recording the rejected
neighbor with a one-line reason is what stops each new translator from
re-deriving it.

## When not to apply

Brand names, feature names the product treats as brands, and third-party product
names are not terminology — they pass through untranslated and keep their casing,
and the only Spanish decision they need is a grammatical gender for the article.
User-generated and quoted content is never terminology-audited. And the termbase
itself is the consuming product's artifact: this technique teaches how to build
and audit one, never what any product's rows say.
