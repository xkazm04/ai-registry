---
layer: technique
type: technique
subject: agent-addressable-ui
technique: framework-internals-independence
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [tempted to read a rendering framework's debug metadata, a click-to-source tool stopped working after a major upgrade, choosing between reading a fact and producing it]
---

# Framework-internals independence

There is a shortcut to addressability that requires no build step, and it is
the first thing every implementation tries. Rendering frameworks keep debug
bookkeeping on their internal nodes during development, that bookkeeping
historically included the source location of the expression that created the
node, and a handle from a rendered element back into the internal tree is
usually reachable from the element itself. Follow the handle, read the field,
and you have the file and the line in about thirty lines of code with nothing
to configure.

This technique is the argument for not doing that, and for what to rest on
instead. It is not a purity argument. It is a maintenance-cost argument with a
known payment schedule.

## Private surface is removed on somebody else's calendar

Debug bookkeeping is internal implementation. It carries no compatibility
promise, appears in no documentation you are entitled to rely on, and is
therefore removed the moment it stops paying for itself inside the framework —
with no deprecation window, because there is nothing to deprecate. This is not
hypothetical: a major release of a widely used rendering framework dropped its
debug-source field outright, and every click-to-source tool in that ecosystem
broke in the same week, with the maintainers' own tooling migrating to a
different mechanism that the outside tools could not reach.

The rest of the failure surface is just as expensive and quieter:

- **it is absent in whole rendering modes.** Components rendered on the server
  or streamed in never pass through the client-side path that would have
  populated the field, so exactly the parts of an application that are hardest
  to locate by hand are the parts the shortcut cannot locate.
- **it differs per renderer.** The same framework driving a document, a native
  surface and a test environment does not keep the same bookkeeping in each.
- **it is stripped from anything but the framework's own development build**,
  which means the tool's behaviour depends on a build mode the tool did not set
  and cannot verify.
- **its handle is a name you are guessing at.** The property that leads from a
  rendered node into the internal tree is itself private, and is conventionally
  prefixed to signal exactly that.

## The failure is silent, which is the real cost

If reading internals failed loudly the trade would still be defensible — you
would find out on the upgrade, in the build, with a stack to read. It does not.
The property is missing, the read yields nothing, the walk finds no source, and
the tool renders its empty state. That empty state is indistinguishable from an
uninstrumented run, from a click on an unstamped element, and from a genuine
absence of information
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The tool does not break, it *degrades into looking broken*, and it does so at
the exact moment — a framework major upgrade — when everyone is busy attributing
oddities to the upgrade in general.

Any design that depends on private surface owes an explicit presence assertion:
prove the field is there before trusting its absence to mean anything. Almost
nobody writes that assertion, which is a strong practical argument for not
creating the dependency in the first place.

## Rest on specified primitives instead

The independent foundation is two primitives, both of which are specified by
parties with a compatibility obligation:

1. **an attribute on an element in the rendered document** — produced by your
   own build step, named by you, and carrying exactly what you decided it
   carries;
2. **traversal of the ancestor chain** — a document-model operation that has
   worked identically for two decades and will keep working.

Nothing in that resolution path knows the framework's name, its version, its
render mode, or whether a component was hydrated. The interface's shape at
runtime is the only input, and the interface's shape at runtime is precisely
what the person is pointing at.

The acceptance test is one sentence: **point the resolver at an interface built
with a different framework, or with none, and it must still work.** If it does
not, some framework knowledge leaked into the resolver and will expire. That
test is worth running as a thought experiment on every function in the
resolution path.

## The general rule: produce the fact, do not read it

The transferable form of this argument reaches well past addressability:

> When a private debug surface is the only source of a fact you need, produce
> the fact yourself at build time rather than read it from someone's internals.

Producing costs one transform, written once, whose inputs are the source text
and whose output you control. Reading costs a rewrite per major release of a
dependency you do not steer, forever, and each rewrite arrives as an urgent
regression rather than as planned work. The asymmetry is not close, and it gets
wider the longer the tool lives.

## When reading internals is acceptable

The trade flips when **both** of these hold: the fact is genuinely unavailable
any other way, and a wrong or missing answer is cheap. A one-off debugging
script, a local experiment, a diagnostic that a human reads and sanity-checks —
all fine, because the cost of the field vanishing is that the script stops
working and somebody shrugs.

Addressability satisfies neither condition. The fact is available another way,
by construction, since the build already had it; and a missing answer is
expensive, because it lands as a person believing their tool is broken and
returning to describing screens in prose. When a capability is meant to be part
of the daily loop, it does not get to rest on surface that will be removed
without warning.
