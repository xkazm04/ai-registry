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

Spanish has a third cardinal category, **many**, and the grammar behind it is that
*millón/millones* is a noun: Spanish says *1 millón **de** usuarios*, so the counted
noun attaches with *de*. A hand-rolled two-branch selector renders these wrong
(*"1 millón usuarios"*) the day a metric crosses a million, and the bug is invisible
until it does. Copy that abbreviates counts (*"3 M de usuarios"*) still needs the
*de*. Where the message system predates the category, the workable recast puts *de*
into the branch text, or moves the count away from the noun.

**But "compact numbers 10⁶ and up" is half the rule, and the half it omits is the
one that bites.** The published condition is a disjunction: an **exact** round
million written plain with no fraction digits, **or** any compactly-formatted
number at the million scale and above. Measured against the published rule:

| written as | category |
|---|---|
| `2.000.000` (plain, exact million) | **many** |
| `2.500.000` (plain, not an exact million) | **other** |
| `2,5 M` — *the same quantity, compact* | **many** |
| `1.000.000,0` (one fraction digit) | **other** |

So the category follows the **rendering, not the magnitude**. Two things follow.
`many` fires for plain numbers with no compact formatting anywhere in the stack, so
it cannot be dismissed as a compact-only concern. And a `many` branch **cannot be
tested by feeding the counter a big number** — only by rendering through the
formatter the surface actually uses.

The grammar tracks this exactly, which is why the rule is shaped so oddly: the
spelled numeral ends in *millón/millones* — and so takes *de* — only for exact
millions and for compact forms. *2.500.000* spells as *dos millones quinientos mil*
and takes **no** *de*. The technique's own *"2,5 millones de descargas"* is right
for the compact rendering and **wrong** applied to *2.500.000 descargas*.

**Source:** the *es* plural rules and the published spell-out rulesets.

## ES-PLURAL-RANGE · A range selects from its own table, and 0–1 is plural

**Trigger:** any string rendering a span — *0–1 archivos*, *2–5 horas*.
**Rule:** a range does not take the category of its end value by rule. It is a
lookup on the **(start, end)** category pair in a separate published table, whose
*default* — used only when a pair is absent — is the end category. Spanish's table
is small, and **one of its three rows overrides that default**: `(other, one) →
other`. A range that *ends* at exactly 1 is therefore **plural** — *0–1 archivos*,
not *0–1 archivo* — which is precisely the common "0–1 results" shape a UI
pluralizing on the end number gets wrong.
**What a table's existence does not tell you.** Other locales publish tables where
no row deviates at all, and there an end-value shortcut is safe; roughly half the
published groups carry at least one override. Presence and size say nothing —
only reading the rows does.

## ES-ORDINAL · one category, gendered abbreviations

Spanish ordinals have a single CLDR category — no *1st/2nd/3rd* machinery — but
their abbreviations are gendered and dotted: *1.º* / *1.ª* (masculine/feminine,
period before the superscript, per the language academy's orthography). Never
import English ordinal suffixes, and never emit *1º* bare when the referent is
feminine. Above tenth, prose usually prefers the cardinal (*el puesto 15*), which
sidesteps the morphology entirely.

Two published forms this rule has been missing. **Plural abbreviations** exist —
*.ᵒˢ* / *.ᵃˢ* — for a plural referent. And the masculine has an **apocopated
adjectival form** before a masculine noun, at 1 and 3: *el 1.er intento*, not
*el 1.º intento*. Both are carried in the published spell-out rulesets, so neither
is a house invention.

**Because ordinals have one category, none of this is selectable by a plural
block.** Gender and apocopation are decided by the referent, which the format
system cannot see — the same boundary the gender rules below describe.

## ES-NUMERAL-GENDER · the spelled numeral agrees too, and then stops

**Trigger:** any string where a number is **spelled out** in words beside the noun
it counts — formal or legal copy, a confirmation line, a voice surface. Digits are
unaffected.

**Rule:** a spelled Spanish numeral agrees in gender with the noun it counts, at a
small, closed set of positions: **one** (*un* / *una*), **twenty-one** and the rest
of the units-one series (*veintiún* / *veintiuna*), and the **hundreds from two
hundred up** (*doscientos* / *doscientas*). Everywhere else the masculine and
feminine spellings are identical. The published spell-out rulesets carry the two
paradigms separately, and those are the only places they diverge.

**And the agreement stops above a million.** Past that point the rulesets fall back
to the masculine series, because the counting word itself (*millón*, *millones*) is
a masculine noun that takes the count — which is the same fact ES-PLURAL-MANY
describes from the other side. **Gender and the `many` category are one phenomenon
seen twice**: the numeral stops agreeing with your noun exactly where it starts
governing a noun of its own.

**Exception:** digits, which is the usual reason to keep them. A catalog that never
spells numbers out never meets this rule.

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
