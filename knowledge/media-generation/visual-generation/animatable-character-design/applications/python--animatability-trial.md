---
layer: application
type: application
subject: animatable-character-design
technique: animatability-trial
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.10
use_when: [the animation route was fixed before the still existed, a decorative part of a non-human still crossed its gaze, a parametric rig is split offline from an owner's portrait, deciding which probe a fixed-route trial still owes]
---

# A villain's face on a route chosen in advance

Read on 2026-10-21 against the overlord tree at `7c513ef` (paths relative to
its root). Overlord runs a streamed villain, Malakor, an original arch-lich,
and gave him a face three days after the athena-portable trial recorded in
[process--animatability-trial](./process--animatability-trial.md). The
second case differs in kind from the first: the character is a performer,
not a product companion, and the route was decided **before** any still
existed. The face is a layer split cut offline by a Python tool from the
owner's 1024 px Leonardo portrait, driven in the browser by the same
parametric glow rig athena-portable shipped. The brief and the owner's
pick live in the project's local working notes under `.spark/`, which are
gitignored; the split, the spec and the checks are tracked. n = 1 still,
one route; not a population figure.

## The route came first, and the trial narrowed with it

- `.spark/Spark/avatar-prompts.md:13` "Malakor is driven by a 2D layer rig (Athena's route), not a neural face."
- `apps/stage/src/avatar/driver.ts:14` "There is no neural motion in v1"

The project's own research had flagged the neural route as untested for
this form, not refuted:

- `docs/research/04-voice-and-character-assets.md:594` "(UNVERIFIED; test before committing)"

It was never tested. The technique allows that: when the route is fixed and
narrow, the trial collapses to pass/fail on that one driver. Inheriting a
route from a prior trial on a similar form saved the detector and mesh
probes outright, and the brief shows what the fixed route bought: every slot
in it is phrased for the rig that would drive the still, and the shared
negative prompt bans the human default, rim light and a coloured ground in
one line (`.spark/Spark/avatar-prompts.md:10` "realistic human face, human skin, woman, man, portrait photo").
The palette came from the product's own tokens and the light was asked of
the being (`.spark/Spark/avatar-prompts.md:15` "so the stream can tint his glow live").

## The promised check, and the probe that ran

The prompt sheet promised a two-probe trial before commitment:

- `.spark/Spark/avatar-prompts.md:75` "I'll run a quick animatability check on them (layer split plus a few seconds of speech) before we commit."

What the record holds is the owner's pick first and the split second:

- `.spark/Spark/ideas/avatar.md:23` "portrait M8 chosen"
- `.spark/Spark/ideas/avatar.md:25` "rig in data/avatar/rig (19 layers, rest error 0.14/255)"
- `tools/rig/README.md:37-38` "M8 recomposes at mean 0.14 and p99 2.8"

The recomposition figure was printed by the split tool and is not re-run
here. It measures that the layers rebuild the still at rest. It does not
measure motion. On a fixed parametric route the speech probe splits into two
halves the project does test, in other places: the driver's pose signal
moves with the voice, and the real rig rather than the placeholder is the
one drawn.

- `apps/stage/src/avatar/driver.test.ts:62` "a viseme's opening is scaled by the level and a closure dips to shut"
- `crates/shadowrunr-daemon/src/record/watch.rs:31` "pub const FACE_MIN_SHARE: f64 = 0.95;"

The second half was earned by an incident. A recorded show captured the
placeholder face and the clips cut from it inherited it; nothing crashed and
a face was on screen, the same shape as the technique's "the look kept, the
speech dropped" failure one level up:

- `.claude/spark/config.md:72` "recorded the placeholder face, and the clips cut from it inherited it"

The recording's `av_sync` check reads audio onsets against the stage's
`played` times (`crates/shadowrunr-daemon/src/record/watch.rs:365` "are matched to the `played` times shifted into the file"),
so no check reads the jaw's pixels. On this route that is a gap only if
the rig binds no jaw; the `face` check gates the asset, and the driver
tests gate the signal. A neural route would leave no such decomposition.

## The named risk came true and cost an inpaint, not a regeneration

The M8 card's risk line:

- `.spark/Spark/avatar-prompts.md:71` "the monocle must not overlap the socket, or the gaze cannot animate."

In the generated still the ember monocle ring encircles the right socket's
light, which is the failure the card predicted. It did not stop the gaze
from animating, because both parts are **emitted light on a near-black
ground**. The split lifts the ring as an additive light layer and inpaints
under it, then keys the socket's own light out as a separate layer the rig
dims on blink:

- `characters/malakor/rig/m8.spec.json:14` — `monocle`: kind `pulse`, mode `light`, fill `inpaint`
- `characters/malakor/rig/m8.spec.json:24` — `eye_r`: kind `eye`, mode `light`, fill `key`
- `characters/malakor/rig/m8.spec.json:30` — `eye_r` blink `dim`

(The spec is JSON, so these anchors carry the values rather than a quote.)

Light over light composes by addition, so nothing had to be invented behind
the occluder except the dark bone the ring sat on. That is one case, and the
golden path's "nothing in front of the focal region" stays as written. It
is recorded as the condition worth testing next: whether an occluder that is
itself emitted light belongs to the repairs list rather than to the brief's
banned list.

## The animation note against the rig that shipped

The card said:

- `.spark/Spark/avatar-prompts.md:70` "the jaw hinges. The monocle ring glows on emphasis. The sockets dim. The brow ridge lifts slightly as a separate layer."

The rig the project documents carries three of the four as written and one
reshaped:

- `docs/guide/voice.md:473` "The lower jaw and teeth. It drops on open vowels."
- `docs/guide/voice.md:475` "Blinks dim it and the voice warms it."
- `docs/guide/voice.md:476` "The ember ring and its sparks, as light. It pulses slowly."

The brow lift did not ship: the brow ridge is drawn into the skull's bone,
and no layer was cut for it. The note named a moving part that the prompt
never asked to be separable, and the trial's split was the first place that
could have caught it. The monocle's "glows on emphasis" became a slow pulse
with a small voice gain.

## Deviations

As in the first case, the owner chose the art before any probe ran, so
beauty was decided first. Two for two now; the technique's ordering is the
standard, and both field cases ran the other way round. The speech half of
the promised check was never run on the still itself; it is covered at the
signal and asset levels only, and the live voiced runs that would have shown
the jaw on screen were invalidated by machine load
(`.spark/Spark/ideas/avatar.md`, wave 2). No running-cost column exists
because only one route was tried; the rig's cost on athena-portable's
hardware is the nearest figure, and it is not this project's.
