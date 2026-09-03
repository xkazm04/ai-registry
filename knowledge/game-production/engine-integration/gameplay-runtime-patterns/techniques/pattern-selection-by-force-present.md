---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: pattern-selection-by-force-present
status: forged
laws: [a-budget-shapes-the-output, structural-proof-is-never-sufficient]
shared_with: []
use_when: [briefing an automated author on which runtime shapes it may use, reviewing generated code that is correct but structurally heavy, deciding whether a proposed abstraction has earned itself]
---

# Pattern selection by force present

The named concern: bind every structural element in a piece of generated gameplay code to a
condition in the problem that demanded it, so that a shape without a demanding condition is
removed as a defect rather than tolerated as taste. The procedure produces two artifacts — a
force inventory taken from the brief before authoring, and a per-element justification
checked after — and the second is only meaningful because the first was written down first.

## The force inventory

Take it from the design sentence, before a line of implementation exists, and write it as
answers rather than as questions. Seven entries cover nearly all gameplay behaviour.

**Population.** How many instances exist simultaneously, and is that count bounded by
something real? "One per player" and "up to two thousand projectiles" select different
shapes and different storage.

**Cadence.** Does this run once, on an occurrence, or every step? Only *every step* makes
per-instance cost a budget question at all.

**Span.** Does the behaviour occupy more than one step, so that it must remember where it
was between steps? A behaviour with span has states whether or not anyone models them.

**Audience.** Who must learn that this happened, and is that set fixed at authoring time or
only at run time? Fixed is a call. Varying is a subscription.

**Deferral.** Must anything happen at a *later time* than its trigger, rather than merely in
a different module? Only deferral buys a queue; a queue bought for module separation alone
has bought the wrong thing at the wrong price.

**Variance.** How does one instance differ from the next — in numbers, or in conduct? This
single answer decides the whole growth axis.

**Adjacency.** Does the work grow with the square of the population, because every
participant must consider every other? This is the only entry that justifies a spatial
structure.

An inventory with every entry answered "one, once, no, nobody, no, not at all, no" is the
common case, and its correct output is a direct implementation with no named pattern in it.
That result must be reportable as a success. A procedure that cannot return *nothing is
needed* will always find something.

## Mapping forces to shapes

Each shape has exactly one force that buys it. Stating the mapping this narrowly is what
makes the rejection rule enforceable.

- Span with distinct modes and illegal transitions → an explicit state machine. Without it,
  the states exist anyway as independent flags whose invalid combinations nothing forbids.
- Varying audience → subscription. Fixed audience → direct call.
- Deferral → a queue. Nothing else in the catalogue moves work in time.
- Variance in numbers → one type reading a data row. Variance in conduct → a behaviour
  selected from a closed vocabulary, or a narrow override hook.
- High churn of short-lived instances inside a step budget → a pool.
- Quadratic adjacency above a measured population → a spatial structure.
- A value that is expensive, read more often than written → a cached value with an
  invalidation flag.
- Mutual dependence on last step's values within one step → a read copy and a write copy.

Anything a proposed element claims to buy that is not on this list is a claim to inspect,
not a claim to accept. "It is more testable", "it is more extensible" and "it separates
concerns" are not forces; they are restatements of the pattern's own advertising, and each
of them is answerable with a concrete question — testable against what test that is
currently hard to write, extensible toward which named extension that is currently on the
plan.

## Decision rules

- **When a structural element has no named force, delete it, because its cost is certain and
  its benefit is hypothetical.** The deletion is a correctness-class fix, not a preference,
  and should be reported in the same register as removing dead code.
- **When the brief supplies a force but no shape answers it, that is the more urgent defect.**
  Over-structure costs comprehension permanently; under-structure costs correctness
  intermittently, and intermittent is worse. Run both directions of the check in one pass or
  the codebase will oscillate between the two failures.
- **When a force is predicted rather than present, do not buy the shape.** "We will
  eventually have many of these" justifies keeping the direct implementation small enough to
  replace, not building the structure now. A prediction that has not arrived is maintained
  at full cost until it does.
- **When the brief's vocabulary names a pattern, ignore the vocabulary and re-derive from the
  forces.** A design sentence containing "event", "state" or "spawn pool" is describing the
  fiction. Reading the fiction's nouns as an architecture is how one line of consequence
  becomes a subsystem.
- **State the expected size of the answer in the brief, and grade the delivered size against
  it.** An author with no stated target spends what the medium allows, and structure is what
  it spends on. "One update path on one actor class, no new subsystems" is a budget, and it
  changes the output measurably rather than merely capping it.
- **Never accept a structural check as evidence that the structure was warranted.** That the
  element compiles, is registered and is exercised by a test says only that it exists. The
  question of whether it should exist is answered by the force inventory and by nothing
  below it.

## Where the inventory is written down

Two places, and both matter. In the briefing handed to the author, so that the constraint
operates at generation time — where it is nearly free — rather than at review time, where
removing a shape means unpicking everything that grew around it. And alongside the delivered
code as a short justification list: one line per structural element naming its force. That
list is the review surface. Its most useful property is that it is embarrassing to write for
an unjustified element, which does more work than any automated check.

The list decays like any other claim about a moving artifact. When the behaviour's brief
changes, the inventory is retaken; an element whose force has since disappeared is now
unjustified, and the correct action is to remove it rather than to leave it because it works.

## When not to use this

- **When a house architecture already dictates the shape.** A codebase that runs every actor
  through one component model has already made these decisions, and re-litigating them per
  feature produces inconsistency, which costs more than the occasional unnecessary shape.
  Conform, and record the disagreement somewhere it can be raised once at the architecture
  level.
- **On a genuine prototype with a stated disposal date.** Force analysis is an investment in
  a file's future readings. Code with no future readings does not repay it — but the disposal
  date has to be real, because the most expensive architecture in any project is the
  prototype nobody threw away.
- **As a bar against a human author's considered judgment.** The procedure exists because
  automated authors have read the entire catalogue and have no cost model for indirection. An
  engineer who names a force this technique does not list has probably found a real one; take
  the finding and extend the inventory rather than rejecting the shape.
