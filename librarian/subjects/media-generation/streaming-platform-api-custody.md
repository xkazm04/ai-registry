---
subject: streaming-platform-api-custody
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# streaming-platform-api-custody

First note. The subject was harvested on 2026-11-02 (326b3b04e) from one Castle Control
tree. A Curator dispatch ranked it on "single stack (rust)".

## State

6 techniques, 4 applications: 3 `rust` (2 from Castle Control 8ef2d8e, 1 from overlord
1d58c90) and 1 `typescript` (overlord's console at 1d58c90). Unlike the moderation
subject, the stack finding is answered from a second tree. It is the one the fleet map
joins to the subject.

## 2026-11-03 - deepen (spac-deepen-1103)

Landed in 090bb84d7 (catalog 43e940d09). Lanes:
- **Counter-evidence, platform (web)**: Twitch's own pages for getting tokens, refresh
  tokens, token validation, the API guide's rate limits, and EventSub WebSocket handling.
  RFC 8628 was read as text. Replay and the 3.5 timeout sentence were re-fetched verbatim
  before anything landed.
- **Training-data only (blind)**: one agent, no tools, the same questions.
- **Field, overlord at origin/main** (worktree of 4153693, then 1d58c90): the daemon's
  Twitch adapter (auth, helix, mod, tests), the generated contract, the console's
  Connection panel and its test, and the opener. A seam search for Helix, EventSub and
  the platform's identity host found only Rust in overlord's daemon and a TypeScript
  console with no platform client. Castle Control's non-Rust hits were a prototype and
  an e2e test.
- `check-currency --volatile --subject`: 6 facts, all illustrative durations ("ninety
  seconds", "ten minutes") or the standard's own five-second increment. The increment
  was confirmed in RFC 8628 3.5. Nothing else is platform-set, and nothing was touched.

What moved:
- **Condition (single-flight-jittered-refresh): a poll nobody answered slows down.** The
  device-code bullets gain RFC 8628 3.5's "MUST unilaterally reduce their polling
  frequency" on a connection timeout (doubling recommended), bounded, keep polling to the
  deadline. They also gain "the code's own deadline ends the flow", because the platform
  reports a used or expired code as `invalid device code`, not the standard's
  `expired_token`. The web and blind lanes converged on both. The golden path's
  device-code paragraph gained one sentence to match.
- **Confirmed untouched (web lane, pages opened, blind lane agreeing)**: no replay after
  a drop ("There is no replay of events that are lost..."); 10 s to subscribe after the
  welcome; keep the old connection until the new welcome; reconnect URL used as is;
  3 connections per user token and 300 enabled subscriptions per connection (the golden
  path states neither number); Ratelimit-Reset is the reset moment; some 429s are
  unrelated to the bucket and must be parsed; public-client refresh tokens are one-time
  and expire after 30 days of inactivity; validate on start and hourly, enforced by audit.
  The golden path states none of these as numbers, so its hedged wording stands.
- **Counter-evidence that did not land**: RFC 8628's security section does not ask a
  client to check the verification URI's host. The golden path's host-pin rule is the
  tool's own hardening. Its stated reason (the streamer types their password behind that
  link) stands on its own, so it was kept as written.
- **New applications.** `typescript--brokered-calls-token-never-exposed` (overlord's
  console): a generated contract with no field that could hold a secret, and an MCP tool
  that returns the same outcome. Three thin edges: the runtime validator allows extra
  properties; the console opens the verification address as given, so the daemon's new
  check is the only one; and the device paths pass up to 200 characters of unscrubbed
  reply text into the detail line. `rust--single-flight-jittered-refresh--overlord`:
  refresh keyed on the stale token under one lock, and keeping the new pair in memory
  when the save fails. Its deviations are no scheduled refresh and no deletion on a
  definitive dead-refresh answer. It also records the A/B.
- **Applied, code, better (1 row), shipped to overlord as 5b36dd3** (pushed to origin
  main with the ledger row 1d58c90). A ends the login at a 429. B stores the token with
  gaps of at least 2 and 4 units. The look-alike host is accepted by A and refused by B.
  The seeded control was red 3 of 3.
- **Not re-researched this pass**: strict-event-versions, revoke-then-purge-then-stop and
  event-stream-gaps-not-guesses beyond the replay check. They are one day old and drawn
  from a tree read at harvest.

## Impact

No judged verdicts: 4 pairs, all `unknown`. overlord has 1 (`types-crate`) and
systedo-case has 3 (`ad-platform-integrations`, `ai-assistant-core`,
`platform-ops-api`). The systedo-case pairs are keyword joins to an ad-platform client
and look like noise. overlord's context map has no context that covers
`crates/shadowrunr-daemon/src/platform/twitch` or the console's moderation Connection
panel, so the map does not join the seam this run changed. Maps were regenerated
fleet-wide and committed locally on each active branch (12 projects, map file only).
None were pushed, because every branch already carries other sessions' unpushed commits.

## Banked

- **overlord's Twitch adapter is unjoined.** Return: when overlord's context map gains a
  context for the daemon's platform adapter (or the moderation lane). Then run `/conform`
  on it against this subject. Expect fail-fast-rate-limit-buckets and
  revoke-then-purge-then-stop to be judgeable there: the adapter fails fast on 429 until
  the reset, and deletes the credential on disconnect.
- **The contract's runtime door allows extra properties.** A one-line codegen change
  (`additionalProperties: false` on the validator schemas, not only the types) would
  close it across every result. Return when the owner works on overlord's contract
  package. It touches every method's validator, so it needs that package's own tests.
- **Unscrubbed device-path reply text.** Return when overlord's adapter is next touched.
  The scrub already exists for refresh and validate.
- **A real connection-timeout test.** The mock cannot produce one cheaply under a 15 s
  client timeout. Return if the adapter's client timeout becomes configurable through
  the test endpoints.
- **Revocation scope.** The blind lane was unsure whether revoking an access token ends
  the refresh token too. The golden path's order (revoke, then purge locally) is safe
  either way. Return if a technique ever relies on revocation alone.
