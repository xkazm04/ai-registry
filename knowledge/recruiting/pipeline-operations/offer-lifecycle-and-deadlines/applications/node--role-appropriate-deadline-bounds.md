---
layer: application
type: application
subject: offer-lifecycle-and-deadlines
technique: role-appropriate-deadline-bounds
stack: node
status: forged
verified_on: 2026-08-20
---

# A pure, injectable deadline policy beside a heartbeat sweep

`app/_lib/offer-policy.ts` is the whole deadline rule in one import-free,
clock-free module — "Pure + injectable (no DB / no clock) so the rule is
unit-testable, mirroring interview-reminder-policy.ts" (`:1`). Everything that
enforces a deadline in this app — the candidate page, the response path, the
heartbeat sweep, the reminder sweep — resolves it through these functions rather
than doing date arithmetic locally.

The header also records what the app looked like before the lever existed: "An
extended offer used to live forever — the token never expired and status only
flipped on accept/decline, so a recruiter had no deadline lever and a stale link
stayed actionable indefinitely."

## The bounds, and the reasoning attached to them

`OFFER_TTL_DAYS_MIN = 1` / `OFFER_TTL_DAYS_MAX = 90` (`app/_lib/offer-policy.ts:13`)
carry their justification in the comment above them: "An 'exploding' offer can be
as tight as a day; an exec search may legitimately need months." The default sits
at 7 days, deployment-tunable through `KP_OFFER_TTL_DAYS` and validated back into
the bounds (`defaultOfferTtlDays`, `:21`) — "the common recruiting default, short
enough to keep momentum, long enough not to rush a considered candidate."

`resolveOfferTtlMs(ttlDays)` (`:32`) is the per-offer override, and its comment is
the technique's own argument in the repo's words: "a tight, role-specific window is
a known accept-rate accelerant for in-demand roles, while senior offers need weeks
— one fixed 7-day window served neither."

The validation posture matters as much as the numbers. A per-offer value that is
absent, non-numeric or out of range does not reject the offer; it falls back to the
deployment default. A recruiter who typed 400 gets a live offer with a seven-day
window, not a failed extend.

The window is a duration and the deadline is derived **once**, at dispatch:
`offerExpiresAtMs(createdAtMs, ttlDays)` (`:51`) is called at row creation and the
absolute instant is stored in `offers.expires_at`. Nothing re-derives it on read,
so the deadline cannot move under the candidate.

## Absence fails open, deliberately

`isOfferExpired(expiresAtIso, nowMs)` (`:58`) returns `false` for a null or
unparseable deadline, and the comment states why in one line: "offers minted before
the column existed must stay actionable rather than being silently killed by a null
deadline."

The same rule is re-stated at every enforcement point rather than assumed. The
global sweep `lapseExpiredOffers` (`app/_lib/offers-store.ts`) excludes
`expires_at IS NULL` in SQL — "Rows with a NULL deadline (legacy) are excluded —
they never expire" — and `dueOfferReminders` excludes them too, because "nothing to
nudge toward". A null deadline is one state, and three separate code paths agree
about what it means.

## Correction refreshes the live offer in place

`getOrCreateOpenOffer` (`app/_lib/offers-store.ts`) is where "at most one live offer
link per candidate and role" is actually enforced, and it exists because of a
recorded TOCTOU: the route used `getOpenOfferForEntry(id) ?? createOffer(...)`, so
"two near-simultaneous approvals (a double-clicked Accept, or two recruiters) both
saw no open offer and both minted one, sending the candidate TWO live offer links
with different tokens." The fix is an `IMMEDIATE` transaction plus a partial unique
index as a backstop for any writer that bypasses the helper.

Inside that transaction sits the distinction between a re-send and a correction,
computed as `termsChanged` (salary or currency differs from the stored row):

- **Nothing material changed** — verbatim re-send. Same row, same token, deadline
  and reminder claim untouched. The comment calls it "the idempotent re-send
  contract; never a second live link."
- **Terms changed** — the offer is "effectively re-extended": the same row is
  updated to the new figure, `expires_at` is recomputed from the draft's `ttlDays`,
  and `reminded_at` is reset to `NULL` so the single nudge re-arms against the new
  deadline.

The reason for refreshing rather than minting is stated as the failure it prevents:
the stored row is what the binding accept page renders, while the re-dispatched
letter is minted from the live draft, so a corrected number would leave "the emailed
terms and the accept page" divergent — "a candidate could accept a figure that isn't
the one they were sent."

The update is guarded by `WHERE id = ? AND status = 'extended'`, so an offer that
was accepted, declined or lapsed in the meantime "is NEVER silently rewritten into a
different amount"; the current authoritative row is returned instead.

## The reminder lead is derived from the same module

`defaultOfferReminderLeadHours()` (`app/_lib/offer-policy.ts:43`) defaults to 48
hours, bounded 1–168 and tunable via `KP_OFFER_REMINDER_LEAD_HOURS`. Its comment
names it as "the proactive half of the expiry policy: the deadline lapses an offer
silently; this is the one heads-up sent before that, so a candidate who simply
forgot doesn't lose a live offer to silence."

`isOfferReminderDue` (`:69`) implements the two-sided predicate — the deadline must
be `> now` **and** `<= now + leadMs` — so an already-lapsable offer never generates
a nudge. `dueOfferReminders` re-expresses the same bounds in SQL against
`reminded_at IS NULL`, and `markOfferReminded` CAS-claims the stamp before dispatch
(`UPDATE offers SET reminded_at = ? WHERE token = ? AND reminded_at IS NULL AND
status = 'extended'`), making the nudge at-most-once: "a missed nudge is benign; a
duplicate is not."

`app/_lib/offer-reminders.ts:28` carries the incident that proves the ordering rule
"resolve everything first, claim last." The by-id entry read was originally
tenant-blind, fell back to the default workspace and returned `null` for every other
team — so the `continue` on line 36 "dropped them AFTER the claim above had already
burned their one-shot reminder: a non-default team's candidate got no heads-up at
all and watched a live offer lapse in silence, with `reminded_at` stamped as if we'd
nudged them." The fix passes `offer.workspaceId` — the offer row is the only tenant
authority a heartbeat with no session can consult.

## Where this deployment falls short of the standard

- **The bounds are not role-derived.** `ttlDays` is a free per-offer field within
  1–90; nothing keys the window off the requisition's seniority or hiring class, so
  "role-appropriate" is a recruiter habit here, not a policy the system holds. A
  recruiter who always types 3 is running an unapproved policy invisibly.
- **The lead time is a flat 48 hours, not proportional.** A one-day exploding offer
  and a 90-day executive window would both want a nudge at T-48h — the first can
  never get one (the offer is already inside the lead window at dispatch, so the
  due predicate's `expires_at > now` half is the only thing keeping it sane), and
  the second gets a heads-up two days out on a three-month decision.
- **Extension is not a first-class recorded act.** A window is restarted only as a
  side effect of a terms change in `getOrCreateOpenOffer`; there is no "extend this
  offer to a new date, by this recruiter, for this reason" path, and no re-dispatch
  telling the candidate the date moved.
- **Expired offers are re-issued only by minting a new one**, which is the correct
  posture — but nothing prevents it being confused with an extension, because there
  is no extension to confuse it with.
- **The deadline is rendered without a named timezone.** `formatOfferDeadline`
  (`app/_lib/comms-dispatch.ts:562`) and the candidate page both format with
  `dateStyle: "medium", timeStyle: "short"` and no `timeZoneName`, so a candidate
  in another country reads an unqualified wall-clock time.
