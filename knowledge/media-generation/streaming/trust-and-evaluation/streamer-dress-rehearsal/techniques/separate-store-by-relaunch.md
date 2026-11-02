---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: separate-store-by-relaunch
status: forged
laws: []
shared_with: []
use_when: [choosing between a rehearsal toggle and a rehearsal process, isolating rehearsal history from a streamer's real rules and records, designing how a tool enters and leaves rehearsal]
---

# Separate store by relaunch

A rehearsal writes: rules get armed, draws get filled and sealed, moderation decisions are
recorded, sources are added to a scene, visuals are tuned. If those writes land in the
streamer's real store, the rehearsal has edited the live show. If they land in a
rehearsal store but some in-flight task still holds the real one, a simulated ban ends up
in the real moderation history and a real chatter ends up in a rehearsal draw. This
technique makes the boundary a **process boundary**: rehearsal is chosen when the tool
starts, it opens its own store at its own location, and entering or leaving it is a
relaunch.

## Why a toggle is not enough

A runtime switch has to be honoured at the instant it flips by every open connection,
every background worker, every cache and every pending write. Each of those is a place
where the old mode survives a few hundred milliseconds or forever, and the tool cannot
prove otherwise unless it can join every worker it started and show that every port and
file handle was released. Most tools cannot, and the honest response is not to pretend:
exit the process, start a new one in the other mode, and let the operating system be the
proof that nothing from the previous composition is still running. A relaunch also drops
every secret held only in memory — a socket password, a session token — so leaving a
rehearsal cannot carry one along by accident.

## The store carries its mode

A separate path is necessary and not sufficient: a path can be misconfigured, and two
paths can be swapped by a careless relaunch argument. So the store, or the gate that
writes to it, is opened **in a mode**, and the mode is irreversible for that instance. A
rehearsal-mode intake refuses any message not marked simulated, and a decision recorded
there can only ever be a simulated record. A mix-up between path and mode then fails on
the first write, loudly, instead of after an hour of corrupted history.

The mode should bind both ways where the data allows: a live store that refuses simulated
input closes the opposite leak, where a rehearsal generator was wired into a live
composition.

## Procedure

1. Put rehearsal state under its own root, a sibling of the real one, and never read the
   real one from it: not rules, not recordings, not settings, not draws, not the record of
   which broadcast sources the tool owns.
2. Decide the mode from start-up arguments only. Validate them together and refuse
   contradictory sets — rehearsal with a login request, rehearsal with live automation —
   with one error that names the conflict.
3. Open each store and gate in the matching mode and make the mode one-way for the
   instance's life.
4. Expose enter and leave as relaunch commands. Treat invoking the current mode as a
   no-op, refuse a second pending relaunch, and give the new process a bounded retry
   window to acquire ports and files the old one is still releasing — a launch that is
   not a relaunch should fail promptly on an occupied port instead.
5. Carry across the relaunch only non-secret configuration the streamer would retype
   anyway (which local port the broadcasting software listens on, which overlay port to
   use). Never carry a session, a token or a password.
6. Title the rehearsal window so a glance tells the streamer which process they are in.

## Decision rules

- **When the tool cannot prove every worker and port released, relaunch.** Switching
  composition in place without that proof is a leak waiting for the right timing.
- **When the rehearsal and live stores could be confused, make the mode refuse, not the
  path decide.** Paths are configuration; modes are invariants.
- **When leaving rehearsal, live authority is granted again, never resumed.** A login
  that replays itself after a rehearsal is a login the streamer did not give.

## When not to use it

A tool with no persistent state and no background workers — a single overlay page, a
stateless chat command — gains nothing from a relaunch and can run its rehearsal inside
a normal session. The technique pays as soon as the tool persists anything a rehearsal
would write.
