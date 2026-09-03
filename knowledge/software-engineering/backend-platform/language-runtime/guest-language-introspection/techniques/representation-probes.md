---
layer: technique
type: technique
subject: guest-language-introspection
technique: representation-probes
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [a test must assert that two objects share a hidden class or that an array is still dense, an engine claim about string allocation or encoding needs an executable check, a probe's answer is suspected of changing the thing it reports on]
---

# Representation probes

A representation probe answers a question the guest language cannot ask: not "what is
the value" but "how is the value stored". The three families every engine ends up
needing are the object's shape — its identity, its kind, and whether two objects share
one — the array's element storage — dense of which width, or sparse — and the string's
storage — which encoding, whether it is a literal the engine interned, whether it is
still an unflattened concatenation. Each is a claim the engine's documentation makes
and its optimizations depend on, and each is invisible from the language without a
probe.

## A probe is a pure query

The rule that makes a probe worth having: **calling it does not change the answer**.
That sounds too obvious to write down, and it is violated constantly, because the
easiest way to compute most of these answers is to normalize the value first.

Asking a rope for its encoding by flattening it and inspecting the flat buffer reports
correctly on a string that no longer exists as a rope. Asking whether an object is in
its dictionary-mode representation by walking its properties through the ordinary
lookup path can trigger the transition the probe was meant to detect. Asking an array's
storage kind by counting its elements through the generic element accessor can promote
it. In each case the probe returns a true statement about the post-probe value, the
test asserting "this stayed X" passes on every run, and the regression it was written
to catch is invisible — the check reads a proxy that it manufactured, and passes
precisely when the proxy diverges from the target.

So a probe reads the representation directly: the tag on the string header, the kind
field on the element storage, the shape pointer on the object. It never goes through
the language-level operation that would observe the same value, because those
operations are where the transitions live. Where reading the representation directly
is impossible without a side effect, the probe does not exist, and the documentation
says why rather than shipping a probe that lies.

The naming reinforces the rule. Probes are nouns and predicates — *type*, *id*, *same*,
*encoding*, *isDense* — never verbs. A member with a verb's name on this surface is a
state change, and a reader should be able to classify every call in a test as observe
or act from the name alone.

## Shape: identity, kind, sameness

The shape family answers three questions and the third is the one to get right.

*What kind of shape does this object have* — shared (the transition-tree kind that
objects built by the same property sequence converge on) or unique (the per-object kind
an object falls into after a delete, a large property count, or a prototype change).
The answer is a string from a closed vocabulary that the engine defines once and the
probe reads from, because a test that compares against the string `"shared"` is a test
that fails silently when the engine renames the kind.

*What is this object's shape's identity* — a number that is stable for the life of the
shape and distinct from every other live shape's. Under a non-moving collector the
address serves; under a moving collector it does not, and the engine mints an id at
shape creation or the probe does not offer identity at all. An id derived from an
address that the collector may reuse compares one shape with a dead one's successor.

*Do these two objects share a shape* — the sameness question, and the reason the id
exists. Offer it as an engine-side comparison taking both objects, not only as two id
reads the test compares, because the engine-side form is correct under every collector
and the two-read form is correct only under a non-moving one. Tests use the sameness
member; the id is for printing.

The documented claim these probes make executable: two objects built by the same
sequence of property additions share a shape; add a property in a different order and
they do not; delete a property and the object falls to a unique shape. Three probes,
one script, and the script is the engine's documentation of hidden classes.

## Elements: storage kind

An array's element storage moves through a lattice of representations — packed small
integers, packed doubles, packed values, and the sparse fallback — widening on a store
the current kind cannot hold and never narrowing. The probe returns the current kind as
one string from the same closed vocabulary the engine's element code uses. Its use in
a test is a transition assertion: store a value, read the kind, and the kind is what
the documentation says the store should have produced.

The pure-query rule bites hardest here, because the natural way to inspect an array is
to iterate it, and iteration through the generic path can be a widening store's
sibling. The probe reads the storage tag and nothing else.

## Strings: storage and encoding

The string family reports three facts. *Encoding*: which of the engine's internal
widths the string uses — the narrow one-byte form or the wide form — because a claim
that a narrow literal stays narrow through an operation is a memory claim the engine's
users care about. *Static or interned*: whether the string is one of the engine's
preallocated well-known strings or an interned literal rather than a runtime
allocation, which is how a test asserts that a property name lookup did not allocate.
*Rope or flat*: whether a concatenation is still deferred, which is how a test asserts
that building a string in a loop did not quadratically copy.

Each is read from the header. The encoding probe must never flatten; the rope probe
must never flatten; the interning probe must never intern. The temptation to flatten is
strongest in the encoding probe, because a rope's encoding is a function of its
children's — and the engine either stores the derived encoding on the rope node at
construction, in which case the probe reads it, or it does not, in which case the
probe walks the children without materializing, and the walk is the probe's whole
implementation.

## Descriptions, not handles

Every probe returns a description — a string from a closed set, a boolean, a stable
number — and never a handle to the internal structure. A handle leaks the engine's
memory model into the guest, invites the test to compare it across a collection, and
becomes the accidental API the debug global's flag exists to prevent. When a test
needs to relate two internals, the relation is a probe — *same shape* — and the
comparison happens in the engine.

## When not to use it

A probe is for asserting on representation. When the claim is about behaviour — the
value of an expression, the order of effects, what was thrown — the language already
has the assertion and a probe is a slower way to write it. When the claim is a
performance figure — this stayed under a millisecond, that allocated fewer bytes — the
probe is the wrong instrument, because it reports a kind, not a cost; the benchmark
harness reports costs, and the probe's job is to make the benchmark unnecessary for
the representation half of the claim.
