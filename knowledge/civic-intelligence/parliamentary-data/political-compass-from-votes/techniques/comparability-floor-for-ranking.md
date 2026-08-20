---
layer: technique
type: technique
subject: political-compass-from-votes
technique: comparability-floor-for-ranking
status: forged
laws: [missing-is-not-zero, non-partisan-symmetry]
shared_with: []
use_when: [deciding who may appear on a ranked match board, handling thin-overlap representatives, setting minimum-answer thresholds before results render]
---

# Comparability floor for ranking

A ranked board is the compass's strongest claim: it asserts that the person at
rank 1 matches the citizen *more than* the person at rank 40. That claim needs
comparable evidence behind every row. But the record guarantees unequal
evidence — a representative who entered mid-term, one chronically absent, one
who abstains on principle — so two rates on the same board can rest on twenty
ballots and on two. A 100% rate over two ballots outranking a 78% rate over
nineteen is not a finding; it is small-sample noise wearing a medal. The floor
is the rule that decides who may be *ordered* at all.

## The rule

An entity is **rankable** when it cast positional ballots on at least half of
the questions the citizen answered — ⌈answered / 2⌉ — where "positional"
comes from the abstention model (non-positional states never count toward the
floor, because the floor is measuring evidence, and they carry none).

Three properties make this shape right:

- **Relative, not absolute.** A fixed floor ("at least 5 ballots") changes
  meaning as the citizen answers more or fewer questions; a majority-of-
  answered floor scales with the actual comparison being made. It also gives
  the floor a plain-language reading the disclosed rule can print: *ranked
  entities took a side on at least half of what you answered.*
- **Two-sided by construction.** The same floor governs every entity of a
  kind — no exemptions for incumbency, prominence, or party. Symmetry is what
  distinguishes a data-quality floor from a shortlist.
- **Cheap to verify.** The floor consumes counts the score already computes
  and displays; a reader can recheck any row's eligibility from the page.

## Below the floor: shown, not ranked, not hidden

The floor splits the board into a ranked section and an explicitly labeled
non-comparable tail — it never deletes anyone. Entities below the floor still
render with everything computable: their rate where the denominator is
nonzero, their full bucket counts always. Two failure directions this
prevents:

- **Hiding the thin** reads as a shortlist — the tool decided some named
  people are not worth showing, which is an editorial act and, for the
  chronically absent, an undeserved amnesty: absence *is* the story for that
  row, and the tail is where it gets told.
- **Ranking the thin** poisons the ordering itself, and the damage is
  asymmetric by rate: thin samples produce extreme rates, so the noise
  concentrates at the exact top of the board where attention concentrates.

Within the tail, order by the same cascade as the ranked section — the tail
has an order for layout stability, and the disclosed rule says the order
asserts nothing.

## The other floor: minimum answers

Comparability has a citizen-side twin. Below a handful of answered questions
— three is a defensible published minimum — no result renders at all: with
one answer, every entity is either 100% or 0%, and the board is a coin-flip
generator with names on it. Ask for more answers instead of showing a result
that the tool itself knows is meaningless. This is cheaper than every
alternative dressing (confidence intervals, softened copy): the honest output
of a two-answer session is no output.

## Tie-breaks under the floor

The full ordering cascade, disclosed: rankable before non-rankable; then rate
descending; then **more comparable ballots first** — between equal rates, the
better-evidenced one leads, which also gives thin-but-rankable rows their
correct gentle demotion; then a fixed name collation as a stability tie-break
the rule explicitly calls meaningless.

## When not to use this

- **As a substitute for the abstention model.** The floor assumes buckets are
  already honest; a floor over a score that counts abstentions as
  disagreement ranks fabrications confidently.
- **For single-entity views.** A profile page comparing the citizen to one
  named representative needs the counts and a plain statement of thinness,
  not eligibility logic — the floor guards *ordering*, and a profile orders
  nothing.
- **Tuning it per release.** The floor is part of the published methodology;
  moving it reshuffles who appears ranked and must be a visible methodology
  change, not a quiet constant edit.
