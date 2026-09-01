---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: simulate-the-mechanism-not-the-constant
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a spec describes a process over time, a decay or drain or cadence claim needs numbers, several fields quote the same constant and disagree, a grader says an identity is unsatisfiable as written]
---

# Simulate the mechanism, not the constant

The named concern: **a spec that describes a process over time and derives its numbers
from whichever constant looks authoritative, rather than from running the process.**

Every ramp, decay, drain, cadence, cooldown and accrual in a design spec is a small
program. Authors describe it in prose and then quote a constant that appears to bound it.
When the constant is not actually the thing the mechanism converges on, every dependent
figure in the artifact is wrong at once — and because they all agree with each other,
nothing looks suspicious.

## The signature

Several fields quote the same bound and the artifact still contradicts itself, or a
reviewer reports that an identity cannot hold as written.

The worked case: a reputation decay model quoted a floor constant that every field
repeated. The rate column, however, was zero below a certain rank — so the drain stopped
the moment the rank changed, nowhere near that floor. **Six fields across four artifacts
were describing an unreachable state**, consistently.

The related signature is an identity that is arithmetically unsatisfiable: a grant
clamped by a floor, multiplied by a chain of factors, and declared equal to an integer
result. The spec never says which side of the multiply the floor sits on, so the identity
is false under rounding for every input near the clamp.

## The procedure

**Write the loop and run it.** Tick the process, look up the row that applies at that
tick, apply that row's rate, record the tick at which each boundary is crossed, and stop
on the real termination condition. Then interpolate every resulting figure into the prose
(`interpolated-counts-over-typed-counts`).

Three things fall out that hand-derivation does not produce:

- **The real boundary crossings**, including the ones the prose assumed and the ones it
  did not know existed.
- **The distinction between constants that were being treated as one thing.** In the
  worked case, a rate that stops the drain and a clamp that bounds it turned out to be
  two mechanisms; naming them apart resolved every dependent field at once — the same
  cure as `one-field-one-question`.
- **Whether the design is actually wrong.** One rule flagged as "self-neutering — it only
  bites once" was wrong in the opposite direction: the drain also cost the next rank, on
  a ten-times-longer clock. Computing it converted a reported defect into a feature.

## Replay every cadence claim against the actual rate

A cadence claim is a rate claim, and it is almost never checked. Two separate reviews
caught statements of the form *"once a year keeps this rank"* (a year of idleness put it
two ranks lower) and *"a contract every 300 days holds the rank"* (500 gained against
3000 lost — a net loss every cycle).

**The sustaining interval is grant ÷ rate**, computed, not asserted. If the spec states a
maintenance cadence, the loop must confirm the state is actually maintained at that
cadence.

## State the precedence the mechanism implies

Simulation exposes ordering questions prose hides: whether a floor applies before or
after a multiply, whether a refresh replaces in place or removes and re-adds, whether a
cap is checked per tick or per accrual, which of two simultaneous writes wins.

Each of these is a one-sentence statement in the artifact and each closes findings in
*several* siblings at once — in one measured case a single precedence statement resolved
findings in three separate artifacts.

## Decision rules

- **When an artifact describes a process over time, simulate it in the builder and let
  the simulation produce every number.**
- **When two constants keep contradicting each other, suspect two mechanisms** before
  suspecting a stale value.
- **When an identity involves a clamp and a multiply, state which side the clamp is on**
  — and state whether the result is an integer, because the identity is false under
  rounding otherwise.
- **When a maintenance cadence is claimed, compute grant ÷ rate and confirm it.**
- **When the simulation disagrees with the design, check the consumer before rewriting
  the producer.** In one case the downstream catalog already described the behaviour the
  simulation produced.

## When NOT to use this

- **Do not simulate what is genuinely a single published constant.** A committed
  interface value with an owner is stated and cited, not re-derived by every consumer.
- **Do not present a simulation's output as measured runtime behaviour.** It is a
  derivation from the spec's own inputs; it proves internal consistency, not that the
  built system does this. Structural and arithmetic proof remain
  [necessary and never sufficient](../../../_laws.md#structural-proof-is-never-sufficient).
- **Do not over-model.** The loop exists to produce the figures the artifact states. A
  simulation richer than the claims it supports is unverifiable content of its own.
