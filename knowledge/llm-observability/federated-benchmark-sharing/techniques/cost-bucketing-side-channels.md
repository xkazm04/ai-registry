---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: cost-bucketing-side-channels
status: forged
laws: [aggregates-leave-identity-behind, estimation-announces-itself]
shared_with: []
use_when: [publishing any continuous measure across an organizational boundary, auditing a shared schema for fingerprinting channels, reconciling internal cost precision with external sharing]
---

# Cost bucketing and the continuous side channel

Quality sits on a bounded scale, pass rate is a ratio, task type is one of
ten labels — coarse by construction. Cost is none of these. A per-case cost
is an unbounded continuous number derived from one organization's exact
negotiated pricing, provider mix, prompt lengths and caching behavior, and
in a population of contributors it is unique in practice: `$0.0031427` per
case is a fingerprint. It defeats every other protection in the stack —
a bucket can clear the case floor, a row can clear the source floor, and the
distinctive cost still says which contributor is in there and, across
digests, links their contributions over time. Continuous fields are the
side channel; they get an explicit privacy treatment precisely because they
are the only fields that don't get one for free.

## The mechanism

Round every published cost to a **fixed number of significant figures** —
two is the working point. Two significant figures turns a cost into a band
roughly 1–10% wide that many contributors share, while preserving what a
leaderboard needs from the number: `$0.0031` and `$0.0042` still rank two
models on price. Significant figures, not decimal places — costs span
orders of magnitude (a cheap classification case and an agentic coding case
differ by 1000×), and a fixed decimal rounding is either destructive at the
small end or useless at the large end.

Implementation details that are not details:

- **Handle the degenerate inputs first.** Non-finite and non-positive
  values map to zero *at this boundary* — on the wire, where a sentinel is
  safer than a NaN. (Internally the rule is the opposite: an unpriceable
  cost is null, never zero. The wire format's zero is a floor on published
  garbage, not an accounting statement.)
- **Kill float residue after rounding.** Divide-and-multiply rounding
  leaves representation noise (`0.0030000000000000005`); a value that is
  *supposed* to be a clean band member must serialize as one, or the noise
  itself becomes a fingerprint of the producer's arithmetic.
- **Apply it on both ends.** The contributor buckets before the payload
  leaves — the hub must never possess the exact number. The hub re-buckets
  at ingest anyway, because a contributor's compliance is not the hub's to
  assume, and the published value is the hub's responsibility.

## The honest statement of what this buys

Bucketing is **not anonymity on its own**, and claiming otherwise is the
error this technique exists to prevent in both directions. The k-floors
over cases and sources are what make a bucket unattributable; bucketing
removes the side channel that would have defeated them. State it that way
in the design doc, because a reviewer who believes bucketing is the privacy
mechanism will trade away a floor, and one who believes the floors suffice
will ship the exact cost.

Per the disclosure discipline, a coarsened number announces itself: the
schema documents that cost is a 2-significant-figure band, so a reader
comparing `0.0031` to `0.0034` knows the difference is at the resolution
limit, not a measured 10% gap.

## Decision rules

- **Sweep for every continuous field, not just cost.** Latency percentiles,
  variance, any future continuous measure — each needs either a bounded
  scale, a bucketing rule, or an argument why its precision is not
  identifying. Rounding variance and quality to fixed precision is cheap
  insurance. The review question for any new field: "is this continuous,
  and did anyone decide its resolution on purpose?"
- **Resolution is a schema constant, not a contributor choice.** Mixed
  resolutions on the wire are themselves a fingerprint (the 4-digit
  contributor stands out among 2-digit ones).
- **Do not bucket internal books.** Builder-side cost metering exists to be
  exact — margins, budgets and caps run on precise numbers, and coarsening
  them is a defect there. One number, two regimes: exact inside the
  boundary, banded outside. The bucketing function belongs at the boundary,
  called exactly where digests are built, not woven into the pricing
  pipeline.

## When not to use it

When the cost is already public — list-price arithmetic on a public
benchmark with published token counts reveals nothing about the publisher —
bucketing only degrades the data. And where contributions are attributed by
design, exact costs may be the shared value; the technique protects
anonymity, and where anonymity is not claimed it has nothing to protect.
