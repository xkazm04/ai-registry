---
layer: technique
type: technique
subject: state-budget-analysis
technique: small-sample-widening
status: forged
laws: [every-cap-ships-its-population, incident-anchored-doctrine]
shared_with: []
use_when:
  - a derived peer group comes back with only a handful of members
  - deciding the fallback when the preferred comparison group is too small
---

# Small-sample widening

Deterministic peer rules have a failure mode their hand-picked predecessors
never advertised: sometimes the rule returns two towns. A region may hold only
a couple of municipalities in a given size class, and a "peer median" over them
is a statement about two specific towns dressed as a statement about a
population. The naive escapes are all worse than the disease: silently padding
the group with near-misses (an unpublished rule), comparing anyway (an
anecdote as benchmark), or hiding the comparison (coverage theater). The
technique is a *published fallback ladder*: when the preferred group is too
small, widen along one declared axis, and tell the reader which rung applied.

## The procedure

1. **Fix a minimum group size, in the open.** Five is a defensible floor: below
   it a median is decided by at most two towns' values. Whatever the number,
   it is a named constant in the same module as the grouping rule, printed in
   the published rule text — not a magic literal three call sites deep.
2. **Widen along the axis that preserves comparability.** Of the two grouping
   attributes — size class and geography — geography is the one to sacrifice:
   towns of the same size class nationwide are more comparable than towns of
   assorted sizes nearby, because the size class drives the cost structure the
   comparison is about. So the ladder is: same band + same region → same band,
   national. Never the reverse; never both loosened at once.
3. **Record which rung applied.** The group carries its scope as data — "regional"
   or "widened to national" — and the surface renders it. A reader comparing
   their town against a national cohort should not believe it is a regional one.
4. **Accept that the ladder can end short.** The top size class of any country
   holds a handful of cities — in one national registry, exactly four — and no
   widening rule can conjure more. The response is disclosure, not invention:
   the peer count renders *always*, on every comparison, not only when it is
   embarrassing ([every-cap-ships-its-population](../../_laws.md#every-cap-ships-its-population)).
   A count that appears only for small groups teaches readers that its absence
   means "plenty", which is a claim nobody verified.

The rationale belongs next to the constant. The reason for the floor is not
statistical pedantry, it is a concrete failure: a median over two towns makes
a published claim about two identifiable municipalities — a small-sample
median can defame with extra steps. Write that sentence where the constant
lives, so the next maintainer inherits the incident and not just the number
([incident-anchored-doctrine](../../_laws.md#incident-anchored-doctrine)).

## Decision rules

- When the regional group has exactly the minimum, use it — the floor is
  inclusive; re-litigating boundary cases per town reintroduces curation.
- When even the national group is below the floor, still show the comparison
  *with its count prominent* rather than suppress it: for the largest cities
  the four-town cohort is genuinely the entire population of comparable
  bodies, and a census of four is honest where a sample of four is not. Label
  it as what it is.
- When widening changes the group between periods (a region gains a town of
  the right size), let it — the rule is the invariant, not the roster.
- When a consumer needs a *sub*-comparison over the same peers (a specific
  spending line reported by fewer of them), the floor applies again to the
  effective sample, not the nominal group.

## When not to use it

Do not widen along unpublished similarity axes ("towns that feel comparable"),
and do not widen *across the size classification* — a band boundary crossed for
sample size silently converts the benchmark into the adjacent class's
benchmark. Do not use widening to rescue metrics that are structurally
regional (transfer-regime-dependent revenue lines differ by geography in ways
a national cohort erases; for those, a small regional group with its count
shown beats a large incomparable one). And this technique governs comparison
groups only — never apply the widening move to evidence populations, where
"we widened until we found matches" is the definition of a fishing expedition.
