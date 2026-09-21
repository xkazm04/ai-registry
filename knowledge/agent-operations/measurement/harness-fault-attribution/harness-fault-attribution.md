---
layer: golden-path
type: golden-path
subject: harness-fault-attribution
status: draft
use_when: [a run failed and the model is the obvious suspect, investigating a cluster of failures, deciding whether to retract a published finding about a model, auditing a benchmark's own defects]
techniques:
  - clear-the-environment-first
  - fault-signature-catalogue
  - retract-and-record
---

# Harness fault attribution

Every failed run has two candidate explanations and only one of them is flattering to the
bench: the model did something wrong, or the environment did. The first is easy to write
down, easy to publish and hard to retract, because a finding about a model looks like data.
The second is invisible unless someone goes looking, and it is *common* — in practice a
large share of a new fleet's "model defects" are its own harness maturing in public.

The discipline is an ordering rule: **the environment is the suspect until it is cleared,
and clearing it is a checklist, not an intuition.**

## Why the bias runs one way

A harness is written by the same people who read its results, and its faults are exactly
the ones its authors did not anticipate — that is what makes them faults. Meanwhile the
model is an outsider, opaque, and universally expected to be imperfect. So the cheapest
story is always "the model failed", it is never challenged in review, and it accumulates.
A fleet that does not deliberately invert this ordering will build a catalogue of confident
findings about models that are mostly findings about itself.

The economics reinforce it: attributing a failure to the model costs nothing today and
poisons the corpus slowly. Attributing it to the harness costs an investigation now.

## What "clear the environment" means

Before a failure is written down as the model's:

- **Isolation** — did this run share build output, caches, dependencies or generated
  artefacts with another run, or with a real working tree?
- **Setup** — did the environment the task needs actually exist, in the order the
  repository declares?
- **Time** — did the host sleep, throttle or hibernate under the run; did a ceiling fire
  for reasons the run did not control?
- **Provider** — did the run actually run, or was it refused, truncated or killed?
- **Harness code** — did the measurement change between this run and its siblings; was the
  fact even measurable when this run was scored?
- **Concurrency** — was another process writing the same paths, holding the same lock, or
  rebuilding the same target?

Each has a signature, and a fleet should collect them: a failure that matches one is
investigated, not attributed.

## Clusters and singletons

A **cluster** — several configurations failing the same way at the same time — is almost
never a model story. Models do not coordinate; environments do. A **singleton** that
survives a rerun in a clean environment is a candidate model finding; one that disappears
on rerun was environmental, and that is the finding.

The corollary is that reruns are not optional. A fleet that cannot cheaply re-run a cell in
a clean environment cannot attribute anything, and will publish its own defects.

## Attribution is part of the published record

When a harness fault is found, three things are recorded: what the defect was, what it made
the results say before it was found, and which stored results were re-derived or re-run as
a consequence. That record is what lets a later reader trust the numbers that remain — and
it is the only honest way to explain why a published score moved. A benchmark whose
corrections are invisible is asking to be believed rather than checked.

## When the harness fault is also a real finding

An environment fault sometimes exposes a genuine defect in the repository under test — a
check that only passes because an artefact was missing, a rule enforced by nothing. Record
both, separately: the harness fix, and the repository finding it surfaced. They have
different owners and different lifetimes.
