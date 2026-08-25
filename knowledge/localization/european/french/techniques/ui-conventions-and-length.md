---
layer: technique
type: technique
subject: french
technique: ui-conventions-and-length
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [reviewing French labels buttons and navigation for interface conventions, fixing French strings that overflow their controls, setting casing policy for a French catalog]
---

# UI conventions and length

The rules that exist only because the text lives in an interface: casing,
element-type grammar, and the standing fact that French needs more room than
English. None of this is sentence craft — a string can be perfect French and
still be the wrong French for a tab strip.

## FR-CASING · Sentence case, French rules

> **Rule** — capitalize the **first word** of a label or title plus genuine
> proper nouns, nothing else. Never mirror English Title Case. Specifically
> lowercase: languages and nationalities as adjectives/nouns (*français*), days
> and months (*lundi*, *août*), job titles (*directrice technique* — unless
> containing a proper noun), and the word after a colon in running prose.
> **Source** — Microsoft French style guide (capitalization); standard French
> orthography.
> **Exception** — enum-mirroring: when a string quotes another surface's label
> (a stage name, a nav tab), it copies that label's exact casing even
> mid-sentence — cross-reference integrity beats the casing rule, though
> guillemets around the quoted label reconcile the two.

## FR-LENGTH · Budget the expansion; shorten words, not glyphs

> **Rule** — French runs ~15–25% longer than English on average, and up to
> ~35% on compound or legally precise phrasing. When a French label overflows
> its control: cut words before meaning (drop articles in badges — *Brouillon*,
> not *Le brouillon*; drop a repeated head noun a column header already
> carries), reuse the catalog's established short forms (*Échec*, *Terminé*,
> *En cours*) rather than minting longer synonyms, and treat a button label
> wrapping to two lines as a text bug — never shrink the font or restructure
> the layout from inside a string.
> **Source** — the 15–25% band is the published industry expansion figure for
> English→French, borne out by catalog measurement.
> **Exception** — when no faithful French fits (one real case: a category
> label ~50% over source in a filter chip with no shorter faithful form), the
> overflow is a **source-side design constraint**: per
> [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth),
> the control's width or the source string's granularity is the defect to
> report — a lossy French abbreviation is the worse fix.

Length review is a *rendered* review: a 2.2×-source string that wraps
harmlessly in a wide modal is a note, not a defect; a 1.3× string that
truncates in a chip is critical. The multiplier alone decides nothing.

## FR-CTA · Element type dictates grammar

> **Rule** — each interface element type has a French grammatical convention;
> match the element, not the English part of speech:
> - **Buttons and menu commands** — vous-form imperative or bare infinitive
>   acting as one (*Enregistrer*, *Annuler*, *Lancer la vérification*), no
>   trailing period.
> - **Tabs and nav items** — nouns (*Analyse*, *Comparaison*, *Historique*); a
>   verb tab beside noun siblings breaks the strip's parallelism.
> - **Placeholders and hints** — imperative (*Collez un extrait…*) or nominal
>   example, consistently per surface.
> - **Status pills** — established short forms, article-less.
> - **Marketing CTAs** — the one licensed exception to button-imperatives:
>   French conversion copy tolerates noun phrases (*Essai gratuit*), so an
>   imperative-rule finding on a landing CTA is a note, not a defect.
> **Source** — Microsoft French style guide (UI text conventions); French
> platform convention.
> **Exception** — a deliberately terse popover or dense grid may shorten
> forms below the convention; the ruling is per-surface and recorded, so a
> later pass does not "correct" intentional density.

## Cross-reference integrity

A string that names another part of the interface must use that part's exact
shipped label: *dans Analyse* only if the tab says *Analyse*; a stage referred
to by its label, not by a cousin noun of the same activity. French makes this
harder than English because the reference often needs an article and gender for
the label's head noun — one more reason nav labels want to be nouns. The audit
is mechanical (collect label strings, grep references); the fix direction is
not — sometimes the reference is stale, sometimes the label is the drifted one.

## Locale conventions that live in strings

- **Example values localize as a set**: a sample email address, phone number or
  company name in placeholder text follows one recorded convention (which TLD,
  which formats) across the catalog — two different sample domains for the same
  purpose is drift, trivial and visible.
- **Numbers, dates, currency never hardcode**: French formatting (space-grouped
  thousands, comma decimals, trailing €, 24-hour times) comes from the runtime
  formatter; a string carrying a pre-formatted *1 000 €* is a defect even when
  the format is correct, because it freezes one convention into all French
  variants. Date-range idiom is the subtle case: *du 11 au 17 août* cannot be
  produced by wrapping a preformatted range placeholder — if the placeholder
  arrives as *11–17 août*, write around it (*Semaine {range}*) rather than
  emitting *du 11–17 août*.
- **Ordinal and title glyphs**: *1ᵉʳ/1re*, *n°* — use the catalog's recorded
  form; mixing *no*, *n°* and *No.* is the same drift class as the sample-TLD
  split.

## When not to apply this

These conventions bind the product's own chrome. Quoted content, imported
data and user-authored labels are exempt. And do not enforce parallelism
across ownership boundaries — two namespaces owned by different teams both
rendering one label is a coordination finding for both owners, not a license to
edit the other team's half; flag it where both copies can be seen.
