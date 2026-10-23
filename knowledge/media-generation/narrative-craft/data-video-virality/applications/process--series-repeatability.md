---
layer: application
type: application
subject: data-video-virality
technique: series-repeatability
stack: process
status: draft
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# A declared series on the case-idea validator

The `StatReel` studio (see process--recognizable-cast) brainstorms use cases as text, and an
owner accepts or rejects each one. The seam was chosen to falsify "the tree already carries
series repeatability". Half of that held. The studio's own use-case registry is a template
layer: each use case is one data shape (a cumulative career-wins race, a record handover) and
its heatmap cells are that template's instances, one per sport. The brainstorm layer had no
link to it, though. A proposed case could not say it was one episode of a template, and the
brief warned only against the opposite mistake, one dataset sliced many ways in one batch.

## A and B

- **A (as it was):** a case carrying a `series` was valid whatever the series said, and the
  server dropped the field when it stored the case. A template with two further episodes, one
  that listed the case itself, one with a duplicate episode, and one with no template named
  were all accepted (4 of 4).
- **B (the rule applied):** a case may declare `series: {template, instances}`. A declared
  series must name the template and at least three further episodes on the same data shape,
  distinct from the case and from each other. The brainstorm check and the server both refuse
  anything less (0 of 4 accepted), and the series is persisted with the case. A case with no
  series still passes, because an event-driven one-off is valued for its timing. The brief now
  says the owner reads a series as a small tie-breaker and never as a reason to accept a weak
  case, that a sibling episode of an accepted case is not a repeat, and that further episodes
  go in the series rather than in more cases in the same batch.

A well-formed series and a one-off passed in both arms. Floor: the typecheck, 1638 vitest
tests, the 41 board harness tests, pytest, the dbt parse and the lint ratchet were all green.
The policy step did not run because its binary is not installed on this machine, and no
policy file changed.

## What this cannot do

- **There is no score to put a bonus on.** The technique's second step assumes a numeric
  rubric. Here the owner ranks, so the bonus becomes a declared template that the owner can
  see. Whether it actually breaks ties is the owner's behaviour, and nothing measures it yet.
- **The build-order rule has no seam.** Design loops rotate over registry use cases that are
  data-ready. Those are templates already, so "build the template, not the top idea" holds by
  construction there and could not be tested.
- **Same data shape is self-reported.** The check counts episodes and checks that they are
  distinct. It cannot tell whether a listed episode really shares the template's data shape.

Return when the owner has judged a batch with series declared. Count how often a series
decided between two cases of similar strength, and whether an accepted series episode became
a registry use case.
