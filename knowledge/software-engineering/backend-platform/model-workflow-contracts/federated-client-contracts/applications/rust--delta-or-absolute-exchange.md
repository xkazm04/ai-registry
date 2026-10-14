---
layer: application
type: application
subject: federated-client-contracts
technique: delta-or-absolute-exchange
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# Finiteness before the tag, in a benchmark federation's contribution digest

tracklight's collective contribution is the fleet's one federated client: an instance folds its
benchmark runs into a digest and pushes it to a hub, which replaces that contributor's whole
stored set on every accepted push (`crates/api/src/collective/ingest.rs`, "delete-then-replace").
Applied against `lighttrack` at commit `3e32446`; landed as `0825d88` on `main`.

## Which half of the technique has a seam, and which does not

The technique has two halves: a payload that declares whether it is a difference or a full
state, and a site-side finiteness check before the payload leaves. The first half has no seam
here and the absence is structural rather than an oversight: the exchange is absolute by
construction (the hub replaces, never accumulates, and the digest is typed "a full digest"),
so there is no second kind for a tag to distinguish. Adding a `kind` field would be a
vocabulary with one member. The return condition is a delta transport, for example a
contributor sending only changed buckets, at which point the tag becomes mandatory and the
hub must refuse an untagged payload rather than infer it.

The second half has a seam, and it was chosen because it could falsify the technique: the hub
already refuses non-finite entries per entry (`sanitize::implausible`), so if the hub-side
check were sufficient the site-side one would be redundant and the technique's ordering
("check at the site, before the tag") would be refuted for this stack.

## A and B

Arm A, the tree as it was: a benchmark run whose mean score is NaN, or whose pass rate is
infinite, is admitted by `run_stat`, joins a bucket, and the bucket's quality is NaN. The
digest serialises it as JSON `null`. Reading the same wire text back as a digest fails with
`invalid type: null, expected f64`. The hub's per-entry filter never runs, because the body
does not parse: one diverged run sinks the entire contribution, healthy buckets included,
and the contributor sees an opaque rejection rather than a typed skip. Admitted runs in a
three-run probe (NaN, infinite pass rate, one healthy): 3.

Arm B: `run_stat` declines a run whose quality, pass rate or per-case cost is non-finite. The
same probe admits 1, and the digest round-trips. The hub-side filter is not made redundant:
it still guards a contributor that is not this client.

Target: non-finite runs reaching a digest, 2 to 0. Floor: the workspace suite (472 tests in the
api crate, 47 of them collective) green, clippy `-D warnings` clean, and the digest of a finite
run unchanged. The finding held: the hub-side check does not substitute for the site-side one,
because the failure is at the parse, upstream of the hub's filter.

## What was not done

The skip is silent at the site: the digest has no field disclosing how many runs were declined
for divergence. The technique asks for a typed outcome the platform can act on, and this is
the gap. It was left because a disclosure field is a wire change (the digest's schema version
and the hub's tolerance for unknown fields), which is a decision for the project, in the same
shape as the existing `buckets_withheld` disclosure. Return condition: when a divergent run is
reported by an operator, the count belongs on the digest, outside the content hash.
