---
layer: technique
type: technique
subject: agent-addressable-ui
technique: uninstrumented-degradation
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [the overlay is present but nothing is stamped, deciding what an empty result should tell the operator, an inspector highlights nothing and reads as broken]
---

# Uninstrumented degradation

The overlay and the stamping sit behind different gates, which means the
combination "overlay present, stamps absent" is not an edge case — it is what a
normal development run looks like. Anyone who launches the project without the
instrumentation flag gets a fully functional overlay pointed at a document that
carries no source information at all.

The naive behaviour is to arm, highlight nothing, and copy an empty reference.
That is worse than not shipping the overlay, because it teaches the operator
that the feature is broken. They try it twice, get nothing twice, and stop
reaching for it — and the capability is now dead while appearing to exist, which
is the most expensive way for a tool to fail.

## Three states, three appearances

The overlay has exactly three states and they must be visually distinguishable
at a glance:

| state | what it means | what it shows |
|---|---|---|
| disarmed | nothing is listening | nothing, or a minimal affordance |
| armed, instrumented | stamps present, resolution live | the highlight, the resolved location, the copy gesture |
| armed, uninstrumented | overlay running, no stamps in the document | the relaunch instruction, and no highlight |

Collapsing the second and third into one "armed" appearance is the whole defect
this technique exists to prevent
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
An operator must never have to guess which of "I clicked wrong", "this element
has no source" and "the build has no stamps" is happening.

## Detect the absence, cheaply

Detection is one query: ask the document whether *any* element carries the stamp
attribute. Zero means uninstrumented. It is a single selector against a live
document and costs nothing worth measuring.

Two timing rules matter more than the query does:

- **probe after first paint, not at module evaluation.** At evaluation time
  nothing is rendered and the answer is always zero, which would put a
  permanently wrong banner on a correctly instrumented build.
- **re-probe when arming.** A route that renders late, a lazily loaded area, or
  a screen the operator has just navigated to can flip the answer after the
  first probe. The state is a fact about the current document, and the cheapest
  moment to refresh it is the moment the operator asks for it.

## Name the treatment, not the diagnosis

"Source mapping is unavailable" is a diagnosis with no treatment. The operator
now has to find documentation they will not find, and the tool has converted its
own absence into their research task.

The message is **the exact command to relaunch with**, verbatim, copyable, in
the overlay itself. One line, the flag included, nothing to assemble. The
distance between "something is off" and "run this" is the distance between a
capability people use and a capability people abandoned, and it costs one string
that derives from the same flag declaration the build configuration uses.

Say the *why* in one clause alongside it — that stamping is opt-in so normal
runs and production builds pay nothing — because an operator who understands
that the absence is deliberate stops filing it as a bug.

## The partially stamped case is different

There is a second degradation and it needs a different answer. When a module was
excluded by the skip list, or an element was produced by a library that your
transform never saw, stamps exist elsewhere in the document — so the global
"instrumentation is off" banner would be a lie, and a lie in the direction that
sends the operator to relaunch a build that is already correct.

The honest response is **per resolution, not global**: this element has no
source of its own; here is the nearest stamped ancestor; the reference you copy
will point there. That is the same outward walk
[call-site-vs-implementation-resolution](./call-site-vs-implementation-resolution.md)
already performs, continued one rung further, plus one sentence of labelling so
the operator knows the answer is approximate. An approximate answer, labelled, is
useful; an approximate answer presented as exact is the thing that costs an agent
a wasted edit.

There is one more collision hiding in this branch, and it is easy to ship by
accident: **the idle prompt and the empty result must not render the same.** "Hover
something to begin" and "the thing you are hovering has no source" are both the
absence of a resolution, and a display that shows the invitation in both cases
tells an operator who *is* hovering that the tool has not noticed them. They move
the pointer, get the same message, and conclude the overlay is broken — which is
the identical dead end the whole technique exists to close, reintroduced one
level down. Idle, resolved, and resolved-to-nothing are three renderings.

## The overlay never takes the interface hostage

An inspection overlay that swallows interaction is a development tool that
breaks development. Four obligations, and they are not optional:

- **arming is explicit and deliberate.** Three designs work: a held modifier, a
  double-tap, or a two-key prefix sequence where the first key opens a short
  window and the second one arms. The sequence is the most comfortable of the
  three and the most dangerous if built carelessly, because its keys are
  ordinary printable characters — so it needs both halves of its guard: the
  window expires on its own after a couple of seconds, and the handler refuses
  to act whenever focus is in a text field or an editable region. Without the
  second guard the tool arms itself while somebody is typing a sentence, which
  is the fastest way to get an inspection tool banned from a codebase.
- **ordinary interaction keeps working while armed.** The primary click still
  activates the control underneath. Inspection binds to the gesture the
  application uses *least* — in a document interface that is usually the
  secondary click, whose default menu the overlay suppresses while armed — so a
  person can inspect a control and then use it without disarming, and the
  modifier variant rides on the same gesture rather than claiming another one.
- **the arm times out on its own.** An operator who arms the overlay and walks
  away must not return to an interface in a strange mode. A short timeout that
  disarms without ceremony is the correct default.
- **every exit path disarms.** Timeout, successful copy, escape, navigation,
  losing focus, unmount — each one names its teardown, and each listener,
  highlight node and timer created on arm is destroyed by it
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Teardown
  *restores* rather than resets: anything the overlay changed on the shared
  document — a cursor, a scroll lock, a class — is captured before it is
  overwritten and put back exactly, because an overlay that resets a property to
  its default has broken whatever else was setting it. Residue from an overlay is
  uniquely confusing because the operator does not think of the overlay as part
  of the application they are debugging.

## When not to use this

Nothing here applies to a build where instrumentation is unconditional — no
gate, no absence, no relaunch instruction, and a banner about a flag that does
not exist is noise. The technique is the price of the gate: the moment
instrumentation became optional, the state where it is off became a state the
tool has to speak about clearly.
