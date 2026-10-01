---
layer: application
type: application
subject: on-device-verification-harness
technique: poll-ready-signal-not-fixed-delay
stack: node
status: forged
verified_on: 2026-10-01
---

# Node scripts polling a streaming stick: ready signals, restart drills and the load pump

Verified 2026-10-01 against the racing game's tree (`C:\Users\kazda\kiro\firetv-deathride`, the root of
every path below, except one anchor into the earlier proof-of-concept tree `C:\Users\kazda\kiro\firetv`).
The stack is `node`: scripts drive one real streaming stick over a debug bridge, with an automation
browser as the phone. Everything here was measured on that single stick with scripted clients and
emulated touch; no person played and no physical phone was used.

## The incident that made the rule

The pitfall log records the fixed delay failing: `docs/concepts/deathride/PITFALLS.md:14 "Poll the new process's ready message with a bounded timeout before pairing"`.
The earlier harness force-stopped and relaunched, then read the pairing code after 2.6 seconds; the app
had restarted correctly and had not yet logged readiness. The log gives the general form as well:
`docs/concepts/deathride/PITFALLS.md:14 "is not proof that the HTTP/WebSocket listener is ready"`. A sibling
wake rule shares the shape: `docs/concepts/deathride/PITFALLS.md:6 "confirm `dumpsys power` Awake/ON, then launch"`.

## The three poll shapes in the session check

- **Poll a state query.** `deathride/tools/session-check.mjs:14 "async function waitStats(test,seconds=15)"` retries a state fetch every 100 ms, swallowing transport errors as "not yet", and throws "State timeout" with the test text. The resume wait names the last-set fields: `deathride/tools/session-check.mjs:41 "s.sceneryReady,30"` (every seat connected, not paused, scenery ready, thirty seconds).
- **Poll a log of the new process.** After a force stop and relaunch (`deathride/tools/session-check.mjs:50 "'am','force-stop'"`), the loop asks for the live process id and filters the log by it: `deathride/tools/session-check.mjs:51 "pidof"` and `deathride/tools/session-check.mjs:51 "--pid='+pid"`, one second apart for at most thirty tries, then asserts a code was found. The pid filter is what stops a previous process's code being returned.
- **Poll the property the assertion reads.** The log records the converse failure: `docs/concepts/deathride/PITFALLS.md:23 "Wait for the native option property as the readiness condition"`, after an assertion fired on a visible-but-unbound sheet.

## Recovery and fresh state in the same script

The home-key drill is the lifecycle half: `deathride/tools/session-check.mjs:39 "adb('shell','input','keyevent','3')"`, then `deathride/tools/session-check.mjs:40 "assert.ok(stopped,'Home closes LAN listener')"`, then relaunch and `deathride/tools/session-check.mjs:43 "effectiveThrottle===0"` for neutral controls. After the process kill, the controller side discards the old identity: `deathride/tools/session-check.mjs:52 "localStorage.removeItem('token')"`. The state inherited from a long-lived device is documented in the earlier tree: `docs/POC-FINDINGS.md:285 "a test that inherits state from a long-lived device"` (proof-of-concept tree).

## The load pump

The scheduled pump is `deathride/tools/probe.mjs:21 "timer=setTimeout(pump,Math.max(0,next-performance.now()))"`, advancing by `deathride/tools/probe.mjs:21 "next+=1000/30"` and re-anchoring when the backlog exceeds 100 ms: `deathride/tools/probe.mjs:21 "if(now-next>100)next=now+1000/30"`. The delivered rate is computed and published: `deathride/tools/probe.mjs:22 "actualHz=loadSent/"`. The reason is in the spike notes: `deathride/docs/concepts/DEATH-RIDE-PITFALLS.md:7 "a naive 33 ms interval delivered about 22.5 Hz"`. The long soak keeps the device probes off the pump: `docs/concepts/deathride/G1-REPORT.md:115 "Thermalservice and PSS are sampled asynchronously once per minute"`.

## Where the tree falls short of the standard

- **Ceilings are authored.** The fifteen- and thirty-second waits are chosen from a handful of runs; time-to-ready is not recorded per run, so no startup-regression series exists.
- **The pump re-anchors silently.** Line 21 resets `next` without counting the resets, so a starved pump is visible only through the delivered rate.
- **No catch-up bound is parameterised.** The 100 ms limit is a literal in the script.
- **The session chain is three dependent races.** The assertions at `deathride/tools/session-check.mjs:47 "Three real Stick career weapon races"` speak for the chain, not each race, and the long soak ran on an already-warm device (`docs/concepts/deathride/G1-REPORT.md:115 "The Stick was already warm"`), so thermal state was recorded but not controlled.
- **Evidence label sits in the output file, not in each check.** The result file carries `deathride/tools/session-check.mjs:56 "not human play"` once, as one device string.
