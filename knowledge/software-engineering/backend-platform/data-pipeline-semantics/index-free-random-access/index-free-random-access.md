---
layer: golden-path
type: golden-path
subject: index-free-random-access
status: forged
use_when:
  - starting to read a large record-oriented artifact somewhere other than its beginning
  - deciding whether to build an index over a file or address it directly
  - parallelising work over one artifact rather than over many
  - resuming a long job that has already written part of its own output
techniques:
  - framing-recovery-by-hypothesis-rejection
  - structure-derived-read-budget
  - segment-then-parallelize
  - sorted-data-as-a-read-only-index
  - conservation-sweep-over-a-partition-parameter
  - reversible-encoding-buys-tail-recovery
---

# Index-free random access

The job is narrow and it is stated in one sentence: **you have a large
record-oriented artifact on local storage, and you want to start reading it
somewhere other than the beginning, without first reading all of it.** Not
ingesting it, not transforming it, not moving it between systems — addressing
it. Everything in this subject is downstream of that one capability, and the
capability has exactly one hard part, because a byte offset into such an
artifact is not, by itself, interpretable.

It is not interpretable because the formats that survive in this role escape
their own separators **in band**. A field may legitimately contain the
character that separates records; the format accommodates that by quoting the
field, and quoting is what destroys the local meaning of a byte. Land on a
record separator and you cannot say whether it ends a record or sits inside a
quoted field. Land on a quote character and you cannot say whether it opens a
field or closes one. There is no per-record header to synchronise against, no
in-band marker, and no length prefix. Reading forward until the next separator
— the answer everybody reaches for first — is wrong roughly as often as the
data contains prose.

## The precondition, before anything else

**Two properties gate this entire subject, and a reader whose artifact lacks
either should stop here and scan linearly.**

The first is a **seekable stream**. Everything below is byte-offset
arithmetic against a stream that can be positioned. A pipe cannot do it, and
neither can a stream compressed as one continuous member — the offsets you
compute address the compressed bytes, and the decompressor cannot start in the
middle. A block-compressed container with a companion offset index restores
seekability and is the honest workaround; a plain compressed stream has none,
and pretending otherwise buys a full decompression pass wearing the costume of
a jump.

The second is **structural homogeneity**. The recovery step below works by
rejecting a hypothesis that produces structurally inconsistent records, so it
needs records that are structurally consistent when read correctly: a stable
field count, and a record-size distribution that a small head sample
represents. An artifact whose field count varies row to row defeats it
outright. So does one whose record sizes are strongly skewed or multimodal —
a file whose rows grow monotonically, or whose head is sparse and whose tail
is dense — because the sample then describes a region rather than the file. A
larger sample sometimes rescues these and often does not.

And the honest third thing, which belongs at the top rather than in a caveat:
**on a small artifact none of this is worth doing.** A file that fits
comfortably in memory has no jump worth making, and the sample the whole
apparatus derives its constants from cannot even be collected. The entire
subject is a trade that only pays above a size at which a linear pass is
itself expensive.

## Where this subject starts and stops

The closest neighbour is
[stream parsing](../../../llm-agent/runtime-and-io/streaming-output/techniques/stream-parsing.md),
and the discriminator is one sentence: **that subject's reader knows where it
is; this subject's reader must establish where it is from local evidence.**
Framing before parsing, carrying the tail across a chunk boundary, bounding a
frame, the typed-event vocabulary above the framer — all of that assumes a
reader that started at a frame boundary and never lost it, which is the normal
case and the one worth optimising. This subject owns the abnormal entry: a
reader dropped at an arbitrary byte, with no history, that has to decide where
the next record begins before any of that machinery can start. The two compose
in the obvious order — recover the boundary here, hand the aligned stream to
the framer there — and neither restates the other.

Refusal is owned elsewhere and cited here.
[Refuse rather than emit a sentinel](../../../engineering-assessment/measurement-method/modelled-performance-estimates/techniques/refuse-rather-than-emit-a-sentinel.md)
already carries the rule and its domain test, and this subject does not
re-derive either. What it adds is narrow and worth naming precisely: there,
the refusal originates in an **input being unavailable**; here it originates in
a **discriminator failing to separate two hypotheses that both survived**. The
obligation is identical and the diagnosis is not, because the second one is
fixable by sampling more.

[Native document format](../../../integration/acquisition-and-ingest/native-document-format/native-document-format.md)
owns a format as a published contract with an unbounded set of readers:
declared generations, a stated extension mechanism, machine-facing
serialization that no locale reaches. That is a set of obligations a format
owes its readers. The last technique here asks a different question in the
other direction — **which encoding properties buy which recovery
capabilities** — and a team choosing between two escape schemes needs both
answers, from both places.

[Execution-state checkpointing](../../work-execution/execution-state-checkpointing/execution-state-checkpointing.md)
models progress as state written *beside* the work, and everything it says
about validity, fingerprints and refusal holds where that separation exists.
The tail-recovery case here is the one where **the output artifact is the
checkpoint** and no separate state exists at all. That is the interesting half
of the boundary: a checkpoint written beside the work can disagree with the
work, which is why that subject spends its length on whether a capture may be
resumed; an output that *is* the progress record cannot disagree with itself,
and the question collapses to whether the last record is complete.

The siblings in this category own how a *transform chain* behaves —
[what may be deferred and where it is flushed](../deferred-operation-fusion/deferred-operation-fusion.md),
[what may be inverted and what a journal must carry](../reversible-transform-pipelines/reversible-transform-pipelines.md).
This subject owns how the *input is addressed*, before any transform runs. A
reader asking what stage four receives from stage three is there; a reader
asking which bytes stage one starts on is here. They compose and neither is a
prerequisite for the other.

Finally, verification. [Test harness](../../../engineering-process/build-and-release/test-harness/test-harness.md)
and [quality gates](../../../engineering-process/standards-and-gates/quality-gates/quality-gates.md)
own property testing and gate design in general. The fifth technique below is
much narrower and says so: a strategy for a component that has **no oracle**,
where no expected output can be written down at all, but a conservation law
over a swept parameter can.

## The primitive, and the five things it buys

The enabling primitive is a single operation — *given a byte offset, return
the offset of the next record boundary after it, or refuse* — and the whole
subject stands or falls on it. It is built by enumerating the hypotheses about
your position (there are two: inside a quoted field, or not), parsing forward
under each, and rejecting whichever produces records that violate a structural
invariant learned from a head sample. Where both survive — which happens, and
which is the case naive implementations never see in testing — a shape profile
compares each hypothesis's per-field size distribution against the sample's,
and the winner is usually unambiguous. Where neither survives, the operation
refuses. That is
[framing recovery by hypothesis rejection](./techniques/framing-recovery-by-hypothesis-rejection.md),
and the ordering inside it is the transferable part: **cheap structural
rejection first, expensive similarity only for the residual.**

The speculative parse must be bounded in **bytes derived from sampled
structure**, never by "read until some number of records parse". This is not a
tuning detail; it is the difference between a bounded operation and an
unbounded one. The wrong hypothesis — reading an unquoted region as though a
quote had opened — consumes to the end of the file, so a record-count stop
condition makes the failing branch cost proportional to file size, which is
exactly the cost the design exists to avoid. The budget, the field count, the
shape profile and the record-count estimate all come from **one head sample**,
which is the subject's single source of derived constants.
[Structure-derived read budget](./techniques/structure-derived-read-budget.md)
carries the sample and the asymmetry that makes it necessary.

With the primitive in hand, four capabilities follow that otherwise require an
index somebody has to build, invalidate and ship.

**Segmentation, and therefore parallelism over one artifact.** Divide the
byte range arithmetically, realign each boundary to the next record, and hand
each thread its own range. The win is concurrent IO rather than concurrent
compute, which is why the topology matters: for record work whose per-record
CPU cost is below the cost of moving a record between threads, one reader
broadcasting to a worker pool pays coordination for a gain that is not there.
It also means thread count is bounded by **device concurrency, not core
count**, and that ordering is the thing segmentation spends — output arrives
in arbitrary order once threads flush independently, and buying order back
costs bounded buffering per segment.
[Segment then parallelize](./techniques/segment-then-parallelize.md) carries
the discriminator, the ordering cost and the measurement protocol.

**Point lookup over sorted data.** Bisection tolerates landing *near* a record
rather than *on* one, provided the search's invariants are maintained against
the approximation instead of against exact positions. A sorted artifact plus
approximate addressing is therefore already a read-only search index, with
nothing auxiliary to build or keep current — though sortedness is itself a
precondition somebody must maintain, so the technique moves cost to write time
rather than removing it.
[Sorted data as a read-only index](./techniques/sorted-data-as-a-read-only-index.md)
carries the invariant discipline and the trade.

**Tail access, and resumption from your own output.** If the format's escape
scheme is **symmetric** — the escape is a doubled occurrence of the escaped
character rather than a directional prefix — the byte stream is still valid
read backwards, and the last records can be reached in constant time by
feeding bytes in reverse to the same parser. That single encoding property is
what turns an output file into its own progress record.
[Reversible encoding buys tail recovery](./techniques/reversible-encoding-buys-tail-recovery.md)
carries the mechanism, the property to test an encoding for, and the
constraint that it does not survive compression.

**Cheap approximate sampling**, which is the capability most often taken
without disclosure and so is worth stating here rather than in a technique.
Drawing *k* random byte offsets and recovering the record after each yields a
sample in time proportional to *k* rather than to the record count. What it
does not yield is a uniform sample: a record's probability of selection is
proportional to its **size in bytes**, so long records are over-represented by
exactly the factor nobody measures. That is acceptable for debugging and
eyeballing and unacceptable for anything a number is computed from, and the
distinction belongs in the interface — a size-weighted draw is a different
operation from a uniform one and must not answer to the same name. The same
sample that supplies the read budget also supplies a record-count estimate,
which is what lets the cheap path decline: when the requested sample is a
large fraction of the estimated population, the cheap draw degenerates and the
correct behaviour is to fall back to a single linear pass.

## What the primitive owes its callers

**It refuses rather than guessing.** A wrong boundary does not fail; it
produces mis-parsed records that are structurally valid and semantically
nonsense, and nothing downstream can tell. Every caller is therefore entitled
to a refusal it can branch on, at a point where falling back to a linear scan
is still possible — and a refusal is not the same as an empty result
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
The refusal is also not the same as zero: an estimate that could not be made
must not be reported as a count of nothing
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). Both
laundering points are real and both are one careless line of code apart from
the correct behaviour.

**It is honest about the two positions it cannot serve.** The first record
after the header cannot be reached this way, because the procedure works by
skipping the record it landed inside; and the last records cannot be reached
when there is not enough remaining data to fill the read budget. Neither is a
defect, and both have the same remedy: the head is already known from the
sample, and the tail is reached either by jumping further back and scanning
forward, or by reading the stream in reverse.

**Every constant it uses is derived and the derivation is written beside it**
([limits-are-derived](../../../_laws.md#limits-are-derived)). The budget is a
multiple of the sampled maximum record size. The count estimate is the stream
length over the sampled mean. The sample size itself is the one genuinely
free parameter, and it is a floor set by how many records it takes to
characterise the file — not a number to be tuned by feel and then raised by
feel when a file defeats it.

## Verification, when there is nothing to compare against

The uncomfortable property of this whole design is that its central component
is **heuristic and has no oracle**. There is no expected byte offset to assert
against; nobody can independently derive where boundary three of seven ought
to fall in an arbitrary file, and a fixture that pins one file at one
parameter value asserts a number whose only provenance is that the
implementation produced it once.

What can be asserted is a **conservation law swept across the parameter that
varies**: for every partition count in a range, partition the artifact, count
records within each part independently, and assert the sum equals the count
from one linear pass. That proves the partition is exhaustive and
non-overlapping — no record dropped, none counted twice — and proves nothing
about whether any individual boundary is where it should be, which is
precisely the claim nobody can make anyway. The sweep is the part that finds
the bug, because a partitioner is nearly always correct at one part and at
two.
[Conservation sweep over a partition parameter](./techniques/conservation-sweep-over-a-partition-parameter.md)
carries the construction, and generalises it: **invariant plus swept
parameter** is the instrument for any component whose output is unpredictable
but constrained.

The rule that follows, and that is broken more often than the technique is
missing: a conservation sweep that exists as a script somebody runs by hand is
not a guard. It protects the run in which somebody remembered it
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)), and the
component it protects is the one whose failures are silent.

## What "done" looks like

The boundary-recovery operation returns an offset or a refusal and never a
guess, and there is a test that lands inside a quoted field containing the
record separator and asserts the refusal or the correct answer rather than
whichever the implementation happens to give. The speculative read is bounded
in bytes, and the bound is computed from the sample rather than written as a
literal. The sample's contents are stated — field count, maximum record size,
per-field mean sizes — and every constant downstream names which of them it
derives from. Segmentation is verified by a conservation sweep that runs in
the build, not by a fixture and not by hand. Parallel output either carries a
segment ordinal that restores order without buffering, or documents that it is
unordered; it does not quietly do the second while callers assume the first.
Tail access is present where the encoding permits it and absent — loudly —
where it does not, rather than degrading into a full scan nobody notices. And
every published measurement carries the storage medium and the workload in the
same sentence as the number
([count-carries-predicate](../../../_laws.md#count-carries-predicate)),
because the entire benefit here is a property of the device, and a figure
measured on local flash storage is not a claim about a network object store.

## The techniques

- [framing-recovery-by-hypothesis-rejection](./techniques/framing-recovery-by-hypothesis-rejection.md)
  — enumerating the live hypotheses, the structural invariant that rejects,
  the shape tie-break for the residual, the refusal, and the defeaters.
- [structure-derived-read-budget](./techniques/structure-derived-read-budget.md)
  — the cost asymmetry of a speculative parse, the head sample as the single
  source of derived constants, and why a record-count stop condition is
  unbounded.
- [segment-then-parallelize](./techniques/segment-then-parallelize.md) — the
  IO-bound discriminator, device concurrency as the thread bound, what
  segmentation costs in ordering, and the measurement protocol.
- [sorted-data-as-a-read-only-index](./techniques/sorted-data-as-a-read-only-index.md)
  — bisection under approximate positioning, the invariant discipline, the
  bounded linear finish, and the trade against a built index.
- [conservation-sweep-over-a-partition-parameter](./techniques/conservation-sweep-over-a-partition-parameter.md)
  — verifying a component with no oracle, what conservation proves and what it
  does not, and why the sweep is the part that finds the bug.
- [reversible-encoding-buys-tail-recovery](./techniques/reversible-encoding-buys-tail-recovery.md)
  — symmetric escaping, reverse reading, the output artifact as its own
  progress record, and the compression constraint.
