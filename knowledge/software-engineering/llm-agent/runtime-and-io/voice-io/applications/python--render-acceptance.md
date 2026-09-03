---
layer: application
type: application
subject: voice-io
technique: render-acceptance
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Runaway-render detection in a local voice studio's Python backend

Voicebox is a local-first voice studio — a Tauri/Rust shell over a Python
FastAPI backend that clones voices and drives several local TTS engines. The
citations below are resolved against commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`. The stack witness is the
`justfile`'s interpreter probe, which prefers `python3.12` and falls back to
`python3.13` then `python3` (`justfile:21`); the container build pins
`python:3.11-slim` (`Dockerfile:35`), so 3.12 is the version the working tree
is developed and run against.

This is the tree that taught the technique. The verification stage exists here,
in production, with all three of its parts — a shape detector, a bounded
seed-derived retry, and an honest failure on exhaustion — and reading it is
what surfaced the hole in the pipeline's terminal state set.

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

`backend/utils/chunked_tts.py:266-303`. The detector is injected as
`runaway_detector` and called on every chunk the backend generates, immediately
after `backend.generate(...)` returns and **before** `trim_fn` and before the
chunk joins `audio_chunks` for concatenation — the technique's placement rule,
satisfied.

On detection:

```python
if retry_depth >= MAX_RUNAWAY_RETRIES or len(chunk_text) <= MIN_RUNAWAY_RETRY_CHARS:
    raise RuntimeError(
        "TTS output remained unstable after retrying smaller text chunks"
    )
```

`MAX_RUNAWAY_RETRIES = 2` and `MIN_RUNAWAY_RETRY_CHARS = 100`
(`chunked_tts.py:23-24`) are the depth bound and the text floor. Past either,
the generation **raises rather than shipping noise** — the exhaustion rule, and
the more valuable half of the ladder. Otherwise it halves
(`retry_max_chars = max(MIN_RUNAWAY_RETRY_CHARS, len(chunk_text) // 2)`),
re-splits, and recurses through the same `generate_one`, so a retried piece is
verified again at depth+1.

The seed is derived, at `:284-288`:

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
same discipline governs the ordinary per-chunk seed at `:335`
(`chunk_seed = (seed + i) if seed is not None else None`), with the comment
stating the intent the technique generalises: *"Vary the seed per chunk to
avoid correlated RNG artefacts, but keep it deterministic so the same (text,
seed) pair always produces the same output."*

## What the tree does not do

- **The detector is opt-in at the call site.** `runaway_detector` is an
  optional parameter, and the guard is `if runaway_detector is not None`
  (`:266`). The technique asks for verification on every render with any
  exemption made loudly; here a synthesis path that forgets to pass the
  detector is silently unverified, and nothing in the module notices. The
  single-shot fast path for short text (`:309-312`, `len(chunks) <= 1`) does route
  through `generate_one` and so is covered when the detector is supplied — but
  that is a property of the caller, not of the module.
- **No measurement backs the thresholds**, as above.
- **The detection log line does not carry the measurement.** `:277-281` logs
  the character count and the retry-chunk count; it does not log where the gap
  was or how long it ran, which is the field data the threshold would need to
  be tuned from. This is the cheapest available improvement in the file.
- **The failure surfaces as a `RuntimeError` string**, not as a distinguishable
  outcome the surface can branch on. It degrades correctly — nothing ships —
  but "unstable output after retries" and "engine crashed" arrive at the UI
  through the same channel.

## The upward lesson

The technique's inversion sentence came from this file. The pipeline standard
already said `failed` means the pipeline broke, and reading `has_tts_runaway`
made it obvious that the pipeline had no vocabulary at all for a render that
succeeded and was wrong — and that a product driving unattended callers ships
that render to a listener with every status green.
