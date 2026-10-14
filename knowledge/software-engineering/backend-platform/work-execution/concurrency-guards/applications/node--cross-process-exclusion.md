---
layer: application
type: application
subject: concurrency-guards
technique: cross-process-exclusion
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The coordination board whose lock takeover deleted a lock it had not judged (Node)

The registry's own coordination board (`scripts/run-board.mjs`), the instrument a
dozen concurrent sessions use to claim sources and subjects and to serialize the
three steps that cannot be shared: regenerating the index, appending to the
ledgers, and committing. Its locks are files in the repository's common git
directory, created exclusively. The measurement below ran on Node 24.14.0 on
2026-10-14; the registry's CI pins Node 20 for its knowledge checks and does not
run this harness. The fix is commit `6bfb3f6c`.

A September fix had already settled the dead-holder question for this board:
reclaim is a judgement about the holder, and a demonstrably working holder is
never superseded on age (see the fleet-orchestration path's
`evidence-outranks-a-liveness-claim` application). This one is about the
technique's other half, the takeover, and it was found by reading a source whose
object-store locks delete an expired holder by name and then retry the create.

## The seam

- **Takeover was check-then-act.** A contender read the lock, judged it
  breakable, and then deleted the file by name. Between the judgement and the
  delete, a faster contender could break the same lock and take it; the slower
  one then deleted the faster one's fresh lock and took it too. The technique
  states this exact failure: takeover must be replace-if-unchanged, "or two
  contenders both take over".
- **A lock was born empty.** The file was created exclusively and written a
  moment later. A contender reading it in between saw no acquisition time, which
  the board deliberately treats as breakable (a corrupt lock must not be
  permanent), and deleted a lock that was being taken.
- **The tree disagreed with itself.** `lock` applied the holder judgement, while
  `gc` and `list` judged a lock by its age alone, so `gc` reaped a live holder
  past its ttl that `lock` itself refused to break.

## The change

A lock is now published with its content in one step: written to a private
temporary file and linked into place, which fails exactly like an exclusive
create when the lock exists (`scripts/run-board.mjs:492 "export function createLock(file, content)"`),
with the old create-then-write path kept for a file system that cannot link.
A takeover goes through `breakIfUnchanged`
(`scripts/run-board.mjs:521 "export function breakIfUnchanged(file, seen"`):
breakers serialize on a short-lived gate file and delete the lock only if its
fingerprint (modification time, size and bytes) is still the one they judged. A
file system offers create-if-absent but no delete-if-unchanged, so serializing
the breakers is how replace-if-unchanged is built there. A corrupt but unchanged
lock is still reclaimed, and a gate left by a breaker that crashed inside it
expires after 30 seconds. `gc` and `list` now use the same judgement as `lock`
(`scripts/run-board.mjs:567 "rec._breakable = j.breakable;"`).

## The proof

**Instrument.** A harness builds a throwaway repository, copies one version of
the board into it, plants a lock held by a dead run two hours ago, then starts 24
real `lock` processes at once and counts how many print that they acquired it.
Before the trials it plants a lock taken one second earlier as a negative
control: nobody may take that one.

**Target.** Trials in which more than one process acquired the lock.
**Floor.** Exactly one acquirer per trial (a reclaim that never happens is not a
fix), the fresh lock never taken, and the board's existing tests green.

| arm | trials | double-grant trials | acquirers | fresh lock taken |
| --- | --- | --- | --- | --- |
| A, the board at `d8cfc45f` | 12 + 20 | 5 + 8 = 13 | 70 (expected 32) | 0, 0 |
| B, the change | 12 + 20 | 0 + 0 = 0 | 32 | 0, 0 |

In arm A a double grant handed the lock to between two and seven holders at once:
once one breaker deleted a fresh lock, the next contender could read the new,
still-empty file and delete that one as well. Every trial in both arms ended with at least one
acquirer, so the floor held. The suite went from 16 to 20 tests, all passing;
the four new ones replay the interleaving deterministically and each carries
its positive control, the old bare delete, which removes the lock it should
not.

**Verdict: better.** The target fell from 13 of 32 trials to 0 of 32 with the
floor held, measured twice per arm.

## What this realization cannot do

The gate is itself a lock with an age-based expiry. A breaker that crashes while
holding it, followed after 30 seconds by two contenders clearing the stale gate
at the same instant, can still let two breakers re-read the same lock; the window
needs a crash and a coincidence, where the old one needed only two contenders.
The 24-process harness concentrates arrivals far beyond what the board sees in
use, where waiters poll every three seconds, so the trial rate is not an
incident rate; it shows the race exists and that the change closes it.
