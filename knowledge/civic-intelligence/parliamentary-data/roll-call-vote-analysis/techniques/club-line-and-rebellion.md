---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: club-line-and-rebellion
status: forged
laws: [deterministic-code-owns-numbers, missing-is-not-zero, every-cap-ships-its-population]
shared_with: []
use_when: [computing a party line from ballots, ranking legislators by defiance, labeling a vote as against the party]
---

# Club line and rebellion

"Voted against their party" presupposes that the party had a position — and
ballot-only sources need not publish a whip instruction. The party line is *derived*,
per vote, per parliamentary group, from the ballots themselves, and every
rebellion claim inherits the derivation's rules. Getting this wrong is the
fastest route to defaming a named person, because "rebel" is the single most
quotable output of roll-call analysis.

## Deriving the line

For each non-voided division and each group:

1. Resolve group membership at the time of the division, then take the group's **positional** ballots only (yes/no — see
   positional-vs-participation-bases). Abstentions and absences shape no line.
2. The line is the **strict majority** position among those ballots.
3. **A tie yields no line, and the vote is skipped for that group.** Not a
   line of "yes" by some tiebreaker, not a half-weight observation — skipped.
   An evenly split party expressed no collective position, and any tiebreak
   rule invents one. This also protects the metric's symmetry: a tiebreak
   that favors the government position (or the motion, or "yes") would bias
   every party's rebellion rate in a direction someone chose.

The strict-majority definition is deliberately the *simplest defensible* one.
Richer definitions exist — whip notifications, leadership statements,
super-majority lines — but they require data most sources do not publish.
When you must derive the line from ballots alone, say so in the copy: the
line is "the majority of the group's yes/no votes on this division", stated
verbatim where the rebellion numbers render, so the reader can disagree with
the definition rather than the data.

Note what the definition implies at small sizes: a "line" of a two-member
group is one member outvoting nothing, and a lone remaining voter *is* the
line. A member-level eligibility floor does not prevent repeatedly thin group lines.
Declare a separate per-division line-support rule using positional count and,
where available, eligible group size; report exclusions. State whether the
member being scored is included in line derivation. A leave-one-out definition
is a different method. Per-vote displays show the tally and eligible membership.

## Counting rebellion

A member's rebellion observations are the divisions where:

- the vote is valid (voided divisions are excluded from every discipline
  metric — a division the chamber itself annulled measures nothing), and
- the member cast a positional ballot, and
- the member's group had a non-tied line.

These are the member's **eligible votes**. A rebellion is an eligible vote
where the member's position opposes the line. The rate is rebellions over
eligible votes — and the denominator ships with the rate, always, because
"12% of 340" and "12% of 8" are different claims.

Decision rules:

- **Publish no rate below a minimum-eligibility floor.** A member with a
  handful of eligible votes — newly sworn in, long ill, recently defected —
  gets *not measured*, not a rate. Fifty eligible votes is an example
  policy for a multi-year term, not a validated reliability threshold. Choose
  and disclose the floor, and assess sensitivity to repeated bills and agenda
  concentration as well as raw count.
- **Separate the measurement floor from the presentation cap.** Everyone
  above the floor belongs to the ranking's population even if the page shows
  only the top N rows; the population count is taken *before* the slice and
  rendered with it. Without it, "the 12 most rebellious of 197 measured"
  reads as "only 12 ever rebelled".
- **Members without a resolved group are never scored.** No group, no line,
  no rebellion — they appear in tallies and attendance but not in discipline
  metrics, and the count of such members is disclosed rather than silently
  absorbed.
- **A rebellion is a ballot fact, not a motive.** The chronicle of a member's
  rebellions may list each division with its tally and line; it must not
  promote the pattern to "defecting to the opposition" or "voting with party
  X" — cross-party coincidence is the agreement matrix's job, and the story
  is the interpretive layer's, gated separately.

## Ordering and determinism

Rankings need total, deterministic order: rate, then absolute rebellion
count, then a stable name/id tiebreak. An unordered or partially ordered
ranking re-shuffles equal-rate members between builds, and a member who moves
from row 11 to row 13 between two publishes will reasonably ask why the
method is unstable. Every sort in the pipeline ends in a unique key.

## When not to use it

- Not for free-vote divisions (conscience votes) where the group formally
  declared no line — if the source or the record lets you identify them,
  exclude them and say so; a derived "line" on a declared free vote is a
  fiction. Absent such data, this is a known limitation to disclose, not to
  model away.
- Not across group changes without care: a member who switched groups
  mid-term has per-group rebellion records, and relabeling them with current membership scores old votes against the wrong
  group. A member-level rollup is possible after each division is scored
  against its contemporaneous group; disclose the group-specific components.
