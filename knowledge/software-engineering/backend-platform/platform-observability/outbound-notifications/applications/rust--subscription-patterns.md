---
layer: application
type: application
subject: outbound-notifications
technique: subscription-patterns
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Subscription patterns — anchored prefix matching and the one-door repo (Personas)

The technique's grammar, validation door, and forward-only rule as
implemented across `src-tauri/src/engine/webhook_notifier.rs` (matching,
seeding) and `src-tauri/db/src/repos/resources/notification_subscriptions.rs`
(the door).

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Exact + anchored family + explicit match-all | `pattern_matches` (`webhook_notifier.rs:321-334`): exact equality; `prefix.*` matches the bare prefix or `prefix` followed by a `.` byte — `exec.*` cannot match `execution.finished`; `*` is its own spelling. Pinned by three tests incl. the boundary case (`:802-821`) |
| Parse once per tick | `sub_patterns` pre-parsed per subscription before the event loop (`:647-651`) |
| Loud match-nothing | `parse_patterns` (`:336-344`) degrades an unparseable `event_types` column to an empty list *with a `warn!` naming the consequence* ("this subscription will match no events") |
| One validation door | `create` / `update` (`notification_subscriptions.rs:80-212`): non-empty label, provider from the closed set, endpoint-or-credential, ≥1 pattern; `update` re-checks endpoint-or-credential **after** the merge (`:168-172`) |
| Clearable-field merge semantics pinned | `merge_clearable` (`:153-163`) with the contract in a comment: `Some("")` clears, `Some(v)` sets, `None` keeps |
| Forward-only enablement | `seed_watermark_to_newest` (`webhook_notifier.rs:580-595`) + both branches in `tick` that call it: the zero-subscription window (`:604-617`) and the subscription-exists-but-watermark-unset race at startup (`:623-633`); the module doc spells out the delete-last-then-recreate gap (`:19-29`) |
| Identity minted once | `uuid::Uuid::new_v4()` at create (`:103`); updates never re-mint |
| Disable ≠ delete | `enabled` flag honored by `list_enabled` (`:45-60`); `delete` removes the row and returns `NotFound` on zero rows (`:214-233`) |

## Judgment calls worth copying

- **The boundary test exists.** `assert!(!pattern_matches("exec.*",
  "execution.finished"))` (`:814`) is the single most valuable line in
  the test module — it is the difference between an anchored family
  match and a raw prefix, and it is the case people forget.
- **The startup race is handled, and its reason is written down.** The
  second seeding branch (`:623-633`) exists for a subscription created
  during the dispatcher's 10 s startup grace, before any zero-subscription
  tick could seed — with the failure mode spelled out ("would return the
  200 OLDEST events and POST the entire history as if brand-new").
- **Match-nothing is loud.** The technique's exact demand, met at the
  parse site.

## Gaps against the technique (reported, not fixed)

- **Match-nothing is loud in the log, invisible to the owner.** The
  `warn!` at `:341` reaches telemetry; nothing writes the subscription's
  `last_error` or any owner-facing standing. From the settings panel a
  corrupt-pattern subscription is indistinguishable from a healthy quiet
  one — the technique's second-best outcome, not its best.
- **Deletion does not reap breaker state.** `delete` (`:214-233`) removes
  the row; the in-memory `CONSECUTIVE_FAILURES` map in
  `webhook_notifier.rs:504` keeps the id's strike count until restart.
  Harmless today (fresh UUIDs), but the technique's identity rule exists
  for import/restore paths that reuse ids.
- **Scope composition is single-axis.** `notification_subscriptions`
  filters by event-type pattern only; the persona-channel stack in
  `notifications.rs` has a second axis (`use_case_ids` +
  `event_filter`) with its own matcher. Two subscription models with
  different axes, neither composable with the other.
- **Pattern authoring is a comma-separated free-text field**
  (`WebhookSubscriptionsPanel.tsx:321-322`, `parseEventTypes`) with no
  validation against the event registry — a typo'd family name passes
  the door (it is a non-empty pattern) and matches nothing forever.

  Re-checked 2026-10-31 at personas@22260d77c9: the cited panel lines are
  gone. Pattern entry moved to `WebhookEventPicker.tsx` (inside
  `WebhookDraftForm.tsx`), which offers chips from the observed event
  vocabulary and classifies every pattern (`classifyPatterns`,
  `libs/webhookMatch.ts:191-204`); an `unknown` pattern is flagged with a
  warning and a nearest-name suggestion. **This gap is largely closed at
  authoring time.** The repo door still accepts any non-empty pattern, and
  the UI warns rather than blocks, so a typo can still be saved deliberately.
