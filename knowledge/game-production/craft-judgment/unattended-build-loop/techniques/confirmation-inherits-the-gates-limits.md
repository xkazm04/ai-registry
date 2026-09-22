---
layer: technique
type: technique
subject: unattended-build-loop
technique: confirmation-inherits-the-gates-limits
status: forged
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input, one-authority-per-quantity]
shared_with: []
use_when: [a loop re-runs a failed check to confirm a repair, a repair path spawns its own command runner, a retry is spent on a check that reported a failure it never observed]
---

# A confirmation inherits the gate's limits

A gate fails. The loop spends a repair attempt. Then it re-runs the failing
check to find out whether the repair landed — and that second run is almost
never the same instrument as the first. It lives in the repair path, not in the
verifier; it was written to answer one question quickly; and it takes its limits
from whatever the runtime hands out by default.

The rule is one sentence: **a run whose only job is to confirm a gate's verdict
must be at least as permissive as that gate, on every limit the gate carries.**
Output ceiling, wall-clock ceiling, working directory, environment, and the
signal the verdict is read from. Not the limits somebody remembered; all of
them.

## Why the drift is the normal case

The gate and its confirmation are written months apart, by people solving
different problems, and nothing in the type system makes them share a runner.
The verifier's runner was tuned by whoever watched a real gate truncate. The
repair path's runner is three lines of the runtime's own process helper, whose
defaults were chosen for interactive convenience — a modest output buffer, a
short wall clock — and were never intended as a measurement budget for a
compiler or a build tool.

So the confirmation is stricter than the gate by accident, and strictness here
has a specific and expensive consequence: **the confirmation reports a failure
it never observed.** A process killed for exceeding its harness's own output
ceiling, or terminated at a wall clock shorter than the work takes, did not see
the command's verdict at all. The harness's kill and the command's failure
arrive through the same channel and look identical. This is [an instrument
proves it had input before it reports a
verdict](../../../_laws.md#an-instrument-proves-it-had-input) inverted: the
instrument reports a verdict having been prevented from taking the measurement.

The cost compounds in exactly the way an unattended loop cannot absorb. A repair
that actually worked is recorded as failed. The item's next retry — another full
attempt, real spend — is spent on a measurement artefact. And the run's summary
names the wrong cause, so the operator reading it goes to look at code that was
already correct.

The reverse drift is equally wrong and easier to miss. A confirmation *more*
permissive than its gate passes a repair the gate would still reject, and the
item advances on a verdict nothing would reproduce. The requirement is parity,
not generosity.

## The procedure

1. **Confirm through the gate, not through a copy of it.** The strongest form of
   this technique deletes the second runner: the repair path calls the same
   runner the verifier calls, against the same gate record, and there are no
   limits to keep in sync because there is only one set. Every other step below
   is a concession to a codebase where that refactor has not happened yet.
2. **When it must be a separate call, enumerate the gate's limits and pass all
   of them.** Enumerate from the gate's own definition, not from memory, and not
   from the subset that has bitten someone. A limit you did not think to copy is
   a limit whose default you have silently adopted.
3. **Never let a runtime default stand as a measurement budget.** Name the
   ceiling as a constant with the reason attached, derive it from the verifier's
   value, and pin the two together with a check that reads both from one source.
   A constant that merely *happens* to equal the verifier's is a constant that
   will drift on the next tuning pass.
4. **Take the limits from the gate that failed, not from a fixed policy.** A
   loop that re-runs whichever gate failed has a *dynamic* instrument, and a
   fixed confirmation budget is only ever correct for the one gate it was sized
   against. A gate given half an hour because its tool genuinely takes half an
   hour, confirmed under a one-minute ceiling, fails every time — and fails
   silently, because failure is the expected shape of the answer.
5. **Give the confirmation the gate's three outcomes, not two.** A confirmation
   that returns a boolean can only say "still failing", which is the wrong
   answer both for a repair that landed and for an instrument that was killed.
   Passed, failed, unverifiable — the same triad the gate itself is required to
   carry.
6. **Route a harness kill to unverifiable and stop.** The repair is neither
   confirmed nor refuted; the honest record is that it was not measured. Do not
   spend the next retry on it, and do not let it promote.
7. **Judge by the same signal the gate judges by.** Where a gate reads its
   verdict from a produced log rather than an exit status — because its tool
   exits non-zero on a clean run, or zero after a crash on shutdown — a
   confirmation reading the exit status is a different check with the same
   command. Either read the same signal, or decline to confirm.

## Decision rules

- **When the limits cannot be made to match, report the repair as unconfirmed,
  never as failed.** An unconfirmed repair is a true statement the loop can act
  on: leave the item unverified and let the next iteration's real gate decide.
  A false failure is a lie that costs a retry.
- **A cheaper smoke check is not a confirmation, and must not be reported as
  one.** If the gate is too expensive to re-run inside the repair's budget, say
  so and let the gate decide on the next pass. Confirming with a lighter
  instrument and recording the gate's name against the result is the
  self-certifying shape wearing a new suit — the repairing party chose the
  instrument that judged its repair.
- **The parity is a property to assert, not to observe.** "They both use the
  same ceiling" is a claim about the present that the next edit can falsify
  quietly. Assert it: one source for the value, and a check that fails when the
  two diverge — [one authority per
  quantity](../../../_laws.md#one-authority-per-quantity) applied to a measurement
  budget.
- **A confirmation's failure that never reproduces under the gate is a
  configuration finding, not a code finding.** Where the two disagree
  persistently on the same command, the instrument is the suspect. Record both
  verdicts so the disagreement is visible at all.

## Where this is usually violated

**The second runner.** The most common shape by a distance. The gate has a
carefully tuned runner; the repair path has a bare call to the runtime's process
helper. Nothing marks the second one as an instrument, so nobody tunes it.

**The fixed budget under a dynamic gate.** A confirmation sized for the
fast-and-chatty gate, pointed at whichever gate happened to fail. It is correct
for the gate it was written against and wrong for every slower sibling, and the
wrongness is invisible because it presents as the failure it was asked about.

**The boolean confirmation.** `error == null ? healed : not healed`. Two states
where the gate has three, so every environmental failure of the confirmation is
filed as a defect in the repair.

**The loud success.** The case that exposes all of the above is a command that
passes *and* prints a great deal — a verbose compile, a full build log. A
repair-confirmation regression is therefore invisible to a test suite whose
fixtures are all quiet, and the seed that catches it must be a passing command
with a large output.

## When NOT to use this

- **When the confirmation is deliberately a different, cheaper question**, named
  as such and reported as such. "The file now parses" is a useful thing to check
  after a repair; it is not the gate's verdict and must not be stored in the
  gate's field.
- **When the gate is inherently unrepeatable** — a check over a moving external
  state, a one-shot observation. Re-running it does not confirm the repair, it
  takes a second unrelated sample, and parity of limits is beside the point.
- **When the repair path cannot reach the gate's environment at all.** Then
  there is no confirmation to calibrate: the repair is unconfirmed by
  construction, and saying so is the whole of the honest answer.
