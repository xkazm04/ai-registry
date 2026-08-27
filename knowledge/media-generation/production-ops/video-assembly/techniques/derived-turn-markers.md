---
layer: technique
type: technique
subject: video-assembly
technique: derived-turn-markers
status: forged
laws: [causality-over-sequence, unmeasured-is-not-pass]
shared_with: []
use_when: [placing structural markers on a timeline, wiring act turns or chapter points into an assembly surface, diagnosing a marker that stopped matching the cut]
---

# Derived turn markers

A structural marker — the act-two turn, a chapter start, the reveal — is a
claim that *something in the material* happens at that time. The technique:
**compute the marker's position from the material that makes the claim
true, never store it as a number somebody once read off.** A turn marker at
"13 s" is correct only while the scenes before the turn still sum to 13;
the literal constant and the derived position agree today by coincidence
and diverge on the first retime.

## Why a typed marker is worse than none

A marker carries authority: spotting sessions place cues on it, reviewers
judge pacing against it, retimes are negotiated around it. A stale marker
therefore doesn't just misinform — it actively routes work to the wrong
second of the cut (a cue briefed to enter "at the turn" enters mid-scene;
a pacing note about the first act is measured against a boundary that
moved). And staleness is invisible: a typed `13` looks exactly as
trustworthy the day it rots as the day it was right. This is the unmeasured
-is-not-pass law in timeline form — a marker whose position nothing
computes is an impression wearing a number.

## The derivation pattern

1. **Name the semantic source.** The turn is not "second 13"; it is *the
   scene that is the reversal*. That identity must live somewhere queryable
   in the material — a role or mood field on the scene, a beat type from
   the script — and the field carries a note that it is load-bearing, so an
   upstream edit doesn't casually rename it.
2. **Compute position from the current material.** The marker's time is a
   fold over the data: the sum of the durations of everything before the
   identified element. Lengthen an earlier scene and the mark moves with
   it, automatically, with no second site to update.
3. **Absence is a result, not an error.** A cut whose material contains no
   element matching the semantic test draws **no marker**. Rendering a
   marker at zero, or at a fallback guess, converts "this cut has no turn"
   into a false claim about second zero. Absence and zero are different
   facts; keep them different.
4. **One derivation, all consumers.** The ruler mark, the cue that enters
   at the turn, the summary sentence that mentions it — all read the same
   derived value. The failure mode being prevented is precisely multiple
   copies of a structural fact aging at different rates.

## The voice-led cut derives from the timed transcript

For narrated and dialogue-led work, the semantic source with the highest
yield is the **word-timed transcript**: every word of the voice lane with
its start and end. It is cheap to produce (speech recognition emits it;
subtitle formats carry it), and once it exists it is the queryable form of
the material the voice lane's structure lives in — so a whole family of
positions derive from it rather than being typed:

- **Captions and word-synced emphasis** read their windows straight off the
  word timings; a caption placed by hand against speech is the typed-marker
  defect at its smallest grain.
- **Overlay entrances** anchor to the phrase they annotate — the stat card
  fires when its figure is spoken, wherever that moment now is.
- **Cut points respect speech units.** A cut that lands mid-sentence is
  computable from the transcript before anyone watches it; boundaries
  belong at phrase edges and rhetorical pivots, and the transcript is where
  those live as data.
- **Selection is a transcript operation.** Finding the strongest minute of
  an hour — the highlight reel, the cold-open hook — is reading text with
  timings attached, and the chosen spans carry their own in and out points
  back to the timeline.

Practitioners converge on this from independent directions (an overlay
compiler transcribing word-by-word before it places anything; an editor
exporting timed subtitles as the handoff to a design tool; an assistant
doing highlight selection over the editor's own transcript), because it is
the same fact each time: the voice lane wins collisions, so the voice
lane's timing is the reference frame everything else derives from.

## The coincidence trap

The insidious version of the defect is the constant that is *currently
correct*. It passes every visual check — the mark sits exactly where the
turn is — so no review catches it; only reading the code (or retiming a
scene) reveals that the agreement was coincidence, not connection. Audit
for it directly: for each marker on the surface, ask "what expression moves
this when the material changes?" A marker with no such expression is typed,
however correct it looks today.

## Decision rules

- When the semantic anchor is fuzzy (which scene *is* the turn?), fix that
  in the material by labeling the element, not in the marker code by
  hardcoding an index — the label is reviewable by the person who owns the
  story; the index is not.
- When two candidate elements match the semantic test, treat it as a
  material defect and surface it; silently taking the first match hides a
  story problem (two turns, or a mislabeled scene) behind a plausible mark.
- When a marker must be placed where no material feature exists (a
  platform-mandated midpoint, a sponsor slot), derive it from the clock
  (a fraction of total duration) rather than typing an absolute — it still
  moves when the cut is retimed.
- When a derived marker moves unexpectedly, investigate the material edit
  that moved it before "fixing" the marker — the motion is the feature
  doing its job of reporting an upstream change.

## When not to use this

A genuinely editorial pin — "I want the drop *here*, regardless of what the
scenes do" — is an authored decision, not a derived fact, and forcing a
derivation onto it inverts authority: the human chose the time, and the
material should be conformed to it, not the pin to the material. Store it
as what it is (an authored constraint with an owner and a reason), so the
next reader can tell a decision from a measurement — the technique's real
subject is keeping those two categories from wearing the same clothes.
