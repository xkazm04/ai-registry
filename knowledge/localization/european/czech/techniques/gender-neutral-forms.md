---
layer: technique
type: technique
subject: czech
technique: gender-neutral-forms
status: forged
laws: []
shared_with: []
use_when: [writing Czech strings about a person of unknown gender, putting a name or title placeholder next to an agreeing word, choosing between slash forms and impersonal recasts]
---

# Gender-neutral forms

English can write an entire application about people without once committing
to their gender. Czech cannot write a past-tense sentence about one: verbs in
the past tense, adjectives, participles, and many agent nouns all agree in
gender. Every string about "the user", "the candidate", "the reviewer" is
therefore an engineering decision the source language never surfaces — and the
naive resolution, a silent masculine default, is both a growing social
liability and, in a product that displays real people in rows, simply wrong
half the time on screen.

## CS-GENDER · Never force masculine on an unknown person

> **Trigger** — the English says *they/their/the user/the candidate* and the
> code cannot know the person's gender.
> **Rule** — a participle, adjective, or agent noun agreeing with that person
> takes the slash form (*postoupil/a*, *zamítnut/a*, *náborář/ka*) or the
> sentence goes impersonal neuter (*Zamítnuto*). A bare masculine is a
> defect, not a default. Never the bracket form (*navrhl(a)*) — brackets read
> as "the feminine is optional"; one catalog, one style, and the slash is the
> established one.
> **Source** — agreement per Microsoft Czech Style Guide §4.1.6/§4.1.9;
> slash-form and recast strategies per the Czech gender-neutral-language
> guidance published for EU institutions and the Czech Language Institute's
> usage notes on generic masculine.

The preference order, strongest first:

1. **Impersonal or neuter recast** — *Zamítnuto*, *Vráceno k posouzení*,
   *Nedošlo k odeslání*. Reads cleanest, is also count-invariant, and is the
   idiomatic Czech status form anyway. Reach for it first.
2. **Recast around a gender-invariant frame** — a noun that doesn't inflect
   for the person (*Tato osoba postoupila* fixes gender via *osoba*), or a
   present-tense verb (Czech present tense does not mark gender: *postupuje*
   works for everyone; only the past tense betrays you).
3. **Slash form** — *postoupil/a*, *přihlášen/a*, *náborář/ka*. Fully
   explicit, slightly heavy; right for per-person rows and form labels
   (*níže podepsaný/á*), wrong for flowing prose where it lands three times
   per sentence.

What NOT to use in a product catalog: the asterisk/underscore forms
(*student*ka*) — activist typography with no mainstream UI acceptance; and
prose doublets (*studentky a studenti*) — fine in a speech, too long for UI.
The generic masculine remains defensible in genuinely generic *plural* prose
about mixed groups (*uživatelé*, per the standard-language position that it
includes everyone) — the rule bites on a **specific person of unknown
gender**, where the masculine singular is a claim about an individual.

## Placeholders drag gender into the sentence

The second half of the technique, and the half automated translation always
misses: an interpolated value occupying a subject or object slot forces every
agreeing word to commit to *its* gender — and the code usually cannot know it.

- **Person names.** *{name} je připraven* breaks for every feminine name.
  Recast so nothing agrees with the placeholder (*{name}: připraveno*, or a
  present-tense verb), or give the placeholder a **gender-fixing head noun**
  and agree with that: *Kandidát/ka {name} postoupil/a* is honest;
  *Uživatelský účet {name} byl vytvořen* fixes agreement via *účet*.
- **Non-person values** (titles, entity names) have the same problem worse:
  *pozice {jobTitle}* pins the phrase to feminine *pozice* regardless of the
  interpolated words; a bare *{jobTitle}* in the subject slot leaves the verb
  agreeing with an unknowable noun. The head-noun move is the standard fix
  and costs a word.
- **The grammatical-case trap rides along:** a placeholder after a
  preposition receives whatever case the preposition governs, but the value
  arrives in nominative — *v {city}* renders *"v Praha"*. Head nouns fix this
  too (*ve městě {city}*), which is why the rule is worth stating once as
  "a placeholder in a governed or agreeing slot gets a head noun" rather
  than as separate gender and case rules.

## Decision rule for a whole catalog

Pick the strategy **per surface class**, once, and record it: status chips
and event rows → impersonal neuter; per-person table cells where the person
is the subject → slash form in one style; flowing prose → recast to avoid
person-agreement entirely. A catalog where sibling strings solve the same
problem three ways audits clean rule-by-rule and still reads incoherent;
mixed slash styles (*postoupil/a* beside *navrhl(a)*) are a terminology-class
defect even though each is individually defensible.

## CS-GENDER-2P · second-person past-tense agreement under tykání

> **Trigger** — an informal-address (tykání) string uses a second-person
> past-tense or conditional form (*abys*, *kdybys* + l-participle) and the
> code cannot know the addressee's gender.
> **Rule** — the l-participle agrees with the addressee (*formoval* vs
> *formovala*), so a bare masculine is wrong for roughly half of users.
> Recast to a present-tense or impersonal frame that carries no gender
> agreement — the same preference order as the third-person case above.
> **Provenance** — harvested 2026-08 from a cross-locale review wave; the
> third-person rule's trigger explicitly did not reach this form.

## When NOT to apply this technique

When the code *does* know the gender — a profile field, a grammatical-gender
parameter the message format can select on — use it: a select branch with
real masculine/feminine forms beats every neutral strategy. And leave
gendered forms alone where the referent is genuinely fixed (*administrátorka*
naming a specific known woman is correct, not a violation). The technique
governs the unknown, not the known.
