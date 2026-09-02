---
layer: technique
type: technique
subject: session-continuation
technique: sealed-stage-advance
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [a multi-stage autonomous run must resume after an interruption, a stage is advancing on a completion phrase the model wrote, later configuration edits are changing a run already in flight, deciding whether a staged loop needs a workflow engine]
---

# Sealed stage advance

An autonomous run is often not one loop but a sequence of postures — plan,
implement, verify, repair, report — where each stage's output is the next
stage's input and the run is done when the last stage says so. The state that
matters is "which stage is current", and the naive implementation stores it in
the same configuration that defines the stages, advances it when the model
prints a completion phrase, and reads it fresh on every resume. Each of those
three choices is a way for the run to execute something nobody chose. This
technique fixes all three: a **closed set** of shapes, a **seal** at
selection, and an advance that happens **exactly once, on evidence**.

## Only sequences from a closed set, with self-produced inputs

The run admits only stage sequences from an enumerated set of named profiles,
and every stage in a profile consumes only what an earlier stage in the same
profile produced. A stage that needs an input nothing before it emits is a
stage that will be fed by whatever happens to be on disk — a stale artifact
from a previous run, a file the operator edited by hand — and the run's
correctness then depends on the state of the directory rather than on the
run. Closing the set is what lets the set be reviewed: each profile is a
known shape whose failure modes have been looked at, and a new shape is a
change to the set, not a runtime composition.

**The rejected alternative is a general workflow engine** — arbitrary stages,
branches, loops, callbacks. It is rejected on purpose and the reason is
stated: it is a different safety model. A general engine's run is an authored
graph whose readiness is a pure function of pinned topology and persisted
status; the neighbour pipeline-dag owns that model, and it is the right one
when a person drew the graph. Here the advance is driven by *model output* —
the thing a stage produces is a claim — and a claim needs provenance before it
may move a run forward. Bolting provenance onto a general engine produces an
engine nobody can reason about; keeping the shapes closed keeps the provenance
question small enough to answer.

## Sealed at selection

When a profile is selected, its shape — the ordered stages, each stage's
adapter and its exact completion signal — is hashed and the hash is written
into an **immutable run descriptor** together with the run's identity. The
descriptor is what a resume reads. A later edit to the profile definition
produces a different hash and therefore a different run; it cannot alter a
run in flight, because the run no longer reads the definition. The run's
identity is the descriptor, minted once
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)), and
a resume that finds a descriptor whose hash no longer matches any known
profile does not guess the nearest one — it reports the mismatch and stops,
because the safe interpretation of "the shape this run was sealed with no
longer exists" is not "use today's".

## Exactly once, on an authenticated completion signal

A stage advances when the current stage's adapter has produced its **exact
completion signal**, and that signal is found in an **authenticated record**:
a file or row the harness owns, at a path the harness resolves without
following a symlink, bounded in size so a read cannot be made to hang, and
written after a **recorded activation boundary** — the moment this stage
started — so that a completion signal left by a previous run of the same
stage, or by the same stage in a different run, does not count. The signal is
the current adapter's, not any adapter's: a run in the verify stage does not
advance on the implement stage's completion phrase appearing again. The gate
reads the record, never the model's summary of it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The advance is written under **compare-before-write**: the writer reads the
descriptor's current stage, computes the next, and writes only if the stage
is still the one it read. Two writers — a stop hook and a session-start hook
both observing completion, or two harness processes on the same run — will
race here, and the discipline is that **the loser re-reads once and reports
the current status**. It does not retry the advance, because the winner has
already advanced and a second advance skips a stage; it does not fail,
because nothing went wrong. It reads, sees the run is now one stage further,
and says so.

## Decision rules

- Admit only stage sequences from a closed set of profiles; every stage's
  inputs are produced by an earlier stage of the same profile.
- Seal the selected profile by content hash into an immutable descriptor at
  selection; a resume reads the descriptor and never the definition.
- Advance exactly once per stage, on the current adapter's exact completion
  signal, found in an authenticated record — no symlink, bounded, written
  after the recorded activation boundary.
- Write the advance under compare-before-write; a concurrent loser re-reads
  once and reports the current status.
- Reject the general workflow engine explicitly, and name pipeline-dag as
  where an authored graph belongs.

## When not to use this

A run with one stage is a loop, and continuation-as-state is the whole of its
control state. A run whose stages are drawn by a person, with branches and
gates, is a pipeline and belongs next door. This technique is for the narrow
middle: a fixed handful of shapes, driven by model output, that has to resume
correctly after being interrupted.
