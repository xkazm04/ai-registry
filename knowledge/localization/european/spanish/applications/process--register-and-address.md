---
layer: application
type: application
subject: spanish
technique: register-and-address
stack: process
status: forged
verified_on: 2026-08-24
---

# Register and address — a worked usted ruling over a drifted catalog

How one real product recorded a Spanish register decision and managed the legacy
drift it uncovered: the Personas fleet's per-locale style guide at
`C:\Users\kazda\kiro\personas\docs\i18n\style-es.md`, governing the `es` locale of
a ~19k-key consumer catalog (`messages/es.json`) shipped in 14 locales.

## The recorded decision (ES-REGISTER in practice)

The guide's Register & address section opens with the whole ruling in one line:
"Use formal `usted` throughout — everywhere. No exceptions," followed by a
one-sentence justification (professional operator tool, addressed to a developer
running production automations) and a pointer to the two upstream artifacts that
mandate it (`docs/i18n/glossary.md` §3's "Never *du/ty/tu*" rule and the run's
format contract). That is the full anatomy ES-REGISTER asks for: the choice, the
audience reasoning, and the provenance — recorded where every translator starts.

It then does what most register rulings skip: a conversion table for the forms
translators actually write (*Guarda → Guarde*, *Ejecuta → Ejecute*, *tu rol → su
rol*, *te necesita → le necesita*, *Fíjate → Fíjese*), which turns the ruling
from a principle into a mechanical lookup — exactly the shape a bulk-review agent
needs.

## Drift, and the migration posture (ES-REGISTER-MIX in practice)

The shipped `es.json` predates the ruling, and the guide says so out loud: a
meaningful share of `home.*` (onboarding) and `monitor.*` is legacy *tú* —
`"Elige tu rol"`, `"Pruébalo ahora"`, `"Escribe tu respuesta…"`. The guide's
handling is the ES-REGISTER-MIX pattern verbatim:

- **Legacy is named as drift, not precedent** — "Do not copy that pattern" — so a
  translator matching the neighborhood cannot claim the file as authority.
- **The migration posture is explicit:** every *new* key uses *usted*, even inside
  a section full of old *tú* strings; existing *tú* strings are fixed
  opportunistically on touch (per the repo's `CLAUDE.md` fix-as-you-touch
  policy), with no obligation to bulk-migrate. That one recorded sentence is what
  stops each translator from re-deciding the posture per string.

The upward lesson this repo taught the technique: without the "new keys never
match drifted neighbors" clause, register migration never converges — the
drifted sections keep recruiting new strings faster than touch-fixes retire old
ones.

## The register-neutral zone, exploited (ES-INFINITIVE-NEUTRAL, ES-PRODROP)

The guide explicitly scopes the audit: "Buttons and infinitive labels (*Guardar*,
*Cancelar*, *Ejecutar*) are register-neutral … the ambiguity only appears in
conjugated imperatives and possessives, so that's where to be careful." In
practice that meant the catalog's hundreds of infinitive buttons were excluded
from the register review entirely — the reviewable surface was conjugation,
possessives (*tu/su*), and object pronouns (*te/le*), findable by grep. The
guide's Pitfalls section also records the pro-drop rule as a wrong→right pair
(*"Guarde usted los cambios…"* → *"Guarde los cambios…"*), typed as a defect
despite being grammatical — ES-PRODROP enforced as an anchor, not a taste note.

## What stays downstairs

The ruling itself (*usted*, not *tú*) is this product's call, driven by this
product's audience — a consumer app in the same fleet could legitimately record
the opposite. The technique owns the machinery (one recorded register, drift
typed as defect, migration posture written once); the guide owns the verdict.
