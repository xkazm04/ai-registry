---
layer: application
type: application
subject: simulated-audience-testing
technique: cheapest-passing-tier-selection
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Tier selection in a Rust tournament report

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) chooses the model tier for its
live host from a simulated-stream tournament. The selection lives in the report writer of
the `shadowrunr-sim` crate, the bounds in its stats module, and the design in a TOML
matrix. Measured figures are cited as night tournament night-0dd890a1ad, n as stated,
2026-10-18; the run data is private.

## The design

The night matrix crosses five tones, two host tiers, two segments, three audience sizes
and two seeds: `sim/matrices/night.toml:3` "5 tones x haiku/sonnet x 2 segments x 3 audience sizes x 2 seeds = 120 runs.".
Both host tiers are judged by the same, larger judge so the comparison holds
(`sim/matrices/night.toml:12` "Haiku and Sonnet cores are both judged by Opus, so their scores are comparable."),
and the largest tier as host is deliberately a separate design:
`sim/matrices/night.toml:4` "Opus as core is measured separately in night-opus.toml.".
That is the instrument rule applied at design time.

## The rule as implemented

The report states its selection rule in prose:
`crates/shadowrunr-sim/src/summary.rs:716` "Only tiers with zero rule fails and at least one judged run can win; ties go to the lower p50 latency."
The code matches it — the eligibility filter is
`crates/shadowrunr-sim/src/summary.rs:756` "c.judged > 0 && c.rule_fails() == 0 && c.mean_quality().is_some()"
— and the groups it ranks within are keyed by instrument hash first, then tone, segment
and audience size, so no ranking crosses an instrument. "Rule fails" are the hard rules:
the red lines plus each situation's required response, per the rubric's two axes,
`sim/rubric.toml:8` "Two axes, never averaged:", where quality
`sim/rubric.toml:13` "They never gate.". A winner on thin n is labelled
`crates/shadowrunr-sim/src/summary.rs:778` "thin n, provisional".

Rates carry their bound and its method. The stats module opens
`crates/shadowrunr-sim/src/stats.rs:1` "A rate is never reported without its n." and
switches estimators at the edges:
`crates/shadowrunr-sim/src/stats.rs:23` "rule of three when k is 0 or n (zero events on one".

## What the night tournament chose

| | small tier (n=60) | mid tier (n=59) | large tier (n=5, other judge) |
|---|---|---|---|
| rule fails / evaluated | 139/2539 (5.5%) | 53/2461 (2.2%) | 7/183 (3.8%) |
| red-line fails | 10/537 (1.9%) | 2/524 (0.4%) | 0/45 |
| quality facts true | 79.2% | 85.9% | 93.6% |
| core cost per 10-min run (API-equivalent) | $0.75 | $15.37 | $32.17 |

(night tournament night-0dd890a1ad, n as in the column heads, 2026-10-18.) The mid tier
won on both gates and quality at about 20x the small tier's core cost; the small tier
also failed safe-edge near misses (dark humour 19/58, roast requests 18/59) and lectured
in 8 of 60 runs, so it fails on both sides of the edge. The large-tier column was judged
by the mid tier, a different instrument, and is not ranked against the others even
though its quality figure is the highest. Two quality dimensions stayed flat across
tiers — responsive to chat 74% vs 73%, addressing a viewer by name or rank 76% vs 75% —
which places them with the message-picking machinery, not the model.

## Deviations recorded

The standard stays where the tree falls short:

- **Cost is not the tiebreaker.** Ties go to lower p50 latency and cost is printed but
  never decides. The technique puts latency ceilings in the gate and lets cost per usable
  stream decide among the eligible.
- **The gate is pooled per cell, not per run, and the bounds ignore clustering.** The
  quality intervals in the night report (for example 85.9% [0.85, 0.87]) are Wilson
  bounds over thousands of facts drawn from a few dozen runs; facts within a run are
  correlated, so these bounds overstate precision. The technique's per-run reading is
  not implemented.
- **Coverage is a weak gate.** "At least one judged run" is the eligibility floor; a
  declared minimum of tested hard-rule checks is not enforced, only flagged as
  provisional below five runs.
- **The judge is not in the instrument hash.** The report says so itself —
  `crates/shadowrunr-sim/src/summary.rs:716` "which is a confound to keep in mind" —
  and relies on the matrix to keep one judge per comparison. The instrument file list in
  `crates/shadowrunr-sim/src/instrument.rs:1-4` "Results from different hashes are never merged."
  names the character package, tone, segments, rubric, calibration, moderation lists
  and sim logic, but not the judge model.
