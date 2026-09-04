---
layer: golden-path
type: golden-path
subject: pipeline-authoring
status: forged
use_when: [designing the work a delivery system runs on a change, a pipeline file has grown past what one person can hold, adding a lane to a repository that holds more than one deliverable, deciding what a build should skip]
techniques:
  - runtime-pipeline-generation
  - step-identity-stability
  - change-scoped-work-selection
  - foreign-config-replay
  - human-checkpoints-in-a-pipeline
  - pipeline-plan-auditability
---

# Pipeline authoring

Three subjects surround this one and none of them is it.
[quality-gates](../../standards-and-gates/quality-gates/quality-gates.md) decides what a
check refuses and where it sits on the ladder.
[release-pipeline](../../build-and-release/release-pipeline/release-pipeline.md) is the
owner's side of shipping — versions, changelogs, publish keys.
[cicd-monitoring](../../../integration/cicd-monitoring/cicd-monitoring.md) is the
observer's side, watching pipelines somebody else owns. This subject is the **plan
itself**: the structure of work a delivery system executes on a change, who decided that
structure, and when.

Its two siblings take the plan from here. Whether the plan may be trusted to say what runs
on your machines is [ci-execution-trust](../ci-execution-trust/ci-execution-trust.md);
what the machines executing it are, and how many of them there should be, is
[runner-fleet](../runner-fleet/runner-fleet.md).

The distinction that governs everything below is one most teams never make, because the
first version of a pipeline is always a hand-written file listing three commands and it
works perfectly:

> A pipeline is a **program that emits a plan**. It is not a document that *is* the plan.

The static file is a degenerate case of the program — a generator whose output happens to
be constant. That framing costs nothing while the repository holds one deliverable, and it
is the only framing that survives the repository holding four. The teams that never make
the shift do not discover this as a design problem; they discover it as a nine-hundred-line
configuration file with conditional expressions nested inside string templates, which
nobody can test, nobody can read, and nobody dares to change.

Three properties follow from taking the framing seriously, and they are what the rest of
this subject is about.

- **The plan is data before it is execution.** If a generator produced it, the plan can be
  printed, diffed, reviewed, stored and replayed. A plan that only exists as the thing the
  delivery system is currently doing cannot be any of those.
- **The plan is not the same on every change.** A generator that reads the change is the
  only mechanism that makes a large repository's feedback fast, and it is also the
  mechanism that most easily lies — a lane omitted from the plan and a lane that passed
  are the same colour on every dashboard ever built unless someone deliberately makes them
  different.
- **The plan is a graph with people in it.** A deployment approval is not an interruption
  of the pipeline, it is a node in it, and modelling it as anything else moves the record
  of the decision out of the system that has the record of everything else.

## The plan is computed, not written

The mechanism is a bootstrap: the first step runs a generator that reads the repository,
the change and any parameters it was given, and hands back the rest of the plan for the
same run. The generator is ordinary code in an ordinary language, with the ordinary
affordances — functions, tests, a type system if the language has one, a local invocation
that prints what it would produce. That is the whole argument for it. A configuration
language grows conditionals when the problem gets hard; a program had them all along, and
had a test harness too.

What makes this safe rather than clever is a short list of disciplines that are all
counterintuitive on first contact: a generator that fails must fail the run rather than
silently contribute nothing, generated work needs stable identity or a retried generation
duplicates it, and very large plans submit better in pieces than whole. Every one of those
is a lesson someone else already paid for. The procedure, the failure modes, and the rule
for when a static file is still the right answer are
[runtime-pipeline-generation](./techniques/runtime-pipeline-generation.md).

The counterweight matters as much as the technique: **generation is not free and not always
right.** A single-deliverable repository with six steps gains nothing and loses
readability. The threshold is not repository size, it is whether the plan's shape is a
function of anything — more than one deliverable, work that differs by branch class, a
matrix whose dimensions come from a manifest rather than from a person. Below that, write
the file.

## Steps have names that outlive the run

Every unit in the plan carries an identifier that is chosen deliberately, is stable across
runs, and is derived from what the step *is* rather than from where it landed in a list.
This looks like bookkeeping and is not. Three separate mechanisms depend on it, and each
fails silently without it, per
[identity-survives-reuse](../../../_laws.md#identity-survives-reuse):

- **Ordering.** Dependency edges name the steps they depend on. Edges named by position
  break the first time somebody inserts a step.
- **Idempotency.** A generation step that is retried must not produce a second copy of the
  work it produced the first time. Stable identity is what lets the delivery system reject
  the duplicate instead of running it.
- **History.** "Is this lane slower than it was in the spring" is answerable only if the
  lane has been the same entity all spring. Identity assigned per run makes every
  cross-run question unanswerable, and the cost is invisible until someone asks one.

The naming rules, the retry contract, and what to do when a step's identity legitimately
varies (a matrix cell, a per-deliverable lane) are
[step-identity-stability](./techniques/step-identity-stability.md).

## The work set is derived from the change, and a skip says so

Running every check on every change is correct and, past a certain size, unaffordable —
which is why every large repository eventually derives its work set from what actually
changed. The derivation is a dependency question, not a path question: a change to a shared
module implicates every deliverable that consumes it, and a rule written over directories
gets that wrong in the direction that ships bugs.

The part that fails in practice is not the derivation. It is the reporting. A lane that was
not selected, a lane that was selected and passed, and a lane whose selection logic threw
must be three distinguishable outcomes at the point where a human or a merge rule reads the
result — per
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success) and
[gate-sees-target](../../../_laws.md#gate-sees-target). Collapse them and the repository
acquires a category of change that is structurally exempt from a check nobody knows it is
exempt from. This is the single most expensive defect in this subject, because the symptom
is a green result and the diagnosis requires suspecting one.

The dependency-closure procedure, the selection-logic failure rule, and the periodic
unscoped run that backstops the whole arrangement are
[change-scoped-work-selection](./techniques/change-scoped-work-selection.md).

## A human decision is a step

Deployments get approved, risky migrations get acknowledged, a release gets someone's name
against it. The naive arrangement puts that conversation in a chat channel and the button
somewhere else, which loses three things at once: the decision is not in the run's record,
the pipeline cannot enforce that it happened, and the person approving is reading a
different surface from the one that will act.

The standard is that the checkpoint is a node in the plan — the run reaches it, waits, and
carries the identity of whoever released it. Around that sit the rules that make waiting
survivable: a waiting run holds no execution capacity, a checkpoint states plainly what
proceeding will do, and every checkpoint names what happens if nobody ever answers, per
[creation-names-reaper](../../../_laws.md#creation-names-reaper). Consent shapes are shared
with [hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md), and the
blast-radius ladder with
[remote-action-consent](../../../integration/cicd-monitoring/techniques/remote-action-consent.md);
what this subject owns is the checkpoint's place in the graph. The forms, the timeout rule,
and the anti-patterns are
[human-checkpoints-in-a-pipeline](./techniques/human-checkpoints-in-a-pipeline.md).

## What ran, and why, is answerable after the fact

Once the plan is computed, "what did this run actually do" stops being readable from the
repository — the file in version control is the generator, not the plan. The obligation
that replaces it: the resolved plan is captured as an output of the run, beside the inputs
that produced it, so a run months later can be explained without rerunning anything. That
is the same contract
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation) puts on
any stored derived value, applied to the most consequential derived value in delivery.

Two habits make it real. The generator runs locally in a mode that prints without
submitting, so its output is reviewable before it is authoritative. And the same code path
produces the plan and verifies it — a generator with a separate verification implementation
has two authorities for one fact, and they will disagree at the worst time. The capture
rules, the local mode, and the "one code path, two modes" pattern are
[pipeline-plan-auditability](./techniques/pipeline-plan-auditability.md).

## The techniques

- [runtime-pipeline-generation](./techniques/runtime-pipeline-generation.md) — the
  bootstrap, the generator's failure contract, submitting in pieces, and when a static
  file is still correct.
- [step-identity-stability](./techniques/step-identity-stability.md) — deliberate stable
  keys, the retry idempotency contract, and cross-run comparability.
- [change-scoped-work-selection](./techniques/change-scoped-work-selection.md) —
  dependency closure over path matching, three distinguishable outcomes, and the unscoped
  backstop run.
- [foreign-config-replay](./techniques/foreign-config-replay.md) — planning from a
  config file another tool interprets: replay its matcher rather than approximate it,
  declare the modeled subset and refuse configuration outside it, and address a unit by
  the tuple that isolates one entry.
- [human-checkpoints-in-a-pipeline](./techniques/human-checkpoints-in-a-pipeline.md) — the
  approval as a graph node, capacity while waiting, and the never-answered rule.
- [pipeline-plan-auditability](./techniques/pipeline-plan-auditability.md) — the resolved
  plan as a durable output, the print-without-submitting mode, one code path for generate
  and verify.
