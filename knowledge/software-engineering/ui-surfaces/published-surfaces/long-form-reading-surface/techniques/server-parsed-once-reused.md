---
layer: technique
type: technique
subject: long-form-reading-surface
technique: server-parsed-once-reused
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [deciding where a contents list is computed, the panel describes a previous version of the article, an editor preview shows stale headings, reading time is presented as a fact]
---

# Parse once where the document is prepared

A rendered article yields several derived values: the heading list the contents
panel needs, the same list the renderer needs for addressing, a word count, a
reading-time estimate. All of them are functions of the document body, and the
body is complete and available at preparation time — wherever the document is
assembled before it reaches a reader's device. Parsing it again on arrival buys
nothing and costs three things: the reader's first-paint budget, a second copy
of the parsing rules, and the possibility of two different answers to one
question.

So the structure is extracted **once, by the same authority that assigns
addresses**, and travels with the body as a prepared value the receiving side
consumes rather than re-derives. The panel renders from what it was handed. The
technique's substance is what happens when that handed-down value can be wrong.

## The derived value names how it is recomputed

A derived value shipped alongside its source is a cache, and a cache without a
stated recomputation path is a discrepancy waiting for an arbiter
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
The path here is explicit and cheap: the same extractor that produced the value
runs on the client, over the body the client actually holds. What must be
disciplined is *when*.

The rule is **re-parse on measured divergence, never on habit**. The receiving
side compares the body it is rendering with the body the prepared structure
describes; when they are the same, it uses the prepared structure, and when they
differ it re-extracts. Two shapes of the comparison are acceptable and one is
not:

- **Identity of the source.** The prepared structure is tagged with the document
  version it was derived from; a body carrying a different version re-extracts.
  This is the strongest form and the right one wherever a version is already at
  hand.
- **The body value itself.** Where the body arrives as one value, comparing it
  to the value the structure was derived from is exact and costs a comparison.
  Coarse but honest.
- **Not "re-parse if the panel looks empty".** An empty heading list is a
  legitimate answer for an article with no headings, and treating it as a
  failure signal makes the surface re-parse forever on exactly the documents
  where parsing yields nothing.

The case that makes this non-theoretical is an editing or preview surface, where
the reader is looking at a draft that has not been prepared at all. There the
prepared structure describes the last saved version and the body is the draft —
the divergence is the normal state, not an edge case, and a surface that never
re-parses shows a contents panel confidently describing text the reader has
already changed.

## The extraction contract

Whatever the extractor produces, both sides depend on it agreeing with the
renderer, so the contract is narrow and stated:

- **Every entry carries the address the renderer will produce** — which is why
  extraction and rendering share one assigner rather than one slug function.
  Carrying text and depth but not the address forces the panel to re-derive an
  address, and re-derivation is the divergence this whole subject is organized
  against.
- **Depth is carried, filtering is not.** The extractor emits every heading it
  legitimately sees with its level; which levels the panel *shows* is the
  panel's decision, applied downstream. Filtering at extraction time means a
  later panel change requires a change to the shared authority, and the two go
  out of sync in the interval.
- **Exclusions are stated and few.** Headings inside embedded structures are
  excluded from the outline because they belong to that structure's internal
  layout, and any exception — a block type that genuinely wraps a section —
  is named at the exclusion site with its reason. An unexplained exception is
  indistinguishable from a bug, and gets "fixed" by the next reader.

## Derived reading numbers carry their predicate

Reading time and word count are the two derived values most likely to be
presented as facts and least likely to be defined
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
reading-time figure is an estimate over a stated corpus at a stated rate: the
words of the article body, at a conventional prose rate, excluding code blocks,
tables and captions if the surface says it excludes them. Two rules follow:

- **Compute it from the same body the reader sees**, on the preparation side,
  next to the structure extraction — not from a summary field, not from a
  separately maintained number, and never as a value an author types in and
  forgets to update.
- **Round it to the precision the method supports.** Coarse minutes are honest;
  a figure to the minute over technical prose is a claim about an individual
  reader's speed that the method cannot make.

## When not to reach for this

Where the document is authored and rendered entirely on the reader's device —
a locally edited note, a live composition surface — there is no preparation side
to parse on, and a single client-side extraction *is* the single authority.
Ship the structure with the body when there is a preparation step, and skip this
technique when there is not; what does not survive either way is two extractors.
