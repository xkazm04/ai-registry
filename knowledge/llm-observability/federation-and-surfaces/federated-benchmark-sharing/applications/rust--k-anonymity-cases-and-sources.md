---
layer: application
type: application
subject: federated-benchmark-sharing
technique: k-anonymity-cases-and-sources
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# The case floor was enforced and undisclosed

A consumer of this subject enforced the **case floor** correctly and did not
implement the disclosure clause beside it. The golden path is explicit that both
are required: *"Rows withheld by the floor are disclosed as a count, never
silently absent — an empty board must be legible as 'held back', not read as
'nobody measured this'."*

The tree enforced the first half in the digest builder — buckets accumulating
fewer than `min_cases` are filtered out — and returned only the survivors, so the
number of withheld buckets was computed nowhere and appeared in no field of the
digest. The consent envelope beside it was disclosed properly
(`projects_included` / `projects_excluded`, with the comment *"Makes what leaves
the building legible before the POST"*), which is what makes the omission
legible as an oversight rather than a decision: the same author disclosed the
scope they had thought about and not the one they had not.

**The failure this produces is silent and one-directional.** An operator
previewing what their instance would contribute sees an empty entry list, and the
two states behind it — *nothing was measured here* and *everything measured here
was too thin to publish* — are indistinguishable. They lead to opposite actions:
run some benchmarks, or lower the floor.

## What was changed

`build_digest_counted` returns the withheld count beside the entries;
`build_digest` delegates to it and keeps its signature, so no existing caller
moved. `CollectiveDigest` carries `buckets_withheld`, serde-defaulted like the
consent fields so older hubs stay wire-compatible.

The load-bearing decision is what the count is **not** part of. The contribution
ledger gates repeat pushes on a hash of the digest, and that hash is built from
an explicit field list rather than the whole struct. Adding the count to it would
have been defensible — it is a real difference between two observations — and
would have made every existing instance's next push look like new content and
re-send unchanged data once. It was left out, on the grounds that the hash gates
whether a push carries new *evidence*, and two digests with identical entries
carry the same evidence however many thin buckets sat behind them. A test pins
that property so a later change cannot quietly reintroduce the re-push.

## The paired proof

**Measurable:** whether an operator can distinguish a board held back by the
floor from a board nobody measured.

| Arm | Input | Result |
| --- | --- | --- |
| A (before) | one bucket, 3 cases, floor 5 | `entries: []` — and no other output |
| B (after) | same | `entries: []`, `buckets_withheld: 1` |
| B control | no stats at all, floor 5 | `entries: []`, `buckets_withheld: 0` |
| B mixed | one 6-case bucket, one 2-case bucket, floor 5 | `entries: [1]`, `buckets_withheld: 1` |

Arm A's two rows are identical; arm B's are not, which is the whole claim. The
mixed row checks that the count reports suppression rather than bucket totals.

**Gate:** the project's own suite, `cargo test --workspace` — green, 253 passing
in the core crate including the two added cases, and no other suite moved.

**Second arm on the hash:** two digests differing only in `buckets_withheld`
produce the same contribution hash, asserted directly.

## What this says about the technique

The floor and its disclosure are stated in one paragraph of the golden path and
they were implemented three months apart, which is evidence about the paragraph
rather than about the author. An enforcement clause is executable and a
disclosure clause is not; the first gets written because a test can fail without
it, and the second is prose until somebody reads the same sentence again. Where
a technique pairs a suppression with an obligation to count what it suppressed,
the count deserves to be named as its own deliverable rather than as a clause
beside the rule it qualifies — otherwise the half with a natural test wins.
