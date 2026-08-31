---
layer: application
type: application
subject: prompt-safety
technique: payoff-removal
stack: react
verified_on: 2026-08-31
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A synthesis report where the prose is the deliverable (React/TypeScript)

A desktop research-lab surface builds a prompt for an "AI report-synthesis"
persona and asks it, in the prompt's own words, to write a narrative Discussion
section interpreting a project's findings against its hypotheses. The model's
output is not a step toward a deliverable; it *is* the deliverable, and a human
reads it and publishes from it.

That makes it the case the technique's `inert` class assumes away, and the tree
shows the consequence better than an argument could.

## What the tree does, structurally

The prompt builder receives four collections — the project, its hypotheses, its
experiments, its findings — and the caller passes **every one of them for the
project**, unfiltered. The only limits applied are `slice(0, 40)`, `slice(0, 40)`,
`slice(0, 60)` and a per-field character truncation. Those are a **token budget**.
There is no predicate anywhere on the path that asks whether a given item *should*
reach a published document.

The decisive part is what the schema already carries. A finding record holds
`hypothesis_ids` — an explicit link to the hypotheses it belongs to — and the same
field is already parsed elsewhere in the application to lay out the project graph.
So the relation that would scope the report exists, is populated, and is used to
draw a picture; it is simply not consulted at the one seam whose output a person
publishes. The application knows which findings belong to which hypothesis. The
report does not ask.

Nobody designed that. It fell out of building the graph and the report against the
same store at different times, which is what makes it evidence rather than an
anecdote: **the read-side scope was available for free and the prose seam did not
take it, because nothing in the technique's vocabulary told it to.**

## What could not be measured, and the instrument that would do it

Both arms are expressible — arm A is the shipped predicate (every finding, capped
at sixty), arm B filters to findings linked to a hypothesis in scope — and the
difference between them is exactly the count of items that enter published prose
with no stated relation to the report's subject.

The measurement did not run. The feature's tables are present in the local store
and hold **zero rows**, so there is no population to measure and no history to
draw cases from; a run over constructed projects would be an opinion with a table
around it. Verdict `unmeasurable`, and the instrument that would settle it is
plain: **a research-lab project carrying real findings.** The moment one exists,
arm A minus arm B is a single query.

## What this realization cannot do

The type system cannot express the exclusion. There is no visibility,
publishability or sensitivity field on a finding — only `status`, `category` and
`generated_by`, none of which is a read-side privilege. So even a team that wanted
the scope rule has nowhere to record the decision per item; they would have to
infer it from the link graph, which is what arm B does and why arm B is the
cheapest available fix rather than the correct one.
