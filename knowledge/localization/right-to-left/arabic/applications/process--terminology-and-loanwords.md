---
layer: application
type: application
subject: arabic
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Sentences with only the termbase words swapped in: a shipped Arabic catalog

The desktop app (`personas`) ships a 24,778-key Arabic catalog. The technique
says each term takes one of three paths and that the specific rows belong to
the product's termbase. This run read the catalog for the one failure that
sits between the paths and the strings: a termbase applied to text that was
never translated.

## What the hunt was chosen to falsify

The expected defects were transliterated generics (الكاش, الداشبورد) and
respelled identifiers. A caught outcome there would have been the technique
finding its own named failures. None existed: transliterated generics 1 raw
hit (a substring of an unrelated word), fused Latin-plus-clitic forms 0, the
14 article-plus-Latin forms all used the tatweel form (الـ webhook). The
technique's three bans held, so the seam moved to what it does not name.

## Arm A: what the catalog held

30 strings were English sentences with Arabic termbase words substituted into
them, produced by a glossary pass over an untranslated source, for example
"Every شخصية is already on this فريق." and "لا شخصيةs are linked to this
project's codebase." (a Latin plural bolted onto an Arabic word, the exact
shape AR-LOAN-FROZEN bans in the other direction). One was a corrupted
English TTS test sentence ("your شخصيةl AI assistant"). Separately, 5 strings
spelled the vault as the Latin loan beside 204 uses of the native خزنة (one
concept, two renderings). The coverage gate counted all of it as translated,
because every string differed from English.

## Arm B: whole translation, same termbase

The 30 sentences were translated whole with the catalog's own terms (شخصية,
فريق, حدث, قائمة الرسائل الميتة) and the 5 vault strings moved to الخزنة;
placeholders checked identical per key. Target: mixed-script English-sentence
strings 30 to 0 (re-run of the same detector). Floor: strict coverage 24,778
keys by 13 locales, 0 missing, 0 extra, 0 untranslated; the repo's pre-commit
and pre-push gates green. Pushed to the `personas` default branch.

## Not touched, owed

- The same substitution shape exists in other locales (German "Keine active
  processes for this Persona.", and the TTS sentence in ja, ru, hi): each
  needs a native-language pass, not this one.
- The 83 Latin `webhook` against 10 native renderings is a termbase ruling
  (frozen identifier or native head noun), not a mechanical fix; left as is.
- 14 article-plus-Latin forms and 23 Latin `Prompt` uses sit beside 60 native
  renderings; both are doubles needing a sense ruling per AR audit rule.
