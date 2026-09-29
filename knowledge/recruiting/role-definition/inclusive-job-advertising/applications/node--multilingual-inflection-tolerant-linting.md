---
layer: application
type: application
subject: inclusive-job-advertising
technique: multilingual-inflection-tolerant-linting
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Four-language phrase patterns in the JD lint engine (Node/TypeScript)

`app/_lib/jd-lint.ts` is the whole rules engine: pure, registry-free, no
network, no model. Its header states the architecture and the reason in one
breath (`:8-11`) — *"Deliberately rules-only (no LLM): the check must be
instant, deterministic, and free — it runs on every edit. The phrase lists are
the highest-frequency offenders in EN + CS + DE + FR job ads, with
inflection-tolerant stems."* Read at kp `9f2ff09d6`.

## Four lists, not one translated list

`VAGUE_PATTERNS` (`:24-52`) holds eight English, seven Czech, four German and
four French patterns, and no half is **a translation** of another. The Czech
list carries offenders that only exist in that market's advertising register:
`motivující (finanční) ohodnocení`, `rodinná atmosféra`, `staň se součástí`,
`mladý kolektiv`. The English half carries `work hard, play hard` and the
`rockstar|ninja|guru` family, which have no local equivalent. The German list
opens with `wettbewerbsfähig|konkurrenzfähig` before `Gehalt|Vergütung`, which
is how that market writes "competitive salary". That asymmetry is the
standard's "prefer a shorter native list over a translated long one" realized:
the lists diverge because the boilerplate diverges.

`EXCLUSIONARY_PATTERNS` (`:58-68`) is **English and Czech only**, and its
comment (`:54-57`) notes the one cross-list discipline that matters:
*"rockstar/ninja/guru already flag under `vague`, so they're not repeated
here"* — one phrase, one finding, even when it belongs to two categories.

## Inflection tolerance, and the two Unicode traps

Every Czech pattern stems and then opens a `\p{L}*` letter run:

```
/konkurenceschopn\p{L}*\s+(?:plat\p{L}*|mzd\p{L}*|ohodnocen\p{L}*)/giu
```

The module comment names the trap that forces `\p{L}` rather than `\w`
(`:10-11`): *"`\p{L}` because JS \w excludes diacritics —
/konkurenceschopn\w*/ would stall at 'ý'."* The `giu` flags are all
load-bearing (`:21-23`): `g` to collect every hit, `i` with Unicode folding so
`Kč`/`Č` fold, `u` to interpret `\p{L}` at all.

Trap four was observed in the must-have counter, and the comment at `:70-80`
is the incident report: *"in 'musí mít' both 'í' and ' ' are non-`\w`, there
is no boundary, and /musí\b/ failed on EVERY occurrence. A Czech JD listing
twelve 'musí …' requirements therefore counted ZERO must-have markers and lint
clean, while the same JD in English flagged."* The fix is the guard pair the
technique recommends, `(?<!\p{L})…(?!\p{L})` (`:81`), which keeps the English
behaviour byte-identical. `PLACE_RE` (`:91-99`) ends its single-word stems at
the stem, with no trailing `\b`, for the same reason (`plzeň`).

## The remedy the finding names must satisfy the finding

The missing-place finding tells the writer what to write, in the surface's
language. The catalogs (`messages/<locale>.json`,
`library.result.lintMissingPlace`) name *"remote/hybrid/na pracovišti"* (cs),
*"remote/hybrid/vor Ort"* (de) and *"télétravail/hybride/sur site"* (fr).
Until `ec835e39a`, `PLACE_RE` accepted none of `na pracovišti`, `vor Ort`,
`sur site` or `télétravail`: a writer who followed the advice was shown the
same finding again. And `MONEY_RE` (`:84-89`) accepted `€` only before the
digits, so `60.000 € brutto im Jahr` and `45 000 € brut annuel`, the way de
and fr write pay, read as a missing salary.

The fix adds the four remedies, letter-guarded because they are multi-word, and
`€` to the after-figure currency group. The test that pins it
(`jd-lint.test.ts`, *"every place remedy the finding's copy names clears the
finding, in every locale"*) **reads the catalog rather than restating it**:
it asserts the copy still names each remedy and that the remedy clears the
finding. A copy edit that names a new remedy therefore fails the suite until
the detector knows it. A negative control keeps `zuvor Ortskenntnis` and
`notre site web` flagged.

A/B on the real module, eleven probe bodies: before, 4 of 4 localized remedies
and 2 of 2 trailing-euro figures were reported missing; after, 0 of 6. The
controls were unchanged on both arms: `Standort München` (missing place: no
German city list) and the English `young team` (exclusionary). Red first on
two tests, then 26/26 in the file, 77/77 with the lint wiring, the panel
residue and `renderTemplate`; tsc clean.

## Trap five: decomposed text

Nothing normalized the body before matching. In decomposed (NFD) text a
letter and its accent are two code points, `\p{L}` then `\p{M}`, so every
`\p{L}*` stem run stopped at the first mark, and `Kč` written as K + c + caron
was not `kč`. One Czech posting, NFC against NFD on the real module:

| | NFC | NFD, before `9f2ff09d6` |
| --- | --- | --- |
| boilerplate findings | 3 | 1, reported truncated as `rodinnou atmosfe` |
| missing salary (`65 000 Kč` stated) | no | yes |
| a second posting, `na pracovišti` and `70 000 Kč` | 1 finding | missing salary and missing place, the boilerplate gone |

`lintJd` now normalizes to NFC first (`:184-187`), and `collectPhrases` does
the same for the exported phrase finders (`:105-106`). A phrase found in the
composed text sits at other offsets in a decomposed body, so
`locateLintPhrase` (`:142-159`) falls back to searching the composed form and
maps both ends back to the original, absorbing trailing combining marks.
Without that mapping, the jump-to-phrase button in the editor would have
found nothing. The test asserts NFD and NFC lint identically, and that a
finding from NFD text locates its span in the NFD body. Red first; 79/79 with
the adjacent suites; tsc clean. The German posting was unaffected either
way, because its offenders carry no stemmed diacritics.

## Deviations from the standard

- **No language detection, and no not-checked state.** The engine is
  "bilingual by content" (`jdsLibrary.ts:50`, a comment now two languages
  behind its engine) with no language argument, so every body is run against
  every list. German and French have boilerplate lists but **no exclusionary
  list**: `junges Team` and `Berufseinsteiger` return no finding, and the
  surface cannot tell "checked, clean" from "not checked in this language".
  The ledger read-view's all-clear copy (*"Specificity check: pay, place, no
  boilerplate"*) claims only specificity, which keeps it honest about
  inclusivity by omission.
- **Place in de and fr is work-mode only.** City detection is Czech cities.
  `Standort: München` fires missing-place, which errs noisy rather than silent.
- **`MUST_HAVE_RE` counts marker words.** `MANY_MUST_HAVES = 8` (`:82`) sits
  above the roughly-five ceiling. `lintJd` now takes the structured count as
  well, whichever is higher (`:193-196`). Only the ledger read-view passes it
  (`JdsLedgerDetailModal.tsx:240`); the two editors do not
  (`JdsModalEditor.tsx:119`, `app/jds/[slug]/JdActions.tsx:85`), so ten bare
  bullets typed there still count zero.
