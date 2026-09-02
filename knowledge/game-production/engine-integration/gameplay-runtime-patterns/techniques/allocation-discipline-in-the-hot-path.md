---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: allocation-discipline-in-the-hot-path
status: forged
laws: [a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a generated system allocates inside a per-step loop, deciding whether a pool has earned itself, diagnosing an intermittent frame spike, setting the runtime budget an author is briefed with]
---

# Allocation discipline in the hot path

The named concern: keep per-step work inside a stated frame budget by controlling what is
allocated, hashed, searched and dispatched inside the loop — and adopt the pooling pattern
only where a measurement says it pays. Two failures live here in opposite directions. One is
generated code that allocates freely every step and produces a stutter nobody can reproduce.
The other is a pool wrapped around something created once per level, which is complexity
with no benefit and a new class of bug.

## The budget is arithmetic, and it is small

A frame at sixty updates per second is under seventeen milliseconds of wall time for
everything: simulation, animation, physics, audio, rendering and presentation. At a hundred
and twenty it is under nine. Gameplay logic is one claimant among many and is typically
budgeted a low single-digit fraction of that. Any figure a generated system is graded
against has to be stated as a share of a named frame interval, per what — per step, per
instance, per thousand instances — or it is not a budget, it is a sentiment.

State the budget in the brief, because a limit handed to an author shapes what it writes
rather than merely capping it. "This runs on up to two thousand participants each step; hold
it under one millisecond in total" produces different code from the same request with no
number, and the difference is visible in the first draft.

The cost that matters is not average, it is the tail. A step that usually takes a tenth of a
millisecond and occasionally takes eleven has broken the frame, and the average will not
show it. Grade a per-step cost by its worst observed step across a representative run, not
by its mean.

## What actually costs, in rough order

**Allocation.** A heap allocation inside a per-step loop is the classic offender, and its
worst property is not its own cost but its second-order one: on a managed runtime it feeds a
collector whose pause lands on an unrelated frame, and on an unmanaged one it fragments a
heap whose cost appears later and elsewhere. Either way the symptom is decoupled in time
from the cause, which is why it survives so long.

**Hidden allocation.** Worse than the obvious kind, because it does not look like
allocation: building a string to use as a key, boxing a value to put it in a general
container, capturing state in a closure created per iteration, returning a fresh collection
from a helper called per participant, growing a container that was never given a capacity.
A generated system commonly contains several of these and none of them is spelled *allocate*.

**Per-step lookup by name.** Resolving something by a text identifier every step — hashing
the text, walking a map — where the resolution could have been done once at initialisation
and cached as a handle. This is frequently the largest single cost in generated gameplay
code and it is invisible to a reader, because a name lookup reads as free.

**Cold indirection.** A per-participant virtual call through a pointer chain that is nowhere
near the data it needs. Its cost is a memory stall of hundreds of cycles, paid per
participant, and it is why traversing one contiguous array of the two fields a step actually
touches routinely beats traversing a collection of full objects — the second one drags every
unrelated field through the cache to read a few values. This is the mechanism behind
data-oriented layouts, and it is a real, repeatedly measured effect at large populations, not
a stylistic preference.

**Work that did not need doing.** A participant fully outside any region of interest,
recomputing a value nothing read, running a distance check that a cheap early rejection would
have skipped. The fastest version of an operation is the one that was not performed, and the
first optimisation pass on generated code is usually a culling condition rather than a
pattern.

## Pooling: entry conditions and the reset obligation

A pool pre-allocates a fixed population and recycles instances instead of creating and
destroying them. It buys the elimination of allocation churn. It costs a population ceiling
that must be handled when reached, a lifetime model that no longer matches the language's,
and a reset obligation.

Adopt a pool when all three hold: instances are created and destroyed at step frequency, the
instances are short-lived, and the simultaneous population is boundable by a real number.
Projectiles, impact effects, damage numbers, audio one-shots, transient particles. Do not
adopt one for something created once per level, per encounter or per session — there is no
churn to eliminate, and the pool's costs are paid anyway.

The reset obligation is where automated authors fail, and the failure is worth naming
precisely. Acquiring from a pool hands back an object that was previously something else,
with every field still holding its previous value. Unless the acquire path reinitialises
*every* field the instance owns, the recycled object carries state from its former life: a
projectile that is still owned by a dead shooter, an effect that starts halfway through its
timeline, a participant that begins already flagged as expired. The symptom looks like a
gameplay bug — an enemy behaving oddly, damage attributed to the wrong source — and nobody
looks at the pool. The defence is structural: the reset lives in one place, it is exhaustive
by construction rather than by a list somebody maintains, and adding a field to the pooled
type without adding it to the reset is what a review looks for.

State the ceiling policy explicitly too. When the pool is exhausted the options are to refuse
the request, to grow, or to steal the oldest live instance, and each is right somewhere.
What is never right is failing silently: an unreported refusal renders as missing gameplay
with no diagnostic at all.

## Decision rules

- **When adopting any of these patterns, state the measured cost it removes, because an
  optimisation without a measurement is a guess wearing a pattern's name.** No profile means
  not measured, and not measured is not a justification — it is an unknown that must render
  as one.
- **Default the per-step opt-in to off, and turn it on only from evidence that per-step work
  exists.** Where the platform lets a participant declare whether it runs every step, that
  declaration is derived from whether the behaviour actually has a per-step path — never left
  at whatever the template shipped with. This is the cheapest form of the whole technique: a
  population of participants that opt into a step they do not use costs the frame for
  nothing, and the cost scales with the content.
- **Give every optimisation finding an estimated saving, and rank by it, so the largest cost
  is addressed first.** A list of true findings in arbitrary order is a list nobody works
  through in order.
- **Keep a measured saving and an estimated one in separate, distinguishable fields.** A
  figure derived from a profile and a figure derived from a per-instance constant are
  different epistemic objects; putting both in one field and sorting on it silently ranks a
  guess above a measurement. If they must share a ranking, the ranking says which each one is.
- **Suppress findings below a stated materiality floor, and state the floor.** A per-step cost
  under a small fraction of a millisecond is noise, and reporting it dilutes the findings that
  matter. The floor is a declared number with its unit, not a feeling — and its existence is
  reported, so a reader knows the list is filtered rather than empty.
- **When a per-step loop allocates, fix the allocation before considering a pool.** Most
  per-step allocation is hidden and removable outright; pooling is for churn that genuinely
  has to exist.
- **When something is resolved by a text identifier every step, resolve it once at
  initialisation and hold the handle.** This is nearly always the cheapest large win
  available in generated gameplay code.
- **When a container is filled every step, allocate it once and clear it, rather than
  creating it per step.** The scratch buffer that lives with the system is the boring shape
  and it is correct.
- **When a pooled type gains a field, the reset gains it in the same change.** Treat an
  incomplete reset as a correctness defect, not as untidiness.
- **When a pool's ceiling is reached, report it as a counted event.** Silent refusal produces
  a gameplay absence nobody can attribute.
- **When the population is large and the step touches two fields of a fat object, consider
  storing those fields contiguously instead.** The win is a cache effect and it grows with
  the population; below a few hundred participants it is usually not worth the loss of
  locality of reading.

## When not to use this

- **On cold paths.** Menu construction, level load, save serialisation, one-time setup.
  Allocation discipline applied there buys nothing and costs readability, and readability is
  the currency those paths trade in.
- **Before the system does what it is supposed to do.** Structure chosen for a cost that has
  not been measured tends to be structure chosen for the wrong cost, and it is much harder to
  change afterwards than before.
- **Where the platform's own machinery dominates the step.** When most of the step is spent
  inside the host's traversal, animation or physics, optimising the fraction under your
  control changes nothing measurable, and the honest report is that the cost is elsewhere.
