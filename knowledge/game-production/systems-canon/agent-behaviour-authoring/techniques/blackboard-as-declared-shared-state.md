---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: blackboard-as-declared-shared-state
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [designing the interface between perception and decision, shared agent state has grown into an untyped grab bag, two behaviours disagree about what a key means, a generator must emit behaviour against a fixed vocabulary]
shared_with: []
---

# Blackboard as declared shared state

The named concern: treat the agent's shared working memory as a **declared schema with an
owner per key** — not as a bag of variables that any behaviour may add to. The blackboard is
the interface across which perception hands facts to decision and across which a group
coordinates; an interface with no declaration is a global variable table, and it fails the
way global variable tables have always failed, only later and in a build.

The pattern earns its place for one reason: it decouples the producer of a fact from its
consumer. A sense writes the last known position; six behaviours read it; none of them knows
which sense wrote it or when it changed. That decoupling is what makes an agent's behaviour
composable at all. The cost of the decoupling is that nothing forces agreement about what a
key means, and the whole discipline below is about paying that cost deliberately.

## The declaration

Every key carries six things, and the declaration is an artifact that exists before any
behaviour references the key.

- **Name** — from a controlled vocabulary shared across the roster, not invented per agent.
- **Type** — including whether the key is a reference to an entity, a position, a scalar, or
  an enumerated intent. An untyped key is the defect in embryo.
- **Unit and basis** — a scalar key without them is not information
  ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
  *Threat* is not a unit; *threat, 0–1, normalized against the agent class reference target*
  is.
- **Scope** — per agent, per group, or global. This is the field most often left implicit and
  it is the one that decides whether a write is a private note or a broadcast.
- **Owner** — the single component permitted to write it
  ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). Everything
  else reads, or routes its write through the owner.
- **Lifetime** — when the key is cleared, and by what. A key with no stated lifetime is a key
  that is never cleared, which is how an agent ends a fight still believing it is in one.

## Unset is a value

A key that has never been written is **unset**, and unset must be a state the decision layer
can test for, distinct from zero, false, empty and null-as-default
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). This is the same
three-valued discipline the knowledge model needs, expressed at the storage layer, and the
two must agree: a sense that has not fired writes nothing, and a decision that reads the key
must be able to tell that from a sense that fired and reported zero.

The characteristic failure is a numeric key defaulting to zero. An agent whose *distance to
target* key defaults to zero believes, before any sense has run, that its target is on top of
it — and the resulting behaviour is not an obviously broken agent, it is an agent that opens
every encounter with one wrong decision. Untyped defaults produce bugs of exactly this shape:
plausible, brief and hard to attribute.

## Scope is a design decision, not a location

Three scopes, and they are not interchangeable.

**Per-agent** state is the agent's own working memory: its current target, its last known
position for that target, its chosen intent, its dwell timer. Most keys belong here, and the
default should be here, because a key promoted to a wider scope can never be demoted without
auditing every reader.

**Per-group** state is the coordination surface: claims, roles, a shared alert level, the
group's last known contact. It is small on purpose. Every key here is a key two agents can
disagree about, and the owner field is doing real work.

**Global** state is the level's state and the director's: alert phase, active objective, time
of day. It is smaller still, and it is the scope where an unowned key does the most damage,
because every agent in the level reads it.

The rule that keeps this from rotting: **a key is authored at the narrowest scope that works,
and promoting a key is a reviewed change with a stated reason**, because promotion converts a
private assumption into a contract without any of the parties being told.

## Decision rules

- **When a behaviour needs a value, declare the key before writing the behaviour.** A key
  introduced by the first behaviour that needed it acquires that behaviour's private meaning,
  and the second consumer inherits it without knowing.
- **When two components must write one key, one of them is wrong.** Either the key is really
  two keys with different meanings, or one component is the owner and the other must go
  through it. A key with two writers has no defined value at any instant and the drift is
  invisible until it is load-bearing.
- **When a group's coordination needs a value, put it in group scope with an owner and a
  lease**, never in an agent's own memory replicated by convention. Replicated-by-convention
  state is the mechanism by which four agents each believe they alone hold the flank.
- **Clear on transition, not on convenience.** State the clearing event with the key —
  leaving combat clears the combat keys, losing a target clears the target keys — and make
  the clear a declared part of the key rather than a line in whichever behaviour happened to
  notice.
- **Keep the vocabulary closed for anything a generator emits into.** A generation pipeline
  handed free-form key names produces a roster where forty agents share no vocabulary, so
  nothing compares across them, no shared tooling can read them, and every agent must be
  reviewed alone.
- **Never let the blackboard carry an event.** It holds state. A one-frame flag written by one
  behaviour and expected to be seen by another before it is cleared is a race dressed as a
  variable, and it will resolve differently on a machine with a different tick order.

## When not to use this

- **A single-decision agent.** A character with one intent and no memory needs no shared
  memory. Adding a blackboard so the roster is uniform adds a declaration surface and an
  indirection for nothing.
- **As a messaging system.** Shared state that both parties poll is not the same object as a
  message queue, and using it as one is where the one-frame-flag race comes from. Where an
  agent must be *told* something, the mechanism is a message with a delivery guarantee, and
  it belongs beside the blackboard rather than inside it.
- **As a debugging log.** Keys added so a value can be inspected outlive the debugging
  session, acquire readers, and become contract. Inspection belongs to the trace layer, which
  is designed to be read afterwards and is not part of the agent's decision domain.
- **For anything with a single authoritative home elsewhere.** A combatant's remaining health
  has one owner in the runtime; copying it onto the blackboard for convenience creates a
  second version of a quantity that already has an authority, and the copy will be the stale
  one at the moment it matters.
