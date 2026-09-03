---
layer: golden-path
type: golden-path
subject: self-describing-model-packages
status: forged
use_when: [packaging a trained model for programs that will never read its training code, deciding what a model's metadata must promise and what it may only advise, exporting a compiled model form that has to stay reproducible, validating a third-party model package before running it]
techniques:
  - normative-layout-contract
  - symbolic-shape-constraints
  - self-locating-validation-schema
  - declared-vs-derived-outputs
  - advisory-version-floors
  - config-frozen-artifact
---

# Self-describing model packages

A **self-describing model package** is a directory — zipped, or embedded whole
inside a compiled container — that carries a trained model together with
enough machine-readable description that an unfamiliar program can load it,
feed it correctly, interpret what comes back, and reproduce the compiled forms
it ships, without ever reading the code that trained it. The weights alone are
a tensor of numbers with no semantics; a training script alone is a program
whose contract is implicit in its argument parsing. The package is the artifact
that gives the weights a contract and gives the contract a fixed address.

The whole subject is one design problem seen from the consumer's chair. The
consumer is a **program**, not a colleague: a model catalogue that lists and
downloads, an annotation tool that runs inference on whatever it is handed, a
serving container that must decide at start-up whether it can host this model,
a federated client that must train it on data the author never saw, an
ensembling system that must combine it with models from other authors. None of
these can ask the author a question. Every question they would have asked has
to be answered in advance, inside the package, in a form a program can test.

That last clause is the bar. "Answered in advance" is what a prose write-up does;
"answered in a form a program can test" is what this subject demands. A prose
sentence saying "inputs must be divisible by sixteen" is documentation. An
arithmetic expression the package's own tooling can solve, instantiate, and
push through the network is a contract. The distance between the two is the
distance between a model that can be shared and a model that can only be
handed over.

## The mistake this subject exists to prevent

The naive package is **a checkpoint with a prose write-up beside it**. It works for
the author, who knows the preprocessing, the channel order, the shape rule,
the version it was trained under, and which of the outputs are the network's
and which are the post-processing's. It works for the author's team for a
month. Then the model is handed to a program — or to a person six months
later who has become, for practical purposes, a program — and every implicit
fact has to be rediscovered by running the model and watching it fail.

The failure is not laziness. At authoring time, the author's environment
satisfies every implicit assumption, so there is no observable difference
between "the package describes its needs" and "the environment happens to
meet them". The difference appears on the consumer's machine, which is the
one place the author cannot see. Every technique here is a way of moving one
implicit fact out of the author's head and into the package, in a shape that
fails visibly when it stops being true.

## Layout is law, metadata is contract

Two things must be fixed before anything else, and they are fixed at different
levels of the specification.

The **layout** — which files exist, what they are called, where they sit —
is fixed by the specification, not by a field in the package. A consumer
that has to open a manifest to learn where the manifest is has a bootstrap
problem, and a consumer that has to open the manifest to learn where the
weights are has traded one lookup for two. Required files are named; optional
files are optional but still named, so that "absent" means "not shipped" and
never "shipped under a name I did not think to look for".
[normative-layout-contract](./techniques/normative-layout-contract.md) states
what belongs in the specification and what may be left to a manifest field.

The **metadata** is the contract proper: what the model is for, what it
takes, what it returns, and what it was built on. Its shape is governed by a
schema, and — the load-bearing choice — the metadata names the schema it
satisfies, by address, from inside itself. A validator with no prior knowledge
of the package's ecosystem can fetch or resolve that schema and validate;
two packages built under two schema versions each say which one they mean.
[self-locating-validation-schema](./techniques/self-locating-validation-schema.md)
covers the self-reference, the offline case, and when to pin the schema's hash.

## Inputs are families, not examples

The field most often gotten wrong is the input shape. A model rarely accepts
one shape; it accepts a family — any size, or any multiple of some power of
two, or any size in one axis and a fixed size in another — and the naive
metadata ships one example shape and hopes the reader infers the rule. Readers
do not infer rules. They copy the example, and the model either fails on real
data or silently pads and crops its way to a wrong answer.

The discipline is to write the family as an **arithmetic expression in shared
one-letter variables**, one expression per axis, with the same variable
binding the same value wherever it appears. The expression is checkable by a
program, which is the point; but a grammar alone is only half of it. The
package's tooling ships a **solver** that assigns concrete values to the
variables, materializes a test input, runs it through the network, and
asserts the output's channel count and element type match what the metadata
promised. A shape rule that has never been solved and forward-passed is a
claim; a shape rule the package can prove on demand is a contract.
[symbolic-shape-constraints](./techniques/symbolic-shape-constraints.md) is
the grammar, the solver, and the proof step.

## The network's outputs and the pipeline's outputs are different things

A consumer receiving a label map needs to know whether it received what the
network emitted or what the package's own post-processing produced from it —
an argmax, a threshold, a connected-component filter, a resampling back to
the input's geometry. The two have different shapes, different types, and
different meanings, and a metadata block that describes only one of them
forces the consumer to guess which. The rule: whenever the pipeline changes
the meaning of an output, describe the derived output **separately** from
the raw one, and say what derived it.
[declared-vs-derived-outputs](./techniques/declared-vs-derived-outputs.md)
covers the split and the tell for when it is required.

## Versions are floors, and the package says so

A package records the versions of the framework, the tensor engine and the
array library it was **built on**. The naive reading treats these as pins —
an equality the consumer must match — and the naive consumer either refuses
everything built a week earlier or, worse, enforces nothing and says nothing.
The honest semantics are a **floor**: later versions are expected to work,
the package warns when the installed version is below the floor, and it
enforces only the things it can actually test. A hard refusal on a version
number is a refusal on a proxy; the thing that matters is whether the model
loads and runs, and the package has a way to test that directly.
[advisory-version-floors](./techniques/advisory-version-floors.md) covers the
semantics, the warning, and the line between advisory and enforced.

## An exported form carries what produced it

A package may ship a compiled form of the model beside the weights — a graph
serialized for a runtime that does not evaluate the training code. The
compiled form is faster and more portable, and it is also opaque: nothing in
a serialized graph says which configuration built it. So the export **embeds
the exact configuration and metadata that produced it**, normalized to a
single serialization regardless of the source format, keyed so that a
consumer can read the config back out of the artifact and rebuild the
artifact from the config. An exported form that cannot be reproduced from
itself is a binary with a lineage story attached; one that can is a
reproducible build.
[config-frozen-artifact](./techniques/config-frozen-artifact.md) covers the
freezing, the normalization, and the collision rule.

## Where this subject ends

Three neighbours share ground with this one, and the reader should be able to
pick between them without opening all four.

**The repository manifest standard** owns the contract a *repository* carries
about itself — what can be run against a codebase, where its evidence lives,
which version of the convention it speaks. This subject owns the contract a
*carried artifact* carries about itself — a model that has left the
repository and is consumed by programs its author never meets. The rule a
reader uses to pick: if the thing being described stays where it was written
and describes a codebase, it is a repository manifest; if the thing being
described is copied, downloaded, zipped and handed to a stranger's program,
it is a model package. Two of that subject's techniques apply here unchanged
and are cited rather than re-minted. Its rule that the specification ships
with the artifact is exactly why this subject's metadata names its own schema
by address and why a vendored copy must be hash-pinned rather than trusted;
its rule that a reader must ignore unknown fields is why a package's metadata
may carry extra keys a consumer does not recognize, and why the strict set
— the schema address, the type of a recognized field, the presence of a
required one — is small and stated. Where this subject differs is in what it
adds on top of both: a model package must be *executable* against its own
contract, which is why its techniques end in a solver and a forward pass
rather than in a schema check.

**Signed artifacts** owns integrity and provenance of carried bytes: whether
these are the bytes the producer produced, whether a named identity produced
them, and whether the consumer refused when either claim failed. This subject
takes the bytes as given and asks whether they *describe themselves* well
enough to be used. The discriminator: a question about *who* made this and
whether it was *altered* belongs to signing; a question about what this
*takes*, *returns*, and *needs* belongs here. The one place they touch is the
hash pin on a fetched schema — that is a signing concern applied to one
pointer, and this subject borrows the idea without owning it.

**Declarative object-graph configs** — the language in which a package's
config files denote a graph of live objects, with references, expressions,
macros and lazy construction — is a sibling subject that owns the *inside* of
the config file. This subject owns the *package*: the layout the config sits
in, the metadata beside it, the checks that run over both, and the export
that freezes the config into a compiled form. The rule: if the question is
how a config file resolves a reference or evaluates an expression, it is the
sibling's; if the question is where the config file lives, what validates it,
and how it travels into an artifact, it is this subject's.

One further seam is worth naming so nobody looks for it here. A model
package is a **description and a recipe**: what the model is, what it takes,
how to train and run it. It is not a deployment unit. The container that
wraps a package for a serving fleet — with its runtime, its interfaces to
the systems it serves, its inference-only surface — is a different artifact
with different concerns, and it *consumes* a package rather than replacing
one. A package that grows deployment concerns stops being shareable between
deployments; a deployment unit that tries to be a package stops being
runnable without its infrastructure. Keep the package lighter and let the
wrapper be heavy.

## Failure modes worth naming

**The example shape becomes the only shape.** A consumer copies the one
example the metadata gave and hard-codes it. The model works on that shape,
fails or silently degrades on every other, and the metadata was technically
correct. Ship the family as an expression and the solver as a command.

**A version pin refuses a working install.** The package was built on
version *n*; the consumer has *n+1*; the check fails on inequality. The
consumer learns to disable the check, and now nothing is checked. Floors and
warnings, and enforce only what a forward pass can prove.

**The compiled form drifts from its config.** The export succeeds; a month
later the config is edited; the compiled form is still the old one and
nothing says so. Freeze the config into the artifact and treat a mismatch
between the two as the drift it is
(`../../../_laws.md#derivation-names-recomputation`).

**Optional means unnamed.** The specification says a documentation file may
be present and does not say what it is called; every author picks a different
name; every consumer looks in a different place. Optional files are optional
in presence only, never in name.

**The check passes over a proxy.** A schema validator confirms the metadata
is well-formed and the consumer treats that as confirmation the model runs.
Well-formedness is a property of the description; runnability is a property
of the weights and the environment, and only a forward pass on a
materialized input observes it (`../../../_laws.md#gate-sees-target`).

**Absent is rendered as a default.** A metadata field the author left out is
read back as a definite value — a missing value range read as "unbounded", a
missing channel definition read as "single channel" — and the consumer
proceeds confidently on an invention
(`../../../_laws.md#unknown-is-not-a-value`). Required fields are required by
the schema; optional fields are absent, and absent is a state a consumer
must branch on, never fill in.
