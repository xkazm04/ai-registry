---
layer: golden-path
type: golden-path
subject: russian
status: forged
use_when: [translating or reviewing a product catalog into Russian, auditing Russian strings for register or agreement defects, designing plural or interpolated messages that must survive Russian grammar, deciding transliteration versus native terms for tech vocabulary]
techniques:
  - register-and-address
  - plural-and-count-agreement
  - gender-and-aspect
  - de-anglicization-constructions
  - typography-and-spacing
  - terminology-and-loanwords
---

# Russian (ru)

Russian is a heavily inflecting language wearing a familiar European alphabet, and
that combination is exactly what makes it dangerous to localize by pattern-matching
from English. Nothing about the script warns you: Cyrillic is left-to-right, caseless
in the typographic sense that matters (no all-caps conventions to fight), needs no
shaping engine, no bidi marks, no CJK line-breaking. The layout engineer's checklist
is short — plan for text roughly 15–25% longer than English, mostly from case
suffixes and compound technical nouns, and ship a font with full Cyrillic coverage
including **Ёё**. Everything hard about Russian happens *inside the string*, in
morphology that English gives no hint even exists.

The four systems that decide whether a Russian catalog reads native are: the
**register** system (how the product addresses the user), the **case and number**
system (what happens to every noun a count or a placeholder touches), the **aspect**
system (which of two verbs every English verb secretly is), and **gender agreement**
(which surfaces exactly where interpolation makes it unresolvable). A translator who
transfers English words correctly but lets any of these four default to the English
structure produces the classic translated-smelling Russian: grammatical, legible,
and unmistakably foreign.

## Register: вы, carried by the verb

Software addresses its user in the formal **вы** register, and Russian expresses that
register in the *verb ending*, not in the pronoun. The formal imperative is `-ите` /
`-ьте` («Выберите папку», «Сохраните изменения»); the pronoun itself appears only
when grammar demands it as an object or possessive, and then in lowercase. Two
decisions that look open are in fact settled for product UI:

- **ты is not a consumer-friendly option** the way informal address is in some
  European languages. A handful of youth-market consumer apps use ты deliberately as
  a brand voice; for anything professional, B2B, developer-facing or financial, ты
  reads as a toy or a chat bot. Default to вы; treat ты as a brand decision that
  must be made explicitly and recorded, never drifted into.
- **Вы capitalized out of politeness is wrong in UI.** The politeness capital exists
  in Russian, but only in personal correspondence addressed to one identified
  person. Software addresses an anonymous plurality; a major OS vendor's published
  Russian style guide prescribes lowercase вы throughout software text, and mixed
  capitalization inside one product is a defect either way.

The full mechanics, including the button-versus-instruction verb-form split, live in
register-and-address.

## Number: three grammatical forms, four CLDR categories

The single highest-defect-rate area in Russian catalogs is count agreement, because
Russian has more plural forms than most i18n runtimes were designed around, and the
mapping is arithmetic, not intuition. The CLDR categories for Russian are **one,
few, many, other**:

- **one** — numbers ending in 1, except those ending in 11: nominative singular
  («1 файл», «21 файл», but 11 → many).
- **few** — ending in 2–4, except 12–14: *genitive singular* («2 файла», «23 файла»).
- **many** — everything else, including 0, 5–20, and all the 11–14 teens:
  *genitive plural* («5 файлов», «11 файлов», «100 файлов»).
- **other** — fractions («1,5 часа»). By a historical accident of how the categories
  were defined, Russian's residue category is `many`, and `other` is effectively the
  fractional slot — the reverse of what the category names suggest. A translator or
  reviewer who assumes `other` is "the plural" ships strings that break at 2.

The genitive mechanics behind those categories — a small number *governs the case of
its noun* rather than merely agreeing with it — are why no string with a numeric
placeholder next to a noun can be translated as a frozen single form, and why a
runtime that offers only two slots (one/other) cannot render grammatical Russian for
counted nouns at all. The workable escape is structural: rephrase so no noun has to
inflect next to the number. See plural-and-count-agreement.

## Aspect and gender: the invisible verb decisions

Every English verb corresponds to a Russian *aspect pair* — perfective (a completed,
bounded act) and imperfective (an ongoing or habitual process) — and every verb slot
in a UI forces the choice. The rule of thumb that covers most of a catalog: buttons
and CTAs that perform an act are perfective («Сохранить», «Удалить»); labels for
states in progress are imperfective («Загрузка…», «Выполняется»); a completed-result
message is perfective past («Изменения сохранены»). Choosing the wrong aspect is
never a typo to a native reader — it changes what the string claims is happening.

Russian past-tense verbs and predicate adjectives agree in **gender**, which is
harmless until a string refers to a person or entity the translator cannot see: the
current user, or a `{name}` placeholder that will hold anything from a feminine noun
to a Latin-script product name. «{name} завершил работу» asserts the referent is
masculine. The craft is to route around agreement — вы-forms (always plural,
gender-free), passives and nominal sentences, present tense — rather than to guess.
Both systems are worked in gender-and-aspect.

## The interpolation trap: case government

The deepest Russian-specific i18n trap combines everything above: a placeholder
interpolated into a slot where Russian grammar demands an oblique case. English
«Delete {name}?» is shape-stable; Russian wants the object of «удалить» in the
accusative, and the runtime will substitute a nominative-form value. When the
placeholder holds a Latin-script or untranslated name the nominative passes
unremarked, but a Russian common noun lands visibly broken («Удалить проект?» is
fine; a substituted declinable noun is not). The defensive constructions — head-noun
insulation («Удалить проект «{name}»?», where the *head noun* carries the case and
the quoted name stays nominative), colon rephrasing, nominal sentences — are the
core of de-anglicization-constructions, and they must be applied at translation
time, because no post-hoc review of the template text alone can see the failure.

## What makes Russian smell translated

Beyond the four systems, translated-smelling Russian has a recognizable fingerprint,
and each item is auditable:

- **Possessive overuse.** English writes *your* before everything; Russian drops the
  possessive where the owner is obvious. «Проверьте ваши настройки в вашем профиле»
  is English wearing Cyrillic; «Проверьте настройки в профиле» is Russian.
- **Preposition calques.** English *for/of/with* copied 1:1 instead of the case or
  preposition the Russian verb governs — «проверка для {name}» where genitive
  «проверка {name}» needs no preposition at all.
- **Title Case mirrored from English.** Russian uses sentence case everywhere:
  first word plus proper nouns. «Все Настройки» is instantly foreign.
- **ASCII typography.** Straight quotes and three-dot ellipses where Russian wants
  «guillemets», the spaced em dash, and the single … character. Typography is the
  cheapest possible tell because it is visible before a single word is read
  (typography-and-spacing).
- **Register drift.** One ты-imperative or one gamer-slang loanword («фича»,
  «скилл») inside a вы-formal catalog breaks the voice more loudly than a grammar
  error, because it reads as a different author.

## Terminology: two loanword streams, one policy line

Russian tech vocabulary absorbs English continuously, and the line between an
established transliteration and unprofessional slang moves by term, not by rule of
thumb. «Триггер», «сервер», «плагин» are settled Russian words; «фича», «креды»,
«воркфлоу» are chat-register slang that no professional surface should ship, even
though a working Russian engineer says them daily. Independently, a do-not-translate
class (protocol names, format names, brand names) stays in Latin script, undeclined,
with a hyphenated Russian head noun carrying the grammar when a compound is needed
(«API-ключ»). The decision procedure, and the corpus tests that replace taste, are
in terminology-and-loanwords.

## Working order for a catalog pass

1. Fix the register decision and record it; audit for ты-forms and politeness
   capitals mechanically.
2. Sweep typography — quotes, dashes, ellipses, ё-disambiguation — before prose
   review, so reviewers read past clean glyphs to real language.
3. Audit every string containing a numeric placeholder against the four CLDR
   categories and the runtime's actual slot count; rephrase frozen forms.
4. Audit every string interpolating a name or entity for case-government exposure
   and gender-agreement exposure; apply insulating constructions.
5. Only then review for voice and terminology, with the termbase and the loanword
   policy at hand — because a reviewer without an anchor "improves" correct strings.

A Russian catalog that survives steps 3 and 4 is rarer than one with a perfect
termbase, and it is the half no general-purpose reviewer catches from the English
side, because the defects only exist after Russian grammar meets the runtime's
mechanics.
