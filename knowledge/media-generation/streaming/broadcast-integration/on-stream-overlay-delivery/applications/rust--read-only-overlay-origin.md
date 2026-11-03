---
layer: application
type: application
subject: on-stream-overlay-delivery
technique: read-only-overlay-origin
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Rust: a separate loopback listener for OBS browser sources

Castle Control (local checkout `Spooky/CastleControl`, main @ 8ef2d8e) is a
desktop tool for a human Twitch streamer. A Rust core serves the pages OBS loads as browser
sources — a Beacons visual, a Gatehouse vote bar, a Tiltyard duel card, a giveaway plate —
from an axum listener that is deliberately not the core's control service. The type says so
at `crates/cc-obs/src/overlay.rs:12 "Separate read-only origin. No RPC, control capability or remote resources."`
and the route hook repeats it at
`crates/cc-obs/src/overlay.rs:29 "Native composition supplies only read-only render routes, never control routes."`.

## Bind, host check, headers on every response

The listener binds IPv4 loopback only,
`crates/cc-obs/src/overlay.rs:31 "TcpListener::bind((std::net::Ipv4Addr::LOCALHOST, port))"`,
and one middleware, `crates/cc-obs/src/overlay.rs:82 "async fn secure("`, does all of the
origin work. It accepts a request only when the `Host` header is exactly
`crates/cc-obs/src/overlay.rs:83 "let expected = format!("` (`localhost:{port}`), answers
`FORBIDDEN` otherwise, and then — on the allowed response and the refusal alike — inserts the
policy at `crates/cc-obs/src/overlay.rs:98 "default-src 'none'; script-src 'self'; connect-src http://localhost:{port}/push/beacons"`,
`crates/cc-obs/src/overlay.rs:104 "nosniff"` and `crates/cc-obs/src/overlay.rs:108 "no-store"`. The
security record states the "refusals too" rule in words:
`docs/SECURITY.md:39 "Host check, router and origin. Every response, including failures, carries"`.

Two upward lessons for the technique are in the decision record,
`docs/adr/0002-overlay-host-csp.md`. The connection directive names the three exact push
endpoints with the bound port rather than `'self'`:
`docs/adr/0002-overlay-host-csp.md:89 "a port wildcard, another host or a WebSocket scheme."`
(the sentence is a "do not"). And the stream is one-way by design:
`docs/adr/0002-overlay-host-csp.md:84 "Choose server-sent events (SSE), using"`
because `:85 "updates. The overlay has no command traffic to send, so a bidirectional"`.

## The style exception, written where the policy lives

OBS injects the streamer's per-source custom CSS as an inline style element without a nonce,
`crates/cc-obs/README.md:75 "OBS injects source-configurable CSS through a"`,
so the exception is inline style and nothing else:
`crates/cc-obs/README.md:79 "style-src 'unsafe-inline'"`.
The middleware comment points at the same reason,
`crates/cc-obs/src/overlay.rs:94 "OBS injects nonce-less style."`, and the ADR keeps it
`docs/adr/0002-overlay-host-csp.md:94 "for OBS's nonce-less injected style"`.

## The other side refuses the overlay origin

Separation is enforced from the control side too. The ADR forbids overlay CORS on the
control service, `docs/adr/0002-overlay-host-csp.md:102 "session capability in HTML, scripts, URLs or push data. Do not add overlay CORS"`,
and lists sharing the origin among the alternatives that lost:
`docs/adr/0002-overlay-host-csp.md:153 "It gives package code a route to the control"`.

## Snapshots, aggregate payloads and refusing an address

The vote bar is the cleanest instance of the subject's payload rules. Its wire contract,
`docs/plan/03-implementation-plan.md:709 "Owner ruling 3: aggregate vote bar (2026-10-31)"`,
fixes the full-replacement snapshot to shares, a provenance flag and a timestamp, and
`docs/plan/03-implementation-plan.md:718 "generic numbered directions, not untrusted direction labels."`.
The projection behind it is fixed:
`crates/cc-core/src/gatehouse/vote_bar.rs:33 "One fixed all-message window; UI filters and replay cannot change OBS."`.
Asking for the source URL performs the read first:
`crates/cc-core/src/gatehouse/vote_bar.rs:123 "A failed or revoked read must never mint a seemingly usable source."`,
and the page route does the same, answering `SERVICE_UNAVAILABLE` when
`crates/cc-core/src/overlay/vote_bar.rs:48 "let Ok(snapshot) = source.snapshot().await else {"`.
The first snapshot is embedded in the page with `<` escaped,
`crates/cc-core/src/overlay/vote_bar.rs:61 "replace('<',"`.

Coalescing and bounds: `docs/SECURITY.md:66 "but unverified design publishes nothing. Pending updates coalesce in one watch"`,
with constants `crates/cc-core/src/overlay/mod.rs:25 "const MAX_VISUALS: usize = 128;"`,
`crates/cc-core/src/overlay/mod.rs:26 "const MAX_PACKAGES: usize = 16;"` and a 128-client
semaphore, `crates/cc-core/src/overlay/mod.rs:62 "clients: Arc::new(Semaphore::new(128)),"`.
Package script is a per-entry-point grant held natively,
`docs/SECURITY.md:55 "Declaration alone grants nothing."`,
and revocation needs a fresh document:
`docs/SECURITY.md:60 "does not revoke effects of code already executed"`.
Push replaces source refreshes:
`docs/adr/0002-overlay-host-csp.md:148 "Refreshing the browser source through obs-websocket for every change."`.

## What is measured and what is not

The ADR records a headless-browser probe, not OBS:
`docs/adr/0002-overlay-host-csp.md:219 "Disposable headless Chrome, not OBS. Package changes n=20, p50 33 ms, p95 49 ms"`,
and it declines to claim the live figure:
`docs/adr/0002-overlay-host-csp.md:230 "No OBS timing figure is claimed."`. That is the
technique's measurement rule followed honestly: the embedded-browser timing remains
unmeasured and is reported as such.

## Deviations

The vote bar's provenance read fails open: when the moderation service is not ready the
snapshot is marked not-simulated,
`crates/cc-core/src/gatehouse/vote_bar.rs:52 "service.ready().is_ok()"`. The standalone
rehearsal flag still forces the label, so the gap is narrow, but the subject's rule is that a
failed provenance read never lets an unlabelled number out.
