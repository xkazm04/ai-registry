---
layer: technique
type: technique
subject: engine-integration-safety
technique: editor-thread-timeout-budgeting
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, a-budget-shapes-the-output]
shared_with: []
use_when: [choosing a timeout for a call into a heavyweight application, a slow but healthy call is reported as a failure, two ends of one call disagree about when to give up]
---

# Timeout budgeting against the callee's work queue

The concern: choosing how long to wait on a call into an application that executes your
instruction on its own busy thread — and choosing it by derivation from that application's
work model rather than from a round number that felt safe.

A timeout is not a safety margin. It is a *claim*: "past this point, waiting longer yields
no new information." That claim is either true of the callee or it is not, and a wrong one
in either direction is expensive. Too short converts healthy slow work into a brand-new
false failure that did not exist before you set the number. Too long — or absent — hangs
the caller forever on a wedged application, with no error at all, which is strictly worse
than a failure because nothing gets reported.

## Procedure

**1. Write down the callee's work model.** Three facts: does it execute your instruction
on a shared thread, what is the cost of the most expensive *legitimate* operation on that
thread, and what does it do when it is stuck. For an interactive application with a
privileged main thread, the honest model is that your instruction is queued behind whatever
the application is already doing.

**2. Measure the expensive-but-healthy band.** Not the average — the upper end of what
routinely happens and is fine. Recompiling live code, importing or saving a large asset,
and rebuilding a derived cache are the usual occupants of that band, and in a heavyweight
3D application they measure in tens of seconds; 30 to 60 seconds is a realistic observed
range for those operations. The band is what you must clear.

**3. Find the wedge threshold — the point past which recovery never happens.** In practice
a wedged application is wedged for a *reason* that will not resolve: a crash during play,
a modal dialogue waiting on a human, a blocked script holding the thread. There is a
duration past which "busy" is no longer a plausible explanation. Set the bound above the
healthy band with real headroom, below the point where waiting is pure loss. Two minutes is
a defensible default for the model above precisely because it clears a 60-second band with
room to spare and still bounds the wedge case.

**4. Record the derivation next to the number.** The constant carries its unit and the
reasoning that produced it: which band it clears, which failure it bounds, and why the
cheap-call timeout used elsewhere is not appropriate here. A number without its basis will
be "tidied" by the next reader into something rounder and wrong.

**5. Give genuinely long work an explicit opt-in, not a bigger default.** Operations that
legitimately exceed the bound — full rebuilds, packaging, bulk reimports — pass their own
larger bound at the call site. Raising the shared default to accommodate the outlier
destroys the bound for every ordinary call.

**6. Let one side own the number and the other derive from it.** Where a client polls a
server that itself enforces a ceiling, the ceiling is the server's, and the client's poll
budget is computed from it — the server's ceiling plus a stated margin for the overhead the
client can see but the server's ceiling does not cover (launch, capture, judging,
persistence). Export the ceiling from one module that both sides read. Two hand-maintained
numbers on one call is a race, and the race's characteristic output is a phantom failure:
the client gives up and reports failure for work that is still running and will succeed.

**7. Make the timeout message quote both numbers and the work's real state.** How long the
waiter actually waited, what that budget was derived from, and — crucially — that the work
may still be running. A give-up by the observer is not a verdict on the work.

## Decision rules

- If a caller supplies its own deadline, honour it and do not stack the default on top; an
  explicit choice is not second-guessed. If the caller supplies both a deadline and a
  bound, compose them so either can end the call.
- If a caller asks for no bound at all, allow it, but treat it as rare and explicit —
  nothing else can then unstick a wedged callee, and the caller has accepted that.
- If a healthy operation is failing the bound, raise the bound at that call site and record
  why. Do not silently retry, which doubles the load on an application already behind.
- If the bound fires, the outcome kind is *timed out* — never a generic error, and never
  the same kind as *unreachable*. Report the elapsed time and the budget.
- If two components quote different ceilings for one call, that is a defect regardless of
  whether anything has failed yet. One authority per quantity.
- If the derivation's inputs change — the callee gets faster, the expensive operation
  changes — the number moves with them. It is derived, not inherited.

## When not to use this

**Cheap, side-effect-free reads** against the same application — a status ping, a manifest
fetch — take a much shorter bound, because their work model is different: they do not queue
behind main-thread work. Reusing the heavy bound for them makes an unresponsive
application look healthy for two minutes.

**Interactive calls a human is watching** need a bound short enough to keep the interface
honest, with the long-running work moved to a job the human can poll. A person staring at
a spinner is a different work model from a batch step, and it deserves its own derivation.
