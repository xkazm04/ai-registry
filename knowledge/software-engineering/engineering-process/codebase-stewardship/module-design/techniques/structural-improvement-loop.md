---
layer: technique
type: technique
subject: module-design
technique: structural-improvement-loop
status: forged
laws: [gate-sees-target, failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [scheduling deliberate structural work, turning a vague complaint about the codebase into a reviewable proposal, deciding what a large refactor should produce before any code is written]
---

# The structural improvement loop

Structural work is a **deliberate periodic pass, not a review-time reflex.**
That follows from how decay happens: no single change is guilty, so no
per-change process can catch it, and a reviewer who blocks the increment in
front of them is wrong on the merits of that increment. What is needed instead
is a pass that looks at accumulation, on a clock, with its own unit of work.

The loop has four stages and the order is load-bearing: **sweep for candidates →
ground both ends in real code → elicit the target shape with a human → emit a
specification rather than a change.**

## Why this is not the scanning pipeline

The boundary is worth settling explicitly, because both disciplines look at a
whole tree and produce a list.
[codebase-scanning](../../codebase-scanning/codebase-scanning.md) owns the
mechanics of sweeping and the lifecycle of a finding. This loop owns what a
*structural candidate* is and what is done with one. The two differ in every
property that decides where a pipeline belongs:

- **The unit of work.** A finding has one location. A structural candidate has
  at least two, plus the relation between them — the relation *is* the finding,
  and a queue keyed by location cannot hold it.
- **The precision model.** A scanning rule has a measurable precision against
  the live population, which is what lets a rule graduate into a gate
  ([quality-gates](../../../standards-and-gates/quality-gates/quality-gates.md)).
  A structural candidate cannot: judging it requires knowing where the product
  is going, which is not in the tree and therefore not in any rule's reach.
- **The terminal state.** A finding terminates in a fixed defect. A candidate
  terminates in an *agreed target shape*, which may be reached by several
  different changes over months.
- **The economics.** Scanning is frequent, cheap, incremental and tuned for
  recall. This pass is rare, expensive, whole-tree and tuned for precision,
  because each accepted item consumes a large amount of somebody's attention.

They connect in one direction: a **cluster** of scanning findings concentrated
in one region is good evidence for a structural candidate. It is evidence, not a
candidate — the findings are symptoms and the candidate is a claim about the
shape that produced them.

## Stage 1 — what a structural candidate looks like

Candidates are recognisable and mostly mechanical to surface:

- **Change scatter**: a class of change that repeatedly touches several
  unrelated places (see [locality-and-leverage](./locality-and-leverage.md) for
  how to measure it honestly).
- **An options surface growing one entry per caller** — a boundary collecting
  decisions instead of making them.
- **A seam with an escape hatch**, or a concern reached by paths that bypass its
  adapter ([seams-and-adapters](./seams-and-adapters.md)).
- **Knowledge in two places**: one format, enum, ordering rule or unit
  assumption encoded independently on both sides of a boundary.
- **A grouping whose name no longer predicts its contents**, or a module whose
  one-sentence job cannot be stated without "and".
- **A test that must construct five unrelated things to exercise one** — the
  most reliable structural complaint in any codebase, because it is a
  measurement of coupling that somebody already paid for.

## Stage 2 — ground both ends before anybody discusses it

**A candidate names at least two concrete places and quotes the relation between
them before it is discussed at all.** This is the stage that is skipped and the
one that decides whether the exercise works.

An ungrounded structural proposal is unfalsifiable. "The data layer is a mess"
cannot be agreed with or disagreed with, so the conversation becomes taste, and
taste conversations are settled by seniority rather than evidence — which is why
they recur every year with the same participants and the same outcome.

Grounding also kills candidates cheaply, which is most of its value. A large
fraction dissolve the moment somebody opens both ends: the coupling was removed
last quarter, the duplicate is generated from the same source, the two modules
that "obviously" belong together have not changed in the same month for two
years. Killing those before the discussion is what keeps the pass affordable.

The failure to guard against is a proposal argued from an index, a summary, a
dependency graph or a previous pass's notes rather than from the code — a check
run over a proxy passes exactly when the proxy has diverged from the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and a stale map is
the most persuasive proxy there is, because it was accurate once.

The discipline that makes this survive a recurring pass: **the loop's memory
records what was *done*, never what was *computed*.** Which candidates were
accepted, declined, executed and when is durable and worth carrying forward.
Every measurement — scatter counts, sizes, rankings — is re-derived from the
tree each pass and never inherited, because a derived number that outlives the
tree it was derived from is a proxy that has already diverged and does not
announce it. A pass that opens with last quarter's numbers has skipped stage 2
before it started.

## Stage 3 — elicit the target shape with a human

The question is not "is this bad." It is **"what should it be."** A pass that
only produces complaints produces a backlog of grievances; a pass that produces
targets produces work.

Elicitation output is a stated target expressed in the vocabulary this subject
provides — what gets hidden, where substitution becomes possible, which caller
gains leverage, which maintainer gains locality — **with the trade named**. A
target with no stated cost has not been thought through, and it will acquire its
cost later, in front of an audience.

One judgment belongs at this stage and nowhere else, because a mechanical sweep
structurally cannot make it: **systemic beats individual.** When one defect
shape dominates the candidate list across many places, the answer is a single
systematic pass, not one proposal per site — and the recognition has to happen
*before* the work is parcelled out, because afterwards it arrives as a dozen
independent changes that each solve a twelfth of the problem and collectively
prevent anyone from seeing it. A sweep ranks items; noticing that the items are
one item is the human's.

Who supplies what is covered by
[structure-is-not-delegable](./structure-is-not-delegable.md); the relevant
point here is that this stage is where the loop's only irreplaceable input
enters, and a loop that runs stages 1, 2 and 4 without it is producing plausible
output with the deciding factor missing.

## Stage 4 — emit a specification, not a diff

The output of the loop is a written target, not a change. Three reasons, and
the third is the one people underrate:

1. **The change is large and reviewable only as a whole.** A diff therefore
   arrives *after* the decision it should have informed, and "we have already
   written it" is a bad position from which to reconsider the shape.
2. **Two questions, two reviews.** *Is this the right shape* and *does this
   faithfully implement that shape* are different questions with different
   reviewers and different evidence. Merged into one review of one diff, they
   produce an answer to neither: the reviewer reads the mechanics because the
   mechanics are what is in front of them.
3. **A spec survives a failed execution.** If the change goes wrong halfway, a
   spec is re-executed. Without one, the decision is re-litigated from whatever
   half-finished state the tree is in — which is the worst moment to be
   deciding anything.

A spec carries: the current shape, grounded and quoted; the target shape; the
**invariant that must hold across the change** (behaviour preserved, pinned by
characterization tests before the first edit); the order of steps, with the
points at which the tree is independently landable and green; and a **stop
condition** — what state counts as done, so a partial migration is either
finished or explicitly recorded as a state the codebase is now in.

## Scope control: the substitution test

Structural changes bloat, and bloat is what makes them unreviewable. The check,
applied to every part of the change: **if this part were removed, would the
stated target go unmet?** Anything that survives removal is a separate change
riding along.

The loudest signal that scope has drifted is **net-new logic**. A structural
change moves, reshapes and deletes; when it starts inventing behaviour, either
the target was wrong or a second change has joined this one. Both are worth
stopping for, and stopping is cheap at that moment and expensive two days later.

## Cadence, and the absence with no alarm

This is periodic work whose absence is invisible. Nothing goes red. Tests pass,
gates pass, delivery continues, and the cost appears as changes that used to
take a day taking a week — a signal with a long lag and no threshold. Anything
with those properties is only ever done if it is **scheduled rather than
triggered**, because a trigger requires a signal and there isn't one.

Two rules make the schedule real:

- **Size the interval so that at most one "the structure was against us" story
  accumulates between passes.** That is a judgment rather than a measurement,
  and stating it as a number is what makes it a schedule instead of an
  intention.
- **Assert the instrument before reporting the result.** A pass that found no
  candidates and a pass that could not read the tree must be spelled
  differently
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  This matters more here than almost anywhere, because "the structure is fine"
  is the output everyone wants and the output a broken pass produces. Verify one
  finding against one real file every run before believing any of them.

## The backlog names its reaper

Each accepted spec is a created artefact and must say what retires it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). An
accepted-but-unscheduled spec decays silently: the code moves underneath it and
it becomes wrong without ever being rejected, so the next reader cannot tell
whether it is a plan or an archaeological find.

So every spec carries a review-by date, and at the next pass an unexecuted spec
is either re-grounded against the current tree or retired with a reason. **A
decline is recorded**, with its reason — an undocumented decline is
re-proposed every pass forever, and the loop's credibility is spent
re-explaining the same no.

## When not to run it

- **Mid-migration.** When the structure is deliberately in an intermediate
  state, every candidate found is the migration itself, and the pass generates
  noise that competes with work already decided.
- **On a codebase with a scheduled end.** Structural improvement is an
  investment in future changes; where there will not be many, the honest answer
  is to spend nothing.
- **With no capacity to execute.** A loop that generates specs nobody schedules
  is a machine for producing guilt, and its backlog has a decay problem it will
  not survive. Run it at the rate at which its output can be executed, and
  where that rate is zero, say so rather than producing a document.
