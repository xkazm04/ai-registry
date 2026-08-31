---
layer: technique
type: technique
subject: build-economics
technique: build-measurement
status: forged
laws: [count-carries-predicate, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [deciding whether a claimed build win is real, attributing a memory peak to the process behind it, settling whether the build got slower this year]
---

# Build measurement

Build optimization without measurement is folklore with a commit history.
Developers' impressions of build time are dominated by the worst recent
experience; memory is not perceptible at all until it kills the build; and
plausible-sounding wins ("splitting this will surely help", "that flag is
known to be faster") are wrong often enough that acting on them unmeasured is
negative-expected-value. The technique is a small set of instruments and one
discipline: **numbers are produced by scripts, every number names its
scenario, and every claimed win ships as a before/after pair.**

## The instruments

**Wall-clock** is the easy one — timestamp around the build command — with two
requirements that separate an instrument from an anecdote: the script records
the *scenario* alongside the number (variant, cold/warm/incremental, machine,
date), and it is cheap enough to run that it actually gets run. A build-time
figure without its scenario is unusable: cold and incremental differ by an
order of magnitude, variants differ by whole subsystems, and a number that
travels without its predicate will be quoted for a claim it does not support.

**Peak memory** cannot be observed after the fact and cannot be computed from
anything else — it must be *sampled while the build runs*. The instrument is a
sampler: poll the build's process tree at a short interval, track the resident
memory of every live process in the tree (build orchestrator, compiler
workers, linkers), and report the peaks with the sampling interval and the
scenario. Three subtleties make or break the instrument:

- **Tree, not root.** The orchestrating process is often tiny while its
  workers are enormous; sampling only the root reports noise.
- **The largest single process is the actionable number.** Track the summed
  total (it decides whether the build coexists with an editor and the
  application), but the machine is OOM-killed by *one process* outgrowing
  memory, not by an average — so record the per-process peak separately, and
  capture the identity and arguments of the largest process ever seen. A peak
  without attribution says the build is too big; a peak attributed to the
  compilation unit that produced it says *where to act*.
- **Interval honesty.** A short-lived spike between samples is invisible; the
  interval is part of the number's predicate. For build-scale peaks (tens of
  seconds of compiler or linker residency) a one-second interval is adequate;
  report it anyway.

**The dependency-graph probe** is the third instrument: a script that answers
"if this unit changes, what rebuilds?" from the build system's own metadata.
It prices proposed changes before they are made and detects graph decay after
splits (see compilation-unit-splitting). Its failure mode is going stale —
hand-maintained graph descriptions drift from the real graph, so the probe
must *derive* the graph from the build system's authoritative data, or it
reads a proxy that diverges exactly when someone adds the dependency that
matters.

## Scenario labeling — the predicate travels with the number

The minimum label on any build measurement:

- **Which build**: cold (no reusable state), warm (dependencies cached, own
  code rebuilt), or incremental (one named change propagated). These are
  different products; a measurement that does not say which it is measures
  nothing.
- **Which variant**: the default lite build and the full build differ by
  entire subsystems; a win measured on one may not exist on the other.
- **Which machine**: core count, memory, architecture. The binding-constraint
  logic of the whole subject runs on the *weakest supported machine*, so at
  least occasionally the instruments must run there — numbers from the
  strongest workstation systematically understate every problem.
- **When**: builds drift as the codebase grows; a six-month-old baseline is a
  historical document, not a comparison point.

## The scenario says which build, not whose

Every axis above — cold or warm, which variant, which machine, when — describes a build that
happens in this repository. Some of the costs a repository creates are not paid here at all. A
published artifact imposes compile cost on everything that consumes it: the consumer's type
check, their editor responsiveness, their own build time. That cost accretes exactly like local
build cost does, regresses for the same reasons, and is invisible to every instrument named so
far, because none of them is standing where it is paid.

It also passes every other check. A change that doubles a consumer's compile time is correct,
fully tested, and green; there is no assertion it violates and no suite that gets slower. The
producing repository has no signal at all until the reports arrive from outside, which is the
condition [gate-sees-target](../../../../_laws.md#gate-sees-target) names — the instruments here
are all measuring something adjacent to the thing that hurts.

**Add a vantage axis, and for consumer-visible cost the vantage is a consumer.** Measuring from
inside the project is the intuitive move and it is the one that fails, because the project's own
compilation carries the entire codebase as baseline overhead and the delta being hunted is a small
fraction of a large constant. The magnitude is not marginal: one library measuring its type-level
cost in source mode sat at roughly 115,000 symbols of baseline before the measured change was
reached — against an effect worth low single-digit percent, which is unresolvable inside that
much noise. The same measurement taken through the published artifact resolves it cleanly.

So the harness is a separate, minimal project that consumes the build output the way a consumer
does — through the published entry point and its generated type surface, never the source tree —
and exercises a representative use. Two protocol requirements make its numbers trustworthy:

- **Rebuild before measuring, and check that you did.** The harness reads an artifact rather than
  the source, so a stale artifact silently reports the previous version's cost — a before/after
  pair where one arm measured code that no longer exists. Make it a precondition rather than a
  habit: compare the artifact's timestamp against the sources that produce it, and refuse to run
  when it is older. Scope that comparison to the inputs that actually reach the artifact; tests
  and fixtures change constantly without invalidating a build, and a freshness check that counts
  them cries wolf until it is disabled.
- **Discard the first pass.** The first run absorbs cache warming and resolution work that belongs
  to no version. Warm once, throw it away, then take two or three timed passes.

## Gate on the number that moves first

A consumer-cost harness reports several figures — elapsed time, peak memory, and the counts of
intermediate work the compiler performed. They do not move together, and the ranking is
consistent: **the count of intermediate work items moves first**, well before wall time or memory
budge. Wall clock is noisy at the scale where a regression is still cheap to fix, and memory does
not move at all until the problem is nearly user-visible.

Gate on the leading indicator and report the rest. A metric that only shifts once the cost is
perceptible is a detector, not a gate — it will fire after the change has shipped and after the
decision that caused it has been forgotten. This is the same argument as the regression baseline
below, one level finer: the cheap number that moves early beats the meaningful number that moves
late, and the meaningful one is kept alongside so the early signal can be checked against
something a person cares about.

## The before/after discipline

Any claimed improvement — a unit split, a flag change, a cache — ships with a
pair of measurements under identical conditions: same machine, same scenario,
same variant, ideally the same hour. And **one variable per comparison**: a
structural change measured together with a settings change produces a delta
that belongs to neither, and the narrative will assign it to whichever change
was fashionable. When two changes land near each other, measure the middle
state — the honest ladder is baseline → change A → change A+B, which is also
how one discovers that the celebrated half of the pair was worth a few
percent and the quiet half carried the win. One sample each direction is acceptable
for effects that are large against run-to-run noise (a 30% peak reduction);
effects small enough to hide inside variance need repeated runs — and an
effect that needs statistics to detect is usually not worth its complexity in
a build system anyway. Publish the pair, not the delta alone: "8.9 → 6.2" can
be re-verified later; "saved 30%" cannot.

The counterpart discipline is the **regression baseline**: the same
instruments, run routinely (per release, per month), appending to a small
log. Build costs regress by accretion — each dependency and each new unit
adds a little — and only a time series distinguishes "it has always been
this slow" from "it doubled in March". Cheap instruments that run often beat
precise instruments that run once.

## Instrument failure is loud

A sampler that cannot find the build's process tree, a timer wrapping a build
that crashed, a probe reading an empty graph — each must fail visibly or
report the defect, never emit a plausible number. A peak-memory figure of
near-zero because the sampler attached to nothing looks exactly like a
spectacular optimization; an instrument whose failure mode is
indistinguishable from good news will eventually deliver that news, and every
decision downstream of it inherits the error.
