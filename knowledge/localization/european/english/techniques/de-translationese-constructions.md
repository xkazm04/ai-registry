---
layer: technique
type: technique
subject: english
technique: de-translationese-constructions
status: forged
laws: [the-source-locale-is-the-source-of-truth, every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing English translated or machine-translated from another language, post-editing translated English for publication, deciding whether to translate or write English copy from a brief]
---

# De-translationese constructions

Translated English is recognisable even when it is grammatical, idiomatic word by word and
faithful. The evidence is strong and slightly counter-intuitive. Classifiers separate translated
from original English at 97-100% accuracy using interference features (function-word contexts,
part-of-speech sequences), at about 81% using cohesive markers, and at chance using lexical
density; the famous "translation universals" are weak by comparison (Volansky, Ordan & Wintner
2015). Post-edited machine output keeps the machine's footprint (Toral 2019), and the industry's
published post-editing guidelines accept a "good enough" tier that may read as
computer-generated. So polishing sentence by sentence does not remove translationese. Changing
the construction does, and writing from a brief avoids it.

Two review roles apply here and must not be merged: bilingual *revision*, which checks meaning
against the source, and monolingual *review*, which checks the target as a text (ISO 17100;
full post-editing per ISO 18587). The first comes first.

## EN-FIDELITY · Check meaning before fluency on translated strings

> **Trigger** — any string translated from a source, by a person or a model.
> **Rule** — before any fluency edit, compare against the source: negations, numbers, units,
> conditions, legal qualifiers, dropped clauses. Fluent output hides omissions.
> **Source** — readers react to fluency errors and overlook adequacy errors (Martindale &
> Carpuat 2018); ISO 17100 revision. Back-translation can verify fidelity; it can never verify
> nativeness, because it cannot see awkward target text.
> **Exceptions** — none for functional strings; transcreated strings check their must-keep
> claims instead (EN-TRANSCREATE).

✗ Source: *not available for accounts created before 2024* → *Available for accounts created
in 2024* (fluent, wrong) → ✓ *Not available for accounts created before 2024.*

## EN-SOURCE-RESIDUE · No source-language residue

> **Trigger** — low-high quotes, source abbreviations (*tzn.*, *z. B.*), untranslated fragments,
> decimal commas, spaced percent signs, a value identical to the source outside an allowlist.
> **Rule** — remove or render every residue; a source-identical value must be on an allowlist
> of legitimately identical strings (brand names, codes) or it is untranslated.
> **Source** — ISO 17100 review; recurring in every derived catalog.
> **Exceptions** — company legal forms (*s.r.o.*, *GmbH*); quoted source text.

✗ `„Unlimited“ users, tzn. 25 % more` → ✓ *“Unlimited” users, that is, 25% more*.

## EN-CONNECTOR · Cut explicitating connectors in web and UI copy

> **Trigger** — *moreover*, *thus*, *besides*, *furthermore*, *hence*, *in addition*,
> *therefore* in web or UI copy.
> **Rule** — use *and*, *so*, *also*, or start a new sentence. Translators make implicit links
> explicit; original English leaves them to order.
> **Source** — in translated English *moreover* appears about 17.5 times, *thus* 4 times and
> *besides* 3.8 times as often as in original English (Volansky, Ordan & Wintner 2015).
> **Exceptions** — legal, academic and compliance pages, where the connector is the register.

✗ *The export is fast. Moreover, it is thus possible to schedule it.* → ✓ *The export is fast,
and you can schedule it.*

## EN-BUT-OPEN · Let a sentence open with "But" or "And" in conversational copy

> **Trigger** — *However*, *Nevertheless* opening a sentence in marketing or UI copy.
> **Rule** — open with *But* (or *And*) where the register is conversational.
> **Source** — original English opens sentences with *But* about 2.25 times as often as
> translated English (Volansky, Ordan & Wintner 2015). A single measured lane; treat it as a
> warning, not a blocking rule.
> **Exceptions** — formal register; legal text.

✗ *Nevertheless, setup takes time.* → ✓ *But setup takes time.*

## EN-MODAL-PASSIVE · Rewrite modal + be + participle as an imperative or active

> **Trigger** — *can/must/should/will be* + past participle.
> **Rule** — imperative for instructions, active with an actor for statements.
> **Source** — the top part-of-speech-sequence marker of translated English (Volansky, Ordan &
> Wintner 2015).
> **Exceptions** — an unknown or irrelevant actor (*Files can be up to 2 GB*).

✗ *Settings can be changed in the dashboard. The invoice will be sent after payment.* → ✓
*Change settings in the dashboard. We send the invoice after payment.*

## EN-SENTENCE-SPLIT · Break comma chains; do not gloss in parentheses

> **Trigger** — three or more clauses joined by commas; a term followed at once by a
> parenthetical gloss.
> **Rule** — end sentences with full stops; define a term by using it clearly, not by glossing it
> in brackets.
> **Source** — translated English uses commas where original English uses full stops, and
> parentheses as explicitation (Volansky, Ordan & Wintner 2015).
> **Exceptions** — genuine lists; an acronym spelled out on first use.

✗ *We process the data, the report is generated, you receive it by email (electronic mail).* →
✓ *We process the data and generate a report. You'll get it by email.*

## EN-NOUN-PILE · Turn nominalizations back into verbs with a subject

> **Trigger** — chained *of*-phrases; a nominalization (*-tion*, *-ment*, *-ance*) as the head
> of a clause that has an obvious actor.
> **Rule** — promote the head noun to a verb and give it a subject.
> **Source** — translated English inherits the source's noun density; generated prose also
> overuses nominalizations (about twice the human rate, Reinhart et al. 2025), and
> generated-prose-patterns cites this rule rather than duplicating it.
> **Exceptions** — fixed product and legal terms (*data processing agreement*).

✗ *Provision of fast implementation of the integration* → ✓ *You'll be connected in minutes.*

## EN-TRANSCREATE · Transcreate the persuasive layer; translate the functional layer

> **Trigger** — a headline, tagline, call to action, idiom or pun arriving from a source text.
> **Rule** — rewrite persuasive strings from their intent, with must-keep claims fixed (numbers,
> guarantees, legal qualifiers); translate functional strings (UI, legal, specifications,
> prices) faithfully. Better still, draft English pages from the brief and the fact sheet rather
> than from the source-language page.
> **Source** — transcreation practice; translation carries sentence shape and noun density over
> ("shining through"). Asking a model for natural output does not reliably remove
> translationese; a separate target-side rewrite under an explicit rule set does better (Li et
> al. 2025, via a secondary summary; treat the effect size as indicative).
> **Exceptions** — regulated claims, which are translated and legally reviewed.

✗ *Web on a key, for your satisfaction* → ✓ *Turnkey websites, live in two weeks* (must-keep
claim: the two-week delivery from the fact sheet).

## Using the set

Order is the technique. First EN-FIDELITY, because every later edit polishes whatever meaning
survived; then EN-SOURCE-RESIDUE, which is mechanical; then the shape rules (EN-MODAL-PASSIVE,
EN-NOUN-PILE, EN-SENTENCE-SPLIT, EN-CONNECTOR), which yield the most. Where the English is the
product's source locale and was itself derived, report shape defects as source defects: they
will be inherited by every locale translated from it
([the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)).

When NOT to apply: legal and compliance text, where connectors, modal passives and explicitness
are register-correct and fidelity outranks every shape rule; quoted source material; and strings
written natively in English, where the statistical markers are ordinary style choices. Frequency
evidence describes corpora, not sentences: one *therefore* in a native paragraph is not a finding.
