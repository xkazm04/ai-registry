---
layer: technique
type: technique
subject: talking-avatar
technique: paced-realtime-measurement
status: forged
laws: [limits-are-derived, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether an avatar route is realtime, a talking-head model is fast on a benchmark and falls behind the voice, reporting what an avatar costs to run, measuring a motion model on a machine without an accelerator]
---

# Paced realtime measurement

## The concern

"Realtime" for a talking avatar means one thing: **the picture keeps up with the
voice for as long as the voice keeps talking.** Throughput — frames per second
over a clip rendered as fast as possible — does not measure that. A model can
average thirty frames a second and still fall a second further behind the audio
every few seconds, because it is bursty, because its first call is slow, or
because something contends with it. The measurement that answers the question
is paced: feed the audio at wall-clock speed, as a synthesizer would deliver it,
and watch the lag between the audio clock and the frame clock over a long line.

## The procedure

1. **Pace the input.** Release audio to the route at real time, in the chunk size
   the voice pipeline uses. Use the longest bench line; lag growth hides in short
   ones.
2. **Measure lag against the audio clock** at every emitted frame and report its
   median, its 95th percentile, and whether it is **flat or growing**. A flat lag
   of one second is a latency; a growing lag is a failure, whatever the frame rate.
3. **Report frame rate at the 5th percentile next to the median**, and the first
   frame's time from the first audio. A model that emits frames in chunks reports
   per-chunk throughput and puts a fixed-rate player with a queue between
   generator and display, which turns bursts into a steady clock at the cost of
   one chunk of latency.
4. **Report memory per process, at its peak, from the process's own allocator**,
   not device-wide deltas polluted by whatever else loaded at the same moment.
   An absent measurement is omitted, never written as zero
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
5. **Separate cold from warm.** Compiled graphs and loaded weights make the first
   process slow and later ones fast; report both, because a live product must
   keep the process warm and pay that memory permanently.
6. **Serialise the accelerator during measurement.** One job at a time, under a
   lock every measuring command takes; a figure taken while another track shared
   the device is labelled contended and kept apart from clean figures.

## When a route is "not realtime"

Profile per stage before concluding anything about hardware. The bottleneck is
often a small stage launch-bound in eager execution — a few denoising steps of a
small motion model — not the renderer that looks expensive. Compilation fixes
that kind of stage; warm it with a full throw-away pass **through the same worker
threads** that will run it, because a warm-up on the main thread can leave the
first live frame slow, and a cold first call from several worker threads can
deadlock. Leave convolution autotuning off unless it buys measured frames; it can
multiply peak memory for nothing.

## Measuring a motion source that runs per sentence

When motion is computed per sentence beside a voice that renders sentences ahead
of playback, frame lag is the wrong question; the motion either lands while its
sentence is still sounding or it does not. Measure on the product's own path —
the real synthesizer, the real helper process, a multi-sentence line — and
report, per round and per sentence:

- **compute per sentence**, warm, next to the sentence's own length;
- **the delay added to the first audio** with the face on against off, which
  should be only the mouth timeline's cost, never the motion's;
- **motion events arrived against sentences spoken**, and for each, whether it
  landed before its sentence ended;
- **that the timeline still ends on the sentence's last sample** with the face
  on.

Then repeat on the slowest hardware class the product will offer motion on —
including no accelerator at all — before any default is decided. A number from
the development machine decides nothing about a laptop, and an unmeasured class
is reported as unmeasured
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Measuring the class without an accelerator

The no-accelerator row is where a motion source's cost is most often misread.
Five rules, each learned from a figure that would otherwise have been reported:

- **Hide the accelerator before claiming a fallback.** A model that picks its own
  device — falling back from one accelerator to another, never to the CPU — can
  look CPU-capable on a development machine and fail to load on a machine without
  the accelerator. Run the product's own load path with the accelerator made
  invisible to the process, and only then write "runs without one". A bench that
  forces the CPU through its own flag measures the cost; it does not prove the
  product's path reaches the CPU.
- **Measure the live schedule with the upstream producer on the same cores.**
  Without an accelerator, the synthesizer and the motion model share the CPU: the
  voice renders slower, sentences start the moment they are rendered, and motion
  is late by its whole compute time on every sentence. Isolated compute against
  sentence length (a real-time factor well under one) says nothing about that.
  Replay a multi-sentence line through the product's real schedule with the real
  synthesizer running as a sibling, and report **coverage** — the share of speech
  time that carries the learned motion, each sentence counted as one minus its
  lateness over its duration, floored at zero. Report it in two regimes: the
  synthesizer live beside the model, and all audio rendered ahead (the queue's
  worst case). Isolated factors of a half to nine tenths can become coverage of a
  few per cent to under half; only the replay shows it.
- **A fixed-window model is predicted by one window.** When a model always
  generates a fixed window of output, its cost is a step function of windows, not
  linear in seconds: a sentence shorter than one window costs a whole window, and
  a sentence of n windows costs about n of them. Confirm the step on a few lengths
  once; after that, a warm one-window probe predicts every sentence on that
  machine, and the probe is cheap enough to run at start-up.
- **On a shared machine, record the background load per row.** When the bench box
  cannot be emptied, sample the machine's busy share during every row and print it
  beside the figure; read CPU figures under heavy background load as relative
  between configurations, not as a specification of a dedicated machine, and say
  so above the table.
- **Distrust pinned-core proxies under contention.** Pinning a process to a few
  cores to imitate a small machine fails when the background already occupies
  those cores: the pinned process cannot move, a thread pool that synchronises
  every step degrades far worse than the work itself, and the "small machine"
  comes out slower than fewer cores would. Check the proxy's cores actually used
  (CPU time over wall time) before believing it; if it is far below the cores it
  was given, drop the row and use unpinned thread counts as the stand-in, labelled
  as a stand-in. A real small machine stays unmeasured until one is measured.

## Budgets for the drawing side

A rig's per-frame budget is derived from the host's frame budget, not chosen
([limits-are-derived](../../../../_laws.md#limits-are-derived)): with a frame time
budget and the host's other work known, the rig gets a number of draws, a mesh
size and zero allocations per frame. Measure it at the target output size, on the
class of hardware the product targets — a desktop accelerator's number says
nothing about an integrated one, and an unmeasured class is reported as
unmeasured, not inferred.

## Reporting the honest cost

A route's cost is the sum of what it needs to run, wherever it runs:

| Route | Playback | Motion generation |
| --- | --- | --- |
| rig, procedural | a few draws per frame | none |
| hybrid | the same as the rig | the motion model's accelerator, memory and load time; compute per sentence against the playback it hides behind; window latency only when audio is streamed |
| neural | the model resident, warm, on an accelerator | inside playback |

Writing only the left column for a hybrid is the most common way a report
overstates what it proved ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## When not to use this

For pre-rendered clips, pacing is irrelevant; measure offline seconds per output
second and the quality, and stop there.
