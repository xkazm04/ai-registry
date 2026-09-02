---
layer: technique
type: technique
subject: declared-process-graph
technique: composite-expansion-contract
status: forged
laws:
  - identity-survives-reuse
  - one-validation-door
shared_with: []
use_when: [factoring a repeated sub-topology into a reusable body, wiring an outer graph to a composite's ports, deciding whether a check belongs in the expander or the validator]
---

# The composite expansion contract

A topology document that cannot be composed is copied, and a copied topology
diverges. The remedy is a **composite node**: a node whose body is another
document, which declares the ports it exposes to the outer graph and hides
everything else. Expansion replaces the composite with its inner nodes at load
time, before validation, and the contract below is what keeps that rewrite from
being a hole in every check that runs after it.

## The four terms of the contract

**A composite declares its ports.** The body states which of its inner inputs and
outputs are visible from outside, by exposed name. The outer graph wires to those
names and to nothing else. Without a declared surface, every inner node is
addressable from outside, the body has no encapsulation, and changing an internal
node's name is a breaking change to every consumer — which is the property that
made composition worth having. The surface is two-sided: inner nodes refer to the
body's own inputs through a **reserved source token**, a name expansion replaces
with whatever the outer graph wired to that port. Reserving that token is what
lets a body be written against its ports without knowing any caller, and it is
also why the token must be refused as an ordinary node identifier.

**Inner identifiers are prefixed with the composite's identifier.** After
expansion every node in the graph has one flat, unique name, and the same body
instantiated twice produces two disjoint sets of nodes
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). The
prefix is applied mechanically to node names, to every wiring reference inside the
body, and to anything else that names a node — placement, policy overrides,
logging targets. A prefix scheme that covers node declarations but misses wiring
references produces a graph that expands cleanly and refers to nodes that no
longer exist under those names. Reserve the joining character so an author cannot
hand-write a name that collides with a generated one.

**A composite carries no source fields of its own.** A composite node names a
body; it is not also a program to launch, an operator to host, or a bridge to
configure. Permitting both makes the node's kind ambiguous, and the ambiguity
resolves in favour of whichever branch the code checks first — which in practice
means the source fields are parsed and then thrown away when expansion replaces
the node. This is the single most important refusal in the technique, and it has
to be stated as a rule about *kinds* rather than a rule about fields: a node
that references a sub-topology cannot simultaneously be a source-bearing node.

The rule that decides the remaining fields is not "does the composite consume
this" — it consumes nothing, it is replaced — but **does expansion propagate it
inward**. Environment, placement intent, build instructions and substituted
parameters are legal on a composite precisely because expansion pushes them down
onto every inner node; anything expansion would delete is illegal for exactly the
same reason. State the propagating set explicitly, next to the whitelist, because
the two are one decision written in two places and they drift the moment a new
propagating field is added.

**Exactly one inner producer per declared output.** An exposed output resolves to
one inner node's output. Zero producers means the outer graph wires to a name
nothing writes — a channel that will never carry, discovered at runtime as a
consumer that never wakes. Two producers means the outer consumer receives an
interleaving of two streams that no declaration describes, and which one arrives
first is a scheduling accident. Both are refusals at expansion, named by exposed
port. Inputs are the mirror image and are deliberately *not* symmetric: an
exposed input may legitimately fan out to several inner consumers, because
fan-out on a channel is the normal case and fan-in on one producer name is not.

## Where the checks live, and why it matters

The main validator runs on the **expanded** form. That is correct: the expanded
form is what the runtime will execute, and validating anything else means
validating something that will not run. But it has a consequence that is easy to
miss and expensive to discover — **every check whose evidence expansion destroys
must live inside the expander.**

A composite node that also carried source fields is exactly such a check. By the
time the validator sees the graph, the composite node is gone, replaced by the
inner nodes; the fields the author wrote on it were dropped by the rewrite, and
the ordinary per-kind discriminator never runs on that node at all, because that
node no longer exists. A validator that is otherwise strict will pass the document
without complaint. The general form of the rule: **the door still covers the
document, but part of the door is inside the rewrite**
([one-validation-door](../../../../_laws.md#one-validation-door)). Concretely,
these belong to the expander:

- legality of fields on the composite node itself, which expansion deletes;
- the port surface — exposed names, producer counts, references from the outer
  graph to names the body does not expose;
- anything about the body *as a document* — its shape, its size, its origin —
  since after expansion it is indistinguishable from the outer graph;
- the recursion bounds, which have no meaning once expansion has finished.

Everything else belongs to the validator, and is written once, against the flat
form, with no knowledge that composites exist. That split is what keeps the
validator from growing a parallel set of composite-aware checks — the state in
which each check exists twice and the two copies disagree about the corner cases.

## Decision rules

- When a refusal names a node, it names the **authored** identifier, not the
  prefixed one. A message about a generated name sends the author looking through
  a document that does not contain it; carry the composite path and the inner
  name, and let the author read their own document.
- When a body needs to vary between instantiations, pass parameters explicitly
  through the composite's declaration and substitute during expansion. Do not let
  the body read ambient state from the outer document; a body whose meaning
  depends on where it was included is not reusable, it is a macro with action at a
  distance.
- When an exposed port has no consumer in the outer graph, that is legal and
  silent. Encapsulation means a body may expose more than any single caller uses,
  and the graph-level rule that an unused output is fine holds here too.
- When two bodies are included that expose the same names, nothing collides,
  because prefixing already made them distinct. If prefixing did not make them
  distinct, the prefix scheme is incomplete — fix it there, not with a
  disambiguation rule at the call site. Assert the property rather than assuming
  it: one uniqueness sweep over the flattened identifiers, after expansion,
  catches a prefix bug and a hand-written outer node colliding with a generated
  inner one in the same pass.
- When expansion fails, fail the whole load with the composite path in the
  message. A partially expanded document must never reach the validator; it will
  produce a second, confusing set of errors about nodes that only exist because
  the first error happened.

## When not to use this

A topology with no repetition does not need composites, and adding them to one
buys an extra rewrite stage between the author's document and the errors they
read. Composition earns its cost at the second instantiation, not the first.

Do not use a composite to express *conditional* topology — a body included only
under some deployment. That is a different mechanism (a document produced by a
generator, or a document with a declared variant) and forcing it through
expansion produces bodies whose port surface changes with an ambient condition,
which defeats the one property the surface exists to provide.
