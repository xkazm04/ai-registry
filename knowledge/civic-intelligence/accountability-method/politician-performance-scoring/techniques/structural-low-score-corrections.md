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

The bottom of any floor-activity ranking is dominated by structure, not sloth.
An official appointed to executive office spends committee hours in cabinet; a
replacement seated weeks ago has had no time to accumulate anything; someone who
relinquished the mandate before taking the oath was never there to measure; a
dual-mandate holder splits attested time across two elected bodies. The index is
computing exactly what it promised — floor activity — and the promise is
precisely what makes its tail misleading: a low number reads as laziness, and
for a predictable set of named people that reading is false. Publishing the raw
tail without correction is the scoring product's most likely path to a justified
defamation complaint. The chairs-versus-backbenchers objection that
practitioners raise against every activity scorecard lives exactly here.

## The mechanism: annotate, never adjust

The correction is a **label beside the score, never a change to it**. Adjusting
the number — bonus points for ministers, pro-rating for late seating — silently
converts the published formula into an unpublished one, and every adjustment
constant is a fresh editorial judgment to defend. The score stays the formula's
output; a correcting badge explains why this particular low number does not mean
what a low number usually means.

- **Closed vocabulary.** Reasons come from a fixed enumerated set — executive
  office (each rank distinctly), late replacement, newly seated, dual mandate,
  declined mandate, institutional promotion, genuine absentee, unknown. A closed
  set is what makes the annotation layer testable, translatable, and auditable;
  free-text reasons are unreviewable editorial claims. Extending the vocabulary
  is a reviewed change, and derived display keys should be generated from the
  vocabulary itself so a new reason cannot ship with a dangling label.
- **Stored as a separate reviewable fact.** The reason lives in its own
  namespaced field with pending-review provenance, written by an enrichment pass
  that a human gates — never inline in the scoring path. Assignment of a reason
  is a claim about a person and gets the same review discipline as any other
  claim.
- **Unknown renders nothing.** A missing or unrecognized reason produces no
  badge — never a guessed explanation. A fabricated excuse is as dishonest as a
  fabricated accusation.

## Tone is part of the vocabulary

Each reason carries its own display judgment, decided once at the vocabulary,
not per-surface: *positive* for reasons that actively read well for the person
(declined the seat honestly, promoted to an institutional role), *neutral* for
structural facts that imply nothing either way (executive office, newly seated).
And the case that defines the boundary: **the genuine absentee gets a neutral
label whose text plainly says it is not a correction** — the person is simply
not doing the measured work. Omitting genuine absence from the vocabulary would
turn the annotation layer into a universal excuse generator; dressing it in
correction colors would soften the one verdict the data actually supports.
Symmetry cuts both ways: honest corrections for the structurally low, and no
manufactured mercy for the genuinely absent, identically across parties.

## Corrections and the screen's leads

A low score crossed with other signals (business interests, public money flows)
is the index's most valuable output — and its most dangerous. The structural
vocabulary is the first filter: a minister's low score plus linked firms is
mostly structure; an unexplained low score plus significant flows is a lead for
human review. Either way it is a **lead, never a verdict** — the surfaced copy
must say a human has not yet confirmed it, and the thresholds that gate the lead
are published constants like everything else.

## When not to use this

Do not extend the vocabulary to explain *mid-table* scores — the technique
exists because the tail defames, and a reason attached to an unremarkable score
is editorial noise. Do not let the badge migrate into the ranking's sort order
(sorting "corrected" people upward is score adjustment by other means). And do
not apply reasons retroactively without provenance: each assignment carries who
or what asserted it, and when.
