---
layer: technique
type: technique
subject: spanish
technique: typography-and-punctuation
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [writing or auditing Spanish punctuation and glyphs, deciding whether a UI string needs inverted marks, handling numbers and quotes in Spanish strings]
---

# Typography and punctuation

Spanish typography is almost entirely mechanical — every rule here is decidable by
looking at the string, which makes this the cheapest full-coverage audit pass a
Spanish catalog gets. The two traps are the opening marks (the only ones English
authors have no instinct for) and regional number formats (the one place "Spanish"
has no single answer).

## ES-INVERT · opening ¿ and ¡ are mandatory on real questions — and start where the question starts

Every direct question opens with *¿* and every exclamation with *¡*, per the
language academy — omission is an orthographic error, not an informality. The craft
is knowing where UI strings *are* questions:

- **Full interrogative sentences need the marks:** *"¿Guardar los cambios?"*,
  *"¿Olvidó su contraseña?"*, *"¿Está seguro?"* — confirmation dialogs are the
  densest habitat.
- **The mark opens the question, not the sentence.** When a statement precedes the
  question, *¿* goes mid-sentence, lowercase continuing: *"Si el problema
  persiste, ¿desea reiniciar?"* — placing it at the sentence start is as wrong as
  omitting it.
- **Elliptical labels are usually better recast.** An English pattern like
  *"Forgot password?"* is a fragment; Spanish either completes it into a real
  question (*"¿Olvidó su contraseña?"*) or recasts as a statement (*"He olvidado
  mi contraseña"* — first-person link copy, an established convention). What it
  never does is keep the fragment with only a closing mark.
- Never a space after *¿*/*¡* or before *?*/*!*.

**Source:** RAE orthography; the academy explicitly rejects English-influenced
single-mark usage.

## ES-EXCLAIM · restraint on ¡! — calm surfaces stay calm

Grammatically, exclamations take *¡…!*; editorially, product copy uses them
sparingly. Status, error, and confirmation copy defaults to no exclamation:
*"Éxito"*, *"Error al guardar"*, *"Cambios guardados"* — an error message that
shouts is a voice defect layered on correct grammar. Reserve *¡…!* for genuine
short celebration moments a consumer product deliberately designs
(*"¡Listo!"*), and then always paired — an English-style trailing *!* without its
opener is the same orthographic error as a bare *?*.

## ES-QUOTES · guillemets first, curly inside, ASCII never

The academy's nesting order is **« » → “ ” → ‘ ’**: guillemets (*comillas
angulares*) outermost, curly doubles for a quote inside a quote. Latin American
editorial practice widely uses curly doubles as the primary pair; a product picks
one primary pair, records it, and stays consistent — the typed error is mixing, or
shipping ASCII straight quotes `"…"` as the *visible* glyph. Escaped straight
quotes in the catalog's storage format are serialization, not typography; what
renders around an interpolated value should be *«{value}»* (or the recorded curly
pair), never `"{value}"`. Apostrophe: Spanish barely uses one — elision is not
written (*"para"* never *"pa'"* in product copy) — so an apostrophe in Spanish
output is nearly always leaked English.

## ES-ELLIPSIS · one glyph, three dots never

The ellipsis is the single character *…* (U+2026), including the in-progress
convention (*"Guardando…"*), menu-item truncation, and trailing thought. Three
periods `...` render with wrong spacing, break at line ends, and defeat any audit
that greps for the glyph. After *…* mid-sentence, continue lowercase with a space;
*…* already contains any terminal period (never *"…."*).

## ES-NUMBERS · number format is regional, which is why strings never contain formatted numbers

The decimal separator is the comma in Spain and most of South America
(*1.234,56* or academy-preferred thin-space grouping *1 234,56*), the point in
Mexico, Central America, and US Spanish (*1,234.56*). Consequences, in order of
importance:

1. **A literal formatted number inside a translated string is a defect** — the
   translator hand-picks one region's format and hardcodes it for all. Numbers
   reach strings through placeholders formatted by the runtime locale; a limit or
   constant baked into copy is a source defect to file upstream, or is spelled
   out in words (*"diez mil"*) if it is genuinely fixed prose.
2. Four-digit integers group nothing per the academy (*1000*, not *1.000*) and
   years never group (*2026*); grouping starts at five digits.
3. Percent: Spanish convention (academy) separates — *50 %* — but UI practice
   overwhelmingly closes up *50%*; record one choice per product, and treat the
   space, if chosen, as non-breaking.
4. Currency symbol position follows the locale (*1.234,56 €* in Spain; *$1,234.56*
   in Mexico) — again the formatter's job, never the string's.

**Source:** RAE orthography for grouping and percent; CLDR number patterns per
region for the separator split.

## ES-DASH-HYPHEN · real dashes, and hyphens that barely exist

Asides and attributions take the em dash *—* (*raya*), closed up to the aside on
the inside (*"—inicio de la conversación—"*) in academy typography, though
spaced usage is common in UI; pick one. The ASCII double hyphen `--` is never a
dash. Ranges take a simple hyphen or en dash (*págs. 3-5*). Spanish compounds
fuse rather than hyphenate (*autorreparación*, one word, with the *rr* doubling
the fusion forces; *autoevaluación*) — an English-style hyphenated or spaced
compound (*"auto reparación"*) is a spelling error, not a style choice.

## ES-CASING-WORDS · the lowercase set English keeps capitalizing

Days, months, seasons, languages, and nationality adjectives are lowercase:
*lunes*, *enero*, *español*, *mexicano*. So are job titles and UI words that
English capitalizes reflexively. This rule covers the word-level habit; label-level
sentence case is ui-conventions-and-length's ES-CASE.

## When not to apply

Storage-format escaping, and glyph limitations of a font or legacy terminal, are
engineering constraints — the string's *rendered* form is what these rules judge.
Developer-facing surfaces that echo literal code or log output keep their ASCII
faithfully; typographic Spanish applies to copy, not to quoted machine text.
