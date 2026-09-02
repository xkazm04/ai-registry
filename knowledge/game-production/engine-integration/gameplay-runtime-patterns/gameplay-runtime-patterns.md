---
layer: golden-path
type: golden-path
subject: gameplay-runtime-patterns
status: forged
use_when: [choosing the runtime shape of a piece of generated gameplay behaviour, reviewing generated code that is correct but over-structured, deciding whether an optimisation pattern has earned its complexity, writing the architectural constraints a code generator is briefed with]
techniques:
  - pattern-selection-by-force-present
  - update-order-and-frame-coherence
  - event-dispatch-versus-direct-call
  - data-driven-type-objects-over-subclass-growth
  - allocation-discipline-in-the-hot-path
  - spatial-partitioning-threshold
---

# Gameplay runtime patterns

A brief arrives: *enemies should flee when a nearby ally dies*. There are perhaps six
defensible runtime shapes for that behaviour and several dozen indefensible ones, and
every single one of the indefensible ones compiles, passes review at a glance, wires up
correctly and behaves acceptably in a scene containing four enemies. The subject here is
the choice itself — which structural shape a piece of behaviour is expressed in, and on
what evidence — because that choice is made once, is nearly free at the moment it is made,
and is the most expensive thing in the file to change afterwards.

The catalogue of shapes is not in dispute. Component, state machine, object pool, dirty
flag, event queue, update method, double buffer, spatial partition, type object, subclass
sandbox, service locator, a small interpreted instruction set — this vocabulary is settled
craft, well described, and a competent author knows all of it. That is exactly the problem.
An author who knows every pattern and has no rule for declining one will supply structure
the way a nervous cook supplies salt. The discipline is not *knowing* the catalogue; it is
holding a falsifiable reason for each shape used and, more often, for each shape refused.

A generated system should be the size of the problem, not the size of the pattern
catalogue. That sentence is the whole subject and everything below is its machinery.

## A pattern is a purchase, and indirection is the currency

Every pattern in the catalogue is a trade: it buys a named benefit under a named condition,
and it is paid for in indirection. Indirection is not an abstract aesthetic cost. It is the
concrete loss of a stack trace, an execution order that no longer appears anywhere in the
source, an object lifetime somebody now has to own, a value that is one step further from
the code that reads it, and a new place for state to be stale. Those costs are paid on
every subsequent read of the file, by every engineer and every automated author who has to
reason about it, for as long as the system lives.

The naive reading treats patterns as free quality — as a signal that the author was
serious. It is the reverse. A pattern applied where its condition is absent is
*negative* work: the benefit is not collected, the cost is paid in full, and because the
result is well-formed nothing downstream will ever flag it. An unnecessary event queue is
not a stylistic preference. It is a permanent tax on debuggability, levied to solve a
problem the system did not have.

So the question at authoring time is never "which pattern is best here". It is "what is
present in this problem that a direct, obvious implementation handles badly", and if the
honest answer is *nothing*, the direct implementation is the correct output and the review
must be able to say so without embarrassment.

## Forces are readable in the brief, and there are not many of them

The conditions that justify structure are few enough to enumerate, and they are almost
always visible in the design sentence before a line is written. How many instances of this
thing exist at once, and is that number bounded? How often does the behaviour run — once,
on an event, or every frame? Does the behaviour span more than one frame, so that it has
to remember where it was? Do other systems need to know when it happens, and is the set of
those systems known when the code is written or only at run time? Does anything need to
happen *later* rather than merely *elsewhere*? How much does one instance differ from the
next, and does that difference live in numbers or in conduct? Does the work grow with the
square of the population? Is the object created and destroyed inside the frame budget?

Each of those questions maps onto a small set of shapes, and each shape has exactly one
force that justifies it. Behaviour that spans frames and has distinct modes with distinct
legal transitions is a state machine, because the alternative is a set of independent
booleans whose illegal combinations nothing forbids. Behaviour whose interested parties are
not known at authoring time is a subscription, because the alternative is the producer
holding a list of consumer types. Behaviour that must happen at a *different time* from its
trigger — after the current update completes, on a later frame, on another thread — is a
queue, and nothing else in the catalogue buys that. Objects that differ only in their
numbers are one type reading a table, because the alternative is a class per row.

The corresponding discipline is stated as a rule and applied to every emitted shape: **name
the force, or emit the boring shape.** A generated subsystem that arrives with an event
queue and no answer to *what needed to happen later* has failed the review regardless of
how well the queue is written. `pattern-selection-by-force-present` makes that a procedure
with a force inventory and a rejection rule.

## Decoupling does not remove coupling; it removes the evidence of it

This is the load-bearing distinction of the whole subject and it is the one most often got
backwards. Replacing a direct call with a dispatch does not make two systems independent.
They still interact, in the same order, with the same consequences. What changed is that
the interaction is no longer written down anywhere a reader can find it. The compiler no
longer knows about it, so a rename no longer finds it; the debugger no longer shows it, so
a wrong value no longer has a caller; the reviewer no longer sees it, so the accidental
second subscriber lives forever.

Coupling that is visible in a call is coupling you can measure, delete, and reason about.
Coupling that has been dissolved into a bus is coupling you can only discover by running
the program and watching. The trade is worth making when the receiver set genuinely varies,
when the producer genuinely must not depend on the consumer's module, or when the delivery
genuinely must be deferred in time. It is not worth making because the word "event" appeared
in a design sentence — vocabulary is not architecture, and a brief that says *on death,
award experience* is describing causality, not requesting a message bus.

The corollary that catches automated authors in particular: a subscription is a wiring
obligation. A handler that is written, compiles, and is never subscribed — or is subscribed
and never unsubscribed from a destroyed object — is the purest form of a system that builds
and does nothing, or of one that builds and does something to a corpse.
`event-dispatch-versus-direct-call` grades the three tiers and states when each is bought.

## Time is a structural force, not a performance one

The single most under-weighted force in generated gameplay code is ordering. A subsystem
that reads a neighbour's state during the same update in which the neighbour writes it has
a behaviour that depends on the order the container happened to be iterated in. It will be
correct in testing, correct in review, and wrong intermittently after an unrelated change
reorders the collection — and the resulting defect reproduces only sometimes, which is the
most expensive class of defect there is.

The craft answer is to make each update a declared sequence of phases with a single writer
per quantity per step, and to defer every structural mutation — spawning, destroying,
re-parenting — to a drain point outside the iteration that provoked it. Where two things
genuinely depend on each other's previous value in the same step, the shape that buys
correctness is a read copy and a write copy, and it costs memory and a class of staleness
bug in exchange. Where a value is expensive and read more often than it changes, the shape
is a cached value with an invalidation flag, and it costs exactly one obligation: every
mutation path must set the flag, and the one path that forgets is the bug.

The cheapest expression of the same idea is the per-step opt-in. Where a platform lets a
participant declare whether it runs every step at all, that declaration is *derived* — a
participant gets a per-step slot because it has per-step work, and otherwise does not — and
deriving it rather than inheriting whatever a template shipped with is a free win that scales
with the content. It is also a useful miniature of the whole subject: a force present in the
source turns a switch on, and its absence leaves the boring shape in place.

Two further rules belong to this force and are cheap to state. A simulation step and a
render frame are different clocks, and any quantity computed per step carries the step it
was computed against; a value tuned under a variable frame interval will change meaning on
faster hardware. And a system intended to be reproducible — for replay, for a deterministic
network model, for a regression that must fail the same way twice — has to be free of wall
clock and free of unseeded randomness in its update path, or its output is an anecdote.
`update-order-and-frame-coherence` develops the phases, the drain, and the reproducibility
conditions.

## Growth: does the variation live in the data or in the conduct?

Content-heavy systems grow by variety, and variety arrives as a request for a new *kind* of
something. The reflex — a new subclass per kind — produces a class tree that grows linearly
with the content and requires a code change, a build and a deployment for every design
tweak. The alternative is a type object: one runtime class whose instances read their
differing values from a row of data, so a new kind is a new row and a designer owns it.

The rule that decides between them is sharper than it looks. When the only difference
between two proposed kinds is a *value* — more health, a different name, a different
reference to an effect — they are one kind with a value, always, and a generator that
proposes two classes there has misread the brief. When the difference is *conduct* — one of
them retreats and the other charges — a shape has to carry that, and the choice is between
a small closed vocabulary of behaviours selected by data, a subclass overriding a narrow
hook against a fixed set of primitives supplied by the parent, or a composed set of
capabilities. Only when the conduct itself becomes content authored by non-engineers, in
volume, does an interpreted instruction set start to pay — and it is a large purchase whose
own tooling burden is usually underestimated by an order of magnitude.

The failure to watch for is a data table that has slowly acquired a field meaning *run this
special case*. That field is a subclass in disguise, it will multiply, and it is a signal
that the variation crossed from data into conduct while nobody was re-deciding the shape.
`data-driven-type-objects-over-subclass-growth` states the crossing test.

## The two performance patterns have entry measurements, not entry opinions

Pooling and spatial partitioning are the patterns most often applied on reputation. Both
are correct, both are expensive in complexity, and both have a threshold below which they
are pure cost — and unlike the structural patterns, that threshold is a *number that can be
measured before the pattern is written*.

Pooling buys the elimination of allocation churn inside a frame budget, and it costs a
population ceiling, an explicit reset obligation, and a new failure mode in which a reused
object carries state from its previous life. Its condition is high churn of short-lived
objects at frame rate with a boundable population. Applied to something created once per
level, it is a lifetime bug generator with no benefit. And the reset obligation is exactly
where automated authors fail: a pool whose acquire path does not reinitialise every field
the object owns produces a ghost — an entity that behaves like the one before it, in a way
that looks like a gameplay bug rather than a memory bug.

Partitioning buys the removal of quadratic pairwise work, and it costs a structure to
maintain, a cell size to choose, and a hard sensitivity to how the population is
distributed. The crossover is real but modest: exhaustive pairwise testing stays
competitive to a few hundred participants, and published broad-phase benchmarks put the
useful boundary for naive testing in that region rather than in the thousands. Above it the
gains are dramatic; below it the structure costs more to keep current than the comparisons
it saves. A uniform grid is superb on populations that are evenly spread and similarly
sized and degrades badly on clustered ones or on a mix of very large and very small
participants, which means the *distribution* is part of the decision and not a detail.
Neither pattern may be adopted on an assumption: the population, the query rate and the
measured frame cost are stated, or the adoption is unmeasured and therefore not justified.
`allocation-discipline-in-the-hot-path` and `spatial-partitioning-threshold` carry the
thresholds and the measurement obligations.

## Grading a shape that is already written

Reviewing generated gameplay code for structure is a different pass from reviewing it for
correctness, and it needs its own question, because every ordinary check will pass. The
question is: for each structural element present, what force in the brief required it, and
is that force actually there? An element with no answer is removed, and removing it is a
*fix*, not a preference — the same status as deleting an unused branch.

The reverse question is asked in the same pass and is easier to forget: which force present
in the brief has no structure answering it? Behaviour that plainly spans frames implemented
as a pile of independent flags, mutual dependence within a step implemented as a hopeful
read, unbounded per-frame allocation in a system that spawns projectiles — these are the
under-structured defects, and they fail quietly in the other direction. Over-structure
costs comprehension forever; under-structure costs correctness intermittently. A review
that only hunts one of them will oscillate the codebase between the two.

The budget is what makes this enforceable at generation time rather than at review time. A
brief that states the expected size of the answer — this is one behaviour on one class of
actor, expect a single update path and no new subsystems — measurably narrows what comes
back, because an author with no stated target spends whatever the medium allows. State the
target shape, then grade the delivered shape against the stated target and not merely
against a ceiling.

## Failure modes of the naive reading

- **Catalogue completion.** Emitting several patterns because they are all known, as a
  display of competence. The output is well-formed, passes every structural check, and has
  a permanently elevated cost of change with no collected benefit.
- **Decoupling treated as an unconditional good.** Produces a program whose control flow
  exists only at run time, and whose bugs therefore have no callers.
- **The pattern named by the brief's vocabulary.** A design sentence containing the word
  "event", "state" or "pool" is a description of the fiction, not a specification of the
  runtime shape. Reading it as the latter is how a two-line consequence becomes a subsystem.
- **Generality nobody exercises.** A parameter with one call site, an interface with one
  implementation, a registry with one entry. Each is a prediction about a future that has
  not arrived, and each has to be maintained until it does.
- **Optimising the shape rather than the cost.** Adopting a famous performance pattern while
  the actual frame time is spent somewhere unglamorous. An optimisation adopted without a
  measurement is a guess wearing a pattern's name, and it is not made true by being a good
  pattern.
- **Assuming order-independence.** The defect that passes every test and appears in the
  field after an unrelated change to iteration order.

## Where this subject ends

The neighbouring concern of porting a designer-authored graph into code shares this
subject's vocabulary and answers a different question. There, a prior artifact already
exists and has already fixed the behaviour's shape; the entire burden is faithfulness, and
the defect is divergence from a source that can be diffed against. Here there is no prior
artifact — the shape is being decided for the first time, from a sentence — and the defect
is a shape no force in the problem justified. The rule for picking between them is simply
whether there is something to be faithful *to*: if a graph, a spec-with-a-schema or a prior
implementation fixes the behaviour, the question is fidelity; if only an intent exists, the
question is form.

The corpus of traps a large host system sets is likewise a supplier to this subject rather
than an overlap. That corpus states facts about a specific platform — what silently does
nothing in a reduced execution mode, which lookup lies, which construct cannot be authored
from code at all — and those facts are properties of the host, true regardless of what the
behaviour is. What this subject decides would be the same decision on a different platform,
because it is a property of the problem. The seam is real and worth naming: a platform's own
component model, its update phases and its allocator are *forces*, and they arrive here as
entries from that corpus and are consumed as inputs to a shape decision. A finding phrased
as "this call is inert without a display device" belongs there; a finding phrased as "these
four flags want to be a state machine" belongs here.

Generating one gameplay ability from a design sentence is the closest neighbour of all and
is separated by a single question: is there a schema on the other side? That subject's
artifact has a shape the runtime already dictates — fields, tags, a load format — so its
whole craft is agreement with a vocabulary, a schema and a registry that already exist, and
its acceptance layers test agreement. When there is no waiting schema and the output is
behaviour whose structure nobody has specified, agreement is not available as a standard
and form is what has to be judged. In practice the two run in sequence on the same feature:
the ability's declaration is an agreement problem, and the bespoke code the ability triggers
is a shape problem.
