---
layer: application
type: application
subject: toasts-notifications
technique: os-escalation
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Two doors out of the application, and only one of them can see you

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4) at HEAD `62c252dd`; every
citation below was resolved against that tree on 2026-09-20.

Ascent runs **both shapes** of the out-of-app tier at once, which is what makes it
worth reading for this technique. One is the browser notification the technique
was written for: a client that polls, sees the standing runner needs a person, and
raises a platform banner. The other is a message composed on a server — in a scan
path or a weekly cron — and pushed to an address an administrator nominated. They
share no code, and they could not: one has a focus signal and a per-user permission
grant, and the other has neither. Everything the technique says about admission,
immutability and one door applies to both; the three rules that assume a *client*
only apply to the first, and the second has to substitute for them.

## Door one — the server-composed sink

| Mechanism | Implementation |
|---|---|
| One delivery door | `src/lib/alert-delivery.ts:118` `dispatchAlert` is the only send. Every producer (`scan-alerts.ts`, `standard/conformance-alerts.ts`, `app/api/cron/digest/route.ts`, `app/api/cron/digest/extra-alerts.ts`) reaches the outside world through it — webhook or mail, one permission story, one failure story |
| The door absorbs the channel split | the `mailto:` branch (`:131-147`) reaches the mail transport through a **dynamic** import, because this module is reachable from a client bundle through `@/lib/alerts`' pure exports; a static import drags server-only code across that boundary and fails only at `next build` |
| Deadline on every send | `DISPATCH_TIMEOUT_MS = 8000` (`:107`), composed with the caller's signal via `AbortSignal.any` (`:148-149`) "so whichever fires first wins". Its docstring names the fan-out reason: the weekly digest dispatches to many tenants in one run and one black-holed sink would starve the rest |
| A result on every path | `dispatchAlert` returns `false` for an already-aborted signal, no sink, a malformed `mailto:`, a non-2xx, a throw, and a mail transport that sent nothing — and never throws, so a flaky sink cannot fail the scan that produced the alert |
| The destination is validated | `validateAlertWebhookUrl` (`:76-99`): parseable URL, `https:` only, no embedded credentials, and the shared `isPrivateOrInternalHost` guard — the notification channel is an outbound request to an operator-supplied address, and this is the clause that keeps it from being a request forger |
| Tenancy rides the address | `resolveAlertWebhook` (`:32`) prefers the org's own sink over the global `ALERT_WEBHOOK_URL`; the comment states the reason as fleet intelligence isolation, not configurability |
| The record describes the channel, not the column | `sinkKindForOrg` (`:53`) resolves *first*, then classifies — because a tenant riding a global `mailto:` fallback would otherwise be recorded as having left by webhook |
| Revocation travels with the message | `src/lib/email/alert-sink.ts:15-17` — every alert mail carries RFC 8058 `List-Unsubscribe` headers plus a visible footer link to `/api/email/unsubscribe` with an HMAC-signed token **that clears that org's sink**. The recipient ends the channel from inside the message |

### The substitutes for focus-awareness

This door cannot observe attention at all, and it says so by what it does instead:

- **A news gate.** `digestHasSignal` (`src/lib/alerts-detection.ts:50`) decides
  whether a weekly period is worth a push at all — a level change, a regression
  beyond the scan-to-scan noise band, a genuine gainer, a failing control, a
  depleting balance. The docstring gives the reason in attention terms: a leader
  who relies on the digest instead of opening the app filters it out fast if it
  cries "no change this week" every Monday. The cron counts the silences
  (`skippedFlat`, `app/api/cron/digest/route.ts:286`) rather than discarding them.
- **A per-subject cooldown.** `claimRegressionAlert` (`src/lib/alerts.ts:74`),
  default 6h per repository, so a score oscillating across the threshold cannot
  reprice the channel. Covered in detail in the queue-discipline application of
  this subject.

Both are attention economics with no attention signal, which is exactly what the
technique's out-of-app section now names.

## Door two — the browser notifier

| Mechanism | Implementation |
|---|---|
| Permission requested in a gesture | `src/lib/org/runner-notify.ts:48-58` `requestRunnerNotify` — the comment states that `Notification.requestPermission()` must run inside the click and "a prompt on page load is the pattern every browser now punishes". The only entry points are the notifier's own quiet chip and the theater control |
| Armed means preference **and** grant | `runnerNotifyArmed` (`:61-63`) — an unarmed notifier arms no timer at all (`useRunnerNotifier.ts:110-127`, one probe, `setTimeout(..., 0)`, never a poll), so a user who never asked is never polled |
| Permission re-checked at send time | `useRunnerNotifier.ts:135` re-reads `notificationPermission() === "granted"` inside the tick, not only when arming — a revocation between ticks stops the sends |
| Platform-level coalescing | `show()` (`:75-86`) passes `tag: ascent-runner-<slug>`, so the platform replaces the previous banner in place rather than stacking one per poll |
| Click-through carries its own addressing | `n.onclick` calls `window.focus()` then `location.assign(ledgerHref(slug))` — the full destination, not an assumption about what the tab was showing |
| Dedup survives a reload | `decideNotify` (`src/lib/org/runner-needs-you.ts:118-131`) keys on item id, and the seen-set is persisted to `localStorage` (`notifyStateKey`), so a refresh does not re-announce what was already said |
| Suppression defers, never discards | when the batch window (`NOTIFY_BATCH_MS = 900_000`, `src/lib/local/runner-types.ts:351`) blocks a notification, `decideNotify` returns the **unchanged** `seen` list — the fresh items are not marked announced, so they go out on the next eligible tick instead of vanishing |
| Storage is never load-bearing | every `localStorage` access in `runner-notify.ts` and `useRunnerNotifier.ts` is wrapped: private windows and blocked site data degrade to page-lifetime dedup, and never take the org shell down |
| Detection is not visibility-gated | the armed poll chain runs every `NOTIFIER_POLL_MS = 60_000` with the visibility gate deliberately absent — "a hidden tab is exactly when an OS notification matters" |

## Judgment calls worth copying

- **The seen-set is pruned to what is still present** (`runner-needs-you.ts:125`).
  An item that is resolved and later re-raised announces again, because it is news
  again — dedup memory that grows forever would silence the second occurrence of a
  recurring need.
- **The unarmed path is a probe, not a poll.** The offer chip appears only for an
  org that actually has a runner, which costs one read per mount; the alternative
  (show the chip to everyone) trains people to dismiss the one offer that matters.
- **Classifying the resolved sink, not the stored field.** A small line with a real
  consequence: the history row would otherwise lie about the channel for every
  tenant riding the global fallback.
- **The mail path returns `false` when nothing was actually sent** — which is what
  lets the digest release its once-per-window claim and retry, rather than marking
  the window delivered on a transport that was never configured.

## Gaps against the technique (deviations, reported not fixed)

- **Door two never checks focus at send time.** The comment in
  `useRunnerNotifier.ts` defends not visibility-gating the *poll*, which is right;
  but `show()` then fires whether or not the operator is sitting on the very
  surface the banner deep-links to. The technique's rule — never escalate about
  something the user is currently looking at — is not implemented on either the
  window-level or the which-surface level. This is the tree that motivated the
  technique's new *gate the send, not the detector* clause: ascent gets the
  detector half right and omits the send half entirely.
- **No per-event preference matrix.** Door one is a single sink per org with one
  unsubscribe: every alert kind travels or none does. Door two is a single
  on/off for one event kind. The technique's *event kind × {in-app, OS}* matrix
  exists in neither door, and the eight declared alert kinds
  (`src/lib/db/alert-events.ts:12-26`) are not individually vetoable.
- **Two doors that do not know about each other.** The technique's one-delivery-
  door rule is honored *within* each shape and not across them: nothing retires a
  browser banner when the same condition is pushed to the org's sink, and nothing
  would stop both from firing for an event visible to a scan path and to the
  needs-you endpoint. Today the two carry disjoint event sets, so the
  double-notification is latent rather than live — but no code states that
  boundary, so it is a convention, not an invariant.
- **Reading in one tier does not retire the others.** The platform `tag` retires a
  previous *banner*, and nothing retires a banner when the operator opens the
  Ledger in the application. The technique's cross-tier withdrawal is absent.
- **Localization.** Both doors compose message text as literals at the point of
  origin (`buildFleetDigestMessage`, `buildControlAlertMessage`, the notifier's
  `"Ascent — the runner needs you"`). The product is single-locale today, so this
  costs nothing yet; it is precisely the structural shape the technique warns
  about, because the composing layers — a cron route and a scan path — are the
  ones that will have no notion of a recipient's locale when one exists.
