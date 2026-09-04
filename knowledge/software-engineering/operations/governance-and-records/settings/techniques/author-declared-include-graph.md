---
layer: technique
type: technique
subject: settings
technique: author-declared-include-graph
status: forged
laws: [unknown-is-not-a-value, derivation-names-recomputation, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a configuration file names the files it inherits from, a shared config fragment resolves a relative path against the wrong directory, deciding where an included file's own relative paths are rooted, an entry's origin cannot be recovered after the merge, a config include chain can loop]
---

# The author-declared include graph

[cross-source-precedence-chain](./cross-source-precedence-chain.md) resolves a
value across sources **the platform declared**: an explicit path, an environment
variable, an injected ambient identity, a compiled-in default. The chain is
finite, named in the resolver, and known before the process starts.

A different shape appears the moment a configuration file is allowed to name
what it inherits from. The chain is now **authored inside the artifact**, and
three of that technique's assumptions fall at once: the resolver cannot
enumerate the sources in advance, the graph can contain a cycle, and the sources
live in directories the resolver did not choose. Everything below is the
consequence.

The shape is worth having. It is what lets an organization keep one shared
configuration fragment and have twelve repositories extend it, each overriding
the three entries it cares about, rather than twelve copies that drift. But it
is a graph the author controls, and a resolver written for a chain it controls
will get it wrong in a specific and quiet way.

## Every link declares its own root

The failure is a shared fragment that references a file beside itself, and
resolves it beside the *including* document instead. It manifests as a fragment
that works in the repository it was written in and silently reads a different
file — or nothing — in every repository that adopts it. The path was valid; the
root was wrong.

There is no single correct root, which is why this cannot be fixed by choosing
one. A fragment referencing a script that ships next to it wants **its own
directory**. A fragment referencing a repository-wide artifact wants the
**version-control root**. A fragment in one package of a multi-package
repository referencing a sibling package wants the **workspace root**, and one
referencing its own package's assets wants the **package root**. Every one of
those is the right answer for some fragment, and the fragment is the only party
that knows which.

So the root is **a declared property of the link, not a policy of the
resolver**: a closed enumeration of named roots, chosen per include, defaulting
to the including document's own directory because that is the answer that is
correct when the fragment is local and the author has not thought about it.
Name the roots ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
an unnamed root is a rule in the resolver that the author cannot see and cannot
override.

One detail decides whether the enumeration is usable: **an unrecognized root
name must not silently become the default.** A reader that warns and falls back
has converted a typo into the local-directory answer, which is the answer most
likely to appear correct in the repository where the fragment was written and
wrong everywhere else — the same failure the feature exists to prevent, now with
a warning nobody reads. Refuse it.

## Origin travels out of band, or it does not travel

After the merge, an entry's origin is gone. The merged configuration is one
object, and nothing in it says which file each entry came from — but the entries
need that fact at execution time, because a relative path inside an inherited
entry has to resolve against the file that declared it, not against the file
that inherited it. The origin must survive the merge.

[inherited-default-override](./inherited-default-override.md) states the rule
this obeys, for a different provenance question — *did the user decide this, or
did we derive it* — and its formulation is the load-bearing one here too:
provenance **travels beside the values**, because it cannot be recovered from
them ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

The tempting shortcut is to travel it *inside* the values instead: stamp the
origin into each entry's own key-value payload, where the merge machinery
already carries it for free. It works, and the cost arrives about two releases
later, in a shape worth naming because it is not obvious in advance.

Once provenance shares a channel with the author's data, **the merge can no
longer tell an entry that declared nothing from an entry that declared only
provenance.** The two are structurally identical, and they must be treated
differently — an entry with no author-supplied values should inherit its
parent's; an entry the resolver stamped should not have that stamp count as a
declaration that suppresses inheritance. The only available discriminator is the
payload's shape: *exactly these two injected keys and nothing else*. That test
appears at every point where inheritance is decided, it is invisible to anyone
reading either site in isolation, and adding a third injected key breaks all of
them silently. The channel that looked free was borrowing from the author's
namespace, and the interest is a sentinel-shaped equality test maintained by
hand.

Carry the origin in a structure the author cannot write and the merge does not
merge: a field on the entry's own record, or a side table keyed by entry
identity. One channel per fact.

## Cycles, absence, and breakage

Three rules the platform-declared chain never needed:

- **The graph can cycle, so the resolver detects it.** Track the visit path, and
  when a document is re-entered, refuse with the path in the message. The path
  is the diagnostic — a cycle reported as "cycle detected" without naming the
  loop leaves the author reading four files to find a triangle.
- **An optional include that is absent is a skip; one that is present and
  unreadable is a stop.** This is
  [cross-source-precedence-chain](./cross-source-precedence-chain.md)'s rule
  arriving unchanged, and it is worth restating because the author-declared
  graph adds a way to get it wrong: marking an include optional means *this file
  may not exist*, never *this file may be broken*. A malformed optional fragment
  that resolves to an empty contribution is
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  at the include boundary.
- **A list of includes is an ordered merge, not a set.** When a document names
  several parents, later ones win over earlier ones and the order is the
  contract. State it in the documentation with an example, because half of the
  authors will assume the opposite and none of them will find out until two
  fragments set the same entry.

## Boundary

This technique is about a graph the *author* declares inside the artifact. Where
the sources are declared by the platform and known before the process starts,
[cross-source-precedence-chain](./cross-source-precedence-chain.md) is the
technique, and its named-order discipline is stronger than anything available
here — a resolver that knows its sources can name them all in a diagnostic,
which one walking an author's graph can only do after the walk.

The two compose in one direction: the platform's chain selects the entry
document, the author's graph expands from it. A design that lets the author's
graph reach back and reorder the platform's chain has given a configuration file
authority over which configuration file is authoritative.

## Decision rules

- If a config file may name its parents, make the root of each link a declared
  choice from a named, closed set, defaulting to the including document's
  directory.
- Refuse an unrecognized root name. Do not warn and default.
- Carry each entry's origin in a channel the author cannot write and the merge
  does not merge. Never inside the entry's own payload.
- Detect cycles by visit path and put the path in the message.
- Absent optional include: skip. Present and unreadable: stop, optional or not.
- Declare and document the win order for a list of parents.
- Run each included document through the same door as the entry document — its
  own version floor ([version-gate-precedes-schema-gate](../../../../engineering-process/standards-and-gates/repo-manifest-standard/techniques/version-gate-precedes-schema-gate.md)),
  its own strictness, its own cycle check.
