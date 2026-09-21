---
layer: application
type: application
subject: issuance-policy-ladder
technique: stamped-instants-name-their-clock
stack: rust
verified_against: rust@1.96.1
verified_on: 2026-09-17
applied: code
ab_verdict: better
proof: ab-paired
---

# Key rotation that a backward clock step undoes (Rust)

How the technique lands in a public Rust evaluation service (`xkazm04/lighttrack`,
commit `a6c814e`, 2026-09-17). The stack witness is the repository's own pinned
toolchain (`rust-toolchain.toml`, `channel = "1.96.1"`), which every blocking gate
runs through.

The issuer here mints project API keys, and every bound it writes is an instant read
from the host's wall clock: a creation time, an expiry, and — this is the seam — a
*retirement*, expressed as an expiry clamped to the present when an operator rotates a
key. Three rotation paths write such an instant, and the technique's claim is that the
third kind of write is a category error: an operator who rotates a key is not asking
for a short window, they are asking for the key to stop.

## Why this seam could have refuted the rule

A stamped retirement is the better-engineered option on its face. It is one field and
one code path, identical to every other window the issuer already writes; it is durable
across restarts in a way a scheduled revocation job is not; and it needs no second
column, no migration and no new reader. If a clock correction were rare enough, or if
the comparison sites happened to be monotonic, the rule would be buying nothing here
and the honest verdict would be `not-better`. The measurement was designed so that
outcome was reachable: the arms differ only in how retirement is expressed, and the
whole pre-existing suite was the floor.

## Arms, target and floor

Arm A is the shipped logic, extracted so it can be driven. Arm B expresses an
irreversible retirement as a state — a revocation the reader checks before it checks
any date — and leaves every genuine window as a stamped instant.

| | declared A | measured A | declared B | measured B |
| --- | --- | --- | --- | --- |
| **T1** rotations surviving an 8-day backward clock step | 1 of 3 | **0 of 3** | 2 of 3 | **1 of 3** |
| **T2** outcomes that are a function of the stamping clock | 2 of 3 | **3 of 3** | 1 of 3 | **2 of 3** |
| **F1** pre-existing `lighttrack-api` tests | 461 green | 461 green | 461 green | 461 green |

The decision rule was declared before the arms ran: `B >= A + 1` on T1. Met, 0 to 1.

**Both arm-A predictions were wrong in the same direction, and the direction is the
finding.** The clock reaches further into this issuer than the draft assumed: the third
rotation path computes `min(old_expiry, now + grace)`, which reads as an
operator-chosen deadline and is not one — a skewed clock moves it too. The technique's
"a deadline clamped into the past is not a short window, it is a retirement" sentence
exists because this measurement produced it, not because it was predicted.

## Positive controls

- **P1** — the instrument went red on arm A, with the counts printed in the panic
  messages. An A/B whose arms are both green measured nothing.
- **P2** — with arm B in place, mutating the retirement back from a revocation to an
  expiry stamped at `now` returned T1 = 0, T2 = 3 and red again. The green came from
  the rule and not from the harness. Reverted.
- **P3** — every summary figure above is the test binary's own `test result:` line, not
  a count assembled by the worker.

## Gates

`cargo test -p lighttrack-api`: 466 passed, 0 failed, 1 ignored, plus the integration
binary. `cargo clippy --workspace --all-targets -- -D warnings`: clean.
`cargo fmt --all -- --check`: clean. The project's own `scripts/gates.sh --fast`
reports all three PASS on the shipped commit.

## What did not change

The two remaining clock-derived bounds are genuine windows, and they stay stamped —
they are re-readable rows this issuer owns and re-reads on every use, which is the
technique's "it can still change it" branch, where refusing to mint would be the larger
outage. What the change removes is the one bound whose intent was irreversible.
