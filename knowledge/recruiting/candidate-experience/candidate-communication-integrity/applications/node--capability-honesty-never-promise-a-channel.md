---
layer: application
type: application
subject: candidate-communication-integrity
technique: capability-honesty-never-promise-a-channel
stack: node
status: forged
verified_on: 2026-08-20
---

# Capabilities, not derivations: inbound mail, links, and promised reminders

Three places in this app promise something to a candidate, and each one is
gated on a capability that must actually exist.

## 1. The inbound address that nothing on the internet accepted

`app/_lib/comms-truth.ts:28` carries the incident in full. The app has exactly
one real receiver — the HTTP endpoint `/api/channels/inbound/[token]`. There is
no inbound-email provider and no MX route anywhere in the repo. Yet the Email
intake wizard used to **synthesize** a forwarding address from
`window.location` — `hook_x@inbound.<host>`, falling back to the literal
`inbound.kp.app` — and then walk the recruiter through pointing a real mailbox
forwarding rule at it. Applications forwarded there vanish: nothing accepts that
mailbox.

The fix is the technique stated as code. `emailInboundDomain()`
(`app/_lib/comms-truth.ts:46`) reads `EMAIL_INBOUND_DOMAIN`, normalizes a pasted
scheme, path or whole address away, and validates the shape — returning `null`
when nothing is wired, with the rule spelled out in the doc comment: "NEVER
derived from a request origin — a hostname the app is served on says nothing
about mail routing." `isEmailInboundConfigured()` (`:61`) is the capability bit,
explicitly the inbound twin of `isRelayConfigured`. `emailInboundAddress(token)`
(`:68`) returns `null` rather than a fabricated address, "in which case there is
NO address to show and the caller must fall back to the HTTP receiver URL rather
than fabricate one".

The degraded path is a working path, not an apology: unset, the wizard shows the
real receiver URL and says forwarding isn't wired
(`docs/features/comms/README.md`, configuration summary).

## 2. Absolute links, and the loud warning when the origin is a guess

`candidateLinkBase()` (`app/_lib/comms-dispatch.ts:77`) is the one link builder
for candidate-facing URLs composed inside the dispatch module. Its comment states
the reason: "Links a candidate opens from an email must be ABSOLUTE — a relative
`/data/er-…` path is dead in every mail client (capst-l2-102)."

Resolution follows the send's context. Inside a route handler (apply
acknowledgement, reject, offer, invite) the origin is recovered from the ambient
request headers — the same origin the absolute status link beside it was built
from. Detached callers (heartbeat sweeps, offer-lapse reminders) have no request
and rely on `APP_BASE_URL` / `NEXT_PUBLIC_APP_BASE_URL`. When nothing
deployment-specific resolves, `publicBaseUrl` still returns an absolute canonical
default *and* the code warns loudly, because "a fallback means nothing
deployment-specific was configured — the link uses the DEFAULT origin, which may
be wrong for this deploy".

The footer this serves (`dataFooter`, `app/_lib/comms-dispatch.ts:129`) is the
self-service data-rights line appended to every candidate-facing message: a
localized "review or erase your data" line carrying the entry's opaque erasure
token to the public `/data/[token]` page. The rule the code states is the one
worth transplanting — "the footer still renders — never silently drop a legal
affordance" — with the single honest exception of an already-anonymized entry,
where there is nothing left to manage.

## 3. The reminder that is only promised when it will fire

`dispatchInterviewConfirmation()` (`app/_lib/comms-dispatch.ts:370`) takes
`opts.shortNotice`, decided by `app/_lib/interview-reminder-policy.ts`, and
selects between two catalog bodies: `interviewConfirmation.normal`, which
promises a separate reminder before the call, and `interviewConfirmation.short`,
which does not and reads as a "see you soon" instead. The comment states the
doctrine plainly: "we never tell someone a reminder is coming and then silently
skip it."

The policy behind it is pinned as constants (`docs/features/comms/README.md` §5):
`REMINDER_LEAD_MS` 24h look-ahead, `REMINDER_MIN_NOTICE_MS` a 2h short-notice
floor, `REMINDER_MAX_ATTEMPTS` 5 with an exponential `REMINDER_RETRY_BASE_MS`
backoff capped at 30m. Each retry is claimed atomically (`claimReminderAttempt`)
so a failing provider cannot produce a duplicate send, and `reminder_sent_at` is
set only on success — the send marker follows the send, never the attempt.

## Where this deployment falls short of the standard

- **Configured is not verified.** Both capability bits are binary: a URL or a
  domain is set, or it is not. There is no round-trip verification and no
  re-verification, so a route that stops working keeps being advertised.
- **Template promises are audited by hand.** Nothing systematically checks that a
  future-tense sentence in a catalog string has a mechanism behind it; the
  short-notice reminder case was found and fixed individually.
