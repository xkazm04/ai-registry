---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: tenant-scoped-legal-framing
stack: node
status: forged
verified_on: 2026-08-20
---

# Node: scoping the compliance lookup to the caller's workspace

`app/api/compliance/route.ts` is a nine-line handler carrying twenty-five lines
of comment, and the comment is the artifact worth reading.

## The incident

`route.ts:19-22`, verbatim: "Bare, `getActiveRegimeId()` always answered for the
default workspace: a team that had set its jurisdiction to `us` still saw 'EU
equal-treatment directives / processed under GDPR' on its Decisions compliance
card, and shipped that same wrong law to its candidates."

That is the technique's first failure mode observed in production. The fix is
the technique's rule: resolve the workspace from the session first, then read
its regime — `getActiveRegimeId(await currentWorkspace())`.

## The refusal to widen trust

`route.ts:31-33`: "Widening this route's trust (e.g. a caller-supplied workspace
id) would let anyone enumerate any team's legal posture, so it stays off the
table."

This is the second failure mode, refused by design rather than mitigated by an
authorisation check. The route is safe to expose unauthenticated for the
opposite reason to the usual one — not because access is controlled, but
because the response contains nothing about a *specific* caller: only a regime
identifier and a duration, "no candidate data" (`route.ts:14-16`).

## The candidate half, and why it is not closed by this route

`route.ts:24-30` scopes the honesty precisely: "This closes the SESSION-BEARING
half only, and deliberately so. The recruiter Decisions card
(`decisionsComplianceState.ts`) carries a cookie and is now correct; an
anonymous candidate rendering `AiDisclosure` has none, so `currentWorkspace()`
falls back to the default — the shipped behavior, unchanged, not a new leak."

And it names the durable fix, which is the technique's server-side-from-token
rule: "resolve the regime SERVER-side from the capability token's workspace and
pass it in as a prop, because a client fetch cannot prove which tenant's job the
candidate is looking at." This was an upward lesson — the draft standard said
"scope by the session" and had no answer for a surface where there is no
session. The capability token the candidate already holds is the answer.

## The disclosure consumes the row, it does not choose it

`app/_components/AiDisclosure.tsx:16-22` records the requirement from the
consuming side: the note "self-resolves the workspace's active compliance regime
… and names that regime's anti-discrimination framework + data law." That is the
seam with `candidate-ai-disclosure-and-explanation` working correctly — this
subject supplies which framework and which data law; the disclosure decides how
to say it.

The same block also shows the enforced-number rule in practice: the fetch
carries `consentRetentionMonths` derived server-side from `KP_CONSENT_TTL_DAYS`,
"so the consent sentence states the enforced duration instead of a hardcoded '12
months'" (`route.ts:10-13`, `AiDisclosure.tsx:20-22`). A retention promise that
does not read the setting enforcing it is a claim the record does not hold.

## Status-blind parsing, found and fixed

`AiDisclosure.tsx:57-64` documents the subtlest bug in the technique: "Status-
blind parsing made a GATED response indistinguishable from a successful one: the
auth proxy answers `{"error":"Unauthorized"}` with 401, which parses fine, yields
no `jurisdiction`, and silently leaves the EU default standing. Rejecting on
`!r.ok` routes that through the same failure path as a network error, so the
endpoint being unreachable is a real (and retried) failure rather than an
invisible fallback."

Upward lesson, taken into the technique as its own procedure step. A compliance
lookup whose failure is indistinguishable from success does not fail closed; it
fails invisibly, which is worse.

## Open deviations

Two, both recorded in `AiDisclosure.tsx:33-40` rather than hidden:

1. `/api/compliance` is not on the public allow-list
   (`app/_lib/auth/public-routes.ts`), so on any deployment with
   `KP_OPERATOR_PASSWORD` set the proxy 401s it and no candidate ever receives
   the real regime — the pre-fetch `eu` default becomes the permanent state.
2. The route answers for the default workspace for anonymous callers, per the
   comment above.

The standard is unchanged by either: the framing must be resolved server-side
from the token and passed in as data, and the failure state must be the neutral
row, not a jurisdiction. Both deviations are honestly labelled in-code as
deliberate calls pending that fix, which is the right way to carry a known gap —
and it is worth noting that the file's comment was itself corrected once for
overclaiming ("an earlier revision of this comment claimed … that is only true
for an EU workspace"). A compliance comment that audits itself is rarer than the
control it documents.
