---
layer: technique
type: technique
subject: german
technique: register-and-address
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing Sie or du for a product, auditing register drift in conversational strings, deciding a gender-inclusive form policy]
---

# Register and address

German second person is a contract, not a translation choice. This technique
carries the rules that govern the contract: how it is chosen, how it drifts,
and the two register concerns English never surfaces — vocabulary formality and
gender-inclusive forms — that must each be decided once, product-wide, before
any translator can be consistent.

## DE-ADDRESS · One address form, chosen once, enforced as an error

> **Trigger** — any second-person string; any new surface added to a product.
> **Rule** — the product picks **Sie** (formal) or **du** (informal) once, for
> the whole catalog, and records the choice. B2B, professional and
> operator-facing products take Sie; du is a deliberate consumer/youth-market
> decision, never a default. After the decision, the other form is a typed
> error, not a style note. The full paradigm moves together: Sie/Ihnen/Ihr(e),
> verb in formal plural, imperative "Speichern Sie"; or du/dir/dein(e), verb in
> 2nd singular, imperative "Speichere".
> **Source** — the published German localization style guides of the major OS
> vendors all fix the address form per product (the widely used vendor guide
> for German prescribes Sie for professional software); the rule that the form
> is *fixed and recorded* is the transplantable core.
> **Exception** — marketing headlines sometimes run infinitive ("Stelle
> beschreiben. Rubrik erhalten.") with no pronoun at all; a verbless headline
> is register-neutral and legal under either contract. It is an escape valve,
> not a third register.

The reliable drift pattern: conversational surfaces — onboarding tours,
assistant/companion chat, playful empty states — pull translators toward du
because the *tone* is warm. Every audited German catalog shows this exact
distribution of register breaks: clustered in chatty strings, absent from
transactional ones. The fix rule: warmth lives in word choice and rhythm
("Lassen Sie uns loslegen" is warm and formal); the pronoun never tracks tone.
Convert on sight, in the same edit that touches the string.

## DE-FORMAL · Plain word, not the bureaucratic one

> **Trigger** — a formal-address product whose copy starts sounding like a
> government form.
> **Rule** — formality of address and formality of vocabulary are independent
> axes. Sie-form products still use plain verbs and plain function words:
> *unterstützen/helfen* not *Unterstützung bieten*, *teilweise* not *partiell*,
> *benötigen* not *erfordern*, *mit/über* not *mittels*, *von/zu/für* not
> *seitens/hinsichtlich/bezüglich*, *alle* not *sämtliche*.
> **Source** — the vendor style guide's words-and-phrases-to-avoid list; the
> axis-independence framing is the craft generalization.
> **Exception** — legal and compliance copy (privacy notices, terms) may
> legitimately need the precise bureaucratic term; the exception is scoped to
> surfaces where the precise term is load-bearing, not to surfaces that merely
> feel serious.

Behördendeutsch is the loudest register failure in German B2B copy precisely
because every pronoun is correct — reviewers who only check the address form
pass it. Pair this rule with the nominal-style rule in
de-anglicization-constructions: chained -ung nouns and bureaucratic vocabulary
are the same disease at the syntax and lexicon levels.

## DE-ANTHRO · The product is not a person

> **Trigger** — copy where the software is the grammatical subject of a mental
> verb.
> **Rule** — the product may *do* (prüft, speichert, erstellt); it may not
> *want*, *think*, *try* or *feel* (möchte, denkt, versucht gern). German
> tolerates less anthropomorphism in professional software than English, and
> a first-person singular product voice ("Denke nach…") reads as a register
> break where sibling strings use the passive ("Wird erstellt…").
> **Source** — the vendor guides' voice sections for German; the first-person
> progress-label inconsistency is a recurring real-catalog finding.
> **Exception** — an explicitly conversational assistant surface may carry a
> first-person voice *by recorded product decision*; then the decision covers
> every progress label on that surface, not a scattering.

## DE-GENDER · Inclusive forms are one house decision, not per-string taste

> **Trigger** — any string naming a person of unknown gender: Kandidat,
> Nutzer, Entwickler, Mitarbeiter.
> **Rule** — German has no settled universal convention: generic masculine
> (Kandidaten), paired forms (Kandidatinnen und Kandidaten), slash
> (Kandidat/in), colon or midpoint (Kandidat:innen, Kandidat·innen) and
> neutral recasts (Person, Team, "alle, die …") all circulate, and public
> style authorities genuinely disagree. Therefore: the product decides **one**
> form (or one ranked fallback chain: neutral recast first, then the chosen
> marked form), records it, and sweeps it catalog-wide in one pass. Mixed
> forms inside one product are a defect regardless of which forms they are.
> **Source** — the standard German orthography body has declined to
> canonize the colon/star forms; absent an authority, the anchor is the
> recorded house decision — which is exactly why the decision must exist.
> **Exception** — length-starved chips may use the neutral recast even where
> the house form is the pair form; the recast is always legal.

Audits of real multi-hand catalogs find three or four inclusive-form styles
coexisting — slash in one namespace, pairs in another, generic masculine in a
third — because each translator defaulted differently in the absence of a
ruling. The finding to file is not "wrong form" (no authority supports that)
but "no ruling exists"; the productive response is to mint the house rule and
then sweep once
([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)).

## When not to use this

Do not re-litigate the address form per feature, per audience segment, or per
"how formal does this screen feel" — the value of the contract is that it is
boring. And do not apply DE-FORMAL's plain-word table as a mechanical
find-and-replace: several of the avoided words are correct in fixed legal
collocations, and a sweep that rewrites them there trades a register wart for
a precision bug.
