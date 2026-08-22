---
layer: technique
type: technique
subject: runner-fleet
technique: fleet-isolation-boundaries
status: forged
stage: fleet
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [one fleet serves several repositories or teams, deciding which pools may reach production, an unrelated repository turned out to affect yours]
---

# Fleet isolation boundaries

A fleet serving more than one repository is a shared execution environment, and the sharing is
transitive in ways nobody designs. Two repositories with no relationship in anybody's mental
model acquire a direct one the moment their jobs land on the same machine.

The technique is to make the boundaries explicit and enforced, rather than assumed and
conventional. A convention is not enforced by anything, and the exception is added by someone
who did not know it was a convention.

## The two boundaries worth drawing

**Repository to pool.** Which repositories may run work on which runners. Without this, every
repository the delivery system serves can reach every runner, which means the least-reviewed
repository in the organization determines the security of the most-reviewed one.

**Pool to environment.** Which runners may reach which networks, stores and services. This is
the one that limits blast radius: a pool that cannot route to the production database cannot
be made to read it, regardless of what it is told to run.

Both are grants, and both default to nothing. A boundary drawn as "everything except" acquires
holes as the fleet grows, because each new thing is included by default and nobody notices the
addition.

## The transitive channels

Enumerate these explicitly, because each is a path between two jobs that the pool-level
boundary does not by itself close:

- **The filesystem.** Checkouts, temporary directories, and anything the previous job wrote.
- **Caches.** A shared cache is a write channel: one job writes, another restores. This is the
  most commonly overlooked path and it crosses repository boundaries by design.
- **Daemon sockets.** A container or virtualization socket mounted into a job is usually
  equivalent to administrative access on the host, which makes every other isolation control on
  that machine advisory.
- **Machine-resident credentials.** A package registry credential, a cloud instance identity, a
  configured artifact store — available to every job on the machine, not only the one it was
  provisioned for.
- **Network position.** What the machine can reach, which is inherited by every job on it.
- **Machine-tier lifecycle code**, which runs for every job on the machine regardless of
  repository. That is the injected-code ladder's top tier, and it is a fleet property as much
  as a trust property.

## One door per boundary

Per [one-validation-door](../../../../_laws.md#one-validation-door), each grant is expressed in
one place, as data, reviewable:

- One place saying which repositories reach which pools.
- One place saying what each pool can reach.
- Not a mixture of scheduler configuration, network rules applied by hand, and a convention
  about naming.

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), the enforcement must sit where it
cannot be talked out of: a network boundary the runner cannot route past constrains a job
regardless of its instructions; a scheduler rule constrains only jobs that go through the
scheduler. Both are useful and they are not equivalent, and knowing which you have is the point
of writing them down.

## Practical grouping

The useful grouping is by **what a compromise would cost**, not by team chart:

- **Production-reaching pools** get the tightest membership, the shortest list of repositories,
  and ephemeral runners without exception.
- **Verification pools** — building and testing, no deployment reach — can be broader, and are
  where most work belongs.
- **Untrusted pools** for outside contributions hold nothing and reach nothing, and share no
  machine, cache or credential with the other two.

Three tiers is usually enough. Per-team pools are a common instinct and a poor grouping: teams
are not a blast-radius boundary, they change more often than infrastructure should, and the
arrangement produces many small pools that are simultaneously starved and idle.

## The honest accounting of shared runners

Sharing is cheaper and it costs something real. State the cost rather than discovering it:

- A shared runner means a job from another repository ran on this machine before yours, and
  whatever it left is your starting condition — unless the runner is ephemeral, which is why
  that technique and this one are usually adopted together.
- A machine-resident credential provisioned for one repository is available to all of them.
- A cache written by one is restorable by another.
- The blast radius of any single runner compromise is every repository that pool serves.

If those costs are acceptable, sharing is the right answer and the cheaper one. The failure is
paying them without having listed them.

## When NOT to build this

A fleet serving one repository has no boundary to draw and should not invent one. A fleet
serving several with identical trust levels and no production reach needs the pool-to-
environment boundary and can skip repository-to-pool. Build the boundary that separates
*different* trust levels; a boundary between identical things is configuration nobody maintains.

## Decision rules

- Draw repository-to-pool and pool-to-environment as explicit grants; both default to nothing.
- Enumerate the transitive channels — filesystem, cache, daemon sockets, machine credentials,
  network position, machine-tier code — and close each deliberately.
- One reviewable place per grant; know which of your controls are enforced outside the
  scheduler.
- Group pools by blast radius: production-reaching, verification, untrusted. Not by team.
- Never share a machine, cache or credential between the untrusted pool and any other.
- Where runners are shared, write the cost list down and confirm it is acceptable.
