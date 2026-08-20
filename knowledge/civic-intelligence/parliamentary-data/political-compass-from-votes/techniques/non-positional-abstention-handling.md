---
layer: technique
type: technique
subject: political-compass-from-votes
technique: non-positional-abstention-handling
status: forged
laws: [missing-is-not-zero, disclose-never-repair]
shared_with: []
use_when: [deciding how abstentions and absences enter an alignment score, mapping a chamber's ballot states to scoring buckets, reviewing a match formula for manufactured positions]
---

# Non-positional abstention handling

Every roll call yields more ballot states than "yes" and "no": abstained,
present but not voting, not signed in, excused. A match score is a rate, and a
rate has two slots — numerator and denominator — so every ballot state must be
assigned to exactly one of three fates: counts as agreement, counts as
disagreement, or **enters neither slot**. This technique is the discipline of
that assignment, and its rule is short: **only a positional ballot — an actual
yes or no — may move a score, in either direction.**

## The bucket model

Partition every ballot state the chamber can produce into three buckets:

- **Positional** — yes / no. The only bucket that scores. A positional ballot
  on an answered question increments the denominator; it increments the
  numerator when it matches the citizen's stance.
- **Non-positional presence** — abstained, present-not-voting. The
  representative was there and declined to take a side. Never in the
  numerator, never in the denominator.
- **Absence** — not signed in, excused. No information at all.

The partition is per-chamber and must follow the chamber's *own procedure*,
not the designer's intuition. Some chambers' rules make abstaining and
present-not-voting formally identical in effect; where the procedure merges
them, the model merges them and says so, rather than inventing a distinction
the record cannot support. Where the procedure distinguishes them, keep them
apart in display — "declined to take a side" and "was not there" are different
facts about a named person, even though both score identically as nothing.

## Why not score them — the three wrong answers

Designs that force non-positional states into the score all fabricate, each in
its own way:

- **Abstention as disagreement.** The most common shortcut ("didn't vote yes
  = voted against me" — or its procedural cousin, "an abstention works like a
  no in this chamber, so score it as no"). Effect-on-the-motion and
  position-of-the-person are different claims; a citizen match asserts the
  second. This shortcut systematically manufactures opposition and always
  punishes the same behaviors: principled abstention, conflict-of-interest
  recusal, illness.
- **Abstention as a midpoint.** Questionnaire tools often score a "no
  opinion" answer as the scale's center. Transplanted to the record this
  invents a centrist position the representative never expressed — a
  fabricated value with extra steps.
- **Abstention silently dropped, absence silently scored** (or any other
  asymmetric mix). Inconsistent bucketing is worse than a wrong-but-stated
  rule, because it cannot even be disclosed coherently.

The common root is one law: a missing position is not a zero-valued position.
An absent value is a different fact from a measured one, and no arithmetic may
quietly convert the first into the second.

## Nothing hides: the counts render

Excluding non-positional states from the rate does not mean excluding them
from the page. Beside every rate, show the full accounting for that entity
over the citizen's answered questions: comparable N, matches N, non-positional
N, absent N. This is what keeps the exclusion honest in both directions — a
representative cannot launder chronic absence into a pristine rate built on
three ballots (the comparability floor consumes these same counts), and the
citizen can see *why* an entity has little to compare. The buckets are
disclosed, never repaired into a score.

## Group lines inherit the rule

A group's position on a vote — its line — derives from the strict majority of
its members' *positional* ballots only. Abstentions do not dilute the line's
majority and absences do not count against it; a group whose positional
ballots tie has no line, and the vote is non-comparable for the group. Letting
non-positional states into line derivation smuggles the same fabrication in
through the aggregate door after the individual door was locked.

## When not to use this

- **When abstention itself is the story.** A feature about participation or
  discipline *should* measure non-positional behavior — as its own metric
  with its own denominator, never folded into an agreement rate.
- **When the source cannot distinguish states.** If ingestion collapses
  everything to "voted / didn't", say so and model the second as absence;
  do not reconstruct abstentions the data does not hold.
