---
layer: application
type: application
subject: bengali
technique: de-anglicization-constructions
stack: process
status: forged
verified_on: 2026-10-14
applied: experiment
ab_verdict: better
---

# Counting the de-anglicization tells in two shipped Bengali catalogs

Two fleet trees ship Bengali long enough to count: the desktop app's UI catalog
(`personas`, 23,967 Bengali strings) and the marketing site's 14-locale user guide
(`personas-web`, 2,843 Bengali sentences after splitting on terminal punctuation).
The sibling Arabic run found its guide clean; this run counted the Bengali tells
first, with a seam chosen to falsify the same worry (machine drafting leaves calques).

## Arm A: the tells, counted

| Tell (technique anchor) | App catalog | Guide |
|---|---|---|
| "is" back-filled with আছে / হয় + একটি (BN-ZEROCOP) | 0 | 0 |
| verb-first imperative with a fronted object (BN-SOV) | 0 | 0 |
| Latin word stranded mid-clause, not on the do-not-translate list (BN-FULLCLAUSE) | 84 sentences, 21 strings carrying one noun | 1,144 of 2,843 sentences (40.2%) |

The grammar tells (zero copula, verb-final order) were absent: the translators
planned Bengali sentences. The defect that is present is the coverage one. For
scale, the same counter over the other locales of the guide gives Arabic 3.8%,
Russian 5.1%, Japanese 6.1%, Hindi 21.0% and Bengali 40.2% (same predicate,
same trees, one date; the counter strips placeholders, code spans, parentheses,
quoted labels and paths, so these are floors for Latin residue, not exact rates).

## Arm B: applying the technique

The app catalog's residue was one noun, `persona`, which the project's own
termbase renders with a transliteration. It stood bare in 21 strings ("কোনো
persona নেই"). Those were rewritten to the termbase rendering in one commit
(strings only, placeholders and identifier examples such as `persona_data`
untouched, coverage gate and pre-commit hooks green). The other app-catalog
residue sentences are mostly brand, protocol and trigger-label tokens the termbase
keeps Latin (webhook, cron, https); a few ("describe", "lifecycle") look like real
residue but sit in example or placeholder text and were not verified, so they were
left for a native reviewer rather than patched blind.

The guide's 40.2% was not rewritten. Roughly eleven hundred sentences is a
translation pass needing a Bengali reviewer, not a mechanical edit, and the guide
pins its translated topics to the English they match, so a bulk edit would also
churn those pins. It is filed as the project's next change, sized by the counter
(target: Bengali below the Hindi figure, floor: no pinned topic unpinned).

## What this teaches the technique

BN-FULLCLAUSE says stranded English is a coverage defect but gives no way to tell
a few sentences from a catalog-wide state. The counter gives one: a termbase noun
left bare is cheap and local (one global rewrite fixes 21 strings), while a share
in the tens of percent means the pass was never finished and needs a re-translation
rather than patching. In this tree the clean grammar plus a high Latin share is the
signature of a draft that translated structure and skipped vocabulary.

## Verdict and return condition

`better` for the app catalog: target (bare termbase noun) went 21 to 0 strings in
the Bengali catalog, floor (translation coverage, 0 gaps across 14 locales) held.
The guide arm stays open as a `task`. Return when the guide's Bengali pass is
re-translated and the same counter is run before and after; the instrument is the
sentence-level stranded-Latin predicate described above.
