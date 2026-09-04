---
layer: technique
type: technique
subject: translation-quality-measurement
technique: human-review-sampling-under-a-budget
status: forged
laws: [coverage-is-counted-not-claimed, every-finding-cites-an-anchor]
shared_with: []
use_when: [a corpus is too large for full human review and someone must decide what gets reviewed, reporting a quality estimate for a locale nobody reviewed completely, a reviewer was told to check some strings and reported a percentage, deciding how much of a native speaker's time a new language gets, measuring how much correction machine output actually needed]
---

# Human review sampling under a budget

Full human review of a derived store is not on offer; that is the premise of
the derived-and-served topology, not a shortfall in it. What is on offer is a
sample, and the sample is where the measurement is usually lost — not in the
reviewing, which is normally done well, but in what the sample was drawn to
answer and what the result is then said to mean.

A reviewer handed "some strings" reviews the short ones, the ones near the top
of the catalog, and the ones an instrument already flagged. That produces a
perfectly good list of defects and a completely invalid estimate, and the
estimate is what gets quoted.

## Two samples, two purposes, never merged

- **The random sample estimates the corpus.** Drawn without regard to any
  score, stratified only by things that genuinely vary — surface type (label,
  sentence, error message), source length, and content section — it is the only
  draw from which a statement about the whole store follows. Its size is set by
  how precisely the store's defect rate needs to be known, and for the usual
  purpose (is this store fit to serve at all) a few hundred units per language
  is enough to distinguish a healthy store from a broken one. Its findings are
  a *measurement*.
- **The targeted sample fixes the corpus.** Drawn from the estimator's worst
  segments and the deterministic checks' residue, it concentrates the reviewer
  on where defects actually are and is by far the more efficient use of the
  budget. Its findings are *work*, and its defect rate is meaningless as a
  corpus statistic — it was selected to be high.

Both are needed and the split is roughly the budget's shape: most of the hours
to the targeted sample, a fixed reserve to the random one. Reporting the
targeted sample's rate as the corpus rate understates the store badly and
usually triggers a rebuild nobody needed; reporting the random sample's clean
result as though the flagged segments had been checked leaves the real defects
in place with a green number over them.
[Coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
is discharged by stating which sample, how it was drawn, how many units were
assigned and how many were actually opened — and a short batch is re-run
against the current store, never the snapshot that was drawn from, or the first
pass's fixes are reverted.

## What the reviewer is asked for

Not an opinion. A typed finding per defect — category, severity, and the anchor
it breaks — because
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
and an unanchored "this reads oddly" cannot be acted on, cannot be aggregated
across reviewers, and is the input that degrades already-correct strings when
somebody acts on it anyway. Where a real defect has no anchor to cite, the
reviewer's deliverable is the *new anchor*: a rule added to the language's
craft or the product's own artifact, after which every later sample pays less
for the same knowledge.

The second thing the sample yields, at no extra cost, is **post-edit distance**
— how much of the machine's text a reviewer actually had to change. Recorded
per unit alongside the findings, it is a volume measure of remediation effort
and it is genuinely useful: it tracks over time, it compares configurations,
and it costs nothing to collect once someone is editing anyway.

It is not a severity measure and must never be read as one. A one-word change
can be the critical accuracy fix; a full rewrite can be pure register polish. A
store selected for low post-edit distance is a store optimized for output that
is cheap to leave alone. Where the two disagree, the typed findings decide and
the distance is context.

## Draw the sample where the store is, not where it is easy

Three mechanical rules do most of the work:

- **Sample units, not files.** Drawing whole files gives one section's
  characteristics disproportionate weight and correlates every unit in the
  draw.
- **Fix the draw before the reviewing starts**, and record it. A sample topped
  up mid-review with "a few more" is a convenience sample with a random
  sample's reputation.
- **Refuse substitution.** A reviewer who skips a hard unit and takes the next
  one has made the sample about what is easy to check. An unreviewable unit is
  itself a finding — usually a source defect, which belongs in the source
  register and not worked around in one locale.

## When not to use it

- **On a surface that needs full review.** Legal text, safety instructions,
  payment flows and the pages a newcomer judges the product by are the
  hand-authored or reviewed-and-committed case; sampling is the instrument for
  the corpus that was never going to be fully reviewed, and using it to justify
  thin review of a consequential surface inverts its purpose.
- **As the sole gate on a regeneration.** A sample large enough to catch a
  broad drift is far larger than one that catches a narrow one; the frozen
  probe set and the deterministic checks are the instruments for change
  detection, and the human sample confirms their verdict rather than replacing
  it.
- **To produce a coverage percentage for the store.** Units reviewed over units
  assigned is an honest number about the review; units reviewed over units in
  the store is a number whose only honest reading is "small", and quoting it as
  coverage invites exactly the trust-class upgrade that separates a scored
  store from a reviewed one.
