---
layer: technique
type: technique
subject: german
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing German strings that read translated, running a construction audit over a German catalog, typing a "sounds English" impression as a citable finding]
---

# De-anglicization constructions

The rules a glossary cannot hold: sentence-level patterns where a translation
is grammatical, meaning-faithful, and still visibly English underneath. Each
rule here turns one such pattern into a typed, citable finding — the whole
mechanism that separates a construction audit from a taste war
([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)).
A reviewer who cannot name one of these IDs for a "reads translated"
impression leaves the string alone
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

## DE-CALQUE-PREP · The preposition is not the English one

> **Trigger** — an English verb+preposition or verb+particle pattern (*scored
> against*, *based on*, *read back*, *advanced past*) rendered
> preposition-for-preposition.
> **Rule** — German verbs govern their own prepositions and particles;
> translate the *verb sense*, then use the preposition that verb governs.
> "gegen … bewertet" for *scored against* parses and is not German — German
> evaluates *anhand* or *nach*. The particle form of the same error coins
> non-words: a particle-for-particle rendering of *read back* produces a verb
> standard German does not use in that sense.
> **Source** — the vendor style guide's frequent-errors and prepositions
> sections.
> **Exception** — where German genuinely shares the government
> (*basierend auf* for *based on* is real German), the match is coincidence,
> not license; the test is always "which preposition does the German verb
> take", never "does the English one happen to work".

## DE-NOMINALSTIL · Prefer the verb

> **Trigger** — a chain of -ung nouns joined by genitives or *von*; the
> pattern "Die X-ung der Y-ung erfolgt …".
> **Rule** — conjugate instead. *Die Durchführung der Aktualisierung
> erfolgt automatisch* → *Wird automatisch aktualisiert* / *Wir aktualisieren
> automatisch*. Nominal style is legal German and the loudest register break
> in modern product copy — it is what makes software sound like a tax office.
> English gerund chains and noun-heavy UI strings pull translations into it,
> which is why it lives in this technique and not only in register.
> **Source** — house-style class rule: the major vendor guide defers to the
> standard grammar authority here, and mature German products enforce it as
> their own recorded rule. Adopt it explicitly; do not assume an authority
> citation exists to lean on.
> **Exception** — a nominal heading over a verbal body ("Bereitstellung" as a
> section title) is fine; the rule targets sentences, not labels. Legal copy
> may need the nominalization's precision.

## DE-PLEONASM · Don't say it twice

> **Trigger** — an English intensifier or qualifier translated onto a German
> word that already carries the meaning.
> **Rule** — German compounds and derivations are semantically dense; check
> whether the noun already contains the adjective before translating the
> adjective. *Belegbare Nachweise* says "provable proofs" — the noun IS the
> proof. Delete the qualifier or recast the pair. The same density produces
> echo-pleonasm: one sentence using a stem twice ("Daten … Daten") where
> English used two different words.
> **Source** — house-style class rule, same footing as DE-NOMINALSTIL.
> **Exception** — a qualifier that genuinely narrows (*manipulationssicher*
> on a record that could be otherwise) is not pleonastic; the test is whether
> deleting it changes what is claimed.

## DE-COLLOC · The collocation is not the English one

> **Trigger** — an adjective+noun or verb+object pair transferred whole from
> English; statistical and technical qualifiers are the reliable cases.
> **Rule** — check that the *pair* exists in German, not just the words. A
> "wide confidence" calque yields *breite Konfidenz* — German statistics
> widens the *interval* (*breites Konfidenzintervall*), never the confidence.
> English "thin on X" yields *dünn bei X* where German says *schwach bei X*.
> The repair is to find the German head noun or verb the qualifier actually
> collocates with, or to transcreate the phrase (*breite Spanne*), not to
> swap the adjective.
> **Rule, agreement corollary** — never copy the source's plural or verb
> branch *bodies* into a message-format structure: German verb and article
> agreement must be rebuilt inside each branch, and an English branch body
> left verbatim inside German syntax is a shipped defect that reads fine to a
> format checker.
> **Source** — house-style class rule; minted because collocation calques
> were the largest anchorless residue in real German construction audits —
> flagged repeatedly, unactionable without an ID.
> **Exception** — established loan-collocations in domain jargon (German HR
> and dev speech borrows English pairs wholesale) may be legitimate for the
> audience; that is a termbase ruling per pair, recorded, not a per-string
> pass.

## Running these as an audit

- **Order the pass**: DE-CALQUE-PREP and the DE-COLLOC agreement corollary
  first (they can be outright wrong German), then DE-NOMINALSTIL and
  DE-PLEONASM (register-degrading, correct German), so severity falls out of
  the rule cited rather than the reviewer's mood.
- **The signal for all four is source-shaped**: audit with the English
  visible. Each rule detects English structure showing through; a
  monolingual read of the German catches the worst cases only.
- **A finding with no ID here and no termbase row is a minting candidate**,
  not a rewrite license. Recurring anchorless findings are how this rule set
  grows; one-off taste is how catalogs churn.

## When not to use this

Do not over-apply to voice-y marketing copy that deliberately borrows English
rhythm — over-application is real, and the settled exceptions above (headline
nominals, narrowing qualifiers, jargon collocations) were each found by
applying the rule too widely and reverting. And do not use these rules to
rewrite clean strings in bulk: every rule here licenses a targeted fix to a
flagged string, nothing more.
