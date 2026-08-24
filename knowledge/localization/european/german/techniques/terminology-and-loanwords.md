---
layer: technique
type: technique
subject: german
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether a German term is borrowed or translated, auditing term consistency in a German catalog, an English loanword needs German grammar]
---

# Terminology and loanwords

German tech and business vocabulary is saturated with English — more than
French, less predictably than one expects — and the border between "borrow"
and "translate" is the highest-traffic terminology decision in any German
catalog. The border cannot be guessed per string: it is governed per term,
recorded, and enforced. What CAN be stated as language rules, independent of
any product's termbase, is how the border is decided, and what German grammar
does to whatever crosses it.

## DE-LOANWORD · English loanwords take German grammar

> **Trigger** — any English term kept as a loanword.
> **Rule** — the word stays English; its **grammar becomes German**. Four
> obligations, all mandatory: (1) **Gender** — assign one article per term
> (*der Workflow*, *das Dashboard*) and keep it; German speakers assign
> gender to every borrowed noun and inconsistency is glaring. (2)
> **Declension** — the loan declines (*des Screenings*, *mit dem Matching*).
> (3) **Plural** — default *-s* (*Downloads*, *Websites*); *-er* loans
> unchanged (*Server*, *Manager*); *-y* → *-ys* (*Proxys*, never the English
> *-ies*). (4) **Verbs conjugate weakly** as German verbs (*chatten, sie
> chattet, wir haben gechattet*) — and a borrowed verb that resists the
> paradigm (*gesourct?*, *gemintet?*) is a sign the verb should not have
> been borrowed even where the noun is fine. Capitalized like any German
> noun.
> **Source** — the vendor style guide's section on English terminology in
> the German language system, which ranks the un-Germanized loan (the
> "stylistic anglicism") with false friends among the major error classes.
> **Exception** — code identifiers, protocol names and technical
> abbreviations (API, JSON, OAuth) are quoted foreign material, not
> loanwords; they take neither gender marking in writing nor declension
> endings.

The verb corollary deserves its own alarm: noun loans are cheap, verb loans
are expensive. *Das Ranking* reads fine; *gerankt* collides with a native
verb and reads as jargon; a coined participle of a nonce borrowing reads as
broken German. When the verb form fights, translate the verb and keep the
noun loan.

## DE-ONE-WORD · One concept, one word

> **Trigger** — translating any recurring domain concept; reviewing any pair
> of near-synonyms in one catalog.
> **Rule** — within one product, one concept gets exactly one German
> rendering, decided once and recorded — and the inverse: one settled German
> word is not reused for a second concept. German makes the inverse uniquely
> dangerous through near-synonym richness: role/position (*Rolle* /
> *Position* / *Stelle*), declined/rejected (*abgesagt* / *abgelehnt*),
> verify/prove (*ungeprüft* / *unbelegt*) — every pair is a place two
> translators legitimately differ, so drift is a certainty to consolidate,
> not a risk to hope against. A borrowed term and its German translation
> (*Skills* / *Fähigkeiten*) count as two renderings.
> **Source** — [one concept, one rendering](../../../_laws.md#one-concept-one-rendering)
> instantiated for German; the near-synonym pairs are the German-specific
> content.
> **Exception** — a *recorded* width-scoped shortening (a shorter form of
> the same term for tight surfaces) and a *recorded* compound-internal
> variant are one rendering with variants, not drift.

## DE-FALSE-FRIEND · The cognate is a hypothesis

> **Trigger** — an English word with a German lookalike, or an English word
> whose common German dictionary equivalent has a conflicting everyday
> sense.
> **Rule** — check the sense, not the surface. The classic direction:
> *aktuell* ≠ actual, *eventuell* ≠ eventually, *bekommen* ≠ become. The
> subtler product direction: an English term whose literal German rendering
> lands in the wrong register or domain — a body-part translation for a
> feature metaphor reads clinical; a medical framing for automated
> remediation reads alarming; a military/administrative noun for a neutral
> dispatch action reads bureaucratic. And polysemous English words split:
> *fleet* (collective) must not be rendered by its poetic sense (swift),
> *hold* (a queued state) not by the everyday reticence sense of the obvious
> noun.
> **Source** — the vendor guide's frequent-errors section ranks false
> friends among the major mistake classes; the metaphor-register extension
> is audit craft.
> **Exception** — none; the rule is a check, and the check sometimes passes.

## Deciding the border: borrow or translate

The transplantable heuristic, applied per term and then recorded:

- **Borrow when the English word is what the German-speaking *audience*
  says out loud** in their working context (developer standup, recruiting
  call): Workflow, Dashboard, Trigger, Deployment, Screening. An invented
  German coinage for such a term reads try-hard and is usually longer.
- **Translate when the concept is configured or consumed by non-specialist
  users**: the everyday German word exists, carries the right register, and
  the audience should not need English (Vorlage, Entwurf, Genehmigung,
  Warnung, Zeitplan).
- **Length breaks ties** (see length-and-compression): the loan is usually
  shorter than the German compound.
- **Collision vetoes translation**: when translating a term would collide
  with another concept's settled rendering, keep the loan — visual
  distinctness between two adjacent concepts outranks purity.
- **Count before ruling**: when a termbase row and the shipped catalog
  disagree, the coherent catalog wins and the row is corrected — never
  enforce a glossary against a consistent catalog without counting first
  ([the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)).

Region matters at the margins: some renderings are idiomatic in Austria or
Switzerland and stilted in Germany (and vice versa); the ruling names the
primary market. And the German-native abbreviation set is part of
terminology: *k. A.* (keine Angabe) for a table's not-available cell, not
"n/a"; *z. B.*, not "e.g.".

## When not to use this

Do not fix a term split by rewriting the strings you happen to be holding —
a half-swept rename is worse than the split, because it adds a third state.
The unit of terminology change is the concept: one ruling, one recorded row,
one catalog-wide sweep. And do not treat this technique as a termbase — the
actual rows (what THIS product calls things) belong to the product; only the
machinery for deciding and policing them lives here.
