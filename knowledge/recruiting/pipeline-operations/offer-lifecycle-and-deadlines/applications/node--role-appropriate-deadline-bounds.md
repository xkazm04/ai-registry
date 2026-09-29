---
layer: application
type: application
subject: offer-lifecycle-and-deadlines
technique: role-appropriate-deadline-bounds
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
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

`OFFER_TTL_DAYS_MIN = 1` / `OFFER_TTL_DAYS_MAX = 90` (`app/_lib/offer-policy.ts:15`)
carry their justification in the comment above them: "An 'exploding' offer can be
as tight as a day; an exec search may legitimately need months." The default sits
at 7 days, deployment-tunable through `KP_OFFER_TTL_DAYS` and validated back into
the bounds (`defaultOfferTtlDays`, `:23`) — "the common recruiting default, short
enough to keep momentum, long enough not to rush a considered candidate."

`resolveOfferTtlDays` / `resolveOfferTtlMs` (`:36`, `:43`) are the per-offer override, and its comment is
the technique's own argument in the repo's words: "a tight, role-specific window is
a known accept-rate accelerant for in-demand roles, while senior offers need weeks
— one fixed 7-day window served neither."

The validation posture matters as much as the numbers. A per-offer value that is
absent, non-numeric or out of range does not reject the offer; it falls back to the
deployment default. A recruiter who typed 400 gets a live offer with a seven-day
window, not a failed extend.

The window is a duration and the deadline is derived **once**, at dispatch:
`offerExpiresAtMs(createdAtMs, ttlDays)` (`:74`) is called at row creation and the
absolute instant is stored in `offers.expires_at`. Nothing re-derives it on read,
so the deadline cannot move under the candidate.

The duration is *elapsed* time, and the module says so: `ttlDays` is multiplied out
to whole 24-hour days, so a 7-day offer minted at 14:00 local across a spring-forward
transition lapses at 15:00 local. The stated reason is that "you have seven days" is
a promise about duration, the offer row carries no timezone, and every consumer
compares UTC instants; the candidate is not left to infer the shift because the
letter states an absolute deadline with its zone (see the countdown application).
The persisted `ttl_days` is what later lets a re-extend tell a changed window from a
double-clicked, verbatim re-send.

## Absence fails open, deliberately

`isOfferExpired(expiresAtIso, nowMs)` (`:81`) returns `false` for a null or
unparseable deadline, and the comment states why in one line: "offers minted before
the column existed must stay actionable rather than being silently killed by a null
deadline."

The same rule is re-stated at every enforcement point rather than assumed. The
global sweep `lapseExpiredOffers` (`app/_lib/offers-store.ts`) excludes
`expires_at IS NULL` in SQL — "Rows with a NULL deadline (legacy) are excluded —
they never expire" — and `dueOfferReminders` excludes them too, because "nothing to
nudge toward". A null deadline is one state, and three separate code paths agree
about what it means.

## Terms are validated before a link is minted

`validateOfferTerms` (`:194`) draws a line the golden path's "no band, no figure" rule
needs: *unpriced is legal, invalid is not*. A missing or unparseable figure stays
`null` (the drafter refuses to invent one and the auto-extend gate parks the draft
for a human), but a figure that is present and negative or above
`OFFER_SALARY_MAX`, a currency outside a closed list (`OFFER_CURRENCIES`), or a
note over 2,000 characters is refused with a coded reason. The recorded cause was a
negative figure rendering verbatim on the accept page as the amount someone was asked
to accept. The currency list is the app's own vocabulary, not a standard: a market
added elsewhere without a matching code here is a refused offer, not a mislabelled one.

## Correction refreshes the live offer in place

`getOrCreateOpenOffer` (`app/_lib/offers-store.ts`) is where "at most one live offer
link per candidate and role" is actually enforced, and it exists because of a
recorded TOCTOU: the route used `getOpenOfferForEntry(id) ?? createOffer(...)`, so
"two near-simultaneous approvals (a double-clicked Accept, or two recruiters) both
saw no open offer and both minted one, sending the candidate TWO live offer links
with different tokens." The fix is an `IMMEDIATE` transaction plus a partial unique
index as a backstop for any writer that bypasses the helper.

Inside that transaction sits the distinction between a re-send and a correction.
Three conditions now count as material: `termsChanged` (salary or currency differs
from the stored row), `deadlineChanged` (the applied `ttlDays` differs from the
persisted one — widening 7 to 14 days on an unchanged figure used to be silently
discarded), and `deadlineLapsed` (the deadline has passed but the sweep has not yet
flipped the row, so a verbatim re-send would mail a link that 410s on arrival).

- **None of the three** — verbatim re-send. Same row, same token, deadline and
  reminder claim untouched. The comment calls it "the idempotent re-send contract;
  never a second live link."
- **Any of them** — the offer is "effectively re-extended": the same row is updated
  to the new figure, `expires_at` is recomputed from the draft's `ttlDays`, and
  `reminded_at` is reset to `NULL` so the single nudge re-arms against the new
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

`defaultOfferReminderLeadHours()` (`app/_lib/offer-policy.ts:52`) defaults to 48
hours, bounded 1–168 and tunable via `KP_OFFER_REMINDER_LEAD_HOURS`. Its comment
names it as "the proactive half of the expiry policy: the deadline lapses an offer
silently; this is the one heads-up sent before that, so a candidate who simply
forgot doesn't lose a live offer to silence."

`isOfferReminderDue` (`:92`) implements the two-sided predicate — the deadline must
be `> now` **and** `<= now + leadMs` — so an already-lapsable offer never generates
a nudge. `dueOfferReminders` re-expresses the same bounds in SQL against
`reminded_at IS NULL`, and `markOfferReminded` CAS-claims the stamp before dispatch
(`UPDATE offers SET reminded_at = ? WHERE token = ? AND reminded_at IS NULL AND
status = 'extended'`), making the nudge at-most-once: "a missed nudge is benign; a
duplicate is not."

`sendDueOfferReminders` in `app/_lib/offer-reminders.ts` carries the incident that
proves the ordering rule "resolve everything first, claim last." The by-id entry read
was originally tenant-blind, fell back to the default workspace and returned `null`
for every other team — so the `continue` after the claim "dropped them AFTER the claim above had already
burned their one-shot reminder: a non-default team's candidate got no heads-up at
all and watched a live offer lapse in silence, with `reminded_at` stamped as if we'd
nudged them." The fix passes `offer.workspaceId` — the offer row is the only tenant
authority a heartbeat with no session can consult.

A claimed-but-undelivered nudge is no longer only a log line: the dispatch failure is
recorded as an `offer_comms_failed` pipeline event ("The T-48h offer reminder was
claimed but the message did not go out"), so the miss shows on the recruiter's
timeline while the at-most-once claim stays unrewound.

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
- **Extension is still not a first-class recorded act.** A window is now restarted by
  a terms change, a changed `ttlDays` or a lapsed-but-unswept row in
  `getOrCreateOpenOffer` — an improvement — but it is still a side effect of
  re-approval: no "extend this offer to a new date, by this recruiter, for this
  reason" record, and the re-dispatched letter is the only signal that the date moved.
- **Expired offers are re-issued only by minting a new one**, which is the correct
  posture — but nothing prevents it being confused with an extension, because there
  is no extension to confuse it with.
- **The company zone is a deployment setting, not an offer field.** The timezone
  shortfall this section listed on 2026-08-20 is closed: the letter's
  `formatOfferDeadline` (`app/_lib/comms-dispatch.ts:1052`) and the page's
  (`app/offer/[token]/offer-deadline.ts`) both name the zone (`timeZoneName: "short"`).
  What remains is that the two surfaces name different clocks: the page states
  `INTERVIEW_TZ` (the offer row has no zone column, and the page module says so),
  while the letter states "the short zone name of whatever clock the server is on".
  Same instant, two labels whenever the server's zone is not the interview zone, and
  a hiring team outside the deployment's zone reads the wrong company clock,
  correctly labelled.
