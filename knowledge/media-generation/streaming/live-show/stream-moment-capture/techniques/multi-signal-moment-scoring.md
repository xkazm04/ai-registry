---
layer: technique
type: technique
subject: stream-moment-capture
technique: multi-signal-moment-scoring
status: forged
laws: [unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [ranking moments of a recorded or live stream for clipping, choosing signals and weights for a highlight scorer, diagnosing a clip queue full of raids or empty on quiet nights]
---

# Multi-signal moment scoring

A highlight scorer turns a stream into a ranked list of candidate moments. The naive
scorer reads one signal, usually chat rate, and ranks by its peaks. It fails twice: it is
blind to every moment that signal cannot see, and it is owned by whoever can move that
signal without a moment behind it. The technique is to score from **several independent
signals, each normalised to the stream it came from, fused into one score, with the fusion
weights treated as a hypothesis until a measurement replaces them**.

## The signals

Four signals cover the ground, and each is chosen because it fails differently from the
others.

- **Host marker.** Whether the host marked this moment, and how recently. Precise and
  intentional; biased toward the host's own set-pieces.
- **Crowd reaction.** The rate of distinct viewers chatting in a short window, expressed
  as a deviation from the stream's own rolling baseline. Distinct chatters, not messages:
  one viewer pasting the same line forty times is one reaction, and a raid that floods a
  phrase is one reaction from many accounts that should be collapsed before it is counted.
  Reaction-shaped content (laughter tokens, a sudden shared emote) can sharpen it.
- **Audio energy.** Loudness of the programme audio in the window, again as a deviation
  from the stream's own baseline. Catches the shout, the laugh, the sting; fooled by a host
  who simply speaks louder or by a music bed.
- **Hook read.** A read of the transcript window for whether it contains a self-contained,
  quotable unit: a complete exchange, a reversal, a line that lands without the minute
  before it. Catches the moment that will travel; fooled by quotable lines that nothing
  reacted to.

## Procedure

1. **Normalise each signal per stream.** Convert every raw series to a deviation from that
   stream's own rolling baseline (a standard score over a trailing window is the usual
   form), clipped at a sane ceiling so one freak spike cannot dominate a fused score.
   Absolute thresholds are wrong by construction across rooms whose size differs by orders
   of magnitude: they never fire in a small room and always fire in a large one.
2. **Align the clocks.** Each signal lags the moment by a different amount; shift each
   series by its known lag before fusing, or the signals will agree about a moment that
   none of them is centred on.
3. **Fuse with explicit weights.** A weighted sum is enough; the weights live in
   configuration, named, versioned and labelled with their provenance. When a signal is
   absent (no host, no audio), redistribute its weight explicitly instead of letting a
   zero silently drag every score down.
4. **Require agreement for a clip, accept disagreement for review.** A moment where two or
   more independent signals peak together is a clip candidate. A moment carried by one
   signal alone goes to a review lane, never straight to the queue: a lone crowd spike is
   the signature of a raid, a lone marker the signature of the host's taste.
5. **Peak-pick with suppression.** Take local maxima of the fused score, suppress
   neighbours within a minimum spacing so one long moment does not yield five near-identical
   clips, and keep only a handful of candidates per stream, or per hour on long streams, so
   a lively night does not bury the editor.

## The weights are not a finding

Any starting blend is a design hypothesis. A reasonable opening position weights the
marker highest, the crowd and the hook read next, and audio energy least, because audio is
the most easily confounded. That ordering is reasoned from how each signal fails; it has
not been measured, and it must travel with that label. The measurement that replaces it
is simple to state: score past streams, compare the top candidates against moments a human
editor picked without seeing the scores, and record precision at the editor's working
depth with the sample size and date. Then compare published clips' retention by which
signals carried them. Until that exists, the scorer's report says **weights unmeasured**
beside every ranking it produces. A clip's retention among strangers is also evidence about
the segment that produced it; where a show scores its segments, feed it back there too,
carrying the same label until its own weight has been measured.

Judge the scorer by usable clips, not candidates. A scorer that surfaces many candidates
looks productive and costs editor time on each rejection; the right figure is editor
minutes, and publish slots, per clip actually kept.

## Decision rules

- **When chat rate is the only signal available**, count distinct chatters against a
  baseline and send every peak to review, because chat alone is the easiest signal to
  forge.
- **When a raid or a copied-phrase wave is in progress**, suppress the crowd signal for
  its duration rather than scoring it, because a wave is evidence of an arrival, not of a
  moment.
- **When the scorer and the editor disagree repeatedly in one direction**, change the
  weights and record the change with its evidence, because silent retuning destroys the
  only measurement the scorer has.
- **When a signal cannot be computed for a window**, mark that signal unmeasured for the
  window instead of scoring it as zero.

## When not to use

A show small enough that one editor watches every minute back gains little from a scorer;
markers and the editor's eye are enough, and the weights would be tuned on too few
moments to mean anything. And scoring ranks candidates; it never decides publication,
which belongs to the evidence gate.
