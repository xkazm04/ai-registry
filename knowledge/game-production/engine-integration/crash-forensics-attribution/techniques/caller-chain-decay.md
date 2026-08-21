---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: caller-chain-decay
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [weighting stack frames by distance from the crash site, choosing between a frame window and a decay curve, tuning a triage scorer that over-trusts the top frame]
shared_with: []
---

# Caller-chain decay

The concern: how far down a call stack evidence should count, and how much it should count at
each step. The frame that crashed is frequently not the frame at fault — a null dereference
inside a container utility is usually the symptom of a stale handle passed in four frames
above — so a scorer that reads only the top frame attributes half its crashes to whatever
generic utility code the engine happens to bottom out in.

## Decay, not a window

The obvious design is a window: score the top N frames, ignore the rest. It is wrong for one
reason that shows up constantly in practice — it produces a **cliff**. Frame N counts in full,
frame N+1 counts zero, and there is no principled value for N. Engine stacks vary from four
frames to hundreds, and the interesting causal frame sits at wildly different depths depending
on whether the crash went through a scripting VM, a task graph, or a deferred command queue.
A cliff placed by guesswork will sometimes sit exactly between the symptom and the cause.

Confidence in a frame's relevance genuinely does fall with distance, and it falls smoothly.
Model it that way: **frame `i` contributes its raw evidence multiplied by `d^i`**, where `i`
is the index from the crash site (top frame `i = 0`, weight 1) and `d` is a decay factor in
`(0, 1)`. No cutoff, no cliff, no magic N.

## Calibrating the factor

**`d = 0.4` is a good default.** It gives frame weights of 1, 0.4, 0.16, 0.064, 0.026 — the
crash site dominates, the immediate callers carry real weight, and by frame five a single hit
is worth about a fortieth of a top-frame hit. That is the right shape, and the reason it is
the right shape is worth saying as a rule: **the caller chain says who invoked the code, not
who owns the defect. It may corroborate an attribution; it must never outvote the frame the
crash happened in.** Any factor that lets three deep frames overturn the crash site has
inverted the evidential relationship.

Report the factor alongside any score you emit. A score of 7.4 means nothing without the decay
basis that produced it — the same stack under `d = 0.4` and `d = 0.8` yields scores that are
not comparable, and a corpus of historical scores computed under a changed factor is a corpus
of incomparable numbers.

How to move the default:

- **Lower `d` (towards 0.2)** when your crash population is dominated by direct faults — an
  assertion firing in the code that violated its own invariant. Sharper decay, more trust in
  the top frames.
- **Raise `d` (towards 0.6)** when your stacks routinely pass through thick generic layers
  before reaching the crash site: dispatchers, task graphs, script interpreters, deferred
  execution queues. Those layers make the top frames uninformative, and the causal frame is
  reliably deeper.
- **Do not raise it above about 0.7.** Past that the geometric series stops discriminating and
  every frame counts nearly the same; you have re-invented "sum the whole stack", which is
  dominated by whichever subsystem has the most frames in the stack rather than the most
  relevant ones. Stack depth is not evidence.

Re-tune only against held-out diagnosed crashes, and change the factor rarely. A factor tuned
per-crash is a knob for producing the answer you already wanted.

## Index over first-party frames only

Decay is indexed over the frames that can carry ownership evidence — the project's own code —
not over every frame in the capture. Engine, runtime and standard-library frames are filtered
out **before** the index is assigned, not scored and then ignored. The difference matters: a
crash that surfaces through twelve engine frames before reaching project code would otherwise
have its true crash site scored at `d^12`, which is zero for any usable factor. Filter first,
then index from zero at the first frame you own.

The same filter defines the crash site itself: the culprit frame is the first frame the
project owns that carries a source location. Whatever rule you use, **one implementation owns
it** — if the analyser and the signature builder each resolve the culprit their own way, a raw
report and a processed report produce different answers for the same crash, and nothing
downstream will match.

## Interaction with the truncation you cannot see

Crash captures are often truncated — a fixed frame budget, a corrupted unwind, a stack that
blew its own limit. Decay is robust to truncation at the tail (the lost frames were worth
almost nothing) and fatally sensitive to truncation at the *head*, which happens when a
capture layer strips its own frames from the top. If the first few frames belong to the crash
handler itself, index from the first frame that is not handler code, or every weight in the
series is shifted and the crash site is being scored as a caller.

Related: recursion. A mutually recursive fault fills the stack with the same few frames
repeated hundreds of times. Because decay is geometric the repeats contribute almost nothing
after the first several, which is the correct behaviour — but detect the repetition
separately, because a stack that is one cycle repeated is itself a strong diagnostic signal
about the fault class, and it is a signal the scorer will otherwise discard.

## Procedure

1. Filter the capture to first-party frames, then determine the crash site as the first of
   those carrying a source location — skipping crash-handler and unwinder frames.
2. For each frame at index `i`, compute its raw naming evidence per candidate subsystem.
3. Multiply by `d^i` and accumulate per candidate.
4. Retain, per candidate, the highest-weighted contributing frame — it is the one to show a
   human as the reason for the verdict, and it is far more legible than the total.
5. Emit the totals with the decay factor and the frame count they were computed over.

## Decision rules

- When the stack is one frame, decay is inert and the whole verdict rests on a single frame's
  naming evidence. That is usually below any reasonable score floor; let the gate decline
  rather than special-casing it.
- When two candidates tie on total but one accumulated its score from the top three frames and
  the other from frames ten through forty, prefer neither automatically — but surface the
  depth profile, because a human resolves that instantly and a scalar cannot.
- When a stack exceeds a few dozen frames, keep processing all of them. There is no cost worth
  saving and no cutoff worth defending; the decay has already made the tail free.

## When not to use

Do not apply decay to evidence that is not positional. A subsystem named in the fatal message,
a module tag attached by the runtime, or a signature match against a diagnosed crash are
statements about the crash as a whole; they have no frame index and must not be attenuated by
one. Decay governs stack evidence only.
