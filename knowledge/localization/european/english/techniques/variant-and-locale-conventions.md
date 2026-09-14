---
layer: technique
type: technique
subject: english
technique: variant-and-locale-conventions
status: forged
laws: [the-authority-is-a-hypothesis, coverage-is-counted-not-claimed]
shared_with: []
use_when: [starting any audit of an English catalog, fixing mixed US and UK spelling, writing dates, times, numbers or prices into English copy]
---

# Variant and locale conventions

English mechanics are a table of declared choices, not a set of facts. Authorities disagree row
by row, and no row has evidence that one option reads or converts better; what readers notice
is a product holding two options at once. This technique fixes the order of work: declare,
count, then sweep. Its other half is the locale leak from a source language (a decimal comma, a
spaced percent sign, a day-first numeric date), which the same table catches because it states
what the English form is.

## EN-VARIANT · Record the variant and the mechanics table before auditing

> **Trigger** — an English catalog, style guide or brief with no recorded variant.
> **Rule** — record, where the rules live: US or UK spelling and the dictionary whose first
> listed form wins; serial comma; dash system; quote punctuation; time format; percent form;
> contractions policy; case per element class. Count the catalog against each row before
> enforcing it, and write the ruling beside the row.
> **Source** — Google developer documentation style guide (US, Merriam-Webster); Atlassian
> (US); GOV.UK (UK). The count-first order is
> [the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis).
> **Exceptions** — none. A catalog that is already coherent still gets the record: the next
> writer cannot read coherence off the catalog.

A usable record is short:

| Row | Declared | Catalog count before enforcing |
|---|---|---|
| Spelling | US, first form in the named dictionary | US forms vs UK forms, per word family |
| Serial comma | used | lists with vs without |
| Dash | closed em dash, at most one per paragraph (or: none) | em, en, spaced hyphen |
| Time | `3:45 PM`, zone named for events | each format found |
| Case | sentence case for headings, buttons, labels | per element class |

## EN-SPELLING · Hold one spelling variant on every surface

> **Trigger** — *-ize/-ise*, *-or/-our*, *license/licence*, *catalog/catalogue*,
> *canceled/cancelled*, *program/programme*, *center/centre*, *analyze/analyse*.
> **Rule** — one variant on every surface, including alt text, meta descriptions, email and
> error strings. Count the whole catalog per word family before sweeping.
> **Source** — the dictionary declared under EN-VARIANT.
> **Exceptions** — proper nouns, quoted names, code identifiers; a declared Oxford spelling
> (*-ize* with otherwise British forms); *program* is standard British for software.

✗ *Optimize your catalogue colours* → ✓ *Optimize your catalog colors* (US) or *Optimise your
catalogue colours* (UK).

The sweep is where counting matters most. A search over a handful of files returns the cluster
it happened to hit, and a reviewer who reports "the catalog is consistently British" from it has
measured the sample. Count per word family: one family can be a genuine house cluster while the
rest are coin flips, and the declaration then says which cluster wins
([coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)).

## EN-DATE · Write dates nobody can misparse

> **Trigger** — a hand-typed date, an all-numeric date in prose, an ordinal date.
> **Rule** — month as a word, in the variant's order: US *September 14, 2026*, UK *14 September
> 2026*; no ordinals (*14th*). Pass the date to the locale formatter as a value; never store a
> pre-formatted string.
> **Source** — Microsoft, Google, GOV.UK.
> **Exceptions** — ISO 8601 (`2026-09-14`) in tables, logs and data exports.

✗ *Valid until 14. 9. 2026* / *4/5/2026* → ✓ *Valid until 14 September 2026*. The second ✗ is
two different days on the two sides of the Atlantic.

## EN-TIME · One time format per product, with the zone named

> **Trigger** — a time of day, a scheduled event, *12pm* or *12am*.
> **Rule** — one declared format everywhere; name the time zone for anything scheduled; write
> *noon* and *midnight* (British copy often *midday*), never *12pm*.
> **Source** — a documented contradiction: Google `3:45 PM`, Microsoft `10:45 AM`, Apple
> `8:30 a.m.`, Mailchimp and GOV.UK `5:30pm`. Choose one; do not cite a second authority row
> by row.
> **Exceptions** — the 24-hour clock where declared for the audience or in technical logs.

✗ *Webinar at 12pm* → ✓ *Webinar at noon CET*.

## EN-NUMFMT · Decimal point, comma thousands, percent closed up

> **Trigger** — a decimal comma, a space or period as the thousands separator, a space before
> `%`.
> **Rule** — `1,299.50` and `25%` in web copy; render through the number formatter.
> **Source** — Microsoft, Google, Chicago, AP.
> **Exceptions** — scientific and engineering contexts that declare SI and ISO 80000 spacing.

✗ *1 299,50* · *25 %* → ✓ *1,299.50* · *25%*.

## EN-CURRENCY · Symbol before the amount, tax in the reader's terms

> **Trigger** — a trailing currency symbol or word, a `,-` ending, no stated tax treatment,
> several "per month" forms on one site.
> **Rule** — symbol or ISO code before the amount; state tax the way the buyer reads it
> (*excl. VAT* or *+ VAT* for EU and UK business buyers, *plus applicable taxes* for US
> buyers); one per-month form site-wide.
> **Source** — Microsoft and Google (currency placement); regional commercial convention (tax).
> **Exceptions** — table columns whose header carries the currency.

✗ *49 € bez DPH* / *1 290,- per month* → ✓ *€49 excl. VAT* / *CZK 1,290 per month*.

## EN-SERIAL · Apply the declared serial-comma policy consistently

> **Trigger** — a coordinated list of three or more items.
> **Rule** — follow the declared policy on every surface. Under a no-serial-comma policy, still
> add the comma where omitting it makes the last two items read as one.
> **Source** — a documented contradiction: used by Microsoft, Google, Apple and Chicago; omitted
> by AP and most UK news style.

✗ (policy: used) *Email, chat and phone support* beside *Reports, alerts, and exports* → ✓ both
with the comma.

## EN-QUOTE-PUNCT · Place punctuation at a closing quote by variant

> **Trigger** — a comma or full stop beside a closing quotation mark.
> **Rule** — US copy puts it inside; UK copy places it logically (inside only when it belongs to
> the quoted material). In both, a technical literal the reader types or clicks is logical, so
> the punctuation is never copied into an input.
> **Source** — Chicago (US); New Hart's Rules (UK); Microsoft and Google (literals).

✗ *Type “delete,” then confirm* → ✓ *Type “delete”, then confirm* (a literal, in either variant).

## EN-NUMERAL · One numeral policy per item type; no sentence opens on a numeral

> **Trigger** — a number in running text; a sentence that begins with a numeral.
> **Rule** — declare one policy per item type and hold it; recast or spell out a numeral that
> would open a sentence; prices, statistics, measurements and versions are always numerals.
> **Source** — a documented contradiction: Microsoft spells out zero to nine in body text;
> GOV.UK uses numerals except for *one*; Mailchimp and Atlassian use numerals except at the
> start of a sentence. The rows come from one research lane; confirm against the current guide
> before citing one as the house authority.
> **Exceptions** — counts in badges, tables and UI controls are always numerals.

✗ *8 digits identify the company.* → ✓ *The company ID has 8 digits.*

## Using the set

Start with EN-VARIANT, every time; a finding raised before the record exists is a vote for the
reviewer's own house guide. Then sweep in order of mechanical certainty: formatter-rendered
values (EN-DATE, EN-TIME, EN-NUMFMT, EN-CURRENCY), then spelling, then punctuation policy. For
formats, the fix is structural. A hand-typed date corrected in English is still a hand-typed
date in every locale translated from it, so replace the literal with a formatted value and
report the source defect. State each sweep's coverage as values checked against values present.

When NOT to apply: quoted material and names, code identifiers and literals, user-generated
content shown verbatim, and data exports whose reader is a machine. A declared house choice
that departs from every authority is still a valid row; it is not a finding.
