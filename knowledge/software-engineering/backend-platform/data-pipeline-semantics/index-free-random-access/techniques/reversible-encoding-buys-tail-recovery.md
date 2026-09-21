---
layer: technique
type: technique
subject: index-free-random-access
technique: reversible-encoding-buys-tail-recovery
status: forged
laws: [record-precedes-effect, limits-are-derived]
shared_with: []
use_when: [choosing an escape scheme for a record format, reading the last records of a large artifact without scanning it, resuming a long job that already wrote part of its output, deciding whether progress needs a checkpoint file of its own]
---

# Reversible encoding buys tail recovery

Escaping schemes are usually chosen on aesthetics — which one looks cleaner,
which one the neighbouring format used. One structural property of the choice
has a consequence out of all proportion to the attention it gets:

> **If the escape is a doubled occurrence of the escaped character rather than
> a directional prefix, the encoded byte stream is still valid when read
> backwards.**

A prefix scheme — a marker character that modifies the character *after* it —
is directional by construction. Reversed, every marker now sits after the byte
it was supposed to modify, and worse, a run of markers cannot be disambiguated
locally: reading backwards you cannot tell whether the marker you just passed
is escaping the next byte or is itself escaped. A doubling scheme has no such
asymmetry, because the escape and the escaped character are the same
character, and a pair is a palindrome. Reversed, a doubled pair is still a
doubled pair; a lone occurrence is still a lone occurrence.

## What the property buys

**Constant-time access to the end of the artifact.** Position at the end,
buffer backwards, feed the bytes in reverse to the same parser, and reverse
each yielded record and its fields. The cost is proportional to the number of
records you want, not to the size of the artifact. Without the property, the
only way to read the last records of a large artifact is to read all of it.

That capability sounds narrow and is not, because of what it enables:

**The output artifact becomes its own progress record.** A long job that
appends its results as it goes can, on restart, read its own last record in
constant time and resume from there. No checkpoint file, no sidecar, no state
store, no coordination between two things that can disagree.

That last clause is the real prize. A checkpoint written *beside* the work is
a second record of the same fact, and the two can diverge in both directions:
the checkpoint can be ahead of the output, if it was written first and the
process died before the effect landed — which is the ordering
[record-precedes-effect](../../../../_laws.md#record-precedes-effect)
prescribes and which trades a lost item for a duplicated one. Or it can be
behind, if the effect landed first, which trades the duplicate for a silently
missing item. Every checkpointing design spends its length on choosing which
of those to suffer and on detecting the resulting inconsistency.

When the output *is* the record, the question does not arise. There is one
artifact, it cannot disagree with itself, and the only remaining question is
whether the last record was written completely — which is a parse, not a
reconciliation.

## The condition that makes resumption sound

The technique is not free, and it has one real precondition beyond the
encoding: **the work must be resumable from a record's identity, and the
appended record must contain that identity.**

If the output rows do not say which input each came from, the tail tells you
how many results exist but not which inputs produced them, and resumption
degenerates into "assume the first *n* inputs were consumed", which is only
correct if the job is strictly ordered and never skips. Carry the input's
identity in the output row, and resumption becomes a set difference that
survives reordering, filtering and parallelism.

The second, smaller precondition: **appends must be atomic enough that a
partial record is detectable.** A crash mid-write leaves a truncated final
record; the reverse reader must discard it rather than parsing it into a
plausible short row. A record that fails to parse under the reverse reader is
the ordinary case at the tail of a crashed job, not an error to propagate.

## Where it stops working

Three constraints, all worth stating before adopting:

- **Compression defeats it**, and this is the constraint that bites in
  practice, since large artifacts are usually compressed. The offsets you
  compute address compressed bytes, and a stream compressed as one continuous
  member cannot be decompressed from the middle or the end. A **block**
  compressed container with a companion offset index restores the capability;
  a plain compressed stream does not, and no amount of care recovers it.
- **The stream must be seekable.** A pipe has no end to position at.
- **The reverse reader is a second parser path**, and it needs the same tests
  as the forward one. It is the code that runs only after a crash, which is
  the code least likely to be exercised — and the buffering is genuinely
  fiddly, since the reader must read backwards in blocks while records may
  straddle any block boundary. Size that buffer from the sampled maximum
  record size rather than picking a number
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)), or the
  reader will fail on exactly the long records that motivated the format's
  quoting rules in the first place.

## Choosing an encoding, when you get to choose

Most readers meet a format they did not design, and for them this technique is
a capability test: *does my format double its escapes or prefix them?* — which
decides whether tail recovery is available at all.

For the rarer reader who is designing the format, the property is worth
buying deliberately, and it is nearly free at design time. The cost of
doubling over prefixing is a slightly larger encoding for fields dense in the
escaped character and a parser branch of the same complexity. The return is
constant-time tail access forever, and the deletion of a whole checkpointing
subsystem from every job that appends to the format. Very few encoding
decisions have that ratio, which is why this one is worth making on purpose
rather than by inheritance.

## Decision rules

1. Test the escape scheme for symmetry: doubled, not prefixed. That single
   property decides whether tail recovery exists.
2. Where it holds, read the tail by reversing the byte stream into the same
   parser; do not write a second, forward-scanning "read the last *n*" path.
3. Prefer the output artifact as the progress record over a separate
   checkpoint, and say so — one artifact cannot disagree with itself.
4. Carry the input's identity in the output row, or resumption is only as
   correct as the job is ordered.
5. Discard an unparseable final record; at the tail of a crashed job that is
   the expected case.
6. Do not claim the capability over a continuously compressed or
   non-seekable stream, and derive the reverse reader's buffer size from the
   sampled record size.
