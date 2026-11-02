---
layer: application
type: application
subject: streaming-platform-api-custody
technique: single-flight-jittered-refresh
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Rust: a Twitch credential vault with generation-tagged single-flight refresh

Castle Control (local checkout `C:\Users\kazda\Spooky\CastleControl`, main @ 8ef2d8e) is a
desktop tool for human Twitch streamers. Its `cc-twitch` crate is the broker: one `Vault`
holds the user token, refreshes it, meters Helix calls and retires the grant, and the
workspace pins `rust-version = "1.97"` (`Cargo.toml:8 "rust-version = "`). Every anchor below
was re-opened on 2026-11-02.

## The boundary is the crate

The vault is not exported: `crates/cc-twitch/src/lib.rs:16 "mod vault;"` and
`crates/cc-twitch/src/vault/mod.rs:23 "pub(crate) struct Vault {"`. Its generic Helix
primitive takes a path, but it is reachable only from inside the crate, and every request
it makes is bound to the configured base and refuses raw responses:
`crates/cc-twitch/src/vault/helix.rs:11 "Bound destination, no caller-supplied auth or raw response/error text escapes."`
Outside callers see named operations whose arguments are validated before transport -
`crates/cc-twitch/src/actions.rs:82 "truncate_chars(reason, 500)"` and
`crates/cc-twitch/src/actions.rs:84 "seconds.clamp(1, 1_209_600)"` - and the adapter says
what it is not: `crates/cc-twitch/src/actions.rs:50 "Gatehouse owns authorization of actions; this adapter only transports them."`
A response that echoes either token is refused whole:
`crates/cc-twitch/src/vault/helix.rs:75 "credential echoed by upstream"`. The secret store
entry is fixed (`crates/cc-twitch/src/store.rs:9 "const SERVICE: &str ="`)
and its buffers are zeroised (`crates/cc-twitch/src/store.rs:5 "use zeroize::Zeroize;"`).

## Single flight by generation

One async mutex guards the credential, and each change bumps a generation counter. The
refresh entry point takes the generation the caller used and does nothing if the world has
moved on:
`crates/cc-twitch/src/vault/mod.rs:138 "Single-flight across proactive, validate-401 and concurrent Helix-401 callers."`
and `crates/cc-twitch/src/vault/mod.rs:144 "if state.generation != stale_generation {"`.
The design record states why:
`docs/SECURITY.md:147 "Stale callers reuse the rotated generation"` instead of spending a
one-time refresh token again. A Helix 401 refreshes once and retries once; the second 401
retires the grant: `crates/cc-twitch/src/vault/helix.rs:46 "if attempt == 0 {"` and
`crates/cc-twitch/src/vault/helix.rs:50 "self.retire(false).await?;"`.

The proactive schedule is jittered within the documented band and computed from the stored
absolute expiry: `crates/cc-twitch/src/vault/mod.rs:224 "Refresh at 80-90% of lifetime"`,
`crates/cc-twitch/src/vault/mod.rs:230 "let fraction = 800 + u64::from(jitter) % 101;"`,
`docs/SECURITY.md:143 "Absolute expiry survives restart."` A maintenance blip is retried
without disturbing the event sockets:
`crates/cc-twitch/src/vault/mod.rs:179 "A blip must not drop the sockets"`.

## Upward lessons this tree taught the technique

- **Never fall back to a burned pair.** `crates/cc-twitch/src/vault/oauth.rs:186 "Keep the rotated pair in memory even if persistence fails: never reuse the old pair."`
  The draft said "persist before use"; the tree showed that a persistence failure must not
  restore the old refresh token, and returns the failure instead
  (`docs/SECURITY.md:149 "that failure is returned to the caller"`).
- **Only a definitive answer destroys the login.** `crates/cc-twitch/src/vault/oauth.rs:220 "Only a definitive invalid_grant destroys the stored login."`
  An unknown 400 or unparseable body keeps the stored credential and asks for
  re-authentication; the parse lives in one place
  (`crates/cc-twitch/src/vault/oauth.rs:64 "an unparseable body is never definitive"`).
- **Validation checks content, and a scope gap is a re-consent.** The validated client id
  must match, and `crates/cc-twitch/src/vault/oauth.rs:287 "A scope shortfall is fixed by re-authorizing, not by deleting the login."`
- **Device polling treats gateway errors and 429 as non-answers.**
  `crates/cc-twitch/src/vault/oauth.rs:155 "Gateway trouble and rate limits are not an answer: keep polling to the deadline."`
  `slow_down` widens the interval by five seconds
  (`crates/cc-twitch/src/vault/oauth.rs:168 "interval = interval.saturating_add(5)"`),
  and the verification address is pinned to the platform host
  (`crates/cc-twitch/src/vault/oauth.rs:96 "https://www.twitch.tv/"`).

## Neighbouring behaviour in the same vault

Rate limiting fails fast with no 429 retry, and a header-less 429 does not inherit the old
bucket's reset: `crates/cc-twitch/src/vault/helix.rs:106 "Do not reuse an old bucket's reset when this response omits it."`
That is the upward lesson recorded in fail-fast-rate-limit-buckets. The tree keeps one
shared bucket (`crates/cc-twitch/src/vault/mod.rs:30 "rate: Mutex<RateLimit>,"`), so the
technique's local partition between moderation and cosmetic traffic is a **deviation**.

Retirement follows revoke, purge, stop, and publishes the stop only after the purge:
`crates/cc-twitch/src/vault/mod.rs:131 "Workers listen to this signal. Publishing before the await above could cancel"`.
An unconfirmed upstream revoke is only logged
(`crates/cc-twitch/src/vault/mod.rs:112 "Twitch upstream revoke unconfirmed; deleting locally"`)
and `retire` still returns success, so the streamer is not shown the unconfirmed state the
technique asks for - a **deviation**.
