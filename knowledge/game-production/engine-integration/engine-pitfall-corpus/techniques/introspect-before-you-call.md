---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: introspect-before-you-call
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [planning automation against an API in a reduced execution mode, an existence check reports absence for something demonstrably present, deciding whether a pipeline step can run unattended]
---

# Introspect before you call — and do not believe the answer

Large systems let you interrogate them: does this exist, is this operation
available, what type is this. Those answers are the most confidently wrong inputs
available, because they are wrong in both directions and both failures look like
success.

## Failure one: the surface resolves, the operation is inert

In reduced execution modes — headless, sandboxed, offline, restricted-permission —
an API surface commonly resolves *completely*. Every symbol imports, every method
is present, every signature checks out. Introspection therefore reports the
operation as available. Calling it does one of three things: nothing observable;
something partial that passes structural checks; or it terminates the process
outright.

The canonical case: an entire simulation-and-capture surface resolves in a
headless authoring session — enable-simulation, is-simulating, spawn, transaction
begin and end, the solver types, the play-mode entry point. Introspection says the
whole pass is scriptable. It is not. The session's world has no simulation scene,
so enabling simulation leaves the state flag false and nothing ever moves; and the
call that would enter play mode is a fatal exit, not a catchable exception,
because there is no loop to enter. There is also no scriptable way to advance
time: the available primitives all schedule work on a tick that never comes.

The general law: **the API answering a question is not the API doing the thing.**
A resolved symbol is a structural fact. Capability is behavioural, and only a
behavioural probe establishes it.

## Failure two: a negative answer is not an absence

Existence and lookup calls have blind spots — a mount point that has not been
indexed, an extension-supplied namespace, a lazily-registered subsystem. They
return a clean negative for resources that are plainly present, and the caller,
reading a definitive-looking false, reports "not found" and stops, or worse
recreates the thing.

Two rules follow. **Treat every negative from an introspection call as a candidate
false negative** until a differently-shaped check agrees — typically: perform the
index or registration step the lookup depends on, then attempt the load directly
and test the returned object. The load is the authority; the existence check is a
hint. And **know which classes of resource the check is honest about.** Where the
blind spot is bounded ("resources under the primary project root are unaffected;
this only bites extension-supplied mounts"), record the boundary in the entry, or
the rule gets over-applied until every lookup is wrapped in ceremony.

## The probe procedure

1. **Probe in the exact mode you will run in.** A capability confirmed
   interactively says nothing about the unattended run. Mode is the single most
   common hidden variable in this class of failure.
2. **Probe on the exact version you will run on.** Behaviour forks between minor
   releases: one release crashes where the next silently succeeds at nothing.
3. **Assert the effect, not the call.** Set the state, then read it back. Spawn
   the object, then observe it moving. A call that returns without error and a
   call that did the work are different results, and a probe that checks only for
   an absent exception measures nothing.
4. **Record the split.** Most "impossible" pipelines are not impossible, they are
   *split*: one half runs fine in the reduced mode and the other needs a fuller
   host. Naming the seam — this half is authoring, that half needs a live loop —
   turns a dead end into an architecture. Have the reduced-mode half do exactly
   its half and hand the rest to the environment that can run it.
5. **Write the probe up as an entry.** A probe that is not recorded will be run
   again by the next person, at full cost.

## Decision rules

- **Never let an unattended run infer capability from resolution.** If the run
  needs an operation, it probes for the operation's *effect* at start-up and
  refuses with a stated precondition failure if the effect is absent. An
  unprobed capability is unmeasured, and unmeasured is not a pass.
- **Never gate destructive work on a negative introspection result.** Deleting,
  recreating or overwriting because a lookup said "absent" is how a false negative
  becomes data loss.
- **A fatal exit is not an error you can handle.** Where a call is known to
  terminate the process, guard it by mode before the call site; there is no
  recovery after it.
- **Prefer the load over the check** wherever the load is affordable. It costs
  more and it is the only answer that is true.
- **A capability probe is version- and mode-stamped, or it is folklore.** The same
  provenance discipline that governs entries governs probes.

## When not to use it

Do not probe what you can arrange to know: if the platform documents a mode
restriction and you trust the source, cite it and move on rather than
re-establishing it at cost. Do not build a general capability-detection framework
where three probes at start-up would do; the framework becomes a second system to
keep true. And the parallel discipline for probing external command-line tools in
the asset pipeline is owned by a neighbouring subject — the shape is the same, the
detail is theirs.
