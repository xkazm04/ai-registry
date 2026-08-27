---
layer: technique
type: technique
subject: module-design
technique: scoreable-designs-are-built-not-argued
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a design argument has run longer than building both options would take, choosing between implementations whose difference is measurable, deciding what an agent should produce before a design decision is made, a benchmark is being quoted to settle a structural question]
---

# Scoreable designs are built, not argued

The claim, stated so it can be argued with: **when candidate designs differ in a
way a harness can observe, and building each of them is cheap, the decision is
settled by building all of them and measuring — not by discussion.**

This is the complement of
[structure-is-not-delegable](./structure-is-not-delegable.md), and it exists
because that technique defined this class precisely and then declined it.

## The empty half of a partition

The sibling technique divides design decisions on one property: **whether the
decision's outcome is scoreable inside the run.** It takes the unscoreable half
— was this the right boundary, a question answered over months in a signal with
a long lag and no threshold — and argues that the selection step cannot move
onto the agent, because the information it needs is not in the tree.

For the scoreable half it says only that the migration argument governs it, and
points at
[orchestration-to-tool-migration](../../../../llm-agent/runtime-and-io/mcp-tools/techniques/orchestration-to-tool-migration.md).
That technique's subject is the tool surface: which decisions a *model* makes
inside a pipeline, measured by a harness scoring that pipeline's own output. It
does not govern an engineer choosing between two implementations of one
interface in a service.

So the partition is correct and one side of it was never written down. The
scoreable decision has been named twice in this bundle and owned by nobody. What
follows is that side.

## What changed is the price of the experiment, not the principle

Measure rather than guess is not a new instruction, and the reason it has always
been honoured selectively is economic rather than philosophical: building every
candidate cost days, so the method was reserved for decisions worth days, and
everything under that line was settled by argument instead. The line was never
about which decisions deserved evidence. It was about which ones could afford
it.

Agent authorship moves the cost of producing a candidate implementation by
roughly an order of magnitude, and the threshold moves with it. Most decisions
that used to sit below the line — the ones settled in a meeting because building
three versions was obviously not worth it — are now above it. Nothing about the
principle changed; the set it applies to grew.

A first-party account, n=1 and dated. An engineer on a large hosted CI product
faced a cache key with several possible structures, where the shape of the key
forced a different data access pattern and therefore a different load
distribution on the store behind it. Rather than reason about which structure
was best, they had the agent write one benchmark per candidate, run all of them,
and report the comparison — work they estimated at two to three days, delivered
in about twenty minutes (reported 2026-08). Treat the ratio as an existence
proof, not a distribution: it is one engineer, one decision, one stack.

## The harness is the deliverable, not the implementations

The failure mode is specific and it is the one that actually happens: the agent
produces three benchmarks rather than one benchmark over three implementations.
Different warm-up, different fixture data, different measurement point — and the
result is three numbers that cannot be ranked against each other, which is worse
than no measurement, because they look ranked.

The instruction that prevents it is structural. Commission **one harness, one
workload, one measurement point**, with the candidates entering as substitutable
implementations behind a single interface — which is to say, place a seam and
put the alternatives behind it, per
[seams-and-adapters](./seams-and-adapters.md). The comparison is a property of
the harness. The implementations are interchangeable parts inside it.

Two laws do the rest of the work. The benchmark must observe the thing it claims
to measure, per [gate-sees-target](../../../../_laws.md#gate-sees-target) — a run
against a synthetic workload measures the synthesis, and the gap between that
and the production access pattern is exactly where the decision lives. And every
number that leaves the harness carries its predicate, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): the
workload shape, the data volume, the concurrency, the hardware. A benchmark
result quoted six months later without those is a claim about a machine nobody
still runs.

## The engineer still states what to measure

The undelegable residue survives one level down. The agent can write the
harness, build the candidates and run the comparison; it cannot decide **which
workload represents the product.** Choosing the workload is the same act as
choosing the candidate — it consumes the same information from outside the
repository, namely what the system is actually going to be asked to do — and a
harness pointed at the wrong workload produces a correct measurement of an
irrelevant question, carrying all the authority of a number.

So the division of labour is the sibling technique's, one rung lower: the human
states the workload and the property being optimised, the agent builds and
measures, the human reads the result. What moved onto the agent is the labour,
not the judgment.

## The cheapness is the hazard

Because a benchmark now costs an hour, it becomes tempting to commission one for
a decision it cannot settle. This is the risk the technique introduces and it
deserves to be stated plainly.

A number attached to a decision whose consequence arrives two quarters later
does not inform that decision — it **wins** it, because precision reads as
evidence and nothing in the room is equipped to argue with a chart. That is the
mirror image of a failure this subject already names: the taste argument is an
unfalsifiable claim settled by seniority, and this is a falsifiable-*looking*
claim settled by a measurement of the wrong thing. The first is visibly an
opinion. The second is not, which is what makes it the more expensive of the
two.

The check is cheap and it belongs before the harness is commissioned, not after:
**name, in advance, which result would change the decision.** If no result would
— if the answer is that we would take the maintainable one either way — the
decision is not scoreable, and it belongs to
[structure-is-not-delegable](./structure-is-not-delegable.md). Commissioning the
benchmark anyway does not add evidence. It adds a number that will be quoted.

## When not to apply it

**When the difference is smaller than the measurement's variance.** Three
candidates within noise of each other have been measured and not distinguished,
and the honest report is that the decision is free — a real and useful result,
provided nobody rounds it into a winner.

**When building the alternatives changes what is measured.** If a candidate can
only be evaluated at a data volume, a cache state or a traffic mix the
experiment cannot reproduce, the harness is measuring the fixture.

**When the alternatives differ in a property with a long lag** — how easily this
extends, who on the team can maintain it, what it forecloses next year. No
harness observes those, and reaching for one here is the hazard above.

**When only one candidate can really be built.** A migration already half
committed, a dependency already adopted, a schema already live — the second
branch is hypothetical, and benchmarking a hypothetical against a real thing
compares an estimate to a measurement and reports it as a comparison.
