---
layer: application
type: application
subject: self-healing
technique: fork-to-outlive-the-healed
stack: rust
verified_on: 2026-09-04
applied: simulation
ab_verdict: not-better
---

# Fork to outlive the healed, in two trees that answer it oppositely

Two realizations, read in one run, and the pair is the document: an external task
runner that forks and is right to, and a fleet work runtime that does not fork at
its outer boundary and is also right to. The technique came from the first; the
second is where it was tested and rejected, which is the more useful half.

Citations for the external tree are against `sagiegurari/cargo-make` commit
`95dcc54`, version `0.37.24` (`Cargo.toml`), edition 2021 — an external
reconciliation, so the pin sits here in prose rather than in `verified_against`,
whose contract is a stack runtime version. The fleet side cites no paths, per the
cross-repo rule; its seam lives in that project's own `.ai/applied.jsonl`.

## 1. The external tree: protection by re-invocation

The task runner's protected flow is the technique in its pure form. When the
configuration names an on-error task, the runner does not execute the requested
flow in its own process. It builds a proxy task — its own binary, `make`, plus a
serialized flag subset — runs it as a child, and branches on the child's exit
code; the on-error flow then runs in the parent, which never entered the failing
state.

Every property the technique names is present and observable:

- **One constructor for the flag set.** `create_proxy_task` is the only place
  the child's invocation is built, and every caller goes through it — the
  protected flow, a task referencing a file in another directory, the workspace
  fan-out, the watch loop. The technique's warning about divergent call sites is
  answered structurally rather than by discipline.
- **The child is told not to protect.** `--no-on-error` is pushed into the
  argument vector inside that same constructor, unconditionally. It is the
  termination condition, and it is not optional at any call site.
- **Depth is carried in the environment and reused as output.** A counter is
  incremented on entry, read to suppress the once-per-run banner and the update
  check when the process is not top-level, and rendered as a bracketed prefix on
  every emitted record — blank at depth zero, so an ordinary single-level run is
  byte-identical to what it was before the feature existed.

The tree also shows the technique's stated cost honestly. The workspace fan-out
generates a script whose body is one `cargo make` line per member; anything the
parent knows that is not in that line is unavailable to the member. The design
answer is to widen the flag set — the log level, the profile, the makefile path,
the caller's own trailing arguments and a per-member environment assignment are
all passed explicitly — which is the technique's "the flag set is the interface"
rule paid for in full.

**Where it does not reach the technique.** The parent classifies by exit code
alone. `run_protected_flow` checks `exit_code != 0` and runs the on-error task;
it cannot distinguish an exhausted flow from a configuration error from a signal,
and no declared verdict crosses the boundary. This is the gap
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
names, present in a tree that otherwise implements the mechanism well — the fork
bought a surviving handler and bought the handler no knowledge.

## 2. The fleet tree: three failure classes, and why the fork loses anyway

The consumer is a work runtime that executes contributed work items as in-process
async tasks. Its own source comment enumerates the failure classes its recovery
path cannot reach, which made the simulation's cases real rather than invented.
Each case was walked under policy A (today: in-process, unwind caught) and policy
B (the technique: each work item in a child process).

**Case 1 — the work item panics.** A: the unwind is caught and the job fails on
this tick through the normal attempt-fenced path, carrying the panic payload as
the error. B: the child exits non-zero and the parent classifies. *Equivalent
outcome; B adds a process spawn per job and buys nothing.*

**Case 2 — the work item wedges in a non-yielding loop.** A: neither the unwind
branch nor the heartbeat branch is ever reached, the lease goes stale, and the
reaper labels it *lease expired (heartbeat stale)* — a verdict naming the symptom
the supervisor could observe, not the thing that happened. B: the parent's
wall-clock timeout kills the child and can record *wedged, no progress, killed at
T*. *B is better.*

**Case 3 — the work item hard-aborts (process exit, OOM, kill signal).** A: the
whole worker dies with it, taking every other in-flight job on that worker, all
of which the reaper then recovers as stale leases. B: only the child dies; the
parent classifies it and every sibling job survives. *B is clearly better.*

Two of three cases favour the fork, and the technique still loses, because of a
property none of the three cases surfaces: the work item holds a reference to a
**live shared spend counter** that it decrements as it consumes budget, alongside
a progress reporter writing to the runtime's event bus and a checkpointer. Those
do not serialize into an invocation. Moving the item into a child converts each
into a protocol, and the budget protocol reopens precisely the window the fork was
bought to close — a child that spends and then hard-aborts in case 3 has consumed
budget the parent never saw. In one address space the counter is updated before
the spend call returns and
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) holds for
free.

**Verdict: `not-better`, at that boundary, today.** The falsifier is written and
reachable: move the cost ledger to a write-ahead store the work item appends to
before spending — a shape this tree already half has, since spend is restored from
prior attempts through a checkpoint and cost events are already recorded — and the
disqualifier dissolves, at which point case 3's argument wins outright.

## 3. The structural fact neither tree was built to prove

The consumer **already forks**, one layer in. The engine that invokes the external
model tool spawns it as a child process and reads its output; what crosses that
boundary is a request and a response. What crosses the outer boundary is an
accounting reference. Nobody wrote a policy that says "fork where the state is
small"; the boundary landed where it landed because that is where the mutable
state stopped, and the result is that this tree applies the technique and declines
it, correctly, in the same call stack.

That is better evidence for the technique's placement rule than the external
tree's adoption is, because the external tree could have been designed to
demonstrate it and this one plainly was not.

## What these realizations cannot do

Neither tree can tell you whether the fork pays at low failure rates. Both adopted
it where a failure class was *certain* to occur — a task's non-zero exit, a model
tool's crash — not where it was rare, so neither is evidence about the pricing rule
the technique asks you to apply. A reader deciding whether to fork a rarely-failing
component gets no help here and should measure the spawn cost directly.
