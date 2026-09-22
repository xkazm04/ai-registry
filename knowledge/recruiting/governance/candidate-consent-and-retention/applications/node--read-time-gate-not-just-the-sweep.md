---
layer: application
type: application
subject: candidate-consent-and-retention
technique: read-time-gate-not-just-the-sweep
stack: node
status: forged
verified_on: 2026-09-20
---

# The read-time consent gate, with the sweep demoted (Node/Next.js)

## The predicate

```ts
export function consentWithholdsPii(snap: ConsentSnapshot, nowMs = Date.now()): boolean {
  const status = consentStatus(snap, nowMs);
  return status === "expired" || status === "anonymized";
}
```

`app/_lib/consent.ts:91-94`. The comment states the doctrine outright: it is
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
`anonymizedAt` — `app/_lib/consent.ts:40-44`) and a clock, and nothing else. No
configuration a caller can pass wrongly, no skip flag. `consentStatus` reads
`anonymizedAt` first because anonymisation is terminal, then the expiry
timestamp — so a stale status column can never outvote a lapsed date.

## The withholding transform

`redactTranscriptForConsent` (`app/_lib/consent.ts:102-106`) is the paired
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

`app/_lib/consent.ts:114-122`. The header carries the hiring judgment the
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

`anonymizeExpiredConsents` (`app/_lib/db/pipeline.ts:2518-2537`) selects
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

## The second surface: interview audio, and a clock that may never start

The same rule was applied a second time, to a different artifact, and the second
application is where the shape of the predicate gets interesting.
`app/_lib/interview-recording.ts:17-25` states the policy in the file header —
audio goes 30 days after the hiring decision, 180 days after the call when no
decision was ever taken, the moment the candidate asks, or with an erasure — and
then names the control explicitly: "the recruiter's playback door re-checks the
SAME predicate on every read so a stopped clock cannot keep serving audio past
its window (registry: candidate-consent-and-retention /
read-time-gate-not-just-the-sweep)". The standard is cited in the source that
implements it.

`recordingRetentionDue` (`:139-141`) is that one predicate, and
`app/api/interview/recording/[sessionId]/route.ts:36` is the door: the retention
check sits between the row lookup and any file access, and it answers the same
404 as an unknown id, so the refusal discloses nothing about which candidates
were recorded. The header says what the door is asserting — audio is served on
whether it is *still allowed to exist*, not on whether anything has deleted it
yet.

**The clock that may never start.** The technique's predicate reads a state and
an expiry timestamp; here there is no single timestamp to read, because the
event the promise hangs off — a hiring decision — may never happen.
`recordingDeleteDueAtMs` (`app/_lib/interview-recording-paths.ts:128-136`)
resolves it as the **earlier** of decision + 30 days and call + 180 days, so an
abandoned entry is bounded by the artifact's own age rather than waiting
indefinitely for an event nobody will supply. `entryDecisionAt`
(`interview-recording.ts:125-133`) is candid about which stored timestamp
actually marks the decision in this schema, and about its one weakness — an edit
to a closed entry moves it, which can only *delay* a deletion, which is exactly
what the absolute backstop exists to bound.

**Undatable resolves toward deletion.** `isRecordingRetentionDue`
(`interview-recording-paths.ts:144-148`) returns true when no due date can be
computed at all, and the comment gives the reasoning in the standard's own
terms: "audio we cannot date is audio we cannot justify keeping, and the cost of
dropping it is a recruiter losing a replay, while the cost of the reverse is
unbounded retention". That is the technique's unreadable-state clause, applied to
a clock rather than to a status column, and it lands on the same side.

**The deletion is the record.** `deleteSessionRecordings`
(`interview-recording.ts:155-204`) unlinks the file first and stamps the row
second, deliberately: "a crash between the two leaves a row that still says
'held' over a file that is gone — which the next sweep simply re-runs — where the
reverse order would leave a row claiming a deletion that never happened." The
metadata row survives with its deletion stamped on it, so the retention promise
is auditable after the artifact is gone.

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

`consentRequired(mode)` (`app/_lib/interview-consent.ts:41-43`) binds the gate to `mode === "candidate"`,
so a recruiter's `test` run against themselves is not gated — the exemption is
a declared predicate over the session's mode, testable in the same pure module,
rather than an environment check.

## The audit trail behind the states

`consent_events` (`app/_lib/db/core.ts:1715-1722`) is the append-only history:
`entry_id`, `kind`, `detail`, `created_at`, later widened with `workspace_id`.
`kind` is the closed transition set `granted | renewed | expiring_notified |
expired | anonymized | erasure_requested | erased`
(`app/_lib/db/pipeline.ts:1993-2000`), and `logConsentEvent` takes the open
transaction handle explicitly "so a transition + its audit row commit
atomically".

One deviation worth naming: the table has no actor column. The standard holds
that an erasure event names who requested and who executed it; here the actor
survives only as free text in `detail`. The standard stays.
