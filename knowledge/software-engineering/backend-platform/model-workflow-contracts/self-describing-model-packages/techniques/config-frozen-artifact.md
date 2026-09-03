---
layer: technique
type: technique
subject: self-describing-model-packages
technique: config-frozen-artifact
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [exporting a model to a compiled or serialized form for a runtime that does not evaluate the training code, deciding what a compiled model file must carry beside the graph, auditing whether an exported artifact can be rebuilt from itself]
---

# The exported artifact carries the config that produced it

A package's canonical form is weights plus configuration: the configuration
names the network class and its arguments, the weights fill it. A compiled
form — a serialized graph for a runtime that never reads the configuration —
is faster and more portable and, on its own, unaccountable. Nothing in a
serialized graph says which network class, which arguments, which
preprocessing, or which version of the configuration produced it. A month
later the configuration is edited; the compiled form is not regenerated;
the two disagree and nothing says so.

The rule: **when exporting a compiled form, embed the exact configuration
and metadata that produced it, normalized to one serialization, so that the
artifact is reproducible from itself.** The compiled form becomes a build
output whose build inputs it carries.

## What is embedded

Everything the export consumed:

- **every configuration file** the export instantiated the network from —
  not only the one that names the network, but every file that was merged
  into the parse, because an override file that changed one argument is part
  of the provenance;
- **the metadata** — the same file the package ships, so that a consumer
  reading the compiled form alone can read the input contract without the
  package;
- optionally, **the resolved configuration** after references and
  expressions have been evaluated, so that a consumer without the config
  language can still see the concrete arguments.

Each is stored under a key derived from its name in the package, in the
container's extra-files or metadata area, wherever the compiled format
provides one. The compiled form is then a package in miniature: the same
files, the same names, reachable without unpacking anything.

## Normalized to one serialization

Configuration files arrive in whichever serialization the author chose. The
export re-serializes **every one of them into a single format** before
embedding, regardless of source. Two reasons, and both are load-bearing.

The first is that the consumer of the compiled form is a runtime, not the
package's config parser, and it can afford exactly one reader. A compiled
form whose embedded configs are in three serializations needs three parsers
in every consumer or a rule about which one wins — a second authority over a
vocabulary the package already owns
(`../../../../_laws.md#one-authority-per-vocabulary`).

The second is that comparison must be possible. Reproducing the artifact
means rebuilding it from the embedded configuration and comparing; drift
detection means reading the embedded configuration back and comparing it to
the package's current one. Both comparisons are byte-level or structural
over one serialization, and both are impossible across two. Normalization
is what makes the embedded config an instrument rather than a souvenir.

## Keyed by name, and collision is an error

The embedded configs are keyed by their base name in the package. Two files
with the same base name in different folders would collide, and the export
**refuses** rather than picking one. A silent overwrite here loses exactly
the file that a consumer will later need to rebuild the artifact, and it
loses it at the moment nobody is looking. The refusal names both paths and
stops.

## Reproducible from itself

The test of this technique is one sentence: given only the compiled form,
can a program rebuild the compiled form? It reads the embedded configuration,
instantiates the network, loads the weights the package also carries, runs
the same export, and compares. If the comparison holds, the artifact names
its own recomputation and a stored derived value has an arbiter
(`../../../../_laws.md#derivation-names-recomputation`). If the artifact
carries only the graph, the configuration that produced it is a story the
author tells, and a story is not something a drift check can read.

The same test is the drift check. On every change to the package's
configuration, rebuild the compiled form into a buffer and compare it to
the one shipped. A difference is drift with a name — the file, the key, the
argument — and the fix is to regenerate, never to remove the comparison.

## Decision rules

- **When the compiled format has an extra-files area, use it** and mirror
  the package's layout inside it. When it has only a flat key-value metadata
  area, key by base name and accept the collision rule.
- **When the compiled format has neither**, ship the frozen configuration as
  a sidecar beside the compiled file, under a fixed name the layout
  specification fixes, and treat the pair as the artifact.
- **When the export applies a transformation the configuration does not
  describe** — a precision reduction, an operator fusion, a target-specific
  optimization — record the export's own parameters in the embedded
  metadata under a key the specification reserves. The configuration
  describes the network; the export parameters describe the compilation;
  reproducibility needs both.
- **When a config file references another by a relative path**, the
  reference is resolved before freezing, so the embedded set is closed. An
  embedded config that points outside the artifact is not frozen.

## When not to use this

Do not embed a configuration into an artifact the configuration cannot
rebuild. A compiled form produced by a hand-driven, interactive optimization
session has no configuration that reproduces it, and embedding the training
config beside it would claim a lineage it does not have. Say so instead:
mark the artifact as hand-produced, record what is known, and do not let a
drift check pretend it can compare.
