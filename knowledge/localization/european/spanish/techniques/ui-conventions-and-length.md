---
layer: technique
type: technique
subject: spanish
technique: ui-conventions-and-length
status: forged
laws: [clean-strings-stay-untouched]
shared_with: []
use_when: [writing Spanish labels and controls, fixing overflow in Spanish UI, deciding casing or verb form for a button or heading]
---

# UI conventions and length

Spanish UI writing is governed by three conventions English authors reliably get
wrong — sentence case, the infinitive on controls, and a 15–25% length tax — and
all three are decidable at the string level, which makes them audit-cheap.

## ES-CASE · sentence case everywhere; Title Case is an anglicism

Spanish capitalizes the first word of a label and proper nouns, nothing else:
*"Todas las plantillas"*, *"Configuración avanzada"*, *"Revisión manual"* —
never *"Todas Las Plantillas"*. This holds for headings, buttons, menu items, tab
labels, and dialog titles alike; Spanish has no Title Case register at all, so
importing the English source's casing is always wrong, regardless of how the
English was cased. The subtle half of the rule: when a brand name doubles as a
common noun, casing *is* the meaning — capitalized mid-sentence it claims to be
the brand, lowercase it counts things — so a quantifier followed by a capitalized
common noun (*"Todas las Plantillas"*) is a typed casing error, not a nicety.
Word-level lowercase habits (days, months, languages) are
typography-and-punctuation's ES-CASING-WORDS; this rule owns the label level.

**Source:** the major vendors' published Spanish style guides all mandate
sentence case for UI; the academy's orthography supplies the proper-noun rules.

## ES-INFINITIVE · infinitive for pure actions, conjugated imperative for sentences

The Spanish control-labeling convention, consistent across the major vendors'
shipped UIs:

- **Bare infinitive for an isolated action label:** *Guardar*, *Cancelar*,
  *Eliminar*, *Buscar* — a button, menu item, or toolbar entry naming what
  pressing it does. Register-neutral (see register-and-address) and shortest.
- **Conjugated imperative for a sentence that instructs the user:** *"Guarde los
  cambios antes de salir"* / *"Guarda los cambios antes de salir"* (per the
  recorded register) — inline instructions, empty states, onboarding copy.
- **Noun phrase for a destination or section:** *Configuración*, *Ajustes*,
  *Descargas* — a place, not an action. The tell for choosing between *Guardar*
  and a noun: if the element performs, infinitive; if it navigates to where things
  live, noun.

The typed error is the fourth option English invites: a conjugated imperative as
a bare button (*"Guarda"*) — it drags register into a surface that did not need
it and reads abrupt in both registers.

## ES-LENGTH · budget 15–25% expansion, and shorten lexically before typographically

Spanish UI prose runs 15–25% longer than English, and single nouns run worse
(*review* → *revisión* +60%; *workflow* → *flujo de trabajo* 2.4×), so the
squeeze concentrates in exactly the narrow surfaces — buttons, chips, table
headers, tabs. Tactics in order of preference:

1. **Exploit pro-drop and article-for-possessive** (the register and calque rules
   already require both) — correctly de-anglicized Spanish is the first length
   win, free.
2. **Prefer the infinitive over the imperative sentence** where ES-INFINITIVE
   allows it — *"Guardar"* beats *"Guarde los cambios"* when context carries the
   object.
3. **Choose the shorter synonym:** *ajustes* over *configuración*, *usar* over
   *utilizar*, *crear* over *generar* — *utilizar* in particular is pure length
   with no added meaning; the academy itself calls the preference for it over
   *usar* unjustified.
4. **Collapse compounds to the fused single word** where one exists
   (*autorreparación*, not *auto reparación*).
5. **In a genuinely narrow slot, prefer the recorded short/borrowed form over the
   full translated phrase** — per terminology-and-loanwords' loan rule; save the
   full phrase for subtitles and body copy.
6. **Hard stop:** a label that would exceed roughly 140% of the English character
   count, or that wraps in its slot, goes back for a shorter rendering — a
   wrapped button is a worse defect than an imperfect short word.

The audit half: length findings are typed against the slot's budget, and the fix
touches only the flagged string — a length pass is not an invitation to rephrase
its clean neighbors.

## ES-ABBREV · abbreviate by rule, or not at all

When truncation is unavoidable, Spanish abbreviates with a period (*pág.*,
*núm.*, *aprox.*) and keeps gender/number marks in superscript forms (*1.º*,
*n.º*); it does not invent English-style clipped forms (*"config"*,
*"info"* are tolerated colloquialisms, not label register). Prefer a different
word to an abbreviation, and an abbreviation to an ellipsized truncation —
*"Configurac…"* in a column header is the worst available outcome, because it is
the only one that is not Spanish at all. Weekday/month abbreviations come from
the locale data (*lun.*, *ene.*), lowercase like their full forms, and never
hand-typed into strings.

## ES-A11Y-EXPANSION · what the visible label hides, the accessible name must say

Where a narrow slot forced a clipped or borrowed label, the accessible
name/tooltip carries the full Spanish phrase — a screen-reader user gets *"flujo
de trabajo"* even when the chip shows the short form. This is the compensating
half of every length compromise above: shortening is legitimate exactly because
the full rendering still exists somewhere the user can reach. A borrowed English
label with no Spanish gloss anywhere in the surface is a length tactic that
became a comprehension defect.

## When not to apply

Body copy, empty-state prose, and documentation strings have no meaningful length
budget — applying button tactics there strips natural Spanish down to telegraphese
for no benefit. And casing/verb-form conventions never override a recorded brand
or feature-name treatment: those pass through as the product's own artifacts
dictate.
