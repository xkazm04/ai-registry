---
layer: application
type: application
subject: agent-browser-control
technique: persistent-browser-daemon
stack: node
status: forged
verified_on: 2026-09-02
---

# gstack `browse` — a Chromium daemon behind a state file

The gstack tree (pinned at commit `0d1bd5616c0ef096bb7ccee336f63c60ee408618`;
`package.json` declares `engines.bun >= 1.0.0` and no Node version, so no
`verified_against` is stated) runs one headless Chromium per workspace as a
Bun daemon that a compiled CLI reaches over loopback HTTP. `ARCHITECTURE.md:52-62`
states the cost model the technique argues abstractly: 2-3 s per Playwright
launch, 40+ s over a 20-command QA run, and every cookie and login lost per
command, against ~100-200 ms per warm call. The realization is spread across
`browse/src/cli.ts` (the client side: discovery, liveness, restart decisions),
`browse/src/server.ts` (the daemon), `browse/src/port-allocator.ts`,
`browse/src/browser-manager.ts` and `browse/src/buffers.ts`.

## What the technique prescribes and what exists

| technique element | realization |
|---|---|
| atomic, owner-only state file with pid, port, token, binary version | `ARCHITECTURE.md:64-72` documents `.gstack/browse.json` written tmp-then-rename at mode `0o600` with `{pid, port, token, startedAt, binaryVersion}`; `server.ts:3175-3202` writes it, `:3182` stamping `binaryVersion: readVersionHash()`; the staging name is unique per writer, `${stateFile}.tmp.${pid}.${random}` (`server.ts:634-650`), with the comment explaining that a shared `.tmp` let two concurrent writers clobber each other |
| liveness by recorded identity, never by process name | `server.ts:1552-1555` — "Identity-based — uses readAgentRecord + isProcessAlive, NOT a process name probe" — and `docs/BROWSER_INTERNALS.md:20-36`, which records that the pre-v1.44 `pkill -f terminal-agent\.ts` killed sibling sessions on the same host and names the static-grep tripwire that now forbids it |
| busy is not dead; bounded probe; only explicit force kills | `cli.ts:330-336` sets `HEALTH_PROBE_TOTAL_BUDGET_MS = 8_000` and explains the old ~1 s window killed live daemons mid-page; `cli.ts:363-386` is the pure `decideDaemonRestart` over `{pidAlive, healthyAfterProbe, forceRestart}` with the closed action set `retry-command | report-busy | force-restart | restart-dead` and the comment "IRON RULE: an alive pid is NEVER auto-killed"; `cli.ts:734-744` applies it; `cli.ts:857-868` is the command-timeout side, printing "server still alive — busy, not restarting" |
| binary version mismatch restarts | `cli.ts:706-712`: `readVersionHash()` compared to `state.binaryVersion`, then `killServer` + `startServer`; `ARCHITECTURE.md:78-80` |
| crash means exit with a distinguishing code | `browser-manager.ts:233-246` `handleChromiumDisconnect`: clean quit exits 0, crash exits 1 with "Console/network logs flushed", embedded hosts get the log line only; `ARCHITECTURE.md:354-356` |
| ports from a range ending below the ephemeral pool, bounded retries | `port-allocator.ts:29-31` (`10000`-`49151`, 5 retries) with the module header `:1-16` explaining that `port: 0` squats the macOS ephemeral pool and that the earlier 60000 cap left ~22% of picks inside it; `:67-85` split the failure message into "every sampled port in use" versus "sandbox blocks loopback binding" |
| idle clock not reset by health | `server.ts:1911` — "Health check — no auth required, does NOT reset idle timer" |
| respawn guard windowed to its tick | `server.ts:1571-1581`: the guard window was a fixed 60 s against a 60 s tick, so three respawns could never land inside it and the guard "could not fire at the default tick rate"; now `max(60_000, tick × 5)` |
| fixed-capacity ring buffers, async flush, stated loss bound | `buffers.ts:1-40` `CircularBuffer<T>` with O(1) push and head-advance overwrite; `server.ts:705` flushes every 1000 ms; `ARCHITECTURE.md:242-257` states three buffers of 50,000 entries, reads from memory, and "up to 1 second of data loss" |
| cookie import at the boundary | `ARCHITECTURE.md:131-143`: keychain consent, in-process decryption, read-only copy of the store, per-session key cache, no values in logs; `cookie-import-browser.ts:388-396` opens the copied database `readonly: true` and notes the Windows WAL-lock case where a read-only open "succeeds" with empty results |

## What holds

- **The restart decision is a pure function, exported for tests.** Putting
  `decideDaemonRestart` outside the I/O (`cli.ts:377-386`) is what makes the
  "never auto-kill an alive pid" rule a unit-testable invariant instead of a
  convention across two call sites.
- **The two silences are typed.** `retry-command` (healthy after the bounded
  probe) and `report-busy` (still unresponsive) are different actions with
  different exit behaviour, which is the technique's busy-versus-dead
  distinction landing as code rather than prose.
- **The port range comment carries its measurement.** `:12` records the
  fraction of allocations the old cap left in the ephemeral pool, so the
  constant can be re-argued rather than inherited.
- **Crash exit codes distinguish clean from crashed**, and the embedded-host
  branch (`:235-238`) refuses to `process.exit()` a host it does not own — the
  reaper is the daemon only when the daemon is the process.

## Deviations (reported, standard kept)

- **The busy rule has no test.** `grep -rln "busy\|force-restart" test
  browse/test` returns files about shard scheduling, memory helpers and
  uninstall — none exercises `decideDaemonRestart` or the 8 s probe budget.
  The function was "exported for unit coverage" (`cli.ts:375`) and the
  coverage was not written. The technique's central invariant is enforced by
  a comment.
- **The version-mismatch restart has no test.** `binaryVersion` /
  `readVersionHash` appear in tests only in `browse/test/config.test.ts`,
  which covers configuration parsing; nothing asserts that a mismatched hash
  produces a kill-and-restart.
- **A stale state file is swept by age, not by identity.** `server.ts:3273-3288`
  deletes state files older than seven days. A daemon that has been alive for
  eight days has its own discovery record deleted from under it; the next
  command sees no file, starts a second daemon, and the first is orphaned
  with its port. The standard is liveness-by-identity for cleanup as well as
  for kill.
- **The health responsiveness signal is read-only on the client.** The CLI
  distinguishes busy from dead (`cli.ts:338-341`), but the daemon's own
  `/health` (`server.ts:1915-1935`) reports `healthy | unhealthy` from a
  browser-connection check and nothing about queue depth or in-flight
  navigations — the busy state the CLI infers from silence is one the daemon
  could have stated. The stalled-versus-slow instrument is on the wrong side
  of the socket.
- **The ring-buffer loss bound is stated in the architecture document, not
  measured or asserted.** `ARCHITECTURE.md:253` says "up to 1 second"; the
  flush is `setInterval(flushBuffers, 1000)` (`server.ts:705`) and a flush
  that takes longer than its interval — a large console burst on a slow disk
  — widens the bound with nothing to say so.
