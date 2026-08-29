---
layer: technique
type: technique
subject: russian
technique: gender-and-aspect
status: forged
laws: []
shared_with: []
use_when: [choosing perfective or imperfective for a UI verb, writing past-tense or predicate strings about a user or an interpolated entity, auditing Russian strings for gender-agreement exposure]
---

# Gender and aspect

Two verb systems English does not have, both forced on every Russian string with a
verb in it. Aspect is a *choice the translator must make*; gender agreement is an
*exposure the translator must route around*. Neither is visible from the English
source, so neither can be caught by a reviewer reading source and target side by
side without knowing to look.

## RU-ASPECT · perfective acts, imperfective states

**Trigger:** any verb slot — control label, status label, progress message, result
message.

**Rule:** choose aspect by what the string claims about time:

- **Controls and CTAs** — the act the user is about to perform, viewed as a
  completed whole → perfective infinitive: «Сохранить», «Удалить», «Отправить»,
  «Создать».
- **In-progress states** — an unfolding process → imperfective, usually as a verbal
  noun or present form: «Загрузка…», «Сохранение…», «Выполняется», «Идёт
  синхронизация».
- **Result messages** — a completed act → perfective past or perfective passive
  participle: «Изменения сохранены», «Файл удалён», «Отправлено».
- **Habitual or capability statements** — imperfective: «Приложение сохраняет
  резервные копии автоматически».

The wrong aspect is not a nuance to a native reader. An imperfective CTA
(«Сохранять» on a save button) claims the button starts an open-ended activity; a
perfective progress label claims the process already finished. Machine translation
output drifts toward the imperfective because English progressive forms bias it —
audit CTAs specifically for stray imperfectives.

**Source:** core Russian grammar; the CTA/status/result mapping is the settled
convention of the major vendors' published Russian UI style.

**Exception:** a few controls genuinely start an ongoing mode rather than perform
an act («Наблюдать», «Следить за изменениями») — there the imperfective is
correct because the claim really is open-ended. Decide by the semantics, not by
the widget type.

## RU-GENDER · past tense agrees in gender; unknown referents must not force a guess

**Trigger:** a past-tense verb or short-form predicate whose subject is the user, a
role of unknown gender, or a placeholder.

**Rule:** Russian past-tense verbs and predicates agree with their subject's
gender («он завершил», «она завершила», «оно завершилось»). Three referent classes
make that agreement unresolvable at translation time, and each has a settled
escape:

1. **The addressed user.** вы always takes the *plural* past («вы вошли», «вы
   изменили пароль») — plural forms carry no gender, so вы-address is gender-safe
   by construction. This is a hidden reason the вы register is the right software
   default: a ты catalog must gender every past-tense verb about the user
   («ты вошёл/вошла») and has no clean escape.
2. **An unnamed third party of unknown gender** («the owner approved this»).
   Restructure to dodge the gendered verb: nominal sentence («Одобрение
   получено»), passive with a non-personal subject («Запрос одобрен владельцем» —
   the participle agrees with «запрос», which the translator controls), or present
   tense where the timeline allows.
3. **An interpolated name** («{name} завершил…»). The placeholder will hold
   feminine names, masculine names, team names, and Latin-script product names;
   any gendered verb is a standing error for some of them. Insulate with a
   controlled head noun that carries the agreement — «Пользователь {name} завершил
   сеанс» agrees with «пользователь», grammatically masculine regardless of the
   name — or restructure to a nominal form: «{name}: сеанс завершён».

**Source:** core Russian grammar; the head-noun insulation pattern is standard
localization craft for inflecting languages.

**Exception:** when the referent's gender is *knowable and fixed* — a named
persona, a grammatically gendered noun the product controls — agree normally;
routing around agreement everywhere produces stilted bureaucratic prose. The rule
targets unresolvable referents only.

## RU-NUMERAL-GENDER · the numeral itself agrees, at two positions only

**Trigger:** any string where a number is **spelled out** in words next to a noun —
a legal or financial line, a formal confirmation, a voice or screen-reader surface.
Digits are unaffected; this rule is about the word.

**Rule:** a spelled Russian numeral inflects for the gender of the noun it counts,
and it does so at **exactly two positions**: a final units digit of one, and a final
units digit of two. Teens are excluded. Everywhere else the four gendered spellings
are byte-identical — over the integers 0–10 000, **about 82% spell the same in every
gender**, and once the units digit is zero gender never surfaces at all.

The reason it stops is worth knowing, because it looks like a bug otherwise: a
multiplier agrees with **its own** counting noun, not with yours. Thousand is
feminine, so the thousands word takes the feminine form regardless of what is being
counted, and the gender you care about reappears only in the trailing units.

**Agreement is with the immediately governed noun, not the sentence subject** — the
same trap RU-GENDER describes for the past tense, one layer down. A message that
interpolates both a count and a noun cannot spell the numeral safely unless it also
knows the noun's gender; if it does not, keep the digits.
**Source:** the published spell-out rulesets, which cross gender with case; the
declared grammatical-feature inventory names three genders and no animacy for
Russian, so the accusative forms are the inanimate paradigm and **cannot count
people**.
**Exception:** digits. A catalog that never spells numbers out never meets this rule
— which is the usual reason to keep digits in UI copy.

## RU-PARTICIPLE · agreement hides in participles and short forms too

**Trigger:** result messages and status badges built on passive participles
(«сохранён / сохранена / сохранено / сохранены»).

**Rule:** the perfective passive participle — the natural Russian for «Saved»,
«Deleted», «Sent» — agrees in gender and number with its subject, so a badge
string reused across differently-gendered nouns is the same trap as RU-GENDER in
another costume. «Удалён» is correct for «файл», wrong for «папка» (needs
«удалена») and «сообщение» (needs «удалено»). A shared "deleted" badge rendered
next to arbitrary object types cannot be one string in Russian. Escapes, in
preference order: the neuter-form nominal that reads as an impersonal event
(«Удаление завершено»), a noun badge («Черновик», «Готово»), or per-object-type
strings when the source catalog allows the split. When it does not, that is a
source defect — a string serving multiple agreement contexts caps Russian (and
every other inflecting locale) and the fix belongs to the source.

**Source:** core Russian grammar.

**Exception:** frozen adverbial forms in `-о` used as standalone acknowledgements
(«Готово», «Отправлено», «Сделано») are conventionalized impersonal neuters — they
do not agree with anything and are safe as generic badges. Prefer them for exactly
that reason.

## Audit shape

Gender and aspect findings are enumerable: (a) list all past-tense and participle
strings, check each subject's gender is either controlled or routed around; (b)
list all imperative/infinitive controls, check for imperfectives without an
ongoing-mode justification; (c) list all strings interpolating a name into subject
position, require head-noun insulation or nominal form. Each finding cites the
rule above by ID; none of them is arguable, which is what distinguishes this
technique from voice review.
