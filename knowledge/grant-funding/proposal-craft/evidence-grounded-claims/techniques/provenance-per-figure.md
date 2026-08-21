---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: provenance-per-figure
status: forged
laws: [provenance-per-field, never-fabricate-a-figure]
shared_with: []
use_when: [designing the fact-ledger schema, presenting extracted values for human review, answering "where did this number come from" for any figure in a proposal]
---

# Provenance per figure

A figure without a source is a candidate, not a fact — and in a funding
application, the difference is the whole game. Provenance per figure is the
discipline of making every number in the pipeline carry its own answer to
"says who?": which document it came from, how it was read out of that
document, and how confidently. The point is not record-keeping for its own
sake; it is that provenance is what *converts trust decisions into cheap
lookups* at every step where a human or a gate must decide whether a
number may stand.

## What travels with the figure

Three fields, attached at extraction and never separated from the value:

- **Source document** — the specific uploaded file, by identity and by
  human-readable filename. The filename matters independently: it is what
  renders next to the value at review time and inside the grounding block
  at drafting time, so both the writer and the generator can attribute
  ("per the audited financials"). A source reference that resolves only
  for the database is provenance for machines; the filename is provenance
  for the person who signs.
- **Extraction method** — deterministic pattern versus model pass. The
  two have different error shapes (mis-anchored match versus fluent
  misreading), and honest provenance says not just where a value came
  from but how much to trust the reading. A reviewer double-checks a
  model-extracted outcome differently than a pattern-matched identifier.
- **Confidence grade** — stated explicitly / inferred / uncertain,
  assigned at extraction against a written policy, consumed everywhere
  downstream: high-confidence facts are offered plainly, low-confidence
  ones arrive hedged and ask for confirmation. Confidence without a
  consumption rule is decoration.

## Where provenance does its work

- **At drafting**, each fact enters the grounding block with its source
  attached, which both strengthens the narrative (the model can cite the
  org's own documents) and sharpens the authority claim — these are not
  "numbers we like", they are "numbers from these files".
- **At review**, a suggested value renders with its filename and grade,
  so accepting it is an informed act. The writer is reviewing sourced
  values, not doing data entry — the entire difference between a truth
  layer and an autofill.
- **At challenge**, whether from an internal reviewer, a program officer,
  or an auditor years later, the question "where did this come from?" is
  answered by lookup, not archaeology. The applicant who can answer it
  per-figure is the one whose other figures stay trusted.
- **At the boundary of the fact set**, provenance defines membership: a
  value that arrives without a source — typed in from memory, pasted from
  an old draft, inferred by a model outside the extraction path — is not
  a ledger fact. It may still enter the application, but as the writer's
  own asserted content, on their authority, not the ledger's. The ledger
  never launders unsourced numbers into "verified".

## Decision rules

- When a source document is deleted or replaced, its facts go with it —
  provenance is a live link, not a birth certificate. Facts from a
  superseded financial year should die with the superseded document, not
  linger as sourced-looking stale values.
- When the same fact is extracted twice by different methods, keep the
  provenance of the reading you keep; do not merge into a sourceless
  composite.
- When rendering for a human, always show filename and confidence
  together; when rendering for a generator, filename suffices — the
  confidence policy has already decided what the generator gets.
- When a figure must be updated (a corrected financial statement), the
  correction path is a new document and re-extraction, never an in-place
  edit of the value under the old source. Editing a value out from under
  its provenance is fabrication with extra steps.

## When not to use

Per-figure provenance earns its cost where figures carry application-level
stakes. It is overkill for ephemeral working numbers that never reach a
draft — word-count targets, internal scoring — and it is the wrong
mechanism for third-party citations (published research, government
statistics), which need a *citation* to a public source rather than a
link to an uploaded file. Do not stretch the org-facts provenance model to
cover them; parallel mechanisms with the same spirit beat one mechanism
with blurred semantics.
