---
layer: application
type: application
subject: alerting
technique: dedup-and-cooldown
stack: rust
status: forged
verified_on: 2026-09-29
verified_against: rust@1.96
---

# Two Rust alert paths, one question: what does a failed send do to the window?

Read at tracklight `73f571f15f` (toolchain pinned by `rust-toolchain.toml`,
`channel = "1.96.1"`, the witness for `verified_against`) and personas
`df3c51ef71` (whose `src-tauri/Cargo.toml` declares `rust-version = "1.80.0"`).
Both persist the fire before delivering it and both compute the cooldown from
the persisted history, so both pass the technique's first rule. They part on
the rule it gained: the clock runs on delivery, not detection.

## tracklight: detection stamps the window, delivery gets one attempt

`crates/api/src/alerts/ledger.rs` writes the row before any send, on purpose.
Its module header says why: `Store::insert_alert_dedup` is one atomic step, so
of two replicas that both decided the same cap had breached, exactly one is
`Admitted` and sends. The suppression predicate in
`crates/store/src/sqlite/alerts.rs:38-45` is

```sql
SELECT fired_at FROM alerts WHERE dedup_key = ?1 AND fired_at > ?2
```

with no filter on delivery. `Alerter::fire` (`ledger.rs:229-264`) then makes
**one attempt per channel** and records each outcome with `mark_delivery`;
there is no retry anywhere in `crates/api/src/alerts/`. So a webhook that
answers 503 leaves a row whose `delivered[0].ok` is false, and the next
`insert_alert_dedup` inside the cooldown (default `3600`, `mod.rs:120`)
returns `Suppressed`. The condition is unannounced for an hour and the ledger
reads "fired" throughout. `Alert::fully_delivered()` exists
(`crates/core/src/alert.rs:229`, "an alert nobody received is not a delivered
alert") and the gate does not consult it.

This is a design consequence, not carelessness: the row is doing two jobs, the
replica election and the cooldown, and stamping at detection is what makes the
election atomic. The technique's fix has to keep the election. Either the
winner owns a bounded retry of the same fire, or an all-failed delivery marks
the row released so the predicate no longer counts it. The pre-filter
`should_send_key` (`mod.rs:198-207`) stamps before sending too, so it needs the
same treatment.

## personas: detection stamps the window, delivery is a separate durable queue

`src-tauri/src/commands/execution/alert_evaluator.rs` reads the cooldown from
`last_fired_at` (`:152-163`, `SELECT fired_at FROM fired_alerts ... ORDER BY
fired_at DESC LIMIT 1`, gated at `:215-219` against
`FIRED_COOLDOWN_SECS = 3600`). That is the detection stamp. But the external
delivery is not made here: `tick` persists the fire (`:254`), publishes an
`alert_fired` event (`:297`), and a separate poller
(`src-tauri/src/engine/webhook_notifier.rs`) delivers from the event table.
That poller advances its watermark "NEVER past the earliest event that failed
delivery this tick" (`:700-732`), so a transient 5xx, timeout or DNS blip is
re-fetched and re-delivered, and a subscription that fails
`BROKEN_FAILURE_THRESHOLD = 5` times in a row (`:493`) is declared broken and
probed every twelfth event (`:498`) instead of pinning the cursor.

That is the technique's stated exception: the clock may sit on detection when
delivery is itself a durable queue keyed by the fire. The retry is bounded and
the give-up is a named state. Two things are still open. The `publish` step
between the fire and the queue only warns on failure (`:321-323`), so a failure
there burns the window with nothing queued. And the breaker state is
in-memory (`:484`) and the delivery status lives on the subscription, not the
alert, so "was this fire delivered?" is not answerable from the fire row.

## What the two together teach

The same first rule, a persisted fire, produces a silent-loss bug in one tree
and a working design in the other, and the deciding property is whether a
failed send survives as pending work. The technique's condition is therefore a
question a reviewer can put to any alert path in one line: after a failed
send, where is the fire waiting?

## Other trees, same question

- **ascent** (`e47194fa7d`, `next@16`) has both shapes side by side.
  `claimRegressionAlert` (`src/lib/alerts.ts:66-73`) stamps "at the claim (not
  after a successful POST)", in memory, so a failed send burns the six-hour
  window. The audit-claim path releases on failure
  (`src/lib/alert-door.ts:158-163`, `releaseAuditClaim`), so the next run
  retries. Every attempt writes an `AlertEvent` with `delivered` and a
  `suppressedReason`.
- **systedo-case** (`45dbe922b6`) orders the writes deliberately for the inbox
  channel: `recordAlert` before the state commit, with the comment "a duplicate
  is recoverable, a swallowed alert is not" (`src/lib/campaigns/alerts.ts:272-280`).
  The webhook and email sends come after the commit and are best-effort, so for
  those channels the window is spent whether or not the send worked.
