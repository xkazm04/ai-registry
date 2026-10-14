---
layer: application
type: application
subject: arabic
technique: de-anglicization-constructions
stack: process
status: forged
verified_on: 2026-10-14
applied: experiment
ab_verdict: unmeasurable
---

# Counting the de-anglicization tells in a shipped Arabic guide

The marketing site (`personas-web`) ships a 14-locale user guide; the Arabic
content (`src/data/guide/locales/ar/content/*.ts`, 2,481 Arabic sentences
after splitting on terminal punctuation) is the only Arabic prose in the fleet
long enough to count. The technique lists its tells as review anchors; this
run counted them before deciding whether anything needed rewriting, so the
"leave clean strings alone" boundary was tested instead of assumed.

## Arm A: the tells, counted over the shipped copy

| Tell (technique anchor) | Matches |
|---|---|
| تم / يتم + masdar, including the over-extended instruction form (AR-PASSIVE anti-rule) | 0 |
| noun-first before a fail/complete/start verb (AR-VSO) | 0 |
| three or more من in one sentence (the stacked-of calque, AR-IDAFA) | 3 raw, 0 real: all three are من meaning "from" |
| سوف, please-copying (رجاء / الرجاء) | 0 |
| sentence opening with يمكنك (you-can-ism) | 20 of 2,481 (0.8%), spread across ten files, never consecutive |

The string-escaped locale file for the marketing UI (`src/i18n/ar.ts`) stores
Arabic as \u escapes, so a raw-text grep for these tells returns zero there
for a reason unrelated to the copy; the counts above are over decoded text.

## Arm B: applying the technique

Nothing to rewrite. The 20 يمكنك openings are optional-capability statements
inside prose paragraphs, which the technique itself accepts ("fine once"); the
catalog-wide pattern it warns about would show as a high share, and the
measured share is under one percent. Flagging them would produce 20 false
positives against clean strings, the exact failure the "clean strings stay
untouched" law exists to prevent. No project change was made or owed.

## What this teaches the technique

The you-can-ism bullet says a catalog where "every sentence" opens with يمكنك
is the tell, with no threshold. In a copy set that was reviewed by a fluent
speaker the base rate is 0.8%; a reviewer needs a number to separate a
calqued catalog from ordinary capability statements. A review pass should
count sentence-initial يمكنك and escalate only when the share is a visible
fraction of the sentences (this tree gives the clean floor, n=2,481, one
project, one date; it is not a universal constant).

## Verdict and return condition

`unmeasurable`: no target number could move because the floor was already the
target. The seam was chosen to falsify (a guide this large, translated across
14 locales, might plausibly carry MT calques) and the finding held at its
"when NOT to apply" boundary. Return when a project ships machine-drafted
Arabic (a new locale pass or a catalog import) and the same counter can show a
before and after; the instrument is the detector described above.
