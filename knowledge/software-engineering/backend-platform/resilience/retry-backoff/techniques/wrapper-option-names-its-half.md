---
layer: technique
type: technique
subject: retry-backoff
technique: wrapper-option-names-its-half
status: forged
laws: [one-authority-per-vocabulary, silent-state-is-ungoverned]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [designing the options of a poller retryer rate limiter debouncer or breaker that wraps a function, a wrapper has an enabled disabled or skip flag, a caller turned a wrapper off and the wrapped call stopped too, a status field reads the same for off and healthy]
---

# A wrapper's option names which half it governs

A pacing wrapper - a poller, retryer, rate limiter, debouncer, breaker - is two things
in one call: the **wrapped function** (the fetch, the write, the request) and the
**wrapping behaviour** (the repetition, the retry, the limiting). An option on the
wrapper is ambiguous between the two, and the name rarely settles it:

- `enabled: false` on a poller can mean "do not repeat" (fetch once, no timer) or "do not
  run at all" (no fetch). Callers who want a dashboard with auto-refresh off read the
  first; the implementation often does the second, so the view never loads, or loads
  only because some other code path happens to.
- `enabled: false` on a rate limiter can mean "stop limiting" (let every call through) or
  "stop calling" (block everything). Both are shipped by real libraries.
- `throwOnError: true` on a retryer can mean "surface the final error" or "throw on the
  first error", and the second silently disables retrying.

The defect is not the behaviour chosen; either can be right. It is that the name lets
each reader pick, and the wrong pick fails quietly: an empty panel, a call that never
went out, a retry that never happened.

## Procedure

1. **Name the half in the option.** `poll` / `refetchInterval: false` for the
   repetition, `enabled` only for "may the wrapped call run at all"; `limit: false`
   versus `block: true`; `retryOn` versus `throwOnFinal`.
2. **When one switch must govern both, say so in the name or the type doc**, in one
   sentence that answers "with this off, does the wrapped call still run?"
3. **Report the off state as its own value.** A status of `paused: null` for both
   "disabled by the caller" and "live" repeats the ambiguity on the read side; give
   off its own reason.
4. **Test both readings**: with the wrapper off, assert whether the wrapped function
   was called, so a refactor cannot flip the meaning silently.

## Decision rules

- **When a caller can reasonably want the wrapped call without the wrapping, the
  options must let it say so** (fetch once without polling, call without limiting).
- **When the wrapper has no separate wrapped call** (it is the behaviour - a focus
  trap, a key listener), a plain `enabled` is unambiguous and needs no split.
