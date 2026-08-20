---
layer: technique
type: technique
subject: procedural-level-planning
technique: algorithm-parameter-support-matrix
status: forged
laws: [law-and-check-share-one-source, unmeasured-is-not-a-pass]
shared_with: []
use_when: [one parameter panel drives several generation algorithms, a control appears to do nothing, adding a new generation backend behind an existing surface]
---

# Algorithm parameter support matrix

A generation tool offers one panel of controls in front of several algorithms that do
not share a parameter space. The support matrix is the single declaration of which
parameter each algorithm actually consumes, and — for the ones it does not — the reason,
written for a designer.

The concern it names is narrow and constant: **a control that renders live and changes
nothing**. It costs the designer more than a missing control, because a missing control
sends them looking for another lever while a dead one sends them into a re-roll loop.

## The rule

A parameter either affects every algorithm it is shown for, or it is **disabled with the
reason on screen**. There is no third state. "Mostly supported", "approximated",
"honoured where possible" are all the dead-control failure with better manners.

The reason string is payload, not decoration. It is the only artifact in the system that
teaches the designer how the backends differ, and it must say *why* in the algorithm's own
terms — "this algorithm carves organically and does not place discrete rooms, so a room
count cannot be requested; it is measured after the fact" — not "not supported".

## Procedure

1. **Enumerate the union of parameters** the surface exposes, and for each algorithm mark
   one of three states: consumed, derived-after-the-fact, or not applicable. Only
   *consumed* renders as an active control.
2. **Write the reason with the state**, at authoring time, by the person who knows the
   algorithm. A reason written later by someone reading the code is a guess.
3. **Store the matrix as data, in one place**, and have both the interface and the
   generator dispatch read it. This is
   [law-and-check-share-one-source](../../_laws.md#law-and-check-share-one-source) applied
   to a control surface: the panel that greys a control and the code that ignores the
   value must not be two independent opinions, or the panel will keep offering a lever the
   backend quietly dropped three releases ago.
4. **Render disabled controls, do not hide them.** A hidden control teaches nothing; a
   greyed control with a reason teaches the shape of the tool and is how a designer learns
   which backend to pick. Hiding is acceptable only when the parameter is meaningless in
   the whole mode, not merely in the current algorithm.
5. **Check the matrix against the code.** A parameter marked consumed whose value never
   reaches a decision is the failure this technique exists to prevent, and it recurs every
   time an algorithm is refactored. The cheap version of the check is a test that varies
   one parameter, holds the seed, and asserts the output differs; a parameter that fails it
   is not consumed, whatever the matrix claims.

## Decision rules

- **When a parameter is honoured by some algorithms and not others, keep it in the shared
  surface and disable it per algorithm** — do not split the panel per backend. The shared
  surface is what lets a designer compare backends; the per-algorithm disabling is what
  keeps it honest.
- **When an algorithm can approximate a parameter, do not call it consumed.** Mark it
  derived-after-the-fact and report the achieved value alongside the requested one. A
  designer who asked for twelve rooms and got nine needs to see both numbers; showing only
  the request implies it was met.
- **When a value is not measured for an algorithm, render it as unmeasured, never as a
  default.** A zero, a dash or the last algorithm's value standing in for "we did not
  compute this" is the collapse
  [unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass) forbids: the designer
  reads a number and believes it describes their level.
- **When adding a backend, the matrix row is part of the change, not a follow-up.** A new
  algorithm that inherits another's row is the most reliable source of dead controls.
- **When a pair of controls can be set to a nonsensical relation — a minimum dragged above
  its maximum — flag it and read it in the sensible order.** Refusing outright wastes the
  designer's run; obeying literally produces an empty layout with no explanation. Normalising
  silently is the worst of the three, because the designer never learns the pair is ordered.
  Flag, explain, and proceed on the swapped pair.

## When not to use this

- **A single-algorithm tool.** With one backend there is no matrix — there is a parameter
  list, and the same honesty is discharged by not exposing controls the algorithm ignores.
- **Parameters that are genuinely universal**, such as the seed or the output bounds, do
  not need per-algorithm rows and should not be padded into the matrix to make it look
  complete. A matrix that is all-green everywhere teaches nothing and stops being read.
- **Internal tuning constants** that no designer sets. The matrix documents the *offered*
  surface; expanding it into a full configuration dump dilutes the part that matters.

## What good looks like

A designer new to the tool switches algorithms, watches four controls grey out with four
sentences explaining what this algorithm does instead, and picks the backend that matches
their intent — without generating anything. That is the matrix doing its whole job: it
converted an experiment costing ten re-rolls into a decision costing one read.
