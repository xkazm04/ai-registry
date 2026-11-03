---
layer: application
type: application
subject: streaming-platform-api-custody
technique: single-flight-jittered-refresh
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.97
applied: code
ab_verdict: better
---

# Rust: a device poll that slows down when nobody answers, and a refresh keyed on the stale token

Overlord (public repo, origin/main at `1d58c90`, read 2026-11-03 from a worktree of that
commit; toolchain `1.97.1`) is a streaming companion whose daemon logs a Twitch bot
account in with the device-code flow and moderates the streamer's chat. The broker is
`crates/shadowrunr-daemon/src/platform/twitch`. The Castle Control application beside this
one is a different tree's vault. This one records a second implementation and the A/B
that changed it.

## Refresh: one flight, keyed on the token the caller used

The refresh holds one lock
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:226 "let _guard = self.refresh_lock.lock().await;"`).
Inside it, a caller that saw a 401 is compared by the access token it used rather than by
a counter
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:230 "if cur.access_token != *stale {"`).
If another caller already refreshed, it returns and the caller retries with the new pair.
That is the technique's generation check, with the token itself as the generation. Both
reactive paths go through it: a Helix 401
(`crates/shadowrunr-daemon/src/platform/twitch/helix.rs:55 "self.refresh(&cred.access_token).await?;"`)
and an unauthorised hourly validation. When the new pair cannot be written, the daemon
keeps it in memory and logs the failure. It does not fall back to the burned refresh token
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:264 "if let Err(e) = self.store.save(&next) {"`).

Two deviations, recorded rather than fixed:

- **No scheduled refresh.** The daemon never reads the token's lifetime. It refreshes when a
  call is refused or the hourly validation fails, so there is no jittered early refresh.
  For one daemon per streamer this costs one refused call per expiry. It would matter if
  several processes shared the grant.
- **No answer destroys the login.** Any 400 or 401 on refresh moves the platform to an
  error state and asks for a new login
  (`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:247 "if status.as_u16() == 400 || status.as_u16() == 401 {"`).
  The stored pair stays on disk until the next login overwrites it. That fails safe for an
  ambiguous answer. For a definitive one, it leaves a dead credential in the secret store.

## Device poll: the A/B

Before `5b36dd3`, the poll ended the login on any reply that was neither "pending" nor
"slow down", so a 429 or a gateway page during the login screen failed it. A transport
error retried at the unchanged interval, and the verification address went to the console
unchecked. The standard requires a client to reduce its polling frequency after a
connection timeout (RFC 8628 section 3.5). It recommends doubling the interval each time.

Now a poll that got no answer, whether a transport error, a 429 or a 5xx, doubles the wait.
The wait is capped at a minute and never drops below Twitch's interval
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:176 "if status.as_u16() == 429 || status.is_server_error() {"`,
`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:66 "const MAX_UNANSWERED_WAIT: u64 = 60;"`).
An answer puts the pace back
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:181 "wait = interval;"`), and no
sleep runs past the code's deadline
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:143 "deadline.saturating_duration_since(Instant::now())"`).
The verification address must be `https` on `www.twitch.tv` or `twitch.tv`, with no user
info and no port, before the console sees it
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:81 "pub(super) fn verification_uri_ok(uri: &str) -> bool {"`).

Measured on the adapter's own axum mock, with the time unit shrunk to 10 ms:

| Case | A (before) | B (after) |
| --- | --- | --- |
| poll answered 429, then 502, then pending, then granted | login ended, token never stored | token stored; gap after 429 >= 20 ms, after 502 >= 40 ms |
| device response's address on a look-alike host | accepted and handed to the console | refused, no poll started, address not echoed |
| B with the doubling removed (seeded control) | - | gap after 429 15.3-15.9 ms against a 20 ms floor, red 3 of 3 |

The tests are
`crates/shadowrunr-daemon/src/platform/twitch/tests.rs:518 "async fn device_login_rides_out_a_rate_limit_and_a_gateway_page_slowing_down() {"`,
`crates/shadowrunr-daemon/src/platform/twitch/tests.rs:554 "async fn device_login_refuses_a_verification_address_off_twitch() {"`
and a table of 3 accepted and 8 refused addresses at
`crates/shadowrunr-daemon/src/platform/twitch/tests.rs:581 "fn verification_address_must_be_https_on_twitch() {"`.
The floor held: 15 adapter tests, the full daemon suite (414 + 16) and clippy with
warnings denied.

The mock never exercises a real connection timeout (the client's own timeout is 15 s).
That path shares the backoff with the 429 and 5xx path but is covered by reading the
code, not by a test.
