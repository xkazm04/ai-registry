---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: termination-and-reaping
status: forged
laws: [creation-names-reaper, failure-not-empty-success, identity-survives-reuse]
shared_with: [agent-cli-transport]
use_when: [choosing when a polite stop becomes a kill, the parent died but its helpers did not, an exit code of zero from a crashed wrapper, a child kept running after its host was force-killed and no restart is coming]
---

# Termination and reaping

A child process ends in exactly one of a small number of ways, and the host
must have designed **all of them** — including the ones where the host
itself is the thing that ended. This technique owns the stop ladder, the
races around it, the collection of the corpse, and the honesty of the
record. Its organizing law is literal here:
[everything created names its reaper](../../../../_laws.md#creation-names-reaper),
and for a process the reaper is code with an address, not a hope.

## The termination ladder

Stopping a child is an escalation with deadlines, not a single act:

1. **Polite stop.** The platform's cooperative stop request (or the tool's
   own stop protocol — closing its input, a control message). This is the
   rung that lets the child flush, release locks, and write its own
   shutdown record.
2. **Deadline.** A bounded grace period. The deadline is a design constant
   chosen per tool class — long enough for an honest flush, short enough
   that a wedged child cannot hold a slot hostage.
3. **Forcible kill.** Unconditional, unrefusable termination — applied to
   the **whole tree** (below), not just the root.
4. **Verify and record.** Confirm the exit was collected, and record *which
   rung was needed* — a population of children that routinely requires rung
   3 is a defect report about the children, visible only if the ladder
   keeps score.

The ladder runs identically regardless of *why* termination was requested —
user cancellation, ceiling exceeded, host shutdown, stall escalation. One
ladder, many callers; the reasons differ in the recorded outcome, never in
the mechanics.

## When rung 1 is acknowledged, rung 2 splits in two

The single grace period above is written for a polite stop whose *receipt*
is invisible. Where the stop request is delivered by a mechanism the child
must actively consume, receipt becomes observable, and one deadline is no
longer the right shape — because it is now covering two states that fail
for unrelated reasons and want opposite durations:

- **The request was never taken up.** The child is an older build that does
  not implement the stop protocol, or it is wedged below the point where it
  would notice. Waiting helps nothing; no amount of grace produces an
  acknowledgement that was never coming.
- **The request was taken up and the child is still working.** It is
  draining honestly — finishing an accepted unit whose length is a property
  of the workload, not of the host's patience.

A single constant must be sized for the worse of the two, and both
directions are wrong. Size it long and a child that never heard the request
holds its slot for the full window on every shutdown. Size it short and a
healthy child mid-flush is killed at rung 3 for being slow. The constant
cannot be right, because it is standing in for two different questions.

So where receipt is observable, **the ladder carries two deadlines**:

1. **Claim deadline** — short, bounded by delivery and one poll interval,
   never by the workload. It answers *did the child take up the request?*
2. **Completion deadline** — the honest-flush window of the original rung
   2, and it starts only once the claim is observed.

A child that misses the claim deadline escalates to rung 3 immediately: it
has not refused, it has demonstrated it cannot participate, and the ladder
does not owe a flush window to a process that cannot flush. A child that
claims and then misses the completion deadline escalates on the original
terms.

**Make the acknowledgement the same act as the receipt.** The cheapest
correct form is a token the requester creates and the child consumes with
an atomic operation whose success is the proof — one claimant by
construction, no reply channel, no lock, and it works between processes
that share nothing but a filesystem. A separate "I heard you" message is a
second thing that can be lost, and it reintroduces the ambiguity the split
exists to remove.

**Record which deadline was missed, because they are different defect
reports.** A population missing the *claim* deadline is a version-skew
report about the fleet — old builds still running, or a stop path that
never reaches the loop. A population missing the *completion* deadline is a
report about the workload — units that outgrew the window. Collapsing both
into "killed at rung 3" is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) in the
ladder's own bookkeeping: an unacknowledged request and an acknowledged
overrun are being written down as the same outcome, and the fix for one
does nothing for the other.

Where receipt is *not* observable — a platform stop signal with no
consumption step — the single deadline stands, and the honest reading is
that the ladder cannot distinguish these two states rather than that they
do not exist.

## Cancellation races completion

The normal awaiting posture is a **race**: the host waits on
child-exited *and* cancel-requested simultaneously, and either can win.

- If exit wins, cancellation later must be a no-op — idempotent, not an
  error, because the requester cannot know it lost the race.
- If cancel wins, the ladder runs, and the eventual exit is still collected
  — losing the race does not excuse the reap.
- If the awaiting code itself is torn down — error path, early return, task
  aborted — the **kill-on-drop backstop** fires: the child handle is
  configured *at spawn* so that dropping it kills the process. Kill-on-drop
  is insurance, not the mechanism: it skips the polite rung and writes no
  outcome, so any path that relies on it as the *primary* stop has already
  lost the record. Its job is to convert "leaked a live process" into
  "skipped a graceful shutdown" on the paths nobody designed.

## Kill the tree, not the pid

Real tools spawn helpers; interpreters spawn workers; wrappers spawn the
actual program. Terminating only the direct child detaches its descendants —
which keep running, keep the ports and locks, and now belong to nobody.
Termination therefore targets the **process tree**: a platform grouping
mechanism established at spawn (a group, a job object, a session) so the
kill addresses the family atomically, or an explicit descendant walk where
no grouping exists. The walk variant races against the tree changing under
it — children spawning grandchildren mid-kill — which is why establishing
the group *at spawn* is the door's job, not the killer's improvisation.

## Reaping is unconditional

Every spawned child is eventually **waited on** and its exit status
collected. An unreaped child is a platform resource leak (a zombie entry, a
held handle) — and, worse, a bookkeeping lie: the host's slot accounting,
liveness roster, and scratch-space cleanup are all keyed to the reap. The
reap is the single point that releases what the spawn acquired; a path that
kills without reaping shrinks the host's effective capacity by one, forever,
silently. Audit rule: every code path that can learn the child is gone —
normal exit, ladder kill, kill-on-drop — must converge on the same
release sequence, exactly once (the reap is idempotent or guarded, because
two paths *will* eventually both fire).

## Exit honesty

"The process ended" is not an outcome; it is a fact awaiting
classification. The closed vocabulary distinguishes at minimum:

- **completed** — exited zero, and where the tool has a richer protocol,
  its own success record agrees (an exit code of zero from a crashed
  wrapper is the classic false green);
- **failed** — exited nonzero, code preserved verbatim;
- **killed** — died by signal/forcible termination, and *whose*: the
  host's ladder (with the originating reason — ceiling, cancel, shutdown)
  versus the platform or an outside agent;
- **spawn-failed** — never existed; must not be dressed as an exit;
- **lost** — the host cannot know (crash gap), resolved by the sweep.

Collapsing these into a boolean is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
in its process form — most commonly as "no exception thrown while waiting,
so it must have worked".

## Orphans: when the host dies first

A host crash orphans every live child. Ending those processes can be bound to
the host's life ([below](#binding-a-child-to-the-hosts-life)), but settling their
records cannot: only the *next* host incarnation can do that. Its mechanism is the
**startup orphan sweep**:

- **Mark at spawn.** The door stamps every child with a durable identity
  marker — an environment tag, a marker file in the run's scratch
  directory, a registry row — that names the owning host instance and run.
- **Sweep at start.** Each host start enumerates candidate survivors by
  marker, not by name: "a process with the tool's name" is somebody else's
  legitimate work; "a process carrying my instance marker from a dead
  incarnation" is an orphan.
- **Verify before killing.** Process ids are recycled by the platform;
  between the record and the kill, the id may name an innocent stranger.
  The sweep re-verifies identity (marker still present, start time
  matches) immediately before acting —
  [identity survives reuse](../../../../_laws.md#identity-survives-reuse), applied
  to the platform's own id space.
- **Resolve the record.** Every swept orphan's run record is settled as
  *lost-to-host-crash* — the sweep is also the bookkeeping repair, not just
  the killing.

The sweep is a recurring obligation, not only a boot step: a periodic pass
catches orphans created by crashes of *other* cooperating host instances.
Where the host already has a supervised recurring-loop runtime, the sweep
runs as one of its loops
([background-jobs](../../../../backend-platform/work-execution/background-jobs/background-jobs.md) owns that
machinery).

## Binding a child to the host's life

A sweep runs only if a next host starts. Until then, nothing retires the survivors:
in the measured baseline, a force-killed host left its child and the child's helper
alive in every run for as long as they were watched, five seconds. So a child that
must not outlive its host names a second reaper, and the choice between the two
below was measured, not assumed.

**Prefer a kernel binding.** The host holds the only handle to a job whose members
die when it closes. It needs no cooperation, so it also covers what no child-side
code can: a child wedged from its first instruction, and a wrapper that never runs
the guard. It cleared every measured case, gone by the time the kill returned, with
a helper spawned detached still inside it.

**Check what the default spawn already gave you.** A runtime can put every ordinary
child in such a job for you, and a detached spawn gives that up with no signal. Same
host, same kill: the ordinary child and helper were gone within a millisecond, the
detached pair were alive five seconds later. A design that detaches its children to
give them their own group has moved them out of a protection nobody wrote down.

**Where no kernel binding is available, a guard in the child**, with four rules that
each failed when broken:

- **On its own thread.** A guard on the child's main loop cleared the idle case and
  failed all five wedged runs, whether it polled or waited for end-of-file. The child
  that most needs reaping is the one not running its loop.
- **Handed the identity at spawn, armed before anything that can block.** A host that
  died before the guard armed was caught the moment it armed, because the handed
  identity was already dead. A child that blocked first was never caught, in five of
  five. That gap has no child-side fix: a child killed before init, or one that never
  runs the guard, needs the kernel binding.
- **Prefer a closed pipe to a process id.** A pid guard handed an id now held by a
  live stranger never fired, in five of five. The pipe fired in all five, and sooner
  than the poll, because it waits rather than samples. That run used a live stand-in
  and not a forced recycle, and it is [identity survives
  reuse](../../../../_laws.md#identity-survives-reuse) again. A second holder of the
  pipe's write end would keep it open; that case was not measured.
- **Test existence, never silence.** A host blocked for six seconds is alive. A
  missed-heartbeat guard killed healthy children in all five runs and an existence
  guard in none, so a stall stays
  [liveness-and-heartbeats](./liveness-and-heartbeats.md)'s question. The guard ends
  the whole tree: a helper spawned detached went with it, five of five.

Binding is per spawn class, and a child meant to outlive its host (a development
server, a node that must survive a daemon restart) does not get one. Whatever does the
killing, the run record stays open until a sweep settles it, so the binding replaces
neither the marker nor the sweep.
