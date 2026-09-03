---
layer: technique
type: technique
subject: build-economics
technique: declinable-capability-split
status: forged
laws: []
shared_with: []
use_when: [deciding whether an optional capability deserves its own published unit, a consumer inherits an upgrade obligation for a capability it never calls, weighing a cut the parallelism and invalidation arguments reject, choosing between a build-time gate and a separate publication unit]
---

# The declinable-capability split

[compilation-unit-splitting](./compilation-unit-splitting.md) argues a cut from
three payoffs — parallelism, a smaller invalidation frontier, a lower memory
peak — and all three are collected by the people who build the tree. Measured
against them, some cuts are obviously not worth making: a capability that
compiles in seconds, sits in a leaf, and never bottlenecks the chain buys
nothing on any of the three, and the split is correctly rejected.

There is a fourth payoff, it is collected by somebody else entirely, and it
justifies exactly those cuts. **A boundary can be drawn so that a capability
and its whole transitive tail are *absent* for a consumer rather than merely
unused.** The consumer who declines it inherits none of its upgrade
obligations, none of its licence review, none of its vulnerability surface, and
none of the advisories that will be filed against it for the next decade.

## Why this is not the same argument

The three payoffs above are denominated in the build's scarce resources and
paid to the unit's own authors. This one is denominated in **obligations** and
paid to a third party who may never build your full graph at all. That changes
what a good cut looks like:

- **The cut line follows the consumer's decision, not the change frequency.**
  The stability and directionality rules still apply — a cut through a churning
  interface is still a bad cut — but the *placement* question is answered by
  asking which capability a real consumer would want to say no to, which is a
  product question rather than a graph-shape one.
- **A tiny unit can be a correct unit.** The parallelism argument wants a wide,
  shallow graph and treats a unit too small to matter as overhead. Here, size
  is irrelevant: what matters is what travels *with* the capability. A hundred
  lines that drag in a cryptography stack, a media decoder, or a serialization
  framework are worth their own unit; a thousand lines that drag in nothing are
  not.
- **The obligation is already priced elsewhere in the corpus, on the wrong
  question.** The carrying cost of a retained dependency — its install time,
  its audit surface, its upgrade churn, its licence review — is stated in
  [carrying-cost-economics](../../../codebase-stewardship/dead-code/techniques/carrying-cost-economics.md),
  where it is an argument for *deleting the last importer*. It is the same
  ledger, and it applies just as forcefully to a boundary decision: a cut that
  moves the last importer out of the unit a consumer takes has removed the
  liability for that consumer without deleting anything.

There is a third boundary this cut can follow, and it is worth naming because
it is invisible to every build measurement: **compatibility**. A capability
with a volatile interface, published inside the same unit as a stable core,
forces the core's version to move whenever the capability's does. Split, each
side versions on its own evidence, and a consumer of the stable core stops
being dragged through releases that changed nothing it uses.

## Doing it

1. **Name the declining consumer.** Not hypothetically — the class of consumer
   that would switch the capability off, and what they get for it. If nobody
   would decline, stop here; the inversion below applies.
2. **Default to the smaller unit.** The unit a consumer takes without asking
   should be the one with the fewest obligations attached, and the capability
   should be an addition they make deliberately. A default that already
   contains everything makes the split unreachable: the obligation arrives
   before the consumer has made any choice.
3. **Sever the dependency edge, not the call site.** The whole payoff is
   absence. A cut that leaves the heavy dependency declared unconditionally has
   moved code and kept every obligation — the consumer still resolves it,
   audits it, and upgrades it. This is the same failure
   [capability-feature-gating](./capability-feature-gating.md) names for gates,
   and the verification is the same: inspect what the declining consumer's
   build graph actually contains, rather than trusting the boundary's name.
4. **Decide gate or unit, and know which you bought.** A build-time gate makes
   the capability optional for people who build *your* tree. A separate
   publication unit makes it optional for people who merely *consume* it, and
   only the second removes the obligation, because a consumer resolves what you
   declared, not what you compiled. Where both are wanted, the unit comes
   first and the gate is a convenience inside it.

## When not to use it

**When essentially every consumer enables the capability, the split buys
nothing and charges a real price.** The obligation it was meant to remove is
inherited anyway by all but a rounding error of consumers, and in exchange the
project acquires a configuration space: every combination of optional units is
a distinct thing that can compile, and almost none of them are ever built or
tested. Two failure modes follow from that and both are already owned
elsewhere — the unification hazard, where a combination assembled from what
several consumers separately asked for is a variant nobody chose, belongs to
[capability-feature-gating](./capability-feature-gating.md); the analysis
blindness, where a check that ran green saw only one configuration, belongs to
the cross-configuration section of
[gate-laddering](../../../standards-and-gates/quality-gates/techniques/gate-laddering.md).
Neither is restated here; both are reasons this inversion is expensive rather
than merely unrewarding.

The honest test before cutting: **name the consumer who declines, and say what
they stop inheriting.** If the answer is a hypothetical consumer and a
capability everyone uses, the boundary is decoration and the three payoffs of
[compilation-unit-splitting](./compilation-unit-splitting.md) — which are
measurable — are the arguments that should decide the cut instead.
