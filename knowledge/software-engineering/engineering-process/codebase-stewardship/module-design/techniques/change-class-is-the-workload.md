---
layer: technique
type: technique
subject: module-design
technique: change-class-is-the-workload
status: forged
laws: [count-carries-predicate, gate-sees-target, limits-are-derived]
shared_with: []
use_when: [deciding whether a proposed split is worth its cost, a structural argument turns on how easily each candidate extends, pricing structural debt in something a budget holder recognises, an agent's spend on a codebase is being read as a fact about the agent, a benchmark comparing two codebase structures is being quoted]
---

# The change class is the workload

The claim, stated so it can be argued with: **a structure's extensibility is
scoreable, by making the change class itself the workload — replaying the same
class of change against each candidate structure with an agent as the executor,
and metering what the execution costs.**

[scoreable-designs-are-built-not-argued](./scoreable-designs-are-built-not-argued.md)
names three properties with a long lag and declines all three: how easily this
extends, who can maintain it, what it forecloses. The first of those has moved,
and the reason it moved is worth being precise about, because it is not that
anybody got better at observing extensibility. **The lag was a property of the
instrument, not of the property.** Extensibility was slow to observe because the
only available probe was a maintainer performing the extension, and that took a
quarter and arrived confounded with everything else that happened in the
quarter. The probe is now an agent performing the extension, it takes an
afternoon, and it emits a meter reading. The other two properties keep their
denial: no harness observes who can maintain a thing.

## Process cost is the target; correctness is the floor

The measurable is not the program's runtime and not its size. It is the
**process cost of changing it** — the tokens, turns and wall-clock an agent
spends getting from the current structure to the extended one. That number is
distinct from surface cost, and the structure that produces the smaller diff is
not reliably the one that was cheaper to reach.

Correctness is the experiment's **floor**, declared in advance and expected to
hold in both arms. This is the half that the popular form of the argument gets
backwards. The claim that structure no longer matters because machines both
write and read the code is an observation that the floor held — the work got
done, the tests passed — read as evidence that the target did not move. A
comparison reporting only that both arms succeeded has measured its own
premise.

Two measurements, at different scales and with opposite protocols, agree on the
direction and disagree on the size:

- A controlled study of 2,000 agent trajectories: 100 tasks, four target
  languages of differing representation in pretraining data, five models, one
  minimal agent harness. After fitting task identity as a random effect, the
  less-represented substrates cost **1.16x to 1.69x** more output tokens than
  the best-represented one, p < 0.001 across every model — **at comparable
  success rates**. The predicate those figures travel with
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  contest-style single-file tasks, output tokens only, one trajectory per cell,
  mid-2026 models.
- A first-party account, n=1 and dated. One API specified once — 15 business
  domains, 45 resources, 1,355 unit tests plus tests the agent never saw — built
  twice: once with every endpoint written out by hand, once behind a shared kit
  of metadata mapping, a generic repository, a layer supertype, a template
  method and a factory. Two agents then executed two successive feature
  releases against each. Every arm passed every visible and hidden test and
  nothing regressed between releases. Cost ran **1.21x and 2.7x** against the
  structured arm, wall-clock **1.33x and 1.72x**, and the ratio **grew with each
  release** — from 1.11x to 1.36x for one agent and 1.51x to 1.77x for the other
  (reported 2026-10; one trajectory per cell, one task, one pair of structures).

The direction is corroborated. The sizes are not comparable, and the next
section is why.

## Four disciplines, without which the number attributes nothing

**1. Fix the change class, then derive the arm count from a band you measured.**
The identity of the change dominates. In the controlled study, task identity
explained **73% to 97%** of token-cost variance (ICC), which is why the
substrate coefficient is only visible after the task is modelled — and why a
single task yields a number with nothing to attribute it to. The limit is
derived, never picked
([limits-are-derived](../../../../_laws.md#limits-are-derived)): measure the
run-to-run spread of your own meter on your own substrate first, then compute
how many replays each arm needs to resolve the effect you expect. A fleet
measurement over 118 real agent sessions across five trees put the within-tree
spread of output-token cost at a geometric SD of **5.92x**, with per-tree
coefficients of variation from 0.52 to 3.09; at that band, resolving a 1.21x
effect takes on the order of **a thousand replays per arm** and a 2.7x effect
about fifty.

That arithmetic was then checked against the same corpus by replaying the
one-per-arm protocol itself: draw one session from each of two workspaces,
declare the cheaper one, and score it against the ordering the two full samples
agree on — bootstrapping each pair's ordering first, because a protocol cannot
be scored against a ground truth that is not itself established. Across the
eight pairs of ten whose ordering *was* established, every one had a true ratio
of 3.4x or larger, and there one observation per arm recovered the correct
direction **84%** of the time against **98%** at ten. **No pair with an
established ordering had a true ratio below 3x** — and that absence is the
result, not a gap in it. The single pair in the range these studies report,
1.5x, is exactly the pair whose ordering the bootstrap could not establish:
0.86 stability over samples of 43 and 11 sessions, with one observation per arm
recovering the direction about 55% of the time, which is chance. At a small
effect under a wide band, tens of samples per arm do not settle the
*direction*, let alone the size — and both studies above settle it from one.

That band is the *uncontrolled* one, and a comparison that fixes the change
class will be far tighter, so treat those arm counts as an upper bound. But as
of this writing nobody has published the tighter number, because both
measurements above run **exactly one trajectory per cell**. The within-cell
variance of agent process cost is the missing instrument in this whole lane.
Measure yours before quoting a ratio.

**2. Split the trajectory at the first passing state.** Spend before the first
state that passes and spend after it have different causes, and they do not move
together with substrate difficulty — so a total conflates two terms and
sometimes cancels them. In the controlled study one model spent 1,743–2,454
tokens reaching a passing solution and **1,173–7,311 tokens after reaching it**,
the larger share of the trajectory; and its post-pass spend was *lowest* on the
hardest substrate, because there it rarely reached a passing state to
second-guess. Of the steps that changed no test outcome on the easiest
substrate, 34% were cosmetic refactoring and 22% performance micro-optimization
— work the task never asked for. A meter that reports one total charges the
structure for the model's self-directed tidying.

**3. Meter what transplants, and separate the harness's own clock.**
Context-window occupancy is an **engine signature, not a disorder measure.** In
the first-party account one agent pulled 1.7x more context in the disordered arm
while the other never read the large file at all — it searched it and patched it
through generated scripts, and its context barely moved. Either engine would
support a confident and opposite conclusion from context alone. Meter tokens,
turns and wall-clock, and run at least two engines, because an effect that
appears in one engine's trajectory shape and not the other's is a fact about
that engine. Then separate the test suite's own duration: the suite is identical
across arms, so the arm that iterates more pays a constant cost more times, and
wall-clock is a derived quantity whose primitive is **iteration count**. Report
the count; let the reader derive the clock.

**4. A rising self-chosen fan-out is the agent pricing the structure, not
throughput.** This is the prediction the first-party account made and measured
the opposite of, which is what makes it worth carrying. The expectation was that
an undivided file would **block** parallel work through write contention. What
happened is that the agent spawned *more* workers in the disordered arm — five
against two — and finished in twice the wall-clock, having first derived sixteen
modules from the undivided 9,000-line file and partitioned the work across them.
The decomposition the structure does not carry is re-derived on every run, paid
for on every run, and discarded at the end of it. So fan-out rose because the
work was harder, not because it went faster, and a dashboard reading concurrency
as capacity inverts the signal. The gate must observe the thing it claims to
measure ([gate-sees-target](../../../../_laws.md#gate-sees-target)), and
concurrency is not throughput.

## The engineer still states the change class

The undelegable residue survives, one rung further on than
[scoreable-designs-are-built-not-argued](./scoreable-designs-are-built-not-argued.md)
left it. That technique established that the agent can build the candidates and
run the harness but cannot choose **which workload represents the product.**
Here the workload is a class of future change, so choosing it is choosing which
extension the product will actually be asked for — and that consumes exactly the
information [structure-is-not-delegable](./structure-is-not-delegable.md) says
is not in the tree. A replay pointed at the extension that never arrives
produces a correct measurement of a structure's fitness for an imagined future,
with all the authority of a number.

The relationship to [locality-and-leverage](./locality-and-leverage.md) is worth
stating, because the two instruments answer the same question from opposite ends
of the clock. Change scatter is **retrospective**: it needs the change class to
have already recurred, it is counted in locations, and its hardest term —
distinct decisions restated — is the one nobody counts reliably. This is
**prospective**, and it is denominated in money and minutes rather than in
locations, which removes the counting-rule argument and replaces it with a
sampling argument. Use scatter to find the candidate from history; use a replay
to price it before committing. A structure whose scatter count is high and whose
replay cost is flat has found a cross-cutting concern, not a misplaced boundary.

## When not to apply it

**When the change class is not yet known.** Then this measures a guess, and the
decision belongs to
[structure-is-not-delegable](./structure-is-not-delegable.md).

**When the effect you expect is smaller than the band you measured.** Derive the
arm count; if it exceeds the budget, the honest result is that the decision is
not scoreable *at this budget*. That is a real finding. A ratio from one replay
per arm is not a cheaper version of it.

**When the arms differ in more than the boundary.** Two structures built
independently differ in naming, test granularity, dependency count and diff size
at once, and the replay prices the bundle. The arms have to be the same system
behind one seam, per [seams-and-adapters](./seams-and-adapters.md) — which is
harder here than for a runtime benchmark, because the thing being varied *is*
the shape.

**For the other two long-lag properties.** Who can maintain this, and what it
forecloses next year, keep the sibling technique's denial in full. No harness
observes them, and a replay that prices the extension says nothing about the
person who will own it.
