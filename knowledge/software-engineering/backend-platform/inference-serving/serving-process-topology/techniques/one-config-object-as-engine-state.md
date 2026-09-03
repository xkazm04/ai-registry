---
layer: technique
type: technique
subject: serving-process-topology
technique: one-config-object-as-engine-state
status: forged
laws: [one-authority-per-vocabulary, one-validation-door, unknown-is-not-a-value]
shared_with: []
use_when: [a new option requires editing constructors that do not read it, configuration is threaded through a deep hierarchy, deciding where configuration is validated and normalized, a component cannot be unit-tested without building the whole system]
---

# One config object as engine state

In a system whose components are stacked five or six deep — front end, engine,
executor, worker, runner, and whatever sits under it — configuration reaches the
bottom one of two ways. Either each layer accepts the parameters its children
need and passes them down, or one composite value is constructed at the top and
carried intact.

The second is correct for this shape, and the reason is not aesthetics. Under the
first, adding an option that only the deepest class reads is an edit to every
constructor between the top and that class, and the option's meaning ends up
distributed across a dozen signatures. Nobody can then answer "what is this
system configured to do" without reading all of them — which means nobody asks,
and the configuration becomes ungoverned.

## The shape

- **One composite type** at engine scope, itself composed of a small number of
  sub-configurations grouped by concern — the model, the cache, the parallelism,
  the scheduler, the device. Grouping matters: a flat bag of two hundred fields
  is the same failure with a different silhouette, because it has no place to put
  an invariant that spans two fields of one concern.
- **Constructed and validated once**, at the outermost edge, from whatever the
  operator actually supplied.
- **Passed whole** to every layer that needs anything. A layer reads the fields it
  reads and forwards the object; it does not unpack and re-thread.
- **Treated as engine-level state, not as arguments.** Once construction is over,
  it is the frozen description of what this engine is. Layers read it; they do not
  mutate it, and a layer that wants to would be quietly changing an invariant
  something upstream already validated against.

Adding a feature then touches two places: the configuration type, and the one
class that reads the new field.

## Validation and normalization live at construction

This is the property that pays for the design, and it is easy to lose.

Configuration arrives underspecified: values absent, values in operator units
that must be converted, values whose legal range depends on another value, values
that must be inferred from the environment. If that resolution happens where the
value is *read*, it happens several times, differently, and the copies drift the
first time the rule changes
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

So the constructor does all of it, once — the single door every configuration
passes through
([one-validation-door](../../../../_laws.md#one-validation-door)):

- **Cross-field invariants.** The combinations that cannot work are rejected at
  construction, by name, with the two fields identified. A deep component
  discovering an impossible combination halfway through startup produces an error
  nobody can map back to a setting.
- **Inference of absent values.** Where a default is derived from the environment
  or from another field, it is derived here and written into the object, so every
  reader sees the resolved value and no reader re-derives it.
- **Normalization to internal units.** Operator-facing units convert exactly
  once.
- **Resolved, not absent.** After construction there should be no field whose
  absence a reader has to interpret. An unset value that each reader fills in with
  its own idea of a default is
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) with a
  configuration schema: two components silently disagree about what the system is
  doing, and neither is wrong on its own terms.

## The second reason, which is usually the stronger one: uniformity

Extensibility is the reason this design is normally justified by, and it is the
weaker half. The stronger half appears when the hierarchy's lowest layer has many
interchangeable implementations — dozens or hundreds of variants of the same
role, each with its own initialization needs, several of them contributed from
outside.

If each variant takes the parameters it happens to need, the layer that
constructs them must know *which* variant it is constructing in order to call it,
and the only general way to do that is inspection: look at the signature, match
parameter names, build the argument list. That code is intricate, silently wrong
at the edges, and it is a permanent tax on adding a variant.

Give every variant the identical constructor — one configuration object, plus a
single positional-free hint identifying *where in the composition this instance
sits* — and the constructing layer no longer knows or cares which variant it is
building. Composition becomes possible for the same reason: an assembly built
from two sub-variants can construct both without special-casing either, passing
each a different placement hint so a variant can initialize itself differently
depending on the role it is filling.

The placement hint is worth calling out because it is the piece designers leave
out and then need. It carries the instance's path within the composed whole, and
it is what lets configuration that is *non-uniform across the composition* —
different precision for one sub-part, different placement policy for another —
be resolved by the variant itself rather than by the caller.

## Make the constructor keyword-only

A composite this large will gain, lose and reorder fields. A positional
constructor makes every one of those a silent breakage for outside callers: the
arguments still bind, to the wrong parameters, and the program runs with a
configuration nobody intended.

Keyword-only construction converts that entire class of failure into a loud error
at the call site, naming the parameter. The cost is verbosity at construction —
paid once, by a small number of call sites — against a category of bug that is
otherwise found in production by its consequences.

The same reasoning extends to removals: prefer a removed field to raise on an
unexpected keyword rather than be silently accepted and ignored.

**Publish the adapter, not just the requirement.** Where the uniform constructor
is imposed on implementations that live outside the tree — contributed variants,
plugins, downstream forks — the migration note must ship the shim: a subclass
that takes the new uniform signature, pulls each old parameter out of the
configuration object, and forwards to the old constructor, together with the
version test that selects between them. A breaking change announced with a
rationale and no adapter is a breaking change whose cost was estimated by the
person not paying it. Ten lines of published shim converts an ecosystem-wide
rewrite into a copy-paste, and it is the same ten lines for every implementor,
which is exactly why the maintainer should write them once.

## The cost, stated up front

This design has one serious drawback and it must be written down beside the
design, not discovered by whoever first tries to write a test:

**No component can be constructed without a whole configuration object.** A unit
test for a class that reads three fields must now build the entire engine's
configuration, and the natural consequence is that the test is not written.

The mitigation is a first-class part of the technique, not an afterthought: ship
a **factory that produces a complete, valid, everything-defaulted configuration**
which a caller overrides field by field. It has to live beside the type, be
maintained as the type changes, and be usable from a test with no arguments. A
configuration design of this shape without that factory has traded one real
problem for a worse one, because the layer that suffers is the test suite and the
damage is invisible until the code is hard to change.

One dismissal of this cost is common and should be refused: *most of our tests
are end-to-end anyway, so this is not a big problem.* It is an accurate
description of the suite and a bad argument about the design, because the
causation runs the other way — a component that cannot be constructed in
isolation is a component whose tests migrate upward into the end-to-end suite,
where they are slower, flakier, and unable to say which component was wrong. The
observation that the suite is mostly end-to-end is evidence that the cost is
already being paid, not evidence that it is small.

Two smaller costs, worth naming so they are not mistaken for defects:

- **The object appears in signatures that do not use it.** That is the trade
  being made deliberately: a wide, stable dependency instead of a narrow,
  churning one.
- **It is a large surface to keep documented.** The mitigation is that it is *one*
  surface, which can carry generated documentation, whereas a dozen constructor
  signatures cannot.

## What this is not permission to do

- **Not a global.** It is constructed at a known place and passed explicitly.
  Reaching it from a module-level singleton reintroduces the exact
  untraceability the design removes, and makes two engines in one address space
  impossible.
- **Not mutable state.** It is not a place to stash runtime values. The moment a
  component writes back into it, it stops being a description of the deployment
  and becomes shared mutable state with an inviting name.
- **Not an excuse for a flat bag.** Grouping by concern is what keeps the
  invariants checkable and the documentation navigable.

## When not to use this

- **A shallow hierarchy.** With two layers, threading parameters is clearer, and
  the composite is ceremony.
- **A stable option set.** The design pays for itself against *churn*. Where
  options change once a year, the cost of threading is small and the coupling
  cost of a wide object is not obviously worth paying.
- **Components intended for independent reuse.** A class published for use
  outside this engine should take what it needs. Requiring an engine-wide
  configuration to use a utility exports the coupling to people who get none of
  the benefit.
