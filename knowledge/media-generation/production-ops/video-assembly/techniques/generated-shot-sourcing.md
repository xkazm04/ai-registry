---
layer: technique
type: technique
subject: video-assembly
technique: generated-shot-sourcing
status: forged
laws: [cost-per-usable-output, refusal-is-a-state, style-is-restated-not-remembered]
shared_with: []
use_when: [briefing a generative video model to produce shots for a cut, deciding between text-only and image-anchored conditioning for a shot, accepting or rejecting generated clips into an assembly, handling clips that arrive with their own baked-in audio, a subject drifts steadily across a long sequence of generated shots, planning a scene that will be built by chaining extensions, a pipeline's derived durations must survive a model's fixed generation steps, animating a designed graphic whose artwork must stay exact across the shot, a walk or other cyclic movement comes back stiff from an anchored generation]
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

One construction rule on rung 3 that practitioners learn as a mid-clip
glitch: **the two anchors must be cut from one cloth.** Head and tail
frames generated as separate requests disagree about everything the prompt
did not pin — the set dressing shifts, the light moves — and the model,
interpolating between two worlds that never matched, breaks visibly in the
middle of the move. Generate both anchors in a single image instead: one
request, two panels, the same scene with only the camera changed, then
split the panels into start and end frames. Shared provenance is what
leaves the model nothing to reconcile, and it costs one still instead of
two.

### Rung 3 over an exact graphic: the anchors are a diff, not a pair

The paired-panel rule is written for a photographed world, where the two
anchors differ by a camera and the model's job is to move between two views
of one scene. A designed graphic — a map, a chart, a board, a diagram — breaks
that assumption, because its identity is *exact* rather than approximate.
Asked to animate one, a motion model re-synthesises the artwork every frame,
and the coastline, the axis labels and the pinned photograph all quietly
become different coastlines, labels and photographs. This is not the drift the
rung was built to resist; it is destruction, and no adherence setting reaches
it, because the model was never holding the graphic in the first place — it
was redrawing it.

So the instruction is never "animate the graphic". The anchors are authored as
**two stills identical everywhere except the one element that changes**, and
the motion request is left with nothing to invent:

1. **Mint the base state** — the graphic with the changing element absent. The
   clean map, the empty board, the unplotted axes.
2. **Mint each later state from the state before it as a reference**, with a
   prompt that names the single addition and instructs that nothing else
   change. The chain matters: state 3 derived from state 1 disagrees with
   state 2 about everything the prompt did not pin, which is the paired-panel
   failure arriving through a different door.
3. **Hand the states to the motion model in order.** Two states are a
   head-and-tail request and the interpolation is the animation — the route
   draws itself across a map the model had no reason to touch. Three or more
   fall off that mechanism entirely, because head-and-tail takes exactly two
   frames; those go as ordered references with a brief that walks the build.

Two things this buys that a motion prompt cannot. The animation is *correct by
construction* rather than by luck, since the only thing that can move is the
thing that differs. And the graphic's exactness survives, which is the whole
requirement — a chart that redraws itself mid-shot is not a rougher chart, it
is a different claim.

The cost is that each state is a generation conditioned on the last, so the
chain drifts the way any chain does: expect small tonal or texture shifts
between distant states, gate the last state against the first, and keep chains
short. Where the graphic's exactness is load-bearing for a factual claim, this
rung is the floor and not the ceiling — a graphic that must be *right* is
composited from a deterministic render, not sampled.

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

Dialogue makes the cap bind sooner than it looks, because **a spoken line is
a duration claim**: the words take the seconds they take at a natural pace,
and a model handed more dialogue than the clip can hold does not refuse — it
compresses, and the cast rushes through lines with no room for reactions,
close-ups, or air. Budget dialogue the way duration is budgeted: count the
seconds the lines need at performance pace, and when a dialogue-heavy beat
exceeds them, split it across shots at brief time — the exchange in one, the
reaction in the next — rather than letting the cap squeeze the delivery.

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


## The extension channel has bounds of its own

An extension reads the accepted clip, but it does not read all of it. The
conditioning is a **window off the tail** — a bounded span of the immediately
preceding material — and everything earlier is as invisible to the
continuation as it would be to a fresh request. Two numbers define the
channel and both belong to the platform rather than the pipeline: how deep
the window reaches, and how far a chain of extensions may run in total.

Neither is stable. One platform's window moved from the final second to the
final ten in a single release — an order of magnitude, on a parameter no
caller sets and most briefs never mention. A sequence that reads as one
continuous scene on the new version reads as a series of restarts on the
old, with no change to the prompt, the anchors, or the code. The window is
therefore a **versioned fact that belongs in the vendor ledger** beside the
rate card, looked up per model version rather than inferred from how the
last one behaved.

Three consequences follow, and together they are why this is a channel with
a budget rather than an escape from the clip cap:

- **What has scrolled out of the window must be re-supplied, not trusted.**
  Identity, palette and set dressing established in a clip's opening sit
  outside the conditioning of an extension taken late in the chain. They come
  back as explicit references and a restated contract, exactly as they would
  for an unanchored shot. This is the drift that defeats adjacency anchoring
  over a chain, arriving one level down and taking the same answer: pin the
  origin as a reference and let the window do the rolling.
- **The chain has a ceiling, and reaching it is a structural event.**
  Extension is capped cumulatively, not only per call, so a scene longer than
  the total is still a multi-request scene by construction. What extension
  buys is not an unbounded shot; it is a *larger unit to place the seam
  between*. Choose that seam on a structural beat, exactly as the clip cap
  already demands — a chain run until the platform refuses has let the
  ceiling choose the cut.
- **The increments are quantized, and authored durations are not.**
  Extensions arrive in fixed steps. A pipeline whose durations are derived —
  a beat gap, a narration span, a music cue — will ask for lengths the step
  size cannot express, and the difference is paid at the timeline in a trim,
  which discards the tail the model composed toward. Where duration is
  load-bearing, brief a shot at that duration rather than extending toward it.

The honest summary for a brief: **extension is a budget denominated in the
platform's units.** Ask what the window is, what the ceiling is, and what the
step is, before designing a scene that assumes any of the three.
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
- **An anchor can also over-pin the motion, and cyclic movement is where it
  shows.** A frame is one phase of whatever is moving, and where the movement
  is a *cycle* — a gait, a swing, a stroke, a wingbeat — the anchor fixes not
  only how the limbs look but where in the cycle they are. Pin every member of
  a symmetric pair at once and there is no phase left to infer: the model has
  been told both arms are here, at this instant, and what comes back is a
  stiff figure translating rather than walking. Pin *one* member, mid-stroke,
  and leave its counterpart out of frame or unresolved; the model reconstructs
  the opposition, which is the part it is good at. The general form is the
  rung's own logic taken one step: an anchor should carry the pose the shot
  opens on, not the mechanism the shot depends on continuing.
- **The import is also the lever.** Because the clip inherits the anchor's
  finish, anything baked into the anchor rides into the motion for free —
  which makes the anchor the right place to bind the look. Grading the
  reference stills *before* animation carries the contrast, the palette, and
  the lighting into every clip generated from them, far more reliably than
  describing the same grade in the motion prompt; the prompt asks, the anchor
  simply *is*. One pass over a handful of stills grades a whole scene's worth
  of clips, at still prices.

## The moving reference

A clip can condition a generation the way a still does, and the channel has
two distinct uses that want opposite handling:

- **Continuity carry.** Extending a scene from a *span of moving picture*
  rather than a single tail frame — a span bounded by the platform's window,
  never the whole clip. A frame anchor carries geometry and identity
  and resets everything else — the pacing, the built tension, the mood
  arrive at zero, which is why frame-chained scenes read as a series of
  restarts. A span carries what the frame cannot: how the scene was
  moving when it ended. Where the platform accepts a video reference for
  continuation, it dominates tail-frame anchoring for mood-bearing scenes,
  and it composes with the rule that the *brief* for the continuation is
  still written from an analysis of that same output.
- **Choreography transfer.** An external clip — staged, licensed, or
  sourced — as the movement model for a shot: the fight's blocking, the
  camera's path, the pacing of a chase. This is the moving reference at its
  most powerful and most dangerous, because an unscoped clip conditions
  *everything* it shows — its style, its cast, its color — into the shot.
  The reference map's negative scope is mandatory here, not optional: the
  clip "controls choreography, blocking, pacing and camera, never identity,
  style, or setting." Scoped, it moves a whole fight's worth of direction in
  one attachment; unscoped, it is a restyle nobody ordered.

Both uses obey one mechanical rule: **trim the reference to exactly the
span you mean.** A clip reference is read whole, and every second beyond
the intended material is unscoped instruction — the cheapest edit in the
pipeline is cutting the reference before it conditions anything.

The trim is usually also compulsory, which is easy to miss while treating it
as an economy. Platforms cap the moving reference hard — a few seconds per
clip, a small number of clips per request — and the caps are tight enough
that a reference is a *sample* of the material, not the material. Two things
follow. An unstated span is chosen by the platform rather than by the
director, and a span nobody chose is not a scoped reference however carefully
its negative scope was written. And choreography transfer in particular has
to be cut to the beat that carries the movement, because the seconds that
survive the cap are the whole instruction — a reference trimmed by the
platform's default is conditioning on whichever seconds happened to be first.

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
