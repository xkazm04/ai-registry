---
layer: technique
type: technique
subject: spanish
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing Spanish strings that read as translated, auditing for false friends and calques, rewriting machine-translation output]
---

# De-anglicization constructions

Spanish absorbs English patterns fluently — the calqued sentence parses, sounds
vaguely official, and ships. These rules name the constructions that expose a
translation as a translation, each one greppable enough that a reviewer can cite
it instead of arguing taste.

## ES-FALSE-FRIEND · the cognate that parses is the one that lies

The high-frequency set for product UI, each wrong → right:

| English source | False friend (wrong) | Spanish (right) | Why |
|---|---|---|---|
| save (data) | *salvar* | **guardar** | *salvar* = rescue a life |
| success | *suceso* | **éxito** | *suceso* = an event/incident |
| current(ly) | *actual(mente)* misread | *actual* = current, NOT "actual" | reverse trap: EN *actual* → **real**, EN *actually* → **en realidad** |
| apply (settings) | *aplicar a* (jobs sense) | **aplicar** is fine for settings; EN *apply for* → **solicitar** | *aplicar a un puesto* is the calque |
| support (a feature) | *soportar* | **admitir**, **ser compatible con** | *soportar* = endure, tolerate |
| library (code) | *librería* | **biblioteca** | *librería* = bookshop |
| remove | *remover* | **quitar**, **eliminar** | *remover* = stir/agitate (in most regions) |
| assume (suppose) | *asumir* | **suponer** | *asumir* = take on (a role, a cost) |
| eventually | *eventualmente* | **finalmente**, **con el tiempo** | *eventualmente* = occasionally |
| question (issue) | *cuestión* misuse | **pregunta** (a question asked) | *cuestión* = matter/issue |
| introduce (a person/feature) | *introducir* | **presentar** | *introducir* = insert |

*Soportar* and *aplicar* deserve their asymmetry noted: *aplicar una
configuración* is legitimate Spanish; *aplicar a un empleo* is not. *Soportar* in
the compatibility sense has crept into developer jargon, but the published Spanish
style authorities still rule it a calque — write *admitir*/*compatible con* in
product copy. A reviewer cites this rule with the specific pair, because "false
friend" without the pair is not actionable.

## ES-GERUND · the -ing form is not the gerund's job

English uses *-ing* for headings, labels, and titles; the Spanish gerund is an
adverbial describing an action in progress, and importing the English distribution
produces the single most reliable translated-smell in the language:

- **Headings and titles:** *"Managing users"* → **"Administración de usuarios"**
  (noun), never *"Administrando usuarios"*.
- **Progress states are the legitimate use:** *"Guardando…"*, *"Cargando…"* — an
  operation genuinely in progress, the one place the gerund belongs in UI.
- **Gerund of posteriority** — *"Falló la ejecución, generando un error"* — is
  condemned by the academy when the second action follows the first; write *"…, lo
  que generó un error"*.

Decision rule: if the English *-ing* names a thing or a section, translate with a
noun; if it reports a process running right now, keep the gerund.

## ES-SE-PASSIVE · the reflexive se beats the periphrastic passive

English passive voice (*"The file was deleted"*) has a literal Spanish rendering
(*"El archivo fue eliminado"*) that is grammatical and heavy; idiomatic Spanish
prefers the *se* construction: **"Se eliminó el archivo"**. Prefer *se* for system
events and results (*"Se guardaron los cambios"*, *"No se encontraron
resultados"*), keep *ser* + participle only where the agent matters or formality
genuinely calls for it. Note the number agreement *se* drags in: *se guardó el
cambio* / *se guardaron los cambios* — the verb agrees with the patient, a detail
the English source never shows.

## ES-NOUN-ADJ · adjective position calques

The default Spanish order for descriptive modifiers is noun-then-adjective:
*conexión externa*, not *externa conexión*. Rushed translation of English
adjective-noun compounds keeps the English order, and the result parses as
poetry, not UI. The same rule covers stacked English noun-compounds (*"connection
error message"*), which Spanish unrolls with prepositions right-to-left:
*"mensaje de error de conexión"* — a translator who keeps the English stacking
order has translated the words and not the grammar.

## ES-POSSESSIVE-ARTICLE · English possessives become Spanish articles

English marks possession obsessively (*"Save your changes to your folder"*);
Spanish uses the definite article when the possessor is obvious: **"Guarde los
cambios en la carpeta"**. Keep the possessive only when it disambiguates whose
(*"su cuenta"* vs someone else's account, in a sharing context). Mechanical tell:
two or more *su/tu* in one short sentence is nearly always a calque. This rule
compounds with pro-drop (register-and-address's pronoun rule) — together they are
why good Spanish UI copy runs shorter than the calqued version even though Spanish
prose runs longer than English.

## ES-YOU-IMPERSONAL · English "you" is often nobody

English uses *you* for generic statements (*"You can configure up to five
agents"*). Spanish has impersonal machinery — *se puede*, *es posible*, plain
third person — and using it often reads better than direct address in
documentation-flavored copy: *"Se pueden configurar hasta cinco agentes"*. Keep
direct address where the string genuinely instructs *this* user, drop to
impersonal where the English *you* is generic. This is a judgment rule; cite it
only when the direct-address rendering is actively awkward, not to churn correct
strings.

## When not to apply

These rules govern new writing and typed review findings — they are not a license
for a drive-by rewrite pass over strings nobody flagged. Assimilated jargon in
developer-facing surfaces (a log line reading *"soportado"*) is a
terminology-and-loanwords ruling, not an automatic defect here; check the recorded
term decisions before flagging.
