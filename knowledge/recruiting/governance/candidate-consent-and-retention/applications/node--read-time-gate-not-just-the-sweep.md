---
layer: application
type: application
subject: candidate-consent-and-retention
technique: read-time-gate-not-just-the-sweep
stack: node
status: forged
verified_on: 2026-08-20
---

# The read-time consent gate, with the sweep demoted (Node/Next.js)

## The predicate

```ts
export function consentWithholdsPii(snap: ConsentSnapshot, nowMs = Date.now()): boolean {
  const status = consentStatus(snap, nowMs);
  return status === "expired" || status === "anonymized";
}
```

`app/_lib/consent.ts:63-76`. The comment states the doctrine outright: it is
"the SYNCHRONOUS counterpart to the deferred expiry sweep
(`anonymizeExpiredConsents`)… the sweep is an optimization, THIS is the
control".

It was written because of `bug-ui-scan-2026-07-09 privacy-consent-provenance
#3`: enforcement previously lived only in the sweep, so an expired-consent
candidate's CV and interview transcript stayed fully served in the window
before — or entirely without — a sweep run. A single-tenant install that never
started the heartbeat had a twelve-month retention policy of "forever", and
nothing in the system said so.

The predicate takes a `ConsentSnapshot` (`givenAt`, `expiresAt`,
`anonymizedAt` — `app/_lib/consent.ts:39-43`) and a clock, and nothing else. No
configuration a caller can pass wrongly, no skip flag. `consentStatus` reads
`anonymizedAt` first because anonymisation is terminal, then the expiry
timestamp — so a stale status column can never outvote a lapsed date.

## The withholding transform

`redactTranscriptForConsent` (`app/_lib/consent.ts:78-88`) is the paired
action for the highest-risk read surface:

```ts
return { ...session, transcript: null, scorecard: null,
         candidateLabel: maskCandidateName(session.candidateLabel) };
```

Two fields die because both quote the candidate's own words verbatim — the
transcript and the free-text scorecard synthesis — while the non-identifying
session metadata (status, timing, provider) survives so the modal still renders
a coherent state rather than an error. Generic over the session shape, pure,
never mutates its input. This is the golden path's "de-identify, don't delete"
applied at a read boundary rather than at rest.

## Outreach suppression as a reason, not a boolean

```ts
export function outreachSuppressionReason(
  snap: ConsentSnapshot, nowMs = Date.now(),
): "anonymized" | "consent_expired" | null
```

`app/_lib/consent.ts:88-102`. The header carries the hiring judgment the
technique argues for: rediscovery deliberately re-contacts previously-rejected
people, so **rejection is not a suppression** — but an anonymised candidate
(terminal, PII gone) or one whose processing consent expired must be
suppressed. `none` is explicitly contactable, because a recruiter-sourced entry
never had a consent flow applied and is held on a different basis; `expiring`
is contactable, because it is still valid.

Returning the reason rather than a boolean is what lets the outreach path
explain an absence, and it distinguishes the reversible suppression (renew the
consent) from the irreversible one (there is no longer a person there).

## The sweep, and what it is still for

`anonymizeExpiredConsents` (`app/_lib/db/pipeline.ts:1746-1760`) selects
entries with `consent_expires_at <= now AND anonymized_at IS NULL` and calls
the scoped `anonymizeEntry` per row. Three details match the technique:

- **Best-effort per row**, so one failure never stalls the sweep.
- **Terminal-status rows are NOT exempt** — the comment says so explicitly: "an
  expired consent on a rejected candidate must still be honored".
- **The finder is deliberately global across tenants** ("process EVERY tenant's
  expired consents, deliberately not filtered by workspace") while each scrub
  is scoped by threading the row's own `workspace_id` into `anonymizeEntry`.
  Finder wide, mutation narrow — the inversion the technique warns about.

It runs from the instrumentation heartbeat, which is precisely why the gate
exists: the heartbeat is not a guaranteed component of every deployment.

## The other two edges: consent before the artifact exists

`app/_lib/interview-consent.ts` enforces the same idea at write time rather
than read time, at two points, for the same reason:

- `isConnectConsentSatisfied(mode, consent)` — `/connect` rejects a candidate
  session with `403` unless the request carries `consent === true` (strictly
  `true`; a truthy-but-not-`true` value is rejected), **before any provider
  credentials are minted** or the session flips to `in_progress`.
- `isPersistConsentSatisfied(mode, consentAt)` — `/complete` refuses with `403`
  to persist a candidate transcript unless the session row already has a
  non-null `consent_at`. The module header calls this "the storage invariant: a
  transcript is only saved when 'we have consent' is a fact in the row, not an
  assumption".

The header is candid about why both exist: the Start button being disabled
until the checkbox is ticked "is a UI convention, not a guarantee" — a direct
call to the connect endpoint, or a future UI regression, would otherwise store
a real candidate's interview with no consent on record.

`consentRequired(mode)` (`:44-46`) binds the gate to `mode === "candidate"`,
so a recruiter's `test` run against themselves is not gated — the exemption is
a declared predicate over the session's mode, testable in the same pure module,
rather than an environment check.

## The audit trail behind the states

`consent_events` (`app/_lib/db/core.ts:997-1004`) is the append-only history:
`entry_id`, `kind`, `detail`, `created_at`, later widened with `workspace_id`.
`kind` is the closed transition set `granted | renewed | expiring_notified |
expired | anonymized | erasure_requested | erased`
(`app/_lib/db/pipeline.ts:1484-1494`), and `logConsentEvent` takes the open
transaction handle explicitly "so a transition + its audit row commit
atomically".

One deviation worth naming: the table has no actor column. The standard holds
that an erasure event names who requested and who executed it; here the actor
survives only as free text in `detail`. The standard stays.
