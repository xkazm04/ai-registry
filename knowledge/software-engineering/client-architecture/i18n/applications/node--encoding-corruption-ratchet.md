---
layer: application
type: application
subject: i18n
technique: encoding-corruption-ratchet
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# A 108-line mojibake ratchet — the whole technique in one script

`scripts/check-i18n-encoding.mjs` is a complete, self-contained realization:
detection rule, per-file baseline, two lanes, tighten reminder. It guards
fourteen locale catalogs in `src/i18n/*.ts` — TypeScript modules, not data
files, which is what makes the blindness so pointed: the type checker runs
over these exact files on every build and cannot see the defect.

## The incident history it carries in its own header

The script's doctrine header (`:2-23`) is the reason it exists, and it
names the incidents rather than the principle:

> locale files have repeatedly been corrupted by editors/tools that read
> UTF-8 as cp1250/cp1252 and saved the result (e.g. "—" → "â€”", "ě" →
> "Ä›", Cyrillic → "Đ¾Đ´..."). Commit 5a57d9b even RE-corrupted four
> locales that had already been repaired. tsc enforces key parity but
> cannot see this, so the guard lives here and runs on pre-push. (`:5-9`)

Two claims in that paragraph are the technique's two load-bearing ones.
*Re-corrupted four locales that had already been repaired* is why this is a
standing gate and not a cleanup script — repair is not a terminal state.
*`tsc` enforces key parity but cannot see this* is the blindness in one
line: the corruption lives inside string literals, and every string literal
has the same type.

## Detection: two code pages' bands, plus the replacement character

`:31-41` builds one regular expression from two character classes and one
standalone alternative:

- **`LEAD` (`:32-34`)** — UTF-8 lead bytes `0xC2–0xDF` and `0xE0–0xEF` as
  they render through cp1252 (`ÂÃÄÅÆÇÈÉ…ýþ`) *plus* the cp1250 Central
  European letters (`ĂĹĎĐĚŃŇŐŔŘŚŞŤŮŰŹŻŽ` and lowercase). Both pages,
  because the Czech and Polish-adjacent locales are corrupted through the
  second one.
- **`CONT` (`:36-39`)** — continuation bytes `0x80–0xBF` through the same
  pages: the C1 punctuation block (`€‚ƒ„…†‡ˆ‰Š‹ŒŽ''""•–—˜™š›œžŸ`), the
  Latin-1 symbol range including the non-breaking space, `¡¢£¤¥`, `«»`,
  `°±²³`, `¿`, and cp1250's `ˇ˘Łł˝`.
- **The rule (`:41`)** — `[LEAD][CONT]` adjacency, `|` the U+FFFD
  replacement character on its own.

The header states the negative space explicitly (`:11-14`): "Legit Latin
diacritics, CJK, Cyrillic, Arabic, and `\uXXXX` escapes never match." That
is the property that lets one rule run over all fourteen files — the
logographic and Arabic-script catalogs cannot produce a `LEAD` character at
all, so they contribute no false positives while remaining fully covered
when they *are* corrupted.

## Baseline mechanics

`scripts/i18n-encoding-baseline.json` is the frozen ceiling as committed
data — a bare filename→count map, fourteen entries, currently **all zero**
(`:1-16`, `ar.ts` through `zh.ts`). The repair pass landed and the ratchet
was tightened behind it, so today the check is a hard zero everywhere and
its live value is entirely the re-corruption prevention the header records.

Counting is per file, per line, over regex matches (`:52-66`) — so the unit
is *occurrences of the signature*, not corrupt values and not corrupt keys.
Up to three sample lines per file are retained for the failure message
(`:61`), which is what turns a red build into a repair address.

`--update-baseline` (`:43`, `:68-72`) rewrites the file to current counts.
The header restricts it: "use only after an intentional repair" (`:21-22`).

## The two lanes and the four states

The loop at `:80-94` is the pass condition, and it is the technique's four
states one-for-one:

| state | code | outcome |
|---|---|---|
| `en.ts` above zero | `:83-86` | **FAIL** — "`en.ts` ships to production and must be clean" |
| any file above its baseline | `:87-90` | **FAIL** — "an editor/tool re-corrupted this file" |
| below baseline | `:91-93`, `:100-102` | pass + "tighten the ratchet with `--update-baseline`" |
| at baseline | `:103-107` | pass, naming remaining debt per file |

The hard-zero lane is `en.ts` because it is the file every reader receives
regardless of locale: `src/i18n/useTranslation.ts:3` imports it statically
while all thirteen others are dynamic imports (`:9-23`), and `:46-48` deep-
merges the loaded locale *over* English, so English text sits underneath
every locale in the product. Corruption there is not one locale's problem.

The at-baseline pass message is the part teams skip. `:103-107` prints
either `OK — all 14 locale files clean` or `OK — no new corruption (N
file(s) still carry known baseline debt: cs.ts=12, ru.ts=3)` — known debt
that is never printed is debt nobody remembers.

## Where it runs

`scripts/install-git-hooks.mjs` installs it as a **pre-push** hook next to
the coverage gate (`:17-22`), and does so without clobbering: if a hook
already exists, it appends only the missing lines behind labelled comments
rather than overwriting (`:30-43`) — a small courtesy that decides whether
a generated hook survives contact with a developer's own. `package.json:34`
binds this to `prepare`, so `npm ci` installs it. CI runs the same two
commands as the backstop (`.github/workflows/ci.yml:29-30`).

The neighbouring gate is `scripts/check-i18n-coverage.mjs`, whose shape
comparison fails on an **empty** string as well as a missing key
(`:55-63`: `actual.trim().length === 0` → "empty translation"). Between
them: coverage sees absent and blank, encoding sees garbled. Nothing sees
*wrong*.

## Where this falls short of the technique

- **No empty-success assertion.** `:45-48` filters `readdirSync` by
  `/^[a-z]{2}\.ts$/`. If that glob ever matched nothing — a directory move,
  a three-letter locale code — `:103-107` prints `OK — all 0 locale files
  clean` and exits 0. The standard requires a run that found nothing to
  check to be an error.
- **Tighten and loosen are the same command.** `--update-baseline` writes
  whatever the current counts are, upward as readily as downward (`:69`).
  The header's "only after an intentional repair" is a comment, not a
  guard; only the committed diff catches a ceiling that went up.
- **The hard-zero lane keys on a literal filename** (`:83`). Renaming the
  source catalog, or adding a second always-delivered artifact, silently
  demotes it into the baseline lane with no signal.
- **The baseline file carries no predicate.** It is a bare map of numbers;
  what those numbers count is stated only in the script's failure strings.
