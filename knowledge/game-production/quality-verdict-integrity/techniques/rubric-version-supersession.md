---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: rubric-version-supersession
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity, law-and-check-share-one-source]
shared_with: []
use_when: [changing a grading standard that has already graded work, discovering a defect in a grading harness, aggregating scores produced over a long period]
---

# Rubric-version supersession

A grading standard is a versioned instrument. Stamp its version on every verdict
it issues, and treat a change of version as retiring every verdict issued under
the previous one. This is the second of the two invalidators a verdict carries;
the content fingerprint answers "did the artifact move", the version answers
"did the yardstick move".

## What counts as a version bump

Bump when a re-grade of unchanged content could plausibly produce a different
score. Concretely:

- **Contract changes** — criteria added or removed, band boundaries moved,
  reference standards restated, the strictness framing rewritten.
- **Input changes** — what the grader is shown. New context injected, a payload
  field newly included or excluded, a projection widened. The contract text can
  be untouched and the instrument still different.
- **Harness defect fixes** — the case people get wrong. A bug in how the payload
  was assembled is not "a bug we fixed"; it means every verdict ever issued
  under that harness was produced by an instrument that was not the documented
  one. Bump.

Do **not** bump for changes that cannot move a score: refactors, logging,
performance, prompt whitespace. A version that churns teaches consumers to
ignore it.

## Selection and strictness are different questions

Two predicates, asked separately, and conflating them is the classic bug.

- **Selection** — *which of an artifact's verdicts speak for it?* Only those at
  the **newest version present for that artifact**. A lenient older pass can
  never outvote a newer strict failure, and an older failure can never outvote a
  newer pass.
- **Strictness** — *is that newest-present version the version in force?* If
  not, the verdicts are `superseded`: kept as evidence, not counted as current
  quality, and they neither manufacture a pass nor condemn.

Spelling selection as "version at or above the one in force" agrees with
newest-present today and diverges the moment the version is bumped, at which
point two generations are retained together and the pipeline acts on whichever
one failed. Both predicates live in one place and every consumer calls them —
[one authority per quantity](../../_laws.md#one-authority-per-quantity) — because
a gate and a report that spell this differently will disagree exactly once, at
the worst possible moment.

## Write the history where the version lives

The version constant carries prose: what each version was, what changed at each
bump, and why. Not a changelog in another document —
[the law and the check share one
source](../../_laws.md#law-and-check-share-one-source), and a reader confronted
with a corpus of superseded verdicts needs to know, at the point of the check,
whether the change was cosmetic strictness or a corrected instrument, because
that decides whether re-grading is worth the spend.

## Quantify the defect before you supersede on it

When a harness defect is the reason for the bump, measure it. Take a small
stratified cell set, run the old and the new arm against the same artifacts with
a median-of-several per arm to suppress judge noise, and report the deltas
against a control arm that changed nothing.

A worked example of what such a measurement buys: a run over roughly twenty
cells found the control arm moved +0.4 points (standard deviation 3.1) — that is
the noise floor. The same set with a generation instruction contaminating the
judged payload scored +16.9. The same set with the surrounding sibling context
correctly supplied scored +4.3. Three numbers, and they settle three arguments
at once: the harness noise is about three points, so a four-point effect is
real; the contamination was forty times the noise floor and therefore invalidated
every prior verdict; and the context fix was a real but modest correction, not a
re-scaling. Without those numbers the bump is a shrug, and nobody can tell
whether the old corpus was slightly off or worthless.

## Decision rules

- **When the version bumps, superseded verdicts stop counting immediately** —
  no grandfathering, no "close enough". A distribution mixing two instruments is
  not a distribution.
- **When a verdict is superseded, keep it visible.** It is the evidence for
  whether the bump was an improvement.
- **When the version bumps, re-run the calibration measurement.** An agreement
  figure from a superseded standard describes an instrument that no longer
  exists.
- **When a batch grader meets a verdict at a different version, re-grade.** Not
  the same version, not eligible for reuse — the inequality is exact, in both
  directions.
- **When a defect is found, name the affected population as a count.** "Every
  prior verdict is provisional" is actionable; "there may be some bad data" is
  not.

## When not to use this

- **When the standard is genuinely stable and unversioned**, adding a version
  field that never moves is dead weight — but note that discovering you needed
  one *after* the first change means the pre-change corpus is unmarked forever.
  The field costs nothing; add it at the start.
- **When the change affects only one class of artifact**, a global bump retires
  correct verdicts for every other class. Version the standard per class, or
  accept the over-retirement deliberately and say so; do not fake a narrow bump
  by leaving the version alone.
- **When re-grading the whole corpus is not affordable**, supersede anyway and
  re-grade by priority. The alternative — leaving old verdicts counted so the
  dashboard stays populated — buys a green number with the layer's credibility.
