---
layer: technique
type: technique
subject: agent-host-experience
technique: portable-view-spec
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [choosing between a declarative view spec and an embedded app view for another host, a request to support an interop UI format, the in-app component vocabulary and an outside spec drifting apart]
---

# Portable view spec

A product that shows composed views to its users eventually wants those views somewhere
else: in an agent host, in a partner's shell, in a multi-agent surface where several
agents feed one screen. Two families of answer exist, and they trade the same two
things in opposite directions.

## Declarative spec or embedded view

- **A declarative view spec** is data: a flat, streamable description of surfaces,
  components and data bindings that the *host* renders with its own approved components.
  It looks native in every host, it carries no code, and the host keeps rendering
  authority — so it is the safer of the two and the consistent one. Its ceiling is the
  host's catalog: what the host has no component for, the spec cannot say.
- **An embedded app view** is code the product wrote, run in a sandbox inside the host
  ([in-host-views](./in-host-views.md)). It has the product's full fidelity and any
  interaction it can build — at the cost of looking like a different application inside
  the conversation, loading later than the text around it, and running code the host
  did not write.

The rule: **use a declarative spec when the host owns the design system** and the agent
chooses interface at run time — the product's own surfaces, or several agents feeding
one shell. **Use an embedded view when the product owns a complex, stateful module**
that must keep full fidelity in third-party hosts. The two combine: a declarative
surface can contain an embedded module, and an embedded view can render a declarative
spec inside itself; the combination is chosen per surface, not per product.

## One vocabulary, projected outward

A product with a closed in-app component vocabulary already has the hard part: a
registry of kinds, a validator, a renderer, and an emitter that is told what it may
emit. Supporting an outside spec format does not create a second vocabulary. **The
in-app registry remains the single authority**, and the outside format is a projection
of it at one boundary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):

- **Projection is a function** from validated in-app specs to the outside format,
  written once, tested against the registry's own fixtures, and run after validation —
  never a second emitter the model writes to directly.
- **Projection is lossy and says so.** A kind with no counterpart in the outside format
  degrades to its text alternative or is dropped, and the projection reports what it
  dropped the way the in-app validator does. The vocabulary's design is
  [node-vocabulary-design](../../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/node-vocabulary-design.md);
  keeping emitter and registry in step is
  [emitter-registry-sync](../../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/emitter-registry-sync.md).
- **Adding a kind happens in one place.** If adding a component to the product requires
  editing the outside mapping by hand to stay correct, the mapping is a second authority
  and will drift; make the projection fail closed on a kind it does not know rather than
  silently omit it.

The reverse direction — accepting an outside spec into the product's own surfaces — is
the same rule run backwards: the inbound spec is projected *into* the in-app vocabulary
at the door and validated there like any model-emitted spec, never rendered through a
second renderer.

## The trust trade, stated

A declarative spec is data, and data is safer than code, but it is not trusted. The
spec's author is an agent whose context may have held outside content, so the receiving
renderer validates it against its own catalog, and a catalog or context forwarded by a
client is model input, not configuration. An embedded view moves the trust question to
the sandbox and the declared origins. Neither family lets the product skip its own
consent wiring: an action in either is a proposal, armed only through the product's
consent gate.

## Never design around a pre-stable format

Interop view formats are young. Several are in public preview, below their first stable
release, with action round-trips still being added; and a 2026 survey for this subject
found no evidence that a mainstream third-party chat host renders declarative specs from
arbitrary servers — an absence, not a confirmed negative. That is a reason to
**project to** such a format, never to **design around** it: the in-app vocabulary is
shaped by the product's own surfaces, and the projection absorbs the outside format's
changes. A product whose internal vocabulary was bent to match a preview format inherits
every breaking change of that format and none of its future.

## Counter-cases

- **No in-app vocabulary yet.** A product with no closed component set should build one
  for its own surfaces first; an outside format adopted as the internal one is the
  design-around failure in its purest form.
- **One rich module, many hosts.** An interactive planner, editor or canvas that needs
  every pixel is an embedded view; projecting it to a catalog-bounded spec flattens the
  thing that made it worth showing.
- **The host renders only text.** Neither format reaches it; the text result does.

## When not to use this

- When no outside surface renders views — project nothing until a named consumer exists.
- When the composed view is the product's own inside tier and never leaves it; that is
  [model-composed-workspace](../../model-composed-workspace/model-composed-workspace.md).
