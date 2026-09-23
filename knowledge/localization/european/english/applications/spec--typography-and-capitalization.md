---
layer: application
type: application
subject: english
technique: typography-and-capitalization
stack: spec
status: forged
verified_on: 2026-09-14
---

# Spec · Five dash rulings in one fleet: declare, record, enforce

EN-DASH says the dash system is a declared choice, that a house ban is legitimate, and that the
ruling is recorded with the rule. Five products in one fleet made five different rulings about
the em dash. Read in their working trees on 2026-09-14 (uncommitted state included), they form a
worked case of that sentence: every ruling below is a defensible choice, and each one teaches
something different about what happens after the choice is made.

| Product | Ruling | Where recorded | Enforcement found |
|---|---|---|---|
| kp | No em dash in any catalog; en dash only between numbers | `docs\i18n\contract.md` §5, lines 83-113 | Blocking check in `scripts\i18n-check.mjs`, which skips array values |
| systedo-case | Default no dash; a spaced en dash for one beat of contrast; never an em dash | `docs\i18n\constructions-en.md:161-177`, `docs\i18n\style-en.md:46-60` | A count ratchet on the Czech column only |
| ascent | Em dashes swept from user-facing text | `scripts\check-em-dashes.mjs:1-22` | A manual reporter; model output sanitized at parse time |
| a private desktop product | Em dash allowed | its house-style document | None needed |
| politicas | An em-dash-overuse advisory rejected | `docs\design\impeccable-pass-01.md:244-247` | None |

## kp: a ban with a gate, and the gate's blind spot

`kp/docs/i18n/contract.md:85`: "**U+2014 `—` must not appear in any catalog,
in any locale.**" Line 100 keeps the en dash "**only between numbers**". Lines 108-113 give the
reason for enforcement, the strongest argument in the fleet for gating a typography ruling:
"**It is gated.** … The gate exists because the rule decayed without one: within hours of the
sweep that cleared all four catalogs, a parallel session added four new keys carrying em dashes.
It had no way to know the rule existed, which is precisely the case a gate covers and a doc does
not."

The gate is `kp/scripts/i18n-check.mjs`. `flatten()` at lines 132-137 recurses
into objects but not arrays (line 135: `if (value && typeof value === "object" &&
!Array.isArray(value)) flatten(value, path, out); else out[path] = value;`), and `dashError()` at
line 259 returns early: `if (typeof value !== "string") return null;`. Walking
`kp/messages/en.json` on 2026-09-14 found 8,491 string values outside arrays
and 14 arrays holding 62 strings; those 62 are never checked. The catalog's only em dash sits in
one of them, `landing.voice.transcript[0]` at line 838: "You shipped a React app for a school
project — what broke first when real users hit it?". The ruling stands and the deviation stands
with it until the check enumerates every rendered string. A typography rule is only as enforced as
the extraction beneath it.

## systedo-case: a ruling that reversed itself, gated on one side

`systedo-case/docs/i18n/constructions-en.md:163-167` records the reversal:
"This rule previously read *"The em dash IS English punctuation"* … **The owner decided against it
on 2026-08-06.** The em dash is grammatical English, but a product that reaches for it constantly
reads as machine-written — and this catalog reached for it **254 times** in the `en` column,
against 13 en dashes." `style-en.md:46-57` gives the recast order (full stop, colon, comma,
parentheses) and keeps "a **spaced en dash ` – ` (U+2013)**" for "a genuine single beat of
contrast". Both files scope out "the standalone `"—"` no-data placeholder" (92 sites), ranges and
middots, which are EN-DASH's own exceptions.

The ruling is the kind this subject calls legitimate: counted first, recorded with the rule, the
earlier opposite guidance kept visible as reversed instead of silently deleted. The enforcement
is uneven. `systedo-case/scripts/i18n-gate.mjs:43-46` holds a count ratchet,
"the count may only go DOWN", whose only dash entry is `{ id: "CS-DASH", name: "em dash in cs", re:
/—/g }`. The English half of a rule the file calls "Deliberately identical to the cs rule"
(`constructions-en.md:171-172`) has no ratchet of its own. The gate is exposed as `npm run i18n:gate` (`package.json:96`) and run
as step 4 of the translation wave protocol (`i18n-gate.mjs:6-8`); it is not referenced from the
hook or workflow files I searched.

## ascent: a reporter by design, and a sanitizer for model output

`ascent/scripts/check-em-dashes.mjs:2-4` names the decay the kp incident
showed: "A one-time sweep decays: the models that write most of this repo reach for the character
constantly, so without a check it comes back a file at a time". Line 17 is explicit about its
status: "This is a REPORTER, not a fixer, and it is not wired into any hook or CI gate." Its scope
(lines 6-15) excludes code comments, the no-data glyph and archived docs, which is a good model
for scoping a typography rule to text a user reads.

The upward lesson is in `ascent/docs/features/scanning/llm-providers.md:625-627`,
about model-written narrative produced at runtime: the path "**sanitizes rather than rejects**:
gating that narrative on em dashes would fall back to the deterministic template almost every
time and quietly delete the feature." A typography ban enforced by rejection on a generated
stream turns a punctuation preference into a feature outage. Catalog copy is gated at write
time; generated runtime copy is repaired, not refused.

## A private desktop product: allowing it is also a ruling

Its house-style document: "The em-dash is
fine; the exclamation mark is not, outside the `ProblemNote` glyph." That is a complete declared
row, and it pairs the dash decision with EN-EXCLAIM in one line. Nothing needs enforcing: a
permissive ruling still stops the next reviewer from raising dashes as findings.

## politicas: a ruling reasoned from the wrong locale

`politicas/docs/design/impeccable-pass-01.md:244-247`: "### `em-dash-overuse`
× 28 — REJECTED (advisory) / The em dash is standard Czech typographic punctuation. The rule is
calibrated for English AI-slop prose." Two things are wrong with the reasoning, and neither is the
decision to reject. First, its premise conflicts with this bundle's [Czech subject](../../czech/czech.md),
which records that the em dash is not a Czech character. Second, it reasons only about Czech, while
the product ships an English column too: on 2026-09-14 `messages\cs.json` held 904 em dashes and
`messages\en.json` held 886 across the same 3,807 lines. The English column copies the Czech dash
positions (`landing.lead`, line 456; `landing.rankingIntro`, line 464, two dashes in three
sentences). Under EN-DASH that is a density finding on the English side, whatever the house decides
about Czech. A product may keep every one of them, but only by recording a ruling about English.

## What the spread teaches

A ban, an en-dash-only rule, a sweep and an explicit allowance are all valid declarations; the
language does not choose between them. What separates the rulings is what happened next. An
unenforced ruling decays within hours once parallel writers who never read it add strings. A gate
covers only the strings its extraction enumerates. A rule declared for two columns and ratcheted on
one holds on one. On a generated runtime stream, rejection deletes the feature where repair would
not. And a ruling holds only for the locale it reasoned about.
