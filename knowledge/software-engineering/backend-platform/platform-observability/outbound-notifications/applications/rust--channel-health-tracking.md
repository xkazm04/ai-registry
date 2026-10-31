---
layer: application
type: application
subject: outbound-notifications
technique: channel-health-tracking
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Channel health tracking — the per-sink breaker, thrice, and a ledger nobody renders (Personas)

The technique's two customers — the dispatch loop and the owner — as served
by `src-tauri/src/engine/webhook_notifier.rs`, the ledger in
`src-tauri/db/src/repos/resources/notification_subscriptions.rs`, the
per-*type* metrics in `src-tauri/src/notifications.rs`, and the owner panel
`src/features/settings/sub_notifications/components/WebhookSubscriptionsPanel.tsx`.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Delivery ledger (floor form) | `record_delivery` (`notification_subscriptions.rs:235-257`) writes `last_delivery_at`, `last_delivery_status`, `last_error` on every attempt; called from both `WebhookProcessor::process` paths (`webhook_notifier.rs:164`, `:190`) and from `test_dispatch` (`:768`) |
| Breaker protects shared dispatch state | the module comment at `webhook_notifier.rs:467-489` is the technique's argument verbatim: one dead sink pins the *global* watermark → duplicate spam to healthy subs + loss past the per-tick window; the breaker's defining rule is that a broken sub "no longer contributes to `earliest_failed`" |
| Probe failures don't pin | `BreakerAction::Probe` (`:523-525`) is excluded from `earliest_failed` alongside already-broken and just-crossed subs (`:683-695`) |
| Below-threshold stays cursor-pinning | "Healthy subs are untouched: their first `BROKEN_FAILURE_THRESHOLD - 1` consecutive failures still pin the watermark, preserving transient-outage retry" (`:487-489`) |
| Recovery cadence | `BROKEN_PROBE_EVERY = 12` (`:498`), advanced by `breaker_note_skip` so a skipped sink still walks toward its next probe |
| Placement decision written down | in-memory `LazyLock<Mutex<HashMap>>` (`:504-505`) with the reason: "State is in-memory only and resets on restart — the correct default, since a restart re-probes every sink afresh" |
| Test-delivery ritual, real path | `test_dispatch` (`:741-771`) resolves the real URL, renders the real template, uses the real provider body, writes the real ledger; the synthetic event type is honestly `test.notification` |
| Test rate limit (one stack) | `TEST_DELIVERY_RATE_LIMIT` with a 1 s window in `notifications.rs:1314-1462` for persona channels |
| Broken-channel event exists (one stack) | the legacy persona-channel loop emits `NOTIFICATION_DELIVERY` with `consecutive_failures` per attempt (`notifications.rs:607-614`) |

## Judgment calls worth copying

- **The breaker comment is a proof, not a label.** It states the shared
  resource (global watermark), the two failure modes (duplicate spam,
  loss), the exclusion rule, and why in-memory is correct. Anyone
  extending it can check their change against the argument.
- **Probe failures are handled as a distinct case.** The subtle half the
  technique warns about — probes re-pinning the cursor — is explicitly
  named and excluded (`:688-694`).
- **The test path is the production path.** No bypassed stage.

## Gaps against the technique (reported, not fixed)

- **The ledger crosses the IPC boundary and stops there.** The ts-rs
  binding carries `lastDeliveryAt` / `lastDeliveryStatus` / `lastError`
  (`src/lib/bindings/NotificationSubscription.ts:34`); the owner panel
  renders **none of them** — it shows only the *in-session* test result
  from `useState` (`WebhookSubscriptionsPanel.tsx:64-65`, `:213-233`).
  From the user's side a channel that has failed every delivery for a
  month looks identical to a healthy one until they press Test. This is
  the technique's central failure — the pipeline protected, the owner
  uninformed — with the data already one render away.
- **Breaker state is invisible everywhere.** In-memory placement is a
  fine default; showing nothing about it is not. No surface says
  "paused as broken, probing every 12 events" and no event fires when a
  subscription trips (`tick`'s `app` parameter is explicitly reserved for
  this and unused, `:602`). The persona-channel stack emits per-attempt
  events with `consecutive_failures`; the notifier stack emits nothing.
- **The breaker is copy-pasted three times.** `webhook_notifier.rs:493-565`,
  `team_slack_relay.rs:88-156`, `slack_poller.rs:370-432` — same
  thresholds, same probe cadence, same lock-poison recovery, three
  statics, and each copy's comment says "same shape and rationale as"
  one of the others. Three copies of a five-line policy is three places a
  threshold change must land; the technique's per-sink application wants
  one breaker keyed by sink identity.
- **`notifications.rs` counts per channel *type*, not per sink.**
  `ChannelMetrics.consecutive_failures` (`:140-190`) is keyed by
  `channel_type` string; two personas' chat channels share one counter,
  so one dead room ages every room of that class. Not a per-sink ledger.
- **`test_notification_subscription` has no rate limit** — the command
  (`src-tauri/src/commands/communication/notifications.rs:60-73`) calls
  `test_dispatch` unguarded, while `test_channel_delivery` for persona
  channels has the 1 s window. Same ritual, one stack guarded.
- **No dead-letter, no since-when.** Floor-form ledger only: last
  outcome, no consecutive count persisted, no last-success separate from
  last-attempt. The two-question test (nothing-matched vs. all-failed,
  and since when) is not answerable from rows. The dead-letter gap is
  registered with the fan-out owner (`#w2-realtime-events`).

Re-checked 2026-10-31 at personas@22260d77c9 — **the first gap is closed.**
`cb41020328` (2026-09-24) gave `WebhookSubscriptionsPanel.tsx` a per-row
`WebhookRowHealth` line (`:250-293`) that renders the ledger: never-delivered,
last success with its time, or last failure with its time and the verbatim
`lastError`. The Test button now reloads that ledger instead of holding an
in-session `useState` result (`:120-132`). A month of failed deliveries is
visible without pressing Test, so the title's "a ledger nobody renders" no
longer holds. The other gaps stand: breaker state is still in memory and
shown nowhere, `tick` still discards `app` (`:602`), the breaker is still
copied three times, `ChannelMetrics` is still keyed by channel type, the
subscription test command still has no rate limit, and `record_delivery`
still writes only the last outcome. The ledger the panel now shows is the
floor form, so "since when" is still not answerable from rows.
