---
layer: golden-path
type: golden-path
subject: tool-result-economy
status: forged
use_when: [a tool returns far more text than the model needs, a change that made responses shorter did not make tasks cheaper, deciding whether a class of output may be compressed and by how much, auditing what the harness adds to a result that nobody asked for]
techniques:
  - end-to-end-unit-of-optimization
  - compressibility-follows-the-producer
  - formatting-before-information
  - escape-hatch-usage-as-the-safety-metric
---

# Tool result economy

A tool-using agent spends most of its window on text it did not write. The
model asks for a file, a search, a build; something else answers, at whatever
length that something else happens to speak, and the answer enters the
transcript and is re-transmitted on every turn that follows. This subject owns
**one result on its way in** — what the harness does to it between the moment
the tool returns and the moment the assembler sees it, and how anyone knows
whether that intervention helped.

The neighbouring subject is
[prompt-assembly](../prompt-assembly/prompt-assembly.md), and the
discriminator is one sentence: **prompt-assembly asks what fits; this subject
asks what the result costs by the time the task is done.** Assembly owns the
composed artifact — layered sections, the global budget, degradation ladders,
cache breakpoints, spending down a transcript that has already accumulated. It
is a fitting problem, decided over the whole prompt, at composition time. This
is an economics problem, decided over a single result, before composition, and
settled only by a measurement taken at the end of the task. The two can
disagree, and the disagreement is not academic: a transform that improves the
fit can raise the bill, because material the model has to go back for is paid
for twice and then carried forward on every subsequent turn. A reader who wants
to know *what to drop when the window is full* is in the wrong document; a
reader who wants to know *whether shrinking this class of output was a good
idea* is in the right one.

## Four decisions, in order

The techniques are one pipeline, and the order is load-bearing, because each
step is only meaningful once the step above it has an answer.

**Decide the unit you are optimizing.** Every intervention below is a local
reduction, and a local reduction is not a saving until someone names the
boundary it was measured inside.
[end-to-end-unit-of-optimization](./techniques/end-to-end-unit-of-optimization.md)
fixes that boundary at the completed task and explains why anything narrower
can be improved without improving anything.

**Decide what may be transformed at all.** Not all output is equally
compressible, and compressibility is not a property of the bytes.
[compressibility-follows-the-producer](./techniques/compressibility-follows-the-producer.md)
classifies output by what produced it and admits transforms in order of what
they destroy.

**Order the transforms so the free ones run first.** Some reductions remove
information and some remove only packaging, and the second kind is
unconditionally cheaper.
[formatting-before-information](./techniques/formatting-before-information.md)
makes that an ordering rather than a preference, and supplies the audit that
finds the packaging.

**Instrument the way back, and read it.** A lossy transform that ships with a
recovery path has also shipped its own regression test.
[escape-hatch-usage-as-the-safety-metric](./techniques/escape-hatch-usage-as-the-safety-metric.md)
turns the recovery rate into the earliest and cheapest signal that a transform
took something the model wanted.

## A result's cost is not its length

The intuition every team starts with is that a shorter result is a cheaper
result. It is wrong in a specific and expensive way, and the mechanism is
**displacement**.

An agent that cannot see what it needs goes and gets it. It reopens the
original, re-runs the command, repeats an exploration, narrows a search it
already ran. Each of those is an extra turn, and a turn in a tool-using
conversation does not cost one tool call — it re-transmits the whole prefix
accumulated so far, and it lengthens that prefix for every turn after it. The
bytes saved on one response are charged back at a rate the response-level
metric cannot see. A measured instance makes the shape concrete: a utility that
shortened shell output before the agent read it reduced individual responses
reliably, and completed tasks cost more, because the model went back for what
had been removed.

Nobody gamed anything. The response-level number was honest and the boundary
was wrong. That is why the first technique in the pipeline is about measurement
rather than about text, and why every claim in this subject is stated as a
claim about a *completed task*.

## Compression is licensed by predictability, not by size

The second wrong intuition is that a big result is a compressible result. Size
says how much there is; it says nothing about whether any of it can be removed
safely. What licenses a transform is knowing, without reading the content, what
in it is noise — and that is a property of the producer.

Output whose information density is arbitrary — file contents, diffs, whatever
an operator's own script emitted — admits nothing lossy, at any size, because
nothing can predict which part of it mattered. Output that is an enumerable
result set admits **lossless reorganization**: regroup the framing, dedupe the
repeated headers, retain every result. Output that is repetitive *by
construction* — installs, builds, test runs, progress reporting — is the only
class where a lossy filter has a basis, and even there only when the saving is
large enough to repay one recovery.

The policy is derived from measurement, not from design taste. A compression
policy that was never narrowed by an observation has not been measured: the
field version of this one began by compressing diff output, agents were
observed reopening the originals, and that filter was removed.

## Free transforms before costly ones

Two reductions can save the same number of bytes and cost completely different
amounts. Removing information imposes four costs — a new thing the model must
be told, something it may have to recover, a decision it must make, and a
change to the content it reads. Removing packaging the producer never emitted
imposes none of them.

So the ordering is a rule and not a preference: exhaust the
information-preserving transforms before entering the degradation ladder that
[context-budgeting](../prompt-assembly/techniques/context-budgeting.md) owns.
An information-preserving removal cannot cause a recovery, so it cannot be
bought back by displacement, so its saving is unconditional.

The richest seam here is the **vestigial affordance** — something the harness
attaches to every result because one consumer once needed it, still attached
long after that consumer was replaced. Its cost is per emission; its value was
per consumer; and nothing in a codebase re-checks that pairing when the
consumer changes. The audit question is therefore not "is this formatting
useful?" but "which consumer needed this, and does that consumer still exist?"

## The way back is the instrument

Any lossy transform worth shipping ships with a recovery path: the preserved
original, the command that can be re-run, the pointer to the full text. Teams
build that path as a safety mechanism and then never look at it again. It is
also the measurement, and the best one available, because the rate at which the
model takes the way back *is* the rate at which the transform removed something
the model wanted.

It beats a task-success regression on every axis that matters. It moves on
small samples where a success-rate delta needs a large one. It resolves within
a turn rather than after a whole task completes. And it points at the specific
transform, where a success regression points only at the release.

Two conditions make the number mean anything. The path must be **reachable and
advertised** in the result the transform produced, because an escape hatch the
model was never told about has a zero use rate and a zero meaning, and the data
cannot tell those apart. And the rate is **conditional** — measured over the
population where the transform actually fired, never over all tasks, where the
cases that never compressed dilute it to nothing.

## Failure modes this subject exists to prevent

- **The honest local number.** A reduction measured per call or per turn,
  celebrated, shipped, and paid for at the task level by an increase nobody
  attributed to it.
- **Compressing by size.** A byte threshold standing in for a judgment about
  producers, so the one class that must never be touched is the first one over
  the threshold.
- **The unadvertised escape hatch.** A recovery path that exists in the code
  and appears in no result, manufacturing a flawless safety metric out of the
  model's ignorance.
- **The diluted rate.** A recovery rate reported over all tasks rather than
  over the triggered population, small enough to look like success at any
  level of damage.
- **The vestigial affordance.** Per-item packaging emitted forever for a
  consumer that no longer exists, invisible precisely because it has always
  been there.
- **Transporting a result across workloads.** A saving established on one
  workload quoted as a property of the harness, and the next surface to adopt
  it gets the opposite sign.

## What this subject does not own

It does not own the composed prompt: allocation, ladders, cache breakpoints and
history compaction belong to
[prompt-assembly](../prompt-assembly/prompt-assembly.md), and this subject
hands results to that assembler rather than replacing its judgment. It does not
own what to do with *historic* transcript material — replacing recoverable bulk
with a pointer is
[elision-to-a-refetch-pointer](../prompt-assembly/techniques/elision-to-a-refetch-pointer.md),
whose discriminator is recoverability where this subject's is production, and
the two compose rather than compete. It does not own the shrinking of authored
standing layers
([compression-hardens-deferred-decisions](../prompt-assembly/techniques/compression-hardens-deferred-decisions.md)),
which is a different object with a different risk: an instruction is a set of
deferred decisions and compressing it makes them, where a tool result has no
deferrals in it at all. It does not own the tool protocol
— schemas, transport, identity, and the treatment of a result as untrusted
input all belong to the tool-interface subject next door. It does not own
money: price tables, ledgers and budgets are the cost-metering subject's, and
every number here is a quantity of work rather than a bill. And it does not own
which metric a harness optimizes; it owns the boundary that metric is measured
inside, which is a separate and independent question from the role the metric
plays.

## The techniques

- [end-to-end-unit-of-optimization](./techniques/end-to-end-unit-of-optimization.md)
  — the completed task as the only honest boundary, displacement as the
  mechanism that defeats every narrower one, the workload-locality corollary,
  and the obligation to land negative results.
- [compressibility-follows-the-producer](./techniques/compressibility-follows-the-producer.md)
  — classifying output by what produced it, the three-rung admissibility
  policy, the threshold that must repay one recovery, and why the policy is
  narrowed empirically rather than designed.
- [formatting-before-information](./techniques/formatting-before-information.md)
  — information-preserving transforms first because their saving is
  unconditional, the vestigial affordance and its per-emission-against-
  per-consumer asymmetry, and the sweep over what the harness adds.
- [escape-hatch-usage-as-the-safety-metric](./techniques/escape-hatch-usage-as-the-safety-metric.md)
  — the recovery path as the transform's own regression test, the five shapes
  recovery takes, the advertisement precondition, and the conditional
  population the rate is measured over.
