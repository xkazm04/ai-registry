---
layer: technique
type: technique
subject: voice-io
technique: stt-pipeline
status: forged
laws: [failure-not-empty-success, creation-names-reaper, verdict-survives-boundary]
shared_with: []
use_when: [mic denied but the affordance shows nothing, empty transcript while the meter was moving, a partial transcript fired a real action]
---

# The speech-to-text pipeline

Capture-to-transcript is a staged pipeline — device acquisition, level
metering, endpointing, segmentation, transcription, disposition — and each
stage has its own failure modes and its own honesty obligations. The technique
exists because the naive collapse ("open mic, send audio, show text") produces
the characteristic voice-input defects: the user who talked to a dead
microphone for thirty seconds, the transcript that silently lost its last
word, the command that fired off a half-revised partial. Speech-to-text is a
first-class input pipeline and gets the full engineering weight of one — it is
not the cheap sibling of synthesis.

## Permission and device acquisition are states, not errors

The pipeline begins before any audio exists: asking the platform for the
microphone. Three outcomes, all designed:

- **granted** — proceed to capture, and only now show "listening";
- **denied** — a designed state with recovery instructions specific to the
  platform's re-grant path. Denial is remembered, so the product does not
  re-prompt on every visit, and the voice affordance shows *why* it is
  inactive rather than disappearing;
- **no device** — distinct from denial. "You said no" and "there is nothing
  to say yes to" lead to different next steps and must not share an error
  message.

Capturing the denial is not surfacing it. The failure travels up through
layers — the capture primitive, the engine wrapper, the gesture controller,
the surface the user actually pressed — and it is swallowed the moment any
layer in that chain fails to expose it or resets it on the path a denial
takes. The measured failure shape is exactly this: both engine layers
recorded the error correctly, and the controller two layers up neither
exposed an error field nor avoided calling its reset on the
never-went-live path — so the most-used affordances showed nothing,
recorded nothing, and *erased* the evidence. A permission failure is
surfaced only when the surface **the user pressed** shows it; anything
short of that is a swallowed error with extra steps.

The gap between requesting and acquiring is its own visible state (*arming*):
the user must never believe capture is live before audio is actually flowing,
because whatever they say in that gap is lost.

## Metering: prove the microphone hears

From the first frame of capture, the surface shows a **live input level** —
a meter computed from the audio itself (energy per frame, smoothed for
display with fast attack and slow decay so speech reads as motion and pauses
do not read as death). The meter is the pipeline's first honesty device and
its cheapest diagnostic:

- a **moving meter** during speech proves the capture stage end-to-end —
  device, permission, routing, gain — before a single byte reaches an engine;
- a **flat meter** during speech localizes the fault to the audio path (wrong
  input device, hardware mute, OS-level capture block) — a diagnosis that no
  post-hoc "transcription failed" message can deliver, because by then three
  other stages are suspects too.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applied at the acoustic layer: **silence, no-speech, and engine failure are
three different facts** and the pipeline must keep them distinguishable at
every stage. Flat audio in, empty transcript out is *working correctly*;
speech in, empty transcript out is a defect somewhere, and only a pipeline
that observed the levels can tell those two identical-looking outputs apart.

## Endpointing: who decides when the utterance is over

Something must decide where the utterance ends, and the choice is a UX
contract, not an implementation detail:

- **Explicit stop (push-to-talk / tap-to-stop)** — the user decides. Best
  for command input and anything destructive downstream: the user knows the
  utterance is complete, so a truncated capture is impossible by
  construction. The control that stops capture is the same control that
  started it, in the same place, the whole time.
- **Silence-based auto-stop (voice activity detection)** — the pipeline
  decides, by trailing silence past a threshold. Best for hands-free flows
  and dictation. Two obligations: the threshold is generous enough to
  survive thinking pauses (premature endpointing punishes exactly the users
  composing carefully), and the countdown is *visible* — a user watching the
  meter should see that silence is being measured, not be surprised by the
  cutoff.

Hybrid is legitimate (auto-stop with a manual override always present).
Auto-*start* — capture that opens without a gesture on a wake condition — is
a different product with a different consent architecture; do not back into
it from a dictation feature.

### The silence threshold is not one number

"Trailing silence past a threshold" reads as a single constant, and a
pipeline built from that sentence picks one value and then fails at both
ends: a threshold generous enough for a thinking pause mid-sentence keeps
the microphone open for seconds after somebody who said nothing walks away,
and one short enough to close promptly on an empty capture cuts off the
composer. The two cases are different states, and the mature runtimes
condition the rule on **whether anything has been decoded yet**:

- **silence with no content so far** — a longer wait (a few seconds), because
  the user may still be about to speak, and the cost of closing early is a
  lost utterance;
- **silence after content** — a shorter wait (around a second), because the
  decoder has already seen the utterance's shape and a pause after words is
  usually the end;
- **a hard utterance cap regardless of silence** — tens of seconds, after
  which the utterance closes whether or not anyone stopped talking, because
  the engine's bounded input, the latency budget and the transcription
  timeout all count from the utterance's start.

"Content" here means a decoded non-blank token, not a level reading: the
decoder is the arbiter of whether something was *said*, and the meter only
of whether something was *heard*. Each rule is a triple — does it require
content, how much trailing silence, how long an utterance — and the
endpoint fires when any rule holds. Expose the triples as configuration
with a log line naming which rule fired, because "why did it cut me off"
is otherwise unanswerable from the outside.

**The cap applies to explicit endpointing too.** A push-to-talk pipeline has
no silence rule and so tends to have no cap at all — and a hold that runs
long produces one capture whose transcription exceeds the engine's timeout,
losing the whole utterance at the moment the user finished it. The cap is a
property of the engine's bounded input, not of the auto-stop policy, and it
belongs on every path that feeds the engine: close the segment at the cap
(at silence if one is near, with the overlap rule below if not), transcribe
it, and keep capturing.

The detector's own threshold has the same shape one level down. A speech
probability compared against one number flaps at the boundary, so the exit
threshold sits below the entry threshold (a hysteresis band, the same
discipline the corpus applies to any measured signal near a limit), each side
carries a minimum duration before it counts (a short burst is not speech; a
short gap is not silence), and when a speech segment runs past its own
maximum the detector *lowers the bar* for what counts as its end rather than
cutting at a fixed interval — so a forced cut lands at the least speech-like
frame available, which is the segmentation rule below applied by the
detector itself.

## Segmentation: bounded audio, cut where nothing is said

Engines want bounded input — for memory, for latency, and because
transcription quality degrades on very long context. Long captures are
therefore segmented, and the one rule is: **cut at silence, never mid-word**.
A fixed-interval chop splits phonemes across segment boundaries and the
engine hallucinates or drops the halves; a silence-aligned cut (with a small
overlap when no silence arrives in time) costs a little duplicated audio and
loses nothing. Segment order and identity are carried through transcription
so results reassemble in utterance order even when segments complete out of
order.

Captured audio is a resource with a stated reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): buffers live
until their transcript is disposed (accepted, edited, or discarded) and are
destroyed with the disposition. Speech is sensitive material; audio retained
"in case" past its purpose is a liability, and audio *discarded before* the
transcript is accepted destroys the only ground truth a re-transcription
would need. The two failure directions are both reaper failures.

## The latency budget is staged, and each stage buys different trust

| Stage | Budget | What it buys |
| --- | --- | --- |
| capture feedback (meter moves) | perceptual immediacy — one frame | "it hears me" |
| partial transcript appears | about a second | "it understands me" |
| final transcript after stop | a few seconds | "it is worth using" |

The stages are ordered by trust, not by engineering convenience: a pipeline
with instant metering and slow finals feels trustworthy-but-deliberate; a
pipeline with fast finals and no metering feels haunted, because nothing
proved it was listening while it mattered. Spend effort top-down. When the
engine runs long, the surface says so over the *safely captured* audio —
transcription latency must never put the capture itself at risk, and the
user should know the recording is no longer the thing being risked.

## Partial versus final transcripts

Engines that stream emit **partial** transcripts that revise themselves —
each partial may rewrite earlier words as more context arrives. The contract:

- partials are **display-only**, rendered visibly provisional (they replace,
  not append — a revising transcript that appends duplicates itself);
- **only finals cross into consequence**: intent parsing, form values,
  records. A partial that fires an action is a race with the engine's own
  second thoughts;
- the final for a segment supersedes every partial of that segment
  atomically — no interleaving of stale partial text with final text.

## Honesty at the transcript boundary

- **Empty is a claim, not an absence.** A final empty transcript from a
  capture whose levels showed speech is surfaced as "heard audio, produced
  no words" — an engine-side anomaly the user can retry — never as a blank
  field that looks like the user said nothing.
- **Low confidence looks uncertain.** When the engine reports confidence,
  visibly weak spans are marked in the reviewable transcript rather than
  laundered into confident-looking prose. The transcript display is where
  uncertainty is allowed to show; the parsed command downstream is where it
  is no longer allowed to exist.
- **Noise is named.** Engines fed noise produce plausible garbage. A capture
  whose level profile was mostly non-speech deserves a caution on its
  transcript, because the user cannot otherwise distinguish "it heard me
  badly" from "I was in a loud room".

## A stage further down gets a different empty

The rule above — empty is a claim, and an empty final over speech-shaped
levels is an anomaly — is written about the **engine's** output, and it does
not survive being applied one stage later without inverting. When a
[transcript-normalization](./transcript-normalization.md) stage sits between
the transcript and its destination, that stage has an empty result which is
**correct**: filler-only input ("um", a throat-clear, a false start abandoned
immediately) reduces to nothing, and nothing is the right answer.

So a pipeline with a cleanup stage carries two empties that look identical on
the wire and mean opposite things:

| Where | Empty means | Correct response |
| --- | --- | --- |
| engine output, levels showed speech | anomaly — heard audio, produced no words | surface it; offer retry |
| engine output, levels showed silence | the user said nothing | the no-speech state, quietly |
| normalizer output | the words carried no content | drop the segment, silently — a success |

The failure this prevents is specific and it is the one an integration reaches
by default: routing the normalizer's legitimate empty into the anomaly path
above, so the product raises "heard audio, produced no words" every time
somebody clears their throat, and trains the user to ignore the one message
that was load-bearing. Each stage's empty is classified **by that stage**, as
a typed outcome, and the classification travels
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary))
— it is not re-derived downstream from the length of a string.

**And the engine's own empty is not always empty on the wire.** Several
engines report "no speech" as a *token in the text channel* — a bracketed
marker printed where the transcript would be, with a success exit. A
pipeline that classifies the engine's outcome by string length reads that
marker as a one-word transcript, inserts it, and never reaches the anomaly
path it built for exactly this case. Measured on 2026-09-02 in a push-to-talk
product: two near-silent captures came back as a blank-audio marker, the
empty-transcript guard did not fire, and the literal token would have landed
as dictation. The engine adapter recognizes its engine's marker vocabulary
and reduces it to the typed no-speech outcome before anything downstream
sees a string; the full treatment, including the level gate that should run
before a prompted decoder ever sees silence, is in
[decode-time-vocabulary-biasing](./decode-time-vocabulary-biasing.md).
