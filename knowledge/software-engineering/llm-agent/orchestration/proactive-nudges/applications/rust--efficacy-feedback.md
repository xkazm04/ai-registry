---
layer: application
type: application
subject: proactive-nudges
technique: efficacy-feedback
stack: rust
verified_on: 2026-10-14
---

# Efficacy feedback — ignored as a vote on Athena's nudge caps (Personas)

The technique's loop as implemented in `src-tauri/src/companion/proactive/budget.rs`
(`adjustment`, `engagement_30d`, `modulations_summary`), reading outcomes off
`companion_proactive_message.status`.

## What already conformed

- Closed outcome set on the row itself: `engaged`, `dismissed`, and a lifecycle
  sweep (`mod.rs`, `sweep_lifecycle`) that turns an untouched `delivered` card
  into `expired`.
- Slow, coarse, floored adaptation: 30-day window, 5-sample floor, a single
  +/-1 step, clamped to `[1, base+2]` beneath the unchanged global ceiling.
- Counts carry their predicate: `modulations_summary` reports engaged and
  dismissed counts beside every changed cap.

## The gap this application found

The aggregate only read `engaged` and `dismissed`. The technique names
**ignored** the strongest negative, and the quiet majority outcome, yet a kind
whose cards all aged out contributed zero rows to the read: total below the
sample floor, adjustment 0, cap unchanged, forever. Decay needed somebody to
perform the dismissal gesture, which is exactly the gesture the technique says a
disliked kind does not earn.

The row could not say "ignored" directly: `expired` is shared by three sweeps,
two of which are expired-**undelivered** (never reached the user, so, per the
technique, not an outcome). The discriminator is the delivery stamp:
`status = 'expired' AND delivered_at IS NOT NULL`.

## The change

- `adjustment(engaged, dismissed, ignored)`: reject rate is
  `(dismissed + ignored) / total`; `ignored` also sits in the denominator of the
  engaged rate, so recovery is earned against everything delivered.
- One shared SQL fragment feeds both the cap read and the operator summary, so
  the transparency surface cannot disagree with the policy.
- Expired-undelivered rows stay out (test pins it).

## Limit, stated rather than papered over

`delivered_at` means the pass claimed the card, not that a human saw it; the row
carries no exposure stamp. A kind delivered while the app sat closed can lose a
step it did not earn. The damage is bounded (one step, floor 1, 30-day window,
recoverable by engagement) and the safe closing is an exposure stamp so that
ignored means seen-and-untouched.
