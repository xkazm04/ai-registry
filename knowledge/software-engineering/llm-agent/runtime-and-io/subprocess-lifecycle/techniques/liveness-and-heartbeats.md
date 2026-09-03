---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: liveness-and-heartbeats
status: forged
laws: [identity-survives-reuse, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [telling a stalled run from a slow-but-honest one, no-data reads that never end on a live child, deciding whether a pulse proves the worker is alive]
---

# Liveness and heartbeats

"The process exists" is the weakest fact a host can know about a child. A
child can exist and be deadlocked, exist and be waiting on input that will
never come, exist and be looping without progress — all while holding a
slot, a session, and the user's patience. This technique owns the
instruments that distinguish **alive-and-working** from **alive-and-stuck**
from **slow-but-honest**, and the escalation that follows.

## Activity is keyed by run identity

The unit of liveness is **the run**, not the process and not the host. The
instrument is an activity record per run identity — *this* run produced
observable work at time T — updated on every genuine signal and read by
whoever needs to claim the run is progressing.

Two wrong keys, both common:

- **The process id.** Ids are platform-recycled and session-reused; a
  liveness table keyed by pid inherits both aliasing problems. The run
  identity is minted at admission and never reused
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); the
  pid is an attribute of the run, not its name.
- **A global activity light.** One shared "children are active" signal is
  kept green by any chatty sibling while a specific run has been silent
  for an hour. Aggregates cannot answer the only question that matters —
  *which* run stalled — so the aggregate is derived from per-run records,
  never maintained instead of them.

## What counts as a heartbeat

The activity signal must be evidence of **progress**, observed as close to
the child's real work as possible
([gate-sees-target](../../../../_laws.md#gate-sees-target)). In descending order
of honesty:

1. **Output events** — the child emitted structured output, a log line, a
   protocol frame. The natural signal for talkative tools, and it is
   usually already flowing through the stream machinery
   ([streaming-output](../../streaming-output/streaming-output.md) owns
   that pipe; this technique only taps its event times).
2. **Artifact effects** — files growing in the run's scratch directory,
   checkpoints appearing. Honest for quiet tools that work on disk.
3. **Consumption metrics** — processor time still accruing to the tree.
   Weak alone (a spin loop accrues forever), but a useful discriminator:
   silent *and* zero-consuming means blocked; silent and burning means
   looping or genuinely computing.
4. **Self-reported pulses** — the child says "still here" on a side
   channel. Weakest, because it measures the heartbeat thread, not the
   work: a tool whose worker is deadlocked while its pulse timer runs
   emits perfect heartbeats from a corpse. Never accept a self-report as
   the *only* instrument for a tool that can emit anything better.

Silence on all channels past the threshold is a fact about the
*instruments*, and the host's claim must degrade accordingly — "no
observed activity since T", not "running fine" and not "failed". Promoting
silence to either comfortable extreme is the liveness form of
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success).

**And the instrument itself must distinguish two silences.** At the output
channel, "the pipe closed with nothing more to say" and "the pipe is open
and nothing has arrived for the whole window" are opposite facts: the
first means the child is exiting normally and the host should proceed to
the reap; the second means the child is holding its channel open with
nothing to say — wedged, not finishing. A read primitive that collapses
both into one "no data" result forces every caller to treat the wedged
case as the finishing case, which ends with the host blocked forever on a
wait that never returns. Type the two endings differently at the lowest
read layer, and the entire stall machinery above inherits the
distinction for free.

## Stalled versus slow

The threshold question is the technique's hard center, because the cost of
each mistake is asymmetric: killing a slow-but-honest run destroys real
work; babysitting a stalled one wastes a slot and the user's time.
Principles:

- **Thresholds are per tool class, not universal.** A formatter that has
  been silent for two minutes is dead; a compiler at two minutes is
  normal. The spawn door knows the class; it registers the threshold with
  the liveness record.
- **Silence starts the clock; it does not fire the kill.** The stall
  threshold triggers *investigation posture*: the claim degrades, cheaper
  instruments are consulted (consumption, artifacts), the user is shown
  the honest state and offered the cancel.
- **Only the ceiling kills.** The hard per-run timeout
  ([host-resource-protection](./host-resource-protection.md)) remains the
  sole automatic executioner; the stall detector is an early-warning
  system feeding humans and records, not a second, twitchier killer. A
  design with two independent kill authorities produces exactly the
  kill-races and double-records the termination ladder exists to prevent.
- **Expected-quiet phases are declared, not discovered.** Tools with known
  silent phases (long initial load, a final fsync) get those phases
  declared in their class profile, so the detector does not cry wolf at
  the same minute of every run — the fastest way to teach operators to
  ignore it.

## The clock arms at first contact, not at spawn

Everything above assumes the activity record exists and asks how to read
it. The prior question — *when does the clock start* — is where a
supervisor that is right about thresholds still kills the wrong child, and
the answer is the same for every liveness clock in this subject: **it arms
on the first genuine signal from the run, never on the spawn.** A record
seeded with the spawn timestamp cannot tell a slow-but-legitimate cold
start (interpreter imports, model weights loading, workspace indexing)
from a child that hung before it ever spoke; both are silence measured from
the same instant, and a threshold short enough to catch the second kills
the first — under a restart policy, forever, since every respawn repeats
the cold start and the kill.

Three rules follow, and a supervisor that has only one timer cannot honour
any of them:

- **Startup gets its own deadline.** Before first contact the stall clock
  is unarmed, so the pre-contact hang is invisible to it by construction —
  a child deadlocked in its own initialisation holds the slot and the
  dataflow waits on it indefinitely. Bound that phase with a *separate*
  time-to-first-contact deadline, sized from the class profile's declared
  cold start, and record which deadline fired: "never connected" and
  "went silent" route to different repairs.
- **Respawn resets the record.** A restarted child that inherits the
  previous incarnation's activity timestamp is born already past the
  threshold and is killed before it can register — the restart loop's
  quietest form. The record belongs to the run identity, and a respawn is
  a new run.
- **A staleness clock attaches only to a channel that promised
  continuity.** The same arming rule governs the input side: a deadline on
  an upstream stream arms on the first message, so an input that is idle at
  startup is not "timed out" before anything was owed. And it belongs only
  on channels whose contract is periodic. On a request-shaped channel —
  responses, results, anything populated on demand — a natural idle
  interval is byte-identical to a dead upstream, and the detector becomes
  a false-alarm generator; per-request bounds carry that case, one deadline
  per outstanding request, never a channel-wide timer.

The single-ceiling design that most hosts start with is the reason these
rules are worth the extra clock. With one timer that is both the startup
bound and the stall detector, the ceiling must be tight enough to notice a
hang and is then tight enough to kill a working child; loosen it and a hang
is noticed only at the ceiling. Measured on three child shapes (hang before
first byte, slow cold start then work, work then hang): the tight ceiling
detected both hangs at the ceiling and killed the working child; the
generous ceiling spared the working child and detected both hangs only at
the ceiling; the armed clocks under the generous ceiling spared the working
child and detected the two hangs at 42% and 31% of it (the harness ended
each run at detection to read the time; in a real host the stall detection
degrades the claim per the rules above and the ceiling still does the
killing, while the startup deadline may terminate outright, because a
child that never made contact holds no work to destroy). Arming is what
lets the ceiling be generous.

## The stall ledger

Every stall episode — run identity, silence duration, which instrument
finally moved or which rung ended it — is recorded even when the run
recovers. Recovered stalls are the leading indicator: a tool whose runs
routinely go silent for 4 minutes against a 5-minute threshold is one
regression from an epidemic of false kills, and only the ledger shows the
margin shrinking. This is also the data that earns threshold changes —
adjusting a stall threshold from anecdote is how both failure modes get
worse at once.

## The watcher is also watched

Stall detection is itself a recurring loop with the standard obligations —
registered, supervised, and visible in the host's own health surface —
because a dead stall detector over a fleet of silent children reads
exactly like a healthy quiet system. The recurring-loop machinery is
[background-jobs](../../../../backend-platform/work-execution/background-jobs/background-jobs.md)'s subject; the
liveness loop is simply one of its registered customers.

## A socket peer on a host that sleeps

The ladder above assumes the run is a child and the host is awake. Aim the
same watcher at a **peer across a socket** - a chat server, a push
channel - and two of its rules need a boundary each.

**The probe is sent only when the line has been quiet.** Inbound frames
are rung one of the ladder already; the corollary is that a probe on a
busy line is pure overhead, and its reply is noise. So the watcher's tick
first asks whether anything arrived since the last tick. If so, that
traffic *is* the pulse: the pending-reply flag clears, no probe goes out,
and the "alive" signal is emitted. Only a tick that finds the whole
interval silent sends a probe and arms the flag; only a tick that finds
the flag still armed declares the peer gone. For a socket, that
declaration is the ceiling - there is no other executioner - so the
unanswered probe closes the connection and hands off to the reconnect
ladder, and the ladder's single-pending-timer rule does the rest.

**A tick that fires late is not a pulse.** A watcher whose tick arrives at
several multiples of its interval was not running: the host slept, the
process was stopped, a virtual machine was paused. Nothing measured across
that gap is evidence about the peer - "traffic since last tick" may be
hours old, "silence since last tick" was mostly the host's silence. So a
tick whose elapsed time exceeds a small multiple of the interval
(three is conventional) **withholds the healthy signal it would have
emitted** and lets the next on-time tick decide; if that next tick finds
the line quiet, it sends one probe and waits the ordinary grace, rather
than treating the suspend as an unanswered probe. Measure the lateness on
the monotonic clock. This is the socket-side twin of the scheduler's
clock-jump rule in
[missed-run-semantics](../../../../backend-platform/work-execution/scheduling/techniques/missed-run-semantics.md):
a jump is an anomaly to record, never a schedule input, and never a death
certificate.
