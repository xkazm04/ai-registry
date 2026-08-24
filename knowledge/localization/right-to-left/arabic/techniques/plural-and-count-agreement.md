---
layer: technique
type: technique
subject: arabic
technique: plural-and-count-agreement
status: forged
laws: [format-skeleton-is-inviolable, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [writing or auditing Arabic plural variants, approving a source message format for an ar locale, a count placeholder appears in any Arabic string]
---

# Plural and count agreement

Arabic has the richest plural system most fleets will ever ship: all six CLDR
plural categories are live, and they select genuinely different grammatical
forms, not six rewordings of one sentence. A localizer treats the category set
as grammar; a format owner treats it as a contract; an auditor treats a missing
category as a defect with a known severity.

## AR-PLURAL-SIX · All six CLDR categories, each grammatically distinct

CLDR's rules for `ar` (source: CLDR plural rules, Unicode):

| category | condition | example noun form for "book" |
|---|---|---|
| zero | n = 0 | لا كتب — negated plural or "no items" phrasing |
| one | n = 1 | كتاب واحد — singular |
| two | n = 2 | كتابان — the **dual**, its own morphology |
| few | n % 100 in 3–10 | ٣ كتب — number + **plural** noun |
| many | n % 100 in 11–99 | ١١ كتابًا — number + **singular** noun again |
| other | else (100, 101, …) | ١٠٠ كتاب — number + singular |

Load-bearing consequences:

- **The dual is not "2 + plural noun."** كتابان/كتابين is a distinct number
  category; writing `2 كتب` is a grammar error, and idiomatic dual usually
  omits the numeral entirely (the form itself says "two").
- **few and many flip the noun**: 3–10 takes the plural, 11–99 takes the
  singular. A translator who fills all four upper categories with the same
  plural noun has produced strings that are each wrong for most of their
  range.
- **The modulo matters**: 103 is few, 111 is many. Any hand-rolled pluralizer
  keyed on raw n instead of n % 100 is wrong from 103 upward; use the
  CLDR-driven selector the message format provides, never a threshold chain.
- **zero is a real category in `ar`** (unlike most European locales where 0
  routes to other). Arabic idiom for zero is typically a negation (لا توجد
  عناصر, "there are no items"), which is also better UX than "0 items" — but
  it only exists if the `zero` variant exists.

## AR-PLURAL-FREEZE · A one/other catalog cannot be grammatical — escalate it

A source format frozen to `one`/`other` (or worse, a single string with a bare
`{count}`) is **structurally unable to produce grammatical Arabic**: no single
"other" string agrees with 2 (dual), 5 (plural noun) and 15 (singular noun) at
once. This is not a quality shortfall a better translator can compensate; it
is a source-format defect under
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth),
and the fix — a message format with per-locale category sets — is owned
upstream. Record it; do not silently work around it.

When the freeze genuinely cannot be lifted, the mitigations, ranked:

1. **Recast to avoid agreement**: put the count after a colon in a nominal
   frame — `العناصر: {count}` ("items: N") — which is graceless but correct
   for every n. This is the standard workaround and the one to prefer.
2. **Choose the singular counted form** as the least-wrong single noun (it is
   correct for 1, 11–99 and 100+, wrong for 2–10).
3. Never: invent a fake plural, or bolt Latin `s` (see AR-NO-LATIN-PLURAL).

## AR-COUNT-NOUN · Number–noun agreement when the numeral is written out

When copy spells the numeral as a word (marketing strings, ordinal phrases),
full classical agreement applies, including **reverse gender polarity** for
3–10 (ثلاثة كتب — feminine-form numeral with masculine noun; ثلاث غرف —
masculine-form numeral with feminine noun). UI copy mostly dodges this by
using digits, where the convention is digit + correctly-numbered noun
(AR-PLURAL-SIX's table) and case endings are left unmarked as usual for UI
prose. Decision rule: in UI strings prefer the digit form — it is shorter,
sidesteps polarity, and matches how counts arrive as placeholders; reserve
written-out numerals for prose surfaces, and when you must write them, check
polarity rather than trusting instinct, because it is the single most common
grammar slip of fluent non-specialist writers.

## AR-NO-LATIN-PLURAL · Never pluralize with a Latin s

Never append a Latin `s` to an Arabic word or a frozen Latin token to fake a
plural — not `شخصيةs`, not `KPIs` inside an Arabic sentence (write مؤشرات
الأداء or keep the acronym unmarked and let the sentence carry number). This
defect is real: it appears when a translator meets a source key with no plural
variants and manufactures one. The bolted `s` frequently travels with a second
defect — the placeholder name itself translated, which breaks substitution
outright per
[the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable).
The correct behavior when variants are missing: keep the placeholder
byte-identical, pick the single noun form that reads least wrong across counts
(AR-PLURAL-FREEZE's ranking), and record the source defect.

## Auditing plurals (what a finding cites)

- Missing category in a format that supports it → cite AR-PLURAL-SIX; severity
  major (the string is wrong for a whole numeric range, silently).
- Same noun form duplicated across few/many → cite AR-PLURAL-SIX (the flip).
- Source frozen to one/other → cite AR-PLURAL-FREEZE; file upstream, apply
  mitigation 1 or 2 locale-side.
- Latin `s`, translated placeholder → cite AR-NO-LATIN-PLURAL; critical when
  the placeholder name changed (runtime failure), major otherwise.

## When NOT to apply

Do not force all six variants onto messages with no grammatical agreement to
carry — a bare "Total: {count}" nominal frame needs one string, and demanding
six identical variants inflates the catalog and translator load for nothing.
The technique governs strings where a noun (or verb) agrees with the count,
not every string that happens to contain a number.
