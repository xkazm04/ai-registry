---
layer: application
type: application
subject: russian
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — terminology and loanwords in the Personas ru catalog

How the Personas app (`C:\Users\kazda\kiro\personas`, 19k keys, 14 locales) runs
the RU-LOAN bucket policy and the RU-TERMSPLIT collapse audit in a real Russian
catalog. The locale contract is `docs/i18n/style-ru.md` ("Loanword policy",
"Termbase", "Pitfalls"), on top of `docs/i18n/glossary.md`.

## The bucket policy, with per-term corpus reasoning recorded

The style guide implements RU-LOAN's three buckets as explicit lists with the
reasoning attached to each term, which is what makes the rulings enforceable
rather than one translator's taste:

- **Bucket 1 (established transliteration):** «триггер», «коннектор», «монитор»,
  «кокпит» — each justified by prior professional usage («триггер базы данных»
  has been ordinary Russian dev vocabulary for years; «кокпит» crossed over via
  motorsport UI). The guide explicitly forbids purist inventions: «спусковой
  крючок» for trigger is named as the absurd counterexample.
- **Bucket 2 (native word mandatory):** «возможность» not «фича», «навык» not
  «скилл», «восстановление» not «хилинг», «рабочий процесс» not «воркфлоу»,
  «учётные данные» not «креды» — with the register argument spelled out: slang
  transliterations clash with the вы-formal imperatives everywhere else in the
  file.
- **Bucket 3 (Latin stays Latin):** the glossary's do-not-translate list (API,
  CLI, JSON, OAuth, SDK, npm, MCP, SSE…) with the RU-LATIN prohibitions stated
  verbatim — no «джейсоны» for JSON plural, no «эйпиай», no declension suffix on
  a Latin form. The RU-COMPOUND hyphen pattern ships as «API-ключ».

An instructive boundary case: «персона» is itself a loanword by etymology, but
the guide rules it native (naturalized for a century, declines as an ordinary
feminine noun) — the corpus test applied honestly, against etymology.

## Two live collapse incidents, caught by the audit

Both of RU-TERMSPLIT's drift directions occurred in the shipped file:

1. **Persona/agent collapse** — the #1 drift in the locale (pitfall #1): ~15–20
   shipped keys render EN "persona" as «агент», inherited from an older surface
   that used "agent" for the same concept. The ruling: translate the English word
   actually used — persona→«персона», agent→«агент» — and fix wrong keys on
   sight under the fix-as-you-touch policy, never in a bulk rewrite (the
   clean-strings-stay-untouched discipline at file scale).
2. **Approval split** — the shipped file has both «Одобрить» and a stray
   «Утвердить» (`quick_approve`) for one action; the termbase settles on the
   «одобрение/одобрить» pair and marks the stray a duplicate to reconcile, not a
   second valid form.

A third case shows the termbase overruling shipped text on semantic grounds:
the shipped «AI-лечение» / «Лечение не удалось» family renders *healing* in the
forbidden medical frame; the ruling is «восстановление» (with «самовосстановление»
for the self- capability), fix on sight — while the already-correct sub-terms
(«Диагностика», «Исправление») are explicitly left alone.

## What transfers

1. **Record the reasoning with the ruling.** Each bucket entry carries *why* it
   landed there, so a later translator (or agent) can re-run the corpus test
   instead of re-arguing from taste.
2. **Fix-on-sight beats bulk rewrite** for collapse repairs in a shipped,
   reviewed catalog — the incidents above are repaired string-by-string as
   touched, keeping clean strings untouched.
3. **Distinguish drift from house rulings.** «кокпит» (unusual loan, deliberately
   adopted and recorded) and the persona/agent collapse (unrecorded drift) look
   similar in a raw frequency count; only the recorded ruling separates them —
   the authority-is-a-hypothesis law working in both directions.
