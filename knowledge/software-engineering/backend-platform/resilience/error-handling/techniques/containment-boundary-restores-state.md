---
layer: technique
type: technique
subject: error-handling
technique: containment-boundary-restores-state
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success, record-precedes-effect]
shared_with: []
use_when: [deciding where an unwinding failure is caught inside a long-lived editing or serving process, an escaped panic would leave a document or session half-mutated, a third-party parser reads hostile bytes and may abort the host, adding a last-resort catch and unsure whether it should also restore state, a catch that logs and continues keeps running on corrupt state, a target aborts on failure so no catch can work]
---

# Containment boundary restores state

Crash capture owns the failure nothing expected once it has escaped:
report it, persist the trail, restart. That tier assumes the process is
about to die. A long-lived process that holds the user's work (an editor, a
session server, a document service) has a tier *before* that one: stop the
failure from escaping at all, and leave the state exactly as it was before
the failing operation began. The two are different jobs. A catch that only
logs keeps the process alive over state a half-run operation has already
changed, and that is worse than a crash, because nothing tells the user the
document is no longer the one they wrote.

## One chokepoint, one failure shape

Containment belongs where every mutation already passes. If the product
routes all user-visible actions through one dispatch (a command registry, a
request handler, a job runner), put the catch there, and convert the caught
failure into **the same error value an ordinary failed operation returns**.
The consequence is the whole technique: the restore code that already
handles "this operation returned an error" now also handles "this operation
panicked", and no second recovery path exists to rot. A containment that
returns a distinct failure kind with its own cleanup has two restore paths,
and the rarer one is the one that is never tested.

The snapshot the restore uses must be taken **before** the operation, and it
must cover everything the operation or its nested operations can touch:

- The document and the selection, obviously.
- The undo and redo history **whole, not as a length**. Operations run other
  operations, whose checkpoints, undos and evictions at the history limit
  all move the stacks. Restoring a length restores the count and loses the
  entries that were evicted to make room.
- Any counter that describes the history (how many steps were evicted, whether
  a typing group is open), because those are derived from the stacks and
  drift if the stacks alone are put back.
- Per-operation side tables (layout caches, columns, pending moves) when a
  later read trusts them.

Snapshot cost decides whether this is affordable. It is cheap exactly when
the document is built from shared immutable blocks, so cloning the model is a
reference-count bump per block. A model that must deep-copy to snapshot
cannot afford containment on every keystroke and should contain at the
coarser unit it can snapshot, saying so.

**Where the state is a row, restore is a rollback.** A job runner or request
handler holds no document in memory; its state is a database row or a queue
item. There the catch has only to convert the panic into the ordinary failure,
and the transaction (or the lease expiry) is the restore. The snapshot rules
above apply to the process that holds the user's work in memory, and a service
that copies its state to be safe is paying for a restore its store already
provides.

## Contain at the trust edges, not around everything

The catch is not a blanket. It goes at three places, each for a different
reason:

1. **The mutation chokepoint**, for code the team wrote, as a net.
2. **Each third-party parser fed hostile bytes** (font containers, image
   decoders, archive readers). The library checks its input, but it is
   foreign code reading bytes an attacker chose, and a panic inside it
   must surface as "damaged file" at that file's door, not as an aborted
   session. The wrapper returns the same typed error the parser's own
   rejection returns.
3. **A foreign protocol handler** that answers calls from another process
   with a fixed reply grammar. The reply for a caught failure is that
   grammar's error reply, and the caller's state is clamped back into range
   before it answers.

Code in the middle of the product that catches "just in case" hides the
defect from the net above it. If a team-written function needs its own
catch, the function is the defect.

## The net is not a licence

Containment makes the panic survivable. It must not make it acceptable.
Three things keep the net from becoming the policy:

- **Report every panic, including the caught ones.** The reporting hook
  runs before the unwind, so a contained panic still reaches the log. A
  containment that swallows silently turns a crash into a stealth data bug,
  which is the swallowed-error defect at the largest scope.
- **Scrub the report.** A panic message can quote the slice of text it
  failed on, and in an editor that text is the user's writing. Drop quoted
  spans before the message is persisted.
- **Pair it with a prevention rule and a sweep.** The prevention rule bans the
  panicking constructs in production code; the sweep runs every registered
  operation with junk parameters and asserts nothing escapes. The net's
  existence is then evidence of a missed case, and each catch lands with a
  regression test, not a shrug.

## Check that the platform can unwind at all

On targets where a panic aborts the process, no catch around it ever runs.
A containment boundary written and tested on one target is **inert** on the
other, and the product's safety on that target is the prevention rule alone.
Say so: name the targets where the net is absent, and hold those targets to
the strictest form of the prevention rule, because nothing stands behind it.
This is the `absent-guard-is-loud` failure with a compiler flag as the
cause.

## Boundary with neighbours

- **crash-capture** reports what escaped and decides restart. This
  technique stops the escape and restores state; the two share the reporting
  hook, and crash-capture remains the tier for aborts and fatal signals that
  no catch can stop.
- **undo-history** owns checkpoints for the user's benefit. The restore
  here uses a snapshot the dispatch took for its own sake and never exposes
  it as an undo step; a failed operation leaves the history as if it was
  never attempted.
- **swallowed-error-prevention** owns the rule that a caught error must be
  surfaced. A containment boundary is that rule applied to the one error
  class the type system does not force a caller to handle.
