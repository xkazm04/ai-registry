---
layer: application
type: application
subject: client-state
technique: observed-read-subscription
stack: next
status: forged
applied: experiment
ab_verdict: better
proof: structural-only
verified_on: 2026-08-31
verified_against: next@16
---

# Observation with nothing guarding it

This stack takes the inferred form of subscription narrowing by default: its
fetch layer hands each consumer a recording wrapper and wakes it only for
fields it read. The technique's question is not whether that is a good
default — it is — but whether the two things the inferred form needs are
present. Neither is.

## The A/B

**Arm A** — the tree as it stands: rely entirely on observation.
**Arm B** — observation plus the two guards the technique names: an explicit
declaration where reads escape the render, and a lint rule catching the
enumeration that defeats the tracker.

The measurable is the number of sites where observation is silently defeated,
and the number of instruments that would catch one.

**Result: `notifyOnChangeProps` — the explicit declaration — appears nowhere
in the tree. The lint plugin that ships with the fetch layer is not installed:
zero references in the package manifest and zero in the lint configuration.
So the project relies on observation at 100% of its call sites and has no
instrument that can see the defeat.**

One site defeats it. A shared wrapper hook returns `{ ...query, page, pageSize,
… }` — spreading the tracked result to merge pagination helpers into it. The
spread runs during render and touches every field, so every consumer of that
wrapper is subscribed to every field the result carries, including the ones
that change on every fetch regardless of whether the data did.

## The structural fact

The defeat is in a **wrapper**, not in a leaf component, and that is the part
worth recording. The technique predicts that this defect travels: a helper
that forwards a tracked object applies the loss to everyone downstream, and
the downstream call sites look innocent because they are innocent. This tree
instantiates that exactly — the consumers cannot be audited for the problem,
because the problem is not in them.

The measured blast radius is honest and small: **two consumers** of that
wrapper. So the finding is not that this project is paying a large rendering
cost today. It is that the project has adopted an optimization whose failure
mode is silent, placed the one known defeat in the position that propagates
it, and installed none of the three things that would report it — no
declaration anywhere, no lint rule, and no render-count instrumentation.
The cost is currently two components and is bounded only by how many call
sites the wrapper acquires.

That is also why the verdict is `structural-only` rather than `ab-paired` on a
behavioural number: both arms were read, not run. Arm B is known to be better
by construction — it adds an instrument where there is none — and no render
counts were measured.

## What this realization cannot do

It cannot say what the spread costs in renders. Establishing that needs a
render counter under both arms on the same interaction, which this run did not
build and the tree does not emit. A wrapper whose consumers re-render on
`isFetching` transitions may cost nothing visible if those consumers are cheap.

It also cannot rule out further defeats: the enumeration here was a search for
spread and rest syntax applied to query results, which finds the idiomatic
form. A field-by-field copy would be invisible to that search and equally
defeating.

## Return condition

Install the lint rule. It is one dependency and one configuration line, it
would have flagged the wrapper at the moment it was written, and it converts
this application from a census into a standing gate — which is the difference
between knowing about one site today and knowing about every future one.

The second return, only if the first finds more sites than expected: a render
counter on the wrapper's consumers under both arms, which turns
`structural-only` into a paired behavioural number.
