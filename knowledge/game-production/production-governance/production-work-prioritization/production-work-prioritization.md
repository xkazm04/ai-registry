---
layer: golden-path
type: golden-path
subject: production-work-prioritization
status: forged
use_when: [deciding what a production team should build next, designing a recommendation engine over production evidence, an operator is staring at a wall of amber and asks what to touch first, auditing why a ranked backlog keeps recommending the wrong thing]
techniques:
  - curriculum-prerequisite-graph
  - five-factor-weighted-scoring
  - fan-out-max-not-sum
  - null-success-odds-with-sample-provenance
  - blocked-if-any-produced-feature-is-blocked
  - urgency-ladder-for-what-next
---

# Production work prioritization

Left alone, a production plan drifts toward whatever is most visible and whatever was
most recently complained about. This is not a failure of discipline. It is what happens
when the only instrument in the room is a meeting: the loudest signal wins because it is
the only signal anyone is holding. The work nobody can see — the substrate three other
teams are quietly waiting on — has no advocate, and so it is scheduled last, which is
precisely backwards.

The antidote is not a better meeting. It is an **instrument**: a mechanical procedure
that reads the team's own production evidence and emits an ordering, with its reasoning
attached, so that a human argues with the *factors* rather than with the person holding
the floor. This subject is the craft of building that instrument.

Two things must be true of it before it is worth having. It must **refuse to fabricate**
— an item with no evidence behind it scores nothing, and says so, rather than borrowing a
plausible middle value. And its output must be **arguable**: a bare rank is a black box
and will be dismissed as one within a week, correctly. A rank with its factors, its
weights and the rows it was computed from is a claim someone can disagree with
specifically, which is the only kind of disagreement that improves a plan.

## The two-stage shape

Prioritization is not one computation, it is two, and collapsing them is the most common
structural mistake.

**Stage one is eligibility, and it is a graph question.** Some work is not merely
low-value right now, it is *not yet meaningful* — the thing it would be built on does not
exist, so building it produces something nobody can test and everybody will rewrite.
Eligibility is answered by a prerequisite graph and by blocked-state propagation, and its
answer is boolean. An ineligible candidate does not get a low score; it gets excluded,
with a named blocker.

**Stage two is ranking, and it is a scoring question** over what survived stage one. Here
the small number of declared factors do their work, and here the evidence quality matters.

The reason to keep them apart is that they fail differently and are argued differently. A
wrong eligibility answer is a structural claim you can check against the graph in a
minute. A wrong rank is a judgment about weights. Fold eligibility into the score as "a
few points off for being blocked" and blocked work floats into the top ten whenever its
other factors are strong — which is exactly when it is most tempting and most wasteful.

## The prerequisite graph is a curriculum, not a build order

The graph that decides eligibility is easy to confuse with a technical dependency graph,
and the confusion is expensive. A build order says what must *compile* first. A curriculum
says what must **exist and be exercisable** before the next thing can be meaningfully
built or tested at all.

A playable character must exist before an ability framework has anything to attach to, and
both before combat has anything to resolve, and combat before loot has an occasion to
drop. Nothing in that chain is a compile-time dependency; loot tables can be authored on
day one and will compile perfectly. The chain is about **whether the work can be
judged**. Loot authored before combat exists is loot no one can feel, and it will be
retuned from scratch the week combat lands.

That is the discipline: every edge in the curriculum graph exists because the downstream
work would otherwise be *unjudgeable*, not merely uncompilable. An edge you cannot justify
in those terms is a preference someone smuggled in as a constraint, and it will block real
work for a quarter before anyone notices.

## Rank on a few named factors, and publish the weights

A recommendation that cannot be argued with is not used; it is overridden silently, and
then the instrument is decoration. So the ranking is built from a small number of named
factors — five is a workable number, three is thin, nine is unreadable — each contributing
a bounded number of points from a published weight table, summing to a stated ceiling.

Publishing the weights does something subtle: it moves the argument from "your tool is
wrong" to "urgency should be worth more than success odds", which is a *design* argument
the team can actually settle. And the breakdown must travel with the score to whatever
renders it, never be re-derived downstream. Two computations of the same quantity is two
answers, and the disagreement stays invisible until it is load-bearing.

## The score is only as true as its binding

This is the lesson that most instruments learn late and painfully. A score is computed
over some set of evidence rows, and something had to decide *which rows* — which
measurable artifacts a given backlog item actually produces. That decision is a binding,
it has quality tiers, and its quality caps everything computed on top of it.

Three rules follow, and they are not optional.

**An explicit binding is terminal, including when it is empty.** If the mapping says this
item produces nothing measurable, the item scores no fan-out and no impact and reports
that nothing can evidence it. It must never fall through to a fuzzy name match that
borrows the fan-out of a same-prefix neighbour and prints a confident "unblocks four
downstream features" about an item that unblocks none.

**A heuristic binding is labelled everywhere it is quoted.** Name-similarity matching is a
legitimate fallback where no declared map exists, and an illegitimate basis for a
confident sentence. The label travels with the recommendation, in the same payload as the
score.

**Binding provenance is part of the output, not a debugging detail.** Which rows, how the
relation was established, and which declared names resolved to nothing — reported, never
silently dropped. An unresolved name is a defect in the map and is the cheapest possible
thing to fix, but only if something says it out loud.

## Refusing to score is a result

The factor that most tempts fabrication is expected success — the probability that this
work, attempted now, lands. It is genuinely useful and it is genuinely unavailable on a
young project, and the gap between those two facts is where instruments start lying.

The rule is flat: with no sample, the odds are **null**, the factor contributes zero
points, and the display drops the factor rather than showing an empty bar. Not one-half.
A neutral constant renders as a confident statement — "half of past attempts at similar
work succeeded" — about work that has never been attempted once, and it is worse than
silence because it is indistinguishable from a measurement. Where a rate does exist it
carries its sample: what it was computed from and how many observations stand behind it.
A bare percentage is not a number, it is a rumour with a decimal point.

There is a quieter version of the same failure. If a factor reads its evidence from a
source that nothing in the system actually writes, the factor is structurally dead and
every recommendation silently scores it as absent forever. Assert that each evidence
source is *reachable* — that some real path populates it — before trusting a zero from it.
A factor nobody feeds and a factor honestly measuring nothing look identical from inside.

## Two instruments, two scales

There is a second question that looks like the same question and is not: an operator is
looking at one entity, or one screen of them, and asks *what do I touch first*. The
answer to that is a **ladder** — a fixed, deterministic order over states, walked top
down, returning the first match.

The distinction is worth stating sharply, because building the wrong one first wastes a
month.

- A **ladder** ranks *states*, needs no history, no weights and no calibration, and gives
  the same answer twice for the same screen. It answers "next action here".
- A **score** ranks *candidates* across a whole project, needs an evidence corpus and a
  weight policy, and is only as good as both. It answers "where should the team's next
  week go".

**Build the ladder first.** It is a day's work, it is correct on day one, it needs no
accumulated evidence, and it delivers most of the operator-facing value. The score earns
its keep only once there is a real corpus to rank over — and a project young enough to
lack that corpus is exactly the project where a score fabricates most.

Two ladders over the same entity will eventually be two *different* ladders, and then the
same entity is told two different things by two surfaces of the same tool. Hold the order
as data in one place, consumed by every surface, so it cannot fork. A rung missing from
one copy is worse than a wrong rung: the surface that lacks it coaches confidently against
a state it has no way to distrust.

## What this instrument cannot do, stated honestly

It cannot know a publisher deadline, a contractual milestone, or a creative bet the
studio has decided to make. It cannot price the strategic value of a vertical slice for a
funding conversation. It cannot see that one engineer is about to go on leave. It has no
opinion about morale, and morale schedules real work.

So the output is an **input to a decision, never the decision**. The correct use is: the
instrument proposes, a human overrides with a stated reason, and the override is recorded.
Recorded overrides are the calibration data for the weights — when the same factor is
overridden the same direction six times, the weight is wrong, and that is the only
trustworthy signal you will get that it is wrong.

Two failure modes of the naive reading are worth naming because both look like success.
The first is **the instrument as an authority**: teams stop arguing, the ranking becomes
the plan, and the factors it cannot see stop being discussed at all. The second is
**weight-tuning as a substitute for evidence**: the ranking looks wrong, so the weights
get adjusted, and adjusted again, when the actual defect is a stale or fuzzy binding
underneath. Always check the binding before touching a weight.

## Seams with adjacent concerns

The status taxonomy this ranking consumes, and the provenance ladder that says how
strongly a given row is evidenced, are owned upstream by coverage measurement — this
instrument *reads* them and must not redefine them. The gaps that become ranked candidates
in the first place typically arrive from design-document compliance scoring, and that
scoring is a separate concern with its own rubric. An unattended build loop is a downstream
*consumer* of this ranking: it takes the top candidate and works it without a human in the
loop, which raises the stakes on the refusal rules above considerably — a fabricated
success probability that a human would have laughed at will be acted on by a machine. And
the acceptance tiering that decides when a produced artifact is done is what feeds the
states the ladder ranks over.
