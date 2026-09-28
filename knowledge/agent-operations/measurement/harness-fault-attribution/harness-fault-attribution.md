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
  - re-gate-then-resample
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

The same bias hides the mirror case. A harness defect that makes a run *pass* is never
triaged, because nobody investigates a green. Stored outputs re-scored through a corrected
harness have moved published rankings, and a leak in a harness can earn a configuration
its lead. Attribution is owed to passes too.

## What "clear the environment" means

Before a failure is written down as the model's:

- **Isolation** — did this run share build output, caches, dependencies or generated
  artefacts with another run, or with a real working tree?
- **Setup** — did the environment the task needs actually exist, in the order the
  repository declares?
- **Time** — did the host sleep, throttle or hibernate under the run; did a ceiling fire
  for reasons the run did not control?
- **Provider** — did the run actually run, or was it refused, truncated or killed? And
  if it completed, was it served by the model and stack it names? A provider can return a
  normal-looking response from a degraded backend, a moved snapshot behind an unchanged
  alias, or a different serving stack for the same open model. None of these shows in the
  envelope.
- **Harness code** — did the measurement change between this run and its siblings; was the
  fact even measurable when this run was scored?
- **Concurrency** — was another process writing the same paths, holding the same lock, or
  rebuilding the same target?

Each has a signature, and a fleet should collect them: a failure that matches one is
investigated, not attributed.

## Clusters and singletons

A cluster is read by the axis its failures share, because the axis names the suspect.

- **A cluster in time.** Several configurations fail the same way in the same window,
  across different tasks. This is rarely a model story. Models do not coordinate, and
  environments and providers do. A provider incident is exactly this shape, and it can
  span a whole model family at once.
- **A cluster on an item.** Several configurations fail the same task, whenever it runs.
  That is not evidence for the environment. Models trained alike fail alike: independent
  families agree on a large share of the items they both get wrong. Such a cluster is a
  correlated capability gap or a defect in the task. Only a control whose answer is known
  can separate the two, and "models do not coordinate" rules out neither.

A benchmark that runs every configuration on a task in the same window has confounded the
two axes. Re-run the item in a different window before reading its cluster either way.

A **singleton** that disappears on rerun is *intermittent*, not environmental. Agents fail
some tasks some of the time as a property of the model, and even at zero temperature a
served model does not repeat itself. A singleton that survives a rerun is a candidate
model finding only if the rerun drew a fresh sample. A rerun that hit a response cache,
or replayed recorded inputs, reproduces by construction. Separate the layers by
re-gating the stored output, comparing the two runs' fingerprints and resampling before
naming a cause.

The corollary is that reruns are not optional, and neither is recording what a rerun
changed. A fleet that cannot cheaply re-run a cell in a clean environment cannot attribute
anything. A fleet that re-runs without stamping its harness revision cannot tell a rerun
from a harness change.

## Attribution is part of the published record

When a harness fault is found, three things are recorded: what the defect was, what it made
the results say before it was found, and which stored results were re-derived or re-run as
a consequence. That record is what lets a later reader trust the numbers that remain — and
it is the only honest way to explain why a published score moved. A benchmark whose
corrections are invisible is asking to be believed rather than checked.

Excluding the runs attributed to the environment is not a neutral correction either. A run
that crashed its environment may have crashed it by working carelessly, so dropping every
infrastructure failure can inflate the agent's score. Scoring every one as the model's
failure deflates it. Publish the score both ways, with the excluded runs counted, and let
the gap between the two say how much rests on the attribution.

## When the harness fault is also a real finding

An environment fault sometimes exposes a genuine defect in the repository under test — a
check that only passes because an artefact was missing, a rule enforced by nothing. Record
both, separately: the harness fix, and the repository finding it surfaced. They have
different owners and different lifetimes.
