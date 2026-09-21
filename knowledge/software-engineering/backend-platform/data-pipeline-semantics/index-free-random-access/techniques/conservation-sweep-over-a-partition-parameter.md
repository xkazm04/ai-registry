---
layer: technique
type: technique
subject: index-free-random-access
technique: conservation-sweep-over-a-partition-parameter
status: forged
laws: [count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [testing a component whose correct output cannot be written down, verifying that a partitioner drops or duplicates nothing, a heuristic covered only by fixtures asserting whatever it produced once, choosing what to assert about an approximate algorithm]
---

# Conservation sweep over a partition parameter

Some components cannot be tested by comparing their output to an expected
value, because **nobody can independently derive the expected value.** Asked
where boundary three of seven falls in an arbitrary artifact, there is no
authority to consult: the answer is whatever the artifact's bytes make it, and
computing it by another route means writing a second implementation and
trusting it more than the first.

A fixture written anyway does not solve this. It records a number whose entire
provenance is *the implementation produced it once*, and then defends that
number against change — so it fails when the component is improved, passes
when the component is broken in a way that happens to preserve the recorded
value, and pins exactly one artifact at exactly one parameter value. It looks
like coverage and is closer to a snapshot of a mood.

What *can* be asserted, without any oracle at all, is a **conservation law**:
a quantity that must be identical on both sides of the operation, whatever the
operation chose to do.

## The construction

For a partitioner, the law is that partitioning preserves the population.

> For every partition count *n* across a range, partition the artifact into
> *n* parts, count the records in each part independently, and assert that the
> sum equals the count from one linear pass over the whole artifact.

Three properties make this work where a fixture does not:

- **It needs no expected value.** The linear count is the ground truth and it
  is produced by the simplest possible code path, which is the one nobody
  doubts.
- **It is total over the artifact.** Every record is either counted once or the
  assertion fails. There is no region the test happens not to reach.
- **It runs on real artifacts.** Point it at whatever files the project
  actually has; the law holds for all of them, so no fixture curation is
  needed and the awkward ones — the ones with prose fields, embedded
  separators, unusual size distributions — are the most valuable inputs rather
  than special cases somebody has to think of.

## The sweep is the part that finds the bug

Running the law at one partition count is nearly worthless, and this is the
detail most often dropped. **A partitioner is almost always correct at one
part and at two.** One part is the degenerate case that exercises no boundary
logic at all; two exercises a single boundary, usually near the middle of the
artifact, in the region the head sample describes best.

The defects live at the extremes and in the interactions: many small segments,
where a segment may be shorter than the read budget and the recovery step
starts refusing; segments whose boundaries fall inside long records; the final
segment, whose end is the end of the stream rather than a recovered boundary;
and the case where two adjacent probes resolve to the *same* boundary, which
produces an empty segment and a duplicated one. Sweeping the parameter across
a wide range — one to a hundred and beyond, cheaply, because each run is a
count — visits all of them without anyone having enumerated them.

That is the generalisation worth carrying out of this subject:
**invariant plus swept parameter** is the instrument for any component whose
output is unpredictable but constrained. Other instances of the same shape: a
chunker swept over chunk size, asserting reassembly; a cache swept over
capacity, asserting that results match the uncached path; a sharding function
swept over shard count, asserting that every key lands in exactly one shard.

## What conservation proves, and what it does not

Being precise here is the difference between a strong test and a false sense
of safety.

**It proves** the partition is exhaustive and non-overlapping. No record was
dropped; none was counted twice; every byte of the artifact belongs to exactly
one part.

**It does not prove** that any individual boundary is where it "should" be —
and that is fine, because that claim is not available to anyone. It also does
not prove that the *contents* of each part are correct, only that the
population is. A partitioner that mis-parses every record identically in both
arms preserves the count and produces garbage. Where that risk is real, extend
the law rather than abandoning it: assert a checksum over the record contents,
or a sum over a numeric field, on both sides. The count is the cheapest member
of a family, not the only one.

The count is evidence **only because the predicate is identical on both
sides** ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
If the linear pass counts records and the partitioned pass counts something
subtly different — non-empty records, records after a filter, physical lines —
the assertion is comparing two quantities and will either fail forever or, far
worse, pass for the wrong reason. Write both counts through the same code path.

## It is only a guard if it runs unattended

A conservation sweep that lives as a script somebody executes by hand before a
release is not a guard; it is a diagnostic, and it protects only the runs in
which somebody remembered it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
component it protects is precisely the one whose failures are silent — a
partitioner that starts dropping records does not crash, it returns a smaller
answer — so the gap between "we have a test for that" and "the test runs" is
where the whole failure mode lives.

Two practical constraints, since the reason these sweeps end up manual is
always the same:

- **Keep the swept range wide and the artifact small in the build**, and run
  the wide-artifact version on a slower schedule. The bugs are found by the
  range, not by the size; a small artifact swept to a hundred parts is a fast
  test and catches more than a large artifact at two.
- **Report the parameter value on failure.** The assertion that fires says
  which *n* broke conservation, and that number is most of the diagnosis —
  failures at large *n* mean the segments got shorter than the budget,
  failures at one particular *n* mean a boundary landed somewhere specific.

## Decision rules

1. When no expected output can be derived, find a quantity the operation must
   preserve, and assert that instead.
2. Produce both sides of the conservation through the same predicate.
3. Sweep the parameter widely; a single value tests the case that already works.
4. State what the law proves — exhaustive and non-overlapping — and do not let
   it be read as proof that the boundaries are right.
5. Extend from a count to a content checksum where identical mis-parsing is a
   live risk.
6. Put the sweep in the build, or it is not protecting anything.
