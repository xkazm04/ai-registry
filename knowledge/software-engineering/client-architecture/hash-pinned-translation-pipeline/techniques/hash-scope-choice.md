---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: hash-scope-choice
status: forged
laws: [gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [deciding whether a metadata edit should trigger re-translation, a reformatting pass marking the whole corpus stale, a heading edit that the detector reported as fresh]
---

# Hash scope choice

The digest's input set is not an implementation detail. It is a **written
policy about what "changed" means**, and it decides, for every future edit to
the corpus, whether that edit costs money. Every other part of the pipeline is
mechanism; this is the one place a judgment is made, and it should be made once,
deliberately, in a sentence somebody can read.

## The rule

**A field is in the hash if and only if a change to it should force a
re-translation of that unit.** The operational restatement is sharper and
easier to apply: **hash exactly the content that was handed to the translator,
and nothing that was not.** Everything the translator saw is derivation input;
everything else is bookkeeping that travels alongside.

Applied field by field, a typical content unit sorts cleanly. Body prose: in.
Heading or title, if the heading is translated: in. Summary or teaser, if it is
translated: in. Ordering index, category tags, publication date, author
identifier, internal record id, the unit's own key: out — none of them were
translated, none of them changes what the target prose should say. Alt text,
captions, and any string rendered to a reader: in, because they were translated,
which is the same test applied to a field people forget is a field.

## The two failure directions, and which one is worse

**Over-scoping** — hashing the whole record, metadata included — is the common
one, because it is what you get by hashing the serialized object without
thinking. Then a re-ordering pass, a tag rename, or a bulk date normalization
marks the entire corpus stale. The team either spends a large budget
re-translating prose that did not move, or, far more often, looks at "1,847
stale" and quietly stops believing the detector. **A detector with a history of
false positives has a shorter useful life than no detector at all**, because it
also consumes the credibility that would have funded the next one.

**Under-scoping** — hashing only the body — is rarer and worse. A heading edit
ships an updated title in the source language and the old title in every other
locale, and the detector reports the unit **fresh**. The number is green, the
defect is invisible, and no later check will find it: the shape gates cannot
see content, and the content gate has been told this content does not count.
This is [gate-sees-target](../../../_laws.md#gate-sees-target) at the level of
the digest itself — the gate is observing a proxy for the translated content,
and the proxy diverges exactly on the fields the scope omitted.

When in doubt, over-scope by one field rather than under-scope by one. A false
stale costs a re-translation; a false fresh costs a wrong page in a language
nobody on the team reads.

## The third direction: scope you did not choose

Both failures above are decisions. The dangerous one is not a decision at all:
**the extractor silently captures less of the field than the field contains.**
A hand-written pattern that pulls a body out of a source module, a parser that
stops at the first delimiter it recognizes, a reader that truncates at a
buffer — each produces a digest over a *prefix*, and a prefix hash is a scope
nobody wrote down, nobody reviewed, and nobody can see.

It fails in the direction that looks healthiest. Edits inside the captured head
move the hash normally, so the detector demonstrably works and everyone
believes it. Edits inside the uncaptured tail never move the hash at all, so
those units report **fresh forever**, and the longer the tail the more of the
unit is permanently invisible. There is no symptom: no error, no exception, no
short read reported anywhere, and the emitted digest is the same length and
shape as every honest one.

So a scope decision is only real if it is **verified at the boundary**, and the
verification is cheap:

- **Assert the extraction covers the source.** Compare the extracted length
  against the field's actual length and fail on a shortfall. Where the content
  format allows it, assert on the terminator — an extractor that stops before
  the true end of a field has hit a defect, not an edge case.
- **Carry the captured length into the manifest** beside the digest, so a run
  that starts capturing prefixes shows up as lengths that shrank rather than as
  digests that changed.
- **Spot-check the widest unit.** A truncating extractor is usually correct on
  short, simple content and wrong on the longest, richest unit in the corpus —
  which is also the one whose staleness costs most.

Applied to text, the rule generalizes: the digest's input set is a claim about
*which content* is covered, and a claim about content is not established by
reading the code that selects fields. It is established by measuring what came
out against what was there.

## Composite scope has its own contract

Once more than one field is in, the digest is over a *composition*, and the
composition is part of the specification with the same force as the field list:

- **Fixed field order**, declared. Concatenating title-then-body and
  body-then-title produce different digests over identical content.
- **An unambiguous separator**, so that moving a word across the boundary
  between two fields cannot leave the concatenation unchanged. A separator that
  can occur in the content is not a separator.
- **A declared normalization**, and the honest default is *none*. Trimming
  trailing whitespace, normalizing line endings, or collapsing runs of spaces
  are all defensible — they stop a formatter from restaging the corpus — but
  each is a rule that both the emitter and the detector must apply identically
  forever, and each one is a place they can drift. Normalize where a real tool
  in your pipeline actually churns those bytes, and nowhere else.
- **A declared encoding.** The digest is over bytes; the text is characters.
  Two representations of the same accented character digest differently, which
  is a live risk in a corpus whose whole point is non-source-language text.

Where a field is optional, decide what its absence hashes to and write that
down too — an absent summary and an empty summary must not be free to swap
digests depending on which program serialized the record.

## The digest names its own derivation

A stored digest is a derived value and
[names how it is recomputed](../../../_laws.md#derivation-names-recomputation).
Two cheap conventions carry that:

- **Prefix the algorithm** into the stored value, so a reader holding only the
  record knows what produced it and an algorithm migration is a visible format
  event rather than a silent reinterpretation.
- **Carry a scope version** wherever the field set is expected to change, so a
  record pinned under an older scope is *recognizable as such* instead of
  merely unequal.

A bare hex string is a number with no predicate: the next program to read it
will guess what it digests, and guess wrong. Truncation is acceptable here in a
way it is not in a signing context — collision resistance against an adversary
is not the threat model — but a truncated digest must be truncated identically
on both sides, which makes the truncation length part of the specification too.

## Changing the scope is a corpus event

Adding a field to the digest reclassifies **every unit in every locale as stale
in a single run**. That is not a bug and it is not avoidable; it is the correct
consequence of having decided that a previously-ignored field now matters. What
distinguishes a professional scope change from an accident is that the
consequence was planned:

1. Decide, and record the decision with its date and rationale.
2. Bump the scope version in the stored format.
3. Choose the migration: either accept the full re-run and **budget it** with a
   fan-out audit before starting, or migrate in waves, using the scope version
   to tell old-scope records from genuinely stale ones so that the two
   populations do not merge into one undifferentiated pile.
4. Never silently. A scope change with no version bump is indistinguishable, in
   the report and forever after, from the entire corpus having gone stale at
   once — and it is the same signature as the instrument-drift failure the
   parity technique exists to catch.

## When there is nothing to decide

A corpus with exactly one translated field and no prospect of a second has its
scope determined by the content model. Write the one line anyway — *"the digest
covers the body text only, because the body is the only translated field"* —
next to the hash function. The line costs nothing and it is the artifact that
prevents the next contributor from adding a translated subtitle without
noticing that the pin does not cover it.
