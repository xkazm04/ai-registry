---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: refuse-the-fix-that-cannot-help
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
use_when: [a router must decide whether to invoke a repair stage, an automated fix keeps running and changing nothing, granting an automated stage write access or heavy compute]
---

# Refuse the fix that cannot help

## The concern

A router that can only say *yes* will say yes to everything. This technique makes
**refusal a first-class routing outcome** — a typed result with a stated reason, returned
in the same position a plan would have been returned, and reported rather than logged.

There are three refusals worth building in, and they are different in kind: refusing a
remedy that cannot address any failing class, refusing an operation with a known
pathological cost, and refusing a caller-supplied destination.

## Refusal one — the remedy that addresses nothing

**Rule: produce a plan only when at least one failing class is in the remedy's measured
set. Otherwise refuse, and name the classes that blocked it.**

The cost of getting this wrong is not neutral. Routing an artifact into a repair stage
that cannot touch its failing class spends the stage's full runtime to produce the same
verdict — and, where the remedy interacts badly with the class, a worse one. Measured
case: the dominant failing class across a corpus was stray disconnected fragments, and the
obvious repair — density reduction — multiplied them, taking one artifact from one
fragment to sixteen and from warn to fail. Ten of fifty-two artifacts failed the gate and
all ten failed on that class. A router without this refusal would have sent every one of
them through the repair bench to be told the same thing, slower.

The refusal is not the end of the story: it routes to the null branch, where the residual
defects are named and the artifact either ships with them or goes to a person.

## Refusal two — the operation with a known pathological cost

**Rule: an operation that has been measured to blow up does not get a flag, a threshold,
or a warning. It gets no caller.**

Cost profiles that scale with input size on unbounded input are the family: per-element
adjacency structures built over the pre-reduction artifact, whole-graph traversals over
high-density data, anything that materialises a full neighbour index. One recorded
incident is sufficient evidence — a component-splitting call over dense geometry that
consumed 211 GB of memory and took the operator's machine down. The related in-house
routine that builds the same shape of structure remained latent only because nothing
invoked it. **The first router to exist is the first candidate caller**, and that is
exactly the moment to decide it never sets the flag.

Tuning a threshold instead is the tempting alternative and it is wrong: the blow-up is a
property of the algorithm over unbounded input, so a threshold only moves the input size at
which the machine dies. Refuse rather than destroy; a refusal is a result and a destroyed
session is not.

## Refusal three — the destination the caller chose

**Rule: every path a router hands to a stage is derived, basename-only, and inside an
allow-listed location; and the input must itself resolve inside one.**

A repair stage that accepts an arbitrary source path and an arbitrary output path is an
unreviewed write primitive, and the router is the component that would feed it. Derive the
output name from the input name plus a stamp, resolve it inside the one directory that
remedy is permitted to write to, and return a refusal — not a fallback path — when
derivation fails. A fallback destination is how a stage silently writes somewhere nobody
is watching.

## What a refusal must contain

- The remedy that was declined.
- The failing classes that were present, and which of them blocked the route.
- What would have to be true for the route to open — a different remedy, a declared stage,
  a measured entry in the map.
- Nothing that resembles a verdict. A refusal is about the *route*, never about the
  artifact's quality; it must not read as a pass and must not read as a second rejection.

## Decision rules

- **Refuse before you spend, not after.** The refusal is computed from the verdict and the
  map alone, so it costs nothing and needs no subprocess, no engine and no network. Keep
  the routing logic pure for exactly this reason — it is then testable without any of them.
- **A refusal is reported at the same volume as a plan.** Refusals that only reach a log
  become invisible, and invisible refusals get re-implemented as silent no-ops.
- **Never convert a refusal into a degraded attempt.** "We could not do the right thing, so
  we did a lesser thing" is how an unaddressed class becomes an unrecorded one.

## When not to use this

- **When a human is in the loop and waiting.** Offer the option and let them choose; a
  refusal that a person can override with context is advice, and it should read as advice.
- **When the remedy is genuinely free and idempotent.** If running it costs nothing and
  cannot worsen anything, the refusal buys nothing. Verify both claims by measurement
  before believing them — "cannot worsen anything" is the assumption this whole technique
  exists to disprove.
