---
layer: application
type: application
subject: voice-io
technique: stt-pipeline
stack: rust
status: forged
applied: code
ab_verdict: better
proof: ab-paired
verified_on: 2026-09-02
verified_against: rust@1.97.1
---

# The whisper sidecar at the transcript boundary — one shipped fix, one owed cap

The React-side application for this technique covers capture, hold-to-talk
and the missing meter. This one is about the other end of the same
pipeline: the sidecar adapter in `src-tauri/src/companion/stt/whisper.rs`,
which spawns the engine, joins its stdout into a transcript, and decides
what an empty result means. Two of the technique's amendments from
2026-09-02 land on it — the engine's no-speech verdict arriving as text, and
the utterance cap that explicit endpointing forgets.

## Shipped: the engine's empty was never empty on the wire

The adapter had the right rule and the wrong instrument. Its comment says a
zero-exit run with empty stdout "used to return an empty string as a
successful transcript — the caller then silently inserted nothing", and the
fix surfaced that as a typed error so the UI could say "didn't catch that".
But the engine does not print nothing on silence. Run with the product's
own flags against the product's own catalog model, two near-silent captures
(a half-second tap, a two-second empty hold) each returned a bracketed
blank-audio marker with exit 0. The guard compared string length, saw a
one-word transcript, and returned it — so the case it was written for had
never once reached it, and the literal marker would have landed as
dictation.

**The change** is in the transcript cleanup: a token that is an engine
non-speech marker — a lone bracketed all-caps tag, or a bracketed lowercase
event word from a short list — is dropped before the join, so a silent
capture reduces to the empty string and reaches the existing typed path.
The check is on the marker's shape, not on a list of every string the engine
might print, and a bracketed word in ordinary case inside a sentence is left
alone.

**Proof, `ab-paired`.** Arm A is the function as it was; arm B is the
function as shipped. Same inputs on both sides: the two verbatim silent
outputs from the engine run above, a marker beside real speech, and two
bracketed ordinary words.

| Input | A | B |
| --- | --- | --- |
| ` [BLANK_AUDIO]` (verbatim, 0.5 s tap) | `[BLANK_AUDIO]` returned as transcript | empty, typed no-speech error |
| ` [BLANK_AUDIO]` (verbatim, 2.0 s hold) | same | same |
| `[BLANK_AUDIO] one` | `[BLANK_AUDIO] one` | `one` |
| `call [him] later` | unchanged | unchanged |
| `(a) first` | unchanged | unchanged |

2/2 silent inputs move from "inserted as text" to the no-speech outcome;
3/3 speech inputs are unchanged. The unit test carries the verbatim engine
output as its fixture. The crate's own test run could not compile on this
machine — its build script stops on a capability file naming a plugin
permission the manifest does not declare, before any source is built, and
the error names no file this change touched — so the arms were run as a
faithful standalone reduction of the two functions and their tests under
the same compiler, the pattern earlier applications against this tree used.

## Owed: the utterance cap that explicit endpointing forgets

The capture side is hold-to-talk, so the pipeline has no silence rule and,
as the amendment predicts, no cap either: nothing in the capture hook bounds
how long a hold may run, and the adapter waits on the engine with a fixed
two-minute timeout. Those two facts together are the failure the amendment
names — a long hold produces one capture whose transcription exceeds the
timeout, and the whole utterance is lost at the moment the user released
the control. This was walked as a simulation, three cases from the tree:

1. **A quick accidental tap** (measured above) — under A, a blank-audio
   marker as text; under B, the no-speech outcome. Already resolved by the
   shipped change; the cap is not involved.
2. **A normal three-second answer** — identical under both policies; the
   cap never fires. What would falsify the prediction: a cap set low enough
   to split a sentence, which the amendment forbids by placing it in the
   tens of seconds.
3. **A hold that runs past the engine's budget** — the two-minute timeout
   constant exists because this happened. Under A the timeout fires and
   returns an error carrying no transcript; under B the capture closes at
   the cap, at silence if one is near, that segment transcribes while the
   hold continues, and the user loses nothing. What would falsify the
   prediction: an engine whose latency is not roughly linear in capture
   length, so a capped segment would not reliably finish inside the budget.

Verdict `better`, filed as the project's next change rather than shipped:
the cap belongs in the capture hook, which is a different language and a
different file from this application's stack, and it needs the visible
countdown the technique requires, which is UI work a reviewer should see.

## What this realization cannot do

It cannot measure the product's own path end to end: the engine was run
outside the app with the app's flags, and the UI's "didn't catch that"
surface was not exercised. The level gate the technique places *before* the
engine still does not exist in this tree, so the marker check is currently
the only silence classification on the input side, doing a job it was
designed to back up rather than to own.
