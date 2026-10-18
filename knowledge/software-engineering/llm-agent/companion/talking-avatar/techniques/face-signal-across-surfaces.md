---
layer: technique
type: technique
subject: talking-avatar
technique: face-signal-across-surfaces
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value, creation-names-reaper]
shared_with: []
use_when: [a companion's face appears on more than one window or surface, a face's mouth shuts before the voice has finished, two surfaces show the same face doing different things, a face renderer threatens a window's first paint or idle cost]
---

# Face signal across surfaces

## The concern

A companion's face rarely lives in one place. Its own window draws it, a main
window shows it in a corner, a settings page previews it. Each of those surfaces
can see the voice events, and each can be tempted to compute its own face from
them. Then two faces disagree — one still speaking, one at rest; one mouth on a
closure, the other open — and the companion looks like two recordings. The cure
is the same as for any shared vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
one producer, one small signal, and every other surface a mirror.

## One producer, on the audio clock

The face signal is produced in exactly one place: **the one that owns the audio
clock** — the surface whose player knows which sample is sounding now. Per frame
it reduces the voice phase, the playback level, the mouth shape at the playing
sample (read a few tens of milliseconds ahead, because a face leads its sound),
the mouth opening and the learned motion at that instant to one small signal.
Its own surface draws from it directly, every frame. A preview played somewhere
else (a voice picker sampling a voice) is a different face with its own player,
and drives itself from that player; it is not the companion.

## The mirror

Every other surface receives the signal through the host's message channel:

- **at a capped rate** while the face is moving, matched to the rate the host
  already spends on the companion's other ambient signals, so the face does not
  open a second, faster channel;
- **immediately on a phase change,** whatever the cap, because a mirror that
  says "speaking" a frame after the owner said "idle" is the visible
  disagreement this exists to prevent;
- **never the same signal twice,** and once per change at rest, with no loop;
- **validated at the boundary** exactly as the host validates its other ambient
  signals: an unknown phase or mouth shape is refused, every number is clamped
  into its range;
- **with the last signal handed to a new subscriber,** so a face that appears
  mid-sentence does not show a rest frame until the next message.

A surface that is hidden still mirrors: the owner's frame clock pauses while its
window is hidden, so a timer stands in for it there and the visible surface keeps
seeing the companion speak.

## Speaking lasts until the audio has

Voice pipelines synthesise ahead of playback, and a pipeline's "stopped" or
"done" event means synthesis is finished, not that the person has heard the
last word. When the audio is not paced at the source, that event can arrive
seconds before the end of playback. The face's phase is therefore **speaking
until the player has played the line's last sample**, and the line's mouth
timeline is kept until then and forgotten after. A mouth that shuts while the
voice goes on reads as a recording; the player's clock, not the pipeline's
event, is the authority. An interrupted line is the opposite case: it is
dropped at once, and late events for it are ignored.

## Absent channels stay absent across the wire

The mirrored signal carries learned motion as "no say" when the source does not
model a channel — a null, not a resting value — and every hop keeps it that way
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A track
that does not model lids, mirrored with a lid value of zero, turns into a face
that holds its eyes open and stops blinking for as long as the track plays.

## Out of the first paint, and still at rest

- **The surface that does not draw the face does not load its code.** The
  store that receives the voice events feeds the face timeline through a sink
  that only the drawing surface installs; a store with no sink drops face
  events. A static import of the timeline into a store that every window loads
  puts the face into every window's first paint. The renderer itself is a lazy
  chunk: in a first paint the face is an empty box and a dynamic import.
- **A face at rest asks for no frames.** Every face in a window draws from the
  window's one frame clock; it stops when it has settled, when its canvas is out
  of view and while its document is hidden, and any new signal wakes it. What
  "settled" costs the presence is a trade-off owned by
  [procedural-presence-motion](./procedural-presence-motion.md). The producer's
  loop is reaped when its window stops it, and it removes its sink on the way out
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
- **No face where it cannot draw.** Without the graphics capability the face
  needs, or with a form that fails to load, it draws nothing, says why once, and
  the surface shows what it showed before the face existed.

## Decision rules

- **When a second surface needs the face,** subscribe it to the mirror; never
  give it its own reduction of the voice events.
- **When the face and the voice disagree at the end of a line,** move the
  authority to the player's position, not to a delay tuned on one machine.
- **When a bundle ratchet is near its ceiling,** look for face code reachable
  from a store every window loads before cutting anything else.

## When not to use this

When the face appears on exactly one surface and nothing previews it, the mirror
is overhead; the rules on the player's clock, absent channels and first paint
still apply.
