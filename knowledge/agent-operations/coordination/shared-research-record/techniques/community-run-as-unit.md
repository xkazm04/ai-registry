---
layer: technique
type: technique
subject: shared-research-record
technique: community-run-as-unit
status: draft
laws: [a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [claiming that a shared record or its views helped a fleet, reading statistics computed over one community's contributions, a mid-run change was followed by an improvement]
---

# Community run as the unit

The concern: a shared record produces thousands of contributions, and thousands look like
a sample. They are not. Every contribution in one community was chosen by reading the
same frontier, scored on the same evaluator, and exists because of the ones before it.
Statistics computed over them describe that one history, however many rows there are.
**To claim the record helped, compare whole community runs under matched budgets. Treat
contribution-level statistics as diagnostics of one run, and treat a single run with a
mid-run change as a case, not an effect.**

## Why contributions are not samples

Three dependencies break independence, and each is structural:

- **Shared frontier.** Each session's choice is conditioned on everyone's published work,
  so contributions co-move. A burst of similar results is one decision copied, not many
  decisions agreeing.
- **Lineage.** A contribution descends from its parents. Its outcome is largely inherited,
  and credit assigned to it partly belongs to its ancestors.
- **Common instrument.** One evaluator scores everything, so any quirk it has is shared
  by every row.

The consequence is that confidence intervals, significance tests and effect sizes
computed over contributions are wrong in the confident direction. They are still useful
as diagnostics: how fast leaders were adopted, how concentrated activity was, how often
ideas were rediscovered. They describe the run's shape. They do not measure the
record's effect.

## The comparison that can

A claim about the record is a claim about a counterfactual, namely what the same
community would have done without it. The minimum design has four arms, each a whole
community run:

| arm | what participants share | how work is allocated |
| --- | --- | --- |
| isolated | the brief only | each participant chooses alone |
| flat log | contributions in time order | participants read the log |
| central planner | full state, visible to a planner | the planner assigns work |
| record with views | the typed record and its frontier views | participants choose among explicit slots |

Match everything else across arms: the agents and models, the compute per participant,
the evaluator, the brief apart from its coordination section, the number of participants,
and the wall-clock budget. The budget
[is part of the measurement](../../../_laws.md#a-ceiling-is-a-measurement-boundary):
an arm stopped early by a ceiling is reported as stopped, not as a finished arm that
scored badly. The outcome is discovery per unit of compute: the best held-out score
reached, and the curve of best score against compute spent. The last row of a
leaderboard is not the outcome. Repeat each arm enough times to see its run-to-run
spread, because one run per arm has the same problem as one run per benchmark cell
(see [agent-benchmark-design](../../../measurement/agent-benchmark-design/agent-benchmark-design.md)).

The planner arm is not optional. Without it a positive result shows that the record
beat no coordination, and it cannot tell whether the record beat the obvious
alternative of letting something assign the work.

## Reading a single run honestly

Most operators will have one run and no arms. What that run can support:

- **Descriptive facts with n and date.** How many contributions, how many reproductions,
  how concentrated activity was, how lineage crossed participants. These are real, and
  worth recording.
- **Existence claims.** The community found a method that works on this evaluator;
  sessions did reuse each other's work; a verification channel was used.

What it cannot support:

- **An effect of a mid-run change.** When a view is introduced and a new direction
  appears a day later, the community was already moving, the leader may already have been
  near a plateau, and nothing records what would have happened without the change. Say
  "followed", never "caused".
- **Behaviour change measured through vocabulary the change introduced.** If the new
  view also introduced new tags, their appearance afterwards counts the vocabulary, not
  the behaviour.
- **Generalization of the result**, where every component was selected on one development
  evaluator.

## Decision rules

- **When a report computes a statistic over contributions, label it a diagnostic of one
  run**, and never attach a significance claim to it.
- **When a mid-run intervention precedes an improvement, report the timing and withhold
  the attribution**, because a single run has no counterfactual.
- **When a comparison lacks a planner arm, restrict its claim to "better than no
  coordination".**
- **When arms differ in anything but the coordination mechanism, the comparison is
  confounded.** Fix the difference or name it beside the result.

## When not to use it

- **Operating a record, as opposed to evaluating one.** Day-to-day, the diagnostics are
  what an operator needs, and demanding a matched comparison before tuning a view would
  stop all practice. The discipline governs *claims*, not operations.
