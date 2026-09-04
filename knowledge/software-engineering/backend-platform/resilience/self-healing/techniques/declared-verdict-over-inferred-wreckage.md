---
layer: technique
type: technique
subject: self-healing
technique: declared-verdict-over-inferred-wreckage
status: forged
laws: [verdict-survives-boundary, unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [a successor process must decide what killed its predecessor, a crash log is the only channel between two incarnations, pattern-matching a stack trace to choose a startup mode]
---

# Declare the verdict; never infer it from the wreckage

A process exits. Its successor starts, finds a crash log, and must decide what
mode to come up in. The tempting reading is forensic: parse the log, recognise
the subsystem in the stack trace, conclude that the subsystem is the problem.
That reading is wrong in a way that is invisible in testing and expensive in the
field, and the correction is a single rule.

> **The dying process declares its verdict as a marker. The successor matches
> the marker and nothing else. A crash that carries no marker is diagnostic
> material, not a verdict.**

## Why the stack trace is not evidence

Forensic attribution answers *where the process was standing when it died*. The
verdict needs *whether the recovery machinery was tried to its limit and failed*.
Those questions have different answers far more often than the forensic reading
admits:

- A component crashes on its **first** attempt, with a textbook stack trace
  naming it. The recovery loop has not run once. The forensic reader sees the
  component's name and concludes the component is unrecoverable; the truth is
  that nothing has been attempted.
- A **bystander** crashes inside a call that the component made, or in a library
  the component happens to share. The trace names the component; the component
  is fine.
- The healer **succeeded** and the process died later of something unrelated,
  with the healed component's frames still on some goroutine's stack.

Each of these produces a wrong mode on the next boot, and the wrongness is
durable: an appliance that comes up with its main function disabled because a
regex matched a package name is harder to diagnose than one that simply crashed,
because it now looks like a deliberate state.

This is [verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
with the boundary being a process death rather than a network hop. The law's test
— what the outermost consumer can branch on — is unusually literal here: the
outermost consumer is a program that does not exist yet, and the only thing it
can branch on is what its predecessor deliberately left for it. Prose in a log is
exactly the case the law names as *not surviving*.

## The marker is a typed value with one author

The marker is a constant, defined once, in the module that owns the recovery
policy — not in the reader, and not duplicated in both. It names the *policy
outcome*, not the symptom: `<component>.max_restart_attempts_reached` rather than
`native crashed` or a copy of the last error string. The healer writes it at
exhaustion; the classifier is a total function from log content to a small
enumerated verdict set, and its default branch is the unknown lane
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) — which
here means *diagnostic only, come up normally*, never *assume the worst*.

One author for the string, per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
if the writer and the reader each carry their own spelling, they drift at the
first rename, and the drift is discovered when a device that should have entered
its reduced mode came up normally and crashed again in a loop. Import the
constant; do not retype it.

## The classifier's test suite is its specification

This classifier is small enough that its tests *are* the contract, and the cases
that matter are the negatives — the ones asserting that a plausible-looking crash
does **not** activate the mode. A suite worth having contains at least:

- the marker present, in a realistic log tail → the verdict, active;
- an **empty** log → unknown, diagnostic only;
- a crash whose trace names the component but carries **no marker** → unknown,
  diagnostic only;
- a crash in an **adjacent** subsystem, with the component absent → unknown.

Write the third case first. It is the one that fails when somebody later "improves"
the classifier by adding a substring match on the component's name, and the
improvement is always proposed as a bug fix for a device that crashed and did not
enter the mode somebody expected.

## The bidirectional obligation

Because the reader is deliberately strict, the writer's obligation is absolute: a
recovery loop that exhausts and forgets to emit its marker produces a device that
crash-loops forever with a correct classifier. The two halves are one mechanism
and are reviewed together — the same reason
[healer-death-as-promotion](./healer-death-as-promotion.md) puts the write before
the exit rather than beside it. A marker constant with exactly one writer and one
reader in the tree is a grep away from being verified; make that grep a review
step, because there is no type system spanning a process death.
