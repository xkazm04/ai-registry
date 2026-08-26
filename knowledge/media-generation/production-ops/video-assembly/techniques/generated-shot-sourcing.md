---
layer: technique
type: technique
subject: video-assembly
technique: generated-shot-sourcing
status: forged
laws: [cost-per-usable-output, refusal-is-a-state, style-is-restated-not-remembered]
shared_with: []
use_when: [briefing a generative video model to produce shots for a cut, deciding between text-only and image-anchored conditioning for a shot, accepting or rejecting generated clips into an assembly, handling clips that arrive with their own baked-in audio, a subject drifts steadily across a long sequence of generated shots]
---

# Generated-shot sourcing

Generated-shot sourcing is the craft of directing generative video models to
produce assembly material, and of accepting that material into the cut with
the same discipline as delivered footage. The models are real now — a cut
can be sourced shot by shot from generation — but a generated clip is not a
finished scene: it is a candidate that must clear the same bar as anything
else a block on the timeline claims to be. The technique's whole posture:
**generation is a sourcing channel, not an assembly shortcut.** Everything
downstream of acceptance — lanes, marks, spotting, drift — treats a
generated clip exactly like a shot one.

## The conditioning ladder

How much of the shot you pin down before asking is a decision, and it has
rungs, ordered by how much control they buy:

1. **Text only.** Cheapest to brief, least controlled. The model chooses
   composition, palette, motion, and identity. Acceptable for atmosphere and
   one-off illustrative shots; unacceptable wherever anything must match an
   adjacent shot.
2. **Single-image anchor.** A still conditions the first frame; the model
   invents the motion outward from it. Locks the head's composition and
   identity; the tail is still the model's guess, and identity degrades with
   distance from the anchor.
3. **Head-and-tail anchors.** Stills condition both the first and last
   frame; the model interpolates a motion path between them. The strongest
   structural defense against mid-clip identity drift, and the only rung
   that lets the *assembly* own where a shot ends — which matters, because
   the next shot's head can then anchor to this shot's tail.
4. **Reference-conditioned.** Identity and style references held across
   many requests, for recurring subjects. This is the style law applied to
   motion: references decay unless the full contract is restated per call.

Choose the lowest rung that satisfies the shot's contract. Every rung up
costs more preparation; every rung skipped is paid for later in rejected
takes.

## Clip caps are a structural constraint

Models emit seconds, not scenes — single-digit to low-double-digit seconds
per request, with multi-shot modes stitching a handful of connected shots at
best. A scene longer than the cap is a multi-request scene *by
construction*, and the seams between requests are edit points somebody must
choose. Choose them at brief time, on structural beats, with tail-to-head
anchoring across the seam — a seam left to land wherever the cap fell is a
cut nobody made. Budget duration the way spotting budgets cues: the brief
states the clip's length to the second, because the timeline slot it must
fill already exists.

## Adjacency anchoring does not scale to a chain

Conditioning a shot on its predecessor's tail is the right first move and it
has a ceiling that arrives sooner than it looks. The rung is defined by
adjacency: it fixes the seam between shot N-1 and shot N, and it is measured
against the shot next to it. Over a pair, that is the whole problem. Over
thirty shots it is not, because **each link's reference is a generation, not
the original.** Shot 20 is anchored to shot 19's rendering of the subject,
which was anchored to shot 18's, and whatever the model got slightly wrong at
each hop is faithfully preserved and built on at the next. Every seam passes
inspection; the sequence still ends somewhere else than it started. This is
the characteristic long-form failure and it is invisible to exactly the review
that adjacency anchoring is designed to satisfy — comparing neighbours, which
always match.

The systems built for multi-minute output answer it the same way, and the
answer is a second reference class rather than a better link:

> **Pin the origin, roll the recent.** Carry a bounded bank of accepted
> material forward, in which the earliest slots are permanently pinned and
> never evicted, and only the remainder is first-in-first-out. Identity is
> then held to where the sequence started as well as to where it currently
> is.

Two bounds make it work, and both are worth asserting rather than assuming:

- **The pinned portion is strictly smaller than the bank**, or nothing rolls
  and the sequence stops responding to what just happened. Continuity is not
  only a claim about the origin; a shot also has to follow the one before it.
- **The rolling portion is at least one full step wide**, or the window
  cannot advance — the new material has nowhere to land. A bank whose free
  space is smaller than one shot's contribution silently degrades into a
  fixed reference set.

One release aimed at roughly five minutes of continuous story implements this
at two independent levels: a shot-level bank of seven paired audio-video slots
of which the first three are pinned, and, in its interactive sibling, a
per-layer attention cache combining a persistent sink with recent history
under a validator that asserts both bounds above. Neither borrows from the
other; they are different mechanisms at different altitudes reaching the same
policy, which is the strongest argument available that the policy is about
long horizons rather than about either implementation.

Three consequences for the assembly:

- **Pinning promotes early shots into permanent evidence.** A drifted or
  merely mediocre opening shot does not wash out of a chain that pins it — it
  becomes the thing everything downstream is held to. The first few shots of a
  long sequence are therefore the most expensive review in the run, and only
  *accepted* material is ever pinned. This is the one place where generating
  the opening cheap and provisional is the wrong economy.
- **Which slots were pinned is provenance.** It belongs with the clip
  alongside the prompt, the rung and the anchors, for the same reason: a shot
  whose reference set is unknown cannot be re-briefed, only regenerated.
- **The bank is not a substitute for restating the contract.** It is the image
  half of conditioning at sequence scale, and the style and identity blocks
  still travel with every call. A bank plus a shortened prompt is the
  reference-only failure wearing a longer memory.

## An extension is briefed from the output, not the brief

Extension modes — continue this clip forward or backward — are anchoring at
its strongest: the model analyzes the accepted clip and holds its subjects
and space. What they expose is a prompt-side error the anchor cannot fix:
briefing the continuation from the original intent. The accepted clip has
*diverged* from its brief — that is what generation does — and a continuation
written against the brief re-asserts things that are not on screen, which the
model then has to reconcile. **The accepted clip is the authority on what
happened.** Before briefing an extension, have the prompt-writer analyze the
actual output — where each subject stands, what they are mid-way through,
where the frame ends — and write the continuation against that, with the
prior brief carried only as intent context. When the two conflict, the clip
wins; the alternative is a seam where a character snaps back to where the
brief thought they were.

## The anchor imports its maker's texture

A frame anchor conditions more than composition: the clip inherits the
anchor's *finish*. A still minted by an image model carries that model's
surface character — often a smoothed, over-clean quality that reads worse in
motion than at rest — and the motion model preserves it faithfully for the
whole clip. Two consequences:

- **When a frame anchor is needed, consider minting it from the motion model
  itself.** Brief a clip in which the subject holds still, pull the frame you
  like; the anchor now carries the texture the finished clip is supposed to
  have. The same move harvests coverage: a brief that asks the camera to cut
  to a new angle every second turns one clip into an angle library of a
  location or subject — cheap probe stills at the motion model's finish,
  priced per usable frame rather than per render.
- **When staging must stay free, prefer references over frame anchors.** A
  frame anchor locks the composition of the head; identity and style
  references condition *who and how* while leaving *where and when* to the
  brief, which is what permits in-clip cuts, reveals, and blocking the anchor
  never showed. The ladder's rungs are ordered by control, but control of the
  head is not free — it spends staging freedom and imports texture, and both
  costs belong in the rung decision.

## Baked-in audio is a mix decision a model made

Current models ship clips with native synchronized audio — dialogue,
effects, ambience. That sound is not free material; it is a mix decision
made outside the assembly, and the lane grammar does not bend for it.
Decide per clip, explicitly: keep it as an atmosphere lane, demote it under
the cut's own voice and music, or strip it. A generated clip's baked audio
never silently occupies the voice or music lane — the cut's narration and
score are authored against picture, not inherited from a generator's guess.

Those three options all presuppose that the baked audio is *separable* from
the picture and, increasingly, that its own layers are separable from each
other. Where a model generates speech, effects and score jointly as one
waveform, none of the three survives contact: demoting the music demotes the
dialogue with it, and stripping the track strips the performance. The mix
decision then has to be made before generation, in the shot brief — see
music-spotting-against-picture, which owns that decision and where it moves to.

## Acceptance and economics

- **A refusal or a failed render is a sourcing outcome**, handled exactly as
  spotting handles a refused cue: the slot reverts to an honest empty state,
  labeled with what was asked and what came back — never blind-retried,
  never papered over by widening a neighbor.
- **Price per usable second, not per rendered second.** Acceptance rate is
  part of the price: a cheap model that clears the brief one take in five is
  the expensive model. Track takes-to-accept per shot class and route
  future shots on that number.
- **Provenance travels with the clip.** The prompt, the conditioning rung,
  the anchors, the model class, and the date are part of the accepted
  material. A generated block whose brief is lost cannot be re-briefed —
  only regenerated, which voids every review the clip has passed.

## Decision rules

- When two adjacent shots share a subject, condition the second on the
  first's tail, because unanchored adjacency is where identity drift
  becomes a visible continuity error.
- When a shot must land on a structural beat at an exact duration, brief
  the duration as a hard constraint and anchor the end, because trimming a
  generated clip to fit discards the tail the model composed toward.
- When a model's take is close but wrong in one region, prefer the smallest
  re-brief (same anchors, amended purpose sentence) over a fresh unanchored
  request, because every unanchored request re-rolls everything that was
  already right.
- When per-shot routing across several models beats one house model, take
  it — the cut cares that the shots match each other, not that they share a
  vendor; matching is the style contract's job, restated per call.

## When not to use this

Material that exists should be used, not imitated: a generated
reconstruction of a scene you could shoot or license competes on cost only
until the first viewer asks whether it is real — in factual work,
checkability routes that choice, and record-of-event shots are not
generation candidates. And a cut still in structural flux should not be
sourcing final generated shots at all; generate rough, cheap, low-rung
takes as placeholders, marked provisional, and spend the anchored requests
only once the picture is locked enough that their durations will survive.
