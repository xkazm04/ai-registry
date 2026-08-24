---
layer: application
type: application
subject: spanish
technique: typography-and-punctuation
stack: process
status: forged
verified_on: 2026-08-24
---

# Typography and punctuation — live defects from a shipped Spanish catalog

The typography rules in this subject are cheap to state and easy to believe
nobody breaks. The Personas fleet's Spanish style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-es.md`, Typography & punctuation
and Pitfalls sections) is useful precisely because it documents each rule against
a *live* violation found in the shipped `messages/es.json` — every anchor below
had a real string paying for it on 2026-08-24.

## Each rule, with its shipped counterexample

- **ES-ELLIPSIS.** The catalog carried `"Cargando..."` (three periods) next to
  `"cargando historial anterior…"` (the glyph) — the guide rules the
  inconsistency legacy drift and mandates `…` always. The teaching point: mixed
  ellipsis styles inside one file mean the audit must grep for `\.\.\.`, not
  trust that "someone would have noticed."
- **ES-QUOTES.** Shipped: `"coincidan con \"{query}\""` — ASCII straight quotes
  as the visible glyph around an interpolated value. The guide's ruling separates
  serialization from typography exactly as the technique does: the JSON escaping
  is a storage necessity; the character the user sees must be `«{query}»`.
- **ES-DASH-HYPHEN.** Shipped both `"-- verifica tu conexión"` (ASCII double
  hyphen) and `"— inicio de la conversación —"` (real em dash) — the guide types
  every `--` as a fix-on-touch bug.
- **ES-INVERT / ES-EXCLAIM.** The guide requires opening marks on full questions
  (`¿Guardar cambios?`) and then makes the editorial call the technique's
  ES-EXCLAIM describes: error and status copy stays calm — `"Éxito"`, not
  `"¡Éxito!"` — matching what had already shipped, with `¡…!` reserved for
  genuine short celebratory confirmations "if any exist at all."
- **ES-NUMBERS.** The sharpest find: `"Traza incompleta: {count} tramo eliminado
  (límite: 10.000)"` — a Spanish-style thousands separator hand-typed into the
  source string as literal copy. The guide's resolution is the technique's rule
  1 verbatim: any number that is not the placeholder must come from a runtime
  formatter, or be spelled out (*"límite: diez mil"*) if it is truly fixed prose.
  Note this catalog is LatAm-leaning elsewhere (*monitorear*), so the hardcoded
  Peninsular grouping was wrong for its own primary audience — hardcoding picked
  a region *and* picked the wrong one, which is the failure mode's usual shape.
- **Negative space.** The guide also records what Spanish does *not* need — no
  non-breaking space before `¿ ¡ : %` (explicitly contrasted with French), no
  RTL marks, no full-width punctuation — so a reviewer arriving from another
  locale's rules does not import them. `"{pct}%"` closed-up was ruled already
  correct and kept, an ES-NUMBERS percent-spacing decision recorded per product
  exactly as the technique asks.

## The process lesson

The guide's Pitfalls section is written as wrong→right pairs with the shipped key
named (`common.all_personas`, `common.success`, `common.saving`) — each pair is
simultaneously documentation, a regression test a reviewer can re-run by grep,
and the minted anchor for the next audit's typed findings. That is the
mint-the-anchor loop working: the first reviewer's finding became a citable rule,
so no later pass re-litigates it. The typography pass itself was scoped
mechanically (grep for `\.\.\.`, `--`, `"`, `\d\.\d{3}` in values) — the whole
class of defect is findable without reading a single string for meaning, which is
what makes it the right first pass over a 19k-key catalog.
