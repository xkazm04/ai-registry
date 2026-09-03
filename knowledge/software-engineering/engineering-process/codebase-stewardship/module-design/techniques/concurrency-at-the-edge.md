---
layer: technique
type: technique
subject: module-design
technique: concurrency-at-the-edge
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [deciding whether a module's flow-control model is logic or plumbing, large regions of code are being offloaded to another pool, a concurrency model is spreading through the call graph, drawing the boundary between a core and its driver]
---

# Concurrency at the edge — the removal test

[io-free-core](./io-free-core.md) answers *what shape a module has* when its job
is logic over events, and its tell is the **number of verbs**: one or two
directions of flow is an input/output pair pretending to be a dependency; a
dozen verbs with individual semantics is a capability. That test is a good one
and it is not cheap — it asks a reader to characterise a module's whole
interface before deciding anything.

This is the complementary test, it is about **flow control rather than I/O**,
and it can be run in a minute:

> **Remove the concurrency and see what it costs. If removing it would force
> you to reintroduce the same thing by hand — workers, queues, a
> hand-rolled scheduler, manual polling — the concurrency *is* the logic and
> it belongs in the module. If removing it costs nothing but a keyword, it was
> plumbing, and it belongs at the edge.**

The test is decisive because the reintroduction cost is objective. Nobody has
to agree about whether a module "feels" concurrent. Either the sequential
version of it is a straightforward rewrite, or the sequential version needs a
coordination mechanism written by hand — and if it does, the concurrency was
carrying meaning that has nowhere else to live.

## What passes, and why the passing cases are recognisable

Three shapes reliably pass, and they have a family resemblance worth naming:
in each, **the coordination is the thing the module is for.**

- **Fan-out and fan-in as the rule itself.** "Ask five sources at once and
  take the best answer" is a business rule whose statement contains the
  concurrency. Expressed sequentially it is not a simpler version of the same
  rule; it is a different, slower rule with a coordination mechanism bolted
  underneath to recover the original.
- **Streaming with backpressure.** Managing a continuous flow — when to pull,
  when to hold, what to do when the far side slows — is non-trivial policy,
  not an I/O wrapper. Removing the flow control removes the policy.
- **Long-lived stateful sessions.** Protocol machines whose transitions are
  driven by arriving events have their state and their waiting fused. There is
  no version of them where the waiting is somebody else's problem.

Everything else — validate, enrich, compute, format, decide — fails the test.
Those functions do not wait on anything; they were coloured by a caller, and
the colouring propagated because it propagates upward through every caller by
construction.

## The decay signature: measure the size of what you offload

The second half of the technique is a measurement that finds a misplaced
boundary from the outside, without reading the module's interface at all.

Systems that put a flow-control model at the wrong altitude eventually need an
escape hatch: a way to run work that does not fit the model — work that blocks,
or work that never yields — somewhere else. **Measure the size of what goes
through that hatch.**

- **A single call is a fix.** One blocking dependency, one heavy library, one
  foreign routine handed to another pool. That is the hatch doing its job.
- **A large region is a diagnosis.** When a whole pipeline of steps is wrapped
  and handed to another pool in one gesture, the code is telling you the
  boundary is drawn in the wrong place. The correct repair is to **redraw it**
  — those steps become a module the edge calls directly — not to keep the
  wrapper and tune it. Patching the hatch preserves the misplacement and adds
  ceremony on top of it.

This is the exact mirror of the signature
[io-free-core](./io-free-core.md) watches for from the other side: there, the
decay is that **the driver got clever** — logic migrating out of the testable
core into the edge that was supposed to be small and boring. Here, the decay is
that the edge's model has migrated *inward* and the offload hatch is carrying
the logic back out. Both are the same boundary being wrong, observed from
opposite ends, and both are cheap to watch: one counts lines of logic in the
driver, the other counts lines of logic inside the offload wrapper.

Keeping the model at one edge is also what makes the edge a single door
([one-validation-door](../../../../_laws.md#one-validation-door), in the shape
this technique produces): the flow-control model is entered in one place, and
the modules beneath it cannot reach around because they have no model of their
own.

## What the test does not decide

It does not decide *which* execution model the edge should use, or at what
scale a multiplexing model is worth its complexity — that is a capacity
question with a threshold on a named axis, and it belongs to
[scale-investment-timing](../../../../backend-platform/resilience/scale-investment-timing/scale-investment-timing.md).
This technique assumes the model exists and asks only how deep it is allowed
to go.

It also does not decide the *dependency* question. A module may pass this test
— its concurrency is genuinely its logic — and still be a poor shape for
testing because it reaches for a clock, a socket and a random source. That is
[io-free-core](./io-free-core.md)'s test, and the two are independent: a
protocol machine whose transitions are inherently event-driven is best written
as a pure transition function that *describes* its concurrency in values
rather than performing it.

## Inversion: the large offloaded region that is correct

For **genuinely heavy computation** — a large payload parsed, an image
processed, a compression pass — a large region handed to another pool is
correct and permanent. The distinction is not size on the page; it is whether
the region would starve the model it was lifted out of. Ordinary logic running
in microseconds does not, and offloading it is ceremony that costs a boundary
crossing and buys nothing. Work measured in hundreds of milliseconds does, and
the offload is the design, not a symptom.

The other inversion is a module that must run under **more than one**
flow-control model. Removing the concurrency there is not a simplification but
a portability requirement, and the right form is the one
[io-free-core](./io-free-core.md) prescribes: no model in the module at all,
one driver per model outside it.

## Decision rules

- Run the removal test before the shape test. It is cheaper and it settles
  most modules.
- A module whose sequential form needs a hand-written coordination mechanism
  keeps its concurrency. A module whose sequential form is the same code minus
  a keyword loses it.
- Count the lines inside every offload wrapper. One call is a fix; a pipeline
  is a misplaced boundary, and the repair is to move the boundary.
- A library defaults to the model-free form. A library that imposes a
  flow-control model imposes it on every caller, including the ones that have
  no reason to run one — the same contamination this technique keeps out of a
  single codebase, exported.
- Watch both decay signatures: logic accumulating in the driver, and logic
  accumulating inside the offload hatch. They are the same defect and either
  one is enough to reopen the boundary.
