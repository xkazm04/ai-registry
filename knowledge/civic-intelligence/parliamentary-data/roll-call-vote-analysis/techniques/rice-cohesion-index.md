---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: rice-cohesion-index
status: forged
laws: [missing-is-not-zero, one-definition-one-import]
shared_with: []
use_when: [measuring party discipline over time, comparing unity across parties, charting a chamber's temperature per day or per vote]
---

# Rice cohesion index

The Rice index is the field's oldest unity measure (1925) and still its
lingua franca: for one group on one division, **|yes − no| / (yes + no)** over
the group's positional ballots. 1.0 is a perfectly whipped vote; 0.0 is a
group split down the middle. A group's cohesion over a period is the mean of
its per-vote indices across qualifying votes. Its virtues are real — it is
transparent, recomputable by a reader with a calculator, and comparable
across a century of literature. Its blind spots are equally well documented,
and the technique is mostly about gating them.

## Computing it honestly

- **Positional base only.** The denominator is yes + no. Abstentions,
  not-pressing, merged buckets and absences are outside the fraction
  entirely; folding them in as thirds or halves produces a private index
  that quotes Rice's name without his comparability.
- **Exclude voided divisions**, as with every discipline metric.
- **Per-vote qualification floor.** A vote counts toward a group's cohesion
  only when at least a minimum number of its members took a position (five
  is a workable floor). Below the floor, |yes−no|/(yes+no) is a coin-flip
  statistic: two members voting yes score a perfect 1.0. The floor is a
  named constant, defined once, imported by every consumer, disclosed in
  copy.
- **No qualifying votes → not measured.** A group (or a day, or a chamber)
  with nothing above the floor has cohesion `null` — rendered as *not
  measured*, drawn differently from both 0 and 1. A time series that paints
  unmeasured days as perfect unity (or as zero) fabricates exactly the kind
  of pattern the chart exists to reveal.

## Aggregating upward

Per-vote indices roll up two ways, and the choice is part of the definition:

- **A group over time:** unweighted mean over its qualifying votes is the
  literature's convention; keep it, and ship the qualifying-vote count with
  the mean.
- **A chamber (all groups) per vote or per day:** weight each group's index
  by its positional-ballot count. An unweighted mean lets a four-member
  group's noisy index move the chamber figure as much as the largest party's,
  and the resulting series jumps on exactly the votes where small groups
  behaved oddly. Whichever weighting you choose, publish it as a formula the
  reader can check.

## The known blind spots — disclose, don't patch

1. **Non-voting is invisible.** A group where 20 of 100 members vote yes and
   80 stay away scores 1.0 — indistinguishable from full-turnout unanimity.
   Strategic absence is thus laundered into discipline. The remedy is not a
   modified index (variants that penalize absence exist but sacrifice
   comparability); it is publishing participation alongside cohesion so the
   reader sees the 20% turnout next to the perfect score.
2. **Small groups score high mechanically.** With few positional voters, the
   index's floor is high (an odd-sized group of 3 cannot score below 1/3),
   so small parties look disciplined by arithmetic. Cross-party cohesion
   comparisons between very different group sizes need this caveat attached,
   and per-vote floors only soften it.
3. **Unanimous-agenda inflation.** A chamber that passes most business by
   lopsided consensus gives every party a high mean. Cohesion means are
   dominated by the agenda's composition; comparing across periods or
   chambers with different agendas compares agendas as much as discipline.
   Where the analysis wants "how whipped is this party when it matters",
   filter to contested divisions — and then the filter's definition is part
   of the published method.
4. **The recorded-vote sample is curated.** Where recording a vote is itself
   a strategic request, cohesion over recorded votes need not generalize to
   voting behavior at large. State the corpus ("all recorded divisions of
   the term") and claim nothing beyond it.

## Related measures

max(yes, no)/(yes + no) — the majority share — carries the same information
on a [0.5, 1] scale and is sometimes friendlier for display ("94% voted the
line"). It is a presentation of the same fraction, not a second metric; if
both render, they derive from one tally in one function, or they will one day
disagree in public.

## When not to use it

- Not as an individual-level measure — Rice describes a group on a vote;
  member-level discipline is rebellion's job.
- Not across a vocabulary boundary (a source-side category merge) as one
  continuous series; the positional base survives such merges only if yes/no
  codes were untouched — verify before charting across the boundary.
- Not as evidence of coordination. High cohesion is consistent with whipping,
  shared ideology, or agenda selection; the index cannot distinguish them,
  and the copy must not either.
