---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: unbiased-weighted-sampling
status: forged
laws: [checkability-routes-the-pixel]
shared_with: []
use_when: [turning a random value into one or more winners, writing the byte-level specification of a draw, reviewing a draw for modulo bias or ordering ambiguity]
---

# Unbiased weighted sampling, specified to the byte

The derivation turns one beacon value and one frozen list into an ordered list of winners.
It must be exactly uniform with respect to the weights, and it must be specified so
precisely that a stranger's implementation produces the same winners. Both requirements
are stricter than most code that "picks a random winner" meets.

## Expanding one value into many words

A beacon value is a fixed-size digest; a draw may need many random words — one per pick,
plus rejections. First derive a draw seed: a hash over a **purpose tag** that names this
use (so the same round reused for another purpose yields unrelated words), the beacon
value, the draw's commitment digest (so two draws sharing a round differ), and the frozen
entries themselves. Then expand: each word is a hash over the seed and a **counter**. Each word is the first eight bytes of one hash output, read in a stated byte
order. The counter increments on **every candidate word**, accepted or rejected, so the
sequence of words is a pure function of the inputs and a verifier walking it never has to
guess how many words a rejection consumed.

## Reducing a word to a range without bias

A 64-bit word reduced to *[0, n)* by remainder is biased toward the low residues whenever
*n* does not divide 2⁶⁴. Reject instead: compute the limit as the largest multiple of *n*
not exceeding 2⁶⁴ — *floor(2⁶⁴ / n) · n* — draw words until one falls below the limit, and
take its remainder. The rejection probability is below one half for every *n*, so the
expected number of words is under two; in practice, for list sizes of thousands, a
rejection is rare. Faster multiply-shift reductions exist and are also exactly unbiased
with their own rejection step; either is acceptable, but the specification names one and
every implementation uses it, because two unbiased methods give different winners from the
same word stream.

## Weighted without replacement

For weighted entries, the range is the total weight. Lay the entries out in canonical
order with their cumulative weights, draw a uniform integer *r* in *[0, total)*, and pick
the first entry whose cumulative weight exceeds *r*. Remove it, subtract its weight from
the total, and draw again for the next winner. Weights are integers, never floating point:
two languages disagree about the last bit of a float sum, and that bit decides a pick.
An entrant listed twice is a list defect fixed before freeze; the derivation does not
deduplicate, because deduplication rules are a second algorithm.

## The specification

Write it as a document a stranger implements from, and keep it beside the code under
version. It fixes: the canonical serialisation of the list (sort key, text normalisation,
integer encoding, separators); the digest algorithm; the expansion input layout, byte by
byte; word width and byte order; the reduction method and its limit; the
without-replacement loop; the version string itself. A draw record names its version, and
an old record is verified by the old version forever.

## Decision rules

- When weights could be large, bound the total so that it fits the word with room for
  the rejection limit to be meaningful; refuse to freeze a list whose total exceeds the
  bound rather than silently widening arithmetic.
- When a list has one entry or the winner count equals the entry count, still run the
  derivation; it fixes the order, and a special case is a branch the verifier must also
  carry.
- When a winner is later disqualified, the replacement is the next pick from the same
  word stream over the remaining entries — but only if the specification says so and
  the verifier walks it too. Without a written replacement rule, a winner that fails a
  post-derivation check fails the attempt; there is no third option.
- When displaying winners on stream, render them from the verified derivation output by
  deterministic code. The names are checkable facts; nothing generated or hand-typed
  draws them, and the animation that reveals them has no random call of its own.
- When explaining the draw to the room, show the trace: each candidate word, accepted
  or rejected against the limit, and the ticket it landed on. A rejection that is visible
  is the clearest demonstration available that no entry was favoured.

## When not to use it

A draw with no weights is the degenerate case of the same algorithm with every weight one;
keep one code path. Shuffling the whole list and taking a prefix is an equivalent design
when specified as exactly — the standard is not the cumulative-sum loop, it is that the
method is unbiased, integer-only and written down.
