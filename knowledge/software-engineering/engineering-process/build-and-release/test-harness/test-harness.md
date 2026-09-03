---
layer: golden-path
type: golden-path
subject: test-harness
status: forged
techniques:
  - suite-partitioning
  - history-driven-partitioning
  - fixture-economics
  - live-app-harness
  - isolation-lanes
  - platform-quirk-absorption
  - flake-lifecycle
  - long-lane-certification
  - negative-control-tests
  - out-of-graph-artifacts
  - gate-scope-is-not-report-scope
  - dynamic-verifier-classes
  - verification-inherits-driver-reach
  - recorded-interaction-fixtures
---

# Test harness architecture

A test harness is the machinery between "tests exist" and "tests inform
decisions." The tests themselves assert facts; the harness decides which facts
get checked, when, against what environment, at what cost, and how the answer
reaches a human while it still matters. Most suites that rot do not rot at the
assertion level — they rot at the harness level: everything runs everywhere,
feedback arrives too late to act on, fixtures cost so much that nobody adds
tests, and the one lane that could catch real defects has quietly never worked.

The subject boundary: this standard owns the machinery. How non-deterministic
model behavior gets judged is the eval-harness subject; where in the delivery
pipeline each suite is allowed to block is the quality-gates subject. The
harness builds the machines; quality-gates decides which doors they guard.

## A suite is a machine, not a tag

The foundational mistake is treating "the tests" as one population filtered by
labels inside one configuration. A unit suite, an integration suite, an
end-to-end suite, and a soak lane are **different machines**: they have
different time budgets, different parallelism, different environmental
requirements (nothing / containerized services / the real product), different
failure semantics, and different default schedules. Forcing them through one
configuration means the fastest lane inherits the slowest lane's setup cost and
the question "what exactly runs on commit?" has no answer short of executing
the filter logic in your head.

The correct shape is a **portfolio**: one configuration per suite, membership
decided by location rather than annotation, and a partition so legible that a
directory listing reads as the answer to "what runs where." The
[suite-partitioning](./techniques/suite-partitioning.md) technique carries the
full decision table.

Splitting *within* a suite is a separate question with a separate answer.
Once a machine is defined, distributing it across parallel workers is a
bin-packing problem over **measured duration** — never over file count, name,
or hash, all of which optimize for equal numbers of tests in a population whose
durations span orders of magnitude. The usual result of the naive split is one
worker at nine minutes beside three at two, wall clock set by the first, and
most of the purchased parallelism idle. The check is one ratio (slowest worker
over mean worker), the fix is longest-first assignment from retained timing
history, and the trap is the test with no history yet. See
[history-driven-partitioning](./techniques/history-driven-partitioning.md).

Both questions assume the harness already knows the code exists. That
assumption fails at one boundary: every whole-project command ranges over a
**declared membership list**, not over the checkout, so a project the list
omits is outside every green the command can produce. Detached packages —
built for another target, published on another cadence, written in another
language — leave the graph for sound packaging reasons and take their coverage
with them, and when they depend on an in-graph library by path they stop
compiling because something *else* changed, with a green board throughout. The
inventory is taken from the artifact side (what does this project ship, and
which gated root reaches each one), and the answer for a loadable artifact is
not a compile but a load. See
[out-of-graph-artifacts](./techniques/out-of-graph-artifacts.md).

## The fidelity ladder — and what each rung buys

Suites arrange on a ladder of fidelity versus cost:

| Rung | Verifies | Budget | Runs |
| --- | --- | --- | --- |
| unit | pure logic in isolation | milliseconds per test, seconds per suite | every save / commit |
| integration | components against real infrastructure (a real store, a real queue) | seconds per test | commit / push |
| end-to-end | assembled flows through the product's own entry points | tens of seconds per test | push / merge |
| live-app | the actual shipped process, driven from outside | minutes, serial | scheduled + on demand |
| long lanes | endurance, load, chaos — behavior over time | hours | nightly / weekly |

Two disciplines make the ladder honest. First, **each defect class is caught at
the cheapest rung that can see it** — a validation bug caught in the live-app
lane is a unit test that was never written, paid for at a thousand times the
price. Second, **the top rungs exist because the bottom rungs see proxies**.
Unit and integration tests exercise the code as the test imports it, not the
product as it ships: wiring, packaging, startup ordering, singleton
initialization, and inter-process boundaries are all invisible below the
live-app rung ([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)). A
harness with no lane pointed at the real running product has a permanent blind
spot exactly where integration risk concentrates. The
[live-app-harness](./techniques/live-app-harness.md) technique owns that lane.

## Reaching the code is not the same as watching it run

The ladder above arranges suites by *fidelity of the thing under test*. A
second, independent axis arranges them by *what observes the run*. A suite's
own assertions check the facts somebody thought to state; a dynamic verifier
attached to the same run checks a class of facts nobody states in a test at
all — invalid memory access, unsynchronised concurrent access, values that are
not legal inhabitants of their type, resources never released. These are
harness lanes, not test categories: the tests do not change, the instrument
watching them does.

Two properties decide how those lanes are configured, and both are routinely
got wrong. First, **verifiers partition by how they observe, not by what they
find** — one family re-executes the program's own semantic representation and
knows every rule the source language declares but stops dead where the program
leaves that representation; the other observes emitted machine code, crosses
every boundary, and knows none of those rules. The seam that halts the first is
where the second's findings concentrate, so a project with foreign code and one
verifier is unverified exactly where its risk is
([dynamic-verifier-classes](./techniques/dynamic-verifier-classes.md)). Second,
**a verifier certifies only what drove it**: it is a lens on an execution, so a
clean result is a statement about the region the driving suite reached and
renders identically to a statement about all of the code. The verdict travels
with the driver's measured reach or it overstates
([verification-inherits-driver-reach](./techniques/verification-inherits-driver-reach.md)).

## Fixtures are an economic asset

The single largest lever on suite speed is rarely the assertions — it is setup.
An expensive environment (a migrated schema, a seeded dataset, a compiled
artifact) must be **built once and copied per test**, never rebuilt per test.
The copy operation is cheap precisely because it does no logic; the build
operation is allowed to be expensive precisely because it amortizes across the
whole suite. Get this backwards and the suite's runtime grows linearly with its
test count until adding a test becomes an act of self-harm — at which point
people stop adding tests, which is the actual failure.

The build-once asset introduces two obligations: the template must name what
rebuilds it and when (a stale fixture validates yesterday's world with today's
green checkmark), and seeded data must be honest about which invariants it
carries. Both live in [fixture-economics](./techniques/fixture-economics.md).

One fixture class inherits that staleness problem and cannot answer it the same
way: a **recorded interaction** with a service somebody else operates. Its
rebuild is not a script this repository can run — it is a live call to a system
that changes without telling anyone, so the fixture ages against a world no
local check can see. It also arrives with two dials no other fixture has, one
protecting secrets and one buying stability, both of which weaken the assertion
as they are turned. That is
[recorded-interaction-fixtures](./techniques/recorded-interaction-fixtures.md).

## Isolation is a property of the lane, not the test

Whether tests may run in parallel, whether they share state, and what
environment they inherit are decided **per suite** by what that suite touches
— never rediscovered per test through flakes. Pure-logic suites parallelize
freely. Suites touching a shared store need per-worker isolation. And a product
that is structurally a singleton — one port, one data directory, one exclusive
handle on a system resource — **cannot run two live instances**, so its
live-app lane is serial by law of the product, not by timidity of the harness.
Writing that constraint into the lane's configuration converts an intermittent
mystery into a stated property. Clean-environment launchers, fresh-profile
runs, and the singleton catalog live in
[isolation-lanes](./techniques/isolation-lanes.md).

## The harness absorbs platform pain — once

Every platform has a class of failure that fires **before the first test
runs**: a loader that rejects the binary, a missing runtime manifest, a
mislabeled cached artifact, a sandbox rule that differs between the developer's
machine and the runner. These failures are maximally confusing — the process
dies with no output, which reads as "zero tests, exit code, nothing" — and
maximally repetitive: every engineer hits the same wall independently.

The standard is absorption: the harness's launcher detects the condition,
repairs or works around it, and **converts silence into a named diagnosis**
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
The fix is written once, in the one wrapper every invocation goes through, and
it carries the story of where it bit — because a quirk fix without its incident
attached is the first thing a future cleanup deletes. See
[platform-quirk-absorption](./techniques/platform-quirk-absorption.md).

## Lane health: green must be earned, red must be loud

Three failure modes destroy a harness's authority, and all of them are silent.

**A lane that has never passed.** A suite can be added, wired into the
pipeline, and fail 100% of its runs from inception — and if nothing
distinguishes "this lane is red because the product broke" from "this lane has
never once been green," the failures become wallpaper and the lane certifies
nothing while appearing to exist. A lane earns trust only after it has been
observed green on a good build **and** observed red on a known-bad one; until
both observations exist it is scaffolding, not a gate. Track first-green as an
explicit event, and treat a lane with a 100% historical failure rate as a
missing feature in the harness, not as a noisy suite.

**A flaky test deleted instead of quarantined.** A test that fails
intermittently is reporting something — about the test, the harness, or the
product — and deleting it converts that report into silence at the exact site
where visibility existed
([_laws: deletion-is-not-repair_](../../../_laws.md#deletion-is-not-repair)). The
standard is **loud quarantine**: the test moves to an explicitly named
quarantine set that still runs but does not block, with an owner and an entry
date, reviewed on a schedule. Quarantine that grows without review is deletion
with extra steps; the reviewing is the discipline.

Retries deserve the same honesty: an automatic retry that hides the first
failure is flake-masking; a retry that **records** the first failure while
salvaging the run is flake-measurement. The count of retried tests is a health
metric of the harness, and like any count it travels with its predicate
([_laws: count-carries-predicate_](../../../_laws.md#count-carries-predicate)).

**A lane that is green over a population chosen to make it green.** The two
above are failures of the tests. The third is a failure of the *denominator*,
and it hides better than either, because nothing is red, nothing is flaky, and
the number is arithmetically correct. A coverage gate scoped to the directories
the suite already covers reports honestly on those directories and says nothing
at all about the rest of the tree — a file no test imports does not appear at
0%, it does not appear. The scoped gate is the right way to introduce a
threshold; the mistake is letting one include list serve both the gate and the
report, which redefines the codebase as the part already tested and makes the
ratchet structurally unable to notice a new untested directory. Two include
sets, two predicates, one run:
[gate-scope-is-not-report-scope](./techniques/gate-scope-is-not-report-scope.md).

Flakiness is not a state a test sits in, it is a **process it goes through** —
detected, labelled, quarantined, fixed, released — with an owner at every
transition. Detection is a query over retained run history (how often an
outcome changed on the same code), not an impression; labelling is applied
*and removed* by the system, or the flaky population only ever grows;
quarantine carries an owner, an entry date and an expiry, which is what makes
it debt rather than amnesty; and release requires a stable window, not one
green run. The two figures that keep the register honest are its size trend
and the age of its oldest entry — the second is the more diagnostic of the
two. The five transitions, the muted-versus-skipped choice, and the register's
ceiling are [flake-lifecycle](./techniques/flake-lifecycle.md).

## Long lanes are certifications, not gates

Endurance, load, and chaos runs answer questions no per-change gate can:
does memory grow over hours, does throughput hold at concurrency, does the
system recover from injected failure. They run on their own clock (nightly,
weekly, pre-release), judge against **statistical criteria** (percentiles,
ceilings, survival durations) rather than boolean assertions, and produce
artifacts whose value is the trend line across runs. Blocking a pull request on
a soak run misunderstands both; the design of these lanes is
[long-lane-certification](./techniques/long-lane-certification.md).

## The techniques

- [suite-partitioning](./techniques/suite-partitioning.md) — one configuration
  per suite, membership by location, the cost-tier table, and what runs at
  commit / push / merge / nightly.
- [history-driven-partitioning](./techniques/history-driven-partitioning.md) —
  splitting one suite across workers by measured duration, longest-first
  assignment, continuous rebalance, and the cold-start default.
- [fixture-economics](./techniques/fixture-economics.md) — build-once-copy-per-
  test, fixture freshness and its rebuild trigger, seeded-data honesty.
- [live-app-harness](./techniques/live-app-harness.md) — driving the real
  product through a test-only control surface: serial constraints, readback
  for fire-and-forget operations, the test-identifier contract.
- [gate-scope-is-not-report-scope](./techniques/gate-scope-is-not-report-scope.md)
  — the gate's scoped include set versus the report's whole-tree denominator,
  the ratchet's blind spot, and the obligation an exclusion carries.
- [isolation-lanes](./techniques/isolation-lanes.md) — clean-environment
  launchers, fresh profiles, the singleton catalog, parallelism as per-suite
  policy.
- [platform-quirk-absorption](./techniques/platform-quirk-absorption.md) —
  pre-main failures solved once in the runner, silence converted to diagnosis,
  the incident story kept attached.
- [flake-lifecycle](./techniques/flake-lifecycle.md) — detection from outcome
  transitions, auto-applied and auto-removed labels, owned and expiring
  quarantine, retry as measurement, and release on a stable window.
- [long-lane-certification](./techniques/long-lane-certification.md) — chaos /
  load / soak as scheduled lanes with statistical pass criteria, lane-health
  bookkeeping, and quarantine review.
- [negative-control-tests](./techniques/negative-control-tests.md) — proving a test
  can fail before trusting it: choosing a mutation the system cannot absorb, and
  why a process-global crash handler installed for quiet makes a whole suite
  unfalsifiable.
- [dynamic-verifier-classes](./techniques/dynamic-verifier-classes.md) — the two
  families of runtime verifier separated by where they observe from, why the
  boundary that halts one is where the other's findings concentrate, and the
  cost tier each belongs on.
- [verification-inherits-driver-reach](./techniques/verification-inherits-driver-reach.md)
  — a runtime verdict is a claim about the region the driver executed: the two
  numbers that must be published together, and the exhaustive-checker case where
  pairing them understates.
- [recorded-interaction-fixtures](./techniques/recorded-interaction-fixtures.md)
  — captured traffic as the fixture: the seam in the production transport, the
  sanitizer/matcher pair that sets how much the suite still asserts, the
  freshness debt a recording carries because it names no service version, and
  warehousing recordings behind a committed tag.
- [out-of-graph-artifacts](./techniques/out-of-graph-artifacts.md) — the gate's
  population is the declared build graph, not the repository: taking the ship
  inventory, gating a detached root, loading rather than compiling a plugin, and
  the boundary against partitioning and liveness.
