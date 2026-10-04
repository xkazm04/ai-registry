---
layer: technique
type: technique
subject: retrieval
technique: padded-slots-are-misses
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [an index is asked for more neighbours than it holds, a nearest-neighbour library returns a fixed-width result with filler slots, duplicated passages appear in a retrieved slice on a small corpus, resolving result identifiers through a positional list]
---

# Padded slots are misses

A nearest-neighbour search is asked for k results. Many engines honour the width of
the question before they honour the size of the index: ask for five from an index of
three and they return five slots, three real and two filled with a sentinel. The
sentinel is an integer, usually negative one, chosen because it cannot be a valid
identifier. That is sound for an engine whose callers look identifiers up in a map. It
is a trap for a caller that resolves them through a **positional list**, because a
negative integer is a valid position in most languages: it counts from the end.

The failure has a precise shape. The filler resolves to the last passage in the
content list. A retrieval that found three documents returns five, two of them copies of
the last one, and nothing errors. The duplicates do not look like a fault. They look like
a strong signal, because the same passage appearing repeatedly reads as repeated
agreement, and the consumer downstream treats the slice as evidence (see
[relevance-floors](./relevance-floors.md) for why an agent reasons on every chunk it is
handed). The defect is silent, deterministic, and **invisible at the scale every
developer tests at**: it needs an index smaller than k, which a real corpus never is
and a fixture always is.

## The rule

**A padded slot is a miss. Drop it at the boundary where the engine's result becomes
the system's result, and return a shorter list.**

- **Test for the sentinel before any lookup, not after.** The check belongs in the
  single place that turns engine identifiers into content, so every consumer of the
  slice inherits it. A check in the caller, or in the formatter, is one more place a
  second caller will forget.
- **Return short, never refilled.** Do not pad the list back to k with the next-best
  results from another lane or another index to make the width look right. Width is
  not a property the consumer was promised; fewer than k is the honest answer when
  fewer than k exist, and it is the same honesty the relevance floor defends from the
  other side.
- **Do not repair the sentinel into a real identifier.** Wrapping, clamping and
  taking the modulus all turn a miss into a plausible hit, which is the original
  defect with extra steps.
- **Let the short list reach the consumers intact.** A reranker, a prompt assembler
  and a fusion step that assume exactly k items will index past the end or pair the
  wrong rows. Read each one, because the sentinel handling is only as good as the
  weakest consumer of the shorter list.

## Testing it

The defect hides below the size of a real corpus, so the test fixture is the instrument:
build an index of three documents with orthogonal embeddings, ask for five, and assert
two things that catch different regressions. The returned passages are unique, and they
are exactly the real ones in rank order. Also cover the boundaries on either side: k
below the index size still returns k, k equal to the index size returns every passage
once, and an index of one passage does not repeat it. A test that asks only "did it
return something" passes against the broken path, which returns something in every case.

## When it does not apply

An engine that returns only real hits (a result set that is simply shorter) has no
sentinel to mishandle; the rule is then just "do not assume k". An engine that returns
identifiers to be resolved through a keyed map, where a missing key is a lookup failure
rather than a wrapped position, fails loudly and needs no special handling. And a
system whose index is guaranteed larger than any k it will ever use is exposed only at
the moment it is first bootstrapped or filtered down to a handful of documents, which is
precisely when nobody is watching.
