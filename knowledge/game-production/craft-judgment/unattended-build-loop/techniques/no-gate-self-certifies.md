---
layer: technique
type: technique
subject: unattended-build-loop
technique: no-gate-self-certifies
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [wiring a verification check into an automated loop, deciding what a check with no command may report, letting a producer report on its own output]
---

# No gate self-certifies

The party that produced an artifact may not be the authority that passes it. In
an unattended loop this hardens into a structural rule about where verdicts come
from: the producer emits a *report*, an independent observer emits a *verdict*,
and the loop's bookkeeping never lets the two occupy the same field.

## The procedure

1. **Separate the roles explicitly.** One component does the work and states
   what it believes it did. A different component reads real state — a compiler's
   exit status, a test runner's output, a rendered result, a queried record — and
   issues the verdict. Neither is optional; a loop with only the first is a
   rumour mill, and a loop with only the second cannot tell you where to look
   when something fails.
2. **Make the verdict derivation server-side of the producer.** The producer
   submits its artifact and its claim; the receiving system derives
   pass / pending / fail / deferred. The producer is never handed the
   opportunity to write a status field.
3. **Give every check three possible outcomes**, not two: passed, failed,
   **unverifiable**. Unverifiable is the honest answer when the check had no
   command to run, no environment to run it in, or produced no observation.
4. **Apply the third outcome uniformly.** Every check type, not just the ones
   whose authors happened to think about it. A check with no command runs
   nothing and therefore knows nothing — irrespective of what kind of check it
   claims to be.
5. **Judge each check by the signal that is actually reliable for it.** Some
   checks are honestly judged by an exit status; some tools exit non-zero on a
   clean run, or zero after a crash during shutdown, and must be judged by their
   log content instead. Choosing the wrong signal produces a check that is
   independent and still wrong.

## Decision rules

- **When a check has no command configured, report unverifiable — never
  passed.** The convenience branch that answers "nothing to run, so: success" is
  the single highest-yield bug in this whole subject, because it converts every
  misconfiguration into a green run.
- **When a check is marked required and reports unverifiable, the item is gapped,
  not passed.** It counts toward the required-failure tally and it does not
  contribute to the verified numerator.
- **When a check reports unverifiable, do not attempt repair.** There is no
  defect to fix. A missing environment is not a code error, and a repair loop
  pointed at one will consume the run's entire budget producing changes that
  cannot possibly help.
- **When a producer's own claim conflicts with an observer's verdict, the
  observer wins and the conflict is recorded.** A persistent pattern of
  producer-says-pass / observer-says-fail is diagnostic information about the
  producer, and it is only visible if both were stored.
- **When a check can only prove existence, structure or compilation, label the
  rung it proved.** Passing at a structural rung is necessary and never
  sufficient; an artifact that exists, parses and links may still do nothing
  observable at runtime.

## Where this is usually violated

The violation is rarely a decision — it is a default. Three recurring shapes:

**The optimistic skip.** A check discovers it cannot run and returns success so
that the pipeline does not stall. Every downstream number then contains
untestable items scored as passing, and the deception is undetectable from the
report because there is no field that distinguishes them.

**The producer-written status.** A submission API accepts a status field from the
producer "to save a round trip". Any producer with a bug, an optimistic prompt,
or an incentive now writes its own grade.

**The asymmetric hardening.** One check type is given the honest three-state
treatment because someone hit the bug there, and the remaining types keep the
two-state behaviour. The loop is now honest about exactly one class of
misconfiguration.

## When NOT to use this

- **When the observation itself is inherently the producer's.** Some signals only
  exist inside the producing process — a timing measurement, an internal counter.
  Take them, but store them as self-reported and never let them feed the verified
  numerator.
- **When independence would cost more than the claim is worth.** An advisory
  check that is expensive to run — a full boot-and-observe pass measured in
  minutes — should be opt-in, non-blocking, and deduplicated across the items of
  one iteration, rather than dropped or run per item. Advisory independence is
  still independence; the rule is about who judges, not about how often.
- **When the check is a linter for the producer's own conventions**, and its
  verdict has no consumer beyond the producer. Then it is a tool, not a gate,
  and calling it a gate inflates the apparent evidence.
