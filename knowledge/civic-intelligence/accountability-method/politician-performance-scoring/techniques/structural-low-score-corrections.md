---
layer: technique
type: technique
subject: politician-performance-scoring
technique: structural-low-score-corrections
status: forged
laws: [non-partisan-symmetry, lead-not-finding, missing-is-not-zero]
shared_with: []
use_when: [publishing the bottom of an activity ranking, annotating structurally low scores without touching them, keeping honest-absence labels non-judgmental]
---

# Structural low-score corrections

Low activity can reflect role, tenure, missing observations or measured
nonparticipation. The cause must be checked for the individual and period;
do not assume that structure dominates every ranking or infer motive from a
low count. Context labels explain source-attested facts, not character.

## The mechanism: annotate, never adjust

Annotations live beside the score and do not silently change its arithmetic.
A denominator or normalization defect still needs a versioned formula repair,
recomputation and impact report. Merely adding a badge cannot make incomparable
scores suitable for ranking. Legitimate tenure normalization is not forbidden.

- **Closed vocabulary.** Reasons come from a fixed enumerated set — executive
  office (each rank distinctly), late replacement, newly seated, dual mandate,
  declined mandate, institutional role, recorded nonparticipation, unknown. A closed
  set is what makes the annotation layer testable, translatable, and auditable;
  supporting free text still needs evidence and review. Extending the vocabulary
  is a reviewed change, and derived display keys should be generated from the
  vocabulary itself so a new reason cannot ship with a dangling label.
- **Stored as a separate reviewable fact.** The reason lives in its own
  namespaced field with pending-review provenance, written by an enrichment pass
  whose assertions remain unpublished until human review — never inline in the scoring path. Assignment of a reason
  is a claim about a person and gets the same review discipline as any other
  claim.
- **Unknown renders nothing.** A missing or unrecognized reason produces no
  badge — never a guessed explanation. A fabricated excuse is as dishonest as a
  fabricated accusation.

## Tone is part of the vocabulary

Use neutral labels for attested role and participation facts. Declining a seat
does not establish honesty; holding an institutional role does not establish
merit; low recorded participation does not prove refusal to work. Include the
source, applicable dates and review state. Unknown reasons must not generate a
guessed badge, but the surface should disclose that context is not established.
Apply the same evidence rules across parties and throughout the eligible cohort.

## Corrections and the screen's leads

A low score crossed with other signals (business interests, public money flows)
is the index's most valuable output — and its most dangerous. The structural
vocabulary supplies context, not causal proof: executive office does not
explain every low score or rule out a concern. An unexplained low score plus
linked flows can be a lead for human review, never an automatic allegation. Either way it is a **lead, never a verdict** — the surfaced copy
must say a human has not yet confirmed it, and the thresholds that gate the lead
are published constants like everything else.

## When not to use this

Do not restrict relevant role, tenure or coverage context to the bottom of a
ranking; the same fact can affect comparisons elsewhere. Do not let the badge migrate into the ranking's sort order
(sorting "corrected" people upward is score adjustment by other means). And do
not apply reasons retroactively without provenance: each assignment carries who
or what asserted it, and when.
