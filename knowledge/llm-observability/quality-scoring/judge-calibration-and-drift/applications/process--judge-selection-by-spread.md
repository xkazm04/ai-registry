---
layer: application
type: application
subject: judge-calibration-and-drift
technique: judge-selection-by-spread
stack: process
status: forged
verified_on: 2026-08-20
---

# Judge selection by spread — LightTrack's bake-off method

LightTrack chose its default benchmark judge by running four candidates
over the same 12-item human-labeled golden set against one 3-dimension
rubric, one case per call, and publishing the table with its decision
rationale in `docs/BENCHMARK_FRAMEWORK.md:286-308`:

| judge | MAE vs human | corr | good avg | bad avg | spread | cost / 12 |
|---|---|---|---|---|---|---|
| `opus@xhigh` (default) | 0.144 | 0.844 | 0.950 | 0.317 | 0.633 | $1.60 |
| `sonnet@medium` | 0.172 | 0.773 | 0.883 | 0.241 | 0.642 | $1.63 |
| `haiku` | 0.180 | 0.745 | 0.800 | 0.348 | **0.452** | $0.36 |
| `fable@medium` | 0.201 | 0.785 | 0.967 | 0.350 | 0.617 | $4.52 |

How the technique's decision rules play out on real numbers:

- **Spread disqualifies, headline metrics do not save.** Haiku's MAE
  (0.180) sits within 0.04 of the winner — but its 0.452 spread means no
  threshold separates quality from deflection. The doc records the
  concrete symptom: it scored a correct, complete, concise answer 0.600 —
  *below its own 0.70 pass line* — while giving evasive non-answers 0.22.
- **Wide spread with a rotten middle is the more dangerous failure.**
  Fable posts healthy extremes (0.967 / 0.350) yet passed a half-answer
  at 0.733 and a factually wrong answer at 0.750 — generosity exactly in
  the band a gate cares about, invisible in the spread column, visible
  only in the per-item results.
- **Price as tiebreaker among discriminators.** Sonnet is called out as
  "the honest budget option: same cost as Opus at this size, and it
  passed nothing sub-standard." The judge is unbudgeted (design decision
  D4), so Haiku's 4× cost advantage buys nothing.
- **Limits travel with the decision.** The doc states them inline: n=12,
  one rubric, one domain, "human labels are ours", and the same-family
  caveat — an Opus judge grading Claude candidates should prefer pairwise
  with randomized order (§2, D15).
- **Effort is part of judge identity**: candidates are specified as
  `model@effort` (`opus@xhigh` vs `sonnet@medium`), each a distinct row.

## Re-verification after a method change

When batched judging (`--batch N`) was added as a throughput lever, it was
treated as a new instrument, not a transport detail
(`docs/BENCHMARK_FRAMEWORK.md:310-348`): the same 12 items were judged
paired at batch=4, reporting mean delta, per-case |delta|, and pass/fail
flips per judge. Haiku flipped 7/12 cases and collapsed batched scores
onto tiers (every good item exactly 1.000, half-answers 0.833) — grading
the batch on a curve despite explicit instruction — while Opus and Sonnet
flipped none. The standing rules that came out of the measurement: batching
is off by default, every verdict records its `batch_size`, gate-feeding
queued runs are pinned unbatched, and a batched run is never compared to
an unbatched baseline. The `lt-runner calibrate --compare-batch N` command
(`docs/CALIBRATION.md:140-185`) makes the paired re-verification a
one-liner an operator runs before trusting any new batch size.
