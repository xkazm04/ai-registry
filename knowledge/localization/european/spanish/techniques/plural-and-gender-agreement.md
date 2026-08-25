---
layer: technique
type: technique
subject: spanish
technique: plural-and-gender-agreement
status: forged
laws: [format-skeleton-is-inviolable, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [translating strings with count placeholders, handling gender agreement around interpolated values, writing copy for an unknown or mixed-gender referent]
---

# Plural and gender agreement

Spanish agreement is pervasive — number and gender ripple from a noun into its
article, adjectives, and participles — and interpolation punches holes in exactly
the places agreement needs to see. The rules here decide what the translator owns,
what the message format owns, and what goes back to the source as a defect.

## ES-PLURAL-CLDR · two cardinal categories, and zero is plural

Spanish cardinals take CLDR **one** (n = 1, including 1.0) and **other** for
everything else — and *everything else includes zero*: *0 archivos*, *0 errores*,
never the singular. English speakers get this right by luck (English zero is also
plural); the actual failure mode is a source string with no plural form at all
(*"{count} file(s)"* or a bare *"{count} archivos"*), which no Spanish translation
can rescue — file it as a source defect rather than shipping *1 archivos*. Both
plural branches must be written even when the English author collapsed them.

**Source:** CLDR language plural rules for *es*.

## ES-PLURAL-MANY · large round numbers take *de* — the many category

Since CLDR 42, Spanish has a third cardinal category, **many**, covering compact
large numbers (10⁶ and up): *millón/millones* and beyond are grammatically nouns,
so Spanish says *1 millón **de** usuarios*, *2,5 millones **de** descargas* — the
counted noun attaches with *de*. Two consequences. A plural pipeline or hand-rolled
two-branch selector renders these wrong (*"1 millón usuarios"*) the day a metric
crosses a million, and the bug is invisible until it does. And copy that
abbreviates counts (*"3 M de usuarios"*) still needs the *de*. When the message
system predates the category, the workable recast is putting *de* into the plural
branch text or recasting so the count is not adjacent to the noun.

**Source:** CLDR 42 release notes and the *es* plural rules chart.

## ES-ORDINAL · one category, gendered abbreviations

Spanish ordinals have a single CLDR category — no *1st/2nd/3rd* machinery — but
their abbreviations are gendered and dotted: *1.º* / *1.ª* (masculine/feminine,
period before the superscript, per the language academy's orthography). Never
import English ordinal suffixes, and never emit *1º* bare when the referent is
feminine. Above tenth, prose usually prefers the cardinal (*el puesto 15*), which
sidesteps the morphology entirely.

## ES-GENDER-PLACEHOLDER · agreement with an interpolated noun is a design problem

*"{item} eliminado"* is untranslatable as written: if *{item}* can be *el archivo*
or *la plantilla*, no single participle agrees with both. Resolution ladder, in
order:

1. **Recast so agreement never fires.** Put the placeholder where nothing agrees
   with it: *"Se eliminó: {item}"*, *"Elemento eliminado: {item}"* — a colon and a
   fixed head noun absorb the gender. This resolves most cases at zero cost.
2. **Agree with a fixed head noun** the string itself supplies: *"El elemento
   {item} se eliminó correctamente"* — agreement targets *elemento*, not the value.
3. **Select on gender in the message format** when the system passes a gender
   argument — correct but expensive, since every caller must now supply gender.
4. **File a source defect** when the string's shape forbids all of the above.

Guessing masculine and shipping is not on the ladder; it is the typed error this
rule exists to catch. The placeholder token itself never changes — words move
around it, per the skeleton law.

## ES-GENDER-UNKNOWN · unknown referents: recast first, generic masculine second

For an unknown or mixed-gender human referent, the language academy's standing
position is that the grammatical masculine is generic (*los usuarios* covers
everyone), and no standards authority sanctions *-x*, *-@*, or *-e* forms — they
are unpronounceable to screen readers and marked in most registers, so they do not
belong in product UI unless the product's own recorded voice explicitly adopts
them. But the craft answer is usually to need no gendered form at all:

- **Second person direct:** *"¿Olvidó su contraseña?"* instead of *"El usuario
  olvidó…"* — the user needs no gender when addressed.
- **Epicene and collective nouns:** *la persona*, *el equipo*, *la cuenta*,
  *quienes* — grammatically gendered, referentially neutral.
- **Participle-free recasts:** *"Le damos la bienvenida"* instead of
  *"Bienvenido/a"* — the classic first-run greeting fix.
- **Doubling** (*"usuarios y usuarias"*) only in formal address contexts like
  forms and salutations, never systematically — recurrent doubling measurably
  degrades readability, which is the style authorities' own stated reason to
  ration it.

Slashed forms (*"Bienvenido/a"*) are a last resort for width-constrained legacy
surfaces, and always read as a compromise.

**Source:** RAE/Fundéu guidance on the generic masculine and on doubling.

## When not to apply

Do not retrofit gender selection into strings whose referent is always one gender
in the domain, and do not flag grammatical gender doing ordinary work (*la
configuración* is not about people). Agreement auditing is string-local; termbase
gender assignments for product nouns belong to terminology-and-loanwords.
