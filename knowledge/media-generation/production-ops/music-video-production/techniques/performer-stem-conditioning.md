---
layer: technique
type: technique
subject: music-video-production
technique: performer-stem-conditioning
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [a generated performer must sing part of a finished track, a generated face mouths backing vocals or an instrumental passage, several performers share one song, a sung shot will be slowed down in the edit]
---

# Performer stem conditioning

> **Render-bound.** The rules below about what a video generator is handed are
> drawn from the singing-animation literature, from live production practice and
> from one practitioner's failure case. They have not been verified on renders by
> this bundle. Treat them as the hypothesis a render pair should test, not as
> measured craft.

Every sung shot is conditioned on the **isolated stem of the voice the performer on
screen sings**, sliced from the master clock to the shot's interval — never on the
full mix. The mix is restored in post from the master, and the generator's own
audio is discarded.

The rule: **the conditioning track holds exactly the voice the face on screen owns,
for exactly the interval the shot covers.** Nothing else that makes a sound belongs
in it.

## Why the mix is the wrong input

A model that animates a face from audio cannot know which voice in a mix is "its"
voice. It moves the mouth to whatever voice-like energy it hears. Handed the full
mix, a lead singer's face mouths the backing vocals, answers its own ad-libs, and
sings along to an instrumental intro, because the input said there was singing
there. The failure is not subtle: it is a face performing parts that belong to
somebody else or to nobody, in a form whose whole contract with the audience is
that the face is singing this song.

Published singing-animation research meets the same problem from the model side.
One music-driven singing-face system separates the input into a voice stream and
an accompaniment stream before driving the face, and reports that learning from
the plain mixed audio severely disrupts the generated mouth movement; it ties lip
movement mainly to the voice, while head pose, expression and eye state respond to
both voice and accompaniment. That is the craft rule seen from inside a model: the
mouth wants the voice, and the accompaniment is interference for the mouth even
where it is useful elsewhere.

## Building the slice

1. **Choose the stem from the vocal activity map.** The track map names, for every
   interval, which voices are sounding. The shot's performer owns one of them —
   lead, a backing part, a featured verse. That stem, and only that stem, is the
   conditioning source.
2. **Cut it on the master clock.** The slice runs from the shot's master in-point to
   its out-point, plus the same handles the segment plan gives the picture, so the
   mouth is already in motion at the head of a phrase rather than starting from
   rest on the first frame.
3. **Keep the silences.** Where the performer's stem is silent inside the slice, the
   slice is silent. Silence in the owned stem is the instruction to keep that mouth
   closed. Do not trim it out, and do not fill it with the backing part.
4. **Where two voices share one face** — a lead with her own ad-libs layered on
   top — decide per shot which of them the face sings, and condition on that one.
   The other lives in the mix and nowhere in the picture.
5. **Discard the generator's audio at acceptance.** The returned clip's soundtrack,
   whatever it contains, never reaches the deliverable. The master does.

## The body still hears the beat

The same research is the warning about over-applying the rule. Head motion,
expression and the body's movement are driven by the music as well as the voice,
and a face conditioned on a dry vocal may sing in sync while moving like someone
who cannot hear the band. Two consequences, both render questions:

- For a sung close-up, where the mouth is the claim, the stem rule wins.
- For a dance or movement shot where no mouth is readable, the mouth is not the
  claim and the stem rule has nothing to protect; conditioning on the instrumental
  bed, or on nothing and placing the movement on the grid in the edit, may serve the
  body better. Which of these a given generator rewards is unverified.

## A slowed shot needs a sped-up slice

Live production solved slow-motion lip sync long ago, and its arithmetic carries
over. To show a singer in half-speed slow motion while staying in sync with the
song at normal speed, the song is played back on set at double speed, the camera
runs at double frame rate, the performer mouths to the fast playback, and the
footage is slowed by half in the edit. Every played-back syllable then lands on the
original timing.

The generative equivalent: **if a shot will be slowed by a factor in the edit, its
conditioning slice is the master slice sped up by that same factor**, so that the
generated mouth, slowed, lands on the master's words. Speed it with a
pitch-preserving stretch, because a face model reads the voice's phonetic content
and a chipmunked vocal is a different voice. Two limits carry over from the set as
well. A slowed shot needs frames to spare — a half-speed shot from a clip generated
at the delivery frame rate shows half as many distinct frames — so either the
generator supplies a higher rate or the shot is interpolated, and either is checked.
And practitioners use slow-motion sync only on slow phrases, because a fast phrase
at double speed is unsingable; a generator handed a compressed fast phrase is likely
to blur it in the same way.

## The stem is a typed input, and it owns the mouth

Once the mouth is driven by audio, prose describing what the mouth says or when it
moves is a second authority over that channel. Keep the shot brief to what the
audio cannot carry — where the performer looks, how intense the delivery is, what
the body does — and leave lyric words and lip action out of it. Stating in the brief
that the performer sings the attached audio is a pointer to the channel, not a
second instruction within it.

## Decision rules

- When a shot shows a readable mouth, condition it on that performer's stem for the
  shot's interval, never on the mix.
- When the stem is silent inside the slice, keep the silence; never fill it with
  another voice to "give the face something to do".
- When a shot will be retimed in the edit by a factor, stretch its conditioning
  slice by the inverse factor with pitch preserved, and generate or interpolate the
  extra frames the slowdown needs.
- When no stems exist, separate the mix, audit the separated vocal by ear for
  bleed (a ghost of the backing part is an instruction to mouth it), and record in
  the shot's provenance that the stem was separated rather than supplied.
- When a shot is a movement shot with no readable mouth, the rule does not bind;
  choose the conditioning by what the body needs, and record the choice.

## When not to use it

A pipeline whose generator takes no audio — the face animated from text or from a
motion reference — has no conditioning channel, and its sync is an edit-time
problem of choosing takes. A performer seen only from behind, in silhouette or too
small to read a mouth makes no lip claim. And a real recorded performance keeps its
own sync and needs none of this.

## Sources

Singing-face conditioning: Liu et al., a music-driven expressive singing-face
synthesis paper (arXiv 2303.14044), its full text read verbatim 2026-10-05. The
ablation sentence, as written: "if we just learn singing facial dynamics from plain
music (Single-stream), the generated mouth movements are severely disrupted by the
background music (e.g., the mouth still keeps open during silence)". The lip-to-voice
and head/expression/eyes-to-both attribution is the paper's stated premise ("we argue
that the lip movement is majorly related to the voice signal"), not a measurement. Slow-motion playback:
Janney, "4 iconic music video effects" (2018), a practitioner blog post on a
stock-media publisher's site (double-speed song, double frame rate, footage slowed
by half), fetched 2026-10-05; that slow-motion sync is reserved for slow-paced
lyrics is from a videographers' forum thread seen in search results, not fetched. The
ad-lib and instrumental-intro failure is the originating practitioner's own report,
not a measurement. Pitch-preserving stretch and frame-supply for slowed shots are
training-data convergence. No generator behaviour in this document has been rendered.
