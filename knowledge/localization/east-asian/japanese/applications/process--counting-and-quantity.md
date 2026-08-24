---
layer: application
type: application
subject: japanese
technique: counting-and-quantity
stack: process
status: forged
verified_on: 2026-08-24
---

# Counting and quantity — incidents from the Personas ja catalog

The counting technique's rules were not hypothetical in the Personas app
(19k keys, 14 locales): three of them correspond to real shipped bugs in
`src/i18n/locales/ja.json`, recorded as wrong→right pairs in
`C:\Users\kazda\kiro\personas\docs\i18n\style-ja.md` (Pitfalls section) and
verified there 2026-08-24.

## The compound incident: JA-NO-PLURAL-S plus a skeleton break

Shipped bug at key `monitor.subtitle`, source
`"{personas} personas · {attention} need attention · {running} running"`:

- Wrong (shipped): `"{ペルソナs} ペルソナs · {attention} need attention ·
  {running} running"` — three defects in one value: the placeholder
  `{personas}` renamed to `{ペルソナs}` (runtime break — the app looks up
  `vars.personas`), an English plural `-s` glued onto a katakana noun
  (JA-NO-PLURAL-S), and the rest of the sentence left untranslated.
- Right (per the repo's fix): `"ペルソナ {personas} 件 · 対応が必要
  {attention} 件 · 実行中 {running} 件"` — placeholder names untouched with
  only their positions moved, counters added, the source's half-width `·`
  chip separator preserved verbatim as a format token.

This is the canonical demonstration of why the plural-suffix-in-placeholder
variant is triaged under
[the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
(critical, runtime) while the bare `ペルソナs` on the visible noun is a
JA-NO-PLURAL-S style defect (major, cosmetic) — same suffix, two severities.

## The plural-machinery incident: JA-PLURAL-OTHER

Shipped bug at key `lab.run_arena`, source
`"Run Arena ({count} model{count, plural, one {} other {s}})"`:

- Wrong (shipped): `"{count, plural, one {} アリーナを実行します ({count}
  モデル other {s}})"` — the translator carried the ICU-style plural syntax
  into a runtime that has no ICU, so the braces render raw on screen, and
  interleaved the translation *into* the syntax.
- Right: `"アリーナを実行（{count} モデル）"` — the collapse the technique
  mandates: Japanese is CLDR other-only, so the branching disappears
  entirely and one string covers every count.

The repo notes the deeper lesson: even in a stack that *did* support plural
syntax, the correct ja value would still contain no branches — the defect was
treating English's grammar problem as universal.

## The counter incidents: JA-COUNTER in production

The repo's guide bans the bare numeral-plus-noun calque (`"3 ペルソナ"` is
its recorded wrong example, flagged as "reads as a raw machine-translation
artifact") and fixes it with counters — with a product-specific twist worth
seeing: personas and agents are counted with **体**, the counter for
personified figures (`ペルソナ {count} 体`), a deliberate voice choice
recorded in the product termbase, while generic items take the workhorse 件
(`{count} 件のレビュー`). That split is exactly the technique's claim that
counter choice is a per-concept termbase decision: the *rule* (a counter is
required, chosen per concept, recorded once) transplants; the *ruling*
(体 for personas) stays in the repo.

## Process shape worth copying

1. **Incidents are stored at the key.** Each pitfall names the real catalog
   key, the real source string, the shipped wrong value, and the fix — so a
   later bulk pass can regression-check the exact lines.
2. **Counter rulings live in the termbase row**, next to the rendering
   (`persona → ペルソナ, counted with 体`), not in a separate document — the
   translator meets the counter at the same moment they meet the word.
3. **The zero-plural fact is taught with its boundary.** The guide pairs
   "Japanese nouns don't inflect for number" with "that doesn't license a
   bare number" — preventing the over-correction where a translator, told
   plurals don't exist, deletes quantity grammar altogether.
