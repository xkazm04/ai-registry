---
layer: technique
type: technique
subject: czech
technique: register-and-address
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [choosing formal vs informal address for a Czech product, auditing a catalog for register drift, deciding whether a word is too bookish or too colloquial for the UI]
---

# Register and address

Two independent axes, decided separately: **who the product addresses and how**
(vykání vs tykání), and **which vocabulary stratum it draws from** (bookish vs
plain vs colloquial). Conflating them is the root register error — translators
who correctly choose formal address then "match" it with bookish vocabulary,
producing Czech that is simultaneously polite and dead.

## Address: vykání by default, and never mixed

Choose **vykání** (formal: second-person-plural verb forms, *váš/vaše*,
imperatives like *Vyberte*, *Uložte*) for any professional or B2B product and
for nearly all consumer products. Czech machine-to-user tykání does not read
warm; it reads presumptuous. Choose tykání only as a deliberate whole-brand
decision applied to every string — the two registers cannot coexist in one
catalog, and a single *tvůj* leaking into a vykání catalog is a defect an
audit flags on sight. Register drift is a certainty when sections are
translated at different times; sweep for *tvůj/tvoje/tvi/ti* and singular
imperative forms (*zkontroluj*, *vyber*) as a mechanical gate. When a legacy
section shipped in the wrong register, the ruling is: new strings follow the
house register, the legacy section is queued for one coordinated migration —
never "matched" by new strings, which spreads the drift.

Three sub-rules that carry the register correctly:

- **Czech is pro-drop: never write the pronoun.** *Máte neuložené změny*, not
  *Vy máte neuložené změny* — the *-te* ending already carries formal "you".
  An inserted *Vy* is an English-subject calque that reads like a bad dub.
  Reserve the explicit pronoun for genuine contrast (*vy rozhodujete, ne
  systém*). (Mint as `CS-PRODROP` where an anchor set needs it.)
- **The reflexive possessive.** When the owner is the sentence's subject,
  Czech requires *svůj*, never *váš*: *Zkontrolujte svůj profil* (you check
  your own), but *Váš profil je připraven* (the profile is the subject).
  Using *váš* in the *svůj* slot is a grammar error, not a style choice.
- **Greetings and the vocative.** Czech addresses people in the vocative case,
  but interpolated names arrive in nominative; the accepted UI convention is
  the nominative name inside a greeting — with the address comma that Czech
  orthography requires: *Dobrý den, {name},* — the comma before the name is
  obligatory and reliably missing in translations from English, which needs
  none. A greeting template's no-name fallback must be a word that fits the
  frame it substitutes into (an address noun like *kandidáte* inside "Dobrý
  den {name}," ), checked against the actual template, not chosen in
  isolation — a fallback of "dobrý den" inside that frame renders a doubled
  greeting.

## CS-FORMAL · Plain word, not the bookish one

> **Trigger** — any word from the bookish column below in UI chrome.
> **Rule** — formal *address*, plain *vocabulary*. The bookish register is the
> single loudest "this was translated" signal in Czech UI text.
> **Source** — Microsoft Czech Style Guide §2.1.3 (words and phrases to
> avoid).
> **Exceptions** — see scope, below.

| Bookish (avoid) | Plain (use) |
|---|---|
| avšak | ale |
| již | už |
| nyní | teď |
| nelze | nedá se · nejde |
| nikoli | ne |
| zda | jestli |
| zde | tady |
| poté | potom |
| pouze | jen · jenom |
| nejprve | nejdřív |
| nadále | dál |
| dle | podle |
| činit | dělat · (or name the real verb) |
| obdržet | dostat |
| veškerý | všechen |
| rovněž | taky |
| jenž · jež · nichž · jimiž | který · která · které |
| nezdařilo se | nepodařilo se |

Scope limits, each found by over-applying the table and reverting:

1. **The table governs UI chrome** — buttons, labels, hints, empty states. It
   does not reach outbound correspondence or legal pages, where *zde*,
   *nikoli*, and *veškerý* are the register-correct words and *tady* reads as
   spoken.
2. **Verbless heading fragments.** *zda → jestli* is right after a verb
   (*Zvažte, jestli…*) and wrong for a bare "Whether X" blurb, where Czech
   opens with *Zda*.
3. **Any row may be overruled by the house** — recorded as a ruling with the
   rule, with the catalog counts that justified it. Before adopting a
   replacement token from any authority, count both forms in the live catalog:
   an authority's preferred token that occurs zero times against hundreds of
   the incumbent is the hypothesis, not the standard.

## CS-SUBSTD · Stay in standard written Czech

> **Trigger** — playful or casual copy: captions, empty states, marketing
> asides.
> **Rule** — obecná čeština stays out even where the tone is light: relative
> *co* for *který*, protetic *v-* (*vokno*), *-ej*/*-ma* endings. These sit
> below the register any product uses with its operators.
> **Source** — the standard-Czech norm as codified by the Czech Language
> Institute's usage guidance (Internetová jazyková příručka); Microsoft's
> guide assumes standard Czech throughout.

This rule exists because CS-FORMAL is one-directional: it pushes bookish words
*down*, and without a floor nothing pushes colloquial forms back *up*. A
catalog audited only against CS-FORMAL will pass *"nabídky, co sednou"* —
grammatical, plain, and below the line. Audit both walls of the register
window.

## The system's own voice

When the product speaks about its own actions, Czech convention is impersonal
or first person **plural** — never first person singular. *Nepodařilo se nám
uložit změny* (we-voice for apologies), *Ukládání…* (verbal noun for progress),
*Soubor se uložil* (reflexive for results). *Ukládám…* / *Generuji…* — the
software as "I" — is an anglophone-assistant affectation that Czech UI does
not use; catalogs translated string-by-string reliably split on this, so
settle it as a rule (mint as `CS-VOICE`) and sweep once. Where a
third-person-singular verb would misattribute the action to a person on
screen (*Postupuje…* reading as the *candidate* advancing rather than the
system processing), prefer the impersonal frame.

## When NOT to apply this technique

Do not re-register quoted human speech (testimonials, user-generated content) —
register rules govern the product's voice only. And do not sweep vocabulary
rows into surfaces the scope limits exclude: the fastest way to lose a native
reviewer's trust is "correcting" *nikoli* to *ne* in a terms-of-service
paragraph.
