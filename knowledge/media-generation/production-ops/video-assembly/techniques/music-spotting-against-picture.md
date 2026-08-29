---
layer: technique
type: technique
subject: video-assembly
technique: music-spotting-against-picture
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [deciding where music enters and exits a cut, briefing a music generator or composer per cue, reviewing a scored cut that feels wallpapered, the generator emits picture and its whole soundtrack together as one inseparable output]
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

   Read that as a rule about the cue's *address*, not about its storage. The
   address must resolve to a time on the master clock and must stay free to
   resolve inside a scene; how it is held is a separate question, and the
   stronger answer is a derivation over the picture — a structural mark plus an
   offset — rather than a constant somebody read off. Two defects are being
   forbidden here, not one: a cue positioned by a scene *reference* the renderer
   cannot turn into a second, and a cue whose typed number nothing recomputes
   when the picture is retimed. Both put the cue in the wrong place; only the
   second looks correct while doing it. Storing the derivation costs expressing
   mid-scene entries and exits as offsets instead of bare times, and buys
   re-derivation on every retime — pay it, because a cut is retimed far more
   often than a cue is moved by hand. An absolute time against a structural mark
   is one form of the derivation, not an alternative to it.
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
  rule (a set attenuation while voice is present — a working range of six
  to twelve decibels covers most factual mixes — restored in the gaps),
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

## When the soundtrack is not separable, spotting moves upstream

The section above assumes the generated cue arrives as its own object, to be
placed on its own lane against a picture that already exists. A second class
of generator breaks that assumption completely: it emits picture, dialogue,
effects and score **together, as one output**, synchronized by construction
and unmixable afterwards. There is no music lane to duck, no voice lane to
protect, and no way to reject the score without rejecting the performance it
sits under. Every rule in this technique that operates by adjusting levels or
by placing a cue on the clock becomes unavailable at once.

What survives is the part that was never about the mixer: **every region of
the clock still needs a music decision with a stated purpose.** Only the
moment at which the decision becomes binding has moved. It is now made
*before* generation, and its only expression is a sentence in the shot brief.
Three shifts follow.

- **The cue list is addressed in shots, not in timecode.** A joint generator's
  atomic unit is the shot, so a cue cannot enter mid-shot or exit mid-shot
  without regenerating the shot. Spot the sequence at brief time, then write
  each shot's music decision into that shot's own brief: present and what it
  is doing, or explicitly absent. "No prominent background music" is a cue
  list entry, and it has to be *written*, because a generator asked for a
  scene with no opinion about score will supply one.
- **Ducking is stated as an instruction, not automated as a rule.** The fixed
  attenuation under narration has no implementation here. Its replacement is a
  clause in the brief that tells the generator what the mix priority is —
  score absent or minimal wherever a character speaks, foreground effects
  named specifically enough that the model does not resolve them into a bed.
  It is weaker than an automated duck and it is the only lever there is; treat
  the resulting balance as a thing to verify on the returned clip, not as a
  thing the instruction guaranteed.
- **The purpose sentence gains a second reader.** It used to brief whoever
  produced the cue. It now also constrains the *picture*, because one prompt
  produces both. A shot briefed for a score that swells is a shot whose action
  will be composed to earn the swell, which is a better default than the
  separated pipeline usually gets — and a worse one when the brief's music
  intent and its dramatic intent disagree, because there is no longer a mix
  stage where somebody notices.

The rationing argument is unchanged and gets sharper: with no post-hoc
control, a sequence briefed with music in every shot is a sequence that will
come back scored end to end, and the moment that needed lift arrives
pre-spent with no remedy short of regenerating it. Alternating scored and
unscored shots is how dynamics are held, and it is a decision taken in the
brief, once, before anything is rendered.

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
