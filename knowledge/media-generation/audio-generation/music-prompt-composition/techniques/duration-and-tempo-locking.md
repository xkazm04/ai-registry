---
layer: technique
type: technique
subject: music-prompt-composition
technique: duration-and-tempo-locking
status: forged
laws: [causality-over-sequence, unmeasured-is-not-pass]
shared_with: []
use_when: [briefing a cue that must hit picture events, translating a cue list row into a generator brief, a delivered cue is the right music at the wrong length, choosing a tempo so musical accents land on cuts, a generator's duration setting is a maximum rather than a target, a song stops abruptly at its duration limit]
---

# Duration and tempo locking

A standalone piece owns its clock. A cue against picture rents its clock
from the cut, and the brief must say so in numbers: entry and exit from the
cue list upstream, **duration to the second**, and — when a picture event
must land on a musical accent — a tempo chosen so the bar math puts an
accent there. This technique is the translation layer between a spotting
row ("cue enters at the turn, 38 seconds, ducks under narration, hard out
on the door") and a brief a generator can execute exactly.

## The bar math

Musical accents arrive on a grid. At tempo B (beats per minute) in
four-beat bars, a bar lasts `240 / B` seconds; a downbeat is available
every bar, a phrase accent typically every four or eight bars. To land an
accent on a picture event at T seconds after the cue's entry, choose B so
that T divides into whole bars: a hit needed 24 seconds in fits tempos of
80 (8 bars), 90 (9), 100 (10), 110 (11), 120 (12) — the choice among them
is a style decision, and the brief states both the tempo and what it was
chosen to hit, so a retimed picture can re-derive rather than guess.

Two consequences worth stating plainly:

- **Lock one edge, float the other.** Both edges locked plus a fixed tempo
  over-determines the cue; the standing doctrine from the spotting craft
  applies — entries are placed, exits are shaped, and tails get explicit
  permission to ring past picture or an explicit hard out.
- **Structure serves the clock, not the reverse.** A 38-second cue is not a
  song compressed; it is one or two sections doing one job. Brief the
  section plan from the duration (one build section of 26 seconds, one
  release of 12), never write the plan first and hope it sums.

## Duration is a delivery gate, not a hope

Schemes that accept per-section durations execute them closely but the
delivered file is still measured: total length, and — where an accent was
the point — the accent's actual offset. A cue that is right at the wrong
length fails acceptance even when it is beautiful, because the timeline it
was briefed against cannot stretch. The measurement is seconds against the
cue list row; unmeasured is not pass, and "sounds about right" is
unmeasured.

## When the duration control is a ceiling

Some generators treat requested duration as a generation budget. Sampling
ends when the model writes its own end, so length is a sampled outcome, and
that control cannot lock a cue to picture. Set it well above what the lyrics
need and measure what comes back. A run that exhausts the budget stops
abruptly: a broken ending caused by the ceiling and not by the brief, so
raise the ceiling instead of re-briefing. The exception is a prompt that has
already drawn the budget down, because the brief's own text can claim the
same room. There, shorten the brief.

The ceiling is not neutral either. On the one model measured, at the same
seed and plan, moving a generous ceiling changed the audio on two of two
songs while length held within about two seconds; identical settings
reproduced exactly. Those are objective distances with no listening verdict,
so they say the takes differ and not which is better. A reproducible take
records its ceiling with its seed and plan.

## Ducking is a mix rule, not a brief line

A cue that will sit under narration is briefed *thinner* (sparser
instrumentation, restrained motion in the narrated region — style-level
decisions this subject owns), but the duck itself — attenuation while voice
is present — is automation at the mix, owned by the assembly craft. Do not
ask the generator to "get quieter when someone talks"; it cannot hear the
narrator, and the request spends style budget on a mix problem.

## Decision rules

- When a cue must hit a picture event, lock tempo and entry and float the
  tail, because both edges locked makes the cue unproducible at exact
  duration.
- When the picture retimes, re-derive duration and tempo from the
  structural marks before re-briefing, because regenerating against stale
  times spends the money twice — the spotting craft's rule, inherited
  whole.
- When no picture event depends on the cue's interior, lock duration only
  and leave tempo to the style, because an unnecessary lock narrows the
  model for no one.
- When a run on a ceiling-style control ends abruptly, raise the ceiling and
  keep the brief, unless the brief already shrank the budget, because the
  fault is the budget's (one model, one forced cut).
- When a take must be reproducible, record the duration ceiling with the seed
  and plan, because a different ceiling can be a different take (one model,
  two songs, objective distance only).
- When the delivered cue misses its length, treat it as a failed take, not
  material to time-stretch — stretching audio to fit is a repair with an
  audible cost, and the brief had the number all along.

## When not to use this

Standalone pieces — nothing in the picture rents their clock; lock nothing
and let "auto" length breathe. And for a cue whose picture is still
structurally fluid, the spotting craft's own rule governs: brief provisional
cues only where production lead time demands it, marked as provisional, so
nobody locks a tempo to a cut that will move.
