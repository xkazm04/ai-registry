---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: contact-window-travels-with-the-clip
status: forged
laws: [a-number-carries-its-unit-and-basis, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [an attack's animation came from extracted motion and needs its active frames, an authored hit event and the visible strike disagree, handing extracted motion to the team that wires combat]
---

# Contact window travels with the clip

An attack has a moment where it can hurt. In a hand-authored pipeline an animator places
an event on the clip where the blade meets the target, by eye. When the motion came out of a
clip, that moment is already in the motion, and placing an event by eye on top of it creates
a second answer to a question the motion has answered. The two will disagree, and nothing
will notice, because each is consistent with itself.

So the extraction **measures** the contact window and emits it with the clip, as data. What
the game then does with it (whether it is widened for fairness, how often a hit can land, what
a parry may catch) is decided downstream by combat design. This technique stops at the
number.

## The measurement

Choose the contact point: the weapon's striking end, the foot of a kick, the fist. Compute its
speed along the direction of its target, frame by frame. The window is the run of frames
around the peak where that speed is at least half its peak. Half of peak is a convention,
not a law. It finds the fast, committed part of the swing and excludes the windup and the
settle. Any team may choose a different fraction, as long as the fraction travels with the
window.

The window is stated in the clip's **native frames**, with the native frame rate, the contact
point used, the definition, and the identity of the clip it was read from. Seconds are derived
from those, never stored alone. Resampling a clip to another frame rate moves frame indices and
rounds the window; a window in milliseconds with no basis cannot be checked against the clip it
came from.

Measured on one locally run video model, on the seed that passed the panel sync gate: frames
13 to 15 at 24 frames per second, about 125 ms, with the top of the silhouette (the sword tip)
as the contact point and downward speed as the direction. At 24 frames per second one frame is
about 42 ms, so that window is known to within a third of its own length. That is one clip,
and it shows what the measurement produces. It is not a typical window for any action class.

## Read only after the gates pass

On a two-view clip, read the window only after the panel sync gate has passed. On the seed that
failed it (best lag four frames), the same reading came out at frames 30 to 37, three times
wider. That is not a noisy window: it is the average of two strikes that happened at different
times in the two panels. A window read from a desynced clip is wrong, not imprecise.

On a single-view clip, read it only if the contact point is visible across the window. A point
hidden by an effect or by the body at the contact frame has no measured speed there, and the
window across that gap is unmeasured.

## Decision rules

- **When the extraction passed its gates, emit the window; do not leave it to be authored.** The
  downstream team receives the measured window as the default and changes it on purpose if it
  changes it at all.
- **When gameplay widens or narrows the window, record that as a design choice beside the
  measured one.** Two numbers with two bases: what the motion did, and what the game decided.
  Neither silently replaces the other.
- **When the window is shorter than two frames at the native rate, report its resolution with it.**
  A one-frame window is as much a statement about the frame rate as about the strike.
- **When the clip changes (a re-roll, a re-solve, a different retarget), the window is re-read.**
  It was measured on one clip and speaks for that clip only.
- **When the contact point cannot be tracked through the window, emit no window.** Report it as not
  measured. A default from the action class filled in to complete the record becomes a fabricated
  measurement the moment anyone reads it.

## Procedure

1. Confirm the clip passed its gates: trackability for a single view, panel sync for two views.
2. Choose the contact point and the target direction for the action class, and write both down.
3. Compute the point's speed toward the target per native frame. Find the peak and the run of
   frames above the chosen fraction of it.
4. Emit the window as start frame, end frame, native rate, contact point, fraction, and the clip's
   fingerprint, alongside the extracted motion.
5. If the motion is retargeted or resampled, carry the window through the same time mapping and
   re-check that its frames still hold the peak.

## When not to use it

- **For actions with no single contact moment.** A sustained beam, a grab that holds, a channelled
  spell. Their activity is a state, not a window read from speed.
- **For damage over an area or over time.** Their timing is authored for readability and fairness,
  not taken from the body.
- **As the hit test.** The window says when contact is plausible. Whether a target is hit inside it is
  the combat system's test, run inside whatever window it finally adopts.
