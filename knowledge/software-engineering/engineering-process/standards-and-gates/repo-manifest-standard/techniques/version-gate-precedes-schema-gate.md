---
layer: technique
type: technique
subject: repo-manifest-standard
technique: version-gate-precedes-schema-gate
status: forged
laws: [unknown-is-not-a-value, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [a config file written for a newer tool version fails with a confusing parse error, deciding whether a reader rejects or ignores unrecognized fields, an artifact has exactly one reader rather than many, a version declaration sits inside the document the version governs]
---

# The version gate parses before the schema gate

[must-ignore-unknown](./must-ignore-unknown.md) is written for the case this
subject is about: a contract that **many independently written readers** consume,
where a closed record type makes every future addition a breaking change. That
rule is right, and it is scoped, and the scope is easy to lose because the two
cases produce artifacts that look identical on disk.

The other case is an artifact with **exactly one reader** — a tool's own
configuration file, the description a single program reads about the work it is
being asked to do. There, ignoring an unrecognized key is not forward
compatibility, it is a silent typo. The author wrote `dependencies` as
`dependancies`, the reader ignored it, the work ran with no dependencies and
exited zero. Under
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) the
misspelling was unknown and the reader rendered it as a definite empty. So the
single-reader case wants the opposite default: **reject what you do not
recognize.**

Rejecting creates the problem this technique solves. A reader that rejects
unknown keys cannot tell a typo from a document written for a later version of
itself, and it reports both the same way — as a schema error naming a field. To
the author of a forward-written document that message is actively misleading: it
says *this key is wrong* when the truth is *your tool is old*. They will go and
fix a key that was never wrong.

## The mechanism: two parses, in a fixed order

The document declares the minimum reader version it requires. The reader
extracts that declaration **in its own pass, before the typed parse**, using the
format's generic value model rather than the schema — a raw tree, a map of
maps, whatever the serialization library offers with no target type attached.
It compares the declared minimum against its own version and refuses with a
version-specific error if it is behind.

Two properties of that first pass carry the whole technique.

**It is schema-independent by construction.** The point of the pass is to read
one well-known path out of a document whose other contents the reader may not
understand. If the extraction is expressed against the typed schema, it inherits
the schema's strictness and fails on the very documents it exists to diagnose.
The extraction reaches for the path and tolerates its absence.

**It is failure-tolerant, and this is the counter-intuitive half.** When the
generic parse itself fails — the document is malformed, truncated, not the
format at all — the version pass returns *no opinion* and lets the typed parse
run and produce the error. It does not report a version problem, because it does
not have one; a syntax error is a syntax error and the reader that produces the
best message for it is the real parser. The version pass has exactly one verdict
to offer, *this document requires a newer reader*, and it stays silent about
everything else. A first pass that starts reporting parse failures has become a
second validation door
([one-validation-door](../../../../_laws.md#one-validation-door)) and will
disagree with the first one within two releases.

The resulting outcome vocabulary is three-valued and the order is what makes it
so: **too old** (version pass fired), **malformed or unrecognized** (typed parse
fired), **valid**. Collapse the order and the first outcome disappears into the
second, permanently, because a reader that has already failed on an unknown key
never reaches the version check.

**Returning early is half the change; returning the loader's own not-usable
signal is the other half.** A validator that accumulates findings rather than
throwing has a second output beside the finding list — the parsed object it
hands back, which callers guard on to decide whether to keep going. Stopping the
version check early while still returning a *truthy* object leaves those callers
running their remaining cross-checks against a declaration set the early return
never populated, and they will report every item in the target as undeclared. The
version refusal is the same class of event as a parse failure and must produce
the same shape: no usable object, one finding. Retrofitting this into an existing
validator is a two-line change and exactly one of the two lines is the obvious
one.

## What the declaration must be, and where it must sit

- **A floor, not an equality.** The document says the oldest reader that can
  understand it. A newer reader is always acceptable; that is the whole point of
  [semver-additive-evolution](./semver-additive-evolution.md), and a document
  pinning an exact reader version has withdrawn from it.
- **At a fixed, shallow path.** The first pass has to find it in a document it
  cannot otherwise interpret, so the declaration cannot be nested under
  something conditional, cannot be computed, and cannot be supplied by an
  include. One path, top of the document, always the same.
- **Inside the document it governs, not beside it.** A version in a sibling file
  can be separated from the document by a copy, a move, or an editor that writes
  one and not the other. The document that requires a newer reader has to be the
  document that says so.

## Composition: every included document gates on its own

The check runs per document, not per configuration. When one document includes
another, the included file is loaded through the same door and its own
declaration applies to it — a shared fragment that requires a newer reader
refuses on its own terms, in the reader's message, naming that fragment. The
alternative is a single check on the entry document, which is exactly the
version claim that is least likely to be accurate: the entry document is the one
the team edits, and the included fragment is the one that came from somewhere
else and moved.

## Boundary

For a multi-reader contract the rule inverts back and this technique is wrong
for it. Where an arbitrary tool must be able to read the artifact, a version
floor that refuses is a compatibility break dressed as a courtesy: the reader
could have done something useful with the fields it recognized, and instead did
nothing. There the answer is
[must-ignore-unknown](./must-ignore-unknown.md), and the version field is
advisory — a thing a reader may report, not a thing it may refuse on.

The discriminator is a single question, and it is about the artifact rather than
the format:

> **How many independently written programs read this document?**

One — reject unknown keys and gate on the declared floor first. More than one —
ignore unknown keys and do not refuse on the version. A team that cannot answer
the question has an artifact that will be read by two programs within a year,
and should assume more than one.

## Decision rules

- If a document has one reader, reject unrecognized keys and add a declared
  version floor read in a pass of its own that runs first.
- Express the first pass against the format's generic value model; never against
  the typed schema.
- Give the first pass one verdict. On any other failure it returns no opinion and
  lets the typed parse speak.
- Make the declaration a floor at a fixed shallow path inside the document it
  governs.
- Run the check on every included document with the document's own declaration,
  not once on the entry point.
- If a second independent reader appears, this technique is retired for that
  artifact and [must-ignore-unknown](./must-ignore-unknown.md) replaces it.
