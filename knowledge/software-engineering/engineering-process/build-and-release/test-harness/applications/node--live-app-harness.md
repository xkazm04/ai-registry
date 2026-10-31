---
layer: application
type: application
subject: test-harness
technique: live-app-harness
stack: node
verified_on: 2026-08-18
---

# The :17320 test-automation bridge — driving the real Tauri app

The live lane drives a **real running Tauri desktop app**, not a browser. The
control surface is the test-automation HTTP server
(`src-tauri/src/test_automation.rs`, `DEFAULT_PORT: u16 = 17320` at `:1440`);
the typed client is `tests/playwright/companion-bridge.ts`; the runner is
Playwright used purely as a TS test runner — `expect()`, reporters, retry
logic — with zero browser launch (`playwright.config.ts:31-38` states the
architecture: WebDriver-via-`tauri-driver` was "too brittle on Windows").

## Control surface, build-gated

The endpoint compiles only under the `test-automation` cargo feature
(`src-tauri/Cargo.toml:286`); `npm run tauri:dev:test` builds with it, on
:17320. A production install can opt in explicitly via `PERSONAS_TEST_PORT`
(the harness follows with `COMPANION_TEST_PORT`). The vocabulary is
product-level — `/click-testid`, `/fill-field`, `/query`, `/find-text` — keyed
on `data-testid` contracts maintained in the React components, not on
coordinates.

## The serial law, stated where the technique demands

`playwright.config.ts:53-58` is the textbook form — the constraint written
into the lane's configuration *with the reason attached*:

```ts
// Workers must stay at 1 — both shapes share the same companion
// session (singleton on the backend), so parallelism would corrupt
// the transcript ordering.
workers: 1,
// Don't auto-retry: a real-Claude failure usually has a real cause.
retries: 0,
```

The broader singleton catalog is documented in memory and in
`scripts/test/launch-isolated.mjs`: one data dir, one keyring, canonical ports
:1420/:17320/:9420 — so Playwright runs serial while the Vitest lanes run
parallel. Where a second instance *is* needed, the launcher virtualizes the
singletons (`PERSONAS_DATA_DIR`, `PERSONAS_VITE_PORT`, `PERSONAS_TEST_PORT`,
`PERSONAS_WEBHOOK_PORT`) — the "product change, not harness wish" the
technique describes — and its header names the residual seam it cannot close
(the WebView2 user-data folder, closed at spec layer by
`bootstrapFreshUser()`).

## Fire-and-forget vs awaited readback

The bridge header (`companion-bridge.ts:14-20`) captures the endpoint quirks
"learned the hard way":

- `/eval` is **fire-and-forget** — no result returns. Result-bearing probes
  historically stashed their output into the DOM for a later `/query` readback
  (the "eval-DOM readback trick" in the kpi-sim and use-case-slice session
  logs) — the stash-and-read-back pattern verbatim.
- The evolved form is `/bridge-exec` (`bridgeExec<T>()` at
  `companion-bridge.ts:135-145`): dispatch to a named method on
  `window.__TEST__`, await via `__test_respond`, results wrapped as
  JSON-encoded strings. Typed on both sides — the client declares response
  interfaces (`QueryNode`, `CompanionPanelState`, `BrainCounts`, …).
- `/query` and `/find-text` return **bare arrays**, not `{nodes}` — recorded
  in the header precisely so the next author does not re-learn it.

## The population discipline, and its counter-example

The lane's population is journey-shaped: tour walks
(`tours-explore.spec.ts`), companion conversation, guided walkthroughs — each
a claim only the assembled app can witness. Real model round-trips push
per-test time to 30–90s (`timeout: 360_000`), which enforces the "small
population, exclusive claims" rule economically.

The counter-example is `.github/workflows/e2e-smoke.yml`: a 28-test live
smoke lane that has failed **38 of 38 runs since inception** — born broken by
one missing word in a `cargo build` features flag (`e2e-smoke.yml:60`), never
once green, unnoticed because red was normal from day one. The full autopsy
is `docs/concepts/golden-paths/live-ui-test-automation.md` §7 C1 — the
never-green lane the golden path's lane-health section exists to kill.

Re-checked 2026-10-31 at personas@61029d7ae0: the bridge, the Playwright
config, the launcher's four virtualized singletons and the header quirks all
hold. The port and feature anchors above are updated.

The "build-gated" section needs a correction, and it was already wrong when it
was written. `pub mod test_automation;` (`src-tauri/src/lib.rs:99`) has no cfg,
so the server code compiles in every build. What is gated is whether it
*starts*, in `src-tauri/src/boot/test_bridge.rs:27-59`. A
`--features test-automation` build always starts it, on :17320 unless
`PERSONAS_TEST_PORT` names another port. A debug build without the feature
starts it only when that variable is set. A release build without the feature
ignores the variable and logs a warning. That last arm dates from a 2026-07-02
security audit: the bridge has no auth, and its routes include `/eval`. So "a
production install can opt in explicitly via `PERSONAS_TEST_PORT`" is false. It
repeats a stale comment that is still in `playwright.config.ts` and in
`test_automation.rs`'s own header. The deviation from the technique's
never-a-runtime-flag rule is narrower than the sentence implies: an
environment variable opens the bridge only in debug builds, and no installed
release build can be opened that way.

Two corrections to the counter-example. The missing word was found and fixed in `f9e3a33fda`
(2026-08-14), four days before this document's earlier verification date.
That commit pulled the run history from the CI API: 34 failures, 4
cancellations, zero successes. The cargo build now reads
`--features desktop,test-automation`, at `e2e-smoke.yml:91` after a later
rewrite. So "has failed 38 of 38 runs" stands as the history up to the fix.
Present-tense "never once green" is no longer something the tree shows. Run
health after the fix was not checked, and the smoke step is
`continue-on-error: true`, so a green job would not prove a green suite. The
lane is also 27 tests, not 28: `tools/test-mcp/smoke_test.py` registers 18
named tests plus one per entry of its nine-section navigation list, and that
file has not changed since 2026-05-10. The kpi-sim and use-case-slice session
logs cited for the eval-DOM readback trick are not in the tree and were not
re-read.
