---
layer: golden-path
type: golden-path
subject: session-continuation
status: forged
use_when: [an agent stops after a positive review verdict or a partial result, designing a keep-working mode for a coding-agent harness, a cancelled session keeps blocking the operator, deciding what must survive a context compaction, a multi-stage autonomous run has to resume safely]
techniques:
  - continuation-as-state
  - single-loop-authority
  - ordered-yield-composition
  - advisory-guard-fail-mode
  - ordered-teardown
  - compaction-checkpoint
  - sealed-stage-advance
  - stuck-loop-detection
---

# Session continuation

A coding-agent session ends its turn when the model decides it is done. That
is the correct default for a question and the wrong default for a task: for
anything longer than one turn the decision to stop arrives on the model's
schedule, not the work's. The model summarises after a reviewer says the plan
is fine, stops after the first of four files, declares victory on a test run
it did not read, or loses the plan entirely when the harness compresses its
context. Every one of those is a stop that nobody asked for, and the operator's
only recourse is to type "continue" — which makes the human the loop, sitting
in a chat window doing the one job a harness exists to do.

This subject owns the layer **inside one session** that keeps it working
until a stated condition holds and lets it be stopped cleanly. The load-bearing
idea is that continuation is a **harness property enforced at the turn
boundary**, not a persuasion problem solved in the prompt. The model may be
told to keep going, and it will, until it does not; the harness has an event
at the exact moment the model tries to yield, and a decision made there is a
decision the model cannot skip. Everything else in the subject follows from
taking that boundary seriously: the fact that says "keep going" has to be
somewhere the harness can read it; something has to own the fact so two
things cannot disagree about it; the interceptors that live at the boundary
have to fail in a direction that does not trap the operator; cancellation has
to clear every one of them; the fact has to survive the harness rewriting the
model's memory; a run made of several stages has to advance on evidence
rather than optimism; and a loop that keeps going must still notice when it
is going nowhere.

## Where this sits among its neighbours

The neighbours are close and the seams are exact. fleet-orchestration owns
the layer *above* one session — the registry of sessions, dispatch, harvest,
and completion-claim-verification, which is the evidence that a delegate's
"done" is true. This subject owns who may say *this session's* loop is over
and what happens at the turn boundary when the model tries to end it; when a
verdict here needs evidence, that evidence is the neighbour's receipts and
decidable leaves, and this subject does not restate them. Below, the sibling
subject subprocess-lifecycle owns the process itself: spawn, signal, reap. A
session in this subject is a conversation with a control loop, not a process
handle. agent-instruction-files owns the advisory floor — the rules a project
hands its agent — and its context-reset-redelivery technique owns re-reading
that floor after a compaction. The compaction technique here ferries a
different cargo, the control loop's own state (which modes are armed, where
the plan anchor is, which background handles exist), and says so explicitly:
the neighbour restores what the agent should believe, this subject restores
what the harness was doing. hitl-approval owns the human gate and its
fixed-policy-amendable-plan owns the executor's terms; this subject does not
decide what is approved, only that a positive verdict is not a place to stop.
plan-review owns the reviewer's payload. background-jobs' loop-supervision
owns server-side timers and singleton loops, and the discriminator is where
enforcement lives: a session loop is enforced at a turn boundary the model
cannot skip, a supervised loop is enforced by a scheduler. An unattended
build loop in a different domain drains a spend budget between iterations;
this loop gates a turn, and a budget is one of the conditions it may read,
not the mechanism. retry-backoff and circuit-breakers own the detection of a
dependency being down; stuck-loop-detection here is about an agent repeating
its *own* failure.

## The continuation fact is state, and the boundary reads it

The naive implementation writes "do not stop until the task is complete" into
the system prompt and adds emphasis when it fails. It fails because instruction
text is advice, and advice competes with every other pressure on the model's
next token; the more the context fills, the weaker any one sentence gets. The
standard moves the fact out of the context entirely: a **persisted record**
that says a continuation mode is active, what it is waiting for, and when it
was last confirmed, which a hook at the turn boundary re-reads and enforces by
refusing the stop and returning the model to work. The test that separates the
two designs is destructive and simple. Delete every reinforcing sentence from
the prompt and leave the record: continuation must still happen. Then age the
record past its lease and leave the sentences: the session must stop. A
design that fails either half has put the fact in the wrong place.

The record carries a **lease** — hours, not days — because two things must
both be true: a crashed run must expire on its own rather than arming every
future session opened in that directory, and a long task must not be cut off
by a clock tuned for a short one. A stale record is treated as inactive, not
as an error, and the boundary says which it saw. The states in which the
harness may yield control to the human are **enumerated**: a clean terminal
exit on the stated condition, and an explicit rejection. A positive review
verdict is not in the set, and that omission is the single most valuable line
in the subject, because "the plan is approved" is the moment a model most
reliably summarises and stops. continuation-as-state holds this, including
the rule that the channel which arms a mode is suppressed inside spawned
workers, so the harness cannot arm itself recursively through its own
delegates.

## One authority decides that the loop is over

A session running two continuation loops does not get twice the persistence;
it gets a race about who is right. The second loop arrives innocently — the
host harness grows its own goal evaluator, a nested mode is armed inside an
already-armed one, an operator's alias re-enters the mode the session is in —
and the naive treatment warns and continues, which is a decision to have no
policy. The standard makes the continuation authority **single-valued**, with
conflict resolved from an enumerated set: refuse the second loop, adopt the
existing one, or run in an artifact-only posture that produces state without
enforcing it. An unknown policy fails with a diagnostic. The same technique
draws the line the host's judge cannot cross: an evaluator that reads only the
conversation can say the transcript looks finished, and that is a distinct
status from complete, with the harness's own verification of the tree between
the two. single-loop-authority owns both rules.

## Guards at the boundary fail open, unless their risk class says otherwise

Once a harness has one hook at the turn boundary it soon has twenty:
interceptors that check whether the model drifted from its plan, whether a
write is stale, whether a tool call is allowed. Each one can block, each one
can throw, and each one can hang. The naive reading imports the security
posture — everything fails closed — and produces an operator who cannot end
their session because a plan-drift checker cannot parse a message. The
distinction is the cost of the wrong interval. A decision path whose fail-open
interval is a disclosure fails closed, always, and security's failure-direction
technique owns that rule. An advisory guard's fail-closed interval is a stuck
operator, and it fails **open with a structured diagnostic**. The discriminating
question is what the wrong direction costs and whether it can be undone. So
every interceptor carries a declared risk class, its fail mode is derived from
the class, and the fail-closed set is enumerable from the registry of hooks
rather than discovered by reading each one. Anything that blocks at the
boundary is a total function of the current message with an enumerated accept
grammar: unlisted syntax passes, malformed input passes, an uncertain boundary
passes, and every handler is bounded by a timeout whose timer cannot hold the
process open. advisory-guard-fail-mode is the full statement.

## Cancellation is an ordered teardown that knows every guard

The mirror image of a loop that refuses to stop is a loop that cannot be
stopped. A harness accretes stop-blocking guards — the continuation record,
the mode flag, the pending-work marker, the plan-anchor lock — and a cancel
command that clears the three it knows about leaves the fourth to block the
next stop for as long as its lease runs. Operators pay for this in the worst
currency there is: a session that ignores "stop" for a quarter of an hour.
The standard is one teardown path that clears **every** guard the harness can
set, in dependency order — the primary record first, then the dependents, and
if the primary write fails, abort and leave the group resumable rather than
half-erased. Teardown also distinguishes the narrow write that deactivates one
mode from the global cancel signal, because a global signal emitted during a
handoff between modes disarms the successor for its window; and it must win
the race against the loop re-arming itself on the same turn. ordered-teardown
holds the order and the race.

## Compaction is a boundary, and the loop's state is ferried across it

Context compression is the harness rewriting the model's memory, usually
without the operator watching. The summariser is asked to keep what matters,
and what it keeps is what reads as important prose; a mode flag, a job
handle, a count of iterations and a plan anchor are none of those, and they
are exactly what the loop depends on. The standard treats compaction as an
explicit control boundary: enumerate the state that must survive, write it at
the pre-compaction event, restore it at the post-compaction session start keyed
on the reason the session started, and never let the summariser carry anything
the loop needs. Two channels exist on purpose — an automatic checkpoint the
harness writes and a model-writable notepad — and neither is sufficient alone:
the checkpoint cannot know what the model was reasoning about, and the notepad
cannot be trusted to exist. compaction-checkpoint owns the enumeration and the
restore.

## A staged run advances once, on evidence

Some sessions are not one loop but a sequence of stages, each a different
posture — plan, build, verify, repair — where the output of one is the input
of the next. The naive design is a small workflow engine: arbitrary stages,
branches, loops, callbacks, the current stage held in a configuration file
that later edits can change under a resume. That is a different safety model
and it is rejected here. A staged run admits only sequences from a closed set
whose stage inputs are self-produced; at selection its shape is **sealed** by
a content hash into an immutable descriptor, so a resume executes what was
chosen and not what the configuration says today; and a stage advances
**exactly once**, on the current stage's exact completion signal found in an
authenticated record, under compare-before-write, with a concurrent loser
re-reading once and reporting the current status. The neighbour pipeline-dag
pins an authored graph at run start and computes readiness from persisted
node status; the difference here is that the advance is driven by model
output, which is why it needs provenance. sealed-stage-advance is the
technique.

## A loop that never stops must still notice it is stuck

The whole subject argues for not stopping, so it must say precisely when to
stop anyway. Attempt counts are the wrong instrument: ten attempts that each
fail differently are progress, and three attempts that fail identically are a
wall. The standard keys the stop on **failure identity** — the same failure
signature surviving a small number of repair attempts halts that lane with a
root-cause hypothesis handed upward, and this stop outranks any batching or
deferral policy. Two counters run independently, stagnation (wins too small to
matter) and failure (no win at all), with asymmetric resets, because a single
counter conflates a loop that is slowly improving with one that is thrashing.
A candidate is accepted only after the merged state is re-measured, and the
same approach family may not win too many rounds in succession without a
challenger. stuck-loop-detection holds the counters and the rules.

## Invariants

- **The continuation fact lives in state the harness re-reads at the turn
  boundary.** Prompt text may restate it; prompt text never carries it.
- **Every continuation record has a lease, and a stale record is inactive.**
- **Exactly one loop authority per session, single-valued, with an enumerated
  conflict policy and no warn-and-continue branch.**
- **A positive verdict is not a yield state.** Yield states are enumerated.
- **Every boundary interceptor declares its risk class, derives its fail mode
  from it, and is bounded by a timeout that cannot hold the process open.**
- **Cancel clears every stop-blocking guard from one path, in order, and wins
  the race against re-arming.**
- **Nothing the loop depends on crosses compaction inside the summary.**
- **A staged run is sealed at selection and advances exactly once per stage,
  on authenticated evidence.**
- **A stop on repeated identical failure outranks every policy that would
  defer it.**

## The techniques

- [continuation-as-state](./techniques/continuation-as-state.md) — the
  persisted record, its lease, the enumerated yield states, and the
  suppression of the arming channel inside workers.
- [single-loop-authority](./techniques/single-loop-authority.md) — one
  continuation authority, the enumerated conflict policies, and why the host
  judge's pass is not complete.
- [advisory-guard-fail-mode](./techniques/advisory-guard-fail-mode.md) — risk
  class per interceptor, fail-open with a diagnostic, total accept grammars,
  bounded handlers, and the discriminator against fail-closed authorization.
- [ordered-teardown](./techniques/ordered-teardown.md) — one cancel path that
  clears every guard in dependency order, deactivate versus global cancel,
  and the re-arm race.
- [compaction-checkpoint](./techniques/compaction-checkpoint.md) — what
  control state survives compression, when it is written and restored, and
  the two channels that together suffice.
- [sealed-stage-advance](./techniques/sealed-stage-advance.md) — the closed
  set of stage sequences, the content-hash seal, the exactly-once advance on
  an authenticated completion signal, and the rejected workflow engine.
- [stuck-loop-detection](./techniques/stuck-loop-detection.md) — failure
  identity over attempt count, the two counters with asymmetric resets, and
  the priority of the stop.
