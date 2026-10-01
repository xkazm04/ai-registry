---
layer: application
type: application
subject: phone-controller-input-protocol
technique: stale-hold-steer-drop-actions
stack: node
status: forged
verified_on: 2026-10-01
---

# A latest-state mailbox that holds the steer, zeroes the actions and refuses late frames

Read against the racing game's source tree at `C:\Users\kazda\kiro\firetv-deathride` as it
stood on 2026-10-01. The host is a JVM program on a TV box and the controller is a single
browser page served by it; neither is a Node runtime, and `node` is the nearest member of
the closed stack set for a socket host with a browser page, so no `verified_against` is
given. The class carries the sequence, age and stale policy for one seat.

## The mailbox

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:38 "Bounded latest-state mailbox. A late packet cannot restore throttle."` is the contract in one line. The limit is one
named constant, `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:13 "const val STALE_MS = 250.0"`, used in both the receive check and the consume check. The unit is in
the name, which is the basis the technique asks every threshold to carry.

`offer` runs the checks in the technique's order. Shape first, at
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:54 "weapon !in 0..1"` (the whole line rejects a non-finite number or an index
outside the set, and the frame is dropped whole). Order next, at
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:55 "if (q <= seq) { outOfOrder++; return false }"`. The gap is counted and the
frame kept, at `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:56 "if (seq >= 0 && q > seq + 1) dropped += q - seq - 1"`. Then
age, after the sequence has been advanced at line 57, at
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:58 "generatedMs - nowMs > 100.0) { dropped++; return false }"`: the same line
rejects a frame older than the limit and a frame stamped more than 100 ms in the future.
The ordering is the one the technique calls load-bearing: the high-water mark moves before
the age test, so a refused stale frame still retires every older one.

`consume` is a pure read applied each step. At
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:66 "val stale = nowMs - receivedMs > Tuning.STALE_MS || ageMs > Tuning.STALE_MS"`
both clocks are tried, the host's receive time for liveness and the translated send time for
age. At `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:67 "out.set(steer, if (stale) 0.0 else throttle, if (stale) 0.0 else brake)"` the steering passes through and throttle and brake are zeroed, and lines 68 and 69
do the same for the handbrake, fire and mine channels. `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:70 "if (stale) staleConsumed++"` counts it. Line 69 also carries the selection index through
unchanged (`"out.weapon=weapon"`), which is the technique's rule for a selection.

The scripted check for the policy is
`deathride/core/src/test/kotlin/dev/deathride/core/WorldTest.kt:15 "assertEquals(.7,out.steer); assertEquals(0.0,out.throttle)"`. A frame at 249 ms keeps throttle; at 251 ms the steer is
held and throttle and brake are zero; a frame stamped at zero and delivered at 400 ms is
refused and the next consume still returns the held steer, which is the "late frame cannot
undo the policy" case.

## Where it falls short of the standard

**The steer hold has no second limit.** The mailbox never decays a held steering value; a
seat silent for a minute still reports its last steer. The check only asserts the hold at
251 ms and 401 ms. The technique's bound on holding is not implemented, and no check could
show it, because there is nothing to observe. The consequence in a game where an absent
phone steers a coasting car to the wall is small, which is why this reads as a deviation to
close and not a defect to panic about, and it is unmeasured by any human.

**The selection range is fixed at two.** `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:54 "weapon !in 0..1"` rejects a whole
frame for any other index. It is a hard-coded size where the standard derives it from the
catalogue, so a third weapon would silently reject every frame that selects it, including
frames whose steering and throttle were fine.

**Clock offset is not part of the verdict.** The mailbox takes whatever generated-time the
host supplies. In `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:169 "val timestamp=if(calibrated) msg.number("ts")+offset else now"` an uncalibrated seat has
its age judged as zero, which is the "unsynchronised looks fresh" case the technique says
to label as unmeasured. The mailbox has no way to report that the age it judged was assumed.

## What this evidence does and does not show

Every figure here is from unit checks and scripted clients. The 250 ms limit is a chosen
starting value, never compared with a measured wireless jitter distribution and never felt
by a person; the hold-steer choice is authored, from a design contract, not from play.
