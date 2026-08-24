---
layer: technique
type: technique
subject: french
technique: plural-and-agreement
status: forged
laws: [format-skeleton-is-inviolable, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [writing or reviewing plural messages for French, auditing counters and stat lines for agreement, deciding gender policy for unknown referents]
---

# Plural and agreement

French counting looks deceptively close to English — singular and plural, no
case system, no dual — and that closeness is the hazard: a translator can reuse
the English plural structure everywhere and be wrong only at 0, at 1-with-
distant-agreement, and at a million. All three failures render as grammatical
noise a source-language reviewer cannot see.

## FR-ZERO · Zero is singular

> **Trigger** — any plural message whose count can reach 0.
> **Rule** — the CLDR `one` category for French covers **0 and 1**: *0 poste,
> 1 poste, 2 postes*. Keep the source's plural structure but know the branches
> mean different number sets than they do in English, where 0 takes the plural.
> **Source** — CLDR French cardinal rules: `one` is defined as `i = 0,1`.
> **Exception** — a counter guarded so 0 never displays (empty state swaps in a
> different string) sidesteps the rule; verify the guard exists before flagging,
> and flag the guard's absence rather than the string when it doesn't.

The audit signature: a key whose `one` branch is written `=1` (exact match)
instead of the `one` category, with 0 falling through to `other` — renders *0
postes*. This ships constantly because the English source uses `=1` correctly
for English.

## FR-MANY · Millions bind through *de*

> **Trigger** — counters that can plausibly reach 10⁶, and any compact-notation
> display.
> **Rule** — French has a third cardinal category, `many`, for round millions
> and beyond: *1 million de messages, 2 millions de messages* — the noun
> attaches with *de*, so a two-branch message renders *2 millions messages* the
> day the counter crosses. Add the `many` branch where the magnitude is
> plausible.
> **Source** — CLDR French cardinal rules since v38 (`many`: round millions
> with no visible fraction, and compact exponents).
> **Exception** — do not add `many` branches to counters that structurally
> cannot reach millions; a branch nobody can render is untestable weight.

## FR-AGREE · Agreement does not stop at the plural block

> **Trigger** — verbs, pronouns, adjectives or participles **outside** the
> plural block of a message that carry number or gender from a noun **inside**
> it; frozen participles beside a count placeholder.
> **Rule** — adjectives and past participles agree in gender and number with
> their noun, wherever the message-format syntax put the boundary. When the
> shared tail of a plural message disagrees with a branch (*1 poste … n'ont pas
> passé le cap*), restructure: move the agreeing material inside the branches,
> even when that means duplicating markup or text. Terse counters with frozen
> participles (*{count} sélectionné*, *{count} avancé*) are the same defect at
> smaller scale — either give them real plural branches with agreed forms or
> recast to an invariant noun (*{count} en attente*, *sélection : {count}*).
> **Source** — core French grammar; the restructuring license comes from the
> format contract itself — placeholder **position** is not part of the
> skeleton, and moving structure to where French grammar needs it is required,
> not permitted
> ([the skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable),
> its names and syntax byte-identical; its geography yours).
> **Exception** — when the source message physically cannot host the fix (the
> agreeing word sits in a different key, or the tail interpolates a placeholder
> whose own number is unknowable), the finding is a **source defect**: the
> English message's shape caps French quality, and per
> [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
> it goes to the source's owner rather than being papered over in one locale.

## FR-PLURAL · Acronyms and brands take no -s; avoid (s)

> **Rule** — *des PC*, *des SDK*, brand names likewise — no plural *-s* on
> acronyms or proper names. And write the alternative out — *le ou les
> périphériques* — rather than the parenthesized *le(s) périphérique(s)*; the
> bracket form is tolerated only where UI space genuinely forces it.
> **Source** — Microsoft French style guide §4.1.10 (nouns, plural forms).
> **Exception** — the space-pressure tolerance is real but must be claimed,
> not assumed: a chip may carry *(s)*; body prose may not.

## The unknown-gender problem

French has no free neutral. A person of unknown gender behind *candidat retenu*
forces a policy choice with three honest options:

1. **Generic masculine** — grammatically traditional, increasingly read as
   exclusionary in candidate- and employee-facing surfaces.
2. **Inclusive brackets** — *candidat(e)*, *retenu(e)* — explicit, but FR-PLURAL
   discourages the form outside space pressure, and it stacks badly with plural
   (*évalué(e)s* renders *1 évalué(e)s* beside a count).
3. **Neutral recast** — rewrite so nothing agrees with the person: *Contact
   envoyé* instead of *Contacté*, *poste pourvu* instead of *recruté(e)*, *{org}
   peut démarrer* instead of *{org} est prêt(e)*. Costs a rewrite per string,
   reads best, and is the only option that composes with plurals.

The rule that matters is not which option wins but that **one option is
recorded and applied product-wide**. Audited catalogs reliably show all three
coexisting — inclusive brackets in one namespace, generic masculine in the
next — and each individual string is defensible while the whole is incoherent.
Decide once; sweep once.

## When not to apply this

Do not force plural branches onto messages the source authored without them
when the display can never vary (a heading over an always-plural list). Do not
"fix" agreement on abstract label frames: a filter chip *Tous* over a feminine
list is the near-universal French convention reading as "all [items]", and a
category-label row may legitimately stay masculine-singular as a label frame —
rule on the frame once rather than agreeing chips one at a time.
