---
layer: technique
type: technique
subject: russian
technique: de-anglicization-constructions
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [translating strings with interpolated entities into case-demanding positions, auditing Russian text for English structural calques, reviewing possessives and prepositions in a translated catalog]
---

# De-anglicization constructions

The defects this technique owns are structural: the string's words are Russian but
its skeleton is English. They survive spellcheck, terminology audit and a
side-by-side review by a bilingual reader who has been reading English all day —
which is exactly who reviews translations. Each rule below names a construction, a
detection cue, and the replacement pattern.

## RU-CASEGOV · placeholders in case-demanding slots get an insulating head noun

**Trigger:** a placeholder interpolated where Russian grammar assigns an oblique
case — object of a verb («Delete {name}?»), object of a preposition («switch to
{name}»), genitive attribute («{name}'s settings»).

**Rule:** the runtime substitutes the placeholder's value in whatever form it is
stored — effectively nominative — so the translation must arrange for the slot the
placeholder occupies to *be* nominative. The standard insulation: introduce a
controlled head noun that takes the required case, and hang the placeholder off it
as a quoted apposition:

- «Удалить проект «{name}»?» — «проект» carries the accusative; the quoted name
  stays uninflected.
- «Переключиться на профиль «{name}»» — «профиль» absorbs the preposition's case.
- «Настройки проекта «{name}»» — «проекта» carries the genitive.

Where no natural head noun exists, restructure to a nominal or colon form that
needs no case at all: «{name}: удалить?», «Удаление: {name}».

This is the interpolation-era version of a rule as old as Russian editing: an
indeclinable foreign name takes a declinable generic noun in front of it. The
i18n twist is that the failure is *conditional on the value* — Latin-script and
foreign names read acceptably uninflected, so the string looks fine in every
screenshot until a Russian common noun or a user-authored Russian title lands in
the slot («Удалить Моя первая персона?» — visibly broken). Because moving the
placeholder and adding surrounding words is required translation work, not a
skeleton violation — the placeholder token itself stays byte-identical — this rule
is the licensed way to fix the exposure.

**Source:** Russian editorial convention for indeclinable names; standard
localization craft for inflecting languages.

**Exception:** placeholders guaranteed to hold numbers, codes or other
non-declinable values («ошибка {code}») need no insulation. But «guaranteed»
means guaranteed by the source contract, not observed in current data.

## RU-PREP · translate the government, not the preposition

**Trigger:** an English preposition rendered by its dictionary equivalent — most
often «для» for *for*, «от» for *from*, «с» for *with*, «на» for *on*.

**Rule:** the Russian verb or noun decides its own government, and the most common
correct answer to an English preposition is *no preposition, oblique case*:
«проверка для {name}» → «проверка {name}» (genitive); «поиск по запросу» not
«поиск для запроса»; «войти с помощью пароля» or «войти по паролю», not «войти с
паролем» for *sign in with password*. «Для» is the loudest calque marker in
translated Russian — audit every «для» and demand it justify itself against the
governing word's own case pattern.

**Source:** standard Russian grammar (verb and noun government); the calque
pattern is documented in every serious Russian translation-quality guide.

**Exception:** «для» is correct when it genuinely means *intended for* a
beneficiary or purpose («настройки для разработчиков»). The rule bans reflexive
translation of *for*, not the word.

## RU-POSS · drop the possessive English inserted

**Trigger:** «ваш/ваши/своя…» before a noun whose owner is obvious from context —
which in a UI addressing one user is nearly every noun.

**Rule:** Russian omits the possessive where ownership is inferable: «Проверьте
настройки», not «Проверьте ваши настройки»; «Изменить пароль», not «Изменить ваш
пароль». Keep the possessive only where it contrasts or disambiguates («ваши
изменения будут потеряны» — yours as opposed to someone else's, or as the thing at
stake). When a possessive is needed and the subject owns the object, prefer
reflexive «свой»: «Сохраните свои изменения», never «Сохраните ваши изменения» —
the non-reflexive after an imperative is itself a calque.

**Source:** Russian stylistic norm; possessive pruning is a named step in the
major vendors' Russian style guidance.

**Exception:** legal and consent strings keep explicit possessives deliberately
(«ваши персональные данные») — precision outranks fluency there.

## RU-NOUNCHAIN · unstack the genitive chain

**Trigger:** three or more nouns chained in genitive («настройки уведомлений
параметров учётной записи»), usually born from an English noun-compound pile
(*account settings notification preferences*).

**Rule:** two genitives chain acceptably; three read as bureaucratese and force
the reader to parse ownership backwards. Break the chain with a preposition
(«уведомления о параметрах учётной записи»), an adjective («учётные параметры»),
or by splitting the label at the UI level (title + subtitle). English compounds
also hide the head noun at the end; Russian wants it first — translate the
compound from its head outward, not word by word.

**Source:** Russian editorial style (the classic «канцелярит» critique).

**Exception:** established fixed chains («история изменений файла») are fine at
three when each link is a settled term; the rule targets ad-hoc stacking.

## Review cue list

The fast greppable smells, in descending yield: «для » after a verbal noun; «ваш»
within two words of an imperative; a placeholder immediately after a transitive
verb with no head noun; «с помощью» where a bare instrumental would do; three
consecutive words ending in genitive endings. None of these cues is a verdict —
each is a place to apply the owning rule above and cite it if it fails.
