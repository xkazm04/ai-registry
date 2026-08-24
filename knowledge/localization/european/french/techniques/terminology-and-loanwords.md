---
layer: technique
type: technique
subject: french
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether a term stays English or goes native in French, pinning gender and agreement for borrowed nouns, auditing a French catalog for term drift]
---

# Terminology and loanwords

French carries a reputation for resisting English that its own tech registers
do not honor: professional French developer and product speech borrows freely
(*le workflow*, *le matching*, *la data*, *le pipeline*), while official
terminology bodies coin native replacements that professionals often ignore.
Localizing into French therefore means navigating three forces — what the
Académie-adjacent authorities prescribe, what the domain's professionals
actually say, and what the product has already shipped — and the technique is
not picking the "correct" side but making one recorded call per term and
holding it.

## The decision rule for borrow-versus-translate

When a term is not yet in the product's termbase:

1. **If the loanword already reads as normal professional French in the
   product's domain** (*workflow*, *pipeline*, *scorecard* in HR-tech,
   *endpoint* in developer surfaces), prefer borrowing over an
   accurate-but-stilted native coinage — a bad literal translation reads worse
   to a French professional than the English word does.
2. **If a native term is dominant in the domain**, use it: *entretien* not
   *interview*, *présélection* not *screening*, *identifiant* not *credential*.
3. **If both are current** (*onboarding* / *intégration*, *AI* / *IA*), the
   choice is arbitrary and the *consistency* is not: decide once, record the
   ruling, sweep completely — per
   [one concept, one rendering](../../../_laws.md#one-concept-one-rendering),
   a catalog split 93/25 between two spellings of one concept is a defect even
   though both spellings are right, and a half-sweep that "fixes" one namespace
   converts a split into an incoherence.
4. **Never-translate is a closed list, not an instinct**: brand names,
   technical identifiers (API, CLI, JSON, OAuth…), placeholders, code
   literals, enum values, user-generated content, and tier/plan **names** —
   only the generic word around them translates.

Beware the false friend and the collision: *librairie* is a bookshop,
*éventuellement* is "possibly", *revenu* is income-in-general where a wage
figure wants *salaire*, and *locataire* for a multi-tenant "tenant" reads as an
apartment renter — French SaaS keeps *tenant* or recasts to *organisation*.
Legal registers have their own fixed terms that override product habit: data-
protection French says *sous-traitant* (processor) and *sous-traitant ultérieur*
(subprocessor), and a product page that collapses the two is ambiguous exactly
where ambiguity is expensive.

## FR-ONE-WORD · One concept, one word

> **Rule** — check the termbase before inventing a rendering; add the row when
> you decide one. The audit signal is mechanical — one source term, two-plus
> target renderings across the catalog — but the ruling on each candidate is
> judgment: many apparent splits are legitimately different senses.
> **Source** — the cross-language consistency law, instantiated for French,
> where the loanword/native fork doubles the natural drift rate: *endpoint*
> was found rendered three ways (loanword, *point d'accès*, *point de
> terminaison*) in one catalog, every one of them defensible French.
> **Exception** — deliberate sense splits, recorded: a product may render
> "review" as *révision* (artifact) and keep *revue* in one legacy surface, or
> distinguish reject (operator refuses) from decline (candidate refuses) with
> different verbs. The ruling lives in the termbase row; per
> [the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis),
> count actual usage before enforcing either direction, and correct whichever
> artifact — termbase or catalog — turns out to be the drifted one.

## FR-LOANGENDER · A borrowed noun gets a pinned gender

> **Trigger** — any loanword kept in the catalog that an article, adjective or
> participle will ever touch.
> **Rule** — assign the gender at adoption time and record it in the termbase
> row; do not let each string improvise. French assigns borrowed nouns
> masculine by strong default (*le workflow*, *un scorecard*, *le matching*),
> including *-a* endings that look feminine by analogy with Latin (*un
> agenda* → *un persona*); a feminine assignment happens when a French
> hypernym imposes it (*la data*, by *les données*).
> **Source** — minted from field review: agreement corrections on a borrowed
> noun were found blocked because no ruling existed to correct *toward* — the
> gender call must precede the agreement sweep.
> **Exception** — none; even a never-articled brand name costs nothing to pin,
> and the first marketing sentence that writes *le/la* in front of it will
> thank the row.

## Derived forms are separate decisions

Licensing a loanword does not license its derivations. *Matching* borrowed as
a noun says nothing about *matcher* as a verb (*matché* participles read
franglais at a higher register cost than the noun) or *matchable* as an
adjective (unassimilated; *exploitable par le moteur de matching* is the native
recast at a length cost). Decide noun, verb and adjective separately, and
expect the answer to differ — the common landing zone is loanword-noun plus
native-verb (*mis en correspondance*), which is consistent, if asymmetric, once
recorded.

## Acronym gender and the AI/IA archetype

An acronym takes the gender of its head noun — *l'IA* is feminine
(*intelligence artificielle*), *le KPI* masculine by default-borrowing. The
AI-versus-IA choice is the archetypal French house decision because it is not
one decision: keeping English *AI* (common in product marketing) versus native
*IA* (what a French-first product would write) cascades into gender, elision
(*l'IA* vs *l'AI*), and every compound (*modèles d'IA*). Whichever way the
house rules, the ruling must name the acronym's article and gender, not just
its spelling.

## When not to apply this

Do not enforce France-French loanword posture on a Canadian French catalog —
the OQLF-aligned register translates far more (*courriel*, *clavardage*), and a
term ruling made for `fr` does not transfer to `fr-CA`. Do not sweep an
undecided split: while a fork is recorded as open, the reviewer flags new
occurrences and leaves shipped ones alone — a half-sweep is the one outcome
worse than either consistent answer. And do not mistake register variation for
term drift: a formal surface writing *flux de travail* in a long explanatory
sentence while chips say *workflow* can be a recorded, legitimate two-register
ruling — the defect is only when no ruling exists.
