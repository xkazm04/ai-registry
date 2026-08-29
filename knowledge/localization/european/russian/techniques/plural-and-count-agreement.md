---
layer: technique
type: technique
subject: russian
technique: plural-and-count-agreement
status: forged
laws: [the-source-locale-is-the-source-of-truth, format-skeleton-is-inviolable]
shared_with: []
use_when: [translating any string with a numeric placeholder, auditing plural forms in a Russian catalog, deciding what to do when the runtime offers fewer plural slots than Russian needs]
---

# Plural and count agreement

Russian count agreement is arithmetic, not judgment: given the number, the correct
form is fully determined. That makes it the most auditable area of a Russian
catalog — and the most reliably broken one, because the arithmetic has more
outcomes than most source languages, most translators' habits, and many runtimes'
slot models.

## RU-PLURAL · the four CLDR categories and their genitive mechanics

**Trigger:** any string where a number and a noun (or a noun phrase the number
governs) appear together.

**Rule:** Russian selects the noun form by the CLDR plural rules for ru — decided
by the number's last digits, not its magnitude:

| Category | Condition | Noun form | Example |
|---|---|---|---|
| one | last digit 1, and last **two** digits not 11 | nominative singular | 1 файл, 21 файл, 101 файл — but **111 файлов**, because 111 ends in 11 |
| few | last digit 2–4, and last two digits not 12–14 | genitive singular | 2 файла, 23 файла — but **112 файлов** |
| many | everything else: 0, 5–20, 25–30… | genitive plural | 5 файлов, 11 файлов, 100 файлов |

Read the exclusions as **last two digits**, not as the literal numbers 11–14. The
loose phrasing "not 11" is where hand-rolled selectors go wrong: an implementation
that keeps the last-digit test and drops the teen test disagrees with the standard
on 400 of the first 10,001 integers, beginning at 11, 12, 13, 14 and then again at
111, 112, 113, 114.
| other | fractions | genitive singular | 1,5 файла |

The mechanism behind the table: a Russian numeral *governs the case* of its noun
rather than agreeing with it. Two-to-four take the genitive singular (a remnant of
the old dual), five and up take the genitive plural, and the teens 11–14 are
lexically "teen" words, so they take genitive plural regardless of their last
digit — which is the whole 21-vs-11 asymmetry. Adjectives inside the counted
phrase inflect too («2 новых файла», «21 новый файл»), so a counted phrase is
never assembled from independently translated fragments.

**Source:** CLDR plural rules for Russian (cardinal). Note the category-name trap:
by a historical accident of how the categories were defined, Russian's residue
category is `many` and `other` matches only fractions — the reverse of what the
names suggest. A translator who fills `other` believing it is "the plural" has
written the form that renders for 1,5 items and nothing else in a compliant
runtime — and in a two-slot runtime, the form that renders for everything.

**Exception:** none. The rules are total over the integers. What varies is the
runtime's fidelity to them, which is the next rule's subject.

## RU-FROZEN · the frozen-form failure, and rephrasing out of agreement

**Trigger:** the runtime or message format offers fewer plural slots than Russian's
categories — most commonly a hardcoded one/other pair — or a translator is filling
a single non-plural string with a numeric placeholder.

**Rule:** never pick one declined form and freeze it. Every choice is wrong on a
predictable, high-frequency subset: the genitive plural («{count} файлов») breaks
at 2, 3, 4, 22, 23, 24…; the genitive singular breaks at 1 and 5+; the nominative
singular breaks everywhere but numbers ending in 1. Because 2–4 are among the most
common counts in real UI, the frozen 5+ form is not a rare-edge defect — it is
wrong within the first screen a user sees.

The correct move is structural: **rephrase so no word has to inflect with the
count.**

- Colon form: «Найдено: {count}», «В очереди: {count}».
- Verb next to the number instead of a noun: «{count} выполняется» — verbs do not
  decline for the numeral the way nouns do.
- Move the noun out of the number's government: «Файлы: {count}» — the noun is a
  label, not a counted phrase.

These are first-class professional Russian UI idioms, not degraded compromises;
prefer them even when a full plural system is available but the string is
low-value, because they are immune to future refactors of the plural plumbing.

**Source:** standard Russian localization practice; the CLDR rules define what the
runtime *should* support, and this rule governs the gap when it does not.

**Exception:** when a string genuinely cannot avoid a count-agreeing noun (rare —
usually a marketing sentence, not a UI label), do not silently pick a form: the
missing plural slots are a **source/runtime defect** that caps every string of
that shape at once, so record it in the defect register and escalate rather than
working around it in one string. A locale-side workaround hides the defect while
every other counted string keeps paying for it.

## RU-FRACTION · fractional and formatted numbers

**Trigger:** a counted phrase whose number can be non-integer, or is formatted by
the runtime.

**Rule:** fractions select `other` — genitive singular («1,5 часа», «2,5 балла») —
regardless of the integer part's last digit.

**The mechanism, and it is wider than the word "fractions".** Every one of the
three categories above is guarded by a condition requiring **zero visible fraction
digits**. So the trigger is not "the value is fractional", it is "the number is
*displayed* with a fraction digit" — and **«2,0» selects `other` even though it is
not a fraction**. The consequence for a surface formatted to a fixed decimal place
— a rating, an average, a «2,0 ГБ» readout — is total: every count lands in
`other` whatever its magnitude, and `other` stops being the residue and becomes
the only branch that ever renders. Write it accordingly.

This is also the trap for a hand-rolled selector, and it is invisible in testing:
an implementation that applies the last-digits table without checking for a visible
fraction digit agrees with the standard on **every integer** and disagrees on
**every one-decimal value** — «2,5» to *few*, «21,5» to *one*. It is correct on
exactly the inputs a developer tries.

Russian writes the decimal separator as a comma, so a runtime formatting numbers
must be emitting ru-formatted values into ru strings; a hand-typed «1.5» inside a
Russian string is a formatting calque as well as a plural risk.

**Compact notation is the one case where display and category re-converge.** The
rule language shifts the operands for a compactly-formatted number before the
conditions are evaluated, so «12,3 тыс.» is read as 12300 with no visible fraction
digits and selects `many` — despite the comma on screen. Compute against the
formatter the surface actually uses, and the pair does not need auditing
separately.

**Source:** CLDR plural rules for Russian; Russian orthographic convention for the
decimal comma.

**Exception:** version numbers, IDs and other non-quantity numerals («версия 2.1»)
are names, not counts — they neither trigger plural selection nor take the decimal
comma. Do not "fix" them.

## RU-PLURAL-RANGE · A range selects from its own table, and its end can be singular

**Trigger:** any string rendering a span — «2–5 файлов», «5–21 файл».
**Rule:** a range is a lookup on the **(start, end)** category pair in a separate
published table, whose *default* — used when a pair is absent — is the **end**
category. Russian's table publishes all 16 pairs and **not one of them deviates
from that default**: every result equals its end. So for Russian the end value
does decide, and that is a *verified* fact rather than a safe assumption.
The consequence worth writing down is that **the end can be `one`**: 5–21 selects
`one`, so «5–21 файл» — singular noun on a span that starts at five.
**What a table's existence does not tell you.** Other locales publish tables in
which several rows *do* override the end-value default, and there an end-value
shortcut is simply wrong. Presence and size say nothing; only reading the rows
does. A run that counts rows and infers "overrides exist" has misread agreement
for deviation.

## Audit procedure

For a plural pass over a Russian catalog:

1. Enumerate every string with a numeric placeholder adjacent to a declinable
   word; this is mechanical.
2. For each, determine the runtime's actual slot model — from the message format's
   plural syntax if present, from the call sites if not. Two-slot call sites in a
   nominally CLDR-aware stack are common and invisible from the catalog.
3. Strings with full category support: verify all four slots carry the correctly
   declined forms; the wrong-`other` fill (RU-PLURAL's trap) is the most frequent
   finding.
4. Strings without full support: verify the RU-FROZEN rephrasing was applied, and
   file the runtime gap once, as a source-side defect, rather than per string.

Every finding from this procedure is typed and citable — plural findings are never
matters of taste, which is what makes them the right strings to audit first when
calibrating a new reviewer or a review agent on Russian.
