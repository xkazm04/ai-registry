---
layer: technique
type: technique
subject: ci-execution-trust
technique: evidence-pipeline-provenance
status: forged
stage: team
laws: [claimant-does-not-adjudicate, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a gate reads a pipeline's artefacts as evidence for a change, several runs exist for the same revision, deciding which pipeline sources may count as evidence, anyone who can push a branch can also start a run on it]
---

# Evidence comes from the run the change was given

A gate that reads a pipeline's output as evidence about a change has to choose *which* run it
reads, and the choice is usually made by accident: the newest run, the green one, whichever run
the artefact search finds first. Every delivery system lets more than one run exist for the same
revision. A person with push rights on the branch can start one by hand, through the API, from a
trigger, on a schedule, or as a downstream of another pipeline — and most of those doors accept
**run-level variables**.

Run-level variables are the defect the naive reading misses. In the usual precedence order they
outrank the variables the definition itself sets, and often the project's own settings too. One
can redirect a tool's options, change the interpreter's startup flags, point version control at
another remote, or flip the evidence job's own switches — all without changing a file, so a
review of the change sees nothing and a check that the change left the definition alone
([self-edited-ci-forfeits-evidence](./self-edited-ci-forfeits-evidence.md)) passes. A run
started with variables by the party being judged is a run that party configured, and per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate) it supplies no
input the verdict reads.

The rule: **a run counts as evidence only when it came from the change's own event, ran at
exactly the revision being judged, finished, and carried no run-level variables.**

## The four predicates

**Source.** Accept the one run source the change's ordinary event produces — the change-request
pipeline — and refuse every other source by name: manual runs, API runs, triggered runs,
scheduled runs, push-triggered branch runs, downstream runs. The refusal is by source, not by
inspecting what each one happened to carry, because each of those doors *can* carry variables
and the gate should not have to prove that a particular one did not.

**Revision.** The run's revision equals the head of the change at the moment the gate reads it.
Not the head when the sweep started, not the head the artefact names, not a merge commit. A
merged-result run tests a tree that is the change combined with the target branch; it is a
legitimate run, but it is evidence about that combined tree, and a gate that judges the head
must not read it as evidence about the head. A project that runs only merged-result pipelines
needs a run of the head as well.

**Completion.** Only a finished run counts. A running pipeline's partial artefacts are not
evidence, and "no finished run for this head yet" is a wait that writes nothing, distinct from
"the run failed".

**Inputs.** Read the run's variable list from the platform and require it to be empty. If the
list cannot be read, that is an error, never an empty list — per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), a reader that
treats a failed fetch as "no variables" has turned the predicate off. A run that does carry
variables is a wait for a person, with the count stated.

## Do not shop for the green run

When several qualifying runs exist for the head, take the newest and read it, whatever it says.
A gate that walks back through the runs until it finds a passing one lets a flaky or
deliberately rerun job buy a pass: an older green beside a newer red is a red. The predicate
selects one run; the verdict is that run's.

## Where the variable list does not reach

Some inputs never appear in the run's variable list. Variables entered when a person plays a
manual job are attached to the job, not to the run, so the evidence job must not be manual — a
manual evidence job is one whose inputs the gate cannot see. Treat any other input path the
platform documents (push options, trigger payloads, inherited group settings) the same way:
either the gate can read it or the source that carries it is refused.

## Restrict at the platform, refuse at the reader

Two controls, both needed. At the platform, restrict who may set run-level variables at all —
most delivery systems now let a project require a minimum role, including "no one" — and prefer
declared, typed run inputs where the platform offers them over free variables. At the reader,
apply the four predicates anyway. The platform setting can be relaxed by a project
administrator, can lag on older instances, and its exact reach across every door is often not
documented; the reader's refusal is the guard that does not depend on configuration, and per
[gate-sees-target](../../../../_laws.md#gate-sees-target) it reads the run itself rather than the
setting that was meant to shape it.

## Decision rules

- Name the one source whose runs count; refuse every other source by name.
- The run's revision equals the head when the gate reads it; merged-result runs are evidence
  about the merged tree only.
- Unfinished: wait and write nothing. Failed: read as failed.
- Read the run's variables; unreadable is an error, non-empty is a wait for a person.
- Of several qualifying runs, read the newest; never search for a passing one.
- The evidence job is never manual.
- Restrict run-level variables at the platform and refuse them at the reader.

## When not to use it

A gate that only informs a person, who will read the change and its pipeline before acting,
can live with "the latest run". The predicates are for a gate whose reading substitutes for
that person — an automated merge, a proof mark, a record that promotes an author.
