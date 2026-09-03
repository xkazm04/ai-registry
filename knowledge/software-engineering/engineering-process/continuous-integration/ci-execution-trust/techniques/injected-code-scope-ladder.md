---
layer: technique
type: technique
subject: ci-execution-trust
technique: injected-code-scope-ladder
status: forged
stage: team
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [adding lifecycle code to a build, auditing what runs before your commands do, adopting a third-party pipeline extension]
---

# Injected code scope ladder

Every delivery system lets code run around your commands — before checkout, after checkout,
before the command, on exit — and lets it come from more than one place. The places have very
different reach, and ordering them is the cheapest high-value audit in this subject. Most teams
have never listed theirs. The same ladder recurs inside an agent runtime, where the tiers are
startup-only configuration versus a file a service can write; that instance, with its own
fail-open rules, is agent-runtime-assembly's operator-tier-code-loading.

## The ladder

| tier | runs for | changed by | review it gets in practice |
|---|---|---|---|
| **machine** | every job on that machine, from every repository | whoever administers the fleet | usually none, because it is infrastructure |
| **repository** | every job for that repository | everyone who can land a change there | ordinary code review |
| **step** | one step that opted in | the same people, plus whoever publishes the extension | ordinary review of the reference, none of the contents |

The reach column is the whole argument. Machine-tier code applies to repositories whose owners
have never heard of it — including repositories added next year. It is the tier with the widest
blast radius and the thinnest review, which is an unfortunate combination and an extremely
common one.

## The rule: push code down the ladder until it stops working

Not a prohibition — a default with a burden of proof. Machine-tier code is legitimate for what
genuinely concerns the machine: bootstrapping the runtime, enforcing fleet-wide policy,
cleaning up after jobs, absorbing a platform quirk that fires before anything else can. It is
not the place for a convenience that saves one repository some duplication, because the
convenience lands on every unrelated repository forever.

The question to ask of any proposed machine-tier addition: *would I be comfortable if this ran
before every job of every team using this fleet, including teams I have not met?* If the answer
needs qualifying, the code belongs one tier down.

## Each tier gets one door

Per [one-validation-door](../../../../_laws.md#one-validation-door), each tier has exactly one
enumerable place its contents come from:

- **Machine tier**: provisioned by whatever builds the machine, from one source, reviewable as
  code. Machine-tier code applied by hand to a running machine is unreviewable and undiscoverable,
  and it is the origin of most "why does this only fail on that runner" incidents.
- **Repository tier**: one location in the repository, covered by the same review as everything
  else there. Not several locations with different conventions.
- **Step tier**: extensions referenced from one manifest, with pinned versions, so the set is
  greppable.

A tier with two doors has the review standard of the weaker one.

## Ordering across tiers is a security property, not a detail

Where tiers stack, the earliest-running code wins: whatever runs first can modify the
environment everything else observes. This means machine-tier code can rewrite what
repository-tier code sees, and both can rewrite what your commands see — including which
binaries resolve, which certificates are trusted, and where a credential-fetch call goes.

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a check running *after* injected
code observes the world that code left behind. Anything asserting a property of the environment
must run before code that could have changed it, or it is testing the modification rather than
the environment.

## Third-party extensions are dependencies with execution privilege

A step-tier extension is code from someone else that runs inside your build with the build's
identity. It is a dependency, and it deserves what a dependency gets — plus a note that it is a
dependency with unusually direct reach.

- **Pin by digest, not by a moving name.** A floating tag is an agreement to run whatever that
  publisher pushes next, evaluated at build time, with no review step in between.
- **Read what you adopt, once.** These are usually small. The tier's characteristic gap is that
  the reference gets reviewed and the contents never do.
- **Prefer the fewest.** Each one is another party with execution privilege inside your builds,
  and the aggregate is rarely counted.
- **Know what it can reach.** An extension inherits the environment. If your credentials are in
  it, they are available to every extension you run.

## The audit

Once, and then when a machine image changes:

1. List every location, at every tier, from which code enters the job lifecycle.
2. For each: who can change it, what review it gets, and what it would reach.
3. For anything at the machine tier: justify it, or move it down.
4. For every third-party extension: is it pinned by digest, has anyone read it, and what does
   it reach.

The output is usually one or two surprises. That is what the exercise is for.

## Decision rules

- Enumerate the tiers you have; teams that have not done this do not know their widest tier.
- Default to the lowest tier that works; machine-tier additions carry a burden of proof.
- One enumerable source per tier; no hand-applied machine-tier code.
- Environment assertions run before code that could have modified the environment.
- Pin third-party extensions by digest, read them once, keep the count low, and know what they
  inherit.
- Re-audit when the machine image changes; that is the tier nobody notices drifting.
