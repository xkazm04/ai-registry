---
layer: technique
type: technique
subject: game-economy-tuning
technique: structural-economy-simulation-before-numbers
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [before the first tuning pass on an economy with loops or conversions, a tuned economy keeps breaking in a new place after every fix, deciding whether a problem is a coefficient or a shape]
---

# Walking the structure before choosing any number

The named concern: **whether the shape of the economy is stable before anybody argues
about its coefficients.** The procedure is to set every rate in the node map to one unit
per step, fire every node once per step, take the randomness out, run it for enough steps
to traverse the longest loop several times, and watch what each pool does. It takes an
afternoon, it produces no tuning, and it is the cheapest way to find the class of defect
that tuning cannot repair.

The signature failure it prevents is specific and common enough to be worth stating
plainly: a team tunes rates for weeks against an economy whose structure guarantees
runaway, and every band passes the whole time. Each band is a statement about a window;
divergence is a statement about a trajectory. A structure that doubles a pool every ten
hours is inside every band that was measured over one hour, at every progression point
anybody sampled, right up until the pool is meaningless.

## Why unit rates

Real rates hide structure. With authored magnitudes in place, a divergent loop and a
convergent one both produce a plausible-looking curve over a short run, and the eye
attributes the difference to the numbers, which is exactly the wrong attribution. Setting
every rate to one strips the magnitudes out and leaves only the topology, so the
trajectory that appears is the structure's own. **A pool that diverges at unit rates
diverges at every set of rates that preserves the loop; only the date changes.** That
sentence is the entire value of the technique, and it is why the walk is done first
rather than as a sanity check afterwards.

Determinism serves the same end. Remove the randomness, or replace each stochastic draw
by its expected value, and fire every node on a fixed schedule. What is left is
reproducible, so a change to the structure produces a visible change in the trajectory
rather than a change that might have been noise. A structure whose behaviour flips
between runs once variance is restored is itself a finding — it means the economy's
outcome depends on the tails and not on the means, and that goes to the stochastic
simulation with a note, not into a tuning pass.

## Procedure

1. **Take the node map and the loop list as inputs.** The walk is over a named topology;
   an unclassified node makes the trajectory it participates in uninterpretable.
2. **Set every flow rate to one unit per step and every conversion ratio to one for one.**
   Keep the structure — which node feeds which, which pool caps, which flow is gated on a
   pool being non-empty — and discard every authored magnitude.
3. **Choose a step count from the longest loop's latency**, not from the play horizon. Run
   for at least five full traversals of the slowest loop; fewer and a slow divergence is
   still inside its initial transient.
4. **Record every pool's level at every step** and classify each trajectory: *stable* —
   settles at a level; *converging* — approaches a level and stays; *oscillating* —
   swings without settling; *divergent* — grows or collapses without bound; *starved* — a
   pool that never receives, or a flow that never fires because its input pool is always
   empty.
5. **Attach the basis to every result.** The verdict is "at unit rates, deterministic,
   over N steps" and nothing else; a trajectory reported without that basis will be
   quoted next quarter as if it were a balance verdict.
6. **Report structural findings, not health.** Divergent pools, starved flows,
   oscillations, and unreachable drains — a drain the walk never fires is a drain the
   design believes in and the structure does not have. Every one of these is a repair to
   the topology, and none of them is fixed by a coefficient.

## What it hands to the numeric work

The walk is not a verdict, and its output is not a tuned economy. What it produces is the
input the numeric work needs and usually does not have:

The **set of pools that need a band at all** — a pool that is structurally stable at unit
rates needs a band only for feel; a pool that diverges needs a structural repair before a
band means anything. The **horizon the numeric simulation must cover**, taken from the
number of steps at which divergence became visible, which is the honest answer to "how
long do we have to simulate before this shows up" and is otherwise guessed. The
**candidate levers for a sensitivity sweep**, because a loop the walk showed to dominate
the trajectory is where the swing will be, and a sweep seeded from the structure finds it
in one run rather than thirty. And the **list of drains the design believes in that the
structure cannot reach**, which is routinely the highest-value finding of the whole
exercise and is invisible to every check computed from authored rates.

**A structural walk never returns "balanced".** It returns "structurally stable at unit
rates", which is a strictly weaker claim and must render as a strictly weaker claim
everywhere downstream. Structural proof is necessary and it is never sufficient: a stable
shape with catastrophic magnitudes is a broken economy, and a report that lets the
structural pass stand in for the numeric one has manufactured exactly the false green the
whole discipline exists to prevent.

## Decision rules

- **When a pool diverges at unit rates, stop and repair the topology.** Adding a drain,
  capping a pool, breaking a loop or rate-limiting a converter are structural repairs;
  lowering a coefficient is not one, and it buys time in exchange for making the eventual
  failure arrive at a progression point nobody is testing.
- **When a trajectory oscillates, look at loop latency before loop gain.** Oscillation is
  the signature of a balancing loop whose correction arrives after the state it was
  correcting has already moved, and shortening the delay fixes it where weakening the
  loop only lowers the amplitude.
- **When a drain never fires in the walk, treat it as absent from the economy** until its
  gating condition is repaired. A drain that requires a pool the structure never fills is
  a design document entry, not a drain, and it has been inflating the specification's
  credibility for as long as it has been listed.
- **When the walk's result changes once variance is restored, report the sensitivity to
  variance rather than picking whichever run you preferred.** An economy whose stability
  depends on the tails is a real finding and belongs to the stochastic model.
- **When the structure is stable and the team still reports the economy breaking, believe
  the team and go to the numbers.** The walk has done its job by excluding a whole class
  of cause; that exclusion is worth as much as a positive finding, because it retires the
  most expensive hypothesis first.
- **When a structural repair is rejected for design reasons, record it as an accepted
  structural deviation with the horizon at which it bites.** A knowingly divergent economy
  with a stated expiry is a decision; an unmarked one is a countdown.

## When not to use this

- **On an economy with no loops and one currency.** A straight chain from sources through
  drains has a trajectory that is a straight line, and the walk will faithfully report
  it. Go directly to enumerating the flows and stating the band; the structural pass has
  nothing to add and its output invites a false sense of rigour.
- **Before the structure is decided.** A walk over a topology missing half its intended
  nodes produces divergence findings about nodes that were always going to be added, and
  the team learns to distrust the instrument.
- **As the balance verdict, or as evidence a tuning pass can be skipped.** The walk
  excludes structural failure and says nothing about whether a price is a decision,
  whether a curve has the right shape, or whether the reward system still rewards. Those
  are separate rungs and each is climbed on its own.
