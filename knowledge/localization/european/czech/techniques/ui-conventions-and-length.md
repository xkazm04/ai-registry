---
layer: technique
type: technique
subject: czech
technique: ui-conventions-and-length
status: forged
laws: []
shared_with: []
use_when: [wording buttons, menu items and progress states in Czech, fitting Czech strings into tight layouts, deciding between infinitive and imperative on a control]
---

# UI conventions and length

Czech UI text has a settled grammar of surfaces: which verb form goes on a
control, which on an instruction, what a busy state says, and how a state
label is shaped. These are conventions, not grammar — a wrong choice is
perfectly grammatical Czech that every native user registers as off. Because
they are conventions, they are teachable as hard rules with almost no
judgment left in them.

## CS-CTRL · Controls take the infinitive

> **Trigger** — a button, menu item, tab, or standalone action label.
> **Rule** — infinitive: *Uložit*, *Zrušit*, *Otevřít*, *Exportovat*. The
> imperative belongs in **instructions** (*Vyberte pozici…*, *Zkuste upravit
> filtry*), never on the control itself.
> **Source** — Microsoft Czech Style Guide §2.1.3 plus long-standing Czech
> OS convention.

The rule cuts both ways and both failures ship: an imperative on a button
(*Uložte*) reads like a lecture; an infinitive opening an instructional
sentence (*Vybrat první položku…*) reads like a menu item that escaped. The
surface decides the form:

| Surface | Form | Example |
|---|---|---|
| Buttons, menu items, standalone commands | infinitive | *Uložit*, *Kopírovat*, *Smazat* |
| Body copy, hints, instructions, empty-state guidance | formal imperative (2nd pl.) | *Vyberte první běh k porovnání* |

Verb **aspect** rides along: actions and CTAs are perfective (*Spustit*,
*Zavřít* — the act completed once), ongoing states imperfective. Choosing the
imperfective on a button (*Spouštět*) implies a habitual action and is a
subtle but real defect. (Mint as `CS-ASPECT` where an anchor set needs it.)

## CS-PROG · Progressive action: reflexive *se* or verbal noun, by shape

> **Trigger** — an English *-ing…* progress or busy string.
> **Rule** — when the busy subject is **named**, use the reflexive: *Načítají
> se kandidáti…*, *Analyzuje se dokument…*. When the subject is
> **unexpressed**, the verbal noun is the form: *Ukládání…*, *Generování…*.
> Never first person singular (*Ukládám…*, *Generuji…*).
> **Source** — Microsoft Czech Style Guide §5.7 (progressive action).
> **Exception** — a status *readout* that is not a control's busy state (an
> assistive-technology label, a log row) may use *Probíhá <noun>*.

The three-way split above was settled by collision: a style guide that
endorsed *Probíhá…* for ongoing states contradicted a construction rule that
banned it, and an auditor could cite neither with confidence. The resolution
is positional — *Probíhá* is fine as a factual readout, weak as the label on
a spinner whose subject the user can see. Record splits like this as a table
in the rule; two rules that overlap without a boundary make every finding
arguable.

## State labels: the short neuter form

A bare status chip — *Odesláno*, *Doručeno*, *Zamítnuto*, *Vymazáno* — takes
the short neuter passive participle. This is the one place the short passive
participle (banned in sentences by the construction rules) is the idiom, and
"fixing" chips to long adjectives or reflexives produces agreement with
nothing. The chip convention also solves two other problems at once: it is
count-invariant (works next to any number) and gender-neutral (works for any
person), which is why the impersonal neuter is the first form to reach for in
any per-row status column.

## Length discipline

Czech has no articles and drops subject pronouns, so plain sentences run at or
under English length. It runs **+10–20% longer** where case morphology stacks:
noun phrases with agreeing adjectives, compound technical terms, and the
genitive-plural constructions that live counts force (*{count} zkontrolovaných
dokumentů*). Budget rules:

- **Buttons, badges, chips, table headers must not wrap.** Prefer the shortest
  correct infinitive; prefer one word to a phrase (*Obnovit*, not *Obnovit
  data*) when the object is obvious from context.
- **There is no Czech UI abbreviation convention.** English truncations
  ("Config", "Msg") have no accepted Czech counterpart; an invented
  abbreviation is a worse defect than a wrapped label. When a faithful
  translation is too long, drop a qualifier or choose a shorter idiom —
  shorten the label, never the meaning, and never by truncation.
- **Tab labels are where borrowing pays.** A short established loanword that
  fits a tab beats a correct three-syllable native word that doesn't; spell
  the native word out when the same concept appears in a full sentence.
- Interface layouts sized to English glyph runs fail first on Czech
  genitive-plural counters and on diacritic ascenders (*ď*, *ť*) in tight
  line-height — test with 5+ counts, not with count=1.

## Sentence case, everywhere

Capitalize the first word of a string and true proper nouns; nothing else.
Czech has no Title Case, does not capitalize common nouns, and does not
capitalize UI-element names mid-sentence. Mechanically preserved English
capitalization (*"Zkopírovat Hlášení Pro Podporu"*) is a per-word defect an
automated check can catch by flagging mid-string capitalized non-proper
words. (Mint as `CS-CASE` where an anchor set needs it.)

## When NOT to apply this technique

Marketing headlines and landing copy are transcreation territory — the
control-form and length rules govern the working UI, and forcing chip
conventions or infinitive rules onto a headline flattens copy that was
deliberately shaped. The register and construction techniques still apply
there; this one mostly does not.
