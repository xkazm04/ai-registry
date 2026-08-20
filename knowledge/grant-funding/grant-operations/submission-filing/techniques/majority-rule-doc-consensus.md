---
layer: technique
type: technique
subject: submission-filing
technique: majority-rule-doc-consensus
status: forged
laws: [small-samples-stay-silent, honest-null-over-forced-guess]
shared_with: []
use_when: [deriving a canonical document list from multiple filer reports, keeping one outlier filing from dictating the checklist, choosing between union and intersection of contributed lists]
---

# Majority-rule doc consensus

Given several organizations' reports of "the documents this funder demanded,"
the aggregator must produce one canonical checklist. The two obvious
combinators are both wrong. The **union** admits every document any filer
ever mentioned — one org that volunteered extra attachments, misremembered,
or filed under a special program permanently inflates everyone's checklist.
The **intersection** demands unanimity — one org that forgot to list the
budget deletes the budget from the canon. The technique is the middle rule:
a document enters the canonical list only when a **strict majority** of the
contributing filings reported it.

Strict majority (more than half, not at-least-half) is deliberate. At two
contributions, at-least-half admits every document either filer mentioned —
the union in disguise, exactly when the sample is weakest. Strict majority at
two requires both to agree, degrading gracefully toward intersection as
samples shrink and toward robust-majority as they grow. The rule is honest at
every sample size without special-casing any.

## Procedure

1. **Deduplicate within each contribution first.** Count each document at
   most once per filing — a filer who listed "board list" twice is one
   report, not two. The unit of evidence is the filing, never the mention.
2. **Count across contributions.** For each distinct document string, count
   the number of filings reporting it.
3. **Apply the strict-majority threshold** against the number of
   *document-contributing* filings — filings that reported no documents at
   all are absent from this denominator, not silent votes against every
   document.
4. **Order the survivors by report count, descending.** The checklist then
   reads most-corroborated first, which is also the order of the user's
   likely obligations.
5. **Return the empty list honestly when nothing clears the bar.** An empty
   consensus means the reports disagree too much to summarize; the consumer
   falls back to the generic checklist. Do not lower the threshold to force
   an answer out of noise.

## The identity problem

Majority counting is only as good as document identity. "990," "Form 990,"
and "most recent tax return" are one document wearing three strings, and a
naive counter splits their votes so none clears the majority. Options, in
order of preference:

- **Constrain at capture**: offer the filer a pick-list seeded from the
  standard materials set plus free-text additions — most reports then arrive
  pre-canonicalized, and free-text is the exception to normalize.
- **Normalize before counting**: casefold, trim, and map known aliases to
  canonical names via a maintained table.
- **Never fuzzy-merge silently at aggregation time** beyond the alias table:
  a similarity join that merges "financial statements" into "audited
  financial statements" has manufactured a requirement no one reported.
  Where identity is uncertain, keep the strings separate and let neither
  reach majority — an honest null over a forced merge.

## Decision rules

- **When only one filing contributed documents, publish nothing, because**
  a majority of one is an anecdote, and the profile's confidence tier should
  already be suppressing the list at that sample size — the threshold and
  the confidence floor are two independent guards on the same risk.
- **When a document sits just under the threshold, do not surface it as
  "sometimes required," because** a hedge row in a checklist reads as an
  obligation; sub-majority documents are simply absent, and the caption's
  "confirm against the funder" carries the residual uncertainty for all of
  them.
- **When the majority list contradicts the funder's own published
  requirements, the funder wins, because** the crowd approximates the
  authoritative document; it never overrules it.
- **When old contributions age out or new ones arrive, recompute from
  scratch rather than incrementally patching, because** the consensus is a
  pure function of the current contribution set, and incremental state is
  where ghost documents survive their supporting reports.

## When not to use this

Majority consensus fits facts that are *shared* across filers — the funder
demanded X of everyone. It does not fit values that legitimately vary per
filer: filing duration (aggregate by median), award amounts, or program-
specific attachments demanded only of certain applicant types. Forcing
per-type requirements through a global majority erases exactly the variation
that mattered; if applicant-type variation is real and reported, segment the
contributions before applying the rule.
