---
layer: application
type: application
subject: translation-quality-measurement
technique: error-typology-over-a-single-score
stack: process
status: forged
verified_on: 2026-10-22
applied: experiment
ab_verdict: better
---

# Three native-review queues that changed format halfway (kp)

`kp` at `8f0278a5d`, the last commit to touch `docs/i18n/review-cs.md`,
`review-de.md` and `review-fr.md` (2026-08-12). Those three files are the
reviewer's record for a Czech, German and French catalog. A model review pass
writes them, and they hold the calls it leaves for a native speaker. The format
changed over the files' lifetime. The oldest sections are `key | note`. Later
sections add a `severity` column. The 2026-08-12 full review added `category`
too, so every row there carries a typed MQM-derived category and a severity. The
typology comes from the review method's Pass B, which this registry publishes as
the `i18n-translate` skill (1.6.3 at the time of the read).

So one store holds both arms, written by the same kind of reviewer about the
same catalog. Arm A is the untyped and severity-only rows. Arm B is the typed
rows. No arm was rendered for this run. The arms differ in date and in the
maturity of the method that wrote them as well as in format, and that confound
is named wherever it matters below.

The seam was chosen to falsify the technique. These reviewers are a model, not
people, and kp never computes a composite score. If the category bought nothing
over a note and a severity here, the technique's claim that categories have to
survive into the decision would not reach a store like this one.

## What was counted

A parser read every table row in the three queues: 533 findings (cs 250, de 154,
fr 129).

| Format | Rows | Cites a rule anchor |
| --- | --- | --- |
| key, note | 43 | 12 (28%) |
| key, severity, note | 79 | 18 (23%) |
| key, category, severity, note | 411 | 181 (44%) |

A rule anchor means the note names a glossary row, a style-guide rule ID, an
exemplar, a contract clause or a constructions file. The predicate is a regular
expression over the note, so it misses anchors written in other words.

**Categories held to the published top level, almost.** 400 of 411 typed rows
use accuracy, terminology, fluency, grammar, style or locale convention. The
other 11 use a slot the method invented (`length` 2, `leftover-source` 4) or
one a reviewer invented on the spot (`construction` 4, `other` 1). The invented
ones show the failure the technique names. `construction` is the name of the
Czech rule artifact (`constructions-cs.md`), used as a category. That is the
anchor written into the category column. `leftover-source` merges two owners:
three of its four rows (a coined product term kept in English, a pricing tier
name, a "Data / AI" family label) are do-not-translate decisions for the
glossary owner, and only one is plain untranslated text.

**The category routes, modestly.** A note asking for a house decision ("pick
one", "unify", "canonical", "policy", "consistency") appears in 20 of 106
terminology rows (19%) and in 29 of 305 other typed rows (9.5%). Terminology
concentrates the glossary-owner work at twice the rate of the rest. It does not
isolate that work: most terminology rows are single-key fixes, and some house
decisions are filed as fluency or style.

**Critical behaved as a release rule.** The queues carry four `critical` rows.
All four are in severity-only sections, so none carries a category. Each one
matches a ruling the technique makes in advance, or it is not a translation
defect at all.
- A plural block received a preformatted string and rendered "NaN" on a hero.
  That is a skeleton break, and it is critical unconditionally.
- A German legend called a colour-scale midpoint an arithmetic mean on a page
  that publishes wage statistics. That is accuracy on a consequential surface.
- Czech example commands could never parse, because the command parser matches
  English keywords only.
- A `{role}` fallback has no Czech value that fits both of the case frames its
  templates use.

The last two are source or code defects. Both reached kp's separate
source-defect register (`docs/i18n/source-defects.md`), and so did the NaN
row. kp never sums severities. Its refine pass rewrites a key when it holds at
least one critical or major finding. That is the technique's categorical
release rule, adopted without a composite ever existing.

**Accuracy findings cite the source, not a rule.** Only 4 of 40 accuracy rows
name a rule artifact. A sample of eight showed what the others cite instead:
the English string, the call site that decides its meaning, and the sibling
locales' renderings. That is the right anchor for a meaning error, but the
method's anchor list did not name it. Read literally, the method's "a finding
with no anchor is taste, drop it" would drop the class the technique calls the
most damaging.

**Style is where taste hides.** 87 of 139 style rows (63%) cite no anchor, and
138 of the 139 are minor. The technique warns that a category with no anchor is
"this feels translated" with better filing. Here that warning has a number.

## Verdict

**Target:** the share of findings a script can route to an owner without
reading the note. Arm A: 0 of 122, because the owner is only in the prose. Arm
B: 411 of 411 by category. 400 of them sit in a published top-level slot. The 4
`leftover-source` rows route to the wrong owner 3 times out of 4. Anchor
citation rose from 23-28% to 44%. That rise is confounded with the method
demanding anchors in the same version that added the column, so it is not
credited to the category alone.

**Floor:** no product change, no finding lost. Every row in all three formats
was parsed. The 533 rows match the files' own `_N items._` footers wherever a
section carries one.

`better`, at `experiment`, with `proof: before-after`. This is not `ab-paired`:
the two arms are different findings from different dates, and no single finding
was recorded both ways.

## What shipped

The method that writes these queues is published by this registry, so the
change lands there and not in kp's tree. `i18n-translate` 1.7.0 gives `length`
and `format` their MQM parent (design and markup). It replaces
`leftover-source` with `untranslated`, which is MQM accuracy, and sends a wrong
brand or do-not-translate term to terminology. It forbids inventing categories,
because a rule artifact is the anchor and never the category. It states that
critical is a release rule and is never summed. It routes source and code
defects to the source-defect register instead of giving them a translation
category. It names the source span and its call site as the anchor for
accuracy. The old queues keep their labels. The next review run writes the new
ones.

## What this cannot show

The reviewers are a model, so nothing here measures human inter-annotator
agreement on the categories. The house-decision predicate and the anchor
predicate are regular expressions. They were read against samples, not
validated. There is no engine comparison: kp has one engine, so the claim that
a typed profile breaks a tie between two engines was not reachable here.
