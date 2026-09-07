---
layer: technique
type: technique
subject: test-harness
technique: constraint-injection-for-unreachable-tiers
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a degradation path is only exercised by users who own hardware the team does not, a capability ladder has more rungs than the team has machines, a low-capacity configuration regressed and nobody noticed for a release, deciding whether a fallback path is tested or merely written, choosing where to intercept a capacity probe for testing]
---

# Constraint injection for unreachable tiers

A system that adapts to capacity has a ladder of configurations, and the ones
that matter are the constrained ones. They carry the offloading, the reduced
batch, the fallback codec, the degraded path — the code most likely to be wrong
and least likely to be run, because the machine every developer and every CI
runner owns sits at the top of the ladder. The top rung is tested continuously
by accident. Every rung below it is tested by users.

Buying the hardware does not scale: the ladder has as many rungs as the
capability matrix has classes, and the cheap end of it is the end nobody
provisions. The reachable move is to stop trying to reproduce the constraint
and **falsify the measurement of it instead** — override what the capacity
probe reports, and let the whole adaptation chain below it run for real.

## Intercept the probe, not the consumer

The override belongs at exactly one place: the function that answers "how much
capacity is there", at the same point where it would consult the platform.
Everything downstream — tier selection, the derived limits, the offload
decision, the backend choice — then executes its real logic against a number it
has no way to distinguish from a true reading. That is the property worth
paying for: the test exercises the production decision path, not a parallel one.

The two tempting alternatives both destroy it. Overriding the *resolved tier*
skips tier selection, which is where the boundary arithmetic lives and
therefore where the interesting bugs are. Overriding each *consumer* — passing
a batch size, forcing an offload flag — tests the consumers with values a real
run might never produce, and asserts nothing about whether the system would
have chosen them.

- **One override per resource, read where the probe reads.** A capability
  ladder usually has several axes; each needs its own injection point at its
  own probe, because a test for the low-memory rung on one accelerator must not
  silently also constrain a different one.
- **Make it inert by default and visible when active.** The override is read
  from the environment, absent in every normal run, and announced loudly
  whenever it fires. A simulated capacity that does not say so in the output is
  a result nobody can interpret later, and the number it produced travels
  without its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **A malformed override is a fault, not a fallback.** A typo in the value must
  stop the run, never quietly revert to the real probe — that is the shape where
  a whole tier sweep passes because every rung silently ran at the machine's
  own capacity
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The sweep is a mode, not a habit

One override tests one rung, and a rung tested when someone remembers is a rung
tested once. The instrument that makes the ladder covered is a **sweep**: a
first-class mode that walks the declared rungs, runs the same scenario at each,
and emits one row per rung with its outcome and the figures the tier derived.

- **Enumerate the rungs from the ladder's own definition**, never from a list
  in the test. A rung added to the configuration and not to the sweep is the
  rung that regresses, and a hand-maintained copy of the ladder guarantees the
  divergence.
- **Clamp the scenario to each rung rather than skipping it.** A low rung that
  cannot run the default workload should run a reduced one and report the
  clamp — a skipped rung looks identical to a passing one in a summary table,
  and the summary is what anybody actually reads.
- **The table is the artifact.** Per-rung wall time and derived limits beside
  the outcome turn the sweep into a comparison, which is what makes a
  *quantitative* regression visible. A rung that still passes while taking
  three times as long has regressed, and only the row next to last release's
  row says so.

## What the injection cannot reach, and why saying so matters

An overridden probe constrains **a number, not the resource.** The allocator is
not actually near its limit, nothing is fragmented, no pressure signal fires, no
eviction runs, and there is no real contention with anything else on the
machine. So the technique proves the *decision* logic and the code paths the
decision selects, and proves nothing about behaviour under genuine exhaustion.
Every failure that requires the resource to actually run out — the allocation
that fails at the worst moment, the thrash, the driver-level refusal — is
outside what a sweep can see, and remains a real-hardware or a
fault-injection question.

This is [gate-sees-target](../../../../_laws.md#gate-sees-target) read
honestly rather than as a prohibition. Injecting a false declaration is a
legitimate instrument *because the target here is the adaptation logic*, and the
declaration is that logic's genuine input. The moment the claim slides from
"the low rung selects the right configuration" to "the low rung works", the
instrument is being read as evidence for something it never observed.

Two disciplines keep the distinction from eroding:

- **State the two claims separately in the report.** "All seven rungs selected
  and executed their configuration" is what the sweep establishes. "The 4 GB
  rung works on 4 GB hardware" needs 4 GB hardware, and the sweep's green row
  is not a substitute for it.
- **Where the ladder's own numbers were measured on the team's machine,
  say which machine, and prefer the conservative figure.** A capacity table
  calibrated on hardware whose fast path the low rungs will not have is
  optimistic exactly where it must not be; the honest table carries the
  worst-case estimate and a note that the measurement machine was not the
  target, rather than the measured best case dressed as general.
