---
layer: technique
type: technique
subject: render-submission-economy
technique: prepare-off-the-render-thread-commit-on-it
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient, one-authority-per-quantity]
shared_with: []
use_when: [one long frame recurs at the start of a level or a race while steady play is smooth, a lazily built structure or a decoded image is first touched by the render thread, work is being moved off the render thread and the destination thread has not been chosen]
---

# Prepare off the render thread, commit on it

The concern: a periodic job can be spread across frames, but a one-off cost cannot. The first
use of a level's derived data, the decode of a replacement image, the hash and manifest read that
decide whether a cached file is still valid — each happens once, each is paid by whichever thread
touches it first, and in a game loop that thread is usually the one drawing the frame. Laziness
makes this worse in a way that is easy to miss: deferring a build from startup to first use moves
it from a moment covered by a loading cue to the first frame that needs it, and that frame is often
the first frame of play. The remedy splits every such cost into the part that needs the graphics
context — an upload, a swap of one reference — and the part that does not, prepares the second on
another thread before it is needed, and leaves the render thread nothing to do at the transition
but commit.

## Procedure

**1. Time first use per request on the render thread.** A steady-state profile averages a one-off
cost into nothing; it shows only on the frame that paid it. Wrap each unit of work the render thread
runs — a lazy build, an image load, a queued command — in a timer that records its name and duration
when it exceeds a share of the frame, and read those records for the transition frames. The long
frame then has a name rather than a phase.

**2. Split each cost into prepare and commit.** Building derived data, decoding pixels, hashing a
file, parsing its manifest and checking it against the cache are pure work with no graphics state;
they are prepare. Creating the texture from decoded pixels and replacing the reference the renderer
draws from are commit. Only commit stays on the render thread.

**3. Prepare only what is next.** The candidate set is what the player has committed to — the level
chosen, the scene the current one leads to, the art the next screen will show — not the catalogue.
Preparing everything ahead of need rebuilds the startup stall in the background and spends cores the
frame needs; preparing nothing leaves the cost on the frame. The trigger is the decision that names
the item, and the time between that decision and first use is the budget the preparation has.

**4. Use one worker, below the render thread's priority.** On a device with a few slow cores, every
extra busy thread at the render thread's priority takes time from frames. A single preparation
worker set below the render thread lets the frame win contention, and a single worker runs its jobs
in the order they were submitted, which the ordering rule below depends on. Set the priority by the
scheduler value it maps to, and read what the platform already gave the render thread before
requesting anything for either.

**5. Keep one builder per item.** The item's value is built once, behind the same guard, whichever
thread arrives first: the worker that was asked to prepare it, or a render-thread caller that got
there early. Two paths that can each build the value are two authorities for it, and the one that
loses the race must get the winner's result, not a second copy
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). The guard is the
safety net, not the schedule: a caller that meets it mid-build waits, which is correct and is
exactly the stall the technique exists to avoid, so the next step keeps the render thread away
from it.

**6. Never wait on the guard from the render thread.** The render thread asks whether the item is
ready, and if it is not, it presents another frame of the transition — the countdown held, the
loading cue still turning — and asks again next frame. Blocking on the guard would put the whole
preparation back on the frame it was moved away from. Make sure nothing else on the render thread
can touch the item first: whatever reads it — the simulation, the countdown — waits for the same
readiness. Bound the wait with a timeout and a named outcome, so that a preparation that failed or
never finishes is a reported failure, not a transition that holds forever.

**7. Prove the prepared value equals the lazily built one.** The worker path is a second road to the
same value, and the claim that it changes nothing is a claim to test: build the item both ways and
compare the results exactly, field by field or byte by byte. A cheaper transition that produced a
different level is a different game
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

**8. Report the render thread's share before and after.** The first-use time per request on the
render thread, how many first visits it was measured over, on which device, beside the worker's own
duration. The worker's time did not disappear; it moved to a thread where a frame does not wait for
it ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When a command's effect becomes asynchronous, every later command that reads its result waits for
  it.** A selection that used to complete before the next message was read now completes on another
  thread, and a start command that arrives in between acts on the previous selection. Queue the later
  command behind the earlier one on the same serial worker, or gate it on the earlier one's completion;
  never rely on the earlier one usually finishing first. Where the gate is a flag that says a request
  is in flight, the consumer reads the flag before it takes the result, because the producer
  publishes the result before it clears the flag; read the other way round, a consumer can see no
  result and no flag in the same instant and let the later command through.
- **When choosing where the preparation runs, never choose a thread with its own deadline.** A network
  receive loop, an input reader or an audio callback that inherits a build of several seconds stops
  doing its own job for that long: heartbeats go unanswered, inputs queue, the far end decides the link
  is gone. Moving work off the render thread onto another latency-critical thread has relocated the
  stall, not removed it.
- **When the player can change their mind, tag each preparation with the decision it served.** A
  preparation for a superseded choice is discarded at commit, not swapped in, and whatever it holds —
  decoded pixels above all — is freed when it is superseded, not when the next one lands.
- **When the prepared item does not match what the render thread needs, take the old path.** A
  mismatch between what was prepared and what is being committed falls back to the synchronous work,
  slow and correct, rather than committing something close.
- **When work moves, its checks move with it.** A size check that ran before a decode runs before the
  decode on the worker; a residency check that guards an upload stays with the upload. Preparing ahead
  also raises the peak of what is held, because the next item's decoded data now coexists with the
  current item's resident data; count that peak against the budget it competes with.
- **When the transition is shorter than the preparation, the transition waits.** A countdown that
  elapses before the item is ready moves the remaining build into play; hold it, and measure the time
  from readiness to the first live frame.
- **When the work genuinely needs the graphics context, shrink it rather than move it.** An upload can
  be split across frames or done at a lower mip first; it cannot be prepared elsewhere on an interface
  that binds the context to one thread.
- **When every session needs the item at its first frame, prepare it under the startup cue.** Laziness
  only helps for items some sessions never touch.

## When not to use

When a first use costs less than a small share of a frame on the target device, a worker, a guard and a
readiness check are machinery with no saving. When memory cannot hold the next item beside the current
one, preparing ahead trades a hitch for an eviction; release first, and accept a transition cue. Prepared
data that is kept after use is a cache with no eviction: every level a session visits stays resident,
which is a residency decision to state, not a side effect to discover in a soak. And when the
preparation itself is the dominant cost of the whole session, the question is why it is that expensive,
which no thread placement answers.

## On fixed-refresh standalone headsets

The rule holds there, with a qualification about where. A headset's display refreshes at a fixed rate
whatever the application does; a frame not delivered in time is replaced by the previous one,
reprojected for the head's rotation but not its movement, so a stall inside a live scene is seen as
positional drift and, on a fast turn, as dark edges where the old image runs out; platform guidance
notes that small hitches are more noticeable in a headset than on a monitor or a phone.
For that case — first-use work landing inside play or inside a transition that is still a live,
head-tracked scene — the procedure applies unchanged, and the platforms' own guidance agrees: stream
full-fidelity assets only when the player can reach them, do not put the expensive work in one frame,
remember that even starting asynchronous work costs the main thread something, and keep background
threads below the threads that render. The processors are the same tile-based class with a few cores
shared by everything, so one below-priority worker is still the right shape.

The qualification is the deliberate loading screen. Published headset guidance accepts a blocking load
behind a loading layer that the platform's compositor keeps drawing at full rate, or behind a fade, and
the platform's frame-rate requirement exempts those moments. Where a game can afford that cue, a
synchronous load behind it is acceptable on a headset, and this technique's machinery is optional there.
The evidence behind this technique comes from a television stick; no headset was run.
