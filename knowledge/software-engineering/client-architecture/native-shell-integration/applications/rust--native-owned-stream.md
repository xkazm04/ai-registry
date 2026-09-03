---
layer: application
type: application
subject: native-shell-integration
technique: native-owned-stream
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@2021
---

# Moving the speak stream out of the hidden webview in Voicebox

Witness: the `voicebox` desktop shell at commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`; version witness
`tauri/src-tauri/Cargo.toml:8` (`edition = "2021"`), with `reqwest 0.12`
(`stream` feature) and `tokio 1` at `:20-21`. The stream carries
agent-initiated speech events from the local Python backend so the floating
pill surfaces whenever something is about to be spoken out of the user's
machine.

## The relocation, and the asymmetry that justifies it

`tauri/src-tauri/src/speak_monitor.rs:1-8` is the technique's opening
paragraph as an incident report:

> Owns the pill-window lifecycle for agent-initiated speech. The dictate
> webview used to do this itself via `EventSource`, but hidden WebKit windows
> on macOS throttle long-lived network connections, so speak events never
> reached the pill. Tauri's event bus, on the other hand, reliably delivers
> events to hidden webviews (the chord path proves it), so we subscribe here
> and fan out via `emit`.

Both halves of the asymmetry are established by observation rather than
assumption — and the second half cites an existing channel as the proof ("the
chord path proves it"), which is exactly the verification the technique asks
for before building on the local bus.

The fan-out is two lines of the run loop (`:11-14`): backend speak-start shows
the pill and emits `dictate:speak-start`; speak-end emits `dictate:speak-end`.
The webview keeps audio playback and emits `dictate:hide` back when the audio
element's `ended` fires. It holds no connection, no backoff state, and no
health opinion — the pure-renderer split.

## The idle timeout is derived, and the derivation is written beside it

`speak_monitor.rs:38-42`:

```rust
/// Backend emits a `:ping` heartbeat every 15 s. Giving the stream 45 s
/// of idle budget absorbs one missed heartbeat (slow GC pause, brief
/// backend stall) without being so long that a truly dead stream blocks
/// the pill from surfacing for minutes.
const STREAM_IDLE_TIMEOUT: Duration = Duration::from_secs(45);
```

45 s is `15 s × (1 missed beat + 1)` with a full interval of slack — the
technique's formula, with the tolerance named. The module comment at `:23-28`
states what it defends against: "a backend that accepts the TCP connection but
stops producing frames (deadlocked SSE endpoint, zombie process). Without a
timeout the `chunk().await` blocks forever and the task never notices."

The timeout is applied at the read, not at the connect —
`tokio::time::timeout(STREAM_IDLE_TIMEOUT, resp.chunk())` at `:109` — and its
expiry produces an error whose text carries the derivation forward: "no data
for {:?} (heartbeat should arrive every 15 s)" (`:114-117`). A reader of the
log can check the producer against the consumer's assumption without opening
either.

## Three states, and the backoff resets only on a productive round

`stream_once` returns `Result<bool, _>` where the bool is "at least one frame
arrived" (`:89-92`: "`Ok(true)` if at least one frame was received (the
connection was genuinely productive), `Ok(false)` on a clean but empty close,
and `Err` for any connection or parse failure"). The loop at `:63-86` branches
on exactly that:

```rust
let had_success = matches!(stream_result, Ok(true));
if had_success { backoff = INITIAL_BACKOFF; attempt = 0; }
else { attempt += 1; /* … log reason, attempt, next delay … */ }
tokio::time::sleep(backoff).await;
if !had_success { backoff = (backoff * 2).min(MAX_BACKOFF); }
```

`INITIAL_BACKOFF` is 500 ms and `MAX_BACKOFF` is 30 s (`:36-37`), and the
module comment at `:16-21` gives the reasoning the technique states: "The
stream is infinite by design, so a successful round means 'we were receiving
frames and then the backend closed the connection' (typically a server restart)
— reset backoff and reconnect quickly. A failure or a round that produced no
frames escalates backoff up to a 30 s cap so long-term outages stop filling
stderr with reconnect log lines." One log line per escalation, carrying the
reason, the attempt number and the next delay (`:72-80`).

The connected-but-silent case is distinguished from the failed-connect case at
`:72-75` with distinct reason strings, so the two are separable in a log even
though they escalate identically.

## The split is partial, and correctly so

Only the speak stream moved. The frontend keeps its own polled readiness query
(`app/src/lib/hooks/useDictationReadiness.ts:61-76`) and stops polling once
both models are ready — a stream that only matters while its view is open,
left in the view, with a stop condition as its backstop. That is the
technique's partial-split rule holding in both directions.

## Where the tree falls short

**The unconditional post-round sleep.** `:82` sleeps `backoff` before the next
attempt even on a productive round, so a backend restart costs a fixed 500 ms
before reconnection. Harmless at this magnitude and worth naming: the reset
branch has already decided the delay should be minimal, and moving the sleep
inside the failure branch would make that explicit rather than incidental.

**The stream names no reaper.** `spawn_speak_monitor` (`:44-48`) spawns a
`loop { }` task with no cancellation handle and no shutdown path; it runs until
the process exits. That is survivable for a single process-lifetime stream and
is the pattern that does not scale to a second one — the first stream that
needs to stop when a setting is toggled will have to retrofit the handle.

**One frame is enough to call a round productive.** A backend that emits a
single frame and then deadlocks resets the backoff on every round, so the
escalation never engages against that failure mode. The 45 s idle timeout still
bounds each round, so the loop reconnects every ~45 s rather than backing off —
noisy rather than harmful, and it is the case a "productive means N frames or a
minimum duration" refinement would cover.
