---
layer: technique
type: technique
subject: native-document-format
technique: reference-or-embed
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when:
  - deciding whether the document carries content or points at it
  - a document opens with missing content because a referenced file moved
  - users send each other documents and the recipient sees nothing
  - choosing between locations relative to the document and absolute ones
---

# Reference or embed

Every document format answers one question for each piece of content it
contains: **is this in the file, or is the file pointing at it?** The answer is
usually made per content type, once, early, and it decides how large documents
get, whether they survive being sent to somebody else, and what happens when the
user reorganizes their folders.

## The decision rule

**Embed content the application itself authored; reference content that exists
independently of the document.**

The test is whether the content has an existence outside this document. A
generated element, a computed fill, a text the user typed into the document, a
parameterized figure the application produces from its own settings — none of
these exist anywhere else, so a reference to them would point at nothing and the
application would have to invent a place to keep them. Embed them; they are
usually small, they are always the application's own vocabulary, and inlining
them costs nothing.

Material the user brought — captured media, large assets, files that other
documents also use — exists on its own. Referencing it keeps the document small
enough to open quickly, keeps a single copy of an asset used by twenty
documents, and preserves the relationship between the document and the original
the user will keep editing elsewhere.

There is a third case with no clean answer: user-brought content that is small
and singular. Either choice is defensible; make it once and state it in the
format's documentation rather than letting each content type drift to its own
answer.

## What a reference must carry

A bare location is the weakest possible reference, and it is what most formats
ship first. Locations change constantly and for ordinary reasons: the user
reorganizes a folder, the document is copied to another machine, a volume is
mounted somewhere else, a project is archived under a new name. A reference that
is only a location cannot recognize its target again once the target moves, so
the application can do nothing but ask the user, once per missing item.

So a reference carries a location **and enough identity to recognize the target
elsewhere**: a content digest, a size, a duration, an embedded identifier the
original carries. Identity that survives the operations files actually undergo —
move, rename, copy, restore from a backup — is what makes automatic relinking
possible at all
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
location is where it was; the identity is what it is, and only the second one
still holds after the user reorganizes.

Two further properties of the location itself:

- **Prefer a location relative to the document** for anything inside the
  document's own folder structure, so the whole structure can be moved or copied
  as a unit. Fall back to an absolute location only for material genuinely
  outside it, and record which kind it is rather than leaving a reader to guess
  from the syntax.
- **Never store a location that only means something on the machine that wrote
  it** without also storing something portable. A location under a
  user-specific or machine-specific root is a document that cannot be shared,
  and the user will not discover this until they share it.

## Missing is a state, not an empty value

When a reference does not resolve, the document is **not** a document without
that content. It is a document whose content could not be found, and the two must
be spelled differently
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A reader
that quietly substitutes nothing has produced a plausible, wrong document that
the user may then save over the original, destroying the reference along with the
content.

The standard behaviour: the missing item keeps its slot, its identity and every
property the document holds about it; the interface marks it as unresolved; and
the document is either read-only until it is resolved or explicit that saving
will keep the unresolved reference rather than drop it. A relink flow that
resolves one item and then applies the same relocation to every other reference
under the same original root turns a hundred-item repair into one action, and it
is the single highest-value piece of ergonomics in this technique.

## Costs

- **References make a document non-portable by default.** Sending it is sending
  a description of the recipient's missing files. The counter-measure is a
  bundling operation — collect the document and everything it references into one
  archive, rewriting the locations to relative ones — which is a feature the
  format's design should anticipate rather than a feature bolted on later.
- **Embedding multiplies storage** by the number of documents that use the same
  asset, and it makes every save rewrite the whole payload. For large content
  that is not merely inefficient, it makes the save slow enough to change how
  people work.
- **Identity beside the location costs something to compute.** A digest over
  large content is not free, so compute it once at reference time and store it,
  rather than on every save.
- **Relinking by identity can find the wrong file** when two files are genuinely
  identical. That is usually harmless and occasionally is not; an automatic
  relink states what it matched on.

## Prohibitions

- **Never resolve a missing reference silently to nothing.** Empty and missing
  are different documents.
- **Never store only a machine-specific absolute location.** It is the most
  common cause of a document that opens correctly for exactly one person.
- **Never embed content whose size the user controls** without a stated bound
  and a stated behaviour when the bound is exceeded.
- **Never let a relink rewrite the document without the user's save.** The
  repair is a proposal until the user commits it, exactly as any other change to
  their work.
