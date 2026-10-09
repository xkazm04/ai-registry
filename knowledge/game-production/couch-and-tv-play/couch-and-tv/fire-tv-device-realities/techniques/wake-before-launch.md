---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: wake-before-launch
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a launch command returned success and the screen is black, scripting a repeatable install-and-run on a streaming stick, a tester reports the game does not start on a device that was idle]
---

# Wake before launch

## The concern

A streaming stick that has been left alone sleeps its display. A command that starts a
program on it is answered by the activity manager, which has no opinion about whether anyone
can see the result: the program starts, runs, even renders into a surface, and the screen
stays dark. The command reports success. The tester sees black and concludes that the game
failed to start, and the next hour goes to logs that contain nothing wrong.

The technique is to treat the display as a precondition of the launch, not as an assumed
background, and to verify the precondition rather than send a wake and hope.

## Procedure

1. **Ask first.** Query the power service for the display state. The reply names it
   directly (awake, asleep, dozing). Record the answer, because a launch that was preceded by
   "already awake" and one preceded by "was asleep, woken" are different histories.
2. **Send a wake key event** when the state is not awake. The wake key is a normal remote
   input, so it needs no privilege. Prefer the dedicated wake key to a generic "select" or
   "home": the generic ones are consumed by whatever is on screen and can, on some launchers,
   do something destructive. A dedicated wake key does nothing but wake.
3. **Poll until awake, bounded.** Ask again at short intervals, for a few seconds. Waking is
   not instantaneous, and a launch fired on the heels of the key can race a display that is
   still coming up and lose its first frames.
4. **Fail loudly when it does not wake.** If the display is still asleep after the bound, stop
   and report that, with the last observed state. A launch into a display that will not wake
   is a measurement of nothing.
5. **Then launch**, and after the launch ask the question that matters: is the game's
   window the focused one, and is the process alive. The wake got the screen on; it did not
   prove the game is what is on it.
6. **Make this a function the launcher calls**, not a step in a checklist. Every path to a
   running game - a manual launch, a scripted run, a retry after a crash - goes through it,
   or the one path that skips it will be the one that is used at night.

7. **Then wait for the game's own ready marker.** A launch is accepted well before a game
   has opened its listener or drawn a frame, and a pairing or probe step that runs on a fixed
   delay reads the previous process's state or finds nothing. Poll the new process's ready
   message with a bounded timeout, and never reuse a value, such as a pairing code, produced by
   an earlier process.

## Decision rules

- **When the game sets its keep-awake flag, do not count that as a wake.** The flag holds the
  screen on once the window is active; it does not wake a display that was already asleep when
  the launch arrived. The two are different mechanisms for different moments.
- **When the launch is scripted, the wake is inside the script.** A human can see the dark
  screen and press a button; a loop cannot, and will run a full session against a black
  display and file the output as a result.
- **When the display state cannot be read, say so and wake anyway.** A wake sent to an awake
  display is harmless. Report the state as unknown; do not report it as awake.
- **When a wake sent twice does not change the state, stop.** The cause is not the display
  being asleep: the device is off, disconnected or in a mode the key does not reach. Spending a
  third wake there hides the real finding.
- **When a launch "succeeds" and the picture is black, check the display state before the
  log.** It takes one query and it eliminates the commonest false lead.

## What it does not prove

A confirmed-awake display proves the screen is on. It does not prove the game is the
foreground application, that the game rendered, or that the audio path is open. The wake is
the precondition for observing; it is not itself an observation of the game. Pair it with a
liveness check on the process, and with a screenshot or capture taken after the launch if the
claim is that the game is visible.

## When not to use this

When the device is attached to a capture rig that already holds the display awake by another
mechanism and the rig reports its own state, a duplicate wake adds nothing. Even then, keep
the display-state query: it is the cheapest instrument in the procedure, and it is the one
that tells the difference between "the rig is holding it awake" and "the rig has silently let
go".

## Evidence status

The failure mode - a launch that succeeds against a sleeping display - was observed on a
single device and the wake-and-confirm remedy resolved it there. Nothing here was measured
across devices or platform generations; whether every model and every launcher behaves the
same way is untested.
