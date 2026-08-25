---
layer: technique
type: technique
subject: german
technique: capitalization-and-compounds
status: forged
laws: []
shared_with: []
use_when: [auditing casing in a German catalog, deciding how to render an English noun stack in German, checking ß/ss and all-caps strings]
---

# Capitalization and compounds

Two orthography systems English lacks entirely: German capitalizes every noun,
and German builds words by fusing them. Both are places where a mechanical
translation is *systematically* wrong — not occasionally, but on a rule the
source language cannot express — so both are audit staples with clean,
citable rules.

## DE-CASE · Capitalize every noun; never mirror Title Case

> **Trigger** — any German string; especially labels translated from English
> Title Case UI.
> **Rule** — two rules that pull opposite directions and are both mandatory.
> (1) Every noun is capitalized regardless of position — *die Entscheidung*,
> *Angebot senden*, *Einstellungen* — this is spelling, not style, and
> lowercasing a mid-sentence noun to "look more sentence-case" is simply wrong
> German. (2) Everything else follows sentence case: never copy English Title
> Case onto non-nouns ("Persona auswählen", not "Persona Auswählen" — the verb
> stays lowercase). The result is that correct German labels look
> half-capitalized to an English eye; that is the correct appearance.
> **Source** — standard German orthography (the official rule set); every
> vendor localization guide for German restates it because machine output
> violates it constantly.
> **Exception** — after a colon, capitalize when a complete sentence follows,
> lowercase when a phrase follows; both are legal, so a product should pick
> the pattern once for parallel strings that render side by side.

Casing carries a semantic trap worth knowing: because *all* nouns are
capitalized, capitalization alone can never tell you whether a word is being
used as a brand/proper name or as an ordinary noun — a distinction English
marks by case. Judge by meaning at the call site, never by the capital letter.

## DE-ESZETT · ß by vowel length; ẞ in all-caps

> **Trigger** — any string containing ß or ss; any all-caps rendering.
> **Rule** — ß follows long vowels and diphthongs (*Straße*, *groß*,
> *schließen*, *außerdem*); ss follows short vowels (*Passwort*, *muss*,
> *Schluss*). Never fold ß to ss in standard German — that is the Swiss
> convention (`de-CH`), not `de`. In all-caps contexts the capital **ẞ**
> (U+1E9E) has been official since 2017 and is the *preferred* variant since
> the 2024 revision of the official rule set (STRAẞE preferred, STRASSE still
> permitted) — but prefer applying uppercasing in the presentation layer over
> storing shouting-case strings at all.
> **Source** — the official German orthography rules, 2017 amendment and 2024
> revision (capital ẞ).
> **Exception** — a `de-CH` catalog folds every ß to ss deliberately; that is
> a locale variant, not an error, and must be the whole catalog or none of it.

## DE-HYPHEN · Don't hyphenate because English did

> **Trigger** — an English compound or noun stack rendered with a hyphen.
> **Rule** — the German default for a two-part compound is **closed**
> (*Eignungsscore*, *Entscheidungswarteschlange*), not hyphenated. Avoid
> hyphens that merely preserve English word order; a complex stack is usually
> resolved by German syntax — reorder, or introduce a preposition
> (*Warteschlange für Entscheidungen*) — not by stapling the English order
> together. A hyphen is legitimately used for readability when the closed
> form becomes a monster, at the seam of an unassimilated loan
> (*Skill-Bibliothek*), and with abbreviations (*KI-gestützt*).
> **Source** — the vendor style guide's compounds and hyphen sections; the
> standard orthography's compound rules (closed default, hyphen for
> readability).
> **Exception** — readability wins: when the closed compound is genuinely hard
> to parse, the hyphenated or prepositional form is correct German, and
> forcing the closed form is over-application.

The audit signal is statistical: a translated catalog with materially more
hyphens than its source is preserving English token boundaries with
punctuation. Real counts have shown a German page carrying near-double its
source's hyphen count; the surplus, inspected, was English word order.

## DE-COUPLING · Multi-word phrases compound all the way through

> **Trigger** — a German compound built on an English multi-word phrase, or
> on any word group.
> **Rule** — Durchkopplung: when a word group becomes one compound, *every*
> joint takes a hyphen — *Social-Media-Plattform*, *Multiple-Choice-Aufgabe*,
> *Do-it-yourself-Anleitung*. The half-coupled form ("Social Media-Plattform")
> and the bare-space form ("Skill Bibliothek") are both wrong German: a space
> inside a compound is not a German option, even when both halves are English
> loans. Nouns inside the coupled compound keep their capitals.
> **Source** — standard German orthography (compounds with word groups); the
> reference dictionary's guidance on English loans in compounds.
> **Exception** — none for the coupling itself. What is legitimately open is
> whether to compound at all — a prepositional phrase or a recast often reads
> better than a three-hyphen chain, and is the right choice for body copy.

English-origin spacing ("Deppenleerzeichen" in German editing slang) is one of
the most recognisable marks of untranslated-feeling German, and it is
mechanical to find: any German string with two adjacent capitalized nouns
separated by a space, where the pair names one concept, is a candidate.

## When not to use this

Do not run a de-hyphenation sweep by regex: many hyphens in a German catalog
are correct (loan seams, abbreviation joints, deliberate readability calls),
and the rules above require reading the compound, not counting its
punctuation. And do not "fix" the mixed-case look of correct German — noun
capitals inside sentence-case labels are the language working as designed.
