---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: per-tier-budget-tables
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [adding a visual effect that has a count or complexity knob, a global fidelity change would otherwise touch every component, deciding what the lowest tier of an effect looks like, deciding which effects are obliged to consult the tier at all]
---

# Per-tier budget tables

The tier is one small ordinal value. Its *meaning* is not stored with the
tier — it is stored with each effect, as a small table mapping tier to that
effect's own parameters, living beside the effect's implementation.

## Why the meaning belongs to the effect

The tempting alternative is a central registry: one place declaring what
the reduced tier means for particles, for blur, for parallax, for
everything. It fails for a reason that is easy to state and easy to
rediscover the hard way. **What a tier costs is a fact about the effect, not
about the tier.** Only the effect's author knows that its cost is
superlinear in instance count and nearly flat in radius, or that its second
gradient pass costs more than everything else combined. A central table
forces that knowledge into a file the author does not own, does not read,
and will not update; six months later the registry describes the effects as
they were when someone last had a free afternoon.

The central registry also imposes a coordination cost forever: adding an
effect means editing a shared file, which means a merge conflict on every
concurrent effect, for a mapping with exactly one consumer.

What *is* shared is the **tier vocabulary itself** — the ordered set of tier
names, defined once and imported by every table. This is
[one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
an effect that invents local names for its own quality levels has created a
second vocabulary and a mapping between them, and the mapping drifts the
day a rung is added.

## Which effects owe a table

Not all of them, and a rule that says otherwise defeats itself. If every
animated element in the product subscribes to the tier, a hundred cheap
composited fades acquire a subscription apiece and the tier becomes one of
the more expensive things on the page — the adaptation costing more than
what it adapts, which is the same failure the settle budget exists to
prevent.

**The obligation is graded by how much the effect costs, and the grades are
three.** An effect that drives its own clock — a per-frame loop, a canvas,
a simulation — *must* carry a table, because its cost is unbounded in a
parameter it chose. An effect that is cheap per frame but forces expensive
compositing — a large blur, a full-surface gradient, a blend mode, a
parallax layer — *should* carry one, because its cost is real but fixed and
often the honest table has two rows. An effect that is a small composited
transition on a property the compositor already handles is *exempt*: it
costs less than the read that would consult the tier.

Which class a given effect falls into is a question about the cost of
gestures, and the cost-class taxonomy belongs to the motion system, not
here. What belongs here is the consequence: the tier system publishes an
obligation per class, so "does this new effect need a table?" is answered by
looking up its class rather than by each author's estimate of their own
work — and authors estimate their own work generously.

## A guideline ratio, with per-effect values

A useful hybrid sits between the central registry this technique rejects
and pure per-effect autonomy: the tier vocabulary may publish a **rough
degradation ratio** — the reduced tier lands near half to two-thirds of
full, the floor near a third or a designed static fallback — while every
actual number stays in the effect's own table. The ratio is not enforced
and does not compute anything; it is a review aid, and its job is to make
an outlier visible. A table whose reduced row is ninety percent of full has
not been budgeted, and a table whose reduced row is five percent has
skipped a rung — both are obvious against a published ratio and invisible
without one.

## What the shape buys

- **A global correction is one constant.** "The reduced tier was still too
  generous" is a threshold edit in the measurement, and every effect
  re-reads its own row without a single component being touched. This is
  the change the system will actually need, repeatedly, and it should be
  the cheapest one available.
- **The cost of a tier is enumerable.** "What does the floor tier look
  like?" is answered by reading the tables, not by finding a slow laptop
  and squinting at it. A reviewer can see the whole degradation story of
  the product in a few minutes.
- **An effect cannot forget the tier.** If the table is the only way the
  effect obtains its parameter, an effect written without a tier row does
  not render at all. The tier stops being something an author must remember
  to consult and becomes something they cannot avoid.
- **A new rung is a mechanical sweep.** Adding a tier makes every table
  incomplete at once, in a way a type system or a lint rule can point at,
  rather than silently falling through to a default in the effects nobody
  remembered.

## Rules for the table

**Read at render, never captured at mount.** An effect that reads the tier
once into initial state is immune to every transition the system produces —
a defect that presents as "the adaptive system does nothing" and survives
review because the code visibly consults the tier. The read happens where
the parameter is used.

**Rows are the effect's parameters, not a switch for the effect.** A table
of on/off values has smuggled the existence question into a place that
cannot express degradation, and a boolean is what an author writes when
they have not yet thought about the middle rung. Prefer a number the effect
scales by: instance count, radius, layer depth, update interval, sample
count, opacity ceiling. A genuinely discrete *sub-part* — a second pass, an
extra overlay layer that is present at the top tier and absent below it —
may be a boolean row of its own; what must not exist is a single boolean
row standing for the whole effect.

**The floor row may be a reduction rather than an absence.** The naive
table ends in zero, and for some effects that is right. For others the
effect carries structure, grounds a layout, or provides the only visual
continuity between two states, and deleting it at the floor produces a
surface nobody designed — the product then has two designs and only one of
them was drawn. The table must therefore be able to express a floor: fewer
instances, a slower period, one layer instead of three, a smaller radius.
*Whether a given effect is permitted to reach zero at all* is a
motion-system question about what the gesture carries, and it is not
answered here; this technique only insists that "zero" be a value the
author chose rather than the shape the table forced on them.

**Scale the parameter that actually costs.** Halving an instance count is a
real saving; halving an instance count while keeping a full-surface blur
saves nothing, because the blur was the cost. Each table should be able to
name, in one line, which of its rows is load-bearing — and if the author
cannot, the effect has not been profiled and the table is decoration.

**Tier changes produce new parameters, not new elements.** The effect keeps
its instances and gives them different values, or crossfades between
configurations. Remounting a dozen effects in one frame, on a device that
just failed a frame, makes the correction itself the next jank event. There
is a construction that makes this free: **allocate once from the table's
top row and take every lower tier as a prefix of that allocation.** Build
the full set of instances at the maximum the table declares, and let the
tier decide how many of them are drawn. A downgrade then frees nothing, an
upgrade allocates nothing, and a transition costs a bounds change — the
per-frame saving is real because the loop is shorter, while the transition
itself does no work at all.

**A row may govern a one-time cost, not only a per-frame one.** The
measurement is of frame time, but the tier it produces is a fair proxy for
whether the device can afford a large texture to download and decode, an
element promoted to its own compositor layer by a blend mode or a mask, or
a heavyweight resource fetched for decoration. These are exactly the costs
whose reasoning only the effect's author holds — that *this* mask plus
*that* blend mode force a separate layer is not derivable from anywhere
else — which is the strongest argument for the meaning living beside the
effect. State the reason in the table's neighbourhood, because a reviewer
who does not know why the floor row is zero will eventually restore it.

## The table is also the audit surface

Because every table is small, local, and keyed by one shared vocabulary,
the set of them answers questions that are otherwise expensive: how many
effects still run at the floor, which effect is the most expensive thing a
low-tier device is asked to draw, and whether any effect has quietly given
itself the same parameters at every rung — which means it is not adaptive
at all and either needs a real budget or does not belong in the system.
Doing that sweep once a release is cheap and it is the only thing that
keeps a fidelity system from decaying into a value nobody reads.

## When not to use this

One effect with one knob does not need a table; it needs a conditional and
a comment. The table shape earns itself at the point where several effects
share a tier, because that is where the per-component edit cost of a global
correction starts to dominate. And an effect whose cost is genuinely
constant regardless of parameters should not have a table at all — a row of
identical values is a claim of adaptivity that the code does not honour.
