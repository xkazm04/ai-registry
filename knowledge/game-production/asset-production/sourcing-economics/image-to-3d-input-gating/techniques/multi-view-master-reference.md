---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: multi-view-master-reference
status: forged
laws: [one-authority-per-quantity, a-verdict-is-bound-to-its-content]
use_when: [deciding how many views a reconstruction needs, assembling a view set for a character, a reconstruction is inventing the back of the subject wrongly]
---

# The multi-view master reference

## The concern

A single view is a projection, and a projection discards a dimension. Everything the camera
could not see, the reconstruction invents — plausibly, confidently, and differently on every
run. Extra views are the only intervention that adds *information* rather than constraining
the model's guessing; prompt effort, seed sweeps and parameter tuning all operate on
invention.

But views only help if they agree. Two images that show the same subject with different
proportions, different silhouettes or different detail placement are worse than one image
alone, because the reconstruction averages what it cannot reconcile and produces a subject
that matches neither. So the technique is not "add views" — it is **one master view, plus
views that are demonstrably consistent with it.**

## The master view

Exactly one image is the authority on the subject's identity, proportions and design. Every
other view is checked against it and, where they disagree, the master wins. Declare which one
it is; do not leave it to assembly order to decide implicitly.

The master is the frontal, canonical, isolated view — the one that would have been used alone
if there were no others. It carries the most information per pixel about the parts that
matter, and it is the one a human approved.

## How many views, and which

- **One (master only)** — acceptable for radially symmetric or simple props, and for anything
  that will only be seen at silhouette distance.
- **Two (front and back)** — the highest-return second view for a character. The back is what
  the model invents worst and what a player sees most in a third-person camera.
- **Three or four (adding profile and three-quarter)** — the practical ceiling for generated
  assets. Beyond four, added views mostly add contradiction: each extra image is another
  opportunity for the set to disagree, and the marginal information falls off sharply.
- **Dense coverage** belongs to capture-based reconstruction, which is a different pipeline
  with different acceptance rules.

Where genuine additional views do not exist, some reconstruction pipelines synthesise them
from the master before reconstructing. Treat synthesised views as what they are: elaborated
guesses derived from the master, not evidence. They may improve coverage; they can never
resolve a disagreement, because they inherit the master's ambiguities. Never gate a
synthesised view as if it were an independent observation.

## Gating a view set

A view set is judged **as a set**, and consistency is a criterion the single-image rubric does
not have.

1. Gate each view individually first, against the ordinary criteria. One failing view
   contaminates the set; drop it rather than averaging it in.
2. Check **scale and framing consistency**: the subject must occupy comparable proportions of
   the frame and be centred the same way. A back view shot closer than the front teaches the
   reconstruction that the subject is deeper than it is.
3. Check **feature correspondence**: silhouette height and width, limb lengths, the vertical
   position of major landmarks. Where two views disagree measurably, the set fails as a set —
   report the disagreement, do not pick a winner silently.
4. Check **lighting consistency**: a front view lit from the left and a back view lit from the
   right bake contradictory shading into one surface.
5. Check **detail agreement** on features present in more than one view: an asymmetry that
   exists in one view and not another is the most expensive kind of contradiction, because it
   surfaces as a defect in the mesh and reads as a modelling failure.

**If the set fails consistency, reconstruct from the master alone.** One coherent view beats
an incoherent set every time, and this is the decision people get backwards — having paid for
extra views, they use them.

## Binding the verdict to the set

A verdict on a view set speaks for exactly that set. Add a view, replace one, re-crop one, and
the previous pass is evidence about a set that no longer exists. Re-gate. This matters more
here than for single inputs precisely because sets get edited incrementally: someone swaps the
back view for a better one and the recorded pass silently transfers to a combination nobody
ever checked.

## When not to use this

- **Style and material references**, which are not views of the subject and must never be
  gated for consistency against it — that is what role tagging is for.
- **Photogrammetric capture**, where dozens of registered views are the point and consistency
  is enforced by the capture rig rather than by inspection.
- **Assets whose back is never seen** — a facade, a wall-mounted piece. Demanding a back view
  there is cost with no return, and the master-only path is correct.
