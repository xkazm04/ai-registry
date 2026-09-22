---
layer: application
type: application
subject: toasts-notifications
technique: durable-notification-ledger
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# A ledger of decisions, not of deliveries

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4) at HEAD `62c252dd`; every
citation below was resolved against that tree on 2026-09-20.

Ascent has no transient toast tier at all: its out-of-band messages go out of the
application (a chat webhook, a mail sink, a browser notification) or they go
nowhere. That makes its alert history an unusually pure reading of this technique's
central claim, because the ledger is not backing up a toast — it is the *only*
in-app trace an alert ever leaves. The admission rule therefore has to carry the
whole load, and it does: the row is written from the decision to raise the alert,
not from the send.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| The store | `prisma/schema.prisma:878` `AlertEvent` — org-scoped rows with `kind`, `severity`, `repoFullName`, `title`, capped `body`, `delivered`, `sinkKind`, `suppressedReason`, `createdAt` |
| Admission at the source | `src/lib/db/alert-events.ts` opens by stating the rule: *one row per alert the product DECIDED to raise, whether or not a sink was configured or the POST succeeded*. Every producer writes the row on every branch, including the branches where nothing left the building |
| Deliberately not the audit trail | same header: the audit log is subject to `retentionAuditDays` purging, so an alert history built there "would age out from under the UI". The table exists because two different records have two different lifetimes |
| The writer cannot hurt the alert | `recordAlertEvent` (`:56-79`) is best-effort by contract — DB-less returns `false`, unresolvable org returns `false`, every throw is caught and logged as *"write failed (alert unaffected)"*. Losing a history row must never suppress the alert or fail the scan that produced it |
| Not-delivered is a reason, not a flag | `AlertEventInput` (`:27-38`) pairs `delivered: boolean` with `suppressedReason: "no-sink" \| "cooldown" \| "dispatch-failed" \| null`, and the write nulls the reason whenever `delivered` is true so the two cannot contradict each other |
| Never-eligible is a fourth state, spelled as silence | `src/lib/scan-alerts.ts:408-419` — an unmeasurable-only control batch records a plain undelivered row with **no** reason, and the comment says why: `no-sink` there "would blame the operator's configuration for a decision the product made deliberately" |
| Classification over the whole event, not the dispatched part | same block, `:396-398`: severity is computed over **every** item, not just the ones that cleared the cooldown, "because the history has to say a control failed even in the week the push was throttled" |
| The record outlives the sender's bookkeeping | `src/app/api/cron/digest/route.ts:366-376` — on a failed send the route *releases* its at-most-once window claim so the next run retries, then writes the row anyway: "the released claim forgets a failed window; this row remembers the attempt and its outcome" |
| …and the release cannot take the record with it | `:353-363` — the release is `.catch`-wrapped for exactly this reason. Unhandled, a release failure threw past the row into the per-org catch, so "the one outcome that most needs a record — delivery failed and the window is still claimed — was the outcome that left none" |
| Read path | `listAlertEvents` (`alert-events.ts:86-107`) — newest-first, `take` clamped to 1..100 with a default of 30, `null` when DB-less so a reader can tell *unavailable* from *empty* |
| Surface | `src/components/org/shared/AlertsHistory.tsx` — a `<details>` in the alerts popover, lazy on first expand, member-readable through `GET /api/org/alerts?history=1`; rows carry titles and outcomes and never the sink URL |

## Judgment calls worth copying

- **The reason enum is the product of the decision path, not a catch-all.** Each
  producer computes it as an explicit ladder — no sink, then cooldown, then
  dispatch-failed — so the row says which gate stopped the message rather than
  that some gate did. Three different people own the three remedies.
- **Separating the record's lifetime from the audit trail's** is the kind of
  decision that is invisible until it bites: a history built on a purge-able trail
  silently shortens to the trail's retention, and the UI that reads it looks like
  it lost data.
- **"Write failed (alert unaffected)"** in the error line is worth copying
  verbatim. It tells the next reader of the log which invariant did *not* break,
  which is most of what an operator needs from a best-effort write.

## A derived notice in the same tree

The technique's derived-notice rule has a clean realization here, on a message that
never touches the ledger at all. The checkout route sends a returning buyer back to
the dashboard with `?credits=pending` or `?credits=error`, and the banner is rendered
from that parameter — so the parameter, not a store, is the notice's durability.

- `src/features/standing/overview/overviewBilling.ts` `resolveBillingReturn` is the
  predicate, and it builds the dismissal target server-side as the current URL minus
  that one parameter. Its comment states the second half of the rule outright: the
  href "drops ONLY that param and preserves everything else, so dismissing the notice
  never silently resets the period or the segment scope."
- `src/components/org/shared/BillingReturnNotice.tsx` dismisses in the two-step shape —
  `setDismissed(true)` to hide immediately ("hide immediately; the replace then makes
  it durable"), then `router.replace(dismissHref, { scroll: false })` to retract the
  predicate. Without the second step the notice returns on reload, on back-navigation,
  and for anyone the buyer shares the link with.
- The banner is announced as `role="status"` for the reassuring case and `role="alert"`
  for the failed checkout — the politeness mapping this subject's announcement
  technique describes, applied to a two-level message.

Worth noting what the notice does *not* have, because the technique now says so: it
carries no obligation. The pending case resolves itself when fulfilment lands and the
error case is recoverable from the same page — a derived notice whose whole life is
one visit, which is exactly the shape derivation is for.

## Gaps against the technique (deviations, reported not fixed)

- **No read-state, and therefore no badge.** Entries are uniformly history; there
  is no unread bit, no resolution state, and no count on stable navigation. The
  technique's read/unread contract and its
  count-carries-predicate badge have no counterpart here, so "what happened while
  I was away" is answerable only by remembering to open a collapsed `<details>`.
  With no toast tier to be missed, this is the whole attention mechanism, and it
  claims no attention at all.
- **The ledger names no reaper.** Escaping the audit trail's `retentionAuditDays`
  escaped *every* age policy with it: the only code that deletes an `AlertEvent`
  is tenant erasure (`src/lib/db/retention.ts:2096-2101`). There is no per-class
  retention, no cap, and no eviction — the table grows for the life of the org,
  and the read path's `take` limit is a window over an unbounded store, not a
  retention policy.
- **No coalescing.** A repeating condition appends one row per occurrence; the
  technique's one-fact-with-an-occurrence-count shape is absent. The cooldown
  keeps the *channel* quiet and lets the *ledger* take the full storm, which is
  the right half of the trade but leaves the record to be read as N incidents.
- **The kind vocabulary is declared four times and two copies are already stale.**
  `AlertEventKind` (`alert-events.ts:12-26`) has eight members; the schema's
  doc comment (`prisma/schema.prisma:881-883`) lists seven; `KIND_EMOJI` in
  `AlertsHistory.tsx:23-31` has seven; and the component re-declares the row
  interface client-side. `control` — the newest kind, and the one whose own
  comment argues hardest for being distinguishable — is missing from the last
  three, so a control row renders the fallback bullet. This is the single-authority
  rule failing in the direction the severity technique now names: the widest
  declaration gained a member and the derived maps never learned.
- **Severity forked the same way, and the two halves of one event disagree.**
  The authority is `AlertSeverity` (`src/lib/alerts-detection.ts:13`) with three
  members; `AlertEventInput.severity` admits four (it adds `info`), and
  `controlAlertSeverity` (`src/lib/alerts.ts:645`) returns `"critical" |
  "celebration" | "info"` — with a docstring claiming it exists "so the dispatcher
  and the AlertEvent row agree without re-deriving the rule". Thirty lines above
  it, `buildControlAlertMessage` (`:613`) re-derives exactly that rule into an
  `AlertSeverity`, where `info` is not expressible, and lands on `warning`
  instead. Its own docstring says a batch of only-unmeasurable items "is `info`" —
  behavior the type it annotates cannot produce. So an unreadable-control event
  is voiced at warning and recorded at info, and because `SEV_EMOJI`
  (`:104`) is total over the three-member authority, the missing cell is filled by
  a hardcoded glyph at the call site. Every symptom the amended technique predicts,
  in one function.
- **Severity reaches the client and drives nothing.** `listAlertEvents` selects it
  and `AlertsHistory` declares it on the row interface, then renders by `kind`.
  The one classification that is supposed to drive every presentation decision
  drives none of them in the only surface that shows the ledger.
