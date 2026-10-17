---
layer: technique
type: technique
subject: render-submission-economy
technique: spread-periodic-render-thread-bursts
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [a job that runs every few frames sits exactly on the frame-time high percentile, the render thread builds data that only a diagnostic or remote reader consumes, a periodic refresh allocates a burst that later triggers a collection, one draw over a whole render target stalls the frame it lands on, a request frame rebuilds every output it touched]
---

# Spread periodic render-thread bursts

The concern: a render loop at sixty frames per second that refreshes its interface, its
telemetry or its remote snapshot ten times a second does that work on every sixth frame. The
work's mean cost is small and looks harmless in a profile that averages. Its cost per occurrence
is not small, and it lands whole on one frame in six — which is a sixth of all frames, and so
exactly where the ninety-fifth percentile of frame time is read. A periodic job is a burst
generator, and the percentile that a player feels is its cost per occurrence, not its average.
The remedy keeps the job's rate and removes its spike: do a part of the work every frame rather
than all of it every few frames, or move the parts nobody on the render thread needs to the
thread that does need them. Engine and platform guidance gives the same advice in the same terms;
what it rarely says is that the spike is visible only in a percentile, never in a mean.

## Procedure

**1. Measure the job per occurrence, not per frame.** Its median and its high percentile over
the frames it runs on, with the allocation per occurrence beside the time. A job whose median
across all frames is near zero and whose high percentile is milliseconds is a burst, and the
frame-time percentile it shares a frame with is its fingerprint.

**2. Split the work into stages that can run on consecutive frames.** Interface layout on one
frame, serialisation of one snapshot on the next, another on the frame after. The cadence stays
the same — the whole refresh still completes ten times a second — and each stage's cost lands on
its own frame. State the skew the split introduces: fields built on different frames describe
moments a frame or two apart, and a consumer that compares them must be able to tolerate it.

**3. Build into reusable buffers.** A stage that serialises a snapshot writes into one buffer
kept across refreshes, not into a fresh string per field; the burst's allocation is what a
managed runtime turns into a collection pause several frames later, on a frame that did nothing
wrong.

**4. Move reader-only work to the reader.** Data that only a diagnostic endpoint, a log or a
remote page consumes need not be built on the render thread at all. The render thread publishes
a reference to live state; the reader's thread builds the text when it is asked. Where the read
can tear, the reader serves the last complete result rather than a half-built one. There is one
builder for each output, and it runs where the output is consumed
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)).

**5. Prove the output did not change.** The text a split or moved job produces is compared
byte for byte with the text the original produced over a session; a split that changed a field's
content has changed a protocol, not a schedule.

**6. Report the burst's figures with their basis.** Per-occurrence time and allocation, before
and after, from which host, over how many frames; and the frame-time percentile on the device if
it was taken there ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When a periodic job's high percentile is many times its median, spread it before optimising
  it.** Its total work may be fine; its distribution is the problem.
- **When the only consumer of a value is off the render thread, build it there.** The render
  thread's job is the frame.
- **When stages must describe the same instant, do not split them.** Snapshot what they need in
  one cheap copy on one frame, and build the expensive representations from the copy over later
  frames.
- **When the remedy proposed is to lower the job's rate, treat it as a cut.** Fresher data was a
  feature somebody relied on; spreading keeps it.
- **When a job looks indivisible, look for a spatial split before a phase change.** One draw that
  covers a whole render target can be drawn as several scissored bands, one band per frame, each
  forced to complete before its frame ends. Without that completion wait a driver that defers work
  on off-screen targets may hold the bands and run them together, and the burst is back on one
  frame; a flush that only submits the work is not the same as a wait for it, and which one the
  driver honours is a device measurement. Report what the split costs: more passes, and a result
  that is ready later.
- **When a job cannot be divided at all — a single upload, a single large allocation — move it to a
  phase change.** A loading screen, a countdown or a menu transition can absorb a cost that an
  active frame cannot, but only if that phase is not under a frame bar of its own.
- **When one request frame dirties many outputs, publish one per frame from the next frame.** The
  request marks what it changed; a step at the top of each later frame builds at most one output, by
  the same builder from the same state, so the bytes a reader receives are those an immediate publish
  would have written, a frame or two later.
- **When work moves to the reader, its garbage stays in the same heap.** A managed runtime collects
  for every thread, so a reader that allocates many times its reply's size per request sets the
  collection cadence the render thread pays for. Build the reply in place into pooled blocks below the
  runtime's large-object threshold, and count the allocation per request beside the bytes served.

## When not to use

Not for work that is already small per occurrence relative to the frame's headroom; the split
adds state and buys nothing. Not where the reader's thread is itself time-critical — a socket
thread that must answer inputs promptly should not inherit a serialiser that was too slow for
the render thread. And not as a substitute for removing work: if a refresh rebuilds what did not
change, retaining it is cheaper than scheduling it.

## On fixed-refresh standalone headsets

The technique holds unchanged, and the shorter interval makes it bind sooner. A headset's frame is
the refresh period at the rate the application requested — about eleven milliseconds at ninety hertz
— so a burst that a sixty-hertz frame could carry inside its headroom misses a refresh there, and the
missed frame is shown as the previous one re-projected. Headset platform guidance gives the same
advice in its own words: do not put the expensive work in one frame. The spatial split of a large
render-target draw, the one-output-per-frame publish and the reader-side build all transfer, because
they depend on a few shared cores and a deferring driver, which a standalone headset also has. The
phase-change escape is wider there: the platform's compositor can keep a loading layer at full rate
while the application blocks behind it. No headset was run; the sources are cited in the stack
application.
