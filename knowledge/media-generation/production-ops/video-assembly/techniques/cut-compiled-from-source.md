---
layer: technique
type: technique
subject: video-assembly
technique: cut-compiled-from-source
status: forged
laws: [edit-do-not-regenerate, checkability-routes-the-pixel, unmeasured-is-not-pass]
shared_with: []
use_when:
  - building or choosing the authoring form for an edit's overlay and assembly layer
  - an edit must be reproducible, restyled wholesale, or applied as a standing template to new footage
  - reviewing a cut for defects that are relations between elements rather than pixels
  - deciding what a machine edit-assistant should emit
---

# Cut compiled from source

The timeline-as-document doctrine says the cut must be literal; this
technique says the strongest way to make it literal is to make it
**source**: the edit authored as a declarative composition — every caption,
overlay, cut point and card a structured element with timing data — and the
watchable video *compiled* from that document. The render is then
disposable by construction; the composition is the artifact, and everything
this subject wants from a cut falls out of that inversion rather than
having to be enforced against it.

The seam-management discipline already carries the parent rule as its
escape clause: when a medium renders from a symbolic source of truth, edit
the source and re-render the whole — the seams are the renderer's problem.
This technique is that clause promoted to an authoring decision. For the
assembly layer of a generated or narrated video, a symbolic source can
simply be *chosen*, and choosing it dissolves a whole class of problems
other techniques exist to mitigate.

## What compiling buys

- **Edits are source edits.** A change names an element and a property;
  everything unnamed is provably untouched, because it is the same data. The
  edit-plan contract ("beats not named must be byte-identical") stops being
  a discipline to audit and becomes a property of the representation.
- **Style is scoped the way the style block always wanted.** "Render the
  captions in a second style, everything else identical" is a one-line
  change to shared styling, exactly the default-with-scoped-override
  semantics the visual style contract runs on — and swapping a whole
  caption register costs a recompile, not a rebuild.
- **The edit style is a reusable contract.** A composition minus its
  content is a template: the same styling and layout grammar applied to
  every new piece of footage, mechanically, which is what turns one
  approved edit into a house edit style. This is style locking at the edit
  layer — approve once, restate per video.
- **Iterations are versions.** Each compile is a file with a lineage;
  A/B-ing two caption treatments is diffing two documents, and returning to
  yesterday's cut is opening it.

## The critique pass reads, it does not watch

The deepest payoff is epistemic. A cut that exists as pixels can only be
reviewed by watching; a cut that exists as source can be **read**, and the
defect classes that matter most in an assembly are *relations between
elements* that reading catches exactly:

- two overlay elements whose active windows collide — a stat card firing
  while a caption still holds the same region;
- a cut or element boundary landing inside a speech unit — the B-roll
  return arriving mid-sentence instead of at the rhetorical pivot;
- an element whose window extends past the material it annotates.

A reviewer — human or machine — handed the composition checks these as
interval arithmetic, not as impressions. A machine critique pass over the
source produces notes with the shape of a senior editor's ("the card waits
for the caption to clear; the cutback lands on the pivot"), and just as
importantly can **defend non-changes** with stated reasons, which makes its
review a document rather than a diff. Taste still needs eyes on the
render; collisions and placements do not, and separating the two is this
subject's unmeasured-is-not-pass applied to the edit itself.

## Decision rules

- When the assembly layer is being built for generated or narrated video,
  author it as a composition and compile — retrofitting reproducibility
  onto a pixel-first edit is the expensive direction.
- When a machine assistant edits, have it emit composition changes, never
  rendered video — an assistant that returns pixels has regenerated, with
  everything that voids.
- When a defect is a relation between elements, fix and re-check it in the
  source — spending a render to re-watch what an interval comparison
  settles is paying pixel prices for arithmetic.
- When the same treatment will serve future footage, extract the template
  then, while the decisions are fresh — a style reverse-engineered from a
  finished render is a style guessed twice.

## When not to use it

The footage *inside* the clips is not source and does not become source by
being referenced from one — pixel-land keeps its own rules (seams,
anchoring, acceptance), and the composition governs only the layer above
it. Complex simulated motion — genuinely physical 3D moves — outruns what
a declarative overlay layer expresses, and forcing it in produces timing a
human then fights; that work belongs in a motion tool, entering the
composition as footage. And a one-off social clip with three captions does
not need a compiler; the technique earns its structure where edits recur,
restyle, or must survive review.
