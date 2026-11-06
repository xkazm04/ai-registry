---
layer: application
type: application
subject: voice-io
technique: render-acceptance
stack: python
status: forged
verified_on: 2026-11-06
verified_against: python@3.12
---

# Runaway-render detection in a local voice studio's Python backend

Voicebox is a local-first voice studio — a Tauri/Rust shell over a Python
FastAPI backend that clones voices and drives several local TTS engines. The
citations below are resolved against commit
`8af7efe62fab8d33e2a5dfbedabaa45f68a5184f`, re-pinned on 2026-11-06 from
`51f49de`. The stack witness is the `justfile`'s interpreter pin,
`python_version := "3.12"` (`justfile:23`), and the container build now agrees
with it (`FROM python:3.12-slim`, `Dockerfile:35`; it read `3.11-slim` at the
earlier pin).

This is the tree that taught the technique. At the first pin the verification
stage existed here with all three of its parts — a shape detector, a bounded
seed-derived retry, and an honest failure on exhaustion — and reading it is
what surfaced the hole in the pipeline's terminal state set. **At the second
pin the third part is gone for one engine class**, and the way it went is the
more useful half of this document (see "Exhaustion now ships the repair").

## The detector

`backend/utils/audio.py:113-147`, `has_tts_runaway`. Thirty-five lines, one
import beyond the standard library (`numpy`), and its docstring states the mode
it hunts:

> Detect speech followed by a long silence and then more output. This shape is
> a reliable signal that a TTS model missed EOS and resumed with hallucinated
> speech or codec noise. Leading and trailing silence do not count because they
> are not bounded by non-silent audio.

The implementation is exactly the technique's ordered triple. It frames the
buffer at `frame_ms=20`, classifies each frame by RMS against a linear
threshold derived from `silence_threshold_db=-40.0`, and carries two variables:
`seen_speech` and `consecutive_silence`. The detection fires only on the
transition *into* speech, and only when speech has already been seen:

```python
if is_speech:
    if seen_speech and consecutive_silence >= max_silence_frames:
        return True
```

That single `seen_speech and` guard is the enclosure rule. Leading silence
never trips it because `seen_speech` is still false; trailing silence never
trips it because the loop ends without another speech frame arriving. The
default `max_internal_silence_ms=2000` is the bound.

Every parameter is a keyword argument with a default — `sample_rate`,
`frame_ms`, `silence_threshold_db`, `max_internal_silence_ms` — which is the
technique's "publish them as tunable inputs, not literals buried in the check"
rule implemented without anyone stating it. The values themselves are
undefended in the tree: there is no comment, test fixture or note recording
what content mix produced 2000 ms and −40 dBFS, which is precisely the claim
the technique says needs measurement. A reader porting this to another engine
or another language should treat both numbers as this product's defaults, not
as physics.

## The retry ladder

`backend/utils/chunked_tts.py:266-312`. The detector is injected as
`runaway_detector` and called on every chunk the backend generates, immediately
after `backend.generate(...)` returns and **before** `trim_fn` and before the
chunk joins `audio_chunks` for concatenation — the technique's placement rule,
satisfied.

`MAX_RUNAWAY_RETRIES = 2` and `MIN_RUNAWAY_RETRY_CHARS = 100`
(`chunked_tts.py:23-24`) are the depth bound and the text floor. What happens
past either is the subject of the next section, because it changed between the
two pins. Below them it halves
(`retry_max_chars = max(MIN_RUNAWAY_RETRY_CHARS, len(chunk_text) // 2)`),
re-splits, and recurses through the same `generate_one`, so a retried piece is
verified again at depth+1.

The seed is derived, at `:293-297`:

```python
retry_seed = (
    chunk_seed + ((retry_depth + 1) * 1000) + i
    if chunk_seed is not None
    else None
)
```

`(depth+1) * 1000 + i` spaces the retry seeds far enough apart that a
depth-2 retry of piece 3 cannot collide with a depth-1 retry of piece 1003,
and every attempt in the tree is a pure function of the original `seed`. The
same discipline governs the ordinary per-chunk seed at `:344`
(`chunk_seed = (seed + i) if seed is not None else None`), with the comment
stating the intent the technique generalises: *"Vary the seed per chunk to
avoid correlated RNG artefacts, but keep it deterministic so the same (text,
seed) pair always produces the same output."*

## Exhaustion now ships the repair

At the first pin, past either bound the generation raised —
`"TTS output remained unstable after retrying smaller text chunks"` — and
nothing shipped. At the second pin (`chunked_tts.py:267-279`, commit
`a2b453a`, released in 0.6.0 as "when a retry cannot split the text further,
the trimmed clip is kept rather than failing") the raise survives only for
engines without a trim step:

```python
if retry_depth >= MAX_RUNAWAY_RETRIES or len(chunk_text) <= MIN_RUNAWAY_RETRY_CHARS:
    if trim_fn is not None:
        # Engines with a trim step (Chatterbox) already cut the
        # silence-then-noise tail; prefer the trimmed clip over
        # failing the whole generation when we cannot split further.
        ...
        return np.asarray(trim_fn(chunk_audio, chunk_sr), dtype=np.float32), chunk_sr
    raise RuntimeError(
```

The branch is live: the multilingual engine carries both `needs_trim=True`
and `retries_runaway=on_mlx` (`backend/backends/__init__.py:366,371`), so on
Apple Silicon a runaway that survives two halvings now ships its trimmed clip.
The production pressure behind it is real — one bad chunk used to fail a whole
long render — and the reasoning in the comment is half right. The trim
(`backend/utils/audio.py:150-237`, `trim_tts_output`) walks forward from the
first speech frame and **cuts at the first internal silence of 1000 ms or
more** (`max_internal_silence_ms=1000`), so it removes exactly the shape the
detector hunts. That is the problem: the shipped clip is never examined again,
and an examination by the same detector would certify nothing, because the
repair cannot produce the shape it removed.

Measured on the tree's own two functions (extracted from `audio.py` by syntax
tree, not imported; synthetic 24 kHz buffers with known ground truth, speech
as noise at about -20 dBFS, gaps as zeros):

| case | detector on raw | detector on repaired | requested speech kept |
| --- | --- | --- | --- |
| text finished, 2.5 s gap, 3 s noise (the case the comment describes) | fires | passes | 100% |
| 2.5 s gap mid-text, the rest of the text resumes | fires | passes | 50% |
| a legitimate 2.2 s dramatic pause | fires | passes | 50% |
| a legitimate 1.3 s pause, below the detector's bound | silent | passes | 50% |
| control: clean render with 0.3 s pauses | silent | passes | 100% |

Re-running the detector on the repaired clip caught **0 of 3** truncations.
The repair's own failure mode is the wrong-length render the technique's last
section says this detector cannot see; what would see it is a check the repair
cannot pass by construction — duration against the text's expected length, or
a transcription round-trip, and the product ships a local recogniser.

The fourth row is the larger finding, and it predates the delta. The trim's
cut bound (1000 ms) sits **below** the detector's (2000 ms), and the trim runs
on every chunk of a trim-flagged engine, not only on exhaustion
(`chunked_tts.py:314-315`). A pause the detector was deliberately tuned to
admit is therefore cut, with everything after it, on the ordinary path, with
no detection, no retry and no log line. The repair is a second detector whose
verdict is destructive and whose bound was set from the failure side — the
tuning the technique forbids for the detector itself.

## What the tree does not do

- **The detector is opt-in at the call site.** `runaway_detector` is an
  optional parameter, and the guard is `if runaway_detector is not None`
  (`:266`). The technique asks for verification on every render with any
  exemption made loudly; here a synthesis path that forgets to pass the
  detector is silently unverified, and nothing in the module notices. The
  single-shot fast path for short text (`:318-321`, `len(chunks) <= 1`) does route
  through `generate_one` and so is covered when the detector is supplied — but
  that is a property of the caller, not of the module.
- **No measurement backs the thresholds**, as above.
- **The detection log line does not carry the measurement.** `:286-290` logs
  the character count and the retry-chunk count; it does not log where the gap
  was or how long it ran, which is the field data the threshold would need to
  be tuned from. This is the cheapest available improvement in the file.
- **The failure surfaces as a `RuntimeError` string**, not as a distinguishable
  outcome the surface can branch on. For engines without a trim step it
  degrades correctly — nothing ships — but "unstable output after retries" and
  "engine crashed" arrive at the UI through the same channel. For engines with
  one, the repaired clip arrives as an ordinary success: the only record that
  it was repaired is a server log line, and nothing reaches the surface.

## The upward lesson

The technique's inversion sentence came from this file. The pipeline standard
already said `failed` means the pipeline broke, and reading `has_tts_runaway`
made it obvious that the pipeline had no vocabulary at all for a render that
succeeded and was wrong — and that a product driving unattended callers ships
that render to a listener with every status green.
