---
layer: application
type: application
subject: concurrency-guards
technique: cache-value-not-handle
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@20
applied: code
ab_verdict: better
proof: ab-paired
---

# A cross-session lock whose reclaim read the clock instead of the owner

The stack witness is the CI pin: the repository has no `package.json`, no
lockfile and no `.nvmrc`, so the only version the tree attests is `node-version:
'20'`, set on all five jobs of its knowledge workflow. That is a weaker witness
than a manifest — it pins what the gates run on, not what the scripts require —
and it is named here rather than upgraded to a claim the tree does not make. The guard described here is a
dependency-free cross-session mutex over a shared checkout: a dozen agent
sessions edit one working tree at once, and three operations genuinely cannot
be shared — regenerating the derived index, appending to a shared ledger, and
staging a commit. Each is serialized by a named lock, taken for the edit and
released immediately.

The locks live beside a **run board**: one small record per live session,
carrying a heartbeat that the session refreshes as it changes phase. The board
already knows, to within its staleness window, which sessions are alive. The
lock code did not read it.

## What the two arms were

Reclaim was decided by the lock's own age alone:

```
breakable = ageSeconds > ttl        // ttl 900s
```

This is the shape the technique names: **a deadline that fires on elapsed time
rather than on the owner's state.** It is wrong in both directions at once, and
the two errors are not symmetric in cost.

- **A live owner is superseded.** A session holding the index lock through a
  large regeneration — a forge wave over a bundle, which is exactly when the
  lock matters most — passes 900 seconds while heartbeating normally. The next
  session breaks the lock and both regenerate concurrently, over a tree that
  now contains each other's half-written files. This is the technique's stated
  failure: the reclaimer supersedes an owner that was about to publish.
- **A dead owner is waited on.** A session that crashes one second after
  acquiring holds the lock for the remaining 899 seconds, even though its
  heartbeat stops immediately and the board can tell within its staleness
  window that the run is gone.

Arm B makes reclaim a judgement about the owner, using evidence the board was
already collecting, with two independent reasons and no reliance on the clock
alone:

```
ownerGone       = holder's run record missing, done, or not heartbeating
pastTtlAndQuiet = age > ttl AND holder has not beaten since it acquired
breakable       = ownerGone || pastTtlAndQuiet
```

The second clause is the backstop the first one cannot provide: a session that
is alive but wedged *inside* the guarded section still gets reclaimed, exactly
as it does today, because its heartbeat predates the acquire.

## The measurement

Five fixtures, both arms, one predicate — *did the sibling get the lock?* —
with the arm count carried beside the number. The board directory was
reconstructed from scratch per case in a throwaway repository, so neither arm
ever touched the live board.

| case | want | A (current) | B (patched) |
| --- | --- | --- | --- |
| live holder past its ttl | refused | **acquired** | refused |
| dead holder inside its ttl | acquired | **refused** | acquired |
| control — live holder inside ttl | refused | refused | refused |
| control — no holder | acquired | acquired | acquired |
| control — live holder past ttl, no beat since acquire | acquired | acquired | acquired |

**Arm A 3/5, arm B 5/5.** All three controls are byte-identical between arms,
which is the part that makes the two changed rows readable as the change and
not as a rewrite: the patch moves exactly the two cases it was aimed at and
leaves ordinary contention, the uncontended path and the wedged-owner backstop
untouched.

## What this realization cannot show

The measurement is over fabricated board states, not over a real collision.
Fixtures can prove the decision function; they cannot prove the frequency, and
the frequency is what decides whether this was worth fixing. The honest reading
is that the live-owner case is rare — it needs a hold longer than fifteen
minutes — but that its cost is the one failure this guard exists to prevent,
since two concurrent regenerations over a shared checkout produce a derived
artifact describing neither session's tree.

Nor does it show the third direction the technique warns about and this guard
does not have: there is no owner-side timeout at all. The reclaim deadline
here sits above an owner timeout that was never written down, so "strictly
above" is satisfied only by accident. A guard whose owner may run unboundedly
long has replaced a tunable with a heartbeat, which is the better trade for a
long, variable, human-paced operation and the worse one for a short fixed
operation where a real deadline would have been cheap to state.

## The seam this did not reach

The same repository holds a second instance of the technique's primary hazard,
untouched by this change: two derived artifacts are regenerated under this very
lock, and the operating procedure's standing advice when a sibling's unlanded
work has been absorbed is to *leave them uncommitted*. That is a workaround for
a shared mutable derived artifact with many writers, and it belongs to a
different technique in a different subject. It is recorded here only so the
next reader of this file does not mistake the lock fix for the whole problem.
