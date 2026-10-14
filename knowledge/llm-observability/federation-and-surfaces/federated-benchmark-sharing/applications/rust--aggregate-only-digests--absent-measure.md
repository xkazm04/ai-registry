---
layer: application
type: application
subject: federated-benchmark-sharing
technique: aggregate-only-digests
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# A missing pass rate shipped as zero

The golden path's rule is "when a measure cannot be computed, ship its absence".
A consumer applied it to between-run variance (a single-run bucket carries
`None`, not `0`) and left the sibling measure unguarded: the reduction from a run
scorecard to a digest input read the run's optional pass rate with
`unwrap_or(0.0)`.

A run that recorded no pass rate therefore entered its bucket as a run where
nothing passed. The digest row has a required `pass_rate` field, so absence could
not be shipped per row; the bucket then case-weighted that zero into a mean
presented as evidence. One unrecorded run beside one fully passing run of equal
size published a bucket pass rate of 0.5.

## The change

Because the wire row cannot say "unknown", the decision is made one step earlier,
at the site: a run with no pass rate does not join a bucket (the same place a
non-finite run is already refused). The bucket is then built only from runs that
measured the thing it reports.

## Measurement

Paired, same test over both source trees: old source publishes 0.5 for the
bucket, new source 1.0. The collective suite (49 tests), `clippy -D warnings` and
`fmt` are green. Not measured: how many live runs lack a pass rate.

## Decision rule this adds

Check every optional input a digest reduces for a defaulting read
(`unwrap_or(0)`, `unwrap_or_default()`). A default is a fabricated measurement
whenever the field's required wire shape leaves no room for absence: drop the
run at the source or widen the row, never default.
