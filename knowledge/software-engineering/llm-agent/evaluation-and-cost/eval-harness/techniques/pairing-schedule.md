---
layer: technique
type: technique
subject: eval-harness
technique: pairing-schedule
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [a pairwise arena reports a leaderboard rather than a winner, candidates entered the comparison at different times, a bracket eliminates a candidate after one comparison, ranking candidates that were never compared with each other, deciding how many comparisons an arena owes each candidate]
---

# The pairing schedule

[comparison-modes](./comparison-modes.md) names the pathologies of a pairwise
arena — position bias, ties, compressed magnitude, intransitivity, no gate and
no trend. Each of those is a property of a *comparison*. This technique owns the
one property that belongs to the **set** of comparisons: which pairs were run at
all, and how many times each candidate appeared.

A full round-robin over n candidates costs n(n-1)/2 comparisons and is almost
never affordable, so every real arena runs a **schedule** — a rule that picks the
next pair. The schedule is usually inherited rather than chosen: a bracket
because brackets are easy to implement, or "whatever the queue handed us". It
then decides the ranking, because a rating fitted to a sparse graph is a
statement about that graph as much as about the candidates.

> **A pairwise ranking is a claim about a comparison graph. Report the graph, or
> the ranking is unfalsifiable.**

## Elimination finds a winner; it does not rank a field

The cheapest schedule is a gauntlet: a standing champion meets challengers one at
a time, the loser leaves, n-1 comparisons settle a winner. The economy is real
and the winner is meaningful. What it does not produce is an order over everyone
else, and the failure is not subtle once stated: **the number of comparisons each
candidate received is a function of when it arrived, not of how good it is.** A
candidate that entered first and held the seat for nine rounds carries nine
results; one drawn late and beaten immediately carries one. Sorting the field by
wins therefore sorts it largely by survival time, and survival time is an
artifact of the draw.

The same holds for the losers' identities. A gauntlet tells you that the champion
beat the specific sequence it happened to face. It says nothing about the
candidate eliminated in round two by the strongest entrant in the pool, which a
different draw would have carried to the final. Intransitivity, which
comparison-modes records as a hazard of the *data*, becomes a hazard of the
*schedule* here: a sparse graph cannot detect a cycle it never sampled, so the
total order it emits looks cleaner than the evidence supports.

The rule that follows is a reporting rule, not a scheduling one. **A bracket
reports its winner and the path that produced it. It does not publish a
leaderboard**, and a table sorted by win count from bracket data is the collapsed
margin wearing a new hat.

## Exposure is balanced across sessions, because it cannot be balanced within one

An arena driven by human raters cannot balance a single session: the bracket is
sequential, the rater stops when they stop, and whoever entered late was seen
less. So the balancing lives one level up, in the scheduler that draws pairs
across *all* sessions — it tracks each candidate's accumulated comparison count
and biases the draw toward the under-served, so that exposure converges as the
population of raters grows even though no individual session is balanced.

Two consequences the harness must hold:

- **Position within the session is a second, independent axis.** Balancing how
  *often* a candidate appears does not balance *where* it appears; a candidate
  drawn systematically into late rounds meets a stronger field and faces raters
  who are more fatigued. The draw randomizes entry order as well as opponent,
  and the two are recorded separately, because a fix for one is regularly
  mistaken for a fix for the other.
- **The aggregate is not readable until exposure has converged.** An arena
  published on its first day reports the draw. The harness therefore carries the
  per-candidate comparison count as part of the result and refuses the ranking
  view below a declared floor
  ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)) —
  a rating without its n is the same defect as a pass-rate without its trial
  count, and it arrives with more authority because it is sorted.

## Connectivity is the precondition for a total order

Rating systems fitted to pairwise outcomes return numbers whether or not the
comparisons support them. The structural question they cannot ask themselves is
whether the graph is **connected**: if two groups of candidates were compared
inside each group and never across it, no amount of data orders one group against
the other, and the fitted ratings will nonetheless place them on one axis,
separated by a gap that is an artifact of initialization.

This is the arena's version of the absent-reference problem: the honest output is
that the comparison was not made. The harness checks the graph before it renders
an order — every candidate reachable from every other through some chain of
comparisons — and where it is not, it reports **components, not a leaderboard**.
A candidate added after the arena opened begins in its own component and joins
the main one only once it has been drawn against an established candidate; until
then its rating is a prior, and publishing it beside settled ratings implies a
comparison that never happened.

### Widening the interval is the other honest answer

Refusing the order is correct and often unaffordable. Where the ranking is the
product — a public leaderboard, a shared scorecard pooled from many independent
contributors who each measured on their own cases — suppressing it until the
graph connects means shipping nothing, and the components never do connect,
because no contributor has a reason to run someone else's cases.

The alternative is to keep the order and **move the incomparability into the
uncertainty**, where a reader already knows to look. Treat each component as a
source with its own mean, and publish a random-effects interval: the point
estimate stays a weighted mean, and the half-width carries a between-source term
alongside the within-source one, so **candidates whose components disagree get a
wider interval than candidates whose components agree.** The failure this
prevents is specific and is the default behaviour of the obvious implementation:
pooling every observation into one sample and dividing by the total count makes
the interval *shrink* as contributors are added regardless of whether they agree,
so a candidate measured by five mutually contradictory sources is published as
more certain than one measured by five that concur — the exact inverse of what
the ± is read to mean.

Three properties make this a disclosure rather than a fudge. The between-source
term is **undefined, not zero, at one source** — a single-component candidate has
no cross-source evidence by construction, and reporting `none` says so where a
zero would claim agreement. At two it is a **lower bound**, since two sources
cannot distinguish concord from luck. And the estimator is chosen to need only
what every contributor actually has: one requiring a per-source within-variance
will be fed assumed zeros by the contributors that never recorded one, which is
precision theatre over data that does not support it. Over-stating the spread
slightly is the direction to err — on a published ranking, an interval a little
too wide is a smaller lie than one too narrow.

Which of the two answers applies is decided by what the ranking is for. A
selection made once, internally, can wait for the graph to connect. A ranking
that is itself the deliverable cannot, and owes the widened interval instead.

## What the schedule must record

The schedule is part of the instrument, so it is versioned with the rest of it
([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).
The run artifact carries the draw rule and its parameters, each candidate's
comparison count and entry round, the graph's component structure, and the rule
by which pairwise outcomes were collapsed into an order — declared before the
data, like every other aggregation. Change the draw rule and the ratings before
and after are different series that must not be spliced, for exactly the reason a
changed judge packet produces a different series: the instrument moved.
