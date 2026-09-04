---
layer: application
type: application
subject: media-playback
technique: generated-supply-margin
stack: python
verified_on: 2026-09-04
verified_against: python@3.14
applied: code
ab_verdict: better
proof: ab-paired
---

# One repository, two standards of rigour about the same number

*Verified against the project tree at `d5bec98`; the stack version is the
`python-version: "3.14"` pin in the service CI job, not a guess.*

A speech-synthesis service whose headline claim is "realtime on commodity
CPU" carries a load-test harness and a certification step that signs that
claim for a given box. The certificate's realtime bar was:

```python
"single_stream_rtf_min": 1.0,   # faster than realtime, one stream
...
{"check": "realtime_single_stream",
 "want": f">= {THRESHOLDS['single_stream_rtf_min']}x",
 "got": single_rtf,                       # single.get("server_rtf_mean")
 "pass": single_rtf >= THRESHOLDS["single_stream_rtf_min"]},
```

`service/certify.py:61,:225-228`. The compared quantity is
`server_rtf_mean` — a mean over the level's requests — and the threshold is
exactly `1.0`, the point at which the margin is zero.

## The structural fact: the discipline existed one file away

The valuable thing here was not the missing check. It is that **the same
repository already applies the technique's rule at a different layer, in
prose that states it explicitly, and the two layers were never reconciled.**

`service/engine.py:631-671` computes `cost_model()`, which returns
`realtime_factor` *and* `spread` — "the measured p95/p50 ratio of synth
time, the amount by which a median-based estimate has to be widened to be a
promise" — plus a `basis` of `warm`/`cold`/`insufficient`. Thirty lines
later the deadline estimator uses it:

```python
if model["basis"] == "warm":
    est *= model["spread"]   # only a measured spread may widen a promise
```

`service/engine.py:773-776`. So for a **single request's** deadline the
service refuses to promise from an unmeasured spread and widens by a
measured one. For the **capacity certificate** — the durable, signed,
ledger-appended claim that this box can feed a player continuously — it read
the mean and nothing else.

Nobody designed that asymmetry. It fell out of two layers being written at
different times to answer different questions, and it is better evidence for
the technique than the fix is: the rule was independently reached inside
this tree, written down in a comment, and then not applied where the stakes
were highest. The jitter was not missing. It was in the next column of the
same row — `run_level` emits `lat_p50_s` and `lat_p95_s` unconditionally
beside `server_rtf_mean` (`service/loadtest.py:507-510`), and
`level_degraded` (`:213-236`) reads the p95 for the latency SLO and the
rate for the CPU knee **without ever combining them into a sustainability
question**.

## The A/B

Both arms, same level row, instrument `service/tests/test_certify.py`.

| | A (mean) | B (excursion) |
| --- | --- | --- |
| `rtf_mean` 2.5×, `p95/p50` 1.3 | pass | pass (1.92×) |
| `rtf_mean` 2.5×, `p95/p50` 4.0 | **pass** | **fail** (0.625×) |
| spread absent from the row | pass | fail closed, `"unmeasured"` |

The second row is the case the certificate could not see: every fourth
request renders one second of audio in 1.6 seconds. Averaged it is a
comfortable box; streamed it spends buffer on every excursion and rebuilds
it only out of a margin the excursions keep taking back.

The admitted-but-unsustainable band under arm A is `1.0 ≤ rtf_mean <
spread`, which at the engine's own `_MAX_SPREAD = 4.0` clamp is all of
`[1.0, 4.0)` — **the entire declared certification range.** The new check
derives its bar from the row rather than from a constant, per
[limits-are-derived](../../../../_laws.md#limits-are-derived), and fails
closed on missing evidence, which is the doctrine the file already applied
to cache-blind results ("Absence of evidence here is not evidence of
absence", `service/certify.py:71-75`).

`pytest service/tests/test_certify.py service/tests/test_loadtest.py` →
127 passed; `test_certify.py` 44 → 46, the two additions being the
discriminating pair (the jittery row must still pass
`realtime_single_stream` and must fail the new bar).

## What this realization cannot do

Three limits, and the first is the one a reader copying this should weigh
hardest.

- **The spread is a proxy, not the measurement.** It is computed from
  *request latency* percentiles at concurrency 1, where latency is
  synthesis plus a near-constant overhead. The quantity the technique
  actually wants is the spread of *synthesis time per unit of audio*, which
  the engine keeps internally but the load-test level row does not publish.
  Recording per-request rtf percentiles in `run_level` would convert this
  from a defensible proxy into a measurement, and that is the return
  condition on this row.
- **No measured run currently sits in the disagreement band.**
  `docs/certifications/ledger.json` is `{"rows": []}` and the only figure
  documented anywhere in the tree is `single_stream_rtf: 4.26`, just above
  the clamp. So this prevents a future miscertification rather than
  correcting an observed underrun — the defect was latent. It is worth
  fixing anyway precisely because the threshold is `1.0`: the certificate
  is *designed* to admit boxes down to the margin's vanishing point, and
  the service explicitly targets marginal Arm hardware, which is the whole
  of the band.
- **Nothing here observes an actual underrun.** The claim "this
  configuration cannot feed a player" is derived from the definition of the
  margin, not from a stream that stuttered. A harness that plays synthesized
  audio against a wall clock and counts gaps would settle it; none exists,
  and inventing a number for it would have been worse than saying so.
