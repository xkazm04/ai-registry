---
layer: application
type: application
subject: russian
technique: plural-and-count-agreement
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — plural and count agreement in the Personas ru catalog

How a real 19k-key, 14-locale catalog (the Personas app,
`C:\Users\kazda\kiro\personas`) hit the frozen-form failure and settled the
rephrasing doctrine that RU-FROZEN teaches. The locale's working contract is
`docs/i18n/style-ru.md`, layered on `docs/i18n/glossary.md`.

## The runtime is a two-slot system, verified at the call sites

The decisive fact was established by reading components, not the catalog: the
runtime implements no CLDR plural categories. Every counted string is a hardcoded
`count === 1 ? key_one : key_other` ternary in the React component — verified in
`NodeChip.tsx` and others (`docs/i18n/style-ru.md`, "Two-way plural key, three-way
Russian grammar"). There is no `_few` slot for Russian's 2–4 category, so the
catalog *cannot* express «2 персоны» through the plural mechanism: whatever sits
in `_other` renders verbatim for every count except 1.

This is the RU-PLURAL trap in production form: a translator who fills `_other`
with the genitive plural («{count} персон») ships a string that is correct at 5+
and wrong at 2, 3, 4, 22, 23, 24… — the most common counts on a dashboard.

## The recorded ruling: rephrase, flag what can't be rephrased

The style guide's ruling (pitfall #4) follows RU-FROZEN exactly, with shipped
strings as the pattern book:

- Colon form: «Найдено: {count}», «В очереди: {count}».
- Verb-next-to-number: the shipped `strip_running: "{count} выполняется"` avoids
  the declined noun entirely by putting a verb beside the number — cited in the
  guide as the shape to prefer.
- Residue: a string that genuinely cannot avoid a count-agreeing noun is flagged
  into the run's review list per `glossary.md` §4, never silently given the 5+
  form.

Note what the process does *not* do: it does not patch Russian locally with a
hand-rolled plural helper. The missing `_few` slot is a source/runtime defect that
caps ru, cs, and every other multi-category locale at once, so it is recorded as
such — the law that the source locale is the source of truth, applied to runtime
mechanics rather than string text.

## What transfers

1. **Verify the slot model from call sites, not from key suffixes.** The catalog
   had `_one`/`_other` keys, which *look* like ICU plural support; only the
   component read (`NodeChip.tsx`) revealed the ternary. Any Russian plural audit
   that trusts key shape over call sites will certify broken strings.
2. **The rephrasing idioms are the shipped house style, not an emergency
   fallback** — `strip_running` was written that way from the start and reads as
   native Russian. Treating RU-FROZEN forms as first-class avoids a future
   re-translation when the plural plumbing is fixed.
3. **The flag-don't-guess residue rule needs a destination** — it works in this
   repo because the glossary defines a review-list channel (§4). A process
   adopting the doctrine without a defect register will find translators silently
   guessing anyway.
