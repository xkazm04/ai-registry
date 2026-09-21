---
layer: technique
type: technique
subject: index-free-random-access
technique: framing-recovery-by-hypothesis-rejection
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [finding the next record boundary after an arbitrary byte offset, a format that escapes its own separators in band, deciding whether a jump landed inside a quoted field]
---

# Framing recovery by hypothesis rejection

When a format escapes its own separators in band, a byte offset carries no
local meaning. A record separator may end a record or sit inside a quoted
field; a quote character may open a field or close one. The naive recovery —
scan forward to the next separator — is not merely imprecise, it is silently
wrong on exactly the data that motivated quoting in the first place.

The recovery works because **the number of live hypotheses about your position
is small and fixed, and structural consistency rejects the wrong ones.** For a
format with one quoting mechanism there are two: you landed inside a quoted
field, or you did not. Parse forward under each. Reject whichever produces
records that violate an invariant the format's real data obeys. What survives
is your position.

## The procedure

1. **Enumerate the hypotheses.** Two, for a single quoting mechanism: read the
   bytes as they are, and read them as though a quote character occurred
   immediately before the landing point. There is no third — the enumeration is
   a property of the format's escape grammar, not a search space, and if your
   format's grammar admits more states then it admits more hypotheses and the
   procedure still works, more expensively.

2. **Parse each candidate byte series with an ordinary parser**, one that can
   report the offset at which each record started. Nothing bespoke is needed
   here and nothing bespoke should be written; a second parser written for this
   step is a second grammar to keep in agreement with the first.

3. **Discard the first and last parsed record from each series.** The first is
   discarded because you landed somewhere inside it and do not know where —
   discarding it is also what makes a two-character line terminator harmless,
   since a landing between the two characters is absorbed by the record you
   were never going to trust. The last is discarded because the read stopped at
   a byte budget, so it is almost certainly clamped mid-record.

4. **Reject on the structural invariant.** Count the fields of every remaining
   record and compare against the field count learned from the head sample. A
   series containing any record with an inconsistent or unexpected field count
   is rejected. This is cheap — a comparison per record — and it resolves the
   overwhelming majority of jumps on its own.

5. **Resolve the three outcomes.** Exactly one series rejected: the survivor is
   the answer, and the offset of its first fully-parsed record is the next
   record boundary. Both rejected: refuse. Neither rejected: tie-break.

6. **Tie-break on shape, not on structure.** Both hypotheses surviving is
   improbable and it does happen — it is what a field of free text does when
   its internal punctuation and line breaks happen to imitate the file's own
   structure. Structure has already said everything it can say, so the
   discriminator has to be a different kind of evidence: compare each
   survivor's **per-field mean size profile** against the sample's, by a
   similarity measure over the two vectors. Real columns have characteristic
   sizes — an identifier column is small, a text column is large — and a
   misaligned reading shuffles those sizes into a profile that does not match.
   The separation is normally decisive rather than marginal; a measured
   instance reports the correct hypothesis above 0.9 and the wrong one below
   0.2 on cosine similarity. Treat a *marginal* separation as no separation
   and refuse.

**The ordering is the transferable claim: cheap structural rejection first,
expensive similarity only for the residual.** The similarity computation
requires accumulating per-field sizes across every parsed record in both
series; running it on every jump would multiply the cost of the common case by
the cost of the rare one. Structure is a comparison; shape is an aggregate.
Spend the aggregate only where the comparison ran out of evidence.

## The refusal is not an edge case, it is the contract

When neither series survives, or when the shape tie-break does not separate
them, the operation reports that it cannot find the next record boundary. It
does not return the better-scoring hypothesis, and it does not return the
landing offset unchanged.

The rule itself belongs to
[refuse rather than emit a sentinel](../../../../engineering-assessment/measurement-method/modelled-performance-estimates/techniques/refuse-rather-than-emit-a-sentinel.md)
and is not re-derived here; what this technique adds is the **origin**. There,
a refusal means an input was unavailable, and the remedy is to obtain the
input. Here it means a discriminator failed to separate two hypotheses that
both survived, and the remedy is different in kind: sample more of the head,
or accept that this artifact is not addressable this way. Both refusals are
mandatory; the operator's next action is not the same, so the two must not
collapse into one message.

Two laundering points destroy the refusal downstream, and both are one line
of code wide. The first is a caller that treats "could not locate a boundary"
as "no records here"
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)) —
a segmenter that silently produces one fewer segment, a search that reports
not-found. The second is a caller that renders an unavailable estimate as
zero ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)),
which is the specific failure of a record-count estimate derived from a sample
that could not be collected: nothing in a count of zero says the instrument
did not run.

A wrong boundary is worse than either, and that asymmetry is the reason the
refusal is worth its cost. A wrong boundary does not throw. It yields records
with the right field count, plausible values, and every field shifted — data
that passes every downstream validity check and is nonsense. Nothing in the
system can detect it, which is why the detection has to happen here or nowhere.

## Decision rules

- **When the format escapes its separators in band, never resynchronise by
  scanning to the next separator.** That procedure is correct only for formats
  whose separator cannot appear inside a field, and for those formats this
  entire technique is unnecessary.
- **When enumerating hypotheses, derive them from the escape grammar, not from
  observation.** Two is the answer for one quoting mechanism. A format with an
  additional escape state has an additional hypothesis, and finding that out
  from a defect report rather than from the grammar is how this class of bug
  reaches production.
- **When both hypotheses survive structural rejection, tie-break on a
  distribution the sample already carries** — never on which parsed more
  records, which is a proxy for record size, and never on which parsed first.
- **When the tie-break is marginal, refuse.** The technique's value is that it
  is allowed to say no; a threshold tuned until it always answers has thrown
  that away.
- **When a caller cannot afford a refusal, give it the fallback rather than a
  guess.** Jump further back and scan forward, or read from the beginning. A
  refusal at a point where linear scanning is still possible is a cheap
  outcome; a wrong boundary is not an outcome at all.
- **When the invariant is learned rather than declared, learn it from the head
  sample and state the sample size beside it.** A field count assumed from a
  schema and a field count measured from the file disagree exactly on the files
  that defeat this technique, and the measured one is the one that rejects
  correctly.

## When not to use this

**When the field count is not stable.** A format that permits a varying field
count per record removes the invariant the rejection step runs on, and there
is nothing to replace it with. This is not hypothetical: sparse data is
sometimes stored by omitting trailing separators entirely, which is legal and
which defeats the technique completely. The correct response is to detect it
during sampling and decline, not to weaken the invariant into a range.

**When the record-size distribution is skewed or multimodal.** The sample's
shape profile is a claim that the head represents the file. A file whose
record sizes grow monotonically along its length, or whose opening region is
sparse and whose remainder is dense, breaks that claim while satisfying every
structural check — so the tie-break silently degrades to a coin flip in
exactly the region the sample does not describe. A larger sample sometimes
recovers it and often does not; assume it does not.

**When the stream cannot be positioned.** The technique reads forward from an
offset, twice. That requires seeking, which a pipe cannot do and a
continuously compressed stream cannot do either.

**When the artifact is small.** There must be enough bytes after the landing
point to fill the read budget and enough records in the head to characterise
the file. Below that size a linear pass is cheap anyway, and the right
implementation declines at sample time rather than failing per jump.

**For the first record and, sometimes, the last.** The procedure discards the
record it landed in, so it cannot return the first record after the header —
which is free, because the sample already read it. Near the end of the stream
there may not be enough remaining bytes to decide, and the remedy is to land
earlier and scan forward, or to read the stream in reverse where the encoding
allows it.
