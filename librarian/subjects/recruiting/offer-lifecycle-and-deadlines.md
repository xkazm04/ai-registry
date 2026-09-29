---
domain: recruiting
subject: offer-lifecycle-and-deadlines
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# offer-lifecycle-and-deadlines

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-olad-0929)

Dispatched on "never swept by the librarian", registry HEAD 2cfe873e, worked from
origin/main e3560955. Read the one tree the applications cite, kp at ef5a31a8a (Node 24,
Next 16, React 19). No external research lanes: the golden path's claims are design
rules and product judgment, and the measurable drift was all in the tree. Depth stays
at L2.

**Landed:** three applications rewritten against the current tree (`verified_on`
2026-09-29, `verified_against` set) and one technique conditioned.
- **Countdown application described markup kp deleted.** The offer page moved to the
  composition kit; the application's `OfferClient.tsx:289` block, `text-coral` and
  `goBackRef.focus()` no longer exist. Rewritten to the kit's `offerKitDeadline`,
  `useDialogA11y` decline confirm and `refresh`.
- **Three listed shortfalls were closed and one was mis-stated.** Closed: no re-fetch on
  focus (now a 60 s poll plus focus/visibility revalidation, stopped once terminal), no
  named timezone (page and letter both name a zone), and no minutes in the final hour.
  Mis-stated: the idempotent application called the boundary "inclusive of the deadline
  instant", but `isOfferExpired` is `nowMs >= ms`, so the deadline instant itself is
  expired. Corrected to "exclusive of the candidate, no grace".
- **New shortfalls found:** the letter and the page name different clocks (server zone
  vs `INTERVIEW_TZ`); the expired card names neither role nor date, while the open GET
  returns the full view (candidate label, figure) for an expired offer; the GET answers
  an expired offer 200 with `status: "expired"`, only the POST is 410; the 48 h urgency
  accent is still hard-coded.
- **`idempotent-terminal-response-under-a-race`** gains two conditions, both kp repairs
  read in the tree: losing the write does not imply someone answered (the row can lapse
  between the lapse check and the claim; kp had reported that as `declined`), and a
  per-offer compare-and-swap does not make a per-person consequence exactly-once
  (re-issued offers each win their own; kp keys the hire on the terminal-stage
  crossing). Not a new technique: one consumer, no lane convergence.
- Application also records: the elapsed-time (not wall-clock) deadline across DST, the
  `validateOfferTerms` "unpriced is legal, invalid is not" line, the three refresh
  triggers in `getOrCreateOpenOffer` (terms, window, lapsed-unswept), and the reminder
  miss now recorded as `offer_comms_failed`.

**Confirmed, untouched:** fail-open on a missing deadline (three enforcement points
agree), lapse-before-accept and the lazy lapse on read, the 404/410 split on the POST,
debited-never-gated metering, single nudge claimed before dispatch, no counter path
(still binary; the shortfall stands).

**Not evaluated:** no counter-evidence lane and no blind training-data lane ran; the
golden path's numeric ranges (same-day to a month) and the one-nudge rule are unsourced
judgment and were not tested against literature. `terms-injected-at-dispatch-not-at-draft`,
`single-pre-expiry-nudge` and `expired-is-a-different-answer-from-invalid` still have no
application of their own (the first two are covered inside the other three).

**Applied:** no new technique and no flipped golden-path rule, so no `applied.md` row is
owed; both technique conditions were taken from kp's own fixes.

**Impact:** kp, 4 contexts, all `unknown` - no stale verdict was carrying this subject, so no `/conform --stale` queue entry.
