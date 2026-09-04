---
layer: application
type: application
subject: guest-execution-bounding
technique: terminate-from-outside-when-you-cannot-count
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.80
applied: code
ab_verdict: better
proof: ab-paired
---

# The timeout that only detaches: 8 residual sites in a mature desktop application

## Why this application exists

The technique's diagnostic half says an asynchronous timeout around foreign work
cancels the await and not the work, and that the question worth asking of any timeout in
a codebase is *when this fires, what happens to the work?* This is that question asked
of a real tree with a real answer, and the answer was more interesting than the
prediction.

## The convergence, which is the finding

The hypothesis going in was that a desktop application driving external command-line
tools under async timeouts would be leaking detached children wholesale. It was refuted
on the hot paths, and the refutation is the strongest corroboration this technique has.

The tree had already found the mechanism independently, and recorded it in almost the
same words the browser-engine source used for a completely different symptom. One
process module's comment says the kill-on-drop flag exists as the safety net for every
path that drops the child handle without an explicit kill — "most importantly the engine
ceiling dropping the runner future when the async timeout fires. Without it the
underlying CLI keeps streaming — and billing the user's account — until the desktop app
restarts." A second module states the semantics flatly: without the flag the async
runtime *detaches* the child.

Two systems, unrelated problem domains — one preventing a wedged browser worker, one
preventing a runaway subscription bill — arriving at the same mechanism for the same
underlying reason. That is a second independent sighting of a rule, not one system's
practice imported into another, and it is why this technique is written as a rule rather
than as one engine's habit.

## What was actually missing

The gap was not the mechanism. It was coverage, and the shape of the gap is the reason
the technique argues for a structural guard over per-site discipline.

Counted across the tree: **16 files apply the kill-on-drop flag; 5 more kill the child
explicitly on the timeout branch and then reap it under a bounded second wait** — which
is equally correct, and is the pattern used where the child handle is still in scope
after the race. **8 sites had neither.** At those, a fired ceiling returned a clean
timeout error to the caller and the process kept running: a bridge action, two
version-probe invocations, an outbound HTTP tool test, a build-tool invocation, and one
pipeline step.

The pipeline step was the one a file-level scan cannot see. Its child is spawned
*inside* the async block that the 300-second ceiling drops, and the only explicit kill on
any path is the user-cancellation branch. Nothing in the file's shape distinguishes it
from a guarded site; only reading which paths kill does.

Two sites failed the same file-level scan in the opposite direction, and running the
check rather than trusting it is what caught them: a verification-command runner and a
context-generation scan both look unguarded by grep and both kill the child explicitly.
One of them carries a comment reasoning that dropping the future makes *the buffers* safe
to reclaim, and says nothing about the child — which is the exact reading error this
technique is meant to prevent, appearing in a codebase that then got the behaviour right
anyway.

## The paired comparison

The measurable is the count of spawn sites under a ceiling with no kill on the ceiling's
own path: **8 in arm A, 0 in arm B.** Arm A's semantics were not asserted by this run —
they were established by the project's own prior investigation, quoted above, which is
what makes a structural count sufficient evidence here rather than a substitute for it.

The compile gate was run on both arms. The workspace's engine crate checks clean with
the change. The desktop crate's build fails on an unrelated capability-manifest error,
and that failure was attributed rather than assumed: the seven changed files were
stashed, the check re-run, and the identical failure reproduced without them.

## What this realization cannot do

No gate observed the *behavioural* half. Proving that the child is dead after a fired
ceiling needs a test that spawns a sleeping process, lets the ceiling fire, and asserts
the process is gone — and the desktop library's test binary will not launch on this
machine, failing at load before running anything. So the claim carried by this
application is the structural one: every site that spawns under a ceiling now stops the
child when the ceiling fires. The claim that it *observably* stops is the return
condition, and the instrument it needs is a launchable test binary, not a new assertion.
