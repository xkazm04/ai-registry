---
layer: technique
type: technique
subject: czech
technique: plural-and-count-agreement
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [writing or auditing any Czech string with an interpolated count, expanding plural branches for cs, debugging a string that reads wrong at count 1 or 3]
---

# Plural and count agreement

Every live number in a Czech string is a small grammar engine: it selects the
noun's case, the verb's number and gender, and the form of any quantifier or
adjective in range. English's flat `{count} items` gives no hint of this, so
count strings are the densest defect class in any Czech catalog — and the
defects are invisible to anyone testing with the count the seed data happens
to produce.

## The system

Czech cardinal counts split four ways, per the CLDR plural rules for cs:

| CLDR category | When | Grammar | Example |
|---|---|---|---|
| `one` | integer 1 | nominative singular; singular verb | *1 kandidát čeká* |
| `few` | integers 2–4 | nominative plural; plural verb | *3 kandidáti čekají* |
| `many` | any non-integer | genitive **singular** | *1,5 dne* |
| `other` | 0 and integers 5+ | genitive plural; **neuter singular** verb | *5 kandidátů čekalo* |

Two boundaries defeat trained intuition. First, `many` is the **decimal**
category, not a large-number category — a translator who knows Russian will
misread it, and a catalog counting only whole things may legitimately omit it,
but any rate, average, size, or duration cannot. Second, `one` and `few`
require an integer *representation*: "1,0" selects `many`. Ordinals need no
selector at all — Czech ordinal formatting (*15.*) is invariant.

## CS-NUM · A live count needs a plural block, not a frozen form

> **Trigger** — an interpolated count standing before a noun, a
> numeral-agreeing quantifier (*všechny/všech*), or an agreeing adjective.
> **Rule** — the count sits inside a plural selector with Czech
> `one/few/other` (plus `many` when non-integers are possible). One frozen
> form is ungrammatical for at least one range: a genitive plural is wrong at
> 1 and 2–4; a nominative plural is flatly wrong at 5+.
> **Source** — CLDR plural rules for cs; agreement per standard Czech
> grammar.

The agreeing material moves *into* the branches with the count. A frozen
adjective outside the block paired with a declining noun inside it produces
hybrids like *"1 publikovaných role"* — each branch must carry the full
agreeing phrase in the case that branch's count governs:

```
{count, plural, one {# publikovaná pozice} few {# publikované pozice}
                other {# publikovaných pozic}}
```

The worst legal-looking choice is nominative plural as the `other` value — it
reads fine in review next to a 3 and is broken in production next to every 5.

## CS-AGREE · The tail outside the plural block must be count-invariant

> **Trigger** — any material sharing a sentence with a plural block but
> sitting outside its branches.
> **Rule** — the half nobody checks. Branches get expanded correctly, then an
> agreeing verb or genitive-plural noun is left in the **shared** tail, so
> the `one` rendering breaks: *"1 kandidát … už nebyli pod hranicí"*. Either
> move the agreeing word inside the branches, or recast the tail into a form
> identical across 1/3/5 (*vrátí se*, *nedošlo k*).
> **Source** — same grammar as CS-NUM; separated because audits that check
> branch contents systematically miss the tail.

Audit procedure: render the full sentence at counts 1, 3, and 5 (and 1,5 if
decimals are possible) and read each rendering whole. Checking branches in
isolation passes strings that no rendered count survives.

## The count-invariant escape hatch

When the number lives in a *separate* UI element (a badge beside the text) so
the string carries no count placeholder, do not fake agreement — choose a form
that is identical for every count: a neuter verb fronting the number
(*postoupilo {n}*, *zamítnuto {n}*) or a noun whose relevant form is invariant
(*rozhodnutí* is the same at 1, 3, and 16). The same move rescues layouts
where a plural block is impossible. It is an escape hatch, not the default:
used where a plural block is available, it flattens language the block would
render correctly.

## System limits, and the two honest workarounds

Some i18n systems expose only two plural slots for Czech (`one`/`other`, no
`few`). Czech needs three integer forms, so this is a source-side limitation
to work around deliberately, in one of two settled ways — not per-translator
improvisation:

1. **Genitive-plural `other`** for descriptive strings — the 5+ form reads
   acceptably (not perfectly) down to count 2: *{count} nových zpráv*.
2. **The parenthetical shorthand** for tight confirm/button labels where 2–4
   counts are common: *Smazat {count} soubor(y/ů)* — packs both endings,
   ugly but unambiguous, and long-established in Czech software.

Never resolve the missing slot with nominative plural, and record which
workaround the catalog uses so the two do not mix.

Two adjacent failure classes are format-contract, not grammar, and the plural
work surfaces them: a call site that passes an **already-formatted string**
into a plural selector (the selector needs the raw number — pre-formatted
input breaks category selection and can render an error token to users), and
plural syntax keywords themselves getting translated. Both are skeleton
breaks: critical, mechanically checkable, and owned by whoever owns the
source, not by the localizer who found them.

## When NOT to apply this technique

Numbers that are labels rather than counts — versions, IDs, years, times —
govern nothing and need no plural machinery. And do not retrofit plural blocks
onto counts a product guarantees are always ≥ some bound *silently*: encode
the guarantee, or the first 2 breaks the string; if the guarantee is real and
recorded, the count-invariant form is the cheaper correct answer.
