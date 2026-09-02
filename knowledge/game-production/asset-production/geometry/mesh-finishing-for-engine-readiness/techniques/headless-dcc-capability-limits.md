---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: headless-dcc-capability-limits
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass, refuse-rather-than-destroy]
shared_with: []
use_when: [automating a content tool with no interactive session, an API call resolves but does nothing, planning which pipeline stages can run unattended]
---

# Headless capability limits

Every content-creation application with a scripting interface offers a headless mode, and
every headless mode has operations that **resolve but do not work**. The function is
present. Introspection finds it. The arguments type-check. The call returns — and nothing
happened, or the process exits fatally with no catchable exception. This technique is the
discipline of finding out which operations those are, in advance, by running them.

## The trap, stated generally

*An automation surface's introspection tells you a call EXISTS. It never tells you the
call WORKS in the context you are calling it from.*

The reason is structural rather than accidental. The binding layer that exposes an
application's internals to a script exposes symbols, and a symbol's existence is a fact
about the binary, not about the runtime. The operations that fail headless are the ones
whose real dependency is on something the headless mode never constructed: a window, an
editor loop, a simulation scene, an advancing clock, a document context, a selection. None
of those dependencies is expressible in a function signature, so none of them shows up in
introspection, in type stubs, or in documentation generated from either.

The failure has two shapes and you must probe for both:

- **Silent no-op.** The call succeeds, a follow-up query reports the state unchanged, and
  the pipeline proceeds on a false premise. This is the dangerous one, because the run is
  green and the artifact is wrong.
- **Fatal exit.** The process dies inside the native layer with a non-zero code. Loud, but
  it is not an exception you can wrap in a handler — a retry loop around it just dies
  repeatedly.

A worked example of the shape: an unattended asset-authoring session exposes the entire
physics interface — enable simulation, query whether a body is simulating, put a body to
sleep, enter and exit an interactive play mode, spawn actors, open transactions. From
introspection, an automated "drop these objects and let them settle" pass is obviously
scriptable. It is not. The session's world has no physics scene, so enabling simulation
leaves the query reporting *not simulating* and a spawned object never falls; entering
play mode is a fatal crash through the scripting plugin rather than an error; and there is
no scriptable way to advance time at all, because the only timing primitives available
schedule work on a tick that never arrives. The conclusion is a boundary you can build on:
**this mode is an asset-authoring tool, not a simulation host.** The authoring half — read
and write transforms, set properties, save documents — is fully available. The simulating
half needs a runtime that actually ticks.

That conclusion is the general output of this technique. The point of probing is not a list
of broken calls; it is a sentence naming what class of work this mode is for.

## Procedure

1. **Enumerate the operations your pipeline needs**, at the granularity of individual
   calls, before writing the pipeline.
2. **Write a probe script per operation** that performs the call *and then asks the
   application whether the intended effect occurred*. A probe that only checks the call
   returned proves nothing — that is exactly the structural evidence the law says is never
   sufficient.
3. **Run every probe in the exact configuration you will ship**: same headless flag, same
   plugin set, same version, same document state. A capability that works in the
   interactive session is not evidence about the unattended one, and vice versa.
4. **Isolate probes that may exit fatally** in their own process, so one crash does not
   take the survey with it.
5. **Record each result with the application version and the probe date.** Availability
   moves in both directions across releases; an undated capability note is a rumour.
6. **Record the ground-truthed details, not just the verdict.** The details that break an
   otherwise correct script are usually naming ones — the internal type name that works
   versus the display name that returns nothing, the pin or parameter identifier that
   differs from its label in the interface. These are unguessable and only a live probe
   produces them.
7. **Design the split.** Put the provable half in the unattended pipeline; route the
   unprovable half to whatever runtime does have the missing context, and have the
   automation only stamp the result back.

## Decision rules

- **A capability is unproven until probed in the shipping mode.** Documentation, type
  stubs and introspection are hypotheses.
- **Prefer the lower-level call that has been proven over the higher-level one that has
  not.** Convenience wrappers commonly assume interactive state — a wrapper that takes an
  identifier and looks up interactive targets fails headless while the primitive it wraps,
  fed the extracted data directly, succeeds. Ergonomics lose to provability.
- **Prefer data-level manipulation over operator-level invocation.** Operators are the
  layer that carries context requirements; the underlying data interface usually does not.
- **An unprobed operation is refused, not attempted.** Refusing with a named precondition
  beats a run that half-completes and leaves a partially authored document behind.
- **Enable the plugins a capability needs per run, not globally**, so the capability's
  requirements travel with the automation that needs it rather than becoming ambient
  project state nobody can safely remove.
- **A residual manual step is a legitimate result.** Where an operation is genuinely
  interactive — brush painting, hand-placed solve points — name it as the gated step and
  automate everything around it. Pretending it is automatable produces a pipeline that
  works on the demo asset.

## When not to use this

- **When the tool has a supported, versioned automation contract with a conformance
  suite.** Then the contract is the evidence and re-probing is duplicated work — though
  still worth a smoke probe per upgrade.
- **When the operation is pure computation with no application context** — a geometry
  library call, a file format conversion. The trap needs a missing context to exist.
- **When you control both sides.** If the automation surface is yours, fix the surface so
  unsupported calls refuse loudly, rather than building a probe corpus around a lie.
