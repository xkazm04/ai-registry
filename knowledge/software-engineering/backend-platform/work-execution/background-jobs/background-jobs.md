---
layer: golden-path
type: golden-path
subject: background-jobs
status: forged
techniques:
  - loop-supervision
  - tick-isolation
  - adaptive-cadence
  - loop-health-telemetry
  - startup-sweeps
  - job-progress-and-cancellation
---

# Background jobs & supervised loops

A long-lived process accumulates recurring obligations: poll a source, expire
stale rows, retry failed deliveries, roll up metrics, refresh a token before it
dies. Each obligation is small; the collection is the **background runtime** —
the part of the system that does work nobody is watching. This subject owns
that runtime: the supervisor that hosts the loops, the isolation that keeps one
bad loop from taking down the rest, the health signals that make silent work
visible, the shutdown path, and the progress/cancellation contract for jobs
that run long enough to be watched.

What this subject does **not** own is *when* work fires. Recurrence rules,
calendar math, trigger matching, cooldowns, and the policy question of what a
missed scheduled run means all belong to
[scheduling](../scheduling/scheduling.md). The division is a clean one:
scheduling decides that work is due; background-jobs is the machine that is
awake to notice, the room the work runs in, and the record that it ran. A
recurrence engine with no host never fires; a host with no recurrence policy
fires at arbitrary times. The two subjects meet at exactly one interface — "is
anything due now, and what?" — and everything on the far side of that question
is scheduling's.

## The central claim: one supervisor, not N timers

The natural history of background work is entropic. The first recurring task is
a timer armed at startup. The fifth is five timers, armed in five modules, each
with its own idea of error handling, its own shutdown behavior (usually none),
and no shared answer to "what is running right now?" This is the ad-hoc timer
swarm, and it fails on every axis at once: shutdown leaks (nobody stops what
nobody tracks), a crash in one callback takes down or silently disables its
host, health is unknowable because there is no roster to check against, and the
process's wake pattern is the accidental interference of N independent clocks.

The standard is **one supervisor that owns every recurring loop**. Each loop —
however heterogeneous its work — registers through the same door: a name, a
cadence, a tick body, and a stop handle. Registration buys four properties that
no per-module timer can offer:

1. **A roster.** The set of live loops is enumerable, which is the precondition
   for every other guarantee. Health checks, shutdown, and debugging all begin
   with "what exists?" — a question the timer swarm cannot answer.
2. **Uniform isolation.** The supervisor wraps every tick in the same crash
   capture, the same re-entrancy guard, the same timeout. Safety becomes a
   property of the door, not a discipline expected of each loop author
   ([one door](../../../_laws.md#one-validation-door), applied to execution instead
   of validation).
3. **Uniform telemetry.** Every tick reports through the same channel in the
   same shape, so a dashboard, a watchdog, or a debugging session sees all
   background work in one vocabulary.
4. **One shutdown path.** Stop is a walk over the roster, not an archaeology
   project.

The supervisor is infrastructure, so it obeys the infrastructure law: every
loop it creates names its reaper
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). A loop with no
stop handle is a leak with a cadence.

## The roster rule applies to spawned work, not only to registered loops

The supervisor's roster answers "what exists?" for work that **registered**. It says
nothing about work that a tick body, a handler or a job *spawns* in passing — the
concurrent unit launched to do one thing and never referred to again. That work is
unowned, and unowned work has three properties, each of which defeats one of the
guarantees above:

- **It cannot be counted.** Its cardinality is whatever the input happened to be. A
  handler that spawns one unit per element of a collection has a concurrency limit
  equal to the size of a collection somebody else controls, which is not a limit.
- **It cannot be waited for.** Shutdown's drain walks the roster; work not on any
  roster is neither drained nor recorded as abandoned, so the next startup sweep is
  blind to it in exactly the way an unrecorded hard stop is.
- **It cannot be stopped.** Cancellation targets something. There is nothing to
  target, so the cooperative stop path — the one every job contract is built on —
  has no entry point.

So the rule is the supervisor's rule one level down: **concurrent work is spawned
into a named group that can enumerate, await and abort its members.** The group is
the owner, and it is what
[creation-names-reaper](../../../_laws.md#creation-names-reaper) demands of a
spawned unit exactly as it demands a stop handle of a loop. A group makes the three
properties above their opposites: the count is the group's size, the drain is an
await on the group, and the stop is an abort on the group. This is also precisely
the space [drain-and-shutdown](../admission-queue/techniques/drain-and-shutdown.md)
declines to fill — a queue's duty ends at not promoting into a closing system, and
running work is handed to "the executor's drain problem." The group is what makes
that problem solvable rather than merely someone else's.

Where the group is unbounded because the input is, the group is not the whole answer
— a bound on concurrent members belongs to
[admission-queue](../admission-queue/admission-queue.md), and the group is what
makes such a bound enforceable at all.

**The inversion** is work that must genuinely **outlive its parent**: a job launched
by a tick, continuing after the tick returns. That work is not unowned, and putting
it in the parent's group would be wrong — its owner is its durable record, which is
[job-coordination](../job-coordination/job-coordination.md)'s regime, where recovery
finds it by query rather than by handle. The test is whether an owner exists at all,
not whether the owner is a group: a spawned unit with neither a group nor a durable
record has no owner, and that is the failure this rule names.

## Anatomy: ticks and jobs are different animals

Background work comes in two durations, and conflating them is a classic
structural mistake.

**Ticks** are short, recurring, and unwatched: check for due work, expire a
cache, emit a heartbeat. A tick's contract is bounded duration, idempotence
across repeats, and silence on success. Ticks live inside supervised loops for
their whole life.

**Jobs** are long, singular, and watched — or watchable: a bulk export, a
reindex, a large import, a media render. A job runs for seconds to hours, has
a beginning and an end that matter to a person, and therefore carries a
contract ticks never need: identity, progress, cancellation, and a way for a
viewer to attach, detach, and re-attach without disturbing the work. A loop's
tick may *launch* a job (that is common and healthy), but the job then lives
under the job contract, not the tick contract.

The rule of thumb: if anyone could reasonably want a progress bar or a cancel
button, it is a job. If its only observer is the health system, it is a tick.

## The runtime's lifecycle is three designed phases

**Startup.** The process was down; the world moved. Work that should have
happened is a *startup concern, not an accident to discover later*: the
runtime opens with a bounded, idempotent sweep that reconciles reality before
steady-state cadence begins. What the sweep executes is decided by
scheduling's missed-run policy; how it executes — bounded, ordered, distinct
in the record from live runs — is this subject's
[startup-sweeps](./techniques/startup-sweeps.md) technique. A runtime that skips
this phase doesn't avoid the missed work; it converts it into a slow drip of
anomalies with no common explanation.

**Steady state.** Loops tick on their cadences; the health surface stays
current; jobs come and go under their own contract. The steady state's design
questions are cadence (how often to wake, and whether "how often" should
depend on whether anything is happening —
[adaptive-cadence](./techniques/adaptive-cadence.md)) and isolation (what one
bad tick is allowed to cost — [tick-isolation](./techniques/tick-isolation.md)).

**Shutdown.** Graceful shutdown is a designed path, not an interruption. The
sequence is fixed: stop admitting new ticks, signal cancellation to everything
in flight, drain within a bounded grace period, then stop hard and record what
was abandoned. Every step matters: skipping the admission stop races new work
against the drain; skipping the signal turns cooperative jobs into corpses;
an unbounded drain converts "shutting down" into "hung"; and an unrecorded
hard stop makes the next startup sweep blind to what was cut off. Shutdown
and startup are mirror images — the quality of the shutdown record is the
quality of the next sweep's information.

## Invariants

These hold across every technique, and reviews should check them directly:

- **One bad loop must not kill the runtime.** A crash inside a tick is
  captured, recorded, and survived; the loop lives to tick again (or is
  deliberately quarantined after repeated failure — a decision, not a side
  effect).
- **Every loop reports its own health, and silence is detectable.** A loop
  that stops ticking must become visible *because* it is silent, not when a
  human notices its work is missing. "Ran and found nothing" and "did not
  run" are different facts and must produce different signals
  ([failure ≠ empty success](../../../_laws.md#failure-not-empty-success)).
- **At most one live runner per loop, everywhere.** When multiple process
  instances can host the same loop (an old instance lingering through an
  upgrade, a companion process, a second launch), ownership is explicit — a
  heartbeat-based claim with a takeover protocol — never assumed.
- **Work survives its observer.** A job keeps running when its viewer
  navigates away, and the viewer can rejoin from a snapshot. Progress is a
  read model of the work, not a lifeline the work depends on.
- **The supervisor itself is observable.** A dead supervisor with N registered
  loops looks exactly like a healthy quiet system unless the supervisor's own
  liveness is part of the health surface. Watch the watcher.

## The techniques

- [loop-supervision](./techniques/loop-supervision.md) — the registration model,
  stop handles, shutdown ordering, and cross-process ownership handoff via
  heartbeat claims.
- [tick-isolation](./techniques/tick-isolation.md) — crash capture per tick,
  re-entrancy guards, per-tick deadlines, and quarantine after repeated
  failure.
- [adaptive-cadence](./techniques/adaptive-cadence.md) — active vs idle
  intervals, wake-on-signal hybrids, jitter, and visibility-aware polling on
  client surfaces.
- [loop-health-telemetry](./techniques/loop-health-telemetry.md) — per-tick
  snapshots, the queryable health surface, and silence detection.
- [startup-sweeps](./techniques/startup-sweeps.md) — bounded, idempotent
  catch-up on work missed while the process was down.
- [job-progress-and-cancellation](./techniques/job-progress-and-cancellation.md)
  — job identity, honest progress and ETA, cooperative cancellation, snapshot
  re-attach, bounded live logs, and terminal states distinct from progress.
