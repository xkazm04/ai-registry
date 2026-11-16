---
layer: application
type: application
subject: on-stream-overlay-delivery
technique: read-only-overlay-origin
stack: rust
status: forged
verified_on: 2026-11-16
verified_against: rust@1.97
applied: simulation
ab_verdict: better
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

## 2026-11-16 re-read, at `0b1c6b7`, public clone, read-only

Re-read through a public clone of `xkazm04/castle-control` at `0b1c6b7` (main,
2026-11-03), ten commits after `8ef2d8e`. None of the ten touches `crates/`,
`packages/renderer`, `apps/overlay` or `docs/`. All of this application's anchors were
re-checked line by line and still hold. Two defects against the subject's 2026-11-16
amendments:

- **A refused page has no way back.** Every page route answers a failed read with a bare
  status and an empty body:
  `crates/cc-core/src/overlay/vote_bar.rs:46 "return StatusCode::SERVICE_UNAVAILABLE.into_response();"`,
  and again at `:49` and `:53`. The same holds at `crates/cc-core/src/overlay/tiltyard.rs:17`,
  `crates/cc-core/src/overlay/lots.rs:201` and `crates/cc-core/src/overlay/routes.rs:89`.
  No renderer script runs in that document, so the vote bar's 2-30 s retry
  (`packages/renderer/src/vote-bar.ts:55`) never starts. A source that OBS loads before
  the Gatehouse source is set (`vote_bar.rs:45 "host.vote_bar.get()"`) stays dark until a
  scene change, a settings edit or a restart reloads it. The draw page is the exception
  that shows the fix already exists in the tree: it carries a meta refresh,
  `crates/cc-core/src/overlay/lots_page.rs:58 "<meta http-equiv=\"refresh\""`, but only on
  its successful answer.
- **The stream budget is the browser's, not the semaphore's.** Every overlay kind streams
  from one origin, `http://localhost:{port}` (`crates/cc-obs/src/overlay.rs:98`), and the
  Beacons page opens one stream per visual
  (`packages/renderer/src/overlay.ts:211 "new EventSource(`/push/beacons?visual_id="`). OBS
  creates every browser source in one global request context (obs-browser
  `obs-browser-source.cpp:241`, `CreateBrowserSync(..., nullptr)`, read at `d4db73e7e5`), and
  a hidden source stays loaded by default (`obs-browser-plugin.cpp:148`, `"shutdown", false`).
  So the seventh live overlay across all scenes waits for a connection. The
  `Semaphore::new(128)` (`crates/cc-core/src/overlay/mod.rs:62`) and `MAX_VISUALS` 128
  (`mod.rs:25`) cannot be reached from one OBS instance. This is inferred from the
  six-per-host limit, measured in stock headless Chrome 157 (6 of 8 streams, n=2). It was
  not measured inside OBS.

The OBS side was read in the obs-browser source at `d4db73e7e5`. The default page
permission is `ReadObs`, not `None` (`obs-browser-source.hpp:38`). The custom CSS is
injected by a script that runs after load
(`browser-client.cpp:658-668`, `document.createElement('style')`), which is still the
nonce-less inline style the exception above names. OBS 33.0.1 ships CEF branch 7871, the
Chromium 150 branch (`CMakePresets.json:55`). The loopback permission is granted
implicitly (`browser-client.cpp:321 "Implicitly allow Localhost access to retain previous
behavior for now"`), and `LocalNetworkAccessChecksWebSockets` is disabled
(`browser-app.cpp:137`). The project's README instruction about page permissions was not
looked for in this pass.
