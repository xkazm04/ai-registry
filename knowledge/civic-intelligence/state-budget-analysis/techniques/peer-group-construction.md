---
layer: technique
type: technique
subject: state-budget-analysis
technique: peer-group-construction
status: forged
laws: [one-definition-one-import, non-partisan-symmetry]
shared_with: []
use_when:
  - deciding which municipalities a town may be compared against
  - a "vs. similar towns" figure is about to render
---

# Peer-group construction

"Similar towns" is the load-bearing phrase of every budget comparison, and it
must be an executable rule, not a curator's list. A hand-picked peer set is the
oldest trick in consulting: choose the comparators and you choose the verdict.
The technique replaces the curator with a published, deterministic derivation
that treats every municipality in the country identically — the comparison
covers the whole population or it is an editorial act
([non-partisan-symmetry](../../_laws.md#non-partisan-symmetry)).

## The rule shape

A peer group is derived from a municipality's structural attributes, in a fixed
order of precedence:

1. **Size class first.** Bucket the full national registry into population
   bands. Do not invent the bands: use the size categories the country's
   statistical or finance authority already publishes, so the grouping is an
   external standard the analyst merely adopted, not a knob the analyst tuned.
   Band boundaries are half-open (lower bound inclusive, upper exclusive) and
   the top band is unbounded — off-by-one at a boundary silently moves a town
   between benchmarks.
2. **Geography second.** Within the band, prefer the town's own region: shared
   cost structures, shared transfer regimes, shared labor markets. Geography
   *refines* the size class; it never replaces it. A regional group spanning
   size classes compares a district capital to hamlets and is worse than no
   geography at all.
3. **Coverage gates membership.** Only municipalities that actually have a
   reported figure series can serve as peers — a peer with no numbers can
   contribute nothing to a median, and carrying it in the group only inflates
   the apparent sample. Pass the covered-set explicitly; do not let the group
   builder guess coverage from side effects.
4. **The town itself is excluded.** A municipality is never its own peer; a
   self-inclusive group biases every median toward the subject.

The derivation is a pure function over (town, registry, covered-set). Same
inputs, same group, always: registry order is preserved by stable filtering, no
sampling, no randomness. Determinism is what makes the published rule
*checkable* — a reader who re-runs the rule must get the same peers.

## Publish the rule, from the single definition

The rule the surface prints and the rule the code executes must be the same
text from the same module ([one-definition-one-import](../../_laws.md#one-definition-one-import)).
The decay mode is specific: the comparison logic lives in one place, a
prose description of it lives in the page copy, and after two revisions they
describe different rules — at which point the product is lying about its own
method. Export the rule text from the module that implements it, and let every
surface import both together.

Alongside the rule, always render the *result* of the rule: the band label, the
scope that ended up applying (regional or widened), and the peer count. The
count is not decoration — see the sibling technique on small samples — but it
is also disclosure: "compared against 7 towns of 2,000–4,999 residents in the
region" is a claim a reader can audit; "compared against similar towns" is not.

## Decision rules

- When an official size-classification exists, adopt it verbatim; when several
  exist, pick the one used by the fiscal reporting authority and cite it.
- When a town sits exactly on a band boundary, the half-open convention
  decides; never special-case individual towns.
- When coverage is partial (a bounded ingest batch), the covered-set shrinks
  the peer group — say so on the surface rather than treating the batch as the
  country.
- When the group's structural attributes change (a town's population crosses a
  band boundary between periods), the group changes with it; do not pin peer
  groups across periods for continuity's sake, but do recompute them from the
  period's own population figures.

## When not to use it

Do not use population-band peers for metrics driven by mandate rather than
size: a town that runs its own transit utility or hospital is structurally
unlike its size peers for those spending lines, and the honest move is to
compare only mandate-comparable figures (which consolidation helps isolate) or
to say the comparison does not apply. And do not use derived peer groups as an
anomaly *verdict* — "worst in its peer group" is a lead for a human to examine,
never a published finding on its own.
