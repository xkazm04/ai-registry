---
layer: application
type: application
subject: index-free-random-access
technique: framing-recovery-by-hypothesis-rejection
stack: rust
verified_on: 2026-09-07
verified_against: rust@1.85
---

# The primitive extracted into its own library, and the refusal kept

The tree where this technique was reconciled implements boundary recovery not
in the application but in a separate parsing library, consumed here through a
seeker constructed from a seekable reader. The version witness is the
toolchain file pinning the channel to `1.85.0`.

## What the tree confirms

**Two hypotheses, structural rejection, similarity only for the residual.**
The design write-up describes the procedure in the technique's order: read a
bounded window from the landing point twice — once as-is, once as though a
quote had opened immediately before — parse both, and reject whichever yields
records whose field count is inconsistent with the sampled expectation. Both
surviving is described as improbable but real, occurring when a text field's
punctuation happens to mimic the artifact's own structure, and it is the case
that gets the expensive tie-break: a cosine similarity between each
hypothesis's per-field mean sizes and the head sample's, with the observed
separation reported as one hypothesis above 0.9 and the other below 0.2.

**The sample is one object with a named shape.** Field count, maximum record
size, and a vector of per-field mean sizes, over 128 records. Every constant
downstream is derived from it. The write-up prints an example sample, and the
per-field vector visibly carries the information the tie-break needs — one
field averaging 4908 bytes against neighbours in the tens.

**The refusal survived into the library's contract.** The write-up states that
where neither hypothesis is plausible the seeker will not produce a wrong
offset and will report that it cannot find one, and names the situation that
produces it — reaching the end of the stream with too few bytes left to
decide. The technique's requirement that a caller be given something to branch
on is met at the type level rather than by convention.

## The structural fact: the defeaters are published, and they are a boundary

A tool advertising a capability rarely enumerates the data that defeats it.
This one does, in a section of its own, and the enumeration is what makes the
technique's precondition writable at all.

Three defeaters are named. A varying field count — acknowledged as legal in
the format and produced in practice as a sparse-data compression trick, where
trailing empty fields are simply omitted. A record-size distribution that is
skewed or multimodal, with two concrete shapes: an artifact whose record sizes
grow monotonically, and one whose leading region is sparse and whose trailing
region is dense. And artifacts too small to sample at all.

The second of those is the one a reader would not derive unaided, and it
explains *why* the head sample is the weak point rather than the parser: the
sample characterises a region, and the procedure silently assumes that region
represents the whole. The mitigation offered is honest about its limits — a
larger sample sometimes helps and sometimes does not.

**The extraction into a separate library is itself the structural evidence.**
The recovery primitive is not a private helper inside the command that needed
it; it is a published seeker type with its own documented method for finding
the record after a given offset. Four distinct capabilities in this tree —
segmentation, single-artifact parallelism, cheap sampling, and bisection —
consume that one operation. Nobody builds a library boundary around an
implementation detail; the boundary exists because the primitive turned out to
be the thing, and that is the claim the golden path makes about the subject's
shape, confirmed by a packaging decision rather than by prose.

## What this realization cannot do

The tie-break threshold is not exposed or documented as a tunable, and the
write-up's own qualifier — that the separation is usually clear-cut but
"your mileage may vary" — is the whole guidance available. A reader adopting
this needs to know what their own separation looks like on their data, and
this realization provides no instrument for measuring it.

The cheap-sampling capability built on the same primitive is documented with
unusual candour about its distribution — a record's selection probability is
proportional to its byte size — but that disclosure lives in the flag's help
text rather than in the type. Nothing prevents the size-weighted draw from
being consumed as though it were uniform; the guard is that the flag is named
to signal it is not serious.
