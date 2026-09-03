---
layer: application
type: application
subject: federated-benchmark-sharing
technique: content-addressed-contribution
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# A path derived from the payload, and a validator that outranks the generator

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` collects
throughput measurements from users' own machines and pools them as proposed
changes to its own repository rather than as posts to a hub endpoint. The version
witness is `edition 2024` across the workspace (`Cargo.toml:5`), Rust ≥ 1.85.

The layout is the technique (`llmfit-core/data/community/README.md`):

```
community/
  <hardware-slug>/
    <unix-timestamp>-<hash>.json
```

A directory keyed by what the result is *about* — the hardware the numbers
describe — and a filename carrying an 8-hex content hash beside the local capture
time. The README states all three consequences the standard claims, in the
author's own words:

> Files are namespaced by hardware and carry a content hash so concurrent
> submissions never collide. Each file name mirrors the contributor's local store
> entry, which makes submissions idempotent: if a contributor already has an open
> benchmark PR, new results are appended to it (instead of opening another PR),
> and a retry after a partial failure skips files that already landed rather than
> duplicating them.

Idempotent retry, collision-free concurrency, and append-to-open-proposal — the
three properties the standard derives from content addressing, present together
and named as the reason for the naming scheme.

## The validator is the contract, and it says so

`scripts/validate_community_benchmarks.py` is the admission gate, and its
docstring places the naming convention exactly where the standard puts it — as a
triage signal rather than an admission rule:

> Path conventions — `community/<hardware-slug>/<timestamp>-<hash>.json` ... (what
> `llmfit bench --share` generates; **anything else is hand-crafted and gets a
> closer look**).

The README makes the policy explicit for contributors: *"Hand-crafted submissions
are welcome as long as they pass the same checks the generated ones do."* The
filename pattern is enforced (`FILENAME_RE`, `validate_community_benchmarks.py:45`)
but as one problem among several rather than as a precondition, and the substantive
gate is the schema plus the cross-field arithmetic. A contributor on a platform the
tool does not build for can still contribute.

## The negative half: what content addressing does not buy here

The standard asks for a **stated policy when the same path arrives with different
content**, on the grounds that one of the two is not what it claims. This tree has
no such policy: the hash is over the payload and the filename mirrors the local
store entry, so the case is improbable, and the validator treats each file
independently. There is also no duplicate detection *across* paths — two files
with identical results under different hardware slugs would both be embedded and
both counted.

Neither gap has bitten, and the reason is worth recording because it bounds the
technique's claim: this federation weights nothing by contributor volume. The
leaderboard shows runs; the estimate ladder prefers a measurement on matching
hardware over a formula but does not aggregate contributors into a score. Content
addressing here buys *retry safety*, which the tree needs badly, and not *weight
integrity*, which it does not yet need at all. A federation that later starts
weighting by evidence volume would have to add the duplicate policy before doing
so, and this tree would not warn it.
