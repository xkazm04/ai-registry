---
layer: technique
type: technique
subject: czech
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing Czech strings that are grammatical but read translated, drafting Czech from an English source, citing a construction defect in a typed audit finding]
---

# De-anglicization constructions

The failure this anchor set exists for: strings that are grammatical,
termbase-compliant, correctly formal — and still shaped like English. That
failure has no anchor in any termbase, so an audit that requires every finding
to cite a rule reports such strings **clean**. These rules are the missing
anchors. Each has a stable ID; a reviewer cites the ID in the finding, which
turns "this feels translated" from taste into a reportable error, and a native
rejection that no ID explains is a *new rule here*, not a one-off fix.
Provenance is the Microsoft Czech Style Guide (section numbers per rule);
examples are neutral rewrites, not the guide's own sentences.

## CS-NOM · Unstack noun piles into a verb

> **Trigger** — English stacks modifiers or *of*-phrases, or its head is a
> nominalisation (*-tion*, *-ment*, *-ing* as a noun).
> **Rule** — Czech tolerates at most **two** chained prepositionless
> genitives. Break the chain: insert a preposition, or promote the head noun
> to a finite verb or a subordinate clause.
> **Source** — MS §4.1.7 (nouns), §4.1.17 (Czech uses more verbs than
> English).

The single highest-yield rule in the set. English builds meaning by stacking
nouns; Czech builds it by conjugating. ✗ *Souhrn odvozený z dat profilu
uživatele* (three bare genitives) → ✓ *Souhrn vychází z profilu uživatele a
z jeho dat*.

## CS-PASS · Short passive participle → long adjective or reflexive *se*

> **Trigger** — English passive (*is/was/will be* + past participle) in a
> sentence with a real subject.
> **Rule** — the short passive participle (*je nastaven*, *byla zrušena*)
> reads academic. Use the long deverbative adjective (*je nastavený*) or the
> reflexive *se* (*nastaví se*).
> **Source** — MS §4.1.9 (participles), §4.1.17 (prefer active voice).
> **Exceptions** — both found by over-applying the rule and reverting:
> (1) a bare **status chip** (*Odesláno*, *Doručeno*) — the short neuter form
> is the Czech UI convention for a state label; (2) an **elliptical headline
> fragment** with no subject (*Vyrobeno v Česku* shape) — the short passive
> is the idiom, and the "fix" leaves an adjective agreeing with nothing.

## CS-POSS · Drop the English possessive

> **Trigger** — *your/their/its* used as a determiner rather than to contrast
> ownership.
> **Rule** — English uses possessives where Czech uses nothing. Delete it
> unless removal changes who owns the thing. When the owner **is** the
> subject, Czech wants *svůj*, never *váš*.
> **Source** — MS §4.1.10 (pronouns → possessives).
> **Exception** — keep it where the possessive *is* the point: a tagline
> whose whole contrast is *vaše* versus *naše* keeps both.

## CS-POMOCI · *pomocí* is a formal crutch

> **Trigger** — English *using / via / with*.
> **Rule** — prefer *přes*, *díky*, or rebuild the clause around a verb:
> ✗ *Vyhledávání pomocí filtrů* → ✓ *Hledejte přes filtry*.
> **Source** — MS §5.3.

## CS-ANTHRO · The product is not a person

> **Trigger** — English makes the product the subject of a mental or
> volitional verb (*tries to*, *thinks*, *wants*, *is looking for*).
> **Rule** — move the action to the user, or to a reflexive/impersonal
> construction. The product may *do* things; it may not *want* them.
> ✗ *Aplikace se snaží najít shodu…* → ✓ *Hledá se shoda…*;
> ✗ *Systém si myslí, že…* → ✓ *Podle analýzy…*.
> **Source** — MS §5.3 (anthropomorphism).
> **Note** — where the English *deliberately* anthropomorphises in marketing,
> keep the verb but make it factual: *počítá s tím, že* passes, *domnívá se*
> does not.

## CS-ACTIVE · Name the actor

> **Trigger** — English agentless passive or a *there is/are* frame.
> **Rule** — put the actor in the subject slot; it is shorter and it is how
> Czech reports what happened. ✗ *Rozhodnutí bylo zaznamenáno.* →
> ✓ *Rozhodnutí jsme zapsali.* / *Rozhodnutí se zapsalo.*
> **Source** — MS §4.1.17.

## CS-CALQUE · Transcreate marketing, don't translate it

> **Trigger** — landing/marketing/empty-state copy: metaphors, wordplay,
> rhythm-carrying headlines.
> **Rule** — carry the *effect*, not the words. A metaphor without Czech
> currency is replaced, not rendered: a "funnel" is kitchen equipment in
> Czech, a "receipt" is a paper till slip — neither travels into HR or audit
> copy literally.
> **Source** — MS §2.1.4 (against word-for-word), which explicitly permits
> departing from the source to preserve voice.

## CS-PREP · Czech government picks the preposition

> **Trigger** — English *in/on/at/to* before a UI object.
> **Rule** — use the preposition the Czech noun governs, then check how the
> same noun is framed elsewhere in the catalog before inventing one — the
> defect is typically a minority of keys calquing English (*v nástěnce*)
> against a settled majority (*na nástěnce*). Not covered by CS-CALQUE (no
> metaphor), CS-NOM (no pile), or the termbase (the noun is already the
> settled word) — which is why it needs its own ID.

## CS-ABLE · An English *-able* adjective needs a verb clause

> **Trigger** — English predicates a capability with no subject
> (*Reversible*, *Exportable*, *Auditable*).
> **Rule** — a Czech deverbative adjective must agree with a noun; standing
> alone it dangles in the neuter. Promote to a finite verb with the user as
> actor (*Změnu vrátíte v nastavení*) or attach a real noun (*Vratná změna*).

## CS-DEM · A bare demonstrative needs its head noun back

> **Rule** — *Tato slova se objevují…*, not *Tato se objevují…*. Czech
> tolerates a bare demonstrative only when the referent is the immediately
> preceding subject; after a heading in an oblique case it reads as a
> dangling calque.

## CS-HADDONE · English resultative *had X done* is not *mít* + participle

> **Trigger** — *"{name} had an offer sent"*, *"had the export fail"*.
> **Rule** — Czech reports the event with a finite verb (*nepodařilo se
> odeslat podklady*, *vznikl návrh nabídky*), never *má neúspěšné odeslání*.
> The *mít* + long participle + nominalised head chain is the loudest
> translated pattern in event-log copy. Event feeds share one sentence shape
> across many keys — fix them as one coordinated rewrite, checking how the
> code concatenates the name with the phrase, not key by key.

## Using the set

Drafting: walk the triggers after writing, in order — CS-NOM and CS-PASS
catch the most. Review: cite the ID in the typed finding with a proposed
rewrite; a finding citing an ID here is major by default. When two rules seem
to overlap on a string, the more specific trigger owns it. When NOT to apply:
legal text, where the passive and the bookish frame are register-correct, and
quoted human speech, which is evidence, not product voice.
