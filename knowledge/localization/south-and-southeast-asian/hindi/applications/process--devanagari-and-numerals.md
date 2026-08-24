---
layer: application
type: application
subject: hindi
technique: devanagari-and-numerals
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — script mechanics counted in a shipped 14-locale catalog

The Personas repo's Hindi style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-hi.md`, typography section)
settles every mechanic this technique anchors by counting the shipped,
human-reviewed portion of `src/i18n/locales/hi.json` — and its numbers are worth
citing because they show which rules are fully settled in practice and which
drift even under review.

## The settled ones: danda and digits

- **HI-DANDA:** 1,585 danda uses in the shipped file, with the Latin period
  reserved for abbreviations, decimals, and inside code/URLs/emails — the
  guide's example is "चिंता न करें।" over "चिंता न करें.". Fully consistent; the
  rule needed writing only so new strings and MT output could be audited against
  it.
- **HI-DIGITS:** 1,218 Western-digit occurrences against **zero** Devanagari
  digits. The guide states outright that this is "a fully settled convention,
  not a personal choice" — the strongest field corroboration of the technique's
  modern-software answer, and a warning to any pipeline whose formatter offers
  the `deva` numbering system.

## The drifting one: ellipsis

The same shipped file carries 485 literal `...` against 210 real `…` — a
professionally reviewed catalog, still split 70/30 on a one-character rule. The
guide's response is the process lesson: it names the inconsistency, sets the
absolute rule for new strings (always `…`), and — as Pitfall 5 — explicitly
forbids pattern-matching a neighboring key that still has `...`: "don't let
existing drift justify new drift." An accreted catalog will be inconsistent on
exactly the rules no reviewer feels; the fix is an anchored rule plus a
mechanical sweep, never per-string judgment.

## ZWNJ and nukta in the wild

The shipped corpus contains zero ZWNJ characters, and the guide's ruling matches
HI-CONJUNCT's last-resort stance: prefer the standard spelling that needs no
joiner (its example: संबंध over a ZWNJ-split variant), and where a word genuinely
requires one, use the real U+200C — never a visible substitute. On nukta, the
catalog's own termbase spellings carry the nukta forms (वर्कफ़्लो with फ़) —
byte-level consistency enforced through the termbase row rather than a blanket
sweep, which is the technique's recommended enforcement point.

## The incident that justifies the skeleton warnings

The guide's Pitfall 1 documents a live shipped bug at the key
`agents.lab.run_arena`: the value is literally
`"{count} {count, plural, one {} एरिना चलाएं ( मॉडल अन्य {s}})"` — a prior
machine-translation pass that "translated" ICU plural syntax it did not
recognize as code, in a runtime that has no ICU at all (plurals arrive as
separate `_one`/`_other` keys). Pitfall 2 records the companion placeholder
rules: `{count}`/`{name}` byte-identical, position free to move. Together they
are the field evidence for why a Hindi audit checks the machine-readable
skeleton before it checks a single Devanagari character: the script mechanics
above are visible to any reader, while a cooked placeholder reads fine to every
human reviewer and fails at runtime.
