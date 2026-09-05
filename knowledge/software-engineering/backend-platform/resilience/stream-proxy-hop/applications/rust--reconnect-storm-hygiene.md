---
layer: application
type: application
subject: stream-proxy-hop
technique: reconnect-storm-hygiene
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96
---

# The reconnecting half of a webhook relay, in a Tauri backend

Citations are against `personas` at `ee124810f` (2026-09-05); the file last
changed at `e6716a1b4` (2026-08-20, a formatting pass). The workspace declares
`rust-version = "1.80.0"` in `src-tauri/Cargo.toml:115`; CI runs
`dtolnay/rust-toolchain@stable` with no pinned channel, and the local toolchain
that built this read is `rustc 1.96.1`; the witness above is the observed
toolchain, with the manifest's floor stated here beside it. The HTTP client is `reqwest 0.12` with `stream` enabled.

The exemplar is `src-tauri/src/engine/smee_relay.rs` (846 lines): a
background task that opens a long-lived server-pushed stream to a public
webhook-relay channel, parses it, and re-emits each payload into the
application's local event bus. It is the subject's *consumer* half — the
technique says a hop cannot make a badly-behaved client safe, and this file is
the client — and it is the first realisation of the technique in a stack
other than node. Where the subject's node exemplar is a browser hook behind a
hop, this is a desktop process talking to an origin directly; the disciplines
are the same and two of them are stronger here.

## Single socket, by construction (`:616-618`, `:664-668`, `:831-838`)

One task per relay id, tracked in a map, with `if tasks.contains_key(relay_id)
{ continue; }` at the top of the start loop. A reconnect happens *inside* the
task (`:757-828`), never by spawning a second one, so two sockets to the same
channel cannot exist from one process. The technique's "provably single-instance"
exemption applies — and the tree still pays the guard's price, in a different
coin: a config change stops the old task and starts a new one
(`:643-661`), and the stop is a cancellation token plus a two-second grace
before `abort()` (`:575-596`), so the old socket is closed before the new
subscription opens.

## Backoff with a ceiling, no jitter (`:751-752`, `:812-819`)

```rust
let mut backoff = Duration::from_secs(1);
let max_backoff = Duration::from_secs(30);
…
backoff = (backoff * 2).min(max_backoff);
```

Doubling from one second to a thirty-second cap. No jitter, and the standard's
predicate says that is correct for this deployment: one relay process holds
one subscription, so there is no population to spread. The sentence in the
technique that says the argument returns with a second instance is exactly
this tree's exposure if the relay ever moves server-side.

The sleep is `select!`ed against the cancellation token (`:812-818`), so a
relay deleted mid-backoff does not reconnect after it is gone — the teardown
clears the pending timer, in the technique's words.

## Backoff resets on a stable connection, not on open (`:40-43`, `:771`, `:787-789`)

```rust
/// Minimum time a connection must be alive before we consider it "stable" and
/// reset the backoff on clean disconnect. Prevents reconnect storms when the
/// server accepts TCP then immediately closes (e.g., rate limiting).
const MIN_STABLE_CONNECTION_SECS: u64 = 30;
…
if connected_at.elapsed().as_secs() >= MIN_STABLE_CONNECTION_SECS {
    backoff = Duration::from_secs(1);
}
```

This is the rung-reset rule the technique carries from this tree. `relay_sse_core`
returns `Ok(())` on a clean end of body (`:345-347`, `:572`), which is what a
rate-limiting origin produces — accept, then close — and a client that reset
on `open` would hammer it at one-second intervals forever while its status
showed `connected` each time. Here a close inside thirty seconds keeps the
current rung. The number is named, beside the buffer cap, at the top of the
file.

## The stream is bounded and the cursor is carried (`:36-38`, `:242-248`, `:292-295`)

Two disciplines the technique does not own but the subject does:

- **A one-megabyte buffer cap** (`MAX_SSE_BUFFER_BYTES`): a stream that
  produces that many bytes without a frame boundary is dropped with an error
  rather than grown (`:353-357`). A named reaper for the parse buffer.
- **`Last-Event-ID` on reconnect** (`:293-295`): the most recent `id:` seen is
  sent on every reopen, "so a spec-compliant server resumes after it instead
  of replaying from scratch" — the resume cursor the standard's allowlist
  section names, sent by a hand-rolled reader that must do by hand what the
  browser client does automatically. Beside it sits a bounded de-duplication
  set (`RelayDedup`, cap 512) for the origin that replays anyway; the two
  together are why the tree's own bug-hunt note (`:236-240`) describes
  duplicate executions in the past tense.

## What the surface is told (`:114-121`, `:174-209`)

Per-relay `connected`, `error`, `events_relayed`, `last_event_at` — and the
aggregate status is emitted only on change. `last_event_at` is the arrival
timestamp the standard asks the indicator to derive from; whether the frontend
tab does so was not checked in this pass.

## Deviations

**Every non-abort exit is one error string.** `relay_sse_core` returns
`Result<(), String>`: connection failure, non-2xx handshake, mid-stream read
error and buffer overflow are four causes formatted into one `String` that
lands in `record_error` and the UI (`:791-810`). Retryability is not encoded —
a `403` from a channel that no longer exists is retried on the same ladder as
a network blip — which is the technique's "retryability comes from the hop"
rule with nobody to read the answer; here the reader exists (the status code is
in hand at `:301-303`) and is discarded.

**No attempt limit and no disconnected state.** The loop retries at the
thirty-second cap indefinitely; the only exit is cancellation or the relay
being deleted (`:821-827`). A channel that is permanently gone produces a
status that alternates `error` / silent retry forever, which is the
"retrying forever with a friendly indicator" shape the technique closes with an
honest disconnected state and a manual retry.

**The credential is the URL.** The channel URL is, in the file's own words, "an
unauthenticated bearer credential" (`:47-48`). That is the subject's
credential-placement question answered by the origin's design rather than the
tree's, and the tree's response — opt-in HMAC over the forwarded signature
(`:414-449`) — is a sender-authentication control from
[webhook-ingestion](../../webhook-ingestion/webhook-ingestion.md)'s ground, not
this subject's; it is noted here only because a reader of this file will meet
it first.
