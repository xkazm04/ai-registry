---
layer: technique
type: technique
subject: standalone-headset-frame-budgets
technique: thermal-headroom-reserve
status: draft
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a budget holds early in a session and fails later in it, the device lowers its clocks in sustained play, deciding how much of the frame to leave unspent, the game requests the highest performance level the platform offers]
---

# Thermal headroom reserve

The named concern: a standalone headset is cooled passively or barely, and runs on a battery.
A cold device holds its peak clocks for a while and then steps them down as it warms. A frame
that fits under the peak clock fails under the sustained one, and the player's session is
spent mostly at the sustained one.

## When a budget holds early in a session and fails later in it, prove it with a sustained capture from a warm start, because a cold capture proves a device the player does not have

The proving capture runs the heaviest content for a full session length, with the device's
thermal start state recorded under
[fresh state per check](../../../couch-and-tv/on-device-verification-harness/techniques/fresh-state-per-check.md).
The session is split into the windows it is judged over under
[separate active race from transition windows](../../../couch-and-tv/on-device-verification-harness/techniques/separate-active-race-from-transition-windows.md),
so a loading screen does not dilute the hardest window. The capture's window follows
[bracketed capture window](../../../../engine-integration/perf-regression-gating/techniques/bracketed-capture-window.md).
Frame time, clock level and temperature are read across the whole run, and the verdict is
the late windows, not the mean.

## When the device lowers its clocks in sustained play, budget against the level it can sustain, because a boost level the platform grants only with spare thermal margin is an opportunity, not a floor

Where the platform lets a game ask for a performance level, budget at the level it can hold
in sustained play, and treat any higher level as a quality bonus that the game must survive
losing. Where the platform lets a game favour one processor over the other when it throttles,
favour the one that binds this game's frame, and state why.

## When deciding how much of the frame to leave unspent, take the reserve off the top before dividing the rest, because a reserve that is whatever is left over is spent by the first content class to ship

The reserve is a named share of the interval, held back before
[per-content-class frame budget](./per-content-class-frame-budget.md) divides the remainder.
Its size is set from the gap between the cold and the sustained capture on the binding device.
Until that gap is measured, the reserve is a plan figure, and its application says so. A
general soft cap below every hard cap is a reserve against estimate error, not against
throttling; the two are kept separate.

## When the game requests the highest performance level the platform offers, lower the request and remeasure, because always requesting maximum clocks reaches the thermal limit sooner

Higher requested levels spend the thermal margin faster and can leave the device throttling
harder later in the session. Request what the budget needs, prefer the platform's dynamic
resolution where it exists to absorb a step down, and judge by the sustained run.

## Decision rules

- **When the room is warm or the battery is charging, record it**; both shrink the margin.
- **When passthrough, hand tracking or another system service is on, capture with it on**;
  the player's session has it on.
- **When a sustained run shows frame time creeping as the device warms, the budget is too
  close to the ceiling**, whatever the cold run said.

## When not to use it

For a device that is actively cooled and holds its clocks, the reserve shrinks to estimate
error. A standalone headset is rarely that device.
