---
layer: technique
type: technique
subject: supply-chain
technique: build-time-dependency-tier
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [pricing a dependency whose code never ships, a code generator or compile-time plugin enters the graph, deciding which dependencies deserve a read-the-source review, auditing what a developer workstation is exposed to by a build]
---

# The build-time dependency tier

A resolved dependency graph is usually read as one population with one risk
model: *this is the code we depend on, and here is the policy that gates it.*
It is two populations. One will run inside the shipped product, on the
product's machines, under the product's constraints. The other runs **at
build time — on the developer's workstation and on the build runner** — with
those machines' filesystem, their outbound network, their environment, and
whatever credentials happen to be materialized while the build is running.

Every ecosystem has this tier under some name: compile-time code generators,
build plugins, native-library discovery helpers, packaging backends,
preprocessor and macro packages, test-time tooling, the pipeline's own steps.
The tier's defining property is not what it is called; it is *when* it
executes and *whose* machine it executes on. And the answer to the second
question is routinely misread, because cross-compilation makes it explicit:
a build-time helper for a graph that targets an embedded device or a foreign
architecture still runs on the host that invoked the build, natively, with no
sandbox and no target's constraints in the way.

## Why one policy over the merged graph misprices both halves

A single policy evaluated over the resolved graph gates both populations as
though their blast radii were the same. They are opposites:

- A **runtime** dependency's exposure is the product's threat model: the data
  it can reach, the requests it can make, the users it can affect. It is
  large and it is the one everybody models.
- A **build-time** dependency's runtime exposure is often *nil* — none of its
  code is in the shipped artifact, so a policy pricing risk by shipped
  exposure scores it near zero. Its actual exposure is arbitrary code
  execution on an engineer's workstation, mid-build, beside a live credential
  agent and a checkout of every repository that engineer works on, and on a
  runner that may hold a publishing token.

So the merged evaluation is not merely coarse — it is *inverted* for the tier
where a compromise is cheapest to exploit and hardest to notice. The gate is
reading a property (shipped exposure) that is a proxy for the risk in one
population and an anti-signal in the other
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The same inversion travels in the numbers. "The graph is clean" is a count,
and its predicate is *matched against advisories for code we ship*; reused
downstream as "our build machines are safe", it is a claim the measurement
never made ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
State the population beside the verdict or the verdict will be spent on the
other one.

## The tier gets its own inventory, and the inventory is short

The saving grace is size. Runtime graphs run to hundreds or thousands of
packages and can only be governed mechanically. The build-time tier is
typically **sparse enough to enumerate by hand** — often a dozen entries,
frequently under thirty, and largely stable between releases. That changes
what is affordable:

- **Enumerate it explicitly**, as a list a person maintains, not as a query
  someone could run. The list is short enough that an addition is visible in
  a diff, which is the property that matters most.
- **Read the source of new entrants.** At this size, actually reading what a
  build-time package does at build time is a bounded afternoon, and it is the
  only review that answers the question the advisory database cannot: *what
  does this reach?*
- **Answer "what could this reach" per entry**, in writing: does it read
  outside its own package directory, does it fetch from the network, does it
  shell out, does it read environment variables it did not declare. Those
  four questions catch nearly everything, and three of them are answerable by
  grep.
- **Treat a new build-time entrant as a higher tier than a new runtime
  entrant of the same size.** Where update review is tiered by version delta,
  this population's floor is raised one rung regardless of delta — a patch
  release that adds a build-time hook is a bigger event than a minor release
  of a shipped library.

The tier also has a distinctive smell test that the runtime tier does not: a
package that acquires build-time execution *having previously had none* is a
stop-everything signal, not a review item. Prior art for that signal as a
review input is [update-automation-review](./update-automation-review.md),
which names it among the release-integrity checks; what this technique adds
is that the signal has a standing population to be checked against, so the
question "did this package always execute at build time?" has a file with the
answer rather than a reviewer's memory.

## Boundaries with the neighbouring mechanisms

- [dependency-policy-gates](./dependency-policy-gates.md) says to inventory
  the resolution *mechanisms* and gives each its own policy. This technique
  splits one mechanism's output by execution phase — the two cuts are
  orthogonal, and a project can pass the first while merging both populations
  of the second.
- [verification-scope](./verification-scope.md) covers fetches a build
  performs outside the pinning the caller believed was total. Those fetches
  are frequently *by* this tier; the two are read together, and the pinning
  question ("was it verified?") is separate from this one ("what may it do
  once it runs?").
- The delivery system's own insertion points — which stages may execute code
  from where — are tiered elsewhere. That ladder is about the *pipeline*; this
  one is about the *graph*.

## Decision rules

- **Split the graph by execution phase before applying any risk judgment.**
  A dependency that runs at build time is in a different tier than one that
  ships, even when it is the same package at two versions.
- **Price the build-time tier by the host's exposure, never by the artifact's.**
  Ask what a compromised entry could read, write, and send *from the machine
  that builds*.
- **Keep the build-time inventory by hand and keep it small.** If it is too
  large to read, that is the finding.
- **Every clean verdict names the population it examined.**
- **A package newly acquiring build-time execution is escalated, not batched.**

## When this is ceremony

In a **hermetic build environment** — network-isolated, ephemeral, with no
credentials materialized during the build stage and a filesystem that holds
nothing but the checkout and the pinned inputs — the build-time tier's blast
radius collapses to *the artifact it produced*, which is exactly the runtime
tier's exposure, and no worse. At that point the two populations really are
one risk and separate treatment is bookkeeping. The honest sequence for a
team that dislikes the extra inventory is therefore not to argue the tier
away but to build the isolation that makes it redundant — and to notice that
the isolation must cover the **developer's** build too, not only the runner's,
because the workstation is the machine with the credential agent on it.
