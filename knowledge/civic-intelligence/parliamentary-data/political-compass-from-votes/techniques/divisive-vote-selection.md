---
layer: technique
type: technique
subject: political-compass-from-votes
technique: divisive-vote-selection
status: forged
laws: [every-cap-ships-its-population, missing-is-not-zero]
shared_with: []
use_when: [choosing which roll calls become compass questions, replacing editorial statement-writing with a mechanical draw, auditing a question set for silent exclusions]
---

# Divisive vote selection

The question set is the compass's entire evidentiary base: twenty-odd roll
calls stand in for a term of hundreds or thousands. Questionnaire-based tools
solve this with an editorial board; the record-based design solves it with a
**published mechanical rule**, and divisiveness is the rule's core signal. This
technique is that rule's anatomy: what qualifies as a candidate, how candidates
rank, and the discipline that keeps every exclusion visible.

## Why divisiveness

A vote that passed 180–3 tells a citizen almost nothing — agreeing with it
matches them to nearly everyone. Discriminating power lives in the contested
votes, so candidates rank by **closeness margin**: |yes − no| / (yes + no),
ascending — the most divided first. This is the same insight the questionnaire
literature applies when it discards statements all parties answer identically;
here it is computed from the record instead of guessed at during drafting.

Divisiveness is a *ranking* signal, not a floor: a moderately divided vote
still enters the pool and may be drawn when its theme is thin. Floors are
separate, and each one is a named, counted gate.

## The candidate gates, in a declared order

Candidates pass a fixed sequence of gates, and **the order is part of the
published rule**, because each gate's rejection count is only meaningful if
earlier gates already had their turn — otherwise the counts describe overlap,
not loss. A workable sequence, each with its rationale:

1. **Validity.** Voided and re-run roll calls never enter. Best supplied
   structurally: draw candidates from an upstream index that contains only
   valid votes *by construction*, so this gate cannot be forgotten — with the
   stated consequence that anyone bypassing the index must re-apply it.
2. **Procedural exclusion.** Motions about the sitting itself — adjournments,
   agenda changes, points of order — make meaningless positions. Exclude them
   by their topic class, and count the exclusions.
3. **Participation floor.** A vote where most of the chamber was absent is a
   poor position for *everyone* downstream: it inflates the non-comparable
   buckets of every scored representative. Require a minimum count of
   positional ballots (yes + no) — set it high enough to mean "the chamber
   showed up", on the order of a supermajority of seats. Distinguish two
   rejection states: *no ballot data held at all* (participation could not be
   measured — the floor never judged it) and *below the floor* (measured and
   failed). Conflating them blames the vote for a gap in your own ingestion.
4. **Classifier confidence floor — last, and missing is not low.** When theme
   tags come from an automated classifier that reports per-tag confidence,
   refuse tags below a published confidence threshold — a misfiled vote can
   silently change which handful of votes represents the whole term, and that
   handful is the compass's entire input. But a tag whose confidence is
   *absent* asserts nothing about certainty; dropping it reads a missing value
   as zero. Keep it, and count it separately, so the reader sees on how many
   candidates the floor decided nothing. Run this gate last on purpose: its
   rejection count should mean "taken by the confidence rule", not a mixture
   with votes that would have failed participation anyway.

## Every gate ships its count

The selection surface's promise is "no editorial hand touched this set". That
promise is checkable only if the rule's live parameters *and* each gate's
rejection tally render beside the result: excluded-by-topic N, without-ballots
N, below-participation N, below-confidence N, confidence-unknown N, candidates
remaining N. A gate that rejects silently is indistinguishable from an editor
— and the incident pattern is always the same: the thresholds exist, work
correctly, and drop candidates invisibly on the one surface whose entire claim
is that the rule is inspectable. Note the boundary: a vote the classifier never
tagged at all is not a *victim* of any gate — the rule knows nothing about it.
Report untagged volume as coverage, not as a rejection.

## Deterministic tie-breaks, admitted as arbitrary

Within equal margins, break ties by a fixed cascade — more positional ballots,
newer date, then a stable identifier — so the same ledger always yields the
same set. The identifier tie-break carries no meaning and exists only for
stability; the disclosed rule says so rather than letting readers infer
significance.

## When not to use this

- **Tiny records.** A young chamber or a short term may hold too few divided,
  well-attended votes to fill a set; shrink the set and say so, rather than
  lowering floors quietly.
- **As an importance measure.** Margin measures division, not weight; the most
  consequential act of a term may have passed broadly. The compass measures
  discrimination between representatives, and must not present its set as
  "the most important votes".
- **Alone.** Pure divisiveness ranking collapses onto the term's loudest
  conflict; it needs the theme-balanced draw on top.
