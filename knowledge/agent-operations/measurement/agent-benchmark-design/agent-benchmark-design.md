---
layer: golden-path
type: golden-path
subject: agent-benchmark-design
status: draft
use_when: [designing a comparison of agent configurations on real repositories, deciding what one run per cell can support, reporting coverage of an incomplete grid, choosing what a benchmark measures before it measures it]
techniques:
  - comparable-cell-construction
  - eligibility-before-ranking
  - coverage-and-provisional-labelling
---

# Agent benchmark design

A fleet benchmark is not a leaderboard. Its purpose is to answer operational questions —
which configuration to default to, which task instructions are defective, which failures
are the environment's — and its output is a set of decisions with the evidence attached.
Designed as a leaderboard, it produces a ranking nobody can act on, over cells that were
not comparable, with a confidence the sample cannot support.

The defining constraint is cost. A cell here is a full agent run against a real
repository: minutes to an hour, real commits, real gates. That buys realism and forbids
repetition — a fleet will have one run per cell, not thirty — and everything about the
design follows from taking that honestly rather than pretending otherwise.

## What one run per cell can and cannot support

It **can** support: a configuration cleared a mechanical bar, or did not, on a real case.
A defect reproduced across independent cells. A behaviour that appears at every tier of a
family and at no tier of another. An operational recommendation with its evidence.

It **cannot** support: a claim that one configuration is better than another by a fraction
of a judged point; a p-value; a ranking treated as stable under rerun. Judged scores at
one run per cell carry real noise, which is why eligibility is mechanical and ranking is
coarse — and why margins, not orderings, drive recommendations.

State this in the report itself, next to the numbers, not in a methodology appendix nobody
reads with the table.

## Cells must differ in exactly one thing

A cell is (task, repository, configuration). For the comparison to mean anything, every
other variable is pinned: the same starting revision of each repository, the same
instruction text, the same isolation, the same ceilings, the same measurement code. The
instruction in particular is identical for every engine — a prompt tuned per vendor
measures the tuning.

The hardest version of this rule is temporal: a benchmark that runs for days will want to
fix its own measurement mid-flight, and every such fix splits the grid into before and
after. The discipline is to make fixes *recomputable* — facts derived from stored artefacts
rather than observed once — so earlier cells can be brought forward to the current
definition instead of being quietly compared across it.

## The bar is mechanical; the judge ranks what survives

Two different questions, in order:

1. **Did the run do the job?** Gates green, required artefacts present, nothing left
   half-done, no declared repository rule overridden. This is mechanical, reproducible and
   not a matter of taste.
2. **How good was it?** Judged, blind, by reviewers who see the mechanical facts alongside
   the work.

Inverting the order produces the benchmark's most embarrassing failure mode: a confident,
well-written run that broke a rule, rated highly by reviewers who were never shown the
breach.

## Coverage is part of the result

A grid that is incomplete — because a seat ran out, because a tier was dropped for cost, or
because the work is still running — yields a **provisional** recommendation, labelled
in the artefact itself, with the missing cells named. Publishing an unlabelled
recommendation over a partial grid is the fastest way to have a defensible measurement
quoted as a fact it cannot support.

## What the benchmark owes the tasks it measures

Half the value of a fleet benchmark is not the configuration ranking at all: it is the
defect list for the *instructions*. When every configuration fails a task the same way,
the benchmark has found a bug in the task, and that finding is worth more than the ranking
because it is permanent and cheap to fix. A design that reports only configurations throws
that half away.
