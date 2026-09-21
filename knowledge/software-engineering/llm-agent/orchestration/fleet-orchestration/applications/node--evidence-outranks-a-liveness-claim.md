---
layer: application
type: application
subject: fleet-orchestration
technique: evidence-outranks-a-liveness-claim
stack: node
verified_against: node@24
verified_on: 2026-09-17
applied: code
ab_verdict: better
proof: regression-with-replicated-predecessor
---

# The coordination board that gave away a lock taken one second earlier (Node)

This technique was measured as an experiment against a replica of a live coordination
board, and the experiment found a defect in the original. The defect is now fixed and
this document is the code arm.

The board is the registry's own: a directory of single-writer run records in the git
common directory, plus named locks taken as atomic exclusive file creates. Every
parallel research session claims a record, heartbeats as it moves between phases, and
takes a named lock for the three things that genuinely cannot be shared — regenerating
the index, appending to a ledger, and committing.

## The two wrong answers, in the same second

A run deep in a long task reports at transitions, and the long silences are the work. So
its heartbeat aged past the 45-minute staleness window while it was working, and then it
took the commit lock. Replayed against the board as it stood:

```
warn: breaking lock 'commit' held by r1 (1s old; holder has no recent heartbeat).
acquired lock 'commit' for sibling (ttl 900s)
clear: no live sibling holds 1 target(s).
```

The sibling was handed the commit lock **and** told the holder's paths were free. Both
answers come from the same mistake: the only thing either path consulted was the
holder's own report about itself.

A 2026-09-03 patch had already added the right idea in the wrong place — a check for
whether the holder had beaten since it took the lock — but the reclaim predicate was a
disjunction whose first term short-circuited on heartbeat age, so that check was never
reached.

## What counts as evidence here

The lock file carries an `acquiredAt` stamp. Some process executed the acquire path at
that instant, which makes its age a fact about execution rather than an assertion about
health — exactly the technique's distinction between an outstanding record and a claim.
Both halves of the board now read it:

- **`lock`** will not break a lock acquired inside the staleness window on heartbeat age
  alone. Reclaim still terminates, and sooner than before: the crashed-at-acquire case,
  which the technique names as the one derivation cannot help with, clears through the
  ttl branch at 900 seconds rather than waiting out the 45-minute window.
- **`check`** counts a run as live when it holds a lock taken inside the window, and the
  contention message says which evidence made it live — because "46m since heartbeat"
  printed beside a contention would otherwise read as the bug rather than the fix.

Liveness is now three-valued in the shape the technique prescribes, and the reason
travels with it: `done`, `heartbeat`, `lock`, `stale`.

## Assertions, and the control a removed branch needs

Both decisions were extracted as pure functions so they could be asserted without a
board on disk. Sixteen assertions, all passing. Two of them carry a replica of the
predecessor predicate and require it to answer the opposite — a regression test whose
subject is a deleted branch has no positive control otherwise, and without it the test
would pass just as well against code that never had the defect.

| case | before | after |
| --- | --- | --- |
| quiet-but-live holder, lock 1s old | broken | **held** |
| same, at the far edge of the window | broken | **held** |
| dead holder, lock past the staleness window | broken | broken |
| dead holder, lock past its ttl, no beat since acquire | broken | broken |
| live-but-wedged holder past ttl, no beat since acquire | broken | broken |
| live holder that beat inside the guarded section | held | held |
| unreadable or future-dated acquire stamp, dead holder | broken | broken |
| `check`: quiet run holding a 1s-old lock | reported clear | **CONTENDED** |
| `check`: quiet run holding nothing | stale | stale |
| `done` run with a lock file still on disk | not live | not live |

The last three rows are the floor. A fix that made everything live would pass the
regression row and fail these; a fix that made nothing live would pass these and fail
the regression row. The two directions are asserted on the same run.

The two unreadable-stamp rows exist because the repair must not become a way to earn
immunity: a lock with no parseable stamp, or one stamped in the future by a clock that
stepped backwards, does not protect a dead holder. An instant is re-evaluated against a
movable clock, so it may not be the thing that grants permanence.

## Gates

The board's own command paths were exercised unpiped, because a piped exit code is a
trap this repository has recorded against itself: acquire 0, contended claim 3, unlock
0, `gc` 0, `--help` 0, an unknown command 1. The module is now importable without
running, so the dispatch is guarded to the main-module case. All four registry gates
green.

## What this did not change

The staleness budget stays. The technique is explicit that derivation wins wherever a
second writer has left a record and nowhere else, and the board's remaining gap is the
one it names: a run that dies between writing its record and doing anything else leaves
no evidence at all, and only the budget's expiry ever clears it. Removing the budget was
measured in the experiment arm and lost — with no budget and no probe, nothing can ever
say *dead*, so a crashed run's guarded sections become unbreakable and reclaim never
terminates.
