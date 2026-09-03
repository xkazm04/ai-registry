---
layer: technique
type: technique
subject: test-harness
technique: isolation-lanes
status: forged
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [deciding what each lane's tests may inherit, tests pass on one machine and fail on another, a live product lane flakes when run in parallel]
---

# Isolation lanes

Isolation answers one question per suite: **what may this suite's tests
inherit, and from whom?** The answers form lanes — configurations of
environment, parallelism, and reset policy — and the technique is to make
each lane's answer explicit, enforced by the harness, and impossible to
violate by accident.

## The inheritance ledger

Every lane declares what its tests inherit:

- **From the developer's machine**: nothing, ideally. A test that reads the
  developer's real profile, real configuration, or real credentials passes on
  one machine and fails on the next, and — worse — can *mutate* the
  developer's world. The fix is the clean-environment launcher below.
- **From the previous test**: nothing in parallel lanes (each worker owns its
  copy — see [fixture-economics](./fixture-economics.md)); in serial lanes, a
  defined reset between tests, because serial tests share the single instance
  by construction.
- **From the previous run**: nothing, and this is the one everyone forgets.
  Scratch state that survives a crashed run poisons the next run with
  yesterday's world. Every temporary profile, port claim, and scratch
  directory names its reaper
  ([_laws: creation-names-reaper_](../../../../_laws.md#creation-names-reaper)) —
  and because a crashed run's reaper never fired, launchers reap *stale
  leftovers at startup* as well as their own droppings at exit.

## The clean-environment launcher

A launcher is a small program that constructs the world a test process runs
in, then starts it. It creates a fresh profile directory, points every
environment knob the product honors at that directory, seeds it from the
fixture tier the lane requires (or leaves it virgin for first-run tests),
allocates ports, starts the process, and tears the world down afterwards.

Three rules make launchers trustworthy:

1. **The launcher is the only entrance.** If tests can also be started raw —
   inheriting whatever world the invoker happened to have — the lane's
   isolation guarantee is folklore. Wire every path (local convenience
   scripts, the pipeline, documentation) through the launcher.
2. **First-run flows get a virgin profile, not a cleaned one.** Onboarding,
   migration-from-nothing, and default-generation paths behave differently in
   a directory that was scrubbed than in one that never existed. "Fresh"
   means *created empty by the launcher*, and a lane that certifies first-run
   behavior says so in its name.
3. **The launcher asserts its own preconditions.** A launcher that silently
   falls back to the real profile when the environment knob is ignored has
   inverted its purpose — the suite goes green against the wrong world
   ([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)). Verify the
   process actually adopted the constructed world (probe where it wrote its
   startup state) before running a single test.
4. **The launcher names its residual seams.** No launcher isolates
   everything: an embedded browser shell keeps its own storage outside the
   profile directory, a system secret store is machine-global, a graphics or
   font cache persists. The honest launcher documents, at its own front door,
   exactly what it does *not* isolate and where that seam is closed instead
   (a reset step at the test layer, an explicit scrub, or an accepted
   exposure). An isolation guarantee with an undocumented exception is not a
   smaller guarantee — it is a trap for the first test that depends on the
   exception being covered.

## The singleton catalog

Some resources admit exactly one holder per machine: a fixed listening port,
a named data directory, the operating system's secret store, a hardware
device, a global registration. Each such resource forbids a second live
instance of whatever holds it — and therefore forbids parallelism for any
lane that runs the real product.

The technique is to **catalog these singletons explicitly** in the harness
documentation and encode their consequence in lane configuration: the
live-product lane declares serial execution *with the catalog as the stated
reason*. The alternative — leaving parallelism on and letting the second
instance lose the port race — produces the worst diagnostic in testing: an
intermittent failure whose frequency depends on scheduler luck. A constraint
stated is a constraint enforced; a constraint discovered per-flake is
re-discovered forever.

Where parallelism genuinely matters for a singleton-bound product, the
options are structural, not configurational: virtualize the singleton (per-
instance ports and directories, if the product supports parameterizing them),
or containerize per worker. Both are product changes; the harness cannot
conjure isolation the product does not offer.

## Observers that rewrite the artifact are singletons too

The catalog above is about resources on the machine. There is a second class of
exclusivity that lives inside the build, and it produces the same intermittent
mystery from a different direction.

Several of the most valuable instruments work by **rewriting the artifact under
test**: a coverage counter that inserts a probe at every region, a runtime
checker that inserts a guard around every memory operation, a profiler that
inserts an accounting call at every entry. Each one is claiming the same
resource — the right to be the thing that transforms the code — and two of them
in one build produce a rewritten artifact neither of them expects.

What makes this worth a rule rather than a note is the **shape of the failure**.
The composed run does not report a conflict between observers. It reports a
crashed test process, a truncated or malformed instrumentation record, a
coverage figure that is impossibly low, or a checker finding in code the author
just wrote. Every one of those reads as a defect in the product, and an engineer
will spend a day on the wrong bisect before anyone thinks to ask which
instruments were attached. Nothing in the output names the actual cause.

So the pipeline **states which instruments are mutually exclusive** rather than
discovering it from a crash: each instrumenting lane declares the rewrite it
performs, and the configuration refuses — with a message naming both
instruments — a lane that would attach two. The measurements are then taken in
separate runs, which costs a second execution and is the correct price. It is
the same move as the singleton catalog: a constraint stated is a constraint
enforced; a constraint discovered per-flake is re-discovered forever.

Two consequences follow for the numbers those lanes produce. A reading taken
under one instrument is not comparable with a reading taken under another, and
neither is comparable with an uninstrumented run — so a lane's output carries
which rewrite was in effect. And where two instruments genuinely measure the
same quantity by different rewrites, disagreement between them is expected;
name one the source of truth in the lane's configuration rather than
re-litigating it each time.

**Where the instruments compose by design, this does not apply.** Some tools are
built as a composition of two rewrites — an input generator guided by coverage
feedback is coverage instrumentation and a runtime checker in one artifact,
integrated by whoever built it and tested as a unit. That is a supported
combination, not an accidental collision, and the rule is about accidental
collisions. The test is whether some single party has declared the pair
supported: if yes, run it; if the combination exists only because two lanes
happened to be enabled in the same configuration, refuse it.

## Parallelism as declared policy

The composite picture, per lane: pure-logic lanes run **wide** (parallel
workers, no shared state); infrastructure-backed lanes run **per-worker
isolated** (each worker its own copied fixture); live-product lanes run
**serial** (singleton catalog). The declaration lives in each lane's own
configuration — which is one of the standing arguments for one configuration
per suite in [suite-partitioning](./suite-partitioning.md) — so the policy is
read where the lane is defined, not inferred from where it flakes.
