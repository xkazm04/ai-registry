---
layer: technique
type: technique
subject: czech
technique: typography-and-spacing
status: forged
laws: []
shared_with: []
use_when: [setting up mechanical checks for a Czech catalog, fixing quotes dashes and spaces in Czech strings, deciding where a non-breaking space is required]
---

# Typography and spacing

The one region of Czech localization a script can police. Every rule here is
about characters, not judgment — which is exactly why glossaries and voice
guides miss them (they have nothing to say about a codepoint) and why they
should live in an automated gate rather than in a reviewer's head. The rules
come from Czech typographic convention as codified in the national
correspondence-and-typesetting norm (ČSN 01 6910), the Czech Language
Institute's orthography guidance, and the Microsoft Czech Style Guide §4.1.11
/ §4.1.16.

## CS-NBSP · Non-breaking space between number and unit

> **Rule** — *12 cm*, *45 min*, *240 Kč*, *87 %*, and three-letter currency
> codes — all joined with **U+00A0**, so the value never wraps away from its
> unit. Thousands groups likewise: *38 553*.
> **Exception** — when number+symbol acts as an **adjective**, there is no
> space at all (*50% sleva*). A standalone percentage keeps the space
> (*87 %*). The spaced form is the nominal reading and the default; a
> catalog must not mix them for the same construction.
> **Source** — MS §4.1.16; ČSN 01 6910.

Extend the same no-break glue to one-letter prepositions and conjunctions
(*k, s, v, z, o, u, a, i*) — Czech typesetting does not leave them stranded
at a line end (*k rozhodnutí*, with U+00A0 after *k*). Apply it where
trivial and in generated text; do not hold a translation hostage chasing
every instance in legacy strings.

## CS-DASH · The em dash does not exist in Czech

> **Rule** — Czech uses the **en dash** *–* (pomlčka, U+2013) with a space on
> each side where English uses an em dash, and closed up in ranges (*3–7*,
> *100–240 V*; or use *až*). **—** (U+2014) is not a Czech character.
> **Source** — MS §4.1.11, which states flatly that the em dash is not used
> in Czech.

The instructive incident: a localized landing page carried em dashes in
almost exactly the source's count — the character travelled with the copy
instead of being localized, in three languages at once, and no glossary or
voice review could have caught it. It was found by *counting dashes per
locale and comparing*. Frequency comparison against the source is a general
detection move for character-level calques. A house may go further than the
norm (some prose styles recast dashes away entirely, keeping – only for
ranges); that is a legitimate recorded tightening — what is never legitimate
is U+2014 in Czech text.

## CS-QUOTES · Czech quotation marks, and usually none at all

> **Rule** — most quotation marks in an English source can simply be dropped
> in Czech; never wrap a UI-element reference in quotes. Where quotes are
> genuinely needed they are „…“ — opening **U+201E** (low), closing
> **U+201C**. Never ASCII "…" and never the English pair “…”.
> **Source** — MS §4.1.11.

The closing glyph is the trap: U+201C is the *opening* quote of English, so
an English-trained eye — and most machine output — pairs a correct Czech „
with an ASCII or English closer. Check pairs, not glyphs: a „ whose closer is
not U+201C is a defect even though half of it is right. Ellipsis rides with
this rule's spirit: the real glyph **…** (U+2026), never three periods —
mechanical, and worth its own check (mint as `CS-ELLIPSIS` where an anchor
set needs it).

## CS-COMMA · Czech commas are obligatory where English's are optional

> **Rule** — every subordinate clause is set off by a comma, both sides when
> embedded — *že*, *který*, *jestli*, *když* clauses take one always, no
> judgment involved. When a limiting particle (*jen, právě, teprve,
> zejména*) precedes the conjunction, the comma goes **before the
> particle**: *…, jen pokud je máte*.
> **Source** — Czech orthographic rules per the Language Institute's
> guidance; MS §4.1.11.

Also obligatory where English shows nothing: the address comma — *Dobrý den,
{name},* — set off on both sides. Translators mirroring an English greeting
template drop it namespace-wide, which is one sweep to fix and worth a
dedicated check on greeting patterns.

## Numbers, dates, and the decimal comma

- Decimal separator is the **comma**: *0,5*, never *0.5* — in literal string
  text and hand-written example values, not only in runtime-formatted
  numbers. (Mint as `CS-DECIMAL` where an anchor set needs it.)
- Date: *24. 8. 2026* — periods **and spaces**; the squeezed *24.8.2026* is
  tolerated informally, the spaced form is the typeset norm. 24-hour clock.
- Currency: symbol after the amount with NBSP (*240 Kč*); real amounts are
  formatted at runtime by locale-aware machinery — a hardcoded formatted
  amount inside a translatable string is a source defect to report, not to
  imitate.
- Ordinals are a bare period (*3. pokus*) — never *3rd*-style suffixes, and
  the period is load-bearing (*3. pokus* = third; *3 pokusy* = three).

## Running the gate

Every rule above reduces to a scriptable check: forbidden codepoints (U+2014,
ASCII quotes around Czech text, `...`), required pairings („ with U+201C),
required NBSP in `\d + unit` patterns, decimal points between digits. Run
them as a merge gate over the whole catalog, not as review guidance — a
human reviewer reliably sees *through* typography to meaning, which is
precisely why these defects survive human review and accumulate. Order of
operations matters once: fix typography *after* wording passes, or the
rewrites reintroduce ASCII habits and the gate churns.

## When NOT to apply this technique

Do not "fix" typography inside placeholders, code literals, or markup — a
quote that is message-format syntax is skeleton, not text. And leave
English-language strings embedded by design (untranslatable legal names,
addresses) in their own conventions.
