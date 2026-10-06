---
layer: technique
type: technique
subject: on-device-verification-harness
technique: fresh-state-per-check
status: forged
laws: [a-verdict-is-bound-to-its-content, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a check passes on a freshly flashed device and fails on a shelf device, a regression is blamed on the latest change and turns out to be inherited state, a recovery path needs proving after the process is killed]
---

# Fresh state per check

The named concern: every check on a long-lived device starts from a state it establishes and
states, never from the state the previous check, the previous session or the previous week
happened to leave. And the recovery paths, the ones that run only when state is lost, are
exercised on purpose by killing and restarting the process.

## The device remembers

An emulator is created clean for each run. A real device is not. It keeps a media position,
a saved profile, an authenticated session, a cached asset, a warm thermal state and a
foreground application. A test written on the emulator silently assumes the clean start;
carried to the device, it inherits whatever was left. The consequence is the most
misleading kind of failure: intermittent, tied to history, and arriving right after an
unrelated change, which is therefore blamed. A check that depends on inherited state will
eventually accuse the wrong change, and the investigation that follows is spent on correct
code.

## Three kinds of state

**Application state the game persists.** Profiles, balances, progress, pairing tokens, the
position inside a playing clip. Before each check, either reset it through a supported
route or read it and assert it equals what the check assumes. A reset routed through the
game's own interface is better than a wipe of its storage, because it exercises the same
path a player would, but a wipe is acceptable when the check is about something else.

**Process state the platform holds.** A process that was killed and restarted is a different
process; one that was merely sent to the background is not. Decide which the check means, and
state it. The pairing identifier, a listening socket, a loaded scene and a warmed cache all
differ between the two.

**Device state the player never sees.** Thermal history, free memory, the set of other
processes alive. These cannot be reset cheaply. They are recorded: read the thermal and
memory readings at the start, put them in the result, and say whether the device was cold or
preheated. A comparison of two runs whose device states differ is a comparison of the
states.

## Procedure

1. Begin each check by establishing the state it needs, and write down, in the result, the
   state it found before it changed anything.
2. Make every check order-independent: a check that needs an earlier check's output declares
   it as an explicit chained scenario, one result, one set of assertions, rather than
   inheriting it by accident.
3. Exercise recovery deliberately. Press the platform's home control and assert that the
   listener stops and that, on return, the game resumes with its persistent state and its
   input controls neutral. Force-stop and relaunch, and assert that persistent state came
   back through a fresh pairing, with the old token discarded on the client.
4. After a restart, discard everything that identified the previous process: the pairing
   code, the session token, the cached query result. Re-acquire them from the new process.
5. Bind the result to the build under test by a content fingerprint of the installed
   package, and to the device by its model and reported memory.

## Decision rules

- **When a check depends on a position, a selection or a mode, set it before the act.** The
  place where this was learned was a seek relative to a playing clip's current position,
  which stays inside the clip only if the position started near the middle; an emulator
  always started it there and a device that kept playing did not.
- **When recovery is the claim, kill the process, not the activity.** A suspend-resume
  proves the resume path. A process death proves the load path, which is what runs after the
  platform reclaims memory.
- **When the same chain is run three times in one process, treat run two and three as
  dependent.** Their verdicts speak for the chain, not for each race alone.
- **When a failure appears on the shelf device and not on a fresh one, suspect inherited
  state first and the latest change second.** Reproduce on the cleared device before
  blaming the diff.
- **When state cannot be reset, report it.** A thermal start point or a memory baseline is
  a stated condition of the result, not a footnote.

## What a neutral resume proves and what it does not

A resume that restores profile and control neutrality proves that the game's state machine
survived. It does not prove that every platform path that destroys the graphics context was
exercised; the home-and-return cycle is one such path among several. Name the path that was
driven, so the claim is the size of the evidence.

## When not to use it

A check whose whole point is accumulation, a soak, a memory-growth run or a long career, must
not reset in the middle. It begins from a stated state and runs without interruption, and its
result names that start. Resetting within it would be deleting the thing it measures.

## Evidence status

Measured on one device: the inherited playback position caused two failed checks and
looked like a regression in a renderer rewrite that had just landed. The restart and home
drills ran on that device with scripted clients and asserted persistent state, listener
stop, resume and neutral controls. The device was already warm in the long run, so its
thermal start was not fresh and the result says so. No drill was run across a platform
update, a low-memory kill or a power loss.
