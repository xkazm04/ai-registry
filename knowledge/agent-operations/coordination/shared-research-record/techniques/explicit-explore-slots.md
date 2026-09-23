---
layer: technique
type: technique
subject: shared-research-record
technique: explicit-explore-slots
status: draft
laws: []
shared_with: []
use_when: [designing the frontier view parallel sessions read before choosing work, a shared record's activity concentrates on one approach, sessions keep landing the same idea within hours of each other]
---

# Explicit explore slots

The concern: every self-directed session reads the same record and picks its next move
from what it sees first. Serve the frontier as one ranked list and the same head appears
to every reader. Each reader then makes the locally sensible choice, which is refining
the leader, and the community concentrates on one basin however diverse its members
are. **Serve the frontier as separate choices (exploit, explore-known, explore-novel),
never as one ranked list, and let the reader pick a slot as well as an item.**

## Why one list herds

A ranked list compresses two different questions, "what is best" and "what is worth
trying", into one order, and exploitation wins that compression because its evidence is
concrete. The classical answer is the upper-confidence bound: rank a candidate by its
estimated value plus a bonus that shrinks as it gets tried, so an untried candidate with
modest promise outranks a heavily worked one with slightly better numbers. Applied to a
tree of contributions, "tried" means how much follow-on work a node already has
relative to the whole record.

A single bound is still a single list, though, and a shared list has a property no
single-agent bandit has: every reader acts on it at once. Twelve sessions reading one
bound-ranked head all take the same top candidate in the same hour, and the bonus that
should have spread them only updates after they have all published. Separate slots fix
this by construction. The readers are offered different kinds of move, so they do not
converge on one item just because the ranking is shared.

## The three slots

- **Exploit.** Reproduce or refine the current leaders. This slot keeps the frontier
  honest: a leader nobody reproduced is a claim, and one nobody refined is an unfinished
  line.
- **Explore-known.** Extend promising work in a thin region: a contribution with good
  numbers in a cluster that has little activity. This is the quality-diversity move of
  keeping the best per region instead of the best overall.
- **Explore-novel.** Inspect untouched ground: singleton or near-singleton clusters,
  open hypotheses nobody has tested, contributions with no children at all. This is
  novelty search's move. It escapes a deceptive objective by valuing difference itself.

Rank within each slot by the upper-confidence form, adding a **near-duplicate penalty**
that shrinks a candidate's bonus as more contributions with near-identical descriptions
appear. Otherwise the explore slots fill with restatements of the leader in different
words.

## Raising exploration pressure

The exploration constant should not be fixed. Raise it:

- **when the metric distribution bunches near its best.** Many contributions within a
  small margin of the leader means the exploit slot has stopped discriminating, and more
  refinement will mostly measure noise (see
  [resolution-bounded-leaders](./resolution-bounded-leaders.md)).
- **when one cluster holds more than a stated share of recent activity.** Pick the share
  before the run and write it into the record's policy, so the trigger cannot be chosen
  after the stall is noticed. In the measured instance the trigger was a single cluster
  holding more than a third of all activity while the leader stalled.

Report the concentration measures beside the frontier: cluster count, the share held by
the top cluster, an effective cluster count. Readers can then see the herd forming and
not only its leader.

## Idea-level rediscovery is the failure this answers

When the frontier makes the next step obvious, several participants take it at once.
That is multiple discovery, the recurring pattern in which a field's shared knowledge
makes an idea ripe for many people together, compressed from years to hours. An in-flight
marker does not stop it when the marker is keyed on a source, a path or a claimed file,
because the colliding sessions started from different places and wrote different files.
They share an idea, not a location. Keyed claims coordinate *where*; only the frontier
view spreads *what*.

Two measures tell a designer whether rediscovery is happening: pairs of equal-outcome
contributions from different participants, and the time gap within each pair. A mass of
pairs within an hour of each other is the frontier synchronizing its readers. Where the
domain has a pre-declared identity space (a taxonomy of methods or subjects), let
in-flight claims name the idea's slot. The collision then becomes checkable before the
work, which similarity clustering after publication can never make it.

## Decision rules

- **When the record serves one ranked list, split it before tuning its scores**, because
  a better score shown to everyone at once still herds.
- **When equal-outcome pairs from different participants cluster within hours, treat it
  as a frontier defect, not a claim-marker defect**, because tightening a where-claim
  cannot see an idea-level collision.
- **When the explore slots fill with paraphrases of the leader, raise the near-duplicate
  penalty**, because a restatement is not exploration.
- **When no slot share or bunching threshold was written down before the run, do not
  invent one mid-run and credit it for what follows.** It is an intervention; record it
  as one.

## A frontier that empties itself does not herd

Herding needs a frontier that rewards being worked. A leaderboard ranks achievements:
improving the leader keeps it on top and makes it the obvious parent for the next
attempt, so attention compounds. A worklist of *defects* does the opposite. Working an
item removes the defect, its rank falls, and the next reader sees a different head. One
sorted list of that kind spreads its readers without any slot, because each reader
consumes what it read.

This has been measured. A research fleet whose sessions picked their work from one
defect-ranked list, with no slots, did **less** concentrated work than a fleet whose
sessions a human routed. Its top subject took about 4% of the touches, against a
one-third single-cluster share in a community reading a leaderboard. So before adding
slots, ask which way the frontier moves when it is worked. Two things make a defect list
herd after all:

- **Ranks that do not fall when the item is worked.** For example, a score driven by
  outside demand that the work cannot reduce.
- **A ranking term that grows with activity**, such as "most recently touched" or "most
  discussed".

Those are the cases to watch. Measure concentration first, because the slot structure is
the cure for a disease the list may not have.

## When not to use it

- **A frontier ranked by defects that working removes.** It depletes itself, and the
  measured concentration will usually already sit far below any trigger worth writing.
  Keep one list and watch for ranks that survive being worked.
- **A problem with one known-good path**, where the job is execution and not search. The
  explore slots then spend budget on ground already known to be worse.
- **A community too small to fill three slots.** With two or three participants, rotate
  one participant through exploration on a schedule instead.
