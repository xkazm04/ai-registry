---
layer: technique
type: technique
subject: on-device-verification-harness
technique: borrow-and-return-the-shared-device
status: forged
laws: [refuse-rather-than-destroy, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a capture or test run needs a device that other agents or sessions also drive, an unattended run might take over or stop someone else's session on the device, a measurement was taken on a device another process was also driving]
---

# Borrow and return the shared device

## The concern

A test device on a desk is rarely one run's alone. Performance soaks, capture runs, other
agents and the person who owns it all drive the same stick. A run that takes the device
without asking takes over another session's screen or stops its recorder, and then both runs
report results about a device neither of them controlled. The damage is quiet: the other run
records a stall it did not cause, and this run films a screen in a state it did not set.

## Procedure

1. **Take an exclusive lock** with an atomic create-if-absent - a directory create is the
   portable form - and write an owner record inside it: who, when, which process. The
   mechanics belong to the cross-process exclusion technique; this one says when to use it.
2. **Bound the hold** to a few minutes, and split long work into several holds, so a waiting
   run is never starved by one long take.
3. **Wait on a busy lock; never break it.** Retry on an interval and report who holds it. The
   holder may be mid-measurement, and only its owner knows whether stopping is safe.
4. **Record what you found on entry**: what the device shows, which session owns the screen.
5. **Give it back as you found it, and prove it from the device.** Restore that state, then
   confirm it from the device's own heartbeat - which application is in focus, what it is
   connected to. A restore command that returned success is not proof the restore happened.
6. **Log every give-back** with the heartbeat line that confirmed it, so a later reader can
   tell a clean hand-back from an assumed one.

## Decision rules

- When a chain of beats depends on one session's state, keep them inside one hold rather
  than releasing between them.
- When the give-back heartbeat disagrees with the entry record, stop and report; do not
  start the next hold over a device in an unknown state.

## When not to use it

A device dedicated to one run - a lab rack slot, an emulator - needs no borrowing ritual. A
holder that died leaves a lock that needs an operator, not a staleness takeover, unless the
device's own report proves the holder is gone.
