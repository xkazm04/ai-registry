---
layer: golden-path
type: golden-path
subject: engine-integration-safety
status: forged
use_when: [automating a live creative application someone is working in, a tool must terminate or restart something to proceed, deciding how long to wait on a call into an application, a run failed and nobody can tell where]
techniques:
  - refuse-dont-kill-a-live-editor
  - pid-scoped-teardown
  - single-instance-lease-and-drain
  - editor-thread-timeout-budgeting
  - transport-failure-taxonomy
  - judge-by-log-markers-not-exit-code
---

# Engine integration safety

An automated tool drives a heavyweight, stateful, interactive application that a human
being also uses — a real-time 3D game engine, a modelling package, a browser session, a
long-lived database session, a design tool. This subject is the contract that tool
operates under: what it may do to that application, what it must refuse to do, and how it
reports an outcome when it cannot proceed.

The whole of it follows from one framing. **The automation is a guest.** It did not create
the session it is entering, it cannot see what is unsaved inside it, and it will leave
before the human does. A guest's worst possible behaviour is not failing to do its job. It
is succeeding by destroying state the human had not saved. Every rule below is that
sentence made operational.

## The founding incident

A run needed exclusive use of an application that cannot be entered twice on the same
project. It resolved the collision the obvious way: before launching, it swept the machine
for every process matching the application's executable name and terminated them.

It worked, in the sense that the run then proceeded. It also destroyed the operator's open
session, with hours of unsaved authoring in it, every single time anyone pressed the
button. And it had a second victim nobody predicted: a concurrent automated run, holding
its own headless instance of the same application, was killed mid-flight — and because it
saw only that its child had died, it recorded the killing as *its own launch failure*. One
careless sweep produced both a data loss and a false diagnosis pointing at innocent code.

Two lessons are load-bearing and they are not the same lesson. The first is about damage:
**never destroy what you did not create**. The second is about epistemics: **a destructive
act by one actor is indistinguishable, from inside another actor, from that actor's own
failure**. Collateral termination does not merely break things; it corrupts the evidence of
why things broke.

## Identity, not class

The sweep's specific defect is worth isolating because it recurs everywhere. An executable
name, a window title, a container image tag, a port, a user account — these are *classes*.
A process identifier, a handle returned at spawn, a lease token you hold — these are
*identities*. The rule: **act only on identities; use classes only to observe and report.**

You may list by class. You may name what you found by class, so the human can act on it.
You may refuse because of what a class-shaped listing showed. You may never terminate,
close, restart, delete or overwrite by class, because a class match is a statement about
resemblance and the thing you are about to destroy may merely resemble your target. The
asymmetry is deliberate: reading by class is free, and writing by class is unbounded.

## Refusal is a result, not an absence of one

A tool that cannot proceed has three honest options and one dishonest one. The honest
ones: refuse and say precisely why; wait for the blocker to clear; ask the human and do
nothing until answered. The dishonest one is to clear the blocker itself.

For this to work, a refusal must be a *first-class outcome* in whatever result type the
tool returns — a named kind, not an exception, not a generic failure, and never a false
success. Consumers need to distinguish four things and will conflate them if you let them:
the work ran and passed; the work ran and failed; the work never started because a
precondition refused it; the work started and its outcome is unknown. The third is not a
failure of the work — nothing was measured, and under `unmeasured-is-not-a-pass` it must
render as not-measured rather than as either verdict.

A refusal message earns its place by being *actionable*. It names what blocked (with the
identifying detail the human needs to find it), states why the tool will not clear it
itself, and gives the remedy — including, where one legitimately exists, an explicit
override with its consequence stated at the point of choice. Some blockers are
overridable by an informed human, because a human may genuinely want the risky thing.
Some are not, because they encode a machine-state fact inside your own process that no
human intent can make safe. Say which kind each one is.

## What a live application actually costs you

Three properties of these applications drive every remaining rule, and each of them is
routinely discovered late and painfully.

**Non-reentrancy.** Many heavyweight applications hold an exclusive claim on their project
or workspace — file locks, a single-instance mutex, an on-disk cache assumed to have one
writer. A second instance does not politely queue; it fails obscurely, or worse, both
instances proceed and corrupt shared state. Non-reentrancy is not a bug to route around. It
is a fact to take a lease against.

**A single work queue.** Interactive applications typically execute external instructions
on one privileged thread — the same thread that draws the interface and runs the
simulation. Your instruction therefore does not start when you send it; it starts when the
queue reaches it. Everything the application was already doing is prepended to your
latency. This is why timeouts here cannot be intuited from a round number and must be
derived from the callee's work model.

**A hostile exit code.** Large applications are legendary for exiting non-zero after doing
their work perfectly, typically faulting somewhere in teardown, and for exiting zero having
done nothing at all. The exit status of such a process carries one bit and it is usually
about the wrong subject. Truth has to come from what the run *said* while it ran.

## The two axes of a failure

When a call into a driven application does not return a result, the tempting move is one
error type. Resist it, because the responses diverge completely. Classify along two axes.

*Was the callee reached?* Not reached at all means the application is not running or not
listening — the human must start it, and nothing you can change in your own code helps.
Reached-but-silent means it took your instruction and never answered — the application is
busy, wedged, or your instruction hung. Reached-and-answered-badly means the application is
running fine and something on its side is broken.

*Where does the fault live?* A transport-level failure happened before your instruction
existed as far as the callee is concerned. An execution failure happened inside it. These
demand opposite responses — retry versus fix your code — and a tool that reports "editor
unreachable" for a malformed reply sends its operator to restart an application that is
already running while the real defect stays hidden. That specific mis-send is the cost of
collapsing the taxonomy, and it is why the distinction is worth carrying in the type.

## Judge by what the run said

Give every driven run a marker protocol: a start sentinel, a structured result between the
sentinels, an end sentinel. Then parse. The subtlety that most implementations miss is that
**the absence of an end marker is its own outcome**, distinct from a failure marker — it
means the run was cut short, and cut short is a statement about the environment, not about
the artifact under test. Cut short and failed must never map to the same verdict.

There is a third case the naive protocol also loses. A run may complete cleanly, emit its
end marker, and contain *no result marker at all* — the work you asked for was never
registered, never matched, never applicable. That is a planned-but-absent state: an honest
deferral. Rendering it as a failure produces a red board full of work nobody has written
yet; rendering it as a pass is a lie. It is a third value.

And when several results share one log, attribution has to resolve to exactly one identity
before a marker may be credited to a request. Zero candidates means unobserved; more than
one means ambiguous, and ambiguous degrades to deferred — never to a pass and never to a
fail. A false verdict is the worst output this layer can produce, because it reads
downstream as proof; an unresolved one costs only another run. Structural presence of a
marker proves the marker was printed and nothing more — structural proof is never
sufficient, in its smallest possible form.

## The failure modes of the naive reading

- **"I'll just restart it."** Restarting is destruction with a friendly name. Applied to a
  session with unsaved state it is exactly the founding incident.
- **"The timeout is thirty seconds because that feels right."** A number with no basis
  fails healthy slow work and calls the failure real. Derive it, state the derivation,
  and state its unit.
- **"Both ends should have their own timeout, for safety."** Two independent deadlines on
  one call is a race whose loser fabricates a failure. One side owns the number; the other
  derives from it.
- **"It exited zero, so it worked."** See above. It exited zero.
- **"Retry on error."** Retry on *the kinds of error where retrying is correct*. A blanket
  retry over a taxonomy you collapsed will re-run a non-idempotent instruction that already
  ran, against an application you cannot inspect.
- **"Cancel the rest, we're done."** Cancelling in-flight work and reporting the run
  complete hides the cost. Drain what is in flight and count what you drained.

## Where this subject ends

What *evidence* a behavioural claim requires — the rungs of proof, discriminators that can
actually see a defect, deterministic unattended runs — is the adjacent concern and the
closest neighbour to this one. The division: that subject owns what proves a behaviour;
this one owns how to drive the application safely enough to obtain the proof at all.
Likewise the gating of a shipping build, the attribution of a crash to a cause, the
economics of an unattended build loop, and the batch acceptance of produced content each
own their own territory. Where produced content takes an all-or-nothing lease over this
same non-reentrant application and drains rather than cancels, that is the content
pipeline's view of the resource this subject holds — the same lease, described from the
other side.
