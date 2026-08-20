---
layer: application
type: application
subject: judge-calibration-and-drift
technique: windowed-score-drop-alerting
stack: rust
status: forged
---

# Windowed score-drop alerting in LightTrack's API (Rust)

LightTrack's API implements the rolling recent-vs-baseline detector in
`crates/api/src/alerts.rs`, and — because calibration kappa is persisted as
ordinary scores under a reserved rubric (`lt:calibration:<provider>/<model>`,
`docs/CALIBRATION.md:63-95`) — the *same* code path that catches a product
quality regression catches a drifting judge, with zero calibration-specific
wiring.

## Configuration (alerts.rs:127-130)

The knobs come from env with floors that keep the math meaningful:

```rust
score_window:      (env_u64("LIGHTTRACK_ALERT_SCORE_WINDOW", 20) as usize).max(4),
score_min_samples: (env_u64("LIGHTTRACK_ALERT_SCORE_MIN_SAMPLES", 8) as usize).max(4),
score_drop:        env_f64("LIGHTTRACK_ALERT_SCORE_DROP", 0.15),
```

Defaults: a 20-entry window, at least 8 samples before any verdict, a 15%
relative drop to trip. The `.max(4)` floors mean an operator cannot
configure a window or sample floor so small the split below degenerates —
statistical honesty enforced at parse time, not documented and hoped for.

## The write-path hook (alerts.rs:380-435)

`record_score` runs on every `POST /v1/scores`:

- Normalizes: `(s.value / s.max).clamp(0.0, 1.0)` — rubrics with different
  maxima share one detector; for calibration rows `value` is kappa and
  `max` is 1.0, so kappa flows through unchanged.
- Keys the window by `(project_id, rubric)` (joined with a `\u{1}`
  separator), so each judge model's reserved rubric gets its own
  independent trend, isolated from product rubrics and from other judges.
- Delegates the verdict to `note_score`, which is deliberately split out
  with no I/O so it is unit-testable.

`note_score` is the whole technique in ~25 lines: push into a `VecDeque`
capped at `score_window`; return `None` (no verdict — not "no regression")
below `score_min_samples`; split the window with `recent_k = (len/4).max(3)`
as the recent tail and require the baseline side to hold ≥ 3; refuse a
`baseline <= 0.0`; fire when `(baseline - recent) / baseline >= score_drop`.

## Delivery discipline

- The fired alert carries its evidence: `recent_avg`, `baseline_avg`,
  `drop_pct`, `samples`, and `scored_by` — the receiver sees the sample
  size and who judged without a follow-up query.
- `should_send_key("score-drop:{key}")` applies a per-key cooldown
  (default 3600s) so a sustained slide delivers one alert per incident
  window, per rubric, instead of one per score write.
- Delivery is `tokio::spawn`-ed fire-and-forget to webhook/ntfy/email
  channels — a slow webhook never blocks the score ingest path.

## The paired half

The warm-up blindness (8 samples ≈ the first week at daily calibration
cadence) is covered by the runner side: `crates/runner/src/calibrate_watch.rs`
compares each cycle's kappa against the immediately previous run
(`prev_kappa` read back from the reserved rubric's newest score) and
against the absolute bar — `ALERT untrusted` / `WARN drift` on stderr and a
reserved non-zero exit for `--once` — firing from the second cycle with no
window at all (`docs/CALIBRATION.md:96-125`). Cliff runner-side, slope
server-side; the two-tier design the golden path prescribes is realized as
two ~independent components meeting only at the scores table.
