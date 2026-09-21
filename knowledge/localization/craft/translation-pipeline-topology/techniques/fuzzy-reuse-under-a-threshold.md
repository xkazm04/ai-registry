---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: fuzzy-reuse-under-a-threshold
status: forged
laws: [identical-source-identical-target, clean-strings-stay-untouched]
shared_with: []
use_when: [deciding whether a translation-memory match may be written without review, choosing or revisiting a fuzzy-match threshold, a term ruling changed and old translations keep coming back, an exact memory match produced the wrong translation on a new surface]
---

# Fuzzy reuse under a threshold

A source-hash cache answers one question exactly: has *this* source, under *this*
configuration, been translated before
([source-hash-translation-cache](./source-hash-translation-cache.md)). A
translation memory answers a looser and more valuable one: has something
**like** this been translated before — in this product or another, this year or
three years ago? The looseness is the value and the risk. A memory spans surfaces,
products and time, so its matches are evidence about a translation, never the
translation itself.

## The mechanism, and why its constants do not transplant

A memory stores source–target pairs with metadata, scores a new source against
them, discards everything under a floor, and returns a capped, ranked list. Two
shipped implementations, read in code, agree on that shape and on almost nothing
else:

- **Trigram similarity with a transformed threshold.** Similarity is the overlap
  of character-trigram sets; the configured threshold is mapped through a
  logarithmic transform before it is applied, the score is boosted for length,
  very short strings are held to a near-identical floor, and when nothing clears
  the floor the search backs off rather than returning empty.
- **Normalized weighted edit distance.** A weighted edit distance between the
  two sources, divided by their combined length, turned into a quality score with
  a minimum of 0.7 and a cap of five results.

The shape is stable: a normalized score, a floor, a result cap, and special
treatment of short strings — both implementations arrived at that last one
independently, and it is the most transplantable part. One edit in a
four-character string is a quarter of the string, and a trigram set that small
matches almost anything, so **short strings reuse only at near-identity, never
fuzzily**.

The constants are not stable. A 0.75 on a transformed trigram scale and a 0.75 on
a normalized edit-distance scale are different claims about different
neighbourhoods. So **a threshold does not move between memories**: re-derive it
against the memory it will gate, by sampling matches at several scores and having
a reviewer grade how much of each needed repair.

## Reuse policy

- **A fuzzy match is a suggestion, never an automatic write.** Anything under
  exact identity goes to a human, or into the engine's request as scored context
  where the pipeline has one — with its score, because a match handed over
  without a score reads as an instruction to copy it. Writing a fuzzy match
  directly puts text nobody reviewed for *this* source into the catalog under a
  reviewed-looking value, and a band of auto-confirmed matches is the same move
  at volume.
- **An exact match still needs the context check.** Identical source text on a
  different surface can need a different translation: a one-word label that is a
  verb on a button and a noun in a column header, a term that has one rendering in
  one product and another in its sibling. Match on the surface and the
  neighbouring units, not only on the text, before treating 100% as reuse.

The second rule is [identical source, identical
target](../../../_laws.md#identical-source-identical-target) read from the other
side. Inside one catalog that law *demands* the same target for the same source,
and there an exact match is not a suggestion, it is a consistency obligation. A
memory is not one catalog: it spans products and years, so identity of source is
evidence of identity of meaning, not proof. The law's scope is exactly what the
context check restores.

## A threshold is a dated decision

Reuse thresholds across the industry have been rising as engines improve. One
platform reports its customers' average threshold moving from the mid-70s to the
mid-80s — vendor-stated, not independently measured, and on that platform's own
scale. The direction is what matters and it follows from cost: when fresh engine
output needs less repair than a mid-range fuzzy match, the fuzzy match stops
being the cheaper start.

So record a threshold with **the date it was set and the engine it was compared
against**, and revisit it when the engine changes. A threshold inherited from a
configuration file with neither is a constant nobody can defend and nobody dares
lower.

## The trap: a cache with no invalidation

A memory never forgets and never notices. When a term ruling changes, every
memory entry that contains the old rendering is now wrong, and the memory keeps
offering those entries at high scores — correctly, by its own measure, because
the *source* did not change. The newest ruling loses to the oldest translations
one match at a time, which is how a decision recorded under [one concept, one
rendering](../../../_laws.md#one-concept-one-rendering) quietly fails to take
effect.

The cache technique already has the discipline that would notice: key derived
work by a digest of everything that shaped it, including a digest of the
termbase. Carry that into the memory. Stamp each entry with the termbase digest
it was made under, and when a ruling changes, mark every entry containing the
superseded rendering as needing review rather than deleting it or letting it
score as before. Carry the entry's review state with it too; a memory that
cannot say whether a pair was ever reviewed turns every reuse into an upgrade of
its trust class.

## When not to use it

- **A derived-and-served pipeline with no reviewers.** Unreviewed engine output
  reused into unreviewed engine output adds no quality claim and propagates old
  errors; exact caching is the right tool there.
- **A single small catalog.** The identical-source law already governs its
  duplicates exactly, and a fuzzy layer adds scores nobody needs.

## Failure modes

- **Auto-writing fuzzy matches.** A near-match's translation lands under a
  different source and reads as reviewed.
- **Exact match without context.** The right translation of the same words on
  the wrong surface.
- **A threshold copied between memories.** A number from one similarity scale
  applied on another admits or rejects a neighbourhood nobody sampled.
- **Fuzzy matching of short strings.** Labels reuse the translation of a
  different label that shared three letters.
- **A term ruling that never reaches the memory.** The termbase says one thing,
  the memory keeps suggesting the other, and reviewers accept the high-scoring
  match because a score reads as authority.
- **Clearing the memory to fix it.** Deleting entries wholesale discards every
  reviewed pair along with the stale ones —
  [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
  applies to a memory as much as to a catalog. Mark and review; do not purge.
