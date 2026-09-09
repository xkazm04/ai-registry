---
layer: technique
type: technique
subject: durable-agent-operations
technique: recovery-prefix-enumeration
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding how much recovery testing is enough, a recovery suite passes and the first real crash is unhandled, adding a state to a durable operation machine, asserting that writes happen in the specified order]
---

# Recovery prefix enumeration

Derive recovery tests from the durable state contract and the transitions that
can be interrupted. One happy-path restart does not cover a provider request
pending settlement, a staged tool result awaiting placement, or recovery itself
interrupted while reconciling an earlier crash.

## Derive phase and prefix cases

Use the phase definition shared by execution and recovery to list required
cases. A new phase without a disposition or test is an explicit gap; this is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary).
For each phase, construct valid durable fixtures, reopen the runtime, drive it
and assert the next transition, wait or terminal result.

Also reach states through real execution with injected failure. Direct fixtures
can expose rare phases efficiently, but may describe states the writer never
actually produces. Both paths are useful.

For each recovery transition k, interrupt after that durable prefix, reopen and
compare with uninterrupted recovery from the same starting state. Killing once
partway through recovery does exercise that particular prefix; it does not
cover all other prefixes. Repeat recovery and assert stable local identities,
preserved outcomes and the declared external replay policy.

Include acceptance before first drive, terminal reopen, pending cancellation,
old schema versions, missing references and stale-owner writes.

## A finite vocabulary is not a finite concrete state space

Phase labels may be finite while payloads, batch sizes, histories and schedules
are unbounded. Cover representative equivalence classes and boundary values,
then add property-based or bounded model exploration where useful. Record what
was bounded; do not call one fixture per label exhaustive correctness evidence.

The same method applies to journals: construct valid committed prefixes and
test replay and snapshot boundaries. Journal storage does not make recovery
untestable. For opaque guest state, the host tests the envelope and persistence
contract; guest semantic recovery requires guest-provided invariants or cases.

## Observe effects as well as commits

Instrument the actual persistence adapter and effect dispatcher with one ordered
trace. A decorator that records only database writes cannot prove an effect
started after intent committed; the effect-start event must be observable too.
Distinguish transaction begin, durable commit acknowledgement and dispatch.

Assert intent-before-dispatch, atomic settlement publication, stable output
identities, rejection of late progress, required placement order and cleanup.
Observe the target operation rather than trusting an application log that merely
says it happened: [gate-sees-target](../../../../_laws.md#gate-sees-target).

Gate scheduling points to exercise admission-first and cancellation-first,
reassignment versus late settlement, and publication versus cleanup. Multi-party
races can have more than two relevant orders; enumerate the identified schedules
and add stress or model tests for the remaining interleavings.

## Storage fault tier

At the application boundary, a properly configured atomic store exposes either
the old or new committed value after recovery. A process can still die inside
the underlying transaction. Run adapter-level fault injection or abrupt-process
tests to check its actual guarantees, including cross-store reference staging.
An in-memory transaction mock is not evidence of power-loss durability.

## Acceptance and limits

Record phase coverage, interrupted prefixes, payload bounds and the races tested.
Every outcome assertion should distinguish completion, cancellation and unknown
external effect. A real incident adds a regression case and, when necessary, a
new phase or transition rule. It need not invent a new phase when the missing
case was a payload or schedule within an existing one.

For one cheap repeatable step, a small interruption test may suffice. The value
of this technique grows with distinct uncertain effects and recovery branches;
it is not a demand to construct a heavyweight harness for every computation.
