---
layer: application
type: application
subject: candidate-status-transparency
technique: honest-failure-classification
stack: react
verified_on: 2026-08-30
verified_against: react@19
---

# Two failure kinds on the public status page (React)

`classifyStatusError` (`app/_lib/application-status.ts:103-118`) plus its
consumer `app/status/[token]/StatusClient.tsx` implement the technique's
classification and both of its "where the failure lands" rules.

## The classifier

```
export type StatusFetchError = "invalid" | "retryable";
```

The doc comment (`application-status.ts:96-101`) states the split exactly as the
standard does: `invalid` means "the LINK is the problem (unknown/expired
token). Permanent and user-actionable; retrying the same URL is futile";
`retryable` means "a transient fault (offline, 5xx, back-pressure)."

The rule is `status === null` (fetch threw before any response — offline, DNS,
CORS) → retryable; `>= 500 || 408 || 429` → retryable; every other 4xx,
"notably the route's 404 for an unknown/expired token" → invalid (`:109-112`).
The 429 case is the one an expert draft tends to miss: a rate-limited candidate
mashing Refresh has a perfectly good link, and calling it invalid would tell
them their application is gone.

The change is attributed to `bug-ui-scan-2026-07-09 #4` — before it, the page
had "one dead-end string for every failure."

## Distinct copy, and a Retry only where retrying can work

`StatusClient.tsx:182-194`: the alert renders `t("linkInvalid")` or
`t("loadFailed")`, and the Retry button is gated on `error === "retryable"`.
A dead link gets no retry affordance at all — the standard's rule that a
futile control is worse than no control, because the anxious candidate will
press it repeatedly.

One extra classification the draft did not anticipate: a 200 response whose
body still carries an `error` field is treated as `retryable` (`:66-70`) —
"anomalous", so resolve toward the candidate rather than toward "your link is
dead."

## A refresh failure never wipes a good render

`:177-181` guards the error branch with `error && !view`, commented: "Only take
over the page on the INITIAL load failure — a transient poll error after a good
render must never wipe an already-shown status." This matters because the page
polls every 45s and revalidates on focus/visibility (`:109-123`) — without the
guard, leaving the tab open guarantees the candidate's information eventually
gets *worse*.

The same block stops polling once `isTerminalCandidateStatus(view.status)`
(`:108-110`): a finished application is not re-fetched, so the page stops
manufacturing chances to fail in front of someone whose story is over.

## Optional sections fail by omission

The decision-history fetch (`:88-102`) swallows its error with
`/* best-effort — the section is simply omitted */`, and the header notes "the
status itself must never depend on it." `StatusNpsCard.tsx:35-37` is blunter:
the card "simply does not render — a feedback prompt is never worth an error
banner."

That comment is where this repo taught the standard something. The rule
generalizes: on a surface read by an anxious person, alarm is a budget, and it
is spent entirely on the thing they came for.

## The one gap

The loading state (`:195-209`) is a skeleton with `aria-busy` and a screen-
reader label, but it is unbounded — a request that never resolves leaves the
skeleton pulsing indefinitely rather than degrading into the retryable state
after a defined wait. The standard's third state is only two-thirds present.
