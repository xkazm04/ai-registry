---
layer: technique
type: technique
subject: test-harness
technique: out-of-graph-artifacts
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a shipped artifact builds outside every gated build graph, a whole-project build flag read as covering the repository, a path dependency broke a project nothing compiles]
---

# Out-of-graph artifacts

Every whole-project command a harness runs — build everything, test everything,
lint everything — quantifies over a **declared membership list**, not over the
repository. The list is a hand-maintained file: workspace members, packages in
the monorepo config, projects in the solution, the recursive-run root. Anything
in the tree that no gated root reaches is outside every green that command can
produce, and the green does not say so
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

The naive reading is the word in the flag. "All" and "workspace" and "recursive"
are read as ranging over the checkout, because that is what they mean in
English. They range over a declaration, and a declaration omits by default.
Nothing warns when a directory is not in it; there is no failure mode, because
from the tool's point of view nothing is wrong.

## The population question, asked from the artifact side

The check is not "is the partition of my tests exhaustive." It is:

1. **Enumerate what the project ships** — every binary, library, package,
   plugin, container, SDK, and script that leaves the repository and lands in
   someone else's hands. This is the inventory the release notes imply.
2. **For each one, name the gated build-graph root it is reachable from.** Not
   "is there a directory for it" — which command, in which job, compiles it.
3. **Anything that names no root is out of graph.** It has no gate, and every
   badge the project displays was measured over a population that excluded it.

The third answer is the finding, and it usually arrives as a surprise, because
step 2 is normally answered from memory and memory answers "of course the
build covers it." The inventory has to be walked, once, against the actual job
definitions.

## Detachment is usually the right packaging decision

A project leaves the primary graph for good reasons: it versions and publishes
on its own cadence, it compiles to a different target, it needs a different
toolchain or a different language, its dependency resolution must not be
entangled with the server's. None of that is a mistake, and the fix is never
"drag it back in" when detachment is load-bearing. What detachment costs is
**coverage**, and the cost is payable — a job of its own — as soon as anyone
notices it exists.

The trap is that the two decisions are made years apart by different reasoning.
The packaging decision is deliberate, documented, and correct. The coverage
consequence is a side effect nobody wrote down, so it is discovered by an
incident rather than by design.

## The break is silent because it is not local

An out-of-graph project that depends on an in-graph library **by path** is the
sharpest case. It moves with the monorepo's tip, so it never gets the version
pinning that would have made the break explicit; and nothing inside it changed
when it broke. A field was added to a shared type, a signature moved, an enum
gained a variant — the change is in the library, the library's own suite is
green, the whole-workspace suite is green, and the detached project has stopped
compiling. A diff-shaped intuition ("what did this change touch") cannot reach
it, because the answer is "nothing in there."

Left alone, the drift compounds: nothing forces the project back to compiling,
so the gap between it and the library grows until the eventual fix is a
rewrite rather than a rebase. The observable, throughout, is a green board.

## The gate's shape

One job per out-of-graph root, and the job is named after the artifact rather
than after the tool, so a reader of the checks list can match it against the
ship inventory. Three details are load-bearing:

- **It names its own manifest explicitly.** The point of the job is that no
  default discovery reaches this project; a job that relies on discovery
  reproduces the original bug one level up.
- **It scopes its own build cache.** The detached project resolves its own
  dependency graph; sharing the primary graph's cache key either thrashes it or
  quietly serves it artifacts from a different resolution.
- **It runs whatever the artifact ships**, not merely a compile. A project with
  its own test script and no job invoking it is out of graph in the way that
  matters, even when something happens to compile it.

## Compiling is not exercising

The most expensive version of this failure is the one where the out-of-graph
artifact's contract with its host is not a type signature. A plugin that must
export a named entry point still compiles after the export is renamed. A
container that must start still builds after its entrypoint moves. In both,
compilation is a real check of a real thing and answers the wrong question.

So the gate for a **loadable** artifact has a second half: build it, install it
where the host looks, then have the host load it and answer whether it is
usable. Two orderings follow. The load step runs *after* the primary suite, so
installing artifacts into the runtime's search path cannot change what that
suite saw. And the artifact-dependent tests, which a clean checkout cannot run
because nothing has been built yet, stay excluded from the default suite and
become mandatory *in this job* — the one place the artifact exists.

Name the production symptom when writing the job, because it is what justifies
it. Where the host's behaviour on a missing or unloadable extension is to
proceed — a predicate that defaults to true, a transform that defaults to
identity — the drift ships as a **check nobody deployed, which reads exactly
like a check that said yes**. That is the same fail-open shape the harness's
own liveness rules exist to refuse, arriving from outside the harness.

## Keep the mapping checkable, not remembered

The inventory-to-root mapping is itself a hand-maintained list, and it decays
the same way the membership list did. The durable form is a check that walks
the tree for package manifests and compares that set against the set of
manifests some job names, failing on any manifest nobody claims. That converts
"did anyone remember" into an inventory gate — and inventory gates, unlike diff
gates, can see an artifact that was never tracked. Where the check does not
exist yet, the honest interim is a written list of the ungated shipped surfaces,
carried where the gate config lives, so a green is at least read with its
predicate attached
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## Boundaries

This is not [suite-partitioning](./suite-partitioning.md), though the two
rhyme. Partitioning divides tests the harness already knows about into machines
and demands that the division be exhaustive and disjoint — its exhaustiveness
check runs over a suite's own discovery patterns, and its failure is a test file
that no configuration matched. Here the harness has no discovery pattern that
could ever reach the artifact, because the artifact is not in the graph the
runner enumerates. Partitioning asks whether every known test landed in exactly
one machine; this asks whether every shipped thing is known at all. When a test
file is missing from a suite's report, read partitioning; when a whole project
has no report to be missing from, read this.

Nor is it [gate-liveness](../../../standards-and-gates/quality-gates/techniques/gate-liveness.md),
which owns the instrument failing: the walk that found zero files, the absent
tool, the trigger that never fired, the verdict swallowed by a pipe. In every
one of those the check is broken. Here the check is in perfect health — it
compiles what it was told to compile, it fails when that code fails, it has been
red and gone green on real defects — and it is pointed at a population that is
quietly not the one being claimed. Liveness asks *did the instrument work*; this
asks *what was it measuring*. The two diagnostics are different: a liveness
suspicion is settled by a seeded failure, and this one is settled by walking the
ship inventory against the job list. A seeded failure inside the workspace will
pass a liveness audit and teach nothing about the detached client.

## When not to use it

When the artifact can simply join the primary graph, join it — a technique for
gating things outside the graph is not a reason to keep them outside it, and one
member line is cheaper than one job. And do not extend the inventory to things
the project does not ship: examples, scratch projects, vendored fixtures, and
reference implementations are legitimately ungated, and pulling them in buys
runtime and a maintenance surface for artifacts nobody depends on. The
qualifying question is whether somebody outside the repository can be broken by
it.
