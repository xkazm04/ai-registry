---
domain: game-production
subject: phone-controller-input-protocol
last_touched: 2026-10-07
touched_by: forge
dry_streak: 0
depth: L1
---

# phone-controller-input-protocol

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-07 - `/forge`, extension (run `forge-dro-1007`, branch `autopilot/technical-decision-capture-6e0ab333`)

Two techniques from the Death Ride optimize wave of 2026-10-06 (link context L): `link-rate-follows-the-phase`
(heartbeat 30 Hz in countdown, race or while anything is held, 4 Hz otherwise, thresholds switched with the rate,
reconnect backoff, visibility) and `send-on-change-with-a-heartbeat-floor` (display stream sent on change with a
1 s floor, slow block refreshed on phase change and every 60 s on a reliable socket, lean payload, page writes only
on change, lean uplink with an absent-reads-as-resting contract). One kotlin and one node application against
`firetv-deathride` at `86cb512d`. The golden path gained one section; nothing was rewritten.

**Upward lesson.** The existing snapshot technique requires a fixed cadence as the heartbeat for the staleness
rules; the source keeps that cadence whenever any control is held, whatever the phase, which is what makes a
phase-dependent rate safe. The new technique states the rate and its thresholds as one table.

**Outside hardening.** Change-only sending with acknowledged baselines (Valve's Source networking, Quake 3,
Gaffer on Games); the Page Visibility API and the WebSocket exemption from timer throttling (MDN); backoff with
jitter (AWS Architecture Blog); radio tail time (Android connectivity docs) — which turned the draft's radio and
battery claim into an explicit non-claim; same-value DOM writes differ by engine (web.dev, Mozilla bug 725221,
whatwg/dom 1106).

**Deviations recorded.** The page keeps its 4 Hz heartbeat and 1 Hz ping running while hidden; no handset was
measured, so no battery or radio figure exists. **Open:** a handset session. **Return:** one phone, menu idle,
hidden and visible, frames and battery drain.
