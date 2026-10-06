---
layer: technique
type: technique
subject: music-video-production
technique: track-map-before-treatment
status: forged
laws: [unmeasured-is-not-pass, typed-input-owns-its-channel]
shared_with: []
use_when: [starting a video for a finished track, writing a treatment or shot list against a song, a cut lands near the beat but not on it, deciding which shots need a singing performer]
---

# Track map before treatment

The locked track is analysed once, before any treatment is written, into a
**map on the master clock**. The map is the brief every later stage reads, and it
has four layers:

1. **Sections** — intro, verse, pre-chorus, chorus, bridge, breakdown, outro —
   with their boundaries as master times.
2. **A beat and bar grid** — every beat as a time, every downbeat marked, bars
   numbered from the first downbeat.
3. **An energy curve** — loudness and spectral density over time, smoothed to the
   bar, so a section's intensity is a number and not an adjective.
4. **A vocal activity map per voice** — for lead, each backing part, ad-libs and
   any featured voice: the intervals in which that voice is sounding, and the
   intervals in which no voice is.

The rule the map exists to enforce: **every shot is addressed as (section, bar,
beat), resolved to master time through the map — never as seconds read off a
waveform by eye.** A shot list written in seconds is a list of guesses, and every
guess is re-guessed in the edit.

## The grid is a list of beats, not a tempo

The tempting shortcut is to detect one tempo, find the first downbeat, and compute
every later beat by multiplication. It is exact only for a track rendered against a
fixed click. A track played by people drifts, a track with a ritardando or a
half-time bridge changes, and a computed grid that was right at bar one is a
quarter of a beat out by bar sixty, which at a cut on every downbeat is a visible
miss. Store the grid as the detected time of every beat, corrected by a person
where the detector stumbled, and derive tempo from it rather than the reverse.

Keep those times at **audio resolution** and quantise to frames only at the moment a
frame is rendered. A beat stored as a frame index has already been rounded by up to
half a frame, and a tempo read from single intervals between frame-rounded beats can
only take the few values the frame rate allows: at thirty frames per second, nothing
between roughly 113 and 129 beats per minute except 120. A grid built from that
number drifts by seconds over a song.

**Tempo is a set of candidates with octave siblings, never one number.** Detectors
routinely report double or half the tempo a listener would tap, and on some tracks
a third or triple; the evaluation practice of the field has for two decades
reported a second accuracy figure that forgives exactly those factors, because the
error is that common and that ambiguous even to people. So the map keeps the
candidates and records which metrical level the production uses, chosen by a
listener and written down. The choice is load-bearing downstream: "one cut per bar"
means something different at each level, and a grid at double tempo turns a
measured cut rate into a frantic one without anyone deciding it.

## Sections are a different analysis from onsets

Onsets and beats are local events. Section boundaries are where the music changes
character — a new harmony, a new texture, a new density — and they are found by
comparing stretches of the track with each other, not by looking for loud moments.
The established approach builds a self-similarity matrix over the whole track and
looks for points where the block structure changes; the kernel's size sets the
scale of change it detects, so a small kernel finds phrase-level changes and a
large one finds verse-to-chorus changes. Repetition is the third cue: a chorus is
recognisable as a chorus because it recurs.

Two consequences for the map. Do not derive section boundaries from the energy
curve, because a quiet chorus and a loud verse are both common and the curve will
call them the other way round. And snap every detected boundary to the nearest
downbeat, then have a listener confirm it, because a boundary half a beat early is
a cut half a beat early in every shot that hangs on it.

## The vocal activity map is the sync contract

The per-voice layer is what makes a performance video plannable. It answers, for
every interval, whose mouth may be moving — and, as importantly, when no mouth may.
It is drawn from isolated stems where the rights holder can supply them (the
cleanest source), from source separation of the mix where they cannot, and is
checked by ear at every boundary, because separation leaks and a breath or a
reverb tail reads as a voice to a threshold. It is the input
performer-stem-conditioning consumes: a sung shot's conditioning slice is cut from
the stem this map names, over the interval this map gives.

It also marks the unsafe regions before any money is spent: an instrumental intro
(no mouth), an ad-lib over the lead (two voices, one face on screen), a backing
line answering the lead (whose shot is it?), a held note across a section boundary
(a segment seam that must not fall inside it).

## The map is a typed input, and it owns the timing channel

Once the map exists, prose about timing elsewhere in the production — "the cut
lands on the drop", "she turns when the chorus hits" — is a second authority over
a channel that already has one. Write those intentions as map addresses (chorus 1,
bar 1, beat 1) so they resolve to times; a timing intention that cannot be written
as an address is one the production cannot verify and will not reliably honour.

## Decision rules

- When a shot is planned, address it in sections, bars and beats; when it is
  placed, resolve the address through the map. Never store a hand-typed second as
  the authority.
- When the detector's tempo and a listener's tap disagree by a factor of two or
  three, the listener chooses the level, and the choice is recorded with the map.
- When a track was not made against a fixed click, store detected beat times, not
  a tempo and an offset.
- When a section boundary comes from analysis, snap it to a downbeat and confirm it
  by ear before anything is addressed against it; an unconfirmed boundary is
  marked unconfirmed, not passed.
- When isolated stems exist, draw the vocal activity map from them; when they do
  not, separate, threshold, and audit every boundary by ear, and record which
  source the map came from.
- When any later stage needs a timing the map does not carry, add it to the map
  rather than computing it locally, so there is still one clock.

## When not to use it

A loop-based visualizer that reacts to the audio frame by frame needs the energy
layer and nothing else; drawing sections and a voice map for it is ceremony. A
video whose picture will not cut at all — one continuous take, one held image —
needs the duration and the master, not a grid. And a track that is still being
revised is not ready to be mapped: a map drawn against a mix that will change is
drawn twice, and the first one will be trusted by mistake.

## Sources

Tempo octave errors: the ISMIR 2004 tempo induction contest defined a first
accuracy figure (correct within 4%) and a second that also counts half, double,
three times and one third of the annotated tempo as correct
(mtg.upf.edu/ismir2004/contest/tempoContest/node7.html, fetched 2026-10-05).
Novelty-based segmentation on a self-similarity matrix with a checkerboard kernel:
Foote, "Automatic audio segmentation using a measure of audio novelty", ICME 2000,
as presented in Müller's Fundamentals of Music Processing notebooks
(audiolabs-erlangen.de, FMP C4S4, fetched 2026-10-05). The kernel-size-as-scale
point and the novelty / homogeneity / repetition triad of structure analysis are
training-data convergence on the music-information-retrieval literature, not
fetched. Per-beat grids over computed grids for human-played material is
practitioner convergence, not measured here.
