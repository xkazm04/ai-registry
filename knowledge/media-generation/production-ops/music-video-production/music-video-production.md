---
layer: golden-path
type: golden-path
subject: music-video-production
status: forged
use_when: [making a video for a song that already exists and will not change, a generated performer must sing a finished track in sync, planning shots and cuts from a song's structure, a song is longer than a video generator's clip cap]
techniques:
  - track-map-before-treatment
  - form-follows-what-the-track-gives
  - segment-on-the-master-clock
  - coverage-across-the-phrase
  - cut-rate-follows-the-section
---

# Music video production

A music video is the one produced film whose soundtrack is **finished before the
first frame exists, belongs to somebody else, and may not be touched**. Every other
form in this bundle negotiates with its audio. A trailer chooses its cue and may
trailerise it; a demo film generates its narration and measures it; a scored cut
spots music against picture and can re-brief a cue that does not land. Here the
recording is the client's product. It is never re-cut, re-timed, re-mixed or
regenerated, and the picture exists to sell it. That single fact decides the
craft: the song is not an input to the film, it is **the clock the film runs on**,
and every decision downstream is addressed in that clock's units.

The naive method is familiar and it fails in a recognisable way. Generate clips
that look good, drop the song underneath, and slide the clips around by ear until
the cuts feel right. Three things break at once. The cuts land near the beat rather
than on it, because a cut placed by eye against a waveform is a guess, and a guess
repeated across two hundred cuts is a film that feels slightly drunk. The performer
sings to whatever audio the generator was handed, and a mix carries voices that
are not hers. And the song is longer than any generator will
emit in one request, so it arrives in pieces whose seams were chosen by the clip
cap, each piece on its own little clock, drifting against the master by an amount
nobody measured until a lip visibly misses a word in the second chorus.

Two inversions replace it, and a third question is still open:

> **The track is analysed once into a map, and every shot is addressed in the map's
> units. Every piece of picture carries its offset on the master clock as data, and the
> cut is placed by that offset, never by eye.**

## The track is given, so the film starts with a map

Because the recording is fixed, its structure can be known completely before a
frame is spent, and it should be: section boundaries, a beat and bar grid, an
energy curve, and, for every voice in the song, when that voice is singing. That
map is the brief every later stage reads ([track-map-before-treatment](./techniques/track-map-before-treatment.md)).
The treatment is written against it, the shot list is addressed in it, segments
are cut on it, and the editor's cut points come from it. A production without a
map has not removed the analysis; it has moved it into the edit, where it is done
by ear, once per cut, and never written down.

The map also decides what kind of film this can be. The form is chosen from a
ladder — visualizer, lyric video, performance, narrative, concept, and the hybrid
where verses tell and choruses perform — by two facts rather than by taste: what
the track gives (vocal or instrumental, lyrics that tell a story or a hook that
repeats, length) and what the pipeline can keep in sync
([form-follows-what-the-track-gives](./techniques/form-follows-what-the-track-gives.md)).
A treatment that demands a performance from a pipeline that cannot hold lip sync
for a whole verse is a treatment that will be re-written in the edit, at the most
expensive moment available.

## Sync is a claim the audience can check

A mouth on screen singing a word is the one element of a music video every viewer
can verify against the soundtrack, and the tolerance is small: sound running ahead
of picture is noticed within a few tens of milliseconds. So a sung shot is a
precision instrument. Where the generator is driven by audio, the open question is
what that audio should hold: the full mix, or only the voice the face on screen
owns, over only the shot's interval. The singing-face literature reports that a
model trained on the plain mix keeps the mouth open through silences, and one
practitioner reports a face mouthing ad-libs and an instrumental intro until it was
handed the isolated lead. This bundle has rendered the comparison once, on one
reference-conditioned model, at one seed and without a seed control. The face did
not mouth the instrumental bed with either input. Under the full mix it opened late
in a second voice's ad-lib, where the stem-conditioned face stayed closed. A
reviewer preferred the stem-conditioned clip at full length and could not separate
the two in mouth close-ups. That is a direction, not a rule, so the corpus does not
yet carry a technique for it. Until it does, keep the per-voice activity map anyway,
because the seams and the cut points read it whatever the generator is handed.

The film arrives in segments because the song is longer than the clip cap. The
segments are cut on phrase boundaries from the map, with handles, and each carries
its master-clock offset as data, so reassembly is arithmetic rather than judgement
([segment-on-the-master-clock](./techniques/segment-on-the-master-clock.md)). The
drift that a placement by eye would hide is computed, not felt.

## The editor owns the cut points

Live music-video production shoots each setup against playback of the whole song
and cuts across setups in the edit; every take is in sync with every other because
all of them ran against one clock. Generated production keeps that property only if
it is built deliberately: each phrase is generated from several setups under the
same conditioning slice, so any cut point between them is already in sync, and the
cut points come from the map rather than from the generator
([coverage-across-the-phrase](./techniques/coverage-across-the-phrase.md)). A
generator asked to cut between its own angles places those cuts on its own clock;
the result is a useful scouting pass and an unusable final cut.

How fast the angles may follow each other is set per section from the map, on bars
and downbeats rather than on every onset, and fast cutting stays legible only while
the subject holds one screen position across the cuts
([cut-rate-follows-the-section](./techniques/cut-rate-follows-the-section.md)).

## The order of the work

Map, form, cast and sets, segment plan, coverage, cut, deliver. The order is a
dependency order, not a preference. The form cannot be chosen before the map says
what the track gives. Casting and set building follow the form, because a concept
film and a performance film need different people and different rooms. The segment
plan needs the map's phrase boundaries and the form's shot list. Coverage needs the
segments. The cut needs coverage on every phrase it will cut across. A production
that generates hero shots before the segment plan exists has spent its budget on
material whose placement is undecided, and the edit will either bend the plan
around those shots or discard them.

## The master is delivered untouched

The deliverable's audio is the master recording, bit for bit. Nothing the pipeline
produced is mixed into it: not the generator's returned audio, not a stem used for
conditioning, not a re-normalised copy made for analysis. Loudness is the label's
decision and was made when the master was signed off; re-normalising it to a
platform target is a change to somebody else's product, and a platform that wants
a different loudness will apply its own. Every generated clip's own audio is
stripped at acceptance. Where a derived cut needs a shorter version of the song,
that edit is the rights holder's to approve, not the video editor's to improvise.

Where a destination does demand a level the master does not meet, and the rights
holder agrees to meet it, the one admissible correction is **a single linear gain,
capped by true-peak headroom**: the smaller of "reach the target" and "keep the
peak under the ceiling". A dynamic normaliser is never admissible, because it
rides the gain through the song and flattens exactly the section contrast the
picture was cut against; a chorus planned to hit harder than its verse arrives
barely louder than it. Two traps make this easy to miss. A normaliser's
"linear" mode can fall back to dynamic without saying so whenever the gain the
target asks for would breach the peak ceiling. And a whole-track loudness-range
figure barely moves under dynamic normalisation, so the check that sees the damage
is integrated loudness per section of the map, master against deliverable. On one
verse-and-chorus test with little peak headroom, a single-pass normaliser took the
contrast from 8.2 dB to 2.7 dB, its linear mode to 3.0 dB, and a peak-capped gain
kept all 8.2 dB, while the whole-track range read 8.5 against 8.8. That is one
synthetic measurement, not a survey.

A track the producer does not own needs a synchronisation licence before picture is
set to it, and for a generated track the provenance record decides whether it can
be used at all. Both are preconditions, checked before the map is drawn, and the
record that answers them is the one generated-music-acceptance already specifies
in its rights-and-provenance-record technique; this subject does not restate it.

## What this subject does not own

**Making and accepting the track.** Briefing a music generator, its section plan,
and the acceptance gates on what comes back belong to music-prompt-composition and
generated-music-acceptance. This subject starts when the track is final. The seam is
the word *final*: if a note on the video can still change the song, the production
is still in the music subjects, and the map drawn now will be drawn again.

**Casting, angles and sources.** The recurring performer — face, wardrobe,
reference sheets, the instruments that measure whether identity held — is
character-identity-continuity's. What a low angle or an orbit means is
cinematic-language's. Whether a set is invented by the video model or built as an
image-generated plate, and the conditioning ladder for any shot, is the
generated-shot-sourcing technique of video-assembly. This subject decides *which*
shots a phrase needs and *when* they play; those subjects decide how each shot is
made to look right.

**Assembly in general.** One clock, lanes that do not collide, drift measured at
head and tail, rate mismatch corrected at the source: video-assembly owns all of it,
and its drift-correction technique is the general case of the arithmetic segment
planning uses here. Its music-spotting technique runs the opposite direction —
music placed against a locked picture — and is the right tool only when the video
is the product and the music serves it. The rule for picking is which of the two is
locked first. Picture locked, music chosen to fit: spotting. Music locked, picture
made to fit: here.

**Trailers and demo films.** cue-first-assembly in trailer-structure and
audio-first-beat-pacing in live-system-demo-film both put the audio first, and both
leave the audio a choice: a cue is selected and may be trailerised, a narration is
generated and can be re-synthesised. Neither has a face whose mouth must match a
voice. Where the audio can still be changed to suit the picture, those subjects
govern; where it cannot, this one does.

**Story and derived cuts.** Whether a narrative film needs a story engine, and
which one, is narrative-engine-selection's. This subject decides whether the video
has a story at all and how much screen time each section gives the performance
against it. The thirty-second social cut derived from the finished video is a
re-authorship problem owned by platform-format-adaptation; trimming the video
proportionally produces exactly the failure that subject exists to prevent.

## What a principal practitioner holds true

- The song is the clock, and it is somebody else's. Nothing in the pipeline may
  change it, and every timing in the production is an address on it.
- A cut placed by eye is a guess. Shots are addressed as section, bar and beat,
  resolved to master time from a map drawn once.
- Tempo is an estimate with octave siblings. The level at which the bar lives is a
  decision someone makes and writes down, not the first number a detector printed.
- The form is decided by what the track gives and what the pipeline can keep in
  sync. A performance the pipeline cannot hold is a performance that will be cut
  around in the edit.
- Where a generator is driven by audio, what it hears is what it may mouth. Whether
  it should hear only the owned voice has been measured once and is still open.
- A segment that does not carry its master offset as data will be placed by eye,
  and the error will show on the first held word.
- Coverage is in sync by construction or not at all. The editor owns the cut
  points; a generator's own cuts are scouting.
- Fast cutting is legible when the eye does not have to search. Before cutting
  faster, hold the subject still on the screen.
- The master is delivered bit-identical, and every generated clip's audio is
  discarded.

## The techniques

- [track-map-before-treatment](./techniques/track-map-before-treatment.md) — the
  locked track analysed once into sections, a bar grid, an energy curve and a
  per-voice activity map on the master clock.
- [form-follows-what-the-track-gives](./techniques/form-follows-what-the-track-gives.md)
  — the ladder of forms, chosen by the track's content and the pipeline's sync
  capacity, cheapest rung first.
- [segment-on-the-master-clock](./techniques/segment-on-the-master-clock.md) —
  phrase-boundary segments with handles, master offsets carried as data, and the
  drift arithmetic that checks them.
- [coverage-across-the-phrase](./techniques/coverage-across-the-phrase.md) —
  several setups per phrase under one conditioning slice, so the editor's cut
  points are already in sync.
- [cut-rate-follows-the-section](./techniques/cut-rate-follows-the-section.md) —
  cut frequency set per section on bars, and the screen-position check that keeps
  fast cutting legible.

Cross-cutting invariants these techniques cite live in [`_laws.md`](../../_laws.md).
