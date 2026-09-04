---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: cancellation-needs-a-terminable-unit
status: forged
laws: [creation-names-reaper, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a cancelled call still burns CPU after the surface stopped painting, choosing between a cooperative cancellation token and a kill boundary, an in-process plugin ignored its abort signal, deciding where work must run so that stopping it is a fact rather than a request]
---

# Cancellation needs a terminable unit

Cooperative cancellation is a protocol, not an enforcement. A cancellation
token, an abort signal, a context handle — each is a value the callee is
*asked* to observe, and there are four ways to defeat it without anyone
writing a bug on purpose: forget to thread it through, call a dependency that
does not accept one, run a synchronous block that never reaches a check, or
sit in a retry loop that treats the cancelled state as one more transient
failure. In all four the timeout fires, the caller is told the work stopped,
and the work does not stop.

The surface can be made honest about this cheaply, and
[streaming-output](../../streaming-output/streaming-output.md)'s
[cancellation-and-finalization](../../streaming-output/techniques/cancellation-and-finalization.md)
does exactly that: signal the producer best-effort, stop *applying* its
events immediately, and finalize through the one door with outcome
`cancelled`. That is right, and it is a claim about the display. It is not a
claim about the work, and the two are routinely conflated because after a
cancel the screen looks identical in both worlds.

## The discriminator

> **Does a unit exist whose death the host can survive?**

That single question routes the whole decision, and both answers already have
a correct mechanism in this corpus.

**No such unit — count, and raise a failure the guest cannot catch.** An
interpreter embedded on the host's own thread, holding the host's data, is
the case
[guest-execution-bounding](../../../../backend-platform/language-runtime/guest-execution-bounding/guest-execution-bounding.md)
owns, and it states the constraint in its opening: the only remedy the
operating system offers is killing the process, which is the host's own
death. There is nothing to terminate, so the runtime governs itself from
inside its dispatch loop — a ceiling is enforceable exactly where something
is counted. Reaching for a kill there does not fail safely; it corrupts the
host's data or has no target at all.

**Such a unit exists — terminate it, and stop treating compliance as the
contract.** A child process, a worker, a sub-interpreter, a sandbox request:
anything whose destruction reclaims its resources without taking the
session's authority with it. Here cooperative cancellation is a courtesy
extended *first* and relied on *never*. The signal goes out, a bounded grace
period runs, and then the unit dies —
[termination-and-reaping](./termination-and-reaping.md) owns the ladder and
the funeral.

The failure this technique names is choosing the first mechanism while the
second was available: running a contribution in the host's own isolate, then
discovering that cancellation has to be cooperative *because of that
placement*, and writing the cooperative protocol as though it were the
requirement rather than the consequence. **Placement decides cancellability.
Decide it in that order.** A runtime that wants enforceable cancellation and
also wants contributions in its own address space has chosen, and should say
which.

## The consequence for blocking work

Once the unit is terminable, a call that overruns its budget is not a special
case needing its own escape hatch — it is a unit that outlived its lease, and
the same handle that stops a backgrounded child stops it. That is what makes
one blocking budget enforceable in one place instead of each caller growing a
private timeout, and it is why the budget belongs to the layer that owns the
unit rather than to the code that happens to be slow.

State the guarantee at the boundary, in the same two lists
`guest-execution-bounding` publishes for its ceilings: what a cancel
**reclaims** and what it merely **stops watching**. A host that cancels a
call into a native library it cannot terminate has stopped watching, and
saying so is the difference between a known limit and a leak nobody has
found yet. Reporting a reclaim you did not perform is the
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
shape: the caller reads a clean cancellation and the resource is still gone.

## Where the count goes

A cancel whose reclamation is unverified is a claim without a predicate. Emit
the two numbers the ladder already knows — units signalled, units reaped —
and alert on the gap rather than on either alone
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
persistent gap is the population of work that ignored its signal, and it is
the only direct evidence that the cooperative half is being relied on where
it should not be.
