---
layer: application
type: application
subject: usage-analytics
technique: privacy-scrubbing
stack: next
status: forged
applied: code
ab_verdict: better
verified_on: 2026-09-26
verified_against: next@16
---

# Privacy scrubbing: the one wrapper that copied what the visitor typed

*Read from a desktop app's marketing site (personas-web) at `b58a24f`, fixed in
`0af04d2`, 2026-09-26.*

The [privacy-scrubbing](../techniques/privacy-scrubbing.md) technique makes one
rule categorical: *no free-form text rides in a payload*. This tree follows it
almost everywhere. That makes the one exception easy to read, and it shows how
the exception got in.

## The door and its wrappers

`src/lib/analytics.ts` has one internal emit door, `trackEvent(name, attributes)`,
which is not exported. Product code calls named wrappers, and most of them
declare their attributes as closed sets. `trackDownloadClick` takes
`DownloadPlacement`, the waitlist wrappers take `WaitlistEntryPoint`, and one
wrapper's comment reads "PII: these three fields only". The door is consent-gated:
without a stored `"all"` it queues up to 50 events in memory and drains them on
accept. Every destination write goes through `safeCount`, which swallows SDK
errors.

This is allowlisting by wrapper rather than by registry. It works for as long as
every wrapper is written in that spirit.

## The exception

```ts
// src/lib/analytics.ts:112, before
export function trackFeatureRequest(text?: string) {
  trackEvent("feature_request", text ? { text: text.slice(0, 200) } : undefined);
}
```

`CustomFeatureRequest.tsx:61` called it with the trimmed textarea value, after the
same text had already been POSTed to `/api/feature-requests`. So the first 200
characters of whatever the visitor typed went to the metrics sink as an attribute,
on a second destination that nothing reads it from. The repo's own infrastructure
doc even described it as the example of good practice: "Metric attributes are
low-cardinality strings only (e.g. `trackFeatureRequest` truncates text to 200
chars)". Truncation bounds the length. It does not bound the cardinality or the
content. That doc line was the rule being misread in writing.

The error-tracker scrubbers in the same tree (`beforeSend`, `beforeBreadcrumb`)
do not help here. They run on error events and breadcrumbs, not on metric
attributes. That is the technique's argument for a source allowlist over a
downstream filter, shown in miniature.

## A and B

**B** drops the attribute. The event now counts that a request was sent, and the
text lives only where the product stores it:

```ts
export function trackFeatureRequest() {
  trackEvent("feature_request");
}
```

The test is `src/lib/analytics.feature-request.test.ts`, one test run on both
arms. It mocks the metrics sink, grants consent, and calls the wrapper with a
request containing a contact address. It then asserts that no attribute value
carries any of the typed text. Under **A** the test fails, because the text
reaches the sink. Under **B** it passes. The analytics suites pass (2 files, 10
tests), `tsc --noEmit` is clean, and eslint is clean. The doc line now says what
the code does. Verdict: **better**.

## What this does not settle

- The vocabulary is closed by the wrappers, not by a type. `trackEvent(name:
  string, …)` still accepts any name, so a future wrapper can repeat this with
  nothing to stop it. The registry-typed door of
  [event-taxonomy](../techniques/event-taxonomy.md) would make the exception a
  compile error, as the kp application of that technique shows.
- The error tracker is initialized regardless of the consent state. That concerns
  error reporting, not usage measurement, so it is out of this subject's scope.
  It is recorded here because a reader of the consent gate would otherwise assume
  it covers everything that leaves.
- The pre-consent queue is memory-only and is dropped on reload. So the events of
  a visitor who accepts on a later page load are gone. That is loss this layer
  does not count.
