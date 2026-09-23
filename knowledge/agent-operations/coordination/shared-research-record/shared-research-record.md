---
layer: golden-path
type: golden-path
subject: shared-research-record
status: draft
use_when: [many self-directed agent sessions work one open problem with no dispatcher, designing what parallel research sessions publish to each other, a shared frontier keeps collapsing onto one approach, deciding whether a shared record actually helped a fleet]
techniques:
  - independent-reuse-evidence
  - explicit-explore-slots
  - typed-contribution-vocabulary
  - resolution-bounded-leaders
  - community-run-as-unit
---

# Shared research record

Put a dozen agent sessions on one open problem, give them no planner, no shared
conversation and no shared workspace, and let each one start, work and end on its own
schedule. The only thing they have in common is a record: an append-only history of what
each session tried, what it measured, what it believes and what it checked of somebody
else's. Every session reads the record before it chooses what to do, and publishes to it
before it stops. That record *is* the coordination. There is nothing else.

This subject owns the record's design: what a contribution is allowed to say, how a
contribution earns credit, how the frontier is shown to the next reader, and how anyone
can tell afterwards whether the arrangement helped. It is a small institution, and it has
the failure modes of the large ones it imitates. Scientific communities have run on
exactly this shape for centuries (local choice of problem, coordination through a shared
body of published work) and have paid for every one of its defects: citation farming,
fashions that exhaust a field, simultaneous discovery, results nobody tried to
reproduce. An agent community reproduces all of them in days instead of decades.

## Where this subject stops

Three neighbours hold adjacent ground, and a reader picks by asking which question is
being answered. *Can two sessions' writes interleave or overwrite each other?* That is
version control in a shared workspace (physical isolation, commit rituals, and the
intent ledger that records which paths a session expects to touch), owned in the
software-engineering bundle; this subject assumes sessions can already publish safely.
*Who decides what each session works on?* When a dispatcher carves the work and hands
out pieces, that is fleet orchestration, also owned there; this subject is the case with
no dispatcher, where participants choose for themselves from what the record shows them.
*How good was this run?* Grading a run is the
[measurement](../../measurement/agent-benchmark-design/agent-benchmark-design.md)
category's work; a record consumes those grades as inputs and never re-derives them. The
intent ledger deserves one more sentence, because the two are easy to confuse: a ledger
says *where* a session is working, and a research record says *what it found and what it
is trying*. A path-keyed claim prevents two sessions from editing one file. It cannot
prevent two sessions from having the same idea, because an idea has no path.

## Three naive records and how each fails

**The flat log.** Contributions in time order, every session reads the tail. It preserves
everything and allocates nothing: each reader is drawn to the same recent, high-scoring
entries, so the log behaves as a leaderboard with extra steps. A leaderboard read by
every participant is not a report. It is a synchronization signal, and a community
synchronized on one entry searches one basin.

**The vote.** Let participants mark what they found useful, and credit the most-marked.
Votes measure attention, which the leaderboard already concentrated, and endorsement
costs nothing to produce. A participant that extends its own branch ten times has
manufactured ten citations. Bibliometrics learned this long ago and excludes
self-citation from impact measures for the same reason.

**The untyped entry.** A free-text note with an optional number. Now a hypothesis with a
predicted value reads like a result, a failure is not written down because nobody asked
for failures, and a "confirmed" note with no artifacts carries the same weight as a
reproduction that re-ran the code. The record fills with claims of unknown kind, and the
next reader cannot tell what to trust.

Each failure has a technique that answers it, and together they make up the subject.

## Credit comes from other hands

A contribution's worth is what *other* participants built on it or reproduced. Its
author's own extensions and endorsements count for nothing. The rule is the
self-citation exclusion carried over, and it is what makes the score expensive to
fake: to raise a contribution's credit, somebody else has to spend effort on it.
Verdicts are replaceable: a verifier that changes its mind replaces its earlier
verdict's effect, and both stay in the history. The rule has a boundary a designer has
to state outright. "Other" is only as independent as the identities behind it, and many
accounts run by one operator, or many sessions of one model under one brief, share their
biases the way one author does. See
[independent-reuse-evidence](./techniques/independent-reuse-evidence.md).

## The vocabulary is the protocol

A closed set of contribution types, each with a validation rule and a weight, is what
lets a stranger read the record. Failures are results and are published with their
numbers. A hypothesis may not carry a metric. A verification names exactly one target
and is never the verifier's own work. In-flight and acknowledgement markers exist so
sessions can see each other, and they carry zero weight so they cannot be farmed.
Participants who state a predicted range before they run make their record auditable.
Communities tend to invent that habit whether or not the brief asks for it, and the
record should give it a field. See
[typed-contribution-vocabulary](./techniques/typed-contribution-vocabulary.md).

## Attention is allocated, not ranked

The central design decision is how the frontier is shown. One ranked list, however well
scored, puts the same head in front of every reader, and the community herds. The
exploration literature has the answer: bandit selection balances a candidate's
estimated value against how little it has been tried, novelty search shows that
abandoning the single objective escapes deceptive optima, and quality-diversity methods
keep the best solution *per region* instead of the best overall. A record applies these
by serving separate choices (refine the leaders, extend thin-but-promising work, open
untouched ground), with a penalty on near-duplicates and exploration pressure that rises
when the scores bunch near the best.

The herding needs a frontier that rewards being worked. A leaderboard of achievements
does, because the improved leader stays on top and becomes the next obvious parent. A
worklist of defects does not, because working an item removes it from the head. One
research fleet choosing from a single defect-ranked list measured *less* concentrated
than the same fleet's human-routed work. So measure concentration before adding slots.

The same decision answers idea-level rediscovery. When a shared frontier makes the next
step obvious, many participants take it at once. That is the multiple discovery the
sociology of science documents, and here it happens within the hour. An in-flight marker
keyed on a source or a path cannot see it, because the sessions share an idea, not a
file. Only a frontier that hands different readers different choices spreads them
out. See [explicit-explore-slots](./techniques/explicit-explore-slots.md).

## A leader must clear the instrument

The top of a shared frontier is an allocation, not only a report, because every reader
reacts to it. So a new leader has to beat the old one by more than the evaluator can
resolve: the spread of the same code across the machines the participants actually run,
and, for a fixed development set, the room that adaptive reuse of one holdout creates.
Below that margin the right record is a tie, and a tie at the top is exactly the state
the explore slots exist for. The leaderboard literature reached the same rule: a board
that moves only on a margin resists being overfit by its own participants. See
[resolution-bounded-leaders](./techniques/resolution-bounded-leaders.md).

## The unit of evidence is the whole community

Nothing inside one run can show that the record helped. Commits in one community are not
independent samples: they share a frontier, a brief and an evaluator, and each one
exists because of the ones before it. A mid-run change followed by an improvement is a
case, not an effect, because the community was already moving. The claim "the record
helped" is a comparison between whole community runs under matched agents, models,
compute, evaluator and wall clock: isolated sessions, a flat log, a central planner, and
the record with its views. See
[community-run-as-unit](./techniques/community-run-as-unit.md).

## What a principal practitioner holds

- **The frontier view is the policy.** Participants choose freely, but they choose from
  what they are shown, so the view decides what the community does next. Designing the
  view is designing the allocation, whether or not anyone calls it that.
- **Reuse beats votes as evidence, and reproduction beats reuse.** Building on a result
  is a bet placed with the builder's own effort. Reproducing it is a check. Endorsing it
  is neither.
- **A verification channel that never says no is measuring something else.** A long
  run of confirmations with no failures usually means the verifiers re-ran a
  deterministic evaluator on the same inputs. That confirms the number, not the claim's
  generality. Treat an all-positive verification record as a question about the
  instrument.
- **Where-claims and what-claims are different mechanisms.** A claim keyed on a path, a
  source or a subject address coordinates where sessions work. Spreading what they try
  takes the frontier view. A community that has only the first will duplicate ideas in
  parallel while never colliding on a file.
- **A pre-declared identity space helps.** Where the domain already has a taxonomy of
  subjects or methods, a claim can name the idea's slot before the work starts, and
  rediscovery becomes a checkable collision. Where it has none, similarity clustering
  finds duplicates only after they are published.
- **One run is one observation.** Its numbers are worth recording with their n and date.
  Its interventions are anecdotes until a matched comparison exists.

## A candidate law, stated and not written

One rule recurs across every technique here: *whatever the shared record ranks first,
the whole community does next.* It explains why votes concentrate, why a sub-resolution
leader moves everyone onto noise, why a single ranked list herds, and why rediscovery
clusters in time. It is offered as a candidate only. A law in this bundle needs
convergence across independent runs, and this subject was founded on one measured
community and one live fleet.
