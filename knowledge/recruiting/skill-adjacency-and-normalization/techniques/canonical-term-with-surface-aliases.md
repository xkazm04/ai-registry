---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: canonical-term-with-surface-aliases
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [adding a skill to the taxonomy, deduplicating skill names, deciding whether two strings are the same capability]
---

# Canonical term with surface aliases

Every capability the system reasons about has exactly one identity — a stable,
opaque canonical term — and an open set of *surfaces*: the strings a human might
actually type for it. Requirements and candidate records are resolved to
canonical terms at the boundary; everything downstream — hierarchy walks,
adjacency credit, deduplication, display, analytics — operates on identities
only. This is [meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)
applied to capability vocabulary: no rule may key off the characters a person
happened to type.

## Why one identity, not a similarity function

The alternative — comparing strings by fuzzy similarity at match time — fails on
both sides at once. It fires on unrelated terms that happen to share
morphology, and misses genuine equivalents that share nothing (an abbreviation
and its expansion, a term and its translation, a product name and the discipline
it stands for). Similarity is a property of strings; equivalence is a property
of the world, and only a human who knows the domain can assert it. The taxonomy
is where those assertions are written down and reviewed, which is exactly what a
similarity threshold is not.

The second reason is arithmetic. Two spellings of one capability, left
unresolved, become two entries: two hierarchy walks, two credits, two rows in a
skills list, and a consolidation step that computes each entry's maximum over
half the evidence. Normalization must therefore run *before* any consolidation
or scoring, not after.

## The shape of an entry

A well-formed term carries, at minimum:

- **The canonical identity** — stable across renames of its display label. A
  term's display name may be edited freely; its identity may not, because
  historical records, pinned tests and stored match results reference it.
- **Surfaces, per supported language** — the abbreviation, the expansion, the
  hyphenated and unhyphenated spellings, the common misspelling if it is common
  enough to be a real surface, the local-language form and its usual inflected
  stem.
- **Its place in the hierarchy** — a parent, or an explicit statement that it is
  a root. "No parent yet" and "deliberately a root" are different states and
  must not share a representation.
- **Its family** — the role domain it belongs to, used for coverage reporting
  and for keeping non-founding domains visible.

## Decision rules for authoring

- **When two surfaces denote the same capability at the same granularity**, they
  are aliases of one term. Not two terms with a sibling link — aliases. Sibling
  links carry credit; aliases carry none, because there is nothing to bridge.
- **When one surface is a strictly narrower instance of another**, they are two
  terms in a parent/child relation, never aliases. Aliasing a specialization to
  its parent destroys the only distinction the hierarchy exists to make and
  silently upgrades everyone who claims the general to the specific.
- **When a surface is ambiguous across families** — the same word naming a
  capability in two unrelated domains — do not attach it to whichever term needs
  it. Either qualify both surfaces so neither is bare, or leave the ambiguous
  surface off both. A bare ambiguous alias is a claim the record does not hold,
  and it will fire on the family it was not written for.
- **When a term is a vendor product standing in for a discipline**, model the
  discipline as the parent and the product as the child. Requirements are
  written both ways and only the hierarchy can relate them correctly.
- **Never alias across languages by transliteration alone.** A form that merely
  looks like the term in another language is a surface only if practitioners
  actually write it.

## The authoring lint

A hand-maintained graph rots in specific, detectable ways, and the lint is
cheaper than the rot. It should run in the same suite as everything else and
fail on:

- **Duplicate surfaces** — one string resolving to two canonical terms. This is
  a coin flip in production, resolved by whichever entry the loader saw first.
- **Orphaned parents** — a parent identity that no term defines.
- **Cycles** — a term reachable from itself through parent links; a hierarchy
  walk over a cycle is an infinite loop or a truncation, and both are silent.
- **Empty surface sets** — a term nothing can resolve to is dead weight that
  still inflates coverage denominators.
- **Missing-language surfaces** — a term with surfaces in only one supported
  language. This is the single highest-yield lint rule in a bilingual product
  and it belongs to
  [bilingual-surface-parity-and-coverage-floors](bilingual-surface-parity-and-coverage-floors.md).
- **Surfaces that are substrings of other surfaces within a shared prefix
  family**, flagged for human review — not always wrong, but always worth a
  second look given how these behave under compaction.

The lint's job is to make the graph's invariants machine-checked so that the
review of a taxonomy pull request can be about *domain judgment* rather than
about bookkeeping.

## The coverage gate

Beyond structural validity, hold a gate on *reach*: given a corpus of realistic
requirement text, what fraction of the terms it contains resolve to canonical
identities? Report it per family and pin the number, so a change that moves it
must re-pin it where a reviewer will see it — the ratchet mechanics belong to
[bilingual-surface-parity-and-coverage-floors](bilingual-surface-parity-and-coverage-floors.md).
A taxonomy without a coverage gate improves in the direction of whatever its
maintainers last happened to read.

## When not to use this

- **Do not canonicalize free-text competencies that are not capabilities.**
  Statements about motivation, working style or seniority are not skills, and
  forcing them into a skills graph produces terms whose "match" means nothing.
  They belong in the assessment vocabulary, not here.
- **Do not extend the graph inside a matching run.** A matcher that mints terms
  when it meets unknown strings produces a vocabulary nobody reviewed and a set
  of relationships nobody asserted. Unknown terms take the honest path in
  [unmodelled-term-graceful-fallback](unmodelled-term-graceful-fallback.md) and
  land on a work queue instead.
- **Do not model a capability so finely that no requirement is ever written at
  its granularity.** A term nothing resolves to costs maintenance and buys
  nothing; granularity should follow how people actually write requirements.
