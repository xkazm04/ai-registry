---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: repro-minimization-protocol
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [turning a session observation into a reproducible trigger, a bug report is a paragraph of context, deciding whether a finding is ready to hand to an owner]
---

# Repro minimization protocol

The concern: **shrinking a session into the smallest reliable trigger, with a stated attempt
count.** A finding that cannot be re-experienced on demand cannot be fixed on purpose and cannot
be proven fixed afterwards; it is a rumour with a ticket number. Minimization is what converts
one into a defect, and the shrinking is not only preparation — it is evidence in its own right.

## The oracle comes first

Before anything is removed, write down **what counts as the failure**, as something an observer
can check. "The boss fight feels bad" is not an oracle. "The boss's second phase never triggers;
its phase indicator stays at one for the whole fight" is. Everything that follows is a search
guided by that check, and a search with a vague check converges on the wrong thing: you shrink
the setup, a *different* defect starts reproducing, the check still says "bad", and the resulting
repro is for a bug nobody reported.

The oracle also decides whether this technique applies at all. A failure with no checkable
statement is not ready for minimization; it is ready for the routing step, which may hand it to
somebody whose job is to make it checkable.

## The procedure

**1. Pin the build.** Minimization on a moving target measures the build, not the defect. Every
attempt in one minimization run happens on one build identity, and the identity is recorded with
the result.

**2. Establish a baseline reliability.** Run the full original setup some stated number of times
and record how many reproduced. This number is the denominator for everything after it. A repro
that succeeds three times in five and one that succeeds once in twenty are different defects
with the same steps, and the second one cannot be minimized by single attempts at all.

**3. Enumerate the dimensions.** Setup elements, ordered steps, options in force, world and
seed, character state, timing. Write them as a list of removable parts before removing any, or
the search silently becomes "the parts I remembered".

**4. Remove and re-test, keeping what survives.** Take out a part; if the failure still occurs
at a comparable rate, the part is gone for good; if it does not, put it back and move on. When
the setup is large, remove in halves rather than one at a time — the same divide-and-conquer
shape used by automated input minimizers, which reach a state where nothing further can be
removed without losing the failure, in a number of re-tests that stays manageable as the input
grows.

**5. Repeat each decision as many times as the baseline rate demands.** With a failure that
reproduces every time, one attempt decides a removal. With one that reproduces a third of the
time, a single non-reproduction means nothing, and a minimizer that treats it as a decision will
happily "prove" that the necessary step is unnecessary. State the per-decision attempt count in
the protocol before starting.

**6. Stop at one of two places, and say which.** Either nothing more can be removed — the repro
is minimal — or the attempt budget ran out, in which case the result is a *partially* minimized
repro and it says so, listing what was successfully removed and what was never tried.

**7. Keep the original.** The full session record is not superseded by the minimized repro. When
the minimized version stops reproducing after a change, the original is the only way to tell a
fix from a mask.

## The removals are the finding's other half

Everything taken out while the failure survived is a statement about the fault's scope, and it
is frequently worth more than the repro itself. "It happens with no second character present,
without the buff, on a fresh profile, at the lowest difficulty, and on a level with none of the
scripted events" has told four teams they are not involved, in a form each of them can check —
which is a stronger routing signal than any theory anybody could have written down.

Record the removals explicitly rather than leaving them implicit in a shorter step list. A
reader of the final repro cannot tell the difference between a condition that was proven
irrelevant and one nobody thought to try, and those license completely different next moves.

## Decision rules

- **When the failure rate is low, report it rather than hiding it in the steps.** Every claim the
  minimization makes carries its attempt count: this is a reliability figure and a figure without
  its denominator is not one.
- **When a timing window is involved, widen the window rather than removing steps.** Minimizing a
  race by deletion produces a repro nobody else can hit; adding an artificial delay, a slowed
  timestep or a paused frame makes it reliable and is a legitimate part of the minimal setup as
  long as it is stated.
- **When a removal makes the failure change shape, put it back and record the branch.** You have
  found two defects, and merging them into one repro loses both.
- **When an automated tester can replay the session deterministically, minimize automatically and
  review the result by hand.** This is the highest-leverage use of a machine tester that exists —
  the cost of the technique is entirely in re-runs — but the final repro is read by a person,
  because a machine will happily minimize away the part that made the defect interesting.
- **When the minimization examined nothing, say so.** "Could not be minimized" with no attempt
  count and no dimension list is an instrument reporting a conclusion it has no input for.

## When not to use it

- **Not when the fix is cheaper than the search.** An obvious defect with a one-line cause does
  not need a minimal repro; it needs the fix and a regression check. Minimization is expensive and
  its cost is justified by handing the work to somebody else.
- **Not for experiential findings.** Pacing, difficulty feel, legibility and tone have no
  checkable oracle at the level of a trigger. Their equivalent is a *scenario specification* — a
  stated build, world, player state and route that reliably re-creates the experience for another
  observer — which is a different artifact with a different acceptance test.
- **Not on a defect that only exists in aggregate.** An economy that drifts over ten hours has no
  minimal trigger; it has a simulation. Trying to minimize it produces a short session that proves
  nothing.
