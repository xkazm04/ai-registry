---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: decay-before-interpolation
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [making a reactive visual cool back to rest between contributions, a visual that flares on stale peaks, fades on the wrong shape or disagrees with the tool after a reload, deciding who owns the visual's clock]
---

# Decay before interpolation

A reactive visual shows the room's current giving, so it cools when giving stops. Three
operations act on its state — cooling the total over time, adding a contribution, and
reading the total through the intensity curve — and the visual is correct only when they
happen in one order, on one clock, in one place.

## The order

On every accepted contribution, and on every snapshot taken while nothing arrives:

1. **Read the clock** — a monotonic elapsed time supplied by the host.
2. **Decay** the stored total from its last update to now.
3. **Add** the contribution's weighted amount, if there is one and it was not a duplicate.
4. **Interpolate** the new total through the curve to get the intensity.
5. **Store** the total with the time, and hand the intensity on if it changed.

Exponential decay halves the total every half-life: `total × 2^(−elapsed / halfLife)`.
Compute it from elapsed time, never by multiplying a factor per tick: tick rates change
when the machine is loaded mid-broadcast, and a per-tick decay changes speed with them.

## Why the total decays, not the intensity

Decaying the intensity instead of the total bypasses the curve. A concave curve rises
steeply and flattens; if the intensity then decays exponentially, the visual cools on a
shape unrelated to the one it rose on, and a gift arriving during the fade is added to a
total that no longer matches the picture. Decay the total and interpolate after, and rise
and fall are both read through the one curve the streamer chose.

The other wrong orders each have a symptom a streamer will call glitchy. **Add before
decay** stacks a new gift on a peak the room left minutes ago, so a single cheer after a
lull leaps to full blaze. **Store without the time** means a restart restores yesterday's
blaze as if it were current. **Two clocks** — the page cooling on its own timer between
messages — fade twice as fast as designed and snap up when the next state arrives.

## The clock

The logic never reads wall time. The host injects a monotonic elapsed clock, which makes
the engine deterministic under test (a fake clock reproduces a whole night) and immune to
the system clock jumping. A clock that runs backwards is an error that changes no state:
refusing the update is safer than computing a negative elapsed time into a growing total.

## The tool owns time, the page owns none

The authoritative total, its timestamp and its decay live in the tool. While the total is
above rest, the tool takes a snapshot on a steady cadence — about once a second is enough
for a decay measured in minutes — and hands the intensity on only when it changed, so an
idle visual costs nothing. The page draws what it receives. It may ease between two
received states over a short fixed time, but it never extrapolates past the last one and
never decays on its own. When the feed drops, the delivery discipline applies: clear,
reconnect, repaint from the next whole state, which already carries the correctly cooled
value.

## Choosing the half-life

The half-life is how long the room's giving lingers on stream. For an ambient visual —
a frame, an altar, a border that tracks a whole night — minutes, not seconds: a two-minute
half-life reads as a flash that settles within minutes, five as a glow through a short lull,
fifteen as something that builds across the night and is hard to cool. A one-shot alert
wants seconds and is a different design. Offer "never fades" only with its consequence
said plainly: it only climbs, and on a normal night it soon sits at full blaze.

## Changing the settings mid-stream

When only the curve or the half-life changes, the total is still a true count in the same
unit: keep it, decay it to now, and read it through the new curve. When the counted source
or its unit changes, the old total means something else, and resetting to rest is the
honest move. Resetting on every save is simpler and safe, but it makes a mid-stream tweak
look like the room went quiet — say so beside the save button if the tool does it.

## Decision rules

- **When a contribution arrives**, decay to now, add, interpolate, store with the time.
- **When nothing arrives**, snapshot on a steady cadence and hand on only changes.
- **When the clock goes backwards**, refuse the update and keep the stored state.
- **When the tool restarts**, restore the total with its timestamp and decay it, or start
  at rest; never restore a total without its time.

## When not to use it

A visual meant to show an accumulating figure — a goal bar, a charity drive's running sum —
must not decay: it is a count and its number is checkable. Use decay only for visuals that
describe the room's current intensity and are designed to say so.
