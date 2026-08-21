---
layer: technique
type: technique
subject: people-analytics-ethics
technique: aggregate-vs-individual-split
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [designing an engineering dashboard with a personal view, a manager asks for a per-person breakdown, deciding what crosses between org and self views]
---

# Aggregate versus individual split

An engineering measurement product serves two audiences whose questions do not
overlap: an organization asking *where does our work slow down* and a person
asking *how is my own week going*. The split is the decision to build these as
**two producers over two row sets**, rather than one per-person dataset that a
filter narrows depending on who is looking.

## Why the filtered single dataset is the wrong design

The tempting design is one table keyed by person with an authorization
predicate on read. It is wrong for reasons that do not depend on anyone
behaving badly:

- The roster view already exists; only a predicate withholds it. Predicates
  are added, relaxed, parameterized, and bypassed — by an export, a support
  tool, a cache, a new endpoint, an agent-facing interface.
- The organizational question does not need it. "Where does review latency
  concentrate" is answered by area, stage, and time, not by author. Building
  the per-person table to answer it is scope the question never asked for.
- Once built, it will be used. Someone will correctly observe that the data
  is right there and the manager view is a small change, and the argument
  will be hard to win on principle after it was lost on architecture.

## The two sides

**The organization's side** is built from shapes that never carried an
identity into the result set: counts by area, distributions by stage, trends
over windows, cohort summaries above a naming floor. Where an identity is
needed transiently — to count distinct contributors, to detect concentration
— it is consumed inside the aggregation and does not survive into the output.
Every number carries its predicate and its window, because an aggregate whose
population is unstated is the one that gets quoted about individuals later
([law: count carries predicate](../../../../_laws.md#count-carries-predicate)).

**The individual's side** is computed in a scope that admits exactly one
identity, the viewer's own, and is structurally incapable of returning a
second (the properties that keep it that way are
[private-view-separation](./private-view-separation.md)). It is also a
*different report*, not a filtered copy: the useful personal view is
formative — what is in flight, what is waiting on me, what I finished, how
my own last month compares to my own previous month. Rank against colleagues
is precisely the content that must not appear, and its absence is the
feature.

## What may cross the line

A short, closed list, each item with a rule:

- **Definitions may cross.** What counts as a review, a change, a completed
  unit of work — shared, so the person's own view and the organization's view
  do not disagree about arithmetic. Two definitions is how a person is told
  their number is wrong.
- **Aggregates may cross downward.** A person may see the team or
  organization aggregate they belong to, provided it clears the naming floor,
  because comparing yourself to a group median is orientation, not exposure.
- **Individual values may not cross upward.** A person's row does not appear
  in a management surface, in an export, or in a summary that names them.
  What crosses upward is a contribution to an aggregate, and only that.
- **Nothing crosses sideways.** One person seeing another's individual view is
  not a permission level; it is the surveillance design under a different
  name.

## Decision rules

- **When a requested organizational feature requires the per-person row set,
  reframe the question before building the row set.** Nearly every genuine
  management need — bottlenecks, concentration risk, coverage gaps, capacity
  — has an artifact-level phrasing that carries the same decision. The one
  that does not is usually an evaluation request, which is an HR process with
  its own governance, not a dashboard feature.
- **When a shared component is used by both sides, pass it data, not a
  scope.** A visualization that accepts rows is fine; a visualization that
  accepts a "whose data" parameter has moved the split into the view layer,
  where the whole technique fails.
- **When a person's view needs a comparison**, compare them to their own
  history first, to a floor-cleared group aggregate second, and to a named
  colleague never.
- **When both producers must exist in one system**, keep them in separate
  modules with separate names and a comment on each stating which side of the
  line it serves. The next engineer's default is to reuse the nearest query.

## When not to use it

- **A single-person tool** — a product whose only user is the person measured
  — has no organizational side, and inventing one to satisfy symmetry
  manufactures the risk the technique exists to prevent.
- **Genuinely public collaborative data**, where contribution history is
  already published to the world by the platform it lives on, does not need
  the split re-imposed inside a tool that merely displays it. The split
  protects data whose exposure the person did not already accept; check
  which kind you have rather than assuming.
- **Formal performance review systems** are out of scope in the other
  direction: they name individuals by design, under consultation, consent,
  and appeal processes this technique does not provide. Do not attempt to
  turn an analytics product into one by adding permissions.
