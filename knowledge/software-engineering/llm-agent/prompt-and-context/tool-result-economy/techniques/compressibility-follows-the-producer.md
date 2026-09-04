---
layer: technique
type: technique
subject: tool-result-economy
technique: compressibility-follows-the-producer
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [deciding which tool outputs a filter is allowed to touch, a compressor is proposed with a size threshold and no classification, agents keep reopening material the harness already gave them, writing the policy that says what may be summarized before it reaches the model]
---

# Compressibility follows the producer

A harness that intercepts tool output needs a policy saying what it may do to
it. The policy almost everyone writes first keys on size: over N bytes, shrink
it. That policy is a proxy for the question that actually matters, and it
diverges from the target in the worst place — the largest results are file
contents and diffs, which are exactly the class that must never be touched, so
a size rule is a rule that fires first on its own worst case
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The rule that holds:

> **Compressibility is a property of what produced the bytes, not of the bytes
> or of how many there are.** Classify by producer, then admit transforms in
> order of what they destroy.

The reason is mechanical rather than stylistic. A transform that removes part
of an output has to identify which part is noise, and it has to do that
*without reading the content* — anything that reads and judges the content is
a model call, which costs more than the output it is shortening. What makes
identification possible is a **known output shape**, and output shape is
inherited from the producer. A producer whose output form is predictable is
one whose noise can be located structurally. A producer whose output form is
arbitrary offers nothing to key on, and a filter over it is guessing.

## The three rungs

**Exact-preserve.** Output whose information density is arbitrary: file
contents, diffs, and anything an operator-supplied script emitted. Nothing may
judge it, at any size, because nothing can predict what in it mattered. The
operator-script case is the one teams argue about and it is the clearest: the
harness has no model of that script at all, so every heuristic it might apply
was derived from other programs. This rung is not a default to be relaxed
under pressure; it is the rung whose violations are most expensive, because
the material here is what the task is actually about.

**Lossless reorganization.** Output that is an enumerable result set: matches,
file lists, search hits, index entries. Here the framing is redundant and the
results are not — a repeated path prefix on every line, a restated header per
group, a delimiter that carries nothing. Regroup, dedupe the framing, and
**retain every result**. This is the rung most teams skip, and it is free: no
information leaves, so no recovery can follow, so the saving is unconditional
in the sense the ordering technique describes.

**Lossy compression.** Output that is repetitive *by construction*: installs,
builds, test runs, linters, progress reporting. These producers emit a known
form with known noise — dependency resolution chatter, per-file progress, a
thousand passing assertions whose only load-bearing content is that they
passed — and the predictability is what licenses the transform. Even here the
transform is bounded by the threshold rule below, and it always ships with a
way back.

The rungs are ordered by what they destroy, and a class is never promoted up
the list for being large. A four-megabyte diff is exact-preserve. A short
build log is lossy-eligible.

## The threshold: a saving must be able to repay a recovery

Within the lossy rung, compress only when the saving is **substantial**. The
arithmetic is one-sided and that is what makes the rule simple: a recovery
costs an extra turn plus a permanently larger prefix for the remainder of the
task, so it is expensive and it is not rare. A small saving cannot repay a
single recovery, which means a filter that fires on marginal cases loses money
on average even when it is right most of the time.

Set the threshold as a fraction removed rather than an absolute count — "this
transform must remove most of this output or it does not run" — because the
question is whether the transform is finding real structural noise, and a
transform that shaves ten percent off a build log has not found the noise, it
has found some.

## The policy is narrowed empirically, never designed

The most important property of a shipped classification is not its shape. It
is that **something removed a rung from it after a measurement**.

A policy assembled from first principles and shipped intact is a hypothesis
wearing a config file. The field version of this one was conservative because
its evaluations forced it there, not because conservatism was the goal: diff
output was compressed in an early version, agents were observed reopening the
originals, and the diff filter was removed. That single retraction is what
turns the surviving rungs into evidence — each one is a claim that survived an
attempt to falsify it, and the exact-preserve rung is where the falsified
claims went.

So the check on any classification you inherit or write is a question about its
history: **which producer class was moved down a rung, and what showed it?** A
policy with no such story has not been measured, and its confidence is
authorship rather than evidence. The instrument that supplies the story is the
recovery rate, and it is the sibling technique's whole subject.

## Boundary: producer class and recoverability compose

A different discriminator governs *historic* transcript material: whether the
material is recoverable by an action the model can still take, which decides
whether replacing bulk with a pointer beats summarizing it. That question and
this one are not competitors, and the answers are not substitutes — they
compose, and in this order.

**Producer class decides whether a lossy transform is admissible at all.
Recoverability decides whether elision beats compaction.** A result that is
exact-preserve by producer is not made compressible by being recoverable; the
most a recoverable exact-preserve result earns is elision to a pointer, which
removes everything and admits it, rather than a summary that removes some of it
and does not. The two live in different stages, too: this technique runs on the
way in, before the assembler exists; elision runs at composition time over
material that has already been in the transcript for a while.

## Decision rules

- Classify by producer before writing any threshold; a size rule with no
  classification behind it fires first on the class it must never touch.
- File contents, diffs, and operator-supplied script output are exact-preserve,
  at every size, with no exception for "obviously" redundant regions.
- Enumerable result sets get lossless reorganization, and the count of results
  out equals the count in. If a result was dropped, the transform was not
  lossless and belongs one rung down.
- Compress only producers with a known output form, and only when the transform
  removes most of the output.
- Ship no lossy transform without an advertised way back, and read its usage
  rate before widening the policy.
- When a producer class is uncertain, place it in exact-preserve and let a
  measurement promote it. The default direction is the cheap one.
- If the policy has never lost a rung to evidence, treat it as untested and say
  so when quoting its savings.
