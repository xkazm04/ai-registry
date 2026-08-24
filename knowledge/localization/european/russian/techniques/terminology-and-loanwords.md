---
layer: technique
type: technique
subject: russian
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether a tech term is transliterated or translated, auditing register consistency of loanwords in a Russian catalog, handling Latin-script terms and brand names inside Cyrillic text]
---

# Terminology and loanwords

Russian tech vocabulary is a live borrowing frontier: English terms cross into
Cyrillic continuously, and at any moment a given term is somewhere on the path
from foreign word to slang to professional loan to native-feeling vocabulary. The
localizer's job is not to hold a purist line or to surf the slang — it is to place
each term correctly on that path *today*, and to make the placement a recorded
ruling so forty translators produce one vocabulary instead of forty.

## RU-LOAN · three buckets, decided per term, recorded once

**Trigger:** any English technical term without an obvious established Russian
rendering.

**Rule:** every term lands in exactly one bucket, and the bucket is a per-term
corpus judgment, not a policy slogan:

1. **Established transliteration** — the Cyrillic loan *is* the professional
   Russian word: «сервер», «триггер», «плагин», «коннектор», «интерфейс»,
   «монитор». Use it; inventing a native alternative reads as bureaucratic purism
   («спусковой крючок» for a database trigger is absurd to any Russian engineer).
2. **Native term required** — a good Russian word exists and the transliteration
   is chat-register slang: «возможность» not «фича», «навык» not «скилл»,
   «рабочий процесс» not «воркфлоу», «учётные данные» not «креды». The slang
   forms are real — a working Russian engineer says them daily in chat — but on a
   professional surface they clash with the вы-formal register the way a slang
   word inside a business letter would, and one such term breaks the catalog's
   voice more loudly than a grammar error.
3. **Latin stays Latin** — see RU-LATIN.

The test separating buckets 1 and 2: does the transliteration appear in
professional written Russian — vendor documentation, published technical books,
serious tech media — or only in chat and speech? «Триггер» passes; «фича» fails.
The line moves over years, so the test is re-runnable; the ruling, once made, goes
in the product's termbase and is enforced as a rule, not re-litigated per string.
Note the direction of error asymmetry: an over-native term reads as stiff but
professional; an over-slang term reads as unprofessional — when genuinely unsure,
prefer the native word.

**Source:** the major vendors' Russian style guides prescribe established Russian
terminology over ad-hoc transliteration; the bucket test is standard Russian
tech-editorial practice.

**Exception:** a deliberately casual consumer brand voice may adopt bucket-2 slang
as a recorded product decision — the same shape as the ты register decision, with
the same whole-catalog commitment.

## RU-LATIN · the do-not-translate class stays Latin, undeclined, unmodified

**Trigger:** protocol, format and standard names (API, JSON, HTTP, OAuth, SDK,
CLI, URL…), brand and product names, command names, file formats.

**Rule:** these stay in Latin script exactly as canonically written — no Cyrillic
transliteration («эйпиай»), no declension suffix bolted onto the Latin form
(«JSONы», «в GitHubе»), no quotes or italics around them. Embed them directly in
the Cyrillic sentence: «Приложение запускает агентов через API». They are
grammatically indeclinable nouns; when a sentence needs to inflect around one,
the case moves to a Russian head noun (see RU-COMPOUND and the RU-CASEGOV
insulation pattern). Grammatical gender for agreement purposes follows the
underlying Russian generic: API is masculine via «интерфейс», so «API доступен».

**Source:** the major vendors' Russian style guides; universal Russian tech
editorial practice.

**Exception:** a term with *both* a canonical Latin form and a fully established
Cyrillic loan («веб», «интернет», «онлайн») uses the Cyrillic in running prose —
those crossed over decades ago and the Latin form now reads as affectation.
Judge by the same corpus test as RU-LOAN.

## RU-COMPOUND · Latin attributive + hyphen + Russian head

**Trigger:** an English compound whose modifier is a do-not-translate term:
*API key*, *SSH access*, *web interface*.

**Rule:** Russian builds these as a hyphenated compound with the Latin (or loan)
term attributive and a Russian head noun carrying all the grammar: «API-ключ»,
«SSH-доступ», «веб-интерфейс», «GPU-сервер». The head noun declines normally
(«без API-ключа», «на GPU-сервере»); the Latin part never changes. Do not
reverse the order («ключ API» is also correct Russian — a genitive construction —
but pick ONE pattern per term and record it; a catalog mixing «API-ключ» and
«ключ API» for the same concept has split a term), and never drop the hyphen from
the compound form.

**Source:** Russian orthographic rules for compounds with foreign-script
elements; consistent across the major vendors' guides.

**Exception:** when the English "compound" is really a clause («key for accessing
the API»), translate the clause; the hyphen pattern is for lexicalized compounds
only.

## RU-TERMSPLIT · near-synonym pairs are distinct concepts, not free variants

**Trigger:** English near-synonyms that share a semantic field — *error/failure*,
*alert/warning*, *run/execution*, *settings/preferences/options* — and any pair of
Russian renderings drifting toward interchangeable use.

**Rule:** Russian usually offers a distinct word for each member of the pair
(«ошибка»/«сбой», «оповещение»/«предупреждение», «запуск»/«выполнение»,
«настройки»/«параметры»), which is an asset: assign one rendering per source
concept in the termbase and audit crossings mechanically. The characteristic
drift is *collapse* — independent translators settle different members of the
pair onto the same Russian word, and once two source concepts share one
rendering, no reader can recover the distinction. The inverse drift — one source
concept rendered by both members — is the ordinary term split that a
consolidation pass catches. Both are certainties over enough translator-hands,
not risks.

**Source:** standard terminology-management practice, sharpened by Russian's
richness in near-synonyms.

**Exception:** where the source itself uses two words for one concept
(legacy surfaces, inconsistent English), do not manufacture a Russian
distinction that isn't in the product — report the source defect and render both
with the single settled term.

## Running a terminology pass

Order of operations: (1) freeze the do-not-translate list and grep for
transliterated or declined violations — mechanical; (2) bucket every contested
term by the corpus test, record rulings; (3) sweep for register-breaking slang
against the recorded buckets; (4) run the collapse/split audit of RU-TERMSPLIT
against the termbase. Before enforcing any inherited termbase row, count its
actual occurrences in the catalog — a row the catalog coherently contradicts is a
candidate for correcting the row, not the catalog.
