---
layer: technique
type: technique
subject: russian
technique: typography-and-spacing
status: forged
laws: []
shared_with: []
use_when: [sweeping a Russian catalog for punctuation and glyph defects, setting typographic conventions before a translation wave, reviewing quotes dashes and ellipses in Russian strings]
---

# Typography and spacing

Russian typography is the cheapest audit in the locale: every rule below is
mechanical, most are greppable, and together they are the first thing a Russian
reader registers — ASCII punctuation marks a catalog as translated before a
single word is judged. Sweep typography *first* in any review pass, so the
prose reviewers behind you are reading language, not glyph noise.

## RU-QUOTES · guillemets «», nested „“

**Trigger:** any quoted material — search terms, entity names, cited labels.

**Rule:** Russian quotes are guillemets «ёлочки» with no space inside: ««{query}»»
is wrong, ««Версии»» is wrong, «Версии» is right. A quote inside a quote takes
German-style lowered quotes „лапки“: «Он сказал: „Готово“». Straight ASCII quotes
`"…"` are an English calque to replace on sight; English curly quotes “…” are the
same calque in better clothes. In practice nesting almost never arises in UI
strings — short labels do not quote speech — so the operative rule is simply:
every quote character in a Russian string is « or ».

**Source:** Russian orthographic and editorial standard (codified in the standard
publishers' references and the major vendors' Russian style guides).

**Exception:** quotes that are part of the machine skeleton — a literal `"` inside
code output, a JSON example — are content, not punctuation; leave them. Also leave
apostrophes inside untranslated Latin-script names.

## RU-DASH · spaced em dash for breaks; hyphen only inside words

**Trigger:** any dash-like character.

**Rule:** three characters, three jobs, no substitutions:

- **Em dash —**, with a normal space on both sides: parenthetical breaks,
  appositions, and the omitted copula that Russian uses where English says *is*
  («Регистрация — бесплатно»). The copular dash is load-bearing: Russian drops
  «есть», and the dash is what holds the sentence together, so a hyphen there
  breaks grammar, not just style.
- **Hyphen -**, no spaces: inside compound words («API-ключ», «онлайн-режим»,
  «кто-то»).
- **En dash –**: effectively unused in Russian editorial practice; ranges use the
  em dash without spaces («5—10») or a hyphen in tight numeric contexts. Do not
  import the English en-dash range convention into hand-authored strings.

**Source:** Russian editorial standard.

**Exception:** minus signs in numeric output and command-line flags are skeleton,
not punctuation.

## RU-ELLIPSIS · the single … character

**Trigger:** any trailing-off or in-progress marker.

**Rule:** one glyph, `…` (U+2026), never three periods. This matters beyond
purism: truncation logic, width measurement and string comparison all treat `...`
and `…` differently, and a catalog with both (which is what drift produces) fails
any exact-match tooling twice. Fix `...` on sight, never introduce a new one.
After «и т. д.» and similar abbreviations, no ellipsis stacking.

**Source:** Russian editorial standard; the single-glyph rule matches the major
vendors' UI style guidance.

**Exception:** none in translated text. A source string using `...` is a source
defect to report, not a pattern to mirror.

## RU-YO · ё where it disambiguates

**Trigger:** any word where е/ё distinguishes meanings, and any hand-authored
string containing «все/всё».

**Rule:** general Russian orthography makes ё optional, and a catalog may
legitimately choose either the ё-everywhere or ё-minimal convention — but ё is
**mandatory wherever the е-spelling is a different word**. The high-frequency UI
case is «всё» (everything, neuter singular) versus «все» (everyone/all, plural):
«Все сохранено» misreads; «Всё сохранено» is the claim intended. Others recur in
tech copy: «совершённый/совершенный», «узнаём/узнаем». Within one string family,
be consistent about the optional cases rather than mixing «ещё» and «еще» line by
line.

**Source:** Russian orthographic rules (the disambiguation clause is explicit in
the academic orthography).

**Exception:** none for the disambiguating cases; the optional cases are a
recorded per-catalog convention, either answer defensible.

## RU-NBSP · non-breaking spaces where a break orphans

**Trigger:** hand-authored strings with literal numerals, units, initials, or
one-letter prepositions.

**Rule:** put a non-breaking space (U+00A0) between a numeral and its unit or
counted word («9 утра», «5 минут»), inside abbreviation pairs («и т. д.», «т. е.»),
and — in longer prose strings — after the one-letter prepositions and conjunctions
(«в», «с», «к», «о», «и», «а») that Russian print style never leaves at line end.
UI strings are short and often unwrapped, so apply this proportionately: numeral
+ unit always; one-letter prepositions only in strings long enough to wrap. This
is a hand-authoring rule for literal numerals only — runtime-formatted numbers,
dates and currencies are the formatter's job, and hardcoding a localized format
into a string is a separate, worse defect.

**Source:** Russian print typography convention; not as load-bearing as the
equivalent French rule (Russian punctuation itself never needs a preceding
space), but the orphaned single character in a narrow column is real.

**Exception:** none needed — the rule is already scoped to where it pays.

## RU-CASING · sentence case, and no letter-spacing games

**Trigger:** multi-word labels, buttons, headings.

**Rule:** sentence case everywhere: first word capitalized, plus proper nouns.
Title Case mirrored from English («Все Настройки», «Учётные Данные») is a defect
in every position — Russian has no Title Case register at all, so the calque is
not informal, it is nonexistent. All-caps for emphasis is likewise foreign to
Russian UI convention (and Cyrillic all-caps sacrifices the letterforms'
distinguishability); emphasis belongs to layout, not orthography. Latin brand and
product names embedded in Cyrillic sentences keep their own casing and need no
quotes or italics around them.

**Source:** the major vendors' published Russian style guides prescribe sentence
case for all UI elements.

**Exception:** the first word of a label that happens to be a lowercase-branded
name keeps the brand's casing; do not force-capitalize a brand.
