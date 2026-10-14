---
layer: application
type: application
subject: voice-io
technique: bounded-playback-wait
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
---

# A speech tool for coding agents that stopped hanging its hooks on a dead device

The tree is the open-source speech tool vox (text to speech and speech to text in one
binary, with a tool server for coding agents), read at commit `96fe9dbc`. The witness
for the stack is `Cargo.toml:4 "edition"` set to the 2024 edition, which needs 1.85 or
later; continuous integration installs the current stable toolchain without a pin.

The tool is called from places where nobody is watching: a stop hook that speaks a
summary after every agent task, and a tool call the agent makes itself. Its 0.17.1
release is one line, `CHANGELOG.md:8 "never block on a dead audio device"`, and the
code says what the failure was: `src/audio.rs:245 "Waiting on the sink alone then blocks forever, and a hook that calls vox"`,
continued at `src/audio.rs:246 "never hands control back to the agent that ran it"`.
The device was a sound server reachable over a remote shell with nothing behind it:
`src/audio.rs:129 "makes the open wait on a connection that never comes"`.

## The two bounds

The open has a fixed limit, `src/audio.rs:121 "const OPEN_TIMEOUT: Duration = Duration::from_secs(10);"`,
and the caller waits for the open on a channel rather than making the call itself. The
drain has a deadline taken from the audio: `src/audio.rs:248 "fn wait_until_played(sink: &rodio::Sink, expected_end: Instant, grace: Duration)"`
fails once the queued audio should have ended plus a grace of
`src/audio.rs:233 "const STALL_GRACE: Duration = Duration::from_secs(5);"`. For the
backend that plays while it is still generating, the deadline moves with every chunk,
from the later of the old end and the current instant:
`src/audio.rs:371 "expected_end = expected_end.max(Instant::now()) + audio_length(samples.len(), sample_rate);"`.
Listening cues get their own one-second grace: `src/audio.rs:467 "wait_until_played(sink, Instant::now() + length, Duration::from_secs(1))"`.

## The order of report and release

The playback thread sends its outcome before it drops the device,
`src/audio.rs:186 "The outcome goes out before the device is closed: closing a device"`,
because, as the next line says, closing a stalled device waits on it
`src/audio.rs:187 "would hold back the very"` error that reports the stall. A producer
asks before each chunk whether the open is stuck and stops if so:
`src/audio.rs:332 "if self.thread.is_stuck_opening(OPEN_TIMEOUT) {"`. The error names
the device and the file route: `src/audio.rs:253 "The audio device accepted the sound and is not playing it"`.

## The tests stand in for the device

The way to open the device is a parameter so a test can replace it,
`src/audio.rs:162 "test can stand a device that never opens, or one that never plays, in for"`.
Three tests are named after the failures: `src/audio.rs:575 "fn a_device_that_never_plays_is_an_error_not_a_hang()"`,
`src/audio.rs:614 "fn a_device_that_never_opens_is_an_error_not_a_hang()"`, and
`src/audio.rs:701 "fn a_stalled_device_is_reported_before_it_is_closed()"`, the last
with a device whose release sleeps thirty seconds. Each asserts the error text and an
upper bound on the wait.

## What this realization cannot do

The deadline is on the wall clock, which is right here because nothing pauses a
playback this tool starts. It would be wrong for a player that can be paused (see the
technique's audio-clock section). One path is still unbounded by design: a command
that hands its text to the tool's resident daemon waits for the daemon's answer with
no deadline, `src/daemon.rs:422 "No deadline: the answer comes when playback is over, after any model"`.
The daemon bounds its own playback, and a daemon that dies closes the connection, but
a daemon stuck before playback (a model download that does not finish) holds the
command for as long as it is stuck. A file whose analysis failed falls back to the
unbounded wait, `src/audio.rs:113 "None => sink.sleep_until_end(),"`, because there
is no length to derive a deadline from.
