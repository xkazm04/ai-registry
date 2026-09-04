---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: textual-macro-prepass
status: forged
laws: []
shared_with: []
use_when: [a config file needs to include a fragment of another file, a reference must point at a sibling or parent node without spelling its absolute path, the resolver is receiving ids in more than one form]
---

# Textual macro prepass

Two operations a multi-file config needs are not about objects at all. One is
**splicing**: file A wants the `preprocessing` list from file B, verbatim, as
though it had been written in A. The other is **relative addressing**: a node
deep in a tree wants to refer to its sibling as "the one next to me" rather
than by a path that will break the moment the tree is reorganised. Both look
like reference resolution and both are better handled as **text
transformations that run before the resolver sees anything** — a prepass whose
output is a single document in which every id is absolute and no macro
remains.

## Why text, and why before

A splice copies a fragment; the copy must be independent of the original, so
that an override applied to the copy does not silently alter the source file's
node and so that two splices of the same fragment into two places produce two
nodes, not one shared one. That is the semantics of text, not of references —
a reference to B's `preprocessing` would give A the *same* list, and an
override on it would be an override on B. The macro is therefore resolved by
reading the other file, locating the fragment, and inserting a deep copy of its
parsed content into A's tree at the macro's position. It happens once, at load,
and after it the resolver has no idea the fragment came from elsewhere.

Relative ids are relative to the position of the node that contains them; the
position is a property of the tree, and the tree is fully known before any
object exists. So the prepass walks the tree, and for each reference whose id
begins with the relative marker, computes the absolute id from the containing
node's path and rewrites the reference text. The resolver then sees only
absolute ids and needs no notion of "current position" — which is the point,
because a resolver that tracks position must also get it right across cache
hits, disabled nodes, and cross-file splices, and it will not.

The ordering rule that follows: **macros before relative ids, relative ids
before references and expressions.** A spliced fragment may contain relative
references, and they must be made absolute relative to their *new* position,
which is only known after the splice.

## The macro form

A macro value is the macro sigil followed by a locator: a file path — or the
name of an already-loaded file — then the id separator, then an id within that
file. When the file part is omitted the macro refers to the current document,
which is how a fragment defined once at the top of a file is reused in three
places without a reference (and without sharing). The locator grammar reuses
the id separator from the sigil alphabet; a macro does not invent its own.

The resolved content replaces the macro value in place. Because it is a deep
copy, the copy may then be overridden by later layers without affecting the
source; because it is inserted before reference resolution, references inside
the fragment resolve in the *including* document's namespace, which is what
authors expect and occasionally what surprises them — a fragment that refers
to `@network` gets the includer's network. The specification page says this in
one sentence, and it is the sentence authors most need.

## The relative grammar

A relative id begins with a marker — the id separator repeated is the
common choice, one repetition per level of ascent: one for "my container",
two for "my container's container". The prepass resolves each by taking the
containing node's absolute path, dropping as many trailing segments as the
marker specifies, and appending the remainder of the id. An ascent beyond the
root is an error naming the node, not a silent clamp.

The rule for whether to use a relative id: when the reference is to a sibling
or a near ancestor inside a fragment that is meant to be spliced or moved,
relative is right, because the fragment stays valid wherever it lands. When
the reference is to a top-level node — the network, the device, the root
directory — absolute is right, because a relative path to a top-level node is
longer, more fragile, and communicates nothing.

## What the prepass must not do

It must not evaluate anything. A macro that could contain an expression, or an
expression that could produce a macro, would collapse the phase boundary that
makes the prepass safe to run with evaluation disabled — and an inspection
tool relies on running the prepass, then reading the tree, with no code
executed. It must not resolve references; a reference is by-identity and a
macro is by-copy, and a prepass that blurred them would produce a document in
which some `@x` values are shared and others are copies with the same text.
And it must not be lazy: the entire document is transformed at load, so the
resolver's view of the tree is stable for the lifetime of the parse.

## Failure modes

**The included file is located relative to the working directory rather than
the including file.** Then a config that works when loaded from the package
root fails when loaded from anywhere else. Locate relative to the including
file, and accept an absolute path when given.

**A macro to a file that has been modified since it was first loaded.** The
prepass reads each file once per load and caches the parse; if the same file
is spliced twice the second splice sees the same content as the first. Do
not re-read, and say in the documentation that a load is a snapshot.

**A fragment spliced in and then referenced by its old id.** After the splice
the fragment lives at the macro's position, and its old id is meaningful only
in the source file. An author who writes `@preprocessing` expecting the
spliced copy gets a missing-reference error; the error message should mention
that a macro was resolved nearby, because the confusion is predictable.

## When not to use this

A single-file format has no cross-file splicing to do and gains nothing from
relative ids until it is large enough to have movable fragments. A format that
already resolves references by copy rather than by identity has no distinction
to preserve and can implement splicing as a reference. And a fragment that is
included from many files and should be *shared* — one instance, not many
copies — is a reference to a common file's node, not a macro; the prepass is
for text, and shared identity is the resolver's job.
