---
layer: technique
type: technique
subject: harness-fault-attribution
technique: retract-and-record
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [a published finding about a model turns out to be an environment fault, correcting a score that moved after a harness fix, deciding what a benchmark owes its readers about its own defects]
---

# Retract and record

The concern: a fleet that fixes its harness quietly leaves a trail of published numbers
that no longer follow from anything, and readers who cannot tell a corrected result from an
uncorrected one. Retraction is not an embarrassment to be minimised; it is the mechanism
that makes the remaining numbers worth trusting. **Every harness defect is recorded with
what it made the results say, and every affected result is re-derived or re-run.**

## The record

One entry per defect, written when the fix lands:

1. **The defect** — what the harness did wrong, in one sentence.
2. **The effect before the fix** — which results it distorted, named, with their old values.
   This is the part that gets omitted and the part that matters: a fix without its effect is
   a changelog entry, not a retraction.
3. **The fix** — what changed, and whether it applies backwards.
4. **The remediation** — which stored results were recomputed, which cells were re-run, and
   which were left as measured under the old definition because they could not be redone.
5. **The wrong hypothesis, if one was published** — explicitly withdrawn, so the corpus does
   not carry both explanations with equal authority.

## Retracting a claim about a model

- **Say what the claim was and that it was wrong**, in the same place the claim lives. A
  correction filed elsewhere leaves the original quotable.
- **Name the real cause.** "Environment fault" is not a retraction; "a shared build
  directory served a stale test binary from a deleted sibling clone" is, and it is what
  stops the claim being re-derived next month.
- **Re-run the cells before restating anything.** A retraction followed by a new claim from
  the same spoiled data is worse than the original error.

## Score movements after a fix

A corrected measurement moves scores. Report the movement rather than the endpoint alone —
old value, new value, and the fix responsible — so a reader can see that the corpus was
maintained, and so anyone quoting the old number can find out why it changed. A benchmark
whose numbers change silently is indistinguishable from one that is being tuned.

## Decision rules

- **Retract at the granularity you published.** A published per-cell table needs per-cell
  corrections; a published aggregate needs the aggregate restated with its coverage.
- **Never let a retraction wait for the next full run.** The incorrect claim is live now,
  and the cost of leaving it is that someone acts on it.
- **Count the corrections publicly.** A fleet whose harness defect list is long and honest
  is more trustworthy than one with a short list and confident findings — and the length of
  the list is itself a measurement of how much the early results should be discounted.
