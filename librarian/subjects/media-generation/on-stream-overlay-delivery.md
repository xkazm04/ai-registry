---
subject: on-stream-overlay-delivery
domain: media-generation
last_touched: 2026-11-16
touched_by: deepen
dry_streak: 1
---

# on-stream-overlay-delivery

Harvested on 2026-11-02 (326b3b04e) from one Castle Control tree: a golden path, six
techniques and two applications (the Rust read-only origin and the TypeScript renderer).
The librarian had not swept it before this run.

## 2026-11-16 - first /deepen (loop 3, run filler-deepen-20261116g, /shift filler)

**Round 1 (web and source survey): not dry. One rule flipped, one amendment, three
dated corrections, no new technique.**

- **Flip, no-source-url-without-a-valid-read and the golden path.** The technique said
  that after the page route answers "unavailable", the page's retry brings it back. A
  refused document runs no code, so it has no retry. The browser source does not reload a
  page it was served (obs-browser `OnLoadError` clears the page and stops). So the refusal
  now carries its own way back: a data-free, self-reloading page, or the renderer with no
  first snapshot. A cold start, with the tool down while the page loads, belongs to the
  tool's start-up. clear-on-disconnect step 3 gained the matching condition. The test ran
  in headless Chrome 157, not CEF:
  - a bare 503 got 1 request in 11.5 s and never recovered;
  - a 503 with a meta-refresh body recovered at 5.0 s;
  - a connection refused outright was re-requested by the stock error-page reloader.
- **Amendment, read-only-overlay-origin step 2: budget the streams.** Over HTTP/1.1 a
  browser holds six connections per host. OBS creates every browser source in one global
  request context, and with the default settings a hidden source stays loaded. So the
  seventh live SSE overlay on one origin never connects. Measured in headless Chrome:
  6 of 8 streams opened on one origin (n=2), and 8 of 8 when split across two host names.
  The convergence is MDN's EventSource warning, the experiment, and the obs-browser
  source.
- **Corrections (dated):**
  - The default page permission is read access to status (`ReadObs`), not none. Step 7
    now says to *lower* it.
  - Sources reload on scene activation only when an option is ticked, and both such
    options default to off (full-replacement-snapshots).
  - In the golden path threat paragraph, the control socket ships off, and when it is on
    it requires a generated password by default. The host still grants loopback access
    and disables the engine's local-network check for sockets. OBS 33.0.1 runs on the
    Chromium 150 branch.
- **Read lane:** castle-control was re-read through a public clone at `0b1c6b7`, and
  every anchor holds. Both applications were moved to `verified_on: 2026-11-16`, each
  with a dated section naming the bare-503 refusal and the stream-budget gap.

**Round 2 (probes): not dry.** It corrected round 1's own draft before landing:
- it dropped an unmeasured claim that the seventh document also stalls;
- it re-ran the cold-start case, which showed that a bare refusal does worse than no
  answer in a stock engine;
- it checked that a meta refresh survives `default-src 'none'`, which it does (that was
  the shell arm).

**Round 3: dry.** Training-data probes found no contradiction:
- aggregate-only payloads;
- consented data-only packages;
- `connect-src` covering sockets;
- no-store against the persistent CEF cache (obs-browser sets `cache_path`).

Banked leads:
- whether CEF's error page auto-reloads like Chrome's (return when an OBS instance is free
  for an isolated lane);
- break-to-clear timing inside OBS (still unmeasured).

## Ledger

- 2026-11-16 no-source-url-without-a-valid-read flip: simulation, better on Castle Control
- 2026-11-16 read-only-overlay-origin stream budget: simulation, better on Castle Control

## Impact

The registry map was not regenerated in this run. That is owed to the supervisor.
