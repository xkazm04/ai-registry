---
layer: technique
type: technique
subject: plan-review
technique: silent-decision-surfacing
status: forged
laws: [silent-state-is-ungoverned, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a plan reads as obviously correct and nobody can say why, deciding which choices in a proposal were never actually chosen, a team has good written rationale and still cannot explain its own conventions, routing a recurring choice into a standing instruction file]
---

# Silent decision surfacing

A plan is a good record of what was said and a poor record of what was assumed. A
separate read-only reader maps the decisions the plan committed to without naming
them — a default inherited from a framework or a training prior, an alternative never
mentioned, a known pattern implemented unnamed, a consequence accepted in passing — and
emits each material one as a short story with a `pending` disposition. A person writes
the disposition. The reader never does.

The failure this addresses is not sloppiness. A competent author writes down the choices
they know they made; the ones this reader finds are the ones that did not present
themselves as choices. That is the whole of the difficulty and the reason no instruction
to the author fixes it.

## Why an author-written rationale record does not cover this

The standard instrument for architectural rationale is written by the decider, about a
choice they know they faced, after they faced it. It is excellent, it should exist, and
it is absent *exactly* where this reader is needed — because a choice nobody noticed
making produces no record by construction. The two artifacts are not redundant and not
ranked: one is the decider's account of a decision, the other is an observer's claim
that a decision occurred. A plan can carry a rich set of the first and the whole of this
debt at the same time, and a team that reads its rationale coverage as evidence to the
contrary has measured the wrong thing.

The named cost is the absence of externalized rationale that later readers — people and
agents alike — need to change the system safely, and it accrues fastest when generation
outruns understanding. A machine authoring plans at machine pace is precisely that
condition: the volume of unstated commitments rises with throughput while the number of
people who could have noticed them stays flat.

## The lenses

Each surfaced item comes from one of a small closed set of lenses, and naming the lens
is what makes the aggregate reading below possible:

- **Inherited default** — the plan takes the framework's, the language's, or the
  model's habitual answer without stating that an answer was needed.
- **Unmentioned alternative** — a fork with a real second branch, taken silently.
- **Unnamed pattern** — a recognized solution implemented without its name, so nobody
  downstream can find the literature or the prior instance.
- **Accepted consequence** — a cost the plan takes on in passing: a coupling, a
  latency, a migration nobody will want to run.

A finding that fits no lens is usually an objection, and the routing rule decides it
rather than the reader's taste: it belongs here if dropping it would leave a decision
unrecorded but no class of failure undetected, and in the objection record if dropping
it would leave failures undetected. Both readers apply the same rule before emitting.

## Selectivity is leverage, not severity

The reader emits five to eight stories against a hard cap, ranked by **what would
compound if it were recorded** — not by how serious the consequence is. A large
consequence everyone can already see is a poor story; a small default that will be
copied into the next forty decisions is an excellent one. Ranking by severity produces
a list that duplicates the objection record, which is the failure mode that makes teams
delete one of the two readers.

The cap is hard and the floor is soft. A reader that pads to a count produces noise that
masks its own signal, and the padding is undetectable downstream because a weak story is
still a true story. So: fewer is allowed, more is not, and the case where the reader ran
and found nothing material gets a reserved way to say so rather than an empty list, since
an empty list and a reader that never ran must be spelled differently
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The story's shape

Four parts, and the second is the one that gets dropped first and matters most:

- **The decision, stated as a decision** — "X was chosen" rather than "the plan uses X".
  The grammar is the technique: a description invites agreement, a decision invites a
  disposition.
- **The anchor** — where in the plan it is visible, quotably. A story with no anchor is
  a claim about the author rather than about the plan, and it cannot be checked.
- **The alternative** — what else was available, in one line. Without it the reader has
  reported a fact, not a decision, and the person disposing has nothing to weigh.
- **The lens**, so the aggregate reads.

Rationale on the disposition is the person's, and it is what converts the story from an
observation into governed state
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

## Dispositions, and the one that routes

`accepted` — the decision stands as made. `revisit` — it stands for now and is worth
returning to. `promoted` — this is not a decision about this plan at all; it is a
standing convention, and it belongs in the repository's standing instruction file so the
next plan inherits it explicitly rather than silently.

`promoted` is the only disposition with a destination, and it is worth being strict about
which stories qualify, because the standing file is a paid, always-loaded floor that gets
worse as it grows. A story qualifies when the same choice would recur across unrelated
tasks, the answer is stable, and the agent could not have reached it by reading the
codebase. A story that fails the last test is reachable material, and putting it in the
file costs every future session and buys a few tool calls once. What the file may
contain, and the admission test it applies, belongs to the subject that owns it; this
technique's job ends at the route.

## Reading the aggregate

The individual stories are worth their cost. The distribution across many plans is worth
more, and it is the part nobody builds because it requires the lens label to have been
recorded:

- **Inherited defaults dominating** — the conventions need work, not the plans. The
  planner is answering questions the repository should have already answered.
- **Unmentioned alternatives dominating** — planning is running too narrow, often because
  the task framing arrived over-specified.
- **`revisit` clustering on unnamed patterns** — the team implements patterns without
  naming them, which is a communication cost that shows up later as two people building
  the same thing twice.
- **`promoted` running high** — the standing instruction file is behind the team's actual
  conventions, and the surfacing reader has become the mechanism keeping it current.

Every one of these is a count and travels with its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): over how many
plans, at what cap, with how many dispositioned. A lens share computed over plans whose
stories were mostly never dispositioned describes the reader, not the team.

## When not to use it

- **On a plan that will not be built.** The reader costs a model call and a person's
  attention; spend both on plans that become work.
- **When the objection reader is not running.** Alone, this reader produces a record of
  decisions with no record of risks, and a reviewer with only the first develops a
  well-documented blind spot. If only one can run, run the objection reader.
- **As an audit of a person.** The stories name decisions, never authorship quality, and
  a team that reads the record as a scorecard will get plans written to minimize
  surfaceable decisions — which is achieved by explaining less.

## What this cannot do

It cannot tell whether a surfaced decision was *right*. The reader has no more context
than the plan and whatever it was given, and its claim is only that a choice occurred
without being named. It also cannot surface a decision the plan does not visibly commit
to — the assumption held entirely in the author's head and never expressed leaves no
anchor, so it stays invisible to this instrument exactly as it stays invisible to the
reviewer. The technique narrows the gap; it does not close it, and a pipeline reporting
that its plans have no unnamed decisions has learned something about its reader.
