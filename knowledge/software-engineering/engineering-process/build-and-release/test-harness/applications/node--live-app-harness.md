---
layer: application
type: application
subject: test-harness
technique: live-app-harness
stack: node
verified_on: 2026-10-31
---

# The :17320 test-automation bridge — driving the real Tauri app

The live lane drives a **real running Tauri desktop app**, not a browser. The
control surface is the test-automation HTTP server
(`src-tauri/src/test_automation.rs`, `DEFAULT_PORT: u16 = 17320` at `:1440`);
the typed client is `tests/playwright/companion-bridge.ts`; the runner is
Playwright used purely as a TS test runner — `expect()`, reporters, retry
logic — with zero browser launch (`playwright.config.ts:30-38` states the
architecture: WebDriver-via-`tauri-driver` was "too brittle on Windows").

## Control surface, start-gated

The server code is not compile-gated: `pub mod test_automation;`
(`src-tauri/src/lib.rs:99`) carries no `cfg`, so it is in every build. What
is gated is whether it *starts*, in `src-tauri/src/boot/test_bridge.rs:27-59`,
on three arms:

- a `--features test-automation` build (`src-tauri/Cargo.toml:286`) always
  starts it — `npm run tauri:dev:test` builds this way — on :17320 unless
  `PERSONAS_TEST_PORT` names another port;
- a debug build without the feature starts it only when `PERSONAS_TEST_PORT`
  is set;
- a release build without the feature ignores `PERSONAS_TEST_PORT` and logs a
  warning. The comment dates this arm to a 2026-07-02 security audit: the
  bridge has no auth, and its routes include `/eval` and
  `/list-credentials`.

So no installed release build can be opened by an environment variable. The
deviation from the technique's never-a-runtime-flag rule is confined to debug
builds, where the variable opens the bridge without the feature. Two comments
still claim the opposite — `playwright.config.ts:45-46` ("a production install
that was launched with `PERSONAS_TEST_PORT=17321`") and the
`companion-bridge.ts:1-3` header — and the harness's `COMPANION_TEST_PORT`
follows whichever port a debug or feature build was given. The vocabulary is
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
`PERSONAS_WEBHOOK_PORT`, `launch-isolated.mjs:20-23`) — the "product change,
not harness wish" the technique describes — and its header names the residual
seam it cannot close (the WebView2 user-data folder, `:31-33`, closed at spec
layer by `bootstrapFreshUser()`).

## Fire-and-forget vs awaited readback

The bridge header (`companion-bridge.ts:14-20`) captures the endpoint quirks
"learned the hard way":

- `/eval` is **fire-and-forget** — no result returns. Result-bearing probes
  historically stashed their output into the DOM for a later readback — the
  stash-and-read-back pattern verbatim. Its in-tree witness is the Python
  pipeline harness's `ipc()` (`tools/test-mcp/e2e_pipeline_harness.py:106-146`):
  write `__PENDING__` into a div, `/eval` an async invoke that writes
  `OK:`/`ERR:` plus the JSON into it, poll the div for 15 seconds.
- The evolved form is `/bridge-exec` (`bridgeExec<T>()` at
  `companion-bridge.ts:135-149`): dispatch to a named method on
  `window.__TEST__`, await via `__test_respond`, results wrapped as
  JSON-encoded strings. Typed on both sides — the client declares response
  interfaces (`QueryNode`, `CompanionPanelState`, `BrainCounts`, …).
- `/query` and `/find-text` return **bare arrays**, not `{nodes}` — recorded
  in the header precisely so the next author does not re-learn it.

## The population discipline, and its counter-example

The lane's population is journey-shaped: tour walks
(`tours-explore.spec.ts`), companion conversation, guided walkthroughs — each
a claim only the assembled app can witness. Real model round-trips push
per-test time to 30–90s (`timeout: 360_000`, `playwright.config.ts:52`), which
enforces the "small population, exclusive claims" rule economically.

The counter-example is `.github/workflows/e2e-smoke.yml`: a 27-test live
smoke lane (`tools/test-mcp/smoke_test.py` registers 18 named tests plus one
per entry of its nine-section navigation list) that failed **every one of its
38 runs** from its scaffold on 2026-05-10 to 2026-08-14 — 34 failures, 4
cancellations, zero successes, by the CI API count recorded in `f9e3a33fda`.
It was born broken by one missing word in a `cargo build` features flag:
`--features test-automation` without `desktop` aborted at
`Permission updater:default not found`. Red was normal from day one, so for
three months nobody walked toward it. `f9e3a33fda` added the missing word, and
the build now reads `--features desktop,test-automation`
(`e2e-smoke.yml:91`). The full autopsy is
`docs/concepts/golden-paths/live-ui-test-automation.md` §7 C1 — the
never-green lane the golden path's lane-health section exists to kill. The
smoke step is still `continue-on-error: true` (`e2e-smoke.yml:96`), so a green
job after the fix would not prove a green suite.

Since 2026-10-31 (re-checked at personas@61029d7ae0): the bridge, the
Playwright config, the launcher's four virtualized singletons and the header
quirks all hold. Earlier versions of this document said a production install
could opt in via `PERSONAS_TEST_PORT`; the release arm that refuses it predates
that sentence, so it was never true. They also said the smoke lane "has failed
38 of 38 runs" and was "never once green" in the present tense, though the fix
landed before that verification; and they counted 28 tests, though
`smoke_test.py` has held 27 since 2026-05-10. Run health after the fix was not
checked. The kpi-sim and use-case-slice session logs once cited for the
eval-DOM readback trick are not in the tree; `e2e_pipeline_harness.py` is the
in-tree witness now cited instead.
