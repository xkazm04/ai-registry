---
layer: technique
type: technique
subject: english
technique: false-friends-and-collocations
status: forged
laws: [one-concept-one-rendering, every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing word choice in English derived from Czech, German or other Central European sources, naming site sections and navigation in English, checking verb-noun collocations]
---

# False friends and collocations

Word choice is the layer no checker sees. Every word flagged here is valid English: *actual*,
*eventually* and *realize* are spelled right and used grammatically, so a spellchecker, a grammar
checker and a skimming reviewer all pass them. The damage is to meaning (*eventually* promises a
delay where the author meant *possibly*) and to trust (*References* in the navigation tells a
native buyer the site was not written for them). Because the English sense is sometimes the one
intended, these rules flag for review and never auto-fix.

## EN-FALSE-FRIEND · Check cognates against the lexicon; flag, never auto-fix

> **Trigger** — an English word that resembles a word in the source language.
> **Rule** — check the lexicon row; propose the usual rendering; a reviewer confirms the sense.
> **Source** — Swan & Smith 2001; bilingual dictionaries; recurring findings in reviews of
> Czech- and German-derived English.
> **Exceptions** — the English sense is meant (*actual results versus forecast*).

| Source word | Tempting English | Usually means |
|---|---|---|
| aktuální (cs), aktuell (de) | actual | current, latest |
| eventuálně (cs), eventuell (de) | eventually | possibly, if needed |
| komplexní (cs) | complex | comprehensive, end-to-end |
| realizovat, realizace (cs) | realize, realization | deliver, carry out; project, our work |
| sympatický (cs) | sympathetic | likeable, friendly |
| konkurence (cs) | concurrence | competition |
| kontrola (cs) | control | check, review |
| prospekt (cs) | prospect | brochure |
| fabrika (cs) | fabric | factory |
| seriózní (cs), seriös (de) | serious | reputable, trustworthy |
| akce (cs) | action | sale, event, promotion |
| perspektivní (cs) | perspective | promising |
| disponovat (cs) | dispose of | have, offer |
| aktualizovat (cs) | actualize | update |
| formulář (cs) | formular | form |
| konsequent (de) | consequent | consistent |
| sensibel (de) | sensible | sensitive |
| bekommen (de) | become | get, receive |
| evidence (cs) | evidence | records, register (not proof) |
| geniální (cs) | genial | brilliant |
| patetický (cs) | pathetic | grandiloquent, overblown |
| reference (cs, site section) | references | customers, case studies |

✗ *Eventually, we will contact you with an actual offer.* → ✓ *If needed, we'll contact you with
a current offer.*

## EN-SECTION-NAMES · Name site sections as English-language sites do

> **Trigger** — navigation, footer and page titles rendered from a source-language site map.
> **Rule** — *Customers* or *Case studies* (not *References*), *Our work* (not
> *Realizations*), *News* (not *Actualities*), *Pricing* (not *Price list*), *Careers*,
> *Contact*, *Privacy policy* (not *GDPR*).
> **Source** — practitioner convention across English-language company sites. Recorded from one
> research lane with high practitioner frequency; confirm against the audience's own
> competitors' navigation before citing it as a blocking rule.
> **Exceptions** — a declared house name for a section that the termbase records.

✗ *References · Realizations · Price list · GDPR* → ✓ *Customers · Our work · Pricing · Privacy
policy*.

## EN-COLLOCATION · Use the native verb-noun pair

> **Trigger** — a verb chosen by translating the source verb rather than by the noun's
> collocation.
> **Rule** — *take a course*, *ask a question*, *make a payment*, *handle a request*, *meet a
> deadline*, *raise a concern*, *place an order*.
> **Source** — original English carries more strongly bound collocations than translated English
> (Volansky, Ordan & Wintner 2015).
> **Exceptions** — a term of art that the domain fixes differently.

✗ *Realize the payment and we will solve your request.* → ✓ *Make the payment and we'll handle
your request.*

## EN-IDIOM-CALQUE · Replace a source idiom with an English one, or say it plainly

> **Trigger** — a word-for-word source idiom, proverb or metaphor.
> **Rule** — find an English idiom of the same function, or state the point without one. In UI,
> always state it plainly.
> **Source** — transcreation practice; see EN-TRANSCREATE.
> **Exceptions** — an idiom that happens to exist in English with the same meaning.

✗ *Web on a key* · *No cat in a bag* → ✓ *Turnkey websites* · *No surprises*.

## EN-OPINION · "we think" and "if", not "according to us" and "in the case that"

> **Trigger** — *according to us*, *according to me*, *in the case that*, *in case of* for a
> condition.
> **Rule** — *we think*, *in our view*, *if*.
> **Source** — Swan & Smith 2001.
> **Exceptions** — *according to* a named third party (*according to the 2025 survey*); *in
> case* meaning a precaution (*keep a backup in case the import fails*).

✗ *According to us, in the case that you need more seats, the Pro plan is better.* → ✓ *If you
need more seats, we recommend Pro.*

## EN-ONE-TERM · One concept, one term

> **Trigger** — two English words for one product concept across a catalog (*workspace* and
> *project*, *repository* and *repo*), or one word for two concepts.
> **Rule** — pick one rendering, record it in the termbase with its forbidden variants, and hold
> it on every surface.
> **Source** — [one concept, one rendering](../../../_laws.md#one-concept-one-rendering).
> **Exceptions** — a legitimate second sense; a glossary entry that introduces an abbreviation
> once.

✗ *Create a workspace* on one screen, *Your projects* on the next, for the same object → ✓ one
term, the other recorded as forbidden.

## Using the set

Run EN-FALSE-FRIEND and EN-SECTION-NAMES as a candidate search, not a rewrite: match the
lexicon, then read each hit in context, because the English sense is sometimes right and a
scripted replacement destroys it. EN-COLLOCATION and EN-IDIOM-CALQUE need a reader; they are
where a native reviewer earns their fee. EN-ONE-TERM runs mechanically against the termbase's
forbidden variants. A lexicon miss that a reviewer catches is a new row in the table, cited by ID
from then on ([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)).

When NOT to apply: quoted source text and proper names that contain a cognate; a domain where the
English sense of the cognate is standard (*control* in engineering, *evidence* in legal copy);
and audiences for whom the product deliberately keeps a source-language section name as a brand
term.
