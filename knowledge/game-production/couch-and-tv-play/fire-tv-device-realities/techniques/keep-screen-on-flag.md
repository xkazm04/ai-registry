---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: keep-screen-on-flag
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [an unattended or scripted session outlasts the platform's idle timer, a recording or soak test goes dark mid-run, deciding whether to change a device setting or an application flag to stop the screensaver]
---

# Keep-screen-on flag

## The concern

The platform measures idleness by input. A session with no remote press for a few minutes is
indistinguishable from an abandoned one, and the platform responds in stages: dim, ambient
screensaver, display sleep. A game that is being driven by a script, recorded for a
review, or simply left running while its owner watches from across the room is being
perfectly attended and perfectly idle at the same time. The first symptom is that a long
session "dies" at a suspiciously regular time with nothing in the game's log, because nothing
went wrong in the game. The screensaver is drawing over a running process.

## Procedure

1. **Set the window-level keep-awake flag** on the game's own window when the game starts
   its main activity, before the first frame. It is a property of the window: it holds while
   that window is visible and is released automatically when it is not, which is exactly the
   lifetime the game needs.
2. **Set it once, at the window, not from a service or a helper.** It is meaningful only on a
   window; the platform ignores it elsewhere.
3. **Tie it to a mode, not to the process.** A menu left open for ten minutes is a user who
   has left the room, and a platform guideline says the keep-awake flag belongs to active
   playback and play, not to a screen of static text. Clear it on the menus and the pause screen
   if the game will ship, and keep it on for the unattended-test and recording modes where the
   absence of input is the point.
4. **Do not change the device's own screensaver or timeout settings to get the same effect.**
   The flag is scoped to one application and undoes itself. A changed setting is global, is
   remembered by nobody, and makes every later session on that device behave differently from
   the one an ordinary user has.
5. **Verify with a session longer than the timer.** Know the device's idle interval, run
   past it with no input, and then ask the power service for the display state and confirm
   the game's window is still the focused one. A flag that was set and that nobody has run
   past the timer is an unverified claim.
6. **Record the setting in the test report.** A soak result produced with the flag on
   describes a game that was kept awake; it does not describe an attract-mode screen that a
   player will meet.

## Decision rules

- **When the display is already asleep at launch, the flag cannot help.** It takes effect
  only once the window is active and does not wake a sleeping device; the wake belongs to the
  launch procedure.
- **When a session needs to outlast the idle timer and a human will not touch the remote,
  set the flag.** There is nothing cheaper and nothing more scoped.
- **When the game is a shipped product with static screens, release the flag there.** A
  screen held on forever is a burn-in risk on some panels and is the platform's reason for
  the screensaver; holding it is a courtesy to the developer's test, not to the user.
- **When the display still sleeps with the flag set, check which window is focused.** The
  flag applies to the window that holds it; a dialog, a system overlay or an activity that
  was replaced does not carry it over.
- **When the session is a soak test on a thermally limited device, say so.** Keeping the
  screen on is a change in load as well as in visibility, and a long result reflects it.

## What it does not prove

The flag keeps the screen on. It does not keep the process alive: the platform can still
reclaim memory, and a game that dies for another reason will leave a lit screen showing the
launcher. After a long run, ask whether the process is alive and whether the game is in the
foreground; do not infer either from the screen being lit.

## When not to use this

When the game receives continuous real input and the session is a player's, the flag is
redundant while they play and harmful on the paused screen. When a recording rig injects
synthetic input at a rate above the idle timer, the injected input already resets it, and the
flag is a second mechanism for one fact.

## Evidence status

The failure - a session going dark mid-run with the game unaffected - was observed on one
device and the flag resolved it in the sessions that followed. The idle intervals and the
stages on other models and platform generations were not measured. The shipped-behaviour
advice about releasing the flag on static screens is authored from platform guidance and has
not been tested with a player.
