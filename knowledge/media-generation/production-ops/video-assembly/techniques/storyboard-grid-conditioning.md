---
layer: technique
type: technique
subject: video-assembly
technique: storyboard-grid-conditioning
status: forged
laws: [cost-per-usable-output, checkability-routes-the-pixel]
shared_with: []
use_when:
  - briefing a multi-shot generation whose shot order and compositions are already decided
  - a prose shot list keeps being reordered, merged, or partially ignored by the model
  - carrying a whole scene's plan into one generation call instead of per-shot requests
  - choosing panel count and layout for a storyboard image
---

# Storyboard grid conditioning

## The concern

A shot plan written in prose is a sequence the model may honor; a shot plan
drawn as pictures is a sequence it can *see*. The technique: render the
scene's plan as a **numbered grid of panels in one image** — each panel one
shot's composition, in order — attach it as a reference, and brief the
generation to follow the storyboard. The model reads composition, staging,
and order directly from the panels, and the prompt's beats then only have to
say what *happens*, keyed to the panels, rather than describe every frame
from nothing. Practitioners converge on this because it is the cheapest way
to move a whole scene's worth of visual decisions into a single generation:
one image carries what would otherwise be a dozen per-shot briefs.

## Building the grid

- **Number the panels, and put nothing else in writing on them.** The panel
  number is the key the prompt's beats reference. Any other text on the
  board — captions, arrows with labels, direction notes — is glyph material
  the generation will faithfully reproduce as watermark-like artifacts in
  the finished shots. Direction goes in the prompt; the panels carry only
  pictures.
- **Panel count follows beat density.** Around a dozen panels covers a
  scene's story beats; a dense passage of physical action wants more, a
  dialogue scene fewer. Past the model's legibility ceiling the panels
  shrink until their content stops surviving — a grid whose faces are ten
  pixels tall is conditioning on noise.
- **Mind the grid-maker's own register.** Multi-panel images are a distinct
  generation skill, and models differ on it sharply — many degrade in
  quality or consistency as panel count grows, and the grid-capable model
  may over-detail panels relative to the target style. The grid is a plan,
  not a look: pair it with the restated style block, and expect the motion
  model to unify small register differences between panels.
- **Draw on it when geography or path matters.** The grid composes with the
  schematic-and-annotation discipline: a route drawn across a panel, or a
  position marked in it, is an instruction the model follows more literally
  than any sentence about the same space.

## Prompting against the grid

Reference the board by its map role ("image 4 is the storyboard; follow its
panels in order"), then write the beats keyed to panels — with timecodes
when pacing must be exact, without when the model's own pacing is
acceptable. The storyboard carries *what each shot looks like*; the beats
carry *what happens and when*; the style block still travels in full,
because a plan is not a look.

## Boards chain, panels repair, and the count is a pacing contract

Three operations turn a single board into a production surface:

- **A sequence longer than one board is a chain of boards.** Generate board
  N+1 with board N attached as reference and a continue-from-here brief;
  the panels pick up where the last board ended, and two nine-panel boards
  carry an eighteen-shot story with one continuity seam instead of
  seventeen. The chain obeys the same rule as clip extension: the new board
  is briefed from what the previous board actually shows.
- **A wrong panel is repaired, not a wrong board.** Redraw the one panel
  with everything else held — and re-state the subject's identity in the
  repair prompt, because a panel redrawn without it matches the note and
  loses the face. This is the edit-plan discipline at board scale: the
  reviewed panels are capital, and a full re-roll spends them to fix one.
- **The panel count is a claim on the clip's duration.** A generation that
  runs out of time mid-board simply never reaches the last panels — the
  ending silently vanishes. When panels are dense relative to the clip cap,
  the brief says so: pace to cover every panel and land on the final one.
  A board the clip cannot finish is a pacing defect, and it is fixed in the
  brief or by splitting the board, never by hoping.

## Decision rules

- When shot order and composition are decided, condition on a grid rather
  than trusting prose to hold a sequence — order is what prose loses first.
- When a generation ignores or merges panels, cut the panel count before
  rewriting the prompt: the usual cause is illegibility, not disobedience.
- When a board arrives with text baked into panels, regenerate or crop it
  out before conditioning — the cost of a re-render is less than glyph
  artifacts across every downstream shot.
- When only one or two shots are in play, brief them directly; a grid earns
  its overhead at scene scale, not shot scale.

## When not to use it

A scene still being explored has no plan to draw: grid conditioning is for
executing decided direction, and boarding an undecided scene just launders
improvisation through a more expensive artifact. And where an exact start
frame already exists for each shot, per-shot frame anchoring is the
stronger instrument — the grid trades per-shot precision for whole-scene
scope, and taking that trade when precision was available is paying for the
wrong thing.
