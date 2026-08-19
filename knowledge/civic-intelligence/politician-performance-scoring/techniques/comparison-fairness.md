---
layer: technique
type: technique
subject: politician-performance-scoring
technique: comparison-fairness
status: forged
laws: [missing-is-not-zero, non-partisan-symmetry, lead-not-finding]
shared_with: []
use_when: [rendering head-to-head or ranking comparisons of scored officials, deciding tie and missing-data semantics, excluding unverified data classes from comparison]
---

# Comparison fairness

Every surface that puts two officials side by side — a head-to-head view, a
ranked list, a "vs the chamber median" bar — makes claims beyond the numbers it
displays. "A leads B" is a different assertion than "A scores 61.2"; it is the
assertion readers remember and campaigns quote. Comparison fairness is the set
of display rules that keep those derived assertions true, and each rule below
was earned by measuring a live surface stating something false about correct
underlying data.

## Ties are ties

`leader = diff >= 0 ? a : b` declares the left-hand side the winner of a dead
heat — an ordering artifact promoted to a claim, and over a whole-population
pairing space exact ties on a published index number in the dozens. The rule: a
comparison outcome has **three values** — first leads, second leads, tied — and
tied renders as tied, with no winner styling and no "leads by 0.0" sentence. The
stability tie-break that keeps list order deterministic (name collation, an
identifier) is not a lead and the surface says adjacency within a tie means
nothing.

## Compare what is printed

An index published to one decimal supports comparison to one decimal. The
classic defect: coloring a winner from unrounded internal values while printing
rounded ones — producing cells where both sides show the same number and one is
painted as ahead. Audited across a full pairing space this is not an edge case;
it is hundreds of visibly self-contradicting cells. The rule: **the comparison
operates on the values the reader can see**, at published precision. A gap that
rounds to zero is a tie the data cannot break; a distinction the printed number
does not carry is a distinction the surface must not assert.

## Missing loses nothing

When one side of a comparison lacks a value — data never ingested, a metric not
applicable — the comparison for that fact is **void, not lost**. Rendering the
gap as zero fabricates total inactivity and hands the other side a manufactured
win; comparing a number with an absence is not a comparison. The absence renders
as "not measured", the fact is excluded from any aggregate the comparison shows,
and population references (medians, distributions) are computed only over people
who actually have the value — by counting real people, never by interpolating a
curve through them.

## Compare in native units, and higher is not better

A reader does not weigh "14.2 points against 11.8"; they weigh speeches given,
instruments authored, questions filed. Comparison surfaces print each fact in
the unit it was measured in, alongside the population median in that unit, with
the abstract points as the secondary reading. And the comparison verdict per
fact is only "which side has the higher number" — the surface must not style
higher as *better* for facts where the index takes no position (more absences
excused, more of a capped activity past its cap). Direction of virtue is the
formula's claim, made once, at the composite; per-fact cells report difference.

## Excluded classes are excluded aloud

Some data classes must not enter comparison at all — most importantly anything
still pending human review. Putting an unverified money trail into a
head-to-head converts a lead into a published finding by juxtaposition alone.
The rule has two halves: the class is excluded from the comparison surface, and
the surface **says it is excluded and why**, rather than silently omitting it.
Silent omission reads as "there was nothing", which is itself a false claim
about one or both sides. Exclusion rules are population-wide and party-blind: a
class is comparable for everyone or for no one.

## When not to use this

These rules govern surfaces that present *the product's own* derived
comparisons. They do not require refusing to display raw registry facts side by
side with full provenance — that is reporting, not scoring. Nor do they forbid
a reader-driven lens from ranking under custom weights; they apply inside it
identically (a lens tie is still a tie). The only genuinely wrong move is
selective application: fairness rules that engage only when a favored party
would otherwise lose are an editorial thumb, and auditable as one.
