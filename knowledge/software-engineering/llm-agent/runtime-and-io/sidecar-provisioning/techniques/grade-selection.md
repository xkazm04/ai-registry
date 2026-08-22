---
layer: technique
type: technique
subject: sidecar-provisioning
technique: grade-selection
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [choosing which variant of a model or engine to provision, sizing a dependency against the machine it will run on, explaining why output quality changed without a version change, designing a download picker]
---

# Grade selection

[resolution-ladders](./resolution-ladders.md) answers **where** the artifact
comes from. It does not answer **which one**, because many external
dependencies do not resolve to a single file — they resolve to a *family*
of files that are interchangeable at the interface and unequal in what they
produce. Precision variants of the same weights, capacity tiers of the same
model, accelerated and plain builds of the same engine: same call, same
outputs' shape, different quality, different footprint, different speed.

Choosing among them is a second selection, orthogonal to the ladder, and it
is the one that decides how good the product's answers are. An application
that treats it as a picker with a size column has made its most
quality-determining decision the one nothing owns.

## A grade is not a version, and it is not a rung

Three axes get conflated because all three end in "which file do I load".
They are distinct and they fail differently.

- A **rung** is *where the artifact came from* — override, managed, system.
  Owned by resolution-ladders.
- A **version** is *when* — a temporal ordering, where later normally
  supersedes earlier and compatibility ranges apply. Owned by
  [capability-detection](./capability-detection.md).
- A **grade** is *how good, at one version* — a point on a quality-against-
  footprint curve, where no grade supersedes any other and the right choice
  depends on the machine and the job.

The consequence that matters: **the capability's identity survives a grade
change** ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Speech recognition is one capability whose current grade is *small*, not
three capabilities named tiny, base and small. Catalogs that mint a separate
identity per grade lose the ability to say "this machine is running the
capability at a reduced grade", because the sentence has no subject — and
every downstream consumer that stored a grade's id stored something that
cannot be compared to another machine's.

## The ceiling is derived from the host, and it is not the whole budget

The maximum grade a machine can run is a derived value: available memory,
what the accelerator can hold as opposed to what the machine has, and the
working state the artifact accumulates while running. That last term is the
one that gets dropped. A grade chosen to exactly fill the budget at rest
fails later, under a long session, at the moment a user is deepest into a
task — the artifact fits and the *work* does not.

So the ceiling is computed with headroom for the growing part, and because
it is derived it
[names its recomputation](../../../../_laws.md#derivation-names-recomputation):
recompute on hardware change, on catalog change, and when a grade the host
could not previously hold becomes reachable. A ceiling computed once at
install and cached forever is a stale answer on a machine the user upgraded.

## The label is a name; the measurement is the fact

Two traps, and they compound.

**Nominal grade names understate the artifact.** Grade labels are family
names, not measurements: a variant labelled for one precision routinely
carries meaningfully more than that per unit of weight, because the format
spends bits on its own metadata. A capacity plan built from the label
underestimates, consistently, in the direction that fails.

**Within one nominal grade, the format dominates the number.** Two artifacts
carrying the same grade label can differ from each other by more than either
differs from the grade above, because how the compression is distributed
matters more than how much of it there is. This is the trap that kills the
intuitive rule — *take the highest grade that fits* — because the highest
grade that fits is frequently beaten, at the same footprint, by a
better-constructed variant one notch down.

The discipline follows from the two together: **a catalog row's grade is a
label, and the fact is the measured pair** — what this artifact costs on
this host and what it scores on the jobs this product actually runs. Where
the publisher states measurements, carry them; where nobody does, the
product measures once and records it, the same way
[capability-floors](../../../orchestration/model-routing/techniques/capability-floors.md)
requires a floor to be set by observed breakage rather than by feeling.

## Degradation is not uniform across the jobs the artifact serves

Grade loss does not spread evenly. Work that composes many steps — reasoning
chains, long-horizon orchestration, structured extraction that must stay
parseable — degrades first and steeply. Work that is short and
pattern-shaped barely moves across the whole range. Two capabilities served
by one artifact therefore have two different floors, and averaging them into
one recommendation is how a product ships a grade that is fine for its
demos and broken for its hardest feature.

The decision rule: **the floor belongs to the capability, not to the
artifact.** Where one provisioned artifact serves several features, the
grade must clear the highest floor among the features that will use it, or
the features that cannot be served at that grade are gated off explicitly —
never left running at a grade below their floor, returning plausible output.

## A reduced grade is a different outcome, not a quieter one

The capability verdict vocabulary — available, absent, broken — has no room
for *available at a reduced grade*, and that missing state is where silent
quality loss lives. A machine that could only hold two grades below the
recommendation reports **available**, and every output it produces is worse
than the same product's output on the next machine, with nothing anywhere
saying so ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

Two obligations close it:

1. **The verdict carries the grade.** *Available at grade G, recommended
   grade H, limited by <the constraint>* is the honest verdict, and it is
   what lets a support conversation about "the answers are worse on my
   laptop" resolve in one question instead of ten. This is the same rule
   capability-detection already applies to a fallback implementation — the
   switch is made visible rather than silent — extended to the case where
   the implementation is identical and only its grade moved.
2. **The output carries the grade it was produced at.** Two results
   produced at different grades are not comparable, and a stored result
   whose grade is unrecorded cannot be re-judged later when the grade
   changes. A quality regression that is actually a grade change is
   undiagnosable without this, and it is the cheapest field in the record.

Note what this does to the provisioning lifecycle: the states are per
*artifact*, so a capability whose grade moved is **resident** at the new
grade and **evicted** at the old one, while the capability itself never
left. Only a record keyed to the capability, not to the file, can say what
grade is in force.

## Decision rules

- **Recommend, do not merely enumerate.** A picker that lists grades with
  their sizes has handed the user a capacity-planning problem they cannot
  solve; the product knows the host and the job and should say which row it
  recommends and why.
- **Recommend the best measured variant that fits with headroom** — not the
  largest that fits, and not the smallest that runs.
- **Let the operator override the recommendation**, and honour the override
  loudly: a user who chose a grade the host cannot hold gets an error naming
  the constraint, not a silent substitution.
- **Never substitute a grade silently.** Downgrading to make something work
  is defensible; doing it without saying so is not.
- **Re-derive the ceiling on the events that change it**, and re-offer the
  recommendation when a better grade becomes reachable. Machines get
  upgraded; catalogs gain rows.
