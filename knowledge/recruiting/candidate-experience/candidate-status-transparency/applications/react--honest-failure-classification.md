---
layer: application
type: application
subject: candidate-status-transparency
technique: honest-failure-classification
stack: react
verified_on: 2026-09-28
verified_against: react@19
---

# Two failure kinds on the public status page (React)

`classifyStatusError` (`app/_lib/application-status.ts:119-123`, doc at
`:108-118`) plus its consumer `app/status/[token]/StatusClient.tsx` implement
the technique's classification and both of its "where the failure lands"
rules. Re-read at kp `6f3fca44d`.

## The classifier

```
export type StatusFetchError = "invalid" | "retryable";
```

The doc comment (`application-status.ts:101-106`) states the split exactly as
the standard does: `invalid` means "the LINK is the problem (unknown/expired
token). Permanent and user-actionable; retrying the same URL is futile";
`retryable` means "a transient fault (offline, 5xx, back-pressure)."

The rule is `status === null` (fetch threw before any response — offline, DNS,
CORS) → retryable; `>= 500 || 408 || 429` → retryable; every other 4xx,
"notably the route's 404 for an unknown/expired token" → invalid (doc
`:114-117`, code `:120-122`). The 429 case is the one an expert draft tends to
miss: a rate-limited candidate mashing Refresh has a perfectly good link, and
calling it invalid would tell them their application is gone.

The change is attributed to `bug-ui-scan-2026-07-09 #4` (`:110-111`) — before
it, the page had "one dead-end string for every failure."

Since 2026-09-03 the route answers an unknown token with the coded refusal
`STATUS_LINK_INVALID` (404) rather than prose, and the decision-history, NPS,
resend and letter routes use the same code. Wrong key and no such application
share the code and the status, and the throttle runs before the lookup, so a
429 reveals nothing either — the technique's "do not distinguish them" rule.

## Distinct copy, and a Retry only where retrying can work

`StatusClient.tsx:214-231`: the alert renders `t("linkInvalid")` or
`t("loadFailed")`, and the Retry button is gated on `error === "retryable"`.
A dead link gets no retry affordance at all.

A 200 response whose body still carries an `error` field is treated as
`retryable` (`:102-107`) — "anomalous", so resolve toward the candidate rather
than toward "your link is dead."

## A refresh failure never wipes a good render

`:214-216` guards the error branch with `error && !view`: "Only take over the
page on the INITIAL load failure — a transient poll error after a good render
must never wipe an already-shown status." The page polls every 45s and
revalidates on focus and visibility (`:141-160`), and stops once
`isTerminalCandidateStatus(view.status)` (`:145-147`).

## Optional sections fail by omission

The decision-history fetch (`:125-139`) swallows its error with
`/* best-effort — the section is simply omitted */` (`:134`), and the header
notes "the status itself must never depend on it" (`:82-86`).
`StatusNpsCard.tsx:40-42` is blunter: the card "simply does not render — a
feedback prompt is never worth an error banner." That comment is where this
repo taught the standard its alarm-is-a-budget rule.

## Gaps

- **The loading state is unbounded** (still open). The skeleton
  (`:232-246`) has `aria-busy` and a screen-reader label, but `load()`
  (`:93-116`) calls `fetch` with no abort signal and no timer moves the page
  into the retryable state. A request that never resolves leaves the skeleton
  pulsing indefinitely.
- **The transient copy blames the candidate.** `loadFailed` reads "We couldn't
  load your status right now. Please check your connection and try again." It
  is shown for every retryable case, including 5xx and 429, where the
  connection is fine. It does not say the fault is ours, that the application
  is unaffected, or offer a contact route. No stated reason was found; the
  string dates from before the classifier.
- **The invalid copy names mechanics the store does not have.** `linkInvalid`
  reads "This link is no longer valid. Check your email for your most recent
  status link, or contact the hiring team." The store holds one permanent
  token per application with no expiry and no reissue
  (`application-status-store.ts:22-29`), so there is no "most recent" link and
  no link that stops being valid. The doc comments' "unknown/expired" describe
  a state the store cannot produce. The contact route in the same sentence is
  the part that works.
- **Invalid keys are not counted.** The refusal helper logs nothing, so a rise
  in invalid-key hits (the signature of a mail client truncating links) is
  invisible to the operator.
