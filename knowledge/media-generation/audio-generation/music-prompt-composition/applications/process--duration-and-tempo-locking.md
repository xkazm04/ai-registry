---
layer: application
type: application
subject: music-prompt-composition
technique: duration-and-tempo-locking
stack: process
status: forged
verified_on: 2026-11-06
refresh_by: 2027-02-06
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: what YuE2's Max Duration does to length and to the take

The vendor guide for this model states the ceiling behaviour, read directly on 2026-11-06:
"The generation budget is 25 semantic tokens per second of requested duration, and sampling
stops as soon as the model writes the song's end token". When the budget is exhausted, "the
rendered audio can stop abruptly instead of finishing the song". A long prompt shrinks the
budget and "shortens the song instead of failing the run". If the console also reports that
reduction, the guide's remedy is to shorten the style, lyrics or plan, not to raise the
ceiling.

## What was measured

A local run on 2026-11-06 used YuE2 3B (`yue2_3b_int8_convrot`) in ComfyUI 0.42.1, at the
same seed and notation with only the ceiling changed. Distances are against the same song
at ceiling 360. Sound is mean absolute log-mel difference per bar, and notes is 1 minus
chroma cosine per bar.

| Ceiling | Length | Sound | Notes |
|---|---|---|---|
| Song 1, 360.04 | 119.88 s | 0 (identical) | 0 |
| Song 1, 180 | 119.88 s | 0.53 | 0.059 |
| Song 1, 300 | 117.64 s | 1.26 | 0.307 |
| Song 1, 720 | 119.84 s | 0.66 | 0.065 |
| Song 2, 200 | 151.64 s (150.64 s at 360) | 0.75 | 0.061 |
| Song 1, 60 | 60.0 s, cut off | 1.07 | 0.208 |

The forced cut at 60 ended at about -10 dB, where natural endings fade to about -60 dB.

## What it says

Length behaves as the guide says, and the tutorial's test at 180 s agrees. The guide does
not mention the second effect: a ceiling is not neutral to the render. Three of the
generous values on song 1 and one on song 2 produced a different take at nearly the same
length. A consumer that varies this setting between runs, or leaves it to a template
default (120 for text to music and 360 for covers, per the guide), cannot reproduce a take
from seed and notation alone.

## What it does not settle

- Why 360.04 matches 360 while 300 does not was not investigated. At 25 tokens per second
  the two nearest values differ by one token of budget, which may be the reason, but that
  is untested.
- Whether any of these takes is better. The verdict is `unmeasurable` until a person
  listens to a blind pair of two ceilings. The forced cut is the exception: an abrupt end
  is a defect by level alone, measured on one render.
- Other models. Schemes that accept per-section durations behave differently, as the
  technique says.
