---
layer: technique
type: technique
subject: concurrency-guards
technique: cross-process-exclusion
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
  - one-validation-door
shared_with: []
use_when: [deciding whether an in-process guard is enough, the lock holder died without releasing, choosing fail-open or fail-closed for duplicates, deciding how hard a leader election has to be defended]
---

# Cross-process exclusion

An in-process guard observes exactly one process. When the duplicate can
originate elsewhere — a second app instance, a background worker beside the
app, two automation sessions on one machine, two nodes behind one database —
the memory set is a gate that cannot see its target (law: gate-sees-target):
it passes precisely in the scenario it was installed for. Crossing the process
boundary is not "the same guard, bigger"; it is different machinery with a
question in-process guards never face at all: **the holder can die without
executing any release path.** Every cross-process design is judged by its
answer to the dead-holder question.

## The substrate options

All variants share one requirement: acquisition must be an atomic
test-and-set on substrate every participant can see. Beyond that they differ
in how they detect a dead holder.

- **Lock artifact with staleness metadata.** A file or record created
  exclusively (the create-if-absent primitive of the substrate does the
  atomicity), carrying holder identity — process id, host, acquisition time.
  A contender finding the artifact checks liveness: is the named holder still
  alive; is the artifact younger than a staleness bound? Stale → take over,
  loudly. The takeover itself must be atomic (replace-if-unchanged), or two
  contenders both "take over" and the guard has reproduced the race one level
  up.
- **Heartbeat lease.** The holder renews a timestamp on a cadence; the lease
  is valid only while fresh. Contenders never ask "does the holder exist"
  (unanswerable across hosts) — only "has it renewed lately," which the
  substrate answers directly. The renewal cadence and expiry bound need
  headroom for pauses (a stalled process that resumes must discover it lost
  the lease *before* acting again — the fencing check belongs at the write
  site, see attempt-attribution).
- **Compare-and-swap claim on shared state.** Where the participants already
  share a transactional store, the guard can be a conditional update: claim
  the row where status is claimable, atomically writing holder and time. The
  scheduling path's claim-based dispatch is this pattern in its natural home;
  the general form works for any "exactly one process should take this item"
  shape.
- **Population check.** Stateless: instead of acquiring anything, a contender
  observes artifacts the *competing activity itself* necessarily produces
  (running processes, working files, open ports) and declines to start while
  the population is nonzero. No release problem exists because nothing is
  acquired — the evidence disappears with the activity. The cost: it is
  advisory (a participant that skips the check is unguarded) and
  race-windowed (two contenders can both observe zero). Right for
  coarse-grained "don't start a second heavy build," wrong for correctness-
  critical exclusion.

## Fail-open or fail-closed — chosen and written down

Every cross-process guard eventually meets an ambiguous state: the artifact
exists but liveness is unknowable; the store is unreachable; the staleness
clock is suspect. The design must pre-decide its direction and document it:

- **Fail-closed** (refuse to proceed): right when duplication corrupts —
  double-spends, double-writes to an external system, conflicting migrations.
  The cost is availability: a wedged guard halts the operation until a human
  or a staleness bound clears it.
- **Fail-open, loudly** (proceed, with a visible warning): right when the
  guarded work is idempotent-ish or merely wasteful when doubled, and
  halting it costs more than duplicating it. "Loudly" is load-bearing (law:
  failure-not-empty-success) — fail-open with a silent shrug is
  indistinguishable from no guard, and the day the warning would have
  explained a corruption, there is nothing in the record.

The direction is per-operation, derived from what a duplicate actually costs —
never a property of the lock library.

## The cost of a duplicate can be engineered, not only measured

Both directions above take the cost of a duplicate as an *input*: work out
what doubling would do, then choose. There is a third move that changes the
input instead of reading it. **Route every effect the holder produces through
a serialization point the contenders already share, and the cost of a
duplicate falls to near zero by construction.** Where the guarded work
proposes its effects to an ordered log, a conditional write, or any other
single door that applies them deterministically and answers a repeat as
redundant, two briefly overlapping holders produce two proposals of which one
applies and one is a no-op. Nothing diverges; some work is done twice.

That reclassifies the guard itself, which is the part worth writing down. A
lease whose holder can corrupt shared state is a **safety mechanism**, and
its TTL, its skew margin and its handover behaviour are correctness
parameters that have to be defended against the worst case. A lease over
effects that are already serialized and idempotent is an **availability and
cost knob**: it exists so that N processes do not all run the same
maintenance, and the worst a badly sized TTL buys is duplicated work or a gap
where nobody is running. Sizing it becomes a budget question rather than an
argument about corruption — and the difference should be stated in the
design, because a reader who cannot tell which kind of lease they are looking
at will defend the cheap one and neglect the expensive one.

Two conditions carry the whole reclassification, and neither survives being
assumed:

- **Every effect goes through the door, with no side channel.** One direct
  write that bypasses the serialization point restores the full correctness
  burden for the entire lease, and it will be the write somebody adds later
  for a good local reason. The door is only a door while it is the only one
  (law: one-validation-door).
- **The holder's worklist lives in the shared state, not in its memory.** A
  holder that accumulates queued work in process loses it at handover and its
  successor starts from nothing, which turns a harmless overlap into lost
  work at precisely the moment the lease changed hands. Where the queue is
  part of the replicated state the successor resumes where its predecessor
  stopped, and losing the lease stops being an event worth reacting to beyond
  stopping the loops.

This is the belt-and-suspenders stance one level up: idempotency does not
merely cover the duplicates a guard cannot see (see idempotency-by-design),
it can demote the guard from a correctness argument to a cost one.

## Clocks lie, holders pause

Two humility rules for anything staleness-based. First, timestamps compared
across hosts inherit clock skew; staleness bounds must be generous relative
to plausible skew, or a fast clock steals a live holder's lock. Second, a
paused holder (debugger, swap storm, runtime pause) can outlive its lease and
resume believing it still holds it; if the guarded effect is a write to shared
state, the write itself must re-verify tenure (a fencing token — the lease
generation carried into the write and checked there), because the guard alone
cannot reach into the future where the pause ends.

## Decision rules

- Name the duplicate's origin first: if any second process can produce it, an
  in-process guard is scenery, whatever else it does.
- Acquisition is atomic test-and-set on shared substrate; takeover is atomic
  replace-if-unchanged. Any check-then-act gap is the race, relocated.
- Every artifact carries holder identity and time; every design answers the
  dead-holder question with a staleness bound derived from real durations and
  real skew.
- Choose fail-open-loudly or fail-closed per operation, from the cost of a
  duplicate; write the direction down where the next reader will look.
- Before defending a TTL against the worst case, ask whether the effects can
  be routed through one serialized, idempotent door instead — a guard over
  such effects is a cost knob, not a safety mechanism, and should say so.
- Population checks are for advisory, coarse exclusion of expensive work —
  never the sole wall for correctness.
- Where a paused holder could resume into a lost lease, carry a fencing token
  into the effect and verify it at the write site.
