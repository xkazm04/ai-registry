---
layer: technique
type: technique
subject: extension-trust-boundary
technique: two-phase-attach-then-initialize
status: forged
laws: [creation-names-reaper, unknown-is-not-a-value]
shared_with: []
use_when: [an extension attaches handlers to a surface built before its backend, designing the lifecycle hooks an extension must implement, a deployment shape has no engine behind the request surface, a handler can be reached before its dependencies exist]
---

# Attach in one phase, initialize in another

An extension that contributes request handlers meets a sequencing constraint
that in-process extensions never do. The handler surface is assembled while the
application object is being constructed and is effectively frozen once the
server begins accepting connections. The dependency those handlers need — the
client for the engine, the worker pool, the store — is created **after** that,
by a startup sequence the extension does not control.

A single initialization hook cannot satisfy both. Called early, it has no
backend; called late, the surface it wants to modify is closed. So the contract
has two hooks, and the split is the whole technique.

## Phase one: attach

Runs while the surface is being built. Receives the application object and the
resolved configuration, and nothing else.

- **It must be total.** It may not fail because a backend is absent, because at
  this moment a backend is *always* absent. The only legitimate failures are
  the extension's own: malformed configuration, an unsupported host version, a
  path it refuses to claim.
- **It registers structure only** — handler paths, methods, middleware,
  schemas, documentation entries. Anything that would touch a live dependency
  belongs to phase two.
- **It is where the extension declares its own surface**, and therefore where
  the prefix decision is made: which paths it claims, and whether those paths
  fall inside or outside whatever coverage the host's request-side controls
  provide.

## Phase two: initialize

Runs once the live dependency exists. Receives it, and stores what the handlers
need.

- **It may never run.** There are legitimate deployment shapes with no backend
  behind the surface — a front-end instance routing to engines elsewhere, a
  control-plane process, a mode that serves only health and introspection. The
  contract says so explicitly, because an author who is not told will assume
  the hook is guaranteed and write handlers that dereference an empty field.
- **The extension answers for the backend-less case.** Two acceptable answers:
  declare the server capabilities it requires so the loader never loads it
  where they are absent, or accept being loaded and degrade — serve what needs
  no backend and refuse the rest with a clear outcome. The unacceptable answer
  is assuming the case away. Prefer the declaration: a requirement the loader
  evaluates is checked once, at load, by the host, and an extension gated out
  before attaching cannot be reached in a state it cannot serve. The degrade
  path is checked in every handler by the author, forever.
- **The declaration is a field, not a convention.** Give the contract an
  explicit slot for "the capabilities I need", with a documented meaning for
  the empty case (no requirement, always eligible). A requirement expressed as
  a comment or a name prefix is one the loader cannot enforce.
- **It is idempotent and re-runnable** if the host can replace the dependency
  — a reconnect, a failover, a hot swap. Capture the accessor, not a snapshot
  of the object's internals.

## The window between the phases, and the answer that belongs in it

Between attach and initialize the handlers exist and are reachable. A request
arriving there must get an **explicit not-ready outcome** — a distinct, typed
result the caller can act on, mapped to a status that means "try again", not an
empty response, not a default-shaped success, and not the exception from
dereferencing a field that is still unset
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
difference is operational: a not-ready answer during startup is a normal event
someone can wait out; the same moment rendered as an empty result is a data bug
somebody will chase into the backend.

Write the readiness check once, in one place the extension's handlers share.
Every handler that repeats the check is a handler that will one day forget it.

## Phase two can run when phase one never did

This is the failure that gets found in production rather than in review, and it
runs opposite to everything above. The phases communicate through a shared
state object, and hosts accumulate entry points that build that state without
building the application surface — a batch runner, a secondary launcher, a test
harness that constructs a bare state and calls the initializer. Phase two then
executes against state where phase one left nothing at all.

Two rules close it, and both are needed:

- **Phase two treats the absence of phase one's marker as a legitimate state**
  and does nothing. Not an assertion, not a raised error: the caller did
  nothing wrong, it simply never built a surface, and an initializer that
  crashes there breaks a code path with no extensions involved.
- **Phase one records its outcome even when it loaded nothing** — an empty
  collection written into the state, not an absent field. That is what makes
  "ran and found none" distinguishable from "never ran", which is the only way
  the first rule can be a *decision* rather than a shrug.

The generalization is worth carrying to any two-phase protocol joined by shared
state: the later phase must be able to tell that the earlier one ran, and the
earlier one is responsible for making that knowable.

## Phase three, which nobody writes down: detach

Both phases create things — attached handlers, captured clients, background
tasks started when the dependency arrived. The host will shut down, and in a
long-lived process it may shut down a *component* rather than the process. The
contract names what unwinds each phase
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the
dependency captured in phase two is released or closed, tasks started there are
cancelled and awaited, and the extension states whether its attached surface
survives a dependency replacement or must be rebuilt. An extension whose
teardown is unspecified is a leak the host cannot fix from outside, because the
host does not know what the extension captured.

## Decision rules

- If the surface is built before the dependency exists, split the hooks. Do not
  solve it with a lazily-resolved global that the handler pulls at call time —
  that hides the ordering rather than expressing it, and the failure moves from
  startup to the first request.
- If the extension needs the dependency to decide *what* to attach, it has a
  design problem, not a lifecycle problem: derive the surface from
  configuration, and let the handlers vary by what they find at call time.
- If a deployment shape exists where phase two never runs, make it a named case
  in the contract with a required answer, not a footnote.
- If the host can replace the dependency at runtime, phase two runs again;
  design capture accordingly and say so.

## When not to use this

- **When the dependency exists before the surface.** Then one hook is correct
  and a second is ceremony that authors will implement as an empty function,
  which trains them to implement it as an empty function when it matters.
- **When the extension contributes no surface** — an inert in-process
  contribution has a single registration and no lifecycle.
- **When the host can honestly guarantee the dependency for every deployment
  shape it supports.** Then merge the phases and remove the not-ready outcome;
  a readiness state that can never be observed is dead code that later gets
  copied into a place where it can.
