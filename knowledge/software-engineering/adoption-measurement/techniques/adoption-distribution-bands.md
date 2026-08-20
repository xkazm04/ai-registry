---
layer: technique
type: technique
subject: adoption-measurement
technique: adoption-distribution-bands
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [reporting how far a practice has spread, an adoption headline rate is being requested, deciding whether an enablement push should target spread or depth]
---

# Adoption distribution bands

## The concern

A single adoption rate collapses the only structure that tells you what to do
next. Spread and depth are independent axes — a practice can be everywhere
and shallow, or deep in a corner and nowhere else — and a mean over the
population maps both shapes to the same number. Worse, the mean is dominated
by whichever handful of units generate the most volume, so a single
enthusiastic team can carry an organization's headline figure while the
practice is inert everywhere else.

The unit of report is therefore a **distribution over named bands across a
stated eligible population**, and the headline rate, if one is published at
all, is derived from it rather than the other way round.

## The band ladder

Four bands cover almost every practice, and the names should describe
behaviour, not sentiment:

- **untouched** — eligible, zero qualifying use.
- **tried** — at least one qualifying use, below the routine threshold. A
  band that must exist: without it, the first touch counts as full adoption
  and the report becomes activation theatre.
- **routine** — qualifying use at a stated cadence over a stated window.
- **embedded** — routine use plus a structural signal that the practice
  survives its champion: it appears in the unit's own defaults, templates,
  checks, or onboarding.

The ladder is one vocabulary with one definition
(`one-authority-per-vocabulary`); a producer and a dashboard that each hold
their own cutoffs will diverge on the day someone tunes one of them.

## The procedure

1. **Define the eligible population first, and state it.** Eligibility is a
   judgment: which units could reasonably adopt this practice at all. A
   review standard for services does not apply to a documentation repository.
   Two rules make it honest — the eligibility predicate is written down, and
   the denominator is versioned so a rate cannot rise because the population
   was quietly narrowed. Every published rate carries its denominator and its
   predicate (`count-carries-predicate`).
2. **Choose cutoffs from the practice's natural cadence, not from round
   numbers.** A practice exercised once per release cycle and one exercised
   per commit cannot share a "weekly active" threshold. Derive the routine
   threshold from the cadence at which the practice is supposed to occur, and
   record the derivation beside the number.
3. **Place every eligible unit in exactly one band, including the zeros.**
   The untouched band is the most informative one and it is the one that
   vanishes if you only report over observed rows. Enumerate the population
   and fill in zeros; absence of a row must never be how "not adopted" is
   expressed.
4. **Report the shape, then the summary.** Publish the band counts. If a
   scalar is needed for a trend line, publish *two*: spread (fraction not in
   untouched) and depth (fraction in routine or embedded). One number cannot
   carry both.
5. **Show concentration.** State what fraction of total qualifying activity
   comes from the top unit and the top decile. A high concentration is a
   finding in itself: the practice has a champion, not an adoption.

## Reading the shape

- **Wide and shallow** — high spread, low depth, low concentration. The
  practice is discoverable and reachable but not sticky. The lever is depth:
  friction in the routine path, or a practice that does not pay off on the
  second use.
- **Narrow and deep** — low spread, high depth, high concentration. It works
  for those who use it. The lever is spread: awareness, eligibility clarity,
  onboarding — not more features for the incumbents.
- **Bimodal** — a full untouched band and a full embedded band with an empty
  middle. Usually two sub-populations with different eligibility. Split the
  denominator before acting; a single lever will be wrong for one half.
- **Regressing depth with flat spread** — units are sliding from routine to
  tried. This is the earliest honest warning that a rollout is failing, and a
  headline rate will not show it for months.

## Decision rules

- If the eligible population is below the corpus's minimum sample floor for
  reported rates, publish band counts and suppress the percentage. Four of
  six is not 67%.
- If nothing in the population has been assessed yet, the rate is *absent*,
  not zero. A tile that renders 0% for an unmeasured population makes the
  strongest possible negative claim on the weakest possible evidence, and the
  program will spend a quarter answering for it. Render the empty state with
  the reason.
- If the practice applies per unit *and* per instance — a standard that a
  service may adopt in some of its components — the countable population is
  the pair, not the unit. Count qualifying pairs over scored pairs, and
  publish separately how many units could adopt at least one instance; a
  unit-level rate over a pair-level practice is unreadable in both
  directions.
- If two bands' cutoffs are changed, the series is a new series. Re-band the
  history or break the trend line visibly; never let a threshold change
  render as movement.
- If a unit's placement depends on a signal from a weaker provenance tier
  than the band claims, the band is capped at what the tier supports —
  a declared-tier signal can place a unit out of *untouched* only if the band
  definition explicitly admits entitlement, which it normally should not.
- If the top unit contributes more than half of all activity, the headline
  rate is not reportable without the concentration figure beside it.

## When not to use this

- **Not for a practice with a single, one-time adoption act.** Where adopting
  means flipping a setting once and it stays flipped, depth is meaningless
  and a binary coverage figure over the stated population is the honest
  report. Forcing four bands onto a binary fact invents structure.
- **Not as a per-person ladder.** Banding *people* by depth of practice use
  is a ranking of identifiable humans and falls under the people-ethics
  subject's floors and framing test before it may exist at all. Band units
  of work — teams, services, repositories — by default.
- **Not for cross-organization comparison** without identical eligibility
  predicates and identical cutoffs. Bands are cheap to compare and almost
  never comparable.
