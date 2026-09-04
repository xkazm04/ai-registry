---
layer: golden-path
type: golden-path
subject: module-design
status: forged
use_when: [deciding where a boundary belongs, arguing whether a proposed split is an improvement, planning a deliberate structural pass, reviewing a codebase that grew faster than anyone read it]
techniques:
  - module-depth
  - seams-and-adapters
  - borrowed-surface
  - io-free-core
  - concurrency-at-the-edge
  - locality-and-leverage
  - structural-improvement-loop
  - structure-is-not-delegable
  - scoreable-designs-are-built-not-argued
  - declarative-or-sequential
  - marked-unverifiable-region
  - mirror-type-at-the-edge
  - state-carrier-decides-the-lane
---

# Module design

Every codebase is divided. The question is never *whether* it has a structure —
it has one the moment the second file exists — but whether anybody chose it.
Module design is the discipline of choosing: deciding what is hidden from whom,
where substitution is possible, and which knowledge is allowed to live in more
than one place. It is the subject every other engineering-process subject
presupposes. A scanner sweeps a tree for defects and cannot tell you whether
what remains is well divided. A gate enforces a standard and is not the
standard. A test harness runs tests and does not make code testable — that is a
boundary question, and it is answered here.

The naive reading of the subject is that it is about tidiness, and that it is
therefore optional, aesthetic, and deferrable. The principal reading is that
structure is the **variable that sets the cost of every future change**, that it
degrades continuously under changes that are each individually correct, and that
nothing in a normal build reports on it. That combination — high stakes,
continuous decay, no alarm — is what makes it a stewardship discipline rather
than a design-day activity.

## The interface is not the signature

The single most consequential redefinition in this subject: **a module's
interface is everything a caller must know to use it correctly.** The formal
part — names, parameters, types — is the part a compiler checks and the cheap
part to learn. The informal part is where the cost lives: the invariants the
caller must maintain, the order in which things must be called, what happens
concurrently, which errors are recoverable and which are terminal, what is
guaranteed about persistence or ordering, and every performance characteristic a
caller must design around.

A function with three parameters and a paragraph of "call this only after the
session is open, never while a write is in flight, and note that it silently
truncates above a certain size" has a large interface. A function with eight
parameters and no such paragraph may have a small one. Counting signatures
measures the half that a reader learns in a minute and ignores the half they
learn from an outage.

Everything downstream depends on getting this right, because the whole quality
model of a boundary is a ratio whose denominator is *that* interface. Measure
the denominator wrong and every judgment built on it inverts.

One refinement, and it cuts the other way. "Must know" is the author's
denominator; with enough callers the real one is **everything a caller can
observe**, because some caller will come to depend on any observable
behaviour whether it was promised or not — an iteration order, a timing, an
error string, the shape of an identifier. A hidden decision is therefore only
hidden if it is *unobservable*, and a deep module has to work at that:
unspecified behaviour is deliberately varied so nobody can rely on it,
internal types are opaque rather than merely undocumented, and a guarantee is
either stated or actively withheld. What is left observable and unstated is
interface that will be discovered by the outage that breaks it.

## Depth is the quality axis, and it is placed, not maximised

A **deep** module hides substantial implementation behind a small interface: the
caller learns a little and gets a lot. A **shallow** one exposes nearly as much
as it does — the interface is about as complicated as what is behind it, so the
abstraction charges rent and delivers nothing. The classic shallow module is the
pass-through: a layer that adds a name, forwards a call, and converts every
future change into two edits in two files, one of which somebody will forget.

This is why "many small modules" is not automatically good design. Decomposition
has a price, and the price is interface: each new boundary is another thing
somebody must learn, and interfaces do not compose for free. Splitting a long
procedure into ten pieces that are each called once and must be read in sequence
does not reduce what a reader holds in their head — it converts a linear read
into a graph traversal and adds ten names to the vocabulary. The doctrine that
smaller is always better reliably produces a codebase of shallow modules, which
is a worse place to work than the one it replaced.

And depth is not a quantity to be maximised. A deep module that hides the
*wrong* decision is worse than a shallow one, because callers must work around
it: they reach past it, duplicate its logic with one variation, or push a
parameter through it that leaks the hidden decision straight back out. An
options bag that grows one entry per caller is that failure with a signature.
Depth is **placed** — hide the decisions callers should not have to make, and
expose the ones they legitimately need to make differently.
[module-depth](./techniques/module-depth.md) owns the axis and its failures.

## Complexity is incremental, which is why no single change is guilty

Structural decay never arrives in one commit. It arrives as a long series of
changes that are each locally defensible: one more parameter, one more special
case, one more place that knows the shape of a record it does not own. No single
increment is worth blocking, and a reviewer looking at any one of them is right
to approve it. The damage is in the accumulation, and accumulation is invisible
to any process that only ever looks at one change at a time.

That is the structural argument for why review cannot be the answer here, and it
is the reason this subject needs a periodic pass with its own cadence rather
than a stricter checklist at merge time.

## Why this stopped being a slow problem

The old rate limit on structural decay was human typing speed. It is gone.
Changes now land faster than anyone reviews structure, and the defect is not
that machine-written code is bad — it is frequently excellent, locally. It is
that a long sequence of locally excellent changes, each made without regard for
the whole, accumulates into a structure nobody chose. Longitudinal studies of
agent trajectories on long-horizon iterative tasks report exactly this shape:
output volume rises in the large majority of runs and structural erosion in
nearly as many, diverging from maintained human-kept repositories the longer the
run goes. One 2026 benchmark built to measure that divergence put it at
roughly four in five agent trajectories with rising erosion against a little
over half of comparable human-kept repositories, with agent volume growing
about twice as fast — counted by its own verbosity and erosion metrics over
its own task set, which is the predicate those figures travel with.

The second half of the problem is that **verification is behaviour-blind**. A
change can satisfy every acceptance criterion, pass every test, clear every gate,
and still leave a new dependency pointing from the part of the system that
encodes the business's decisions toward a part that should have been
substitutable. Nothing in the pipeline can see that, because nothing in the
pipeline was asked to. *Verified* and *healthy* are different properties, and
only one of them is measured automatically.

The honest qualification: **one class of structural property can be gated,
and it is the class that decays fastest under volume.** Which way a
dependency may point, which packages may import which, what is visible
outside a boundary — these are decided facts about a shape, mechanically
checkable, and a build can be made to fail on them. What no build observes is
whether a boundary is deep, whether one decision is now encoded in two
places, or whether the shape being enforced is still the right one. So the
division is: a structural decision, once made, is written down as a rule the
build checks, and the judgment of whether the rule is right stays with the
periodic pass. A team that gates nothing is trusting review to see
accumulation, which it cannot; a team that believes its dependency rules
make it healthy has mistaken the checkable half for the whole.

## The two payoffs, and the different people who collect them

A good boundary pays out twice, and separating the two payments is what lets a
structural proposal be argued instead of asserted:

- **Locality** is the maintainer's payoff. When a class of change lands in one
  place, that change is cheap, its bugs are findable, and its fix does not have
  to be repeated. Scattered change — one intention requiring edits in six files
  that do not know about each other — is the diagnostic symptom of a boundary in
  the wrong place, and it is the most reliable one available, because it is
  measured from the change history rather than from anyone's taste.
- **Leverage** is the caller's payoff: capability obtained per unit of interface
  learned. This is depth seen from outside.

They are both consequences of depth and they can be traded against each other. A
boundary that gives one caller enormous leverage by hiding a decision can force
the maintainers of two subsystems to change in lockstep forever. A boundary that
gives maintainers perfect locality can hand every caller a configuration surface
to learn. Naming which one a proposal buys and which one it spends is what turns
a structural argument into a decision somebody can disagree with on the merits.
[locality-and-leverage](./techniques/locality-and-leverage.md) owns the pair,
and the cost that neither of them prices: both are collected by people who
found the module, and hiding its existence is a separate decision from hiding
its internals.

## Seams: the design question and the testing question are one question

A **seam** is a place where behaviour can be changed without editing at that
place. An **adapter** is a concrete thing that satisfies a seam — and the real
implementation and the test double are two adapters of one interface, not two
different kinds of object.

The consequence worth internalising is that "where should this be replaceable?"
and "where can I test this in isolation?" have the same answer, at the same
location. Testability is therefore a **structural property**, not a testing-team
deliverable, and "we will add tests later" is usually a structural claim wearing
a scheduling claim's clothes: you cannot add tests to code with no seams without
changing its structure, which is precisely the work being deferred.

The rule that keeps seams honest: a seam nobody ever substitutes at has never
had to be truthful about what it hides, and it will have quietly absorbed its
one implementation's assumptions into its shape.
[seams-and-adapters](./techniques/seams-and-adapters.md) owns placement,
the adapter discipline, and the contract that keeps a double from drifting.

There is a second answer to the same question, and it is not a seam. Where
the module's job is logic over events — a protocol, a scheduler, a retry
policy, a workflow — its dependencies are inputs and outputs wearing a
collaborator's clothes: it does not need a clock, it needs the time; it does
not need a socket, it needs the bytes. Removing them entirely, so the module
is a transition function and one small driver at the edge does all the I/O,
makes it testable with no doubles at all and indifferent to which runtime it
ends up under. The adapter keeps the dependency and makes it substitutable;
this deletes it. Which one is right is decided by the number of verbs the
dependency has, and [io-free-core](./techniques/io-free-core.md) owns that
decision, the shape, and the price the form charges at the edge.

Both answers share a premise that is worth naming because it sometimes fails:
that a test can *construct* the input. Some types are minted only by the host
that supplies them — a request scope's cookie jar, a compiler session's token
stream, a device handle, an editor's document model — and have no constructor
outside it, so "hand it in as a value" leaves the test exactly where it was.
The disposal is a third one: define an ordinary **mirror** of what this module
actually reads, convert to it in the host-facing function's first line, and
write every branch against the mirror, leaving a shim that has no branches to
reach. [mirror-type-at-the-edge](./techniques/mirror-type-at-the-edge.md) owns
the shape, the two moves it replaces — mocking the host type, or booting it —
and the drift cost a second vocabulary charges.

A module's **flow-control** model is the same question asked about a different
dependency, and it has a cheaper test. Remove the concurrency: if the sequential
version would have to reintroduce it by hand — workers, queues, manual polling —
the concurrency is the module's logic and belongs there. If removal costs nothing
but a keyword, it was plumbing that propagated from a caller, and it belongs at the
edge. The measurement that catches a boundary already drawn in the wrong place is
the size of what gets offloaded to another pool: one call is a fix, a whole pipeline
is a diagnosis. [concurrency-at-the-edge](./techniques/concurrency-at-the-edge.md)
owns the test, the decay signature, and the heavy-computation case where a large
offloaded region is correct and permanent.

## Architecture styles are vocabularies, not answers

Hexagonal, clean, onion, layered and their relatives are different names for a
small set of underlying concerns: which way dependencies point, what is
substitutable, what is hidden, and what changes together. They are useful as
shared vocabulary and dangerous as answers, in two specific ways. Adopting a
style wholesale imports its ceremony along with its ideas, so a codebase acquires
directories and indirections whose only justification is the diagram. And naming
a style as *the* answer dates the decision: the concerns outlive the names, and
a team that argued in style-names has no way to discuss the case the style did
not anticipate.

This subject teaches the concerns. When a style's vocabulary makes a
conversation faster, use it; when it starts deciding, stop.

## Structural work is periodic, deliberate, and outputs a specification

Because decay is incremental and unreported, the corrective work has to be
scheduled rather than triggered. It has a shape: sweep for candidates, ground
each one in real code at both ends, elicit the target shape with a human, and
emit a **specification rather than a change**.

The last step is the one that gets skipped and the one that matters most. A
structural change is large and reviewable only as a whole; a diff therefore
arrives long after the decision it should have informed, and reviewing it
conflates two questions — *is this the right shape* and *does this faithfully
implement that shape* — into one review that answers neither. Separating them is
what makes either answerable.
[structural-improvement-loop](./techniques/structural-improvement-loop.md) owns
the pass, including where it hands off to and from the scanning discipline that
owns sweeps and finding lifecycles
([codebase-scanning](../codebase-scanning/codebase-scanning.md)).

## The one step that does not delegate

Finding structural candidates is pattern recognition over evidence that is
entirely present in the tree, and it delegates well. Executing an agreed
structural change is mechanical, large, and delegates well. Between them sits a
small step that does not: **choosing which candidates are worth having**, which
requires knowing where the product is going — a fact that is not in the code and
cannot be recovered from it.

The practical consequence is sharper than "keep a human in the loop." A standing
grant of approval over this flow does not speed it up; it deletes it, because
the human's turn here is not a check around the work, it is the step that
supplies the missing input. The flow keeps producing output and stops producing
decisions, and nothing looks broken.
[structure-is-not-delegable](./techniques/structure-is-not-delegable.md) owns
the division of labour, the boundary against the argument that decisions should
migrate toward the agent as capability rises, and the honest statement of what
would have to change for the claim to stop holding.

## And the decisions a harness can settle

That claim partitions design decisions on whether the outcome is **scoreable
inside the run**, and it takes the half that is not. The other half is real and
it is larger than it used to be. Where candidates differ in a way a harness can
observe — an access pattern forced by a key's shape, a serialization cost, a
layout's effect on contention — the argument is the expensive way to decide, and
it was only ever preferred because building every candidate cost days. Agent
authorship moved that price by an order of magnitude, which moves the threshold
rather than the principle: decisions that used to sit below the line, settled in
a meeting because three implementations were obviously not worth it, are now
above it.

The discipline is what keeps this from becoming decoration. One harness over
substitutable implementations, not three benchmarks; the human still states
which workload represents the product, because that is the same act as choosing
the candidate one rung lower; and the check happens before the harness is
commissioned — name which result would change the decision, and if none would,
the decision was never scoreable and the number produced will be quoted anyway.
That last failure is the taste argument's mirror image and it is the more
expensive of the two, because it does not look like an opinion.
[scoreable-designs-are-built-not-argued](./techniques/scoreable-designs-are-built-not-argued.md)
owns the harness contract, the undelegable residue, and the cases where
measurement is the wrong instrument.

## The same questions inside one expression

Everything above places boundaries between modules. Two of this subject's
arguments do not stop at that scale, and pretending they do leaves the
smallest and most frequently written code ungoverned by the doctrine that
governs everything around it.

The first is **form**. Whether a piece of work is written as a declarative
composition or as explicit sequential code is treated as taste, so it is settled
by whoever cares most. It has a stated boundary instead: composition wins for
transformations through a pipeline, and explicit sequential code wins when one
pass produces several outputs, when effects are mixed into the classification,
or when the branches do genuinely different work — and in the sharpest case, a
loop over an explicit state, no declarative equivalent is cleaner because the
state sequence *is* the algorithm. The same discipline that puts I/O at the edge
of a module puts effectful steps at the *ends* of a call chain, and there it
comes with a detector a reviewer can apply in seconds.
[declarative-or-sequential](./techniques/declarative-or-sequential.md) owns the
boundary, the three conditions, and the fractal rule.

The second is **what a boundary does with an operation nothing can check**.
Every system has them, abstinence does not work — refusing the hatch drives the
operation to a lower layer with no rules at all — and the answer is a region
that is marked so it is findable, enclosed so no caller reaches it without
passing a checked surface, no larger than the operation requires, and
accompanied at each use by the written statement of the fact that makes it
valid. The last of those is what separates an audit from a list of locations.
[marked-unverifiable-region](./techniques/marked-unverifiable-region.md) owns
the four properties, the growth signal that indicts the checked surface rather
than the hatches, and the case where the whole apparatus is debt with good
manners.

## Failure modes this standard exists to prevent

- **The structure nobody chose** — a long run of locally correct changes,
  accumulating into a division of the system that no one would have designed and
  no one decided to have.
- **Depth in the wrong place** — a boundary that hides a decision callers
  legitimately need to make, detectable by the parameter that grows one entry
  per caller and the escape hatch that returns the thing underneath.
- **Classitis** — decomposition pursued as a virtue, producing many shallow
  modules and a larger total interface than the code it replaced.
- **The decorative seam** — an interface with one implementation that nothing
  ever substitutes at, paying for an abstraction and buying no replaceability.
- **Information leaked across a boundary** — one design decision encoded in two
  modules, so the two must change together forever, and the day they do not is
  a defect nobody can locate.
- **Temporal decomposition** — dividing the system by the order in which things
  happen rather than by what knowledge they require, which is the most common
  way that leakage gets designed in on purpose.
- **The taste argument** — a structural proposal stated at a level of
  abstraction where it cannot be falsified, so it is settled by seniority.
- **The unreviewable structural diff** — a correct change, too large to review,
  landing on the strength of the author's confidence and a green pipeline.
- **The boundary that worked** — a capability hidden well enough that the
  next team could not find it and built it again, paid for in a defect fixed
  once and reported twice. It is the one failure in this list that no
  instrument here detects, because every one of them looks for coupling and
  this leaves none.
- **Green and rotting** — every gate passing on a codebase whose cost of change
  is rising, because nothing in the pipeline observes structure.

## The techniques

- [module-depth](./techniques/module-depth.md) — the quality axis: interface as
  everything a caller must know, the shallow-module failures, why more modules
  is not better design, and why depth is placed rather than maximised.
- [seams-and-adapters](./techniques/seams-and-adapters.md) — where substitution
  becomes possible: the four placement signals, the single-door rule for
  adapters, the shared contract that keeps a double honest, and pinning
  behaviour before moving a boundary.
- [borrowed-surface](./techniques/borrowed-surface.md) — the half of a module's
  interface somebody else authors: implicit delegation that dissolves the
  distinction a wrapper was created to draw, a disjointness premise taken from
  a contract you do not own, and the one question that finds both.
- [io-free-core](./techniques/io-free-core.md) — the other answer to the
  testability question: logic over events as a transition function with time
  as a parameter, one driver at the edge doing all the I/O, the verb-count
  rule that separates it from an adapter, and the costs the form charges.
- [concurrency-at-the-edge](./techniques/concurrency-at-the-edge.md) — the removal
  test that separates a flow-control model that is the logic from one that is
  plumbing, the offload-region size as a decay signature mirroring "the driver got
  clever", and the heavy-computation inversion.
- [locality-and-leverage](./techniques/locality-and-leverage.md) — the two
  payoffs, measured change scatter as the diagnostic, the pair of criteria
  a structural proposal is argued against, and the discovery cost that neither
  payoff prices.
- [structural-improvement-loop](./techniques/structural-improvement-loop.md) —
  the periodic pass: what a structural candidate is, grounding both ends before
  discussion, eliciting the target, emitting a spec, scope control, and cadence.
- [structure-is-not-delegable](./techniques/structure-is-not-delegable.md) — the
  division of labour, why a blanket approval grant deletes this flow, the
  boundary against capability-driven migration of decisions, and what would
  falsify the claim.
- [scoreable-designs-are-built-not-argued](./techniques/scoreable-designs-are-built-not-argued.md)
  — the other half of that partition: one harness over substitutable
  candidates, the workload choice that stays with the human, the hazard of
  cheap numbers on unscoreable decisions, and when measurement is the wrong
  instrument.
- [declarative-or-sequential](./techniques/declarative-or-sequential.md) — the
  stated boundary between declarative composition and explicit sequential
  code, the three conditions that invert it, the state machine as the sharpest
  case, and the adjacent-step detector for effects interleaved in a chain.
- [marked-unverifiable-region](./techniques/marked-unverifiable-region.md) —
  designing the region a checker cannot reach: marked, enclosed, minimal, and
  carrying the invariant at each use; why abstinence fails, and why the
  marking is what makes the region durable.
- [mirror-type-at-the-edge](./techniques/mirror-type-at-the-edge.md) — the case
  where the input type itself cannot be constructed by a test: the ordinary
  mirror of what the module actually reads, conversion at both edges, the
  branchless shim, why mocking the host type is a gate reading its own author,
  and the three rules that keep a second vocabulary from drifting.
