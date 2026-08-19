---
layer: technique
type: technique
subject: video-assembly
technique: music-spotting-against-picture
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [deciding where music enters and exits a cut, briefing a music generator or composer per cue, reviewing a scored cut that feels wallpapered]
---

# Music spotting against picture

Spotting is the session — human or machine — where the cut is walked from
head to tail and every region of the clock gets a music decision: a cue with
an entry point, an exit point, and a stated purpose, or a deliberate
silence. The output is a cue list against timecode, and the discipline is
that **every cue is an answer to "what is this music doing for the story
here?"** A cue that cannot answer is wallpaper, and wallpaper is cut.

The technique exists because the naive alternative — one bed of music under
the whole video — is cheap, common, and corrosive. Continuous music flattens
the cut's dynamics: if everything is scored, nothing is emphasized, and the
one moment that needed lift arrives pre-spent. Spotting is rationing.

## The procedure

1. **Walk the locked picture, not the plan.** Spot against the cut as it
   exists — real scene boundaries, real narration timing. Spotting against
   the script places cues on durations that will move.
2. **Mark in and out points as times on the master clock**, not as scene
   references. A cue may enter mid-scene and exit mid-scene; scenes are
   context, the clock is the address.
3. **Attach a purpose to each cue** in one sentence, written for the person
   or model who will produce it: what it builds toward, what it must not
   overwhelm, what happens at its edges ("ducks under narration", "tail
   rings past picture — intended"). The purpose sentence is the brief; tempo
   and style serve it.
4. **Decide the silences explicitly.** Every unspotted second should be
   unspotted on purpose. Sum the three states — scored, refused-or-failed,
   silent — over the whole clock and read the totals as a design review:
   a cut that is 100% scored has usually not been spotted at all.
5. **Align entries to structural beats, not shot edges.** Music entering at
   the argument's turn lands as meaning; music entering at an arbitrary cut
   lands as noise that started. This is the causality law applied to sound:
   the cue's entry should have a "therefore" behind it.

## Edges and levels

- **Entries are placed, exits are shaped.** An entry is usually a point; an
  exit is usually a decay. Budget for tails — a cue whose written exit is
  the last frame of its scene will either end abruptly or overhang, and the
  spotting note should say which is intended.
- **The voice lane always wins.** Music under narration ducks by a fixed
  rule (a set attenuation while voice is present, restored in the gaps),
  automated rather than hand-keyed per collision. A spotting note that says
  a cue "sits under" a narrated region implies the duck; say it anyway.
- **Adjacent cues need a relationship.** Two cues that meet need a stated
  joint — hard cut on a downbeat, crossfade, or a breath of silence.
  Unstated joints get resolved by accident at mix time.

## Spotting generated music

When cues are produced by a generative model, spotting gains one obligation
and keeps all others: **the cue request is the purpose sentence plus the
hard constraints** (duration to the second, tempo if picture-locked events
depend on it), and a refused or failed generation is a spotting outcome, not
an exception — the region reverts to silence and is labeled as
refused-silence, distinct from chosen-silence, until re-spotted or
re-briefed. Do not quietly widen a neighboring cue to paper over the hole;
that converts a visible provider failure into an invisible design change.

## Decision rules

- When a region has no answer to "what is the music doing for the story",
  spot silence, because unmotivated music costs the moments that earned it.
- When narration is dense, thin the music, because two foreground channels
  halve each other.
- When a cue must hit a picture event, lock tempo and entry to the event's
  time and let the cue's tail float, because both edges locked makes the cue
  unproducible at exact duration.
- When the picture is retimed after spotting, re-derive every cue's in/out
  from the structural marks they were attached to before re-briefing any
  music, because regenerating cues against stale times wastes the spend
  twice.

## When not to use this

Ambient or observational pieces that deliberately run one continuous sound
world are not spotting failures — there the "cue" is the whole piece and
the spotting decision was made once, globally, on purpose. And do not run a
full spotting pass on a cut whose picture is still structurally fluid;
spot-in-rough only the cues whose production lead time demands it, and mark
them as provisional so nobody mixes against them.
