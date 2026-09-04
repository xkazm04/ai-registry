---
layer: application
type: application
subject: streaming-output
technique: emit-behind-the-revision-window
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.10
---

# A transcript held one detector-window behind its own producer

Citations are to `microsoft/VibeVoice` at commit
`1541f590c7099820f10ea012f48d2399282df69f`, file
`vllm_plugin/tests/test_api_auto_recover.py`. The stack version is witnessed by
`pyproject.toml:14` (`requires-python = ">=3.10"`).

The producer is a long-form speech-to-text model that occasionally enters a
repetition loop — it begins emitting the same phrase indefinitely — and the
client's job is to show a live transcript anyway. That makes it a non-monotone
producer in the subject's sense, and the client takes neither of the subject's
two original remedies: it does not render checkpoints, and it does not wait. It
streams, append-only, one detector window behind.

## The reach, and where the number comes from

The corrector is a `RepetitionDetector` constructed at the call site with
`min_pattern_len=10, min_repeats=10, window_size=400` — note that these are not
the class defaults (`10 / 3 / 500`), and the call site carries a comment
deriving them together: "Check last 400 chars (can detect 10-40 char patterns
repeated 10 times)". The detector inspects only `self.text[-self.window_size:]`,
so 400 characters is the exact distance it can reach back to invalidate
anything.

The emission cursor is then derived from that, not chosen:

```python
safe_end = max(0, len(full_text) - detector.window_size)
safe_boundary = _find_safe_print_boundary(full_text, safe_end)
```

with the comment "This ensures user never sees content that might be rolled
back". The technique's rule — `lag = <the corrector's window>`, written beside
the cursor, with the corrector named — is satisfied literally: the lag is the
detector object's own attribute, read at the point of use, so it cannot drift
from the detector's configuration.

## The cursor snaps to a semantic boundary, and the boundary is coarser than the reach

`_find_safe_print_boundary` does not return `safe_end`. It returns the last
`},` at or before it — the end of a complete transcript segment in the model's
JSON output — or 0 if there is none. So the realised lag is 400 characters
*plus* the distance back to the previous segment close, exactly the "at least
the reach and usually more" the technique describes.

The stall case is present and is handled by falling back to 0 rather than by a
cap: a stretch with no segment boundary in it holds the cursor at its previous
position while the frontier advances. This tree does **not** implement the
technique's escape-hatch cap, and the consequence is visible in its own error
path — a run that produces no `},` at all shows the user nothing until
completion, at which point the whole transcript is flushed at once
(`if len(full_result) > user_safe_printed_len: print(remaining)`).

## The emitted prefix is binding on the retry, and the code says why

This is the clause the technique calls the half that makes it a mechanism, and
this tree implements it exactly, including the branch for the pre-first-emission
case:

```python
if user_safe_printed_len > 0:
    accumulated_text = full_text[:user_safe_printed_len]
    _log(f"[RETRY from user-visible content at {user_safe_printed_len}]")
else:
    accumulated_text = ""
    _log(f"[NO CONTENT SHOWN TO USER - restart from scratch]")
```

The detector has just computed `good_end` — its own opinion of where the
trustworthy text ends, which is later in the stream than the emission cursor —
and `good_end` is **not** what the retry resumes from. The displayed prefix
wins. `accumulated_text` is then sent back to the model as a partial assistant
message so generation continues from it, which is the technique's "resume from
the cursor, discard the difference".

The second branch is the corollary about the pre-commit window: with nothing
shown, the whole output is still revocable and the client restarts from
scratch rather than resuming from a partial prefix.

## What this realization cannot do

- **It cannot say what its own latency is.** The lag is 400 characters plus a
  segment boundary, and characters are not seconds. A reader deciding whether
  to copy this gets no figure for how far behind the audio the visible
  transcript runs, and nothing in the tree measures it.
- **It has one corrector and therefore never faces the maximum-of-reaches
  rule.** The technique's warning about two correctors with different windows
  is untested here.
- **The recovery escalates sampling temperature (0.2 / 0.3 / 0.4 over three
  retries) rather than fixing the cause**, and after three it prints a terminal
  error. So the stability the lag buys is real and the correctness is not: a
  loop that survives three retries ends the transcript, and everything already
  emitted stays emitted — which is the technique's own "it does not make the
  output correct, it makes it stable", visible as shipped behaviour.
- **It is a test script, not the server.** The mechanism lives in
  `vllm_plugin/tests/`, so the guarantee is the client's and any other consumer
  of the same endpoint — including this repository's own browser demo — gets
  the raw stream with no lag and no binding prefix. The tree therefore also
  demonstrates the drift hazard its own `asr_streaming.py` module docstring
  warns about for a different rule: "a rule that differs between the demo and
  the server is a bug nobody notices until the two are compared side by side".
