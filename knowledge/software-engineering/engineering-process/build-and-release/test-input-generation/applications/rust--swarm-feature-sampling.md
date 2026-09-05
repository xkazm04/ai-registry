---
layer: application
type: application
subject: test-input-generation
technique: swarm-feature-sampling
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.93.1
applied: experiment
ab_verdict: better
proof: structural-only
---

# Two simulators, one swarm draw, and a coverage gate that had to move

Sōzu (`github.com/sozu-proxy/sozu`, commit `cd023104`, 2026-08-28; toolchain
witness `rust-toolchain` = `1.93.1`) runs FoundationDB-style deterministic
simulation over two sans-io cores — a UDP load-balancing manager and a TCP
SNI-preread parser — in a test-only `sim/` crate driven by the `moonpool-sim`
engine. Both simulators run swarm testing, and the repository cites the paper
by name. It is the most complete application of this technique the corpus has
read, and it is useful here for the two rules it had to invent that the
technique did not carry.

## It classifies features before drawing them

`doc/testing.md` publishes a three-way classification per simulator —
MANDATORY, SUPPRESSOR, OPTIONAL — with the reasoning attached to each entry:

| Simulator | MANDATORY | SUPPRESSOR | OPTIONAL |
|---|---|---|---|
| UDP | `ClientDatagram` | `Drain`, `CloseAll`, `AbortFlow`, `SetMaxFlows` | `BackendResolved`, `BackendDatagram`, `AdvanceClock`, `ReconfigCluster`, `SetMaxRx` |
| TCP preread | none | none | all 25 generators, plus a fragmentation axis |

The MANDATORY entry carries the reason the amendment now generalises:
`ClientDatagram` is "the sole flow creator; without it every shadow-model
invariant is vacuously green." That is the failure precisely — not a weaker
run but a run that constructs no state, evaluates every invariant against
nothing, passes, and is indistinguishable in a 256-seed tally from a seed that
genuinely exercised the core.

The SUPPRESSOR column is the paper's mechanism named in the tree's own terms:
each of the four "evicts flows, resets the manager, or sheds future
admissions, repairing the very full-table state a capacity bug needs." And the
TCP row is the honest negative — a core that is fresh per connection has no
cross-connection state, so nothing can suppress, and the entry says so rather
than inventing a classification to fill the cell.

## It moved the coverage gate off the run

This is the finding the technique was missing. Because a seed's feature set is
drawn, a seed legitimately cannot reach every `RejectReason` class — so the
per-class coverage assertion (`CoverageTally::assert_full_coverage`) is
asserted on the **merged campaign tally, never per seed**, with the rule
stated as a design constraint: "a single swarm seed legitimately cannot reach
every class, but the sweep still must, and still fails loudly when it does
not."

The composition is pinned rather than left to chance, which is the obligation
that keeps the merged gate from being satisfiable by adding seeds: campaigns
run the explicit range `0..n`, **seeds divisible by four keep the inclusive
all-features configuration**, and shorter final cohorts start with their
inclusive run. That is the technique's portfolio rule ("the correct
configuration includes runs at full feature availability") given a placement
discipline it did not have — one guaranteed inclusive run per four-seed
cohort, at every campaign size, including the per-PR 64-seed job.

## The control arm

`SOZU_SIM_SWARM=0`, shared by both simulators, disables the draw with **zero
extra RNG consumption**, byte-identical to the pre-swarm grammar. That detail
is what makes the technique's own boundary testable on a real system rather
than argued: a swarm campaign and an all-features campaign of identical seed
count can be compared directly, because the disabled path does not perturb the
seed stream. A team adopting swarm sampling and wanting to know whether it
paid needs exactly this, and it is easy to omit — consuming one draw from the
RNG before checking the flag would re-point every seed and silently destroy
the comparison.

The replay contract closes it: the drawn configuration prints as one canonical
`swarm-config sim=... seed=... mode=... features=[...] total_weight=...` line
before the workload runs, and `*_swarm_config_is_stable_across_draws` tests
assert that line is byte-identical across replays of the same seed. The
technique already says "record the configuration with the seed"; this is the
part that makes the record trustworthy, since the configuration is itself
derived from the seed and any edit to the draw order would re-point it exactly
the way `seed-is-not-a-reproduction` describes for inputs.

## What this realization cannot do

It cannot say whether swarm sampling found anything these cores would not
otherwise have surfaced. The control arm exists and the comparison is
constructible, but no result of running it is published in the tree — there is
no recorded campaign-versus-campaign defect count, so the boundary the
technique states (omission wins under masking, loses when a defect needs `k`
features together) remains untested here. The instrument is present and
unconsumed, which is the cheapest kind of measurement left on the floor.
